/**
 * AdvancedSearchEngine — Multi-strategy search with step-by-step thinking.
 *
 * Combines keyword search, semantic similarity, fuzzy matching, graph traversal,
 * query expansion, and chain-of-thought reasoning into a single unified search
 * pipeline. Every search produces transparent "thinking steps" so the user (or
 * LocalBrain) can inspect how results were found and ranked.
 *
 * Strategies:
 *  1. Exact keyword match
 *  2. Fuzzy / Levenshtein match
 *  3. Synonym expansion
 *  4. Semantic similarity (TF-IDF cosine)
 *  5. Graph-based spreading activation
 *  6. Query decomposition (multi-part questions)
 *  7. Contextual re-ranking (conversation history)
 *  8. Cross-domain transfer (find knowledge in related domains)
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type SearchStrategy =
  | 'keyword'
  | 'fuzzy'
  | 'synonym'
  | 'semantic'
  | 'graph'
  | 'decomposition'
  | 'contextual'
  | 'cross-domain'

export interface ThinkingStep {
  /** Sequential step number starting at 1 */
  step: number
  /** Which strategy produced this step */
  strategy: SearchStrategy | 'meta'
  /** Human-readable description of what the engine is doing */
  thought: string
  /** Compact detail string (e.g. matched keywords, scores) */
  detail: string
  /** Wall-clock milliseconds spent on this step */
  durationMs: number
}

export interface SearchResultItem {
  /** Unique identifier for the matched document / concept */
  id: string
  /** Title or name of the matched item */
  title: string
  /** The content / body text of the result */
  content: string
  /** Composite relevance score in [0, 1] */
  score: number
  /** Which strategies contributed to this result */
  matchedBy: SearchStrategy[]
  /** Individual strategy scores for transparency */
  strategyScores: Partial<Record<SearchStrategy, number>>
  /** Matched keywords / terms from the query */
  matchedTerms: string[]
  /** Optional domain/category of the result */
  domain?: string
}

export interface SearchWithThinkingResult {
  /** The original user query */
  query: string
  /** Ordered list of ranked results (best first) */
  results: SearchResultItem[]
  /** Transparent chain-of-thought steps taken during search */
  thinkingSteps: ThinkingStep[]
  /** Total wall-clock duration */
  totalDurationMs: number
  /** Which strategies were actually used */
  strategiesUsed: SearchStrategy[]
  /** Overall confidence in the result set [0, 1] */
  confidence: number
  /** Expanded / reformulated query (if changed) */
  expandedQuery: string
  /** Number of candidate documents scanned */
  candidatesScanned: number
}

export interface SearchDocument {
  id: string
  title: string
  content: string
  keywords: string[]
  domain?: string
  weight?: number
}

export interface SearchConfig {
  /** Maximum results to return (default 10) */
  maxResults: number
  /** Minimum score threshold to include a result [0,1] (default 0.05) */
  minScore: number
  /** Enable fuzzy matching (default true) */
  enableFuzzy: boolean
  /** Enable synonym expansion (default true) */
  enableSynonyms: boolean
  /** Enable semantic / TF-IDF similarity (default true) */
  enableSemantic: boolean
  /** Enable graph-based spreading activation (default true) */
  enableGraph: boolean
  /** Enable query decomposition for complex queries (default true) */
  enableDecomposition: boolean
  /** Enable contextual re-ranking using conversation history (default true) */
  enableContextual: boolean
  /** Enable cross-domain search (default true) */
  enableCrossDomain: boolean
  /** Maximum Levenshtein distance for fuzzy match (default 2) */
  maxFuzzyDistance: number
  /** Weight multiplier for each strategy */
  strategyWeights: Partial<Record<SearchStrategy, number>>
}

const DEFAULT_CONFIG: SearchConfig = {
  maxResults: 10,
  minScore: 0.05,
  enableFuzzy: true,
  enableSynonyms: true,
  enableSemantic: true,
  enableGraph: true,
  enableDecomposition: true,
  enableContextual: true,
  enableCrossDomain: true,
  maxFuzzyDistance: 2,
  strategyWeights: {
    keyword: 1.0,
    fuzzy: 0.6,
    synonym: 0.7,
    semantic: 0.85,
    graph: 0.75,
    decomposition: 0.8,
    contextual: 0.5,
    'cross-domain': 0.5,
  },
}

// ─── Stop words ─────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'at', 'by', 'with', 'from', 'about', 'as', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'or', 'and', 'but', 'if', 'while',
  'because', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you',
  'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they',
  'them', 'their', 'please', 'make', 'write', 'create', 'tell',
])

// ─── Synonym map (bidirectional) ────────────────────────────────────────────

