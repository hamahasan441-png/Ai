/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PdfExpert — Document-Grounded Q&A Engine                                  ║
 * ║                                                                            ║
 * ║  Expert AI assistant for PDF/document knowledge bases:                     ║
 * ║    ✦ Load & store multiple documents as a knowledge base                  ║
 * ║    ✦ Answer questions ONLY from loaded documents                          ║
 * ║    ✦ Cite which document each answer comes from                           ║
 * ║    ✦ Quote exact text when relevant                                       ║
 * ║    ✦ "Not covered" fallback when answer isn't in documents                ║
 * ║    ✦ Compare & connect multiple documents                                 ║
 * ║    ✦ Cross-document search with relevance scoring                         ║
 * ║                                                                            ║
 * ║  100% offline — no network or API calls needed.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  DocumentAnalyzer,
  type DocumentAnalysisResult,
  type DocumentSection,
  type KeywordResult,
} from './DocumentAnalyzer.js'

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Configuration for PdfExpert. */
export interface PdfExpertConfig {
  /** Maximum number of documents that can be loaded. Default: 50 */
  readonly maxDocuments: number
  /** Minimum relevance score (0–1) to include a passage in an answer. Default: 0.1 */
  readonly relevanceThreshold: number
  /** Maximum number of quoted passages per answer. Default: 5 */
  readonly maxQuotesPerAnswer: number
  /** Maximum length of each quoted passage (chars). Default: 500 */
  readonly maxQuoteLength: number
  /** Maximum content length per document (chars). Default: 500_000 */
  readonly maxContentLength: number
  /** Enable cross-document comparison. Default: true */
  readonly enableComparison: boolean
}

/** Represents a loaded document in the knowledge base. */
export interface LoadedDocument {
  /** Unique document identifier. */
  readonly id: string
  /** File name (if provided). */
  readonly fileName: string
  /** Content of the document. */
  readonly content: string
  /** Full analysis result from DocumentAnalyzer. */
  readonly analysis: DocumentAnalysisResult
  /** When the document was loaded. */
  readonly loadedAt: string
}

/** A citation pointing to a specific document and location. */
export interface DocumentCitation {
  /** Document ID. */
  readonly documentId: string
  /** Document file name. */
  readonly documentName: string
  /** Section title where the answer was found. */
  readonly sectionTitle: string
  /** Exact quoted text from the document. */
  readonly quotedText: string
  /** Relevance score (0–1). */
  readonly relevance: number
}

/** Answer to a question with citations from loaded documents. */
export interface PdfExpertAnswer {
  /** The answer text. */
  readonly answer: string
  /** Whether the answer was found in the documents. */
  readonly found: boolean
  /** Citations from loaded documents. */
  readonly citations: readonly DocumentCitation[]
  /** Overall confidence (0–1). */
  readonly confidence: number
  /** Processing time in milliseconds. */
  readonly processingMs: number
}

/** Query request for the PdfExpert. */
export interface PdfExpertQuery {
  /** The question to answer. */
  readonly question: string
  /** Limit search to specific document IDs (optional). */
  readonly documentIds?: readonly string[]
}

/** Result of comparing multiple documents. */
export interface DocumentComparison {
  /** IDs of documents compared. */
  readonly documentIds: readonly string[]
  /** Shared topics/keywords across documents. */
  readonly sharedTopics: readonly string[]
  /** Unique topics per document. */
  readonly uniqueTopics: ReadonlyMap<string, readonly string[]>
  /** Connections found between documents. */
  readonly connections: readonly DocumentConnection[]
  /** Summary of comparison. */
  readonly summary: string
  /** Processing time in milliseconds. */
  readonly processingMs: number
}

/** A connection found between two documents. */
export interface DocumentConnection {
  /** First document ID. */
  readonly sourceDocId: string
  /** Second document ID. */
  readonly targetDocId: string
  /** Description of the connection. */
  readonly description: string
  /** Shared keywords that form this connection. */
  readonly sharedKeywords: readonly string[]
  /** Strength of connection (0–1). */
  readonly strength: number
}

/** Search result across loaded documents. */
export interface DocumentSearchResult {
  /** Document ID. */
  readonly documentId: string
  /** Document file name. */
  readonly documentName: string
  /** Matching section title. */
  readonly sectionTitle: string
  /** Matching text snippet. */
  readonly snippet: string
  /** Relevance score (0–1). */
  readonly relevance: number
}