const SYNONYM_MAP: Record<string, string[]> = {
  // Programming
  'function': ['method', 'procedure', 'routine', 'subroutine'],
  'method': ['function', 'procedure'],
  'class': ['type', 'object', 'struct'],
  'variable': ['var', 'binding', 'identifier', 'symbol'],
  'array': ['list', 'collection', 'vector'],
  'list': ['array', 'collection'],
  'object': ['instance', 'entity', 'class'],
  'error': ['exception', 'fault', 'bug', 'failure'],
  'exception': ['error', 'fault'],
  'bug': ['defect', 'error', 'issue', 'flaw'],
  'test': ['spec', 'check', 'verification', 'assertion'],
  'database': ['db', 'datastore', 'store', 'repository'],
  'api': ['endpoint', 'interface', 'service'],
  'server': ['backend', 'service', 'host'],
  'client': ['frontend', 'consumer', 'browser'],
  'deploy': ['release', 'ship', 'publish', 'launch'],
  'build': ['compile', 'bundle', 'assemble'],
  'compile': ['build', 'transpile'],
  'performance': ['speed', 'efficiency', 'optimization', 'perf'],
  'security': ['protection', 'safety', 'auth', 'encryption'],
  'authentication': ['auth', 'login', 'signin', 'identity'],
  'authorization': ['permissions', 'access-control', 'rbac'],
  'async': ['asynchronous', 'concurrent', 'non-blocking'],
  'sync': ['synchronous', 'blocking', 'sequential'],
  'loop': ['iteration', 'cycle', 'repeat'],
  'recursion': ['recursive', 'self-referencing'],
  'dependency': ['package', 'module', 'library', 'dep'],
  'library': ['package', 'module', 'dependency', 'lib'],
  'framework': ['platform', 'toolkit', 'sdk'],
  'component': ['widget', 'element', 'module', 'part'],
  'state': ['data', 'store', 'model'],
  'cache': ['memoize', 'buffer', 'store'],
  'algorithm': ['algo', 'procedure', 'heuristic'],
  'pattern': ['design-pattern', 'paradigm', 'approach'],
  'refactor': ['restructure', 'improve', 'cleanup', 'rewrite'],
  'container': ['docker', 'pod', 'sandbox'],
  'kubernetes': ['k8s', 'orchestration'],
  'machine-learning': ['ml', 'ai', 'deep-learning'],
  'artificial-intelligence': ['ai', 'ml', 'machine-learning'],
  'typescript': ['ts'],
  'javascript': ['js', 'ecmascript'],
}

// ─── Domain relationship map for cross-domain search ────────────────────────

const DOMAIN_RELATIONS: Record<string, string[]> = {
  'programming': ['software-engineering', 'computer-science', 'algorithms', 'web-development'],
  'web-development': ['programming', 'javascript', 'frontend', 'backend', 'css', 'html'],
  'javascript': ['typescript', 'web-development', 'frontend', 'node.js'],
  'typescript': ['javascript', 'web-development', 'programming'],
  'python': ['programming', 'data-science', 'machine-learning', 'scripting'],
  'data-science': ['python', 'machine-learning', 'statistics', 'analytics'],
  'machine-learning': ['data-science', 'artificial-intelligence', 'python', 'statistics'],
  'artificial-intelligence': ['machine-learning', 'deep-learning', 'nlp', 'robotics'],
  'database': ['sql', 'nosql', 'data-modeling', 'backend'],
  'security': ['cybersecurity', 'cryptography', 'authentication', 'networking'],
  'cybersecurity': ['security', 'networking', 'penetration-testing', 'forensics'],
  'devops': ['ci-cd', 'deployment', 'infrastructure', 'containerization', 'cloud'],
  'cloud': ['aws', 'azure', 'gcp', 'devops', 'infrastructure'],
  'networking': ['protocols', 'security', 'infrastructure', 'tcp-ip'],
  'algorithms': ['data-structures', 'programming', 'computer-science', 'optimization'],
  'data-structures': ['algorithms', 'programming', 'computer-science'],
  'testing': ['quality-assurance', 'software-engineering', 'automation'],
  'frontend': ['web-development', 'javascript', 'css', 'react', 'ui-ux'],
  'backend': ['web-development', 'server', 'api', 'database'],
  'mobile': ['android', 'ios', 'react-native', 'flutter'],
}

// ─── Helper functions ───────────────────────────────────────────────────────

/** Extract meaningful keywords from text, filtering stop words. */
function extractSearchKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

/** Levenshtein distance between two strings (dynamic programming). */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  // Use a single flat array for the DP matrix (optimized for memory)
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j]! + 1,        // deletion
        curr[j - 1]! + 1,    // insertion
        prev[j - 1]! + cost, // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]!
}

/** Compute TF-IDF cosine similarity between a query and a document. */
function tfidfCosineSimilarity(queryTerms: string[], docTerms: string[]): number {
  if (queryTerms.length === 0 || docTerms.length === 0) return 0

  // Build term frequency maps
  const qFreq = new Map<string, number>()
  for (const t of queryTerms) qFreq.set(t, (qFreq.get(t) ?? 0) + 1)
  const dFreq = new Map<string, number>()
  for (const t of docTerms) dFreq.set(t, (dFreq.get(t) ?? 0) + 1)

  // Collect all unique terms
  const allTerms = new Set([...qFreq.keys(), ...dFreq.keys()])

  // Compute cosine similarity
  let dotProduct = 0
  let qMag = 0
  let dMag = 0
  for (const term of allTerms) {
    const qVal = qFreq.get(term) ?? 0
    const dVal = dFreq.get(term) ?? 0
    dotProduct += qVal * dVal
    qMag += qVal * qVal
    dMag += dVal * dVal
  }

  const magnitude = Math.sqrt(qMag) * Math.sqrt(dMag)
  return magnitude === 0 ? 0 : dotProduct / magnitude
}

/** Detect if a query is a complex multi-part question. */
function isComplexQuery(query: string): boolean {
  const lower = query.toLowerCase()
  // Multi-part indicators
  if (/\b(compare|vs\.?|versus|difference between|pros and cons)\b/.test(lower)) return true
  if (/\b(step by step|how to|guide|tutorial|explain.*and)\b/.test(lower)) return true
  if ((query.match(/\band\b/gi) ?? []).length >= 2) return true
  if ((query.match(/,/g) ?? []).length >= 2) return true
  if (query.split(/[.?!]/).filter(s => s.trim().length > 0).length >= 2) return true
  if (query.split(/\s+/).length > 20) return true
  return false
}

/** Decompose a complex query into sub-queries. */
function decomposeQuery(query: string): string[] {
  const lower = query.toLowerCase()
  const subQueries: string[] = []

  // Comparison queries
  const vsMatch = lower.match(/(.+?)\s+(?:vs\.?|versus|compared to|or)\s+(.+?)(?:\s+for\s+(.+))?$/)
  if (vsMatch) {
    const [, a, b, context] = vsMatch
    subQueries.push(`What is ${a!.trim()}?`)
    subQueries.push(`What is ${b!.trim()}?`)
    subQueries.push(`Differences between ${a!.trim()} and ${b!.trim()}`)
    if (context) subQueries.push(`Best choice for ${context.trim()}`)
    return subQueries
  }

  // "and" separated topics
  const andParts = query.split(/\s+and\s+/i).filter(p => p.trim().length > 3)
  if (andParts.length >= 2) {
    for (const part of andParts) {
      subQueries.push(part.trim())
    }
    return subQueries
  }

  // Comma separated topics
  const commaParts = query.split(',').filter(p => p.trim().length > 3)
  if (commaParts.length >= 3) {
    for (const part of commaParts) {
      subQueries.push(part.trim())
    }
    return subQueries
  }

  return [query]
}