/** Usage statistics for PdfExpert. */
export interface PdfExpertStats {
  /** Number of documents currently loaded. */
  readonly documentsLoaded: number
  /** Total words across all documents. */
  readonly totalWords: number
  /** Number of queries answered. */
  readonly queriesAnswered: number
  /** Number of queries not found in documents. */
  readonly queriesNotFound: number
  /** Number of comparisons performed. */
  readonly comparisonsPerformed: number
  /** Number of searches performed. */
  readonly searchesPerformed: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_PDF_EXPERT_CONFIG: PdfExpertConfig = {
  maxDocuments: 50,
  relevanceThreshold: 0.1,
  maxQuotesPerAnswer: 5,
  maxQuoteLength: 500,
  maxContentLength: 500_000,
  enableComparison: true,
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
  'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each',
  'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very',
  'just', 'because', 'if', 'when', 'where', 'how', 'what', 'which',
  'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
  'it', 'its', 'they', 'them', 'their', 'about', 'also', 'then',
])

const NOT_COVERED_MESSAGE = 'This is not covered in the uploaded documents'

// ─── PdfExpert ─────────────────────────────────────────────────────────────────

export class PdfExpert {
  private readonly config: PdfExpertConfig
  private readonly analyzer: DocumentAnalyzer
  private readonly documents: Map<string, LoadedDocument> = new Map()
  private nextDocId = 1
  private queriesAnswered = 0
  private queriesNotFound = 0
  private comparisonsPerformed = 0
  private searchesPerformed = 0

  constructor(config: Partial<PdfExpertConfig> = {}) {
    this.config = { ...DEFAULT_PDF_EXPERT_CONFIG, ...config }
    this.analyzer = new DocumentAnalyzer({
      maxContentLength: this.config.maxContentLength,
    })
  }

  // ── Document Management ──────────────────────────────────────────────────

  /**
   * Load a document into the knowledge base.
   * Returns the document ID assigned.
   */
  loadDocument(content: string, fileName?: string, mimeType?: string): string {
    if (!content || content.trim().length === 0) {
      throw new Error('Document content is empty')
    }

    if (this.documents.size >= this.config.maxDocuments) {
      throw new Error(`Maximum number of documents (${this.config.maxDocuments}) reached`)
    }

    const truncated = content.length > this.config.maxContentLength
      ? content.slice(0, this.config.maxContentLength)
      : content

    const docNumber = this.nextDocId++
    const id = `doc-${docNumber}`
    const analysis = this.analyzer.analyze({
      content: truncated,
      fileName,
      mimeType,
    })

    const doc: LoadedDocument = {
      id,
      fileName: fileName ?? `Document ${docNumber}`,
      content: truncated,
      analysis,
      loadedAt: new Date().toISOString(),
    }

    this.documents.set(id, doc)
    return id
  }

  /**
   * Remove a document from the knowledge base.
   * Returns true if the document was found and removed.
   */
  removeDocument(documentId: string): boolean {
    return this.documents.delete(documentId)
  }

  /** List all loaded documents (without content). */
  listDocuments(): ReadonlyArray<{
    id: string
    fileName: string
    wordCount: number
    estimatedPages: number
    classification: string
    loadedAt: string
  }> {
    return [...this.documents.values()].map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      wordCount: doc.analysis.metadata.wordCount,
      estimatedPages: doc.analysis.metadata.estimatedPages,
      classification: doc.analysis.classification.primaryType,
      loadedAt: doc.loadedAt,
    }))
  }

  /** Get a loaded document by ID (returns null if not found). */
  getDocument(documentId: string): LoadedDocument | null {
    return this.documents.get(documentId) ?? null
  }

  /** Get number of loaded documents. */
  get documentCount(): number {
    return this.documents.size
  }

  // ── Question Answering ───────────────────────────────────────────────────

  /**
   * Answer a question using ONLY the loaded documents.
   * Always cites sources and quotes exact text.
   * Returns "not covered" when the answer isn't in the documents.
   */
  ask(query: PdfExpertQuery | string): PdfExpertAnswer {
    const start = Date.now()
    const { question, documentIds } = typeof query === 'string'
      ? { question: query, documentIds: undefined }
      : query

    if (!question || question.trim().length === 0) {
      throw new Error('Question is empty')
    }

    if (this.documents.size === 0) {
      this.queriesNotFound++
      return {
        answer: 'No documents have been loaded. Please upload documents first.',
        found: false,
        citations: [],
        confidence: 0,
        processingMs: Date.now() - start,
      }
    }

    // Determine which documents to search
    const targetDocs = this.getTargetDocuments(documentIds)

    if (targetDocs.length === 0) {
      this.queriesNotFound++
      return {
        answer: 'None of the specified document IDs were found.',
        found: false,
        citations: [],
        confidence: 0,
        processingMs: Date.now() - start,
      }
    }

    // Extract query keywords
    const queryKeywords = this.extractQueryKeywords(question)

    // Search all target documents for relevant passages
    const allCitations: DocumentCitation[] = []

    for (const doc of targetDocs) {
      const citations = this.findRelevantPassages(doc, queryKeywords, question)
      allCitations.push(...citations)
    }

    // Sort by relevance and take top results
    allCitations.sort((a, b) => b.relevance - a.relevance)
    const topCitations = allCitations
      .filter(c => c.relevance >= this.config.relevanceThreshold)
      .slice(0, this.config.maxQuotesPerAnswer)

    if (topCitations.length === 0) {
      this.queriesNotFound++
      return {
        answer: NOT_COVERED_MESSAGE,
        found: false,
        citations: [],
        confidence: 0,
        processingMs: Date.now() - start,
      }
    }

    // Build answer from citations
    const answer = this.buildAnswerFromCitations(question, topCitations)
    const confidence = this.computeAnswerConfidence(topCitations)

    this.queriesAnswered++

    return {
      answer,
      found: true,
      citations: topCitations,
      confidence,
      processingMs: Date.now() - start,
    }
  }

  // ── Cross-Document Search ────────────────────────────────────────────────

  /**
   * Search across all loaded documents for a query.
   * Returns matching sections with relevance scores.
   */
  searchDocuments(query: string): readonly DocumentSearchResult[] {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is empty')
    }

    this.searchesPerformed++
    const queryKeywords = this.extractQueryKeywords(query)
    const results: DocumentSearchResult[] = []

    for (const doc of this.documents.values()) {
      for (const section of doc.analysis.structure.sections) {
        const relevance = this.computeSectionRelevance(section, queryKeywords, query)
        if (relevance >= this.config.relevanceThreshold) {
          results.push({
            documentId: doc.id,
            documentName: doc.fileName,
            sectionTitle: section.title,
            snippet: this.extractBestSnippet(section.content, queryKeywords),
            relevance,
          })
        }
      }
    }

    results.sort((a, b) => b.relevance - a.relevance)
    return results.slice(0, 20)
  }

  // ── Document Comparison ──────────────────────────────────────────────────

  /**
   * Compare and connect multiple documents.
   * If no IDs provided, compares all loaded documents.
   */
  compare(documentIds?: readonly string[]): DocumentComparison {
    const start = Date.now()

    if (!this.config.enableComparison) {
      throw new Error('Document comparison is disabled in configuration')
    }

    const targetDocs = documentIds
      ? documentIds.map(id => this.documents.get(id)).filter((d): d is LoadedDocument => d != null)
      : [...this.documents.values()]

    if (targetDocs.length < 2) {
      throw new Error('At least 2 documents are required for comparison')
    }

    this.comparisonsPerformed++

    // Extract keyword sets per document
    const docKeywords = new Map<string, Set<string>>()
    for (const doc of targetDocs) {
      const keywords = new Set(doc.analysis.keywords.map(k => k.word.toLowerCase()))
      docKeywords.set(doc.id, keywords)
    }

    // Find shared and unique topics
    const allKeywordSets = [...docKeywords.values()]
    const sharedTopicsSet = new Set<string>()
    const uniqueTopics = new Map<string, readonly string[]>()

    // Find keywords shared by at least 2 documents
    const keywordCounts = new Map<string, number>()
    for (const kwSet of allKeywordSets) {
      for (const kw of kwSet) {
        keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1)
      }
    }

    for (const [kw, count] of keywordCounts) {
      if (count >= 2) sharedTopicsSet.add(kw)
    }

    // Unique topics per document
    for (const doc of targetDocs) {
      const kwSet = docKeywords.get(doc.id)!
      const unique = [...kwSet].filter(kw => !sharedTopicsSet.has(kw))
      uniqueTopics.set(doc.id, unique)
    }

    // Find pairwise connections
    const connections: DocumentConnection[] = []
    for (let i = 0; i < targetDocs.length; i++) {
      for (let j = i + 1; j < targetDocs.length; j++) {
        const docA = targetDocs[i]!
        const docB = targetDocs[j]!
        const kwA = docKeywords.get(docA.id)!
        const kwB = docKeywords.get(docB.id)!

        const shared = [...kwA].filter(kw => kwB.has(kw))
        if (shared.length > 0) {
          const strength = Math.min(1, shared.length / Math.max(kwA.size, kwB.size, 1))
          connections.push({
            sourceDocId: docA.id,
            targetDocId: docB.id,
            description: `Share ${shared.length} topic(s): ${shared.slice(0, 5).join(', ')}${shared.length > 5 ? '...' : ''}`,
            sharedKeywords: shared,
            strength: Math.round(strength * 100) / 100,
          })
        }
      }
    }

    connections.sort((a, b) => b.strength - a.strength)

    // Build summary
    const summary = this.buildComparisonSummary(targetDocs, sharedTopicsSet, uniqueTopics, connections)

    return {
      documentIds: targetDocs.map(d => d.id),
      sharedTopics: [...sharedTopicsSet],
      uniqueTopics,
      connections,
      summary,
      processingMs: Date.now() - start,
    }
  }

  // ── Stats & Maintenance ──────────────────────────────────────────────────

  /** Get usage statistics. */
  getStats(): PdfExpertStats {
    let totalWords = 0
    for (const doc of this.documents.values()) {
      totalWords += doc.analysis.metadata.wordCount
    }

    return {
      documentsLoaded: this.documents.size,
      totalWords,
      queriesAnswered: this.queriesAnswered,
      queriesNotFound: this.queriesNotFound,
      comparisonsPerformed: this.comparisonsPerformed,
      searchesPerformed: this.searchesPerformed,
    }
  }

  /** Clear all loaded documents and reset statistics. */
  clear(): void {
    this.documents.clear()
    this.nextDocId = 1
    this.queriesAnswered = 0
    this.queriesNotFound = 0
    this.comparisonsPerformed = 0
    this.searchesPerformed = 0
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private getTargetDocuments(documentIds?: readonly string[]): LoadedDocument[] {
    if (documentIds && documentIds.length > 0) {
      return documentIds
        .map(id => this.documents.get(id))
        .filter((d): d is LoadedDocument => d != null)
    }
    return [...this.documents.values()]
  }

  private extractQueryKeywords(question: string): string[] {
    return question
      .toLowerCase()
      .split(/[\s\n,.!?;:'"()\[\]{}]+/)
      .filter(w => w.length > 1 && !STOP_WORDS.has(w))
  }

  private findRelevantPassages(
    doc: LoadedDocument,
    queryKeywords: string[],
    question: string,
  ): DocumentCitation[] {
    const citations: DocumentCitation[] = []

    for (const section of doc.analysis.structure.sections) {
      const relevance = this.computeSectionRelevance(section, queryKeywords, question)

      if (relevance >= this.config.relevanceThreshold) {
        const quotedText = this.extractBestQuote(section.content, queryKeywords)
          || section.title || '(no content)'

        citations.push({
          documentId: doc.id,
          documentName: doc.fileName,
          sectionTitle: section.title,
          quotedText,
          relevance: Math.round(relevance * 100) / 100,
        })
      }
    }

    return citations
  }

  private computeSectionRelevance(
    section: DocumentSection,
    queryKeywords: string[],
    question: string,
  ): number {
    if (queryKeywords.length === 0) return 0

    const sectionLower = section.content.toLowerCase()
    const titleLower = section.title.toLowerCase()

    let matchedKeywords = 0
    let titleMatches = 0

    for (const kw of queryKeywords) {
      if (sectionLower.includes(kw)) matchedKeywords++
      if (titleLower.includes(kw)) titleMatches++
    }

    // Base relevance: fraction of keywords found
    let relevance = matchedKeywords / queryKeywords.length

    // Bonus for title matches (title match is a strong signal)
    relevance += (titleMatches / queryKeywords.length) * 0.3

    // Bonus for exact phrase match
    const questionLower = question.toLowerCase()
    if (sectionLower.includes(questionLower)) {
      relevance += 0.3
    }

    // Penalty for very short sections (likely not informative)
    if (section.wordCount < 10) {
      relevance *= 0.5
    }

    return Math.min(1, relevance)
  }

  private extractBestQuote(content: string, queryKeywords: string[]): string {
    const sentences = this.splitSentences(content)

    if (sentences.length === 0) {
      // Fallback to raw content when no sentences detected
      const trimmed = content.trim()
      return trimmed.length > 0
        ? trimmed.slice(0, this.config.maxQuoteLength)
        : ''
    }

    // Score each sentence by keyword matches
    const scored = sentences.map(sentence => {
      const lower = sentence.toLowerCase()
      let score = 0
      for (const kw of queryKeywords) {
        if (lower.includes(kw)) score++
      }
      return { sentence, score }
    })

    scored.sort((a, b) => b.score - a.score)

    // Take best sentences up to maxQuoteLength
    const bestSentences: string[] = []
    let totalLength = 0

    for (const { sentence, score } of scored) {
      if (score === 0) break
      if (totalLength + sentence.length > this.config.maxQuoteLength) break
      bestSentences.push(sentence)
      totalLength += sentence.length + 1
    }

    if (bestSentences.length === 0) {
      // Fallback: return first sentence
      return sentences[0]!.slice(0, this.config.maxQuoteLength)
    }

    return bestSentences.join(' ').trim()
  }

  private extractBestSnippet(content: string, queryKeywords: string[]): string {
    if (!content || content.trim().length === 0) {
      return queryKeywords.join(' ')
    }
    const quote = this.extractBestQuote(content, queryKeywords)
    return (quote.length > 0 ? quote : content.trim()).slice(0, 200)
  }

  private buildAnswerFromCitations(question: string, citations: readonly DocumentCitation[]): string {
    const parts: string[] = []

    if (citations.length === 1) {
      const c = citations[0]!
      parts.push(
        `Based on "${c.documentName}" (section "${c.sectionTitle}"):`,
        '',
        `> "${c.quotedText}"`,
      )
    } else {
      // Multiple sources
      const docNames = [...new Set(citations.map(c => c.documentName))]

      if (docNames.length === 1) {
        parts.push(`Based on "${docNames[0]}" (${citations.length} relevant passages):`)
      } else {
        parts.push(`Based on ${docNames.length} documents (${citations.length} relevant passages):`)
      }

      parts.push('')

      for (const citation of citations) {
        parts.push(
          `[${citation.documentName} — "${citation.sectionTitle}"]`,
          `> "${citation.quotedText}"`,
          '',
        )
      }
    }

    return parts.join('\n').trim()
  }

  private computeAnswerConfidence(citations: readonly DocumentCitation[]): number {
    if (citations.length === 0) return 0

    // Average relevance of top citations, with bonus for multiple sources
    const avgRelevance = citations.reduce((sum, c) => sum + c.relevance, 0) / citations.length
    const multiSourceBonus = Math.min(0.15, (citations.length - 1) * 0.05)

    return Math.round(Math.min(1, avgRelevance + multiSourceBonus) * 100) / 100
  }

  private buildComparisonSummary(
    docs: LoadedDocument[],
    sharedTopics: Set<string>,
    uniqueTopics: Map<string, readonly string[]>,
    connections: DocumentConnection[],
  ): string {
    const parts: string[] = []

    parts.push(`Compared ${docs.length} documents:`)

    for (const doc of docs) {
      parts.push(`  • "${doc.fileName}" — ${doc.analysis.metadata.wordCount} words, ${doc.analysis.classification.primaryType} document`)
    }

    if (sharedTopics.size > 0) {
      const topShared = [...sharedTopics].slice(0, 10)
      parts.push(`\nShared topics (${sharedTopics.size}): ${topShared.join(', ')}${sharedTopics.size > 10 ? '...' : ''}`)
    } else {
      parts.push('\nNo shared topics found between documents.')
    }

    for (const doc of docs) {
      const unique = uniqueTopics.get(doc.id)
      if (unique && unique.length > 0) {
        const topUnique = unique.slice(0, 5)
        parts.push(`"${doc.fileName}" unique topics: ${topUnique.join(', ')}${unique.length > 5 ? '...' : ''}`)
      }
    }

    if (connections.length > 0) {
      const strongest = connections[0]!
      parts.push(`\nStrongest connection: strength ${strongest.strength} — ${strongest.description}`)
    } else {
      parts.push('\nNo direct connections found between documents.')
    }

    return parts.join('\n')
  }

  private splitSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5)
  }
}