/** Detect the domain of a query based on keyword heuristics. */
function detectQueryDomain(keywords: string[]): string[] {
  const domains: string[] = []
  const keywordSet = new Set(keywords)

  const domainKeywords: Record<string, string[]> = {
    'programming': ['code', 'program', 'function', 'variable', 'class', 'compile', 'debug', 'syntax'],
    'web-development': ['html', 'css', 'dom', 'browser', 'web', 'http', 'rest', 'frontend', 'backend'],
    'javascript': ['javascript', 'js', 'node', 'npm', 'react', 'vue', 'angular', 'express', 'typescript', 'ts'],
    'python': ['python', 'pip', 'django', 'flask', 'pandas', 'numpy', 'pytorch'],
    'database': ['sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'database', 'query', 'table', 'schema'],
    'security': ['security', 'vulnerability', 'encryption', 'auth', 'xss', 'csrf', 'injection', 'firewall'],
    'devops': ['docker', 'kubernetes', 'k8s', 'ci', 'cd', 'pipeline', 'deploy', 'terraform', 'ansible'],
    'machine-learning': ['ml', 'ai', 'neural', 'training', 'model', 'classification', 'regression', 'deep-learning'],
    'algorithms': ['algorithm', 'sort', 'search', 'graph', 'tree', 'dynamic-programming', 'complexity', 'big-o'],
    'data-structures': ['array', 'linked-list', 'stack', 'queue', 'heap', 'hash', 'trie', 'binary-tree'],
    'networking': ['tcp', 'udp', 'ip', 'dns', 'http', 'protocol', 'socket', 'port', 'packet'],
    'cloud': ['aws', 'azure', 'gcp', 'cloud', 'lambda', 's3', 'ec2', 'serverless'],
    'testing': ['test', 'unit', 'integration', 'e2e', 'mock', 'assertion', 'coverage', 'tdd', 'bdd'],
    'mobile': ['android', 'ios', 'swift', 'kotlin', 'react-native', 'flutter', 'mobile', 'app'],
  }

  for (const [domain, dkw] of Object.entries(domainKeywords)) {
    if (dkw.some(kw => keywordSet.has(kw))) {
      domains.push(domain)
    }
  }

  return domains.length > 0 ? domains : ['general']
}

// ─── Main class ─────────────────────────────────────────────────────────────

export class AdvancedSearchEngine {
  private config: SearchConfig
  private documents: SearchDocument[] = []
  private conversationContext: string[] = []
  private searchHistory: Array<{ query: string; resultCount: number; timestamp: number }> = []
  private stats = {
    totalSearches: 0,
    totalResults: 0,
    avgDurationMs: 0,
    strategyCounts: {
      keyword: 0,
      fuzzy: 0,
      synonym: 0,
      semantic: 0,
      graph: 0,
      decomposition: 0,
      contextual: 0,
      'cross-domain': 0,
    } as Record<SearchStrategy, number>,
  }

  // ── Graph nodes for graph-based search ──
  private graphNodes: Map<string, { id: string; name: string; domain: string }> = new Map()
  private graphEdges: Array<{ source: string; target: string; weight: number; relation: string }> = []

  constructor(config?: Partial<SearchConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    if (config?.strategyWeights) {
      this.config.strategyWeights = { ...DEFAULT_CONFIG.strategyWeights, ...config.strategyWeights }
    }
  }

  // ── Document management ────────────────────────────────────────────────────

  /** Index a batch of documents for searching. */
  indexDocuments(docs: SearchDocument[]): void {
    for (const doc of docs) {
      const existing = this.documents.findIndex(d => d.id === doc.id)
      if (existing >= 0) {
        this.documents[existing] = doc
      } else {
        this.documents.push(doc)
      }
    }
  }

  /** Remove a document by id. */
  removeDocument(id: string): boolean {
    const idx = this.documents.findIndex(d => d.id === id)
    if (idx >= 0) {
      this.documents.splice(idx, 1)
      return true
    }
    return false
  }

  /** Get the count of indexed documents. */
  getDocumentCount(): number {
    return this.documents.length
  }

  // ── Graph management ───────────────────────────────────────────────────────

  /** Add a node to the search graph. */
  addGraphNode(id: string, name: string, domain: string): void {
    this.graphNodes.set(id, { id, name, domain })
  }

  /** Add an edge to the search graph. */
  addGraphEdge(source: string, target: string, weight: number, relation: string): void {
    this.graphEdges.push({ source, target, weight, relation })
  }

  /** Get graph node count. */
  getGraphNodeCount(): number {
    return this.graphNodes.size
  }

  // ── Conversation context ───────────────────────────────────────────────────

  /** Add a conversation turn for contextual re-ranking. */
  addConversationContext(text: string): void {
    this.conversationContext.push(text)
    // Keep only the last 20 turns
    if (this.conversationContext.length > 20) {
      this.conversationContext = this.conversationContext.slice(-20)
    }
  }

  /** Clear conversation context. */
  clearContext(): void {
    this.conversationContext = []
  }

  // ── Core search with thinking ──────────────────────────────────────────────

  /**
   * Search with transparent chain-of-thought thinking.
   * This is the primary method — it runs all enabled strategies sequentially,
   * logs each reasoning step, merges results, and returns a fully explained
   * ranked result set.
   */
  searchWithThinking(query: string): SearchWithThinkingResult {
    const startTime = Date.now()
    const thinkingSteps: ThinkingStep[] = []
    let stepNum = 0
    const strategiesUsed: SearchStrategy[] = []

    // Score accumulator: docId → partial scores
    const scoreMap = new Map<string, {
      doc: SearchDocument
      scores: Partial<Record<SearchStrategy, number>>
      matchedTerms: Set<string>
      matchedBy: Set<SearchStrategy>
    }>()

    const addScore = (
      doc: SearchDocument,
      strategy: SearchStrategy,
      score: number,
      matchedTerms: string[] = [],
    ) => {
      const weight = this.config.strategyWeights[strategy] ?? 1.0
      const weightedScore = score * weight
      let entry = scoreMap.get(doc.id)
      if (!entry) {
        entry = { doc, scores: {}, matchedTerms: new Set(), matchedBy: new Set() }
        scoreMap.set(doc.id, entry)
      }
      // Take the max score per strategy (don't accumulate duplicates)
      entry.scores[strategy] = Math.max(entry.scores[strategy] ?? 0, weightedScore)
      entry.matchedBy.add(strategy)
      for (const t of matchedTerms) entry.matchedTerms.add(t)
    }

    // ── Step 0: Meta — Understand the query ──────────────────────────────────
    const s0Start = Date.now()
    const keywords = extractSearchKeywords(query)
    const queryDomains = detectQueryDomain(keywords)
    const complex = isComplexQuery(query)
    let expandedQuery = query
    thinkingSteps.push({
      step: ++stepNum,
      strategy: 'meta',
      thought: 'Analyzing the query to understand intent, extract keywords, and detect domain.',
      detail: `Keywords: [${keywords.slice(0, 8).join(', ')}]. Domains: [${queryDomains.join(', ')}]. Complex: ${complex}.`,
      durationMs: Date.now() - s0Start,
    })

    // ── Step 1: Keyword search ───────────────────────────────────────────────
    const s1Start = Date.now()
    let keywordHits = 0
    for (const doc of this.documents) {
      let score = 0
      const matched: string[] = []
      for (const kw of keywords) {
        // Exact keyword match
        if (doc.keywords.some(dk => dk === kw)) {
          score += 3
          matched.push(kw)
        }
        // Partial keyword match
        else if (doc.keywords.some(dk => dk.includes(kw) || kw.includes(dk))) {
          score += 1.5
          matched.push(kw)
        }
        // Content match
        if (doc.content.toLowerCase().includes(kw)) {
          score += 0.5
          if (!matched.includes(kw)) matched.push(kw)
        }
        // Title match (high boost)
        if (doc.title.toLowerCase().includes(kw)) {
          score += 2
          if (!matched.includes(kw)) matched.push(kw)
        }
      }
      if (score > 0) {
        // Normalize to [0, 1]
        const normalizedScore = Math.min(1, score / (keywords.length * 4))
        addScore(doc, 'keyword', normalizedScore, matched)
        keywordHits++
      }
    }
    strategiesUsed.push('keyword')
    this.stats.strategyCounts.keyword++
    thinkingSteps.push({
      step: ++stepNum,
      strategy: 'keyword',
      thought: 'Searching documents by exact and partial keyword matching.',
      detail: `Scanned ${this.documents.length} documents. Found ${keywordHits} keyword matches.`,
      durationMs: Date.now() - s1Start,
    })

    // ── Step 2: Fuzzy matching ───────────────────────────────────────────────
    if (this.config.enableFuzzy && keywords.length > 0) {
      const s2Start = Date.now()
      let fuzzyHits = 0
      for (const doc of this.documents) {
        let bestScore = 0
        const matched: string[] = []
        for (const kw of keywords) {
          for (const dk of doc.keywords) {
            const dist = levenshteinDistance(kw, dk)
            if (dist > 0 && dist <= this.config.maxFuzzyDistance) {
              const similarity = 1 - dist / Math.max(kw.length, dk.length)
              if (similarity > bestScore) bestScore = similarity
              matched.push(kw)
            }
          }
        }
        if (bestScore > 0.3) {
          addScore(doc, 'fuzzy', bestScore, [...new Set(matched)])
          fuzzyHits++
        }
      }
      strategiesUsed.push('fuzzy')
      this.stats.strategyCounts.fuzzy++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'fuzzy',
        thought: 'Applying fuzzy matching (Levenshtein distance) to catch misspellings and close variants.',
        detail: `Max edit distance: ${this.config.maxFuzzyDistance}. Found ${fuzzyHits} fuzzy matches.`,
        durationMs: Date.now() - s2Start,
      })
    }

    // ── Step 3: Synonym expansion ────────────────────────────────────────────
    if (this.config.enableSynonyms && keywords.length > 0) {
      const s3Start = Date.now()
      const expandedTerms: string[] = []
      for (const kw of keywords) {
        const syns = SYNONYM_MAP[kw]
        if (syns) {
          for (const syn of syns) {
            if (!keywords.includes(syn)) expandedTerms.push(syn)
          }
        }
      }
      const uniqueExpanded = [...new Set(expandedTerms)]

      let synonymHits = 0
      if (uniqueExpanded.length > 0) {
        expandedQuery = `${query} (expanded: ${uniqueExpanded.slice(0, 5).join(', ')})`
        for (const doc of this.documents) {
          let score = 0
          const matched: string[] = []
          for (const syn of uniqueExpanded) {
            if (doc.keywords.some(dk => dk === syn || dk.includes(syn))) {
              score += 2
              matched.push(syn)
            }
            if (doc.content.toLowerCase().includes(syn)) {
              score += 0.5
              if (!matched.includes(syn)) matched.push(syn)
            }
          }
          if (score > 0) {
            const normalizedScore = Math.min(1, score / (uniqueExpanded.length * 3))
            addScore(doc, 'synonym', normalizedScore, matched)
            synonymHits++
          }
        }
      }
      strategiesUsed.push('synonym')
      this.stats.strategyCounts.synonym++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'synonym',
        thought: `Expanding query with synonyms to broaden the search.`,
        detail: `Expanded ${keywords.length} keywords → ${uniqueExpanded.length} synonyms [${uniqueExpanded.slice(0, 5).join(', ')}]. Found ${synonymHits} new matches.`,
        durationMs: Date.now() - s3Start,
      })
    }

    // ── Step 4: Semantic (TF-IDF cosine) similarity ──────────────────────────
    if (this.config.enableSemantic && keywords.length > 0) {
      const s4Start = Date.now()
      let semanticHits = 0
      for (const doc of this.documents) {
        const docTerms = extractSearchKeywords(doc.content + ' ' + doc.title)
        const similarity = tfidfCosineSimilarity(keywords, docTerms)
        if (similarity > 0.05) {
          addScore(doc, 'semantic', similarity, keywords.filter(kw =>
            docTerms.includes(kw),
          ))
          semanticHits++
        }
      }
      strategiesUsed.push('semantic')
      this.stats.strategyCounts.semantic++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'semantic',
        thought: 'Computing TF-IDF cosine similarity between query and each document.',
        detail: `Found ${semanticHits} documents with semantic similarity > 0.05.`,
        durationMs: Date.now() - s4Start,
      })
    }

    // ── Step 5: Graph-based spreading activation ─────────────────────────────
    if (this.config.enableGraph && this.graphNodes.size > 0) {
      const s5Start = Date.now()
      // Find seed nodes matching keywords
      const seedIds: string[] = []
      for (const kw of keywords) {
        for (const [id, node] of this.graphNodes) {
          if (node.name.toLowerCase() === kw || node.name.toLowerCase().includes(kw)) {
            seedIds.push(id)
          }
        }
      }

      let graphHits = 0
      if (seedIds.length > 0) {
        // Simple 2-hop spreading activation
        const activation = new Map<string, number>()
        for (const id of seedIds) activation.set(id, 1.0)

        for (let depth = 0; depth < 2; depth++) {
          const nextAct = new Map<string, number>()
          for (const [nodeId, act] of activation) {
            if (act < 0.1) continue
            const neighbors = this.graphEdges.filter(e => e.source === nodeId || e.target === nodeId)
            for (const edge of neighbors) {
              const neighborId = edge.source === nodeId ? edge.target : edge.source
              const propagated = act * edge.weight * 0.8
              if (propagated >= 0.1) {
                const prev = nextAct.get(neighborId) ?? activation.get(neighborId) ?? 0
                nextAct.set(neighborId, Math.max(prev, propagated))
              }
            }
          }
          for (const [id, val] of nextAct) {
            activation.set(id, Math.max(activation.get(id) ?? 0, val))
          }
        }

        // Find documents in activated domains
        const activatedNames = new Set<string>()
        for (const [id, act] of activation) {
          if (act > 0.1) {
            const node = this.graphNodes.get(id)
            if (node) activatedNames.add(node.name.toLowerCase())
          }
        }

        for (const doc of this.documents) {
          const docDomain = (doc.domain ?? '').toLowerCase()
          const docTitle = doc.title.toLowerCase()
          let matchScore = 0
          const matched: string[] = []
          for (const name of activatedNames) {
            if (docDomain.includes(name) || docTitle.includes(name) ||
                doc.keywords.some(k => k.includes(name))) {
              matchScore += activation.get([...this.graphNodes.entries()]
                .find(([, n]) => n.name.toLowerCase() === name)?.[0] ?? '') ?? 0.5
              matched.push(name)
            }
          }
          if (matchScore > 0) {
            addScore(doc, 'graph', Math.min(1, matchScore), matched)
            graphHits++
          }
        }
      }
      strategiesUsed.push('graph')
      this.stats.strategyCounts.graph++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'graph',
        thought: 'Running graph-based spreading activation from seed concepts.',
        detail: `Seed nodes: ${seedIds.length}. Graph nodes: ${this.graphNodes.size}. Found ${graphHits} graph-linked results.`,
        durationMs: Date.now() - s5Start,
      })
    }

    // ── Step 6: Query decomposition ──────────────────────────────────────────
    if (this.config.enableDecomposition && complex) {
      const s6Start = Date.now()
      const subQueries = decomposeQuery(query)
      let decompositionHits = 0

      if (subQueries.length > 1) {
        for (const subQ of subQueries) {
          const subKeywords = extractSearchKeywords(subQ)
          for (const doc of this.documents) {
            let score = 0
            const matched: string[] = []
            for (const kw of subKeywords) {
              if (doc.keywords.some(dk => dk === kw || dk.includes(kw))) {
                score += 2
                matched.push(kw)
              }
              if (doc.content.toLowerCase().includes(kw)) {
                score += 0.5
                if (!matched.includes(kw)) matched.push(kw)
              }
            }
            if (score > 0) {
              const normalizedScore = Math.min(1, score / (subKeywords.length * 3))
              addScore(doc, 'decomposition', normalizedScore, matched)
              decompositionHits++
            }
          }
        }
      }

      strategiesUsed.push('decomposition')
      this.stats.strategyCounts.decomposition++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'decomposition',
        thought: `Query is complex — decomposing into ${subQueries.length} sub-queries and searching each.`,
        detail: `Sub-queries: [${subQueries.map(q => `"${q.slice(0, 40)}"`).join(', ')}]. Found ${decompositionHits} additional matches.`,
        durationMs: Date.now() - s6Start,
      })
    }

    // ── Step 7: Contextual re-ranking ────────────────────────────────────────
    if (this.config.enableContextual && this.conversationContext.length > 0) {
      const s7Start = Date.now()
      const contextKeywords = new Set<string>()
      for (const turn of this.conversationContext.slice(-5)) {
        for (const kw of extractSearchKeywords(turn)) {
          contextKeywords.add(kw)
        }
      }

      let contextBoosts = 0
      for (const [, entry] of scoreMap) {
        let boost = 0
        const matched: string[] = []
        for (const kw of contextKeywords) {
          if (entry.doc.keywords.includes(kw) || entry.doc.content.toLowerCase().includes(kw)) {
            boost += 0.1
            matched.push(kw)
          }
        }
        if (boost > 0) {
          addScore(entry.doc, 'contextual', Math.min(1, boost), matched)
          contextBoosts++
        }
      }

      strategiesUsed.push('contextual')
      this.stats.strategyCounts.contextual++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'contextual',
        thought: 'Boosting results that align with recent conversation context.',
        detail: `Context keywords: ${contextKeywords.size}. Boosted ${contextBoosts} results.`,
        durationMs: Date.now() - s7Start,
      })
    }

    // ── Step 8: Cross-domain transfer ────────────────────────────────────────
    if (this.config.enableCrossDomain && queryDomains.length > 0) {
      const s8Start = Date.now()
      const relatedDomains = new Set<string>()
      for (const domain of queryDomains) {
        const related = DOMAIN_RELATIONS[domain]
        if (related) {
          for (const rd of related) relatedDomains.add(rd)
        }
      }
      // Remove the primary domains
      for (const domain of queryDomains) relatedDomains.delete(domain)

      let crossHits = 0
      if (relatedDomains.size > 0) {
        for (const doc of this.documents) {
          const docDomain = (doc.domain ?? '').toLowerCase()
          if (relatedDomains.has(docDomain)) {
            // Check if there's at least some keyword overlap
            const overlap = keywords.filter(kw =>
              doc.keywords.includes(kw) || doc.content.toLowerCase().includes(kw),
            )
            if (overlap.length > 0) {
              const score = Math.min(1, (overlap.length / keywords.length) * 0.6)
              addScore(doc, 'cross-domain', score, overlap)
              crossHits++
            }
          }
        }
      }

      strategiesUsed.push('cross-domain')
      this.stats.strategyCounts['cross-domain']++
      thinkingSteps.push({
        step: ++stepNum,
        strategy: 'cross-domain',
        thought: `Searching related domains for cross-disciplinary insights.`,
        detail: `Primary domains: [${queryDomains.join(', ')}]. Related domains: [${[...relatedDomains].slice(0, 5).join(', ')}]. Found ${crossHits} cross-domain matches.`,
        durationMs: Date.now() - s8Start,
      })
    }

    // ── Step 9: Meta — Merge, rank, and explain ──────────────────────────────
    const s9Start = Date.now()
    const rankedResults: SearchResultItem[] = []
    for (const [, entry] of scoreMap) {
      // Composite score = sum of all strategy scores (already weighted)
      const strategyScoreValues = Object.values(entry.scores) as number[]
      const compositeScore = strategyScoreValues.reduce((a, b) => a + b, 0)
      // Multi-strategy bonus: reward docs matched by multiple strategies
      const strategyCount = entry.matchedBy.size
      const diversityBonus = strategyCount > 1 ? 0.1 * (strategyCount - 1) : 0
      const finalScore = Math.min(1, compositeScore / (strategiesUsed.length * 0.6) + diversityBonus)

      if (finalScore >= this.config.minScore) {
        rankedResults.push({
          id: entry.doc.id,
          title: entry.doc.title,
          content: entry.doc.content,
          score: Math.round(finalScore * 1000) / 1000,
          matchedBy: [...entry.matchedBy],
          strategyScores: { ...entry.scores },
          matchedTerms: [...entry.matchedTerms],
          domain: entry.doc.domain,
        })
      }
    }

    // Sort by score descending, then by number of strategies matching
    rankedResults.sort((a, b) => {
      if (Math.abs(a.score - b.score) > 0.001) return b.score - a.score
      return b.matchedBy.length - a.matchedBy.length
    })

    const topResults = rankedResults.slice(0, this.config.maxResults)

    // Compute overall confidence
    const confidence = topResults.length > 0
      ? Math.min(1, (topResults[0]!.score * 0.5) + (Math.min(topResults.length, 5) / 5 * 0.3) + (strategiesUsed.length / 8 * 0.2))
      : 0

    thinkingSteps.push({
      step: ++stepNum,
      strategy: 'meta',
      thought: 'Merging results from all strategies, computing composite scores, and ranking.',
      detail: `Total candidates: ${scoreMap.size}. After threshold filter: ${rankedResults.length}. Returning top ${topResults.length}. Confidence: ${(confidence * 100).toFixed(1)}%.`,
      durationMs: Date.now() - s9Start,
    })

    const totalDurationMs = Date.now() - startTime

    // Update stats
    this.stats.totalSearches++
    this.stats.totalResults += topResults.length
    this.stats.avgDurationMs = (this.stats.avgDurationMs * (this.stats.totalSearches - 1) + totalDurationMs) / this.stats.totalSearches

    // Track search history
    this.searchHistory.push({ query, resultCount: topResults.length, timestamp: Date.now() })
    if (this.searchHistory.length > 100) this.searchHistory = this.searchHistory.slice(-100)

    return {
      query,
      results: topResults,
      thinkingSteps,
      totalDurationMs,
      strategiesUsed,
      confidence,
      expandedQuery,
      candidatesScanned: this.documents.length,
    }
  }

  // ── Simple search (no thinking) ────────────────────────────────────────────

  /** Quick keyword-only search without thinking steps. */
  quickSearch(query: string, limit = 5): SearchResultItem[] {
    const keywords = extractSearchKeywords(query)
    const results: SearchResultItem[] = []

    for (const doc of this.documents) {
      let score = 0
      const matched: string[] = []
      for (const kw of keywords) {
        if (doc.keywords.some(dk => dk === kw)) {
          score += 3
          matched.push(kw)
        } else if (doc.keywords.some(dk => dk.includes(kw) || kw.includes(dk))) {
          score += 1.5
          matched.push(kw)
        }
        if (doc.content.toLowerCase().includes(kw)) {
          score += 0.5
          if (!matched.includes(kw)) matched.push(kw)
        }
      }
      if (score > 0) {
        results.push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          score: Math.min(1, score / (keywords.length * 4)),
          matchedBy: ['keyword'],
          strategyScores: { keyword: Math.min(1, score / (keywords.length * 4)) },
          matchedTerms: [...new Set(matched)],
          domain: doc.domain,
        })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // ── Suggest related queries ────────────────────────────────────────────────

  /** Generate related query suggestions based on the original query. */
  suggestRelatedQueries(query: string, limit = 5): string[] {
    const keywords = extractSearchKeywords(query)
    const suggestions: string[] = []

    // Synonym-based suggestions
    for (const kw of keywords) {
      const syns = SYNONYM_MAP[kw]
      if (syns) {
        for (const syn of syns.slice(0, 2)) {
          const newQuery = query.toLowerCase().replace(kw, syn)
          if (newQuery !== query.toLowerCase()) {
            suggestions.push(newQuery)
          }
        }
      }
    }

    // Domain-based suggestions
    const domains = detectQueryDomain(keywords)
    for (const domain of domains) {
      const related = DOMAIN_RELATIONS[domain]
      if (related) {
        for (const rd of related.slice(0, 2)) {
          suggestions.push(`${query} in ${rd}`)
        }
      }
    }

    // Decomposition suggestions
    if (isComplexQuery(query)) {
      const subQueries = decomposeQuery(query)
      for (const sq of subQueries) {
        if (sq !== query) suggestions.push(sq)
      }
    }

    return [...new Set(suggestions)].slice(0, limit)
  }

  // ── Explain search results ─────────────────────────────────────────────────

  /** Generate a human-readable explanation of how a search result was found. */
  explainResult(result: SearchResultItem): string {
    const parts: string[] = []
    parts.push(`**${result.title}** (score: ${(result.score * 100).toFixed(1)}%)`)
    parts.push(`Found by: ${result.matchedBy.join(', ')}`)
    parts.push(`Matched terms: ${result.matchedTerms.join(', ')}`)

    for (const [strategy, score] of Object.entries(result.strategyScores)) {
      if (score && score > 0) {
        parts.push(`  - ${strategy}: ${(score * 100).toFixed(1)}%`)
      }
    }

    if (result.domain) {
      parts.push(`Domain: ${result.domain}`)
    }

    return parts.join('\n')
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  /** Get search engine statistics. */
  getStats(): {
    totalSearches: number
    totalResults: number
    avgDurationMs: number
    documentCount: number
    graphNodeCount: number
    graphEdgeCount: number
    strategyCounts: Record<SearchStrategy, number>
  } {
    return {
      ...this.stats,
      documentCount: this.documents.length,
      graphNodeCount: this.graphNodes.size,
      graphEdgeCount: this.graphEdges.length,
    }
  }

  /** Get recent search history. */
  getSearchHistory(): Array<{ query: string; resultCount: number; timestamp: number }> {
    return [...this.searchHistory]
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  /** Serialize engine state for persistence. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      documents: this.documents,
      graphNodes: [...this.graphNodes.entries()],
      graphEdges: this.graphEdges,
      conversationContext: this.conversationContext,
      searchHistory: this.searchHistory,
      stats: this.stats,
    })
  }

  /** Deserialize engine state from JSON string. */
  static deserialize(data: string): AdvancedSearchEngine {
    const parsed = JSON.parse(data)
    const engine = new AdvancedSearchEngine(parsed.config)
    engine.documents = parsed.documents ?? []
    engine.graphNodes = new Map(parsed.graphNodes ?? [])
    engine.graphEdges = parsed.graphEdges ?? []
    engine.conversationContext = parsed.conversationContext ?? []
    engine.searchHistory = parsed.searchHistory ?? []
    engine.stats = parsed.stats ?? engine.stats
    return engine
  }
}
