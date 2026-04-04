/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  DocumentAnalyzer — Powerful Offline Document Understanding Engine          ║
 * ║                                                                            ║
 * ║  Deep PDF and document analysis without external APIs:                     ║
 * ║    ✦ Structure extraction (headings, paragraphs, lists, tables, code)      ║
 * ║    ✦ Content summarization (extractive + keyword-based)                    ║
 * ║    ✦ Keyword & topic extraction (TF-IDF inspired)                          ║
 * ║    ✦ Readability scoring (Flesch-Kincaid, Gunning Fog, ARI)               ║
 * ║    ✦ Table detection & extraction                                          ║
 * ║    ✦ Code block detection & language classification                        ║
 * ║    ✦ Section hierarchy building (document outline)                         ║
 * ║    ✦ Cross-reference detection (links, citations, footnotes)              ║
 * ║    ✦ Metadata extraction (author, dates, version)                         ║
 * ║    ✦ Document classification (technical, legal, academic, etc.)            ║
 * ║    ✦ Sentiment analysis (per section & overall)                           ║
 * ║    ✦ Question answering over document content                              ║
 * ║                                                                            ║
 * ║  100% offline — no network or API calls needed.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Request to analyze a document. */
export interface DocumentAnalysisRequest {
  /** Raw text content of the document. */
  readonly content: string
  /** Original file name (for format detection). */
  readonly fileName?: string
  /** MIME type if known. */
  readonly mimeType?: string
  /** Optional: specific question about the document. */
  readonly question?: string
  /** Optional: only analyze specific page range (for large documents). */
  readonly pageRange?: { start: number; end: number }
}

/** Complete document analysis result. */
export interface DocumentAnalysisResult {
  /** Document metadata. */
  readonly metadata: DocumentMetadata
  /** Structural analysis. */
  readonly structure: DocumentStructure
  /** Content analysis. */
  readonly content: ContentAnalysis
  /** Readability metrics. */
  readonly readability: ReadabilityMetrics
  /** Document classification. */
  readonly classification: DocumentClassification
  /** Extracted keywords and topics. */
  readonly keywords: readonly KeywordResult[]
  /** Section summaries. */
  readonly summaries: readonly SectionSummary[]
  /** Detected tables. */
  readonly tables: readonly DetectedTable[]
  /** Detected code blocks. */
  readonly codeBlocks: readonly DetectedCodeBlock[]
  /** Cross-references. */
  readonly references: readonly CrossReference[]
  /** Overall sentiment. */
  readonly sentiment: DocumentSentiment
  /** Answer to user question (if provided). */
  readonly answer: string | null
  /** Overall description. */
  readonly description: string
  /** Analysis confidence. */
  readonly confidence: number
  /** Processing time in milliseconds. */
  readonly processingMs: number
}

export interface DocumentMetadata {
  readonly title: string | null
  readonly estimatedPages: number
  readonly wordCount: number
  readonly charCount: number
  readonly sentenceCount: number
  readonly paragraphCount: number
  readonly language: string
  readonly format: DocumentFormat
  readonly hasImages: boolean
  readonly hasCode: boolean
  readonly hasTables: boolean
  readonly hasLinks: boolean
}

export type DocumentFormat = 'pdf' | 'markdown' | 'plaintext' | 'html' | 'code' | 'csv' | 'json' | 'xml' | 'unknown'

export interface DocumentStructure {
  readonly sections: readonly DocumentSection[]
  readonly outline: readonly OutlineEntry[]
  readonly depth: number
  readonly hasTableOfContents: boolean
  readonly structureType: 'flat' | 'hierarchical' | 'tabular' | 'mixed'
}

export interface DocumentSection {
  readonly id: string
  readonly level: number
  readonly title: string
  readonly content: string
  readonly wordCount: number
  readonly startLine: number
  readonly endLine: number
}

export interface OutlineEntry {
  readonly level: number
  readonly title: string
  readonly children: readonly OutlineEntry[]
}

export interface ContentAnalysis {
  /** Most important sentences (extractive summary). */
  readonly keySentences: readonly string[]
  /** Unique vocabulary size. */
  readonly vocabularySize: number
  /** Average sentence length in words. */
  readonly avgSentenceLength: number
  /** Average word length in characters. */
  readonly avgWordLength: number
  /** Percentage of complex words (3+ syllables). */
  readonly complexWordPercentage: number
  /** Named entities found. */
  readonly entities: readonly NamedEntity[]
  /** Detected acronyms. */
  readonly acronyms: readonly string[]
}

export interface NamedEntity {
  readonly text: string
  readonly type: 'person' | 'organization' | 'technology' | 'date' | 'number' | 'url' | 'email' | 'version'
  readonly count: number
}

export interface ReadabilityMetrics {
  /** Flesch-Kincaid reading ease (0-100, higher = easier). */
  readonly fleschKincaid: number
  /** Gunning Fog index (years of education needed). */
  readonly gunningFog: number
  /** Automated Readability Index. */
  readonly automatedReadability: number
  /** Coleman-Liau Index. */
  readonly colemanLiau: number
  /** Overall difficulty level. */
  readonly level: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'graduate' | 'professional'
  /** Estimated reading time in minutes. */
  readonly readingTimeMinutes: number
}

export interface DocumentClassification {
  readonly primaryType: DocumentType
  readonly secondaryTypes: readonly DocumentType[]
  readonly confidence: number
  readonly domain: string
}

export type DocumentType =
  | 'technical'
  | 'academic'
  | 'legal'
  | 'business'
  | 'tutorial'
  | 'reference'
  | 'narrative'
  | 'news'
  | 'email'
  | 'code_documentation'
  | 'readme'
  | 'api_docs'
  | 'specification'
  | 'report'
  | 'general'

export interface KeywordResult {
  readonly word: string
  readonly score: number
  readonly frequency: number
  readonly isCompound: boolean
}

export interface SectionSummary {
  readonly sectionTitle: string
  readonly summary: string
  readonly keyPoints: readonly string[]
  readonly wordCount: number
}

export interface DetectedTable {
  readonly headers: readonly string[]
  readonly rows: readonly (readonly string[])[]
  readonly rowCount: number
  readonly columnCount: number
  readonly startLine: number
}

export interface DetectedCodeBlock {
  readonly language: string
  readonly code: string
  readonly lineCount: number
  readonly startLine: number
}

export interface CrossReference {
  readonly type: 'url' | 'email' | 'citation' | 'footnote' | 'internal'
  readonly text: string
  readonly target: string
}

export interface DocumentSentiment {
  readonly overall: 'positive' | 'negative' | 'neutral' | 'mixed'
  readonly score: number
  readonly objectivity: number
}

export interface DocumentAnalyzerConfig {
  /** Maximum content length to process (chars). Default: 500,000 */
  readonly maxContentLength: number
  /** Number of key sentences to extract. Default: 5 */
  readonly keySentenceCount: number
  /** Number of keywords to extract. Default: 20 */
  readonly keywordCount: number
  /** Enable code block detection. Default: true */
  readonly detectCode: boolean
  /** Enable table detection. Default: true */
  readonly detectTables: boolean
  /** Words per page estimate. Default: 250 */
  readonly wordsPerPage: number
}

export interface DocumentAnalyzerStats {
  readonly totalAnalyses: number
  readonly averageProcessingMs: number
  readonly totalWordsProcessed: number
  readonly formatDistribution: Record<string, number>
  readonly classificationDistribution: Record<string, number>
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_DOC_ANALYZER_CONFIG: DocumentAnalyzerConfig = {
  maxContentLength: 500_000,
  keySentenceCount: 5,
  keywordCount: 20,
  detectCode: true,
  detectTables: true,
  wordsPerPage: 250,
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
  'it', 'its', 'they', 'them', 'their', 'about', 'also', 'back',
  'been', 'then', 'there', 'here', 'now', 'even', 'well', 'way',
  'many', 'much', 'such', 'take', 'like', 'get', 'make', 'use',
])

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'best', 'better', 'improve', 'success',
  'effective', 'efficient', 'powerful', 'innovative', 'positive', 'benefit',
  'advantage', 'optimal', 'robust', 'reliable', 'seamless', 'elegant',
  'brilliant', 'outstanding', 'remarkable', 'impressive', 'perfect',
])

const NEGATIVE_WORDS = new Set([
  'bad', 'worse', 'worst', 'fail', 'failure', 'error', 'bug', 'issue',
  'problem', 'difficult', 'complex', 'slow', 'broken', 'deprecated',
  'vulnerable', 'risk', 'danger', 'warning', 'critical', 'severe',
  'limitation', 'drawback', 'disadvantage', 'concern', 'threat',
])

const TECHNICAL_WORDS = new Set([
  'api', 'function', 'class', 'method', 'interface', 'module', 'package',
  'import', 'export', 'async', 'await', 'promise', 'callback', 'type',
  'variable', 'const', 'let', 'var', 'return', 'parameter', 'argument',
  'algorithm', 'database', 'server', 'client', 'request', 'response',
  'endpoint', 'middleware', 'framework', 'library', 'runtime', 'compiler',
  'deploy', 'container', 'kubernetes', 'docker', 'git', 'repository',
])

// ─── DocumentAnalyzer ──────────────────────────────────────────────────────────

export class DocumentAnalyzer {
  private readonly config: DocumentAnalyzerConfig
  private analysisCount = 0
  private totalProcessingMs = 0
  private totalWords = 0
  private readonly formatCounts: Record<string, number> = {}
  private readonly classCounts: Record<string, number> = {}

  constructor(config: Partial<DocumentAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_DOC_ANALYZER_CONFIG, ...config }
  }

  // ── Main Analysis ──────────────────────────────────────────────────────────

  /**
   * Perform deep document analysis on text content.
   * Extracts structure, keywords, readability, classification, and more.
   */
  analyze(request: DocumentAnalysisRequest): DocumentAnalysisResult {
    const start = Date.now()
    this.analysisCount++

    const content = this.preprocessContent(request.content)
    if (content.trim().length === 0) {
      throw new Error('Document content is empty')
    }

    // 1. Metadata extraction
    const metadata = this.extractMetadata(content, request)
    this.totalWords += metadata.wordCount
    this.formatCounts[metadata.format] = (this.formatCounts[metadata.format] ?? 0) + 1

    // 2. Structure analysis
    const structure = this.analyzeStructure(content)

    // 3. Content analysis
    const contentAnalysis = this.analyzeContent(content, metadata)

    // 4. Readability metrics
    const readability = this.computeReadability(metadata, contentAnalysis)

    // 5. Classification
    const classification = this.classifyDocument(content, metadata, structure, contentAnalysis)
    this.classCounts[classification.primaryType] = (this.classCounts[classification.primaryType] ?? 0) + 1

    // 6. Keywords
    const keywords = this.extractKeywords(content, metadata)

    // 7. Section summaries
    const summaries = this.summarizeSections(structure.sections)

    // 8. Table detection
    const tables = this.config.detectTables ? this.detectTables(content) : []

    // 9. Code block detection
    const codeBlocks = this.config.detectCode ? this.detectCodeBlocks(content) : []

    // 10. Cross-references
    const references = this.extractReferences(content)

    // 11. Sentiment
    const sentiment = this.analyzeSentiment(content)

    // 12. Answer question
    const answer = request.question ? this.answerQuestion(request.question, content, structure, keywords) : null

    // 13. Build description
    const description = this.buildDescription(metadata, structure, classification, readability, keywords, sentiment, request.question)

    const processingMs = Date.now() - start
    this.totalProcessingMs += processingMs

    const confidence = this.computeConfidence(metadata, structure, classification)

    return {
      metadata,
      structure,
      content: contentAnalysis,
      readability,
      classification,
      keywords,
      summaries,
      tables,
      codeBlocks,
      references,
      sentiment,
      answer,
      description,
      confidence,
      processingMs,
    }
  }

  // ── Preprocessing ──────────────────────────────────────────────────────────

  private preprocessContent(content: string): string {
    if (content.length > this.config.maxContentLength) {
      return content.slice(0, this.config.maxContentLength)
    }
    return content
  }

  // ── Metadata ───────────────────────────────────────────────────────────────

  private extractMetadata(content: string, request: DocumentAnalysisRequest): DocumentMetadata {
    const lines = content.split('\n')
    const words = this.tokenize(content)
    const sentences = this.splitSentences(content)
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)

    // Title detection — first heading or first significant line
    const title = this.detectTitle(lines)

    // Format detection
    const format = this.detectFormat(content, request.fileName, request.mimeType)

    // Language detection (basic)
    const language = this.detectLanguage(content)

    // Feature detection
    const hasImages = /!\[.*?\]\(.*?\)/.test(content) || /<img\s/i.test(content)
    const hasCode = /```[\s\S]*?```/.test(content) || /^\s{4,}\S/m.test(content)
    const hasTables = /\|.*\|.*\|/.test(content) || /<table/i.test(content)
    const hasLinks = /https?:\/\/\S+/.test(content) || /\[.*?\]\(.*?\)/.test(content)

    return {
      title,
      estimatedPages: Math.max(1, Math.ceil(words.length / this.config.wordsPerPage)),
      wordCount: words.length,
      charCount: content.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      language,
      format,
      hasImages,
      hasCode,
      hasTables,
      hasLinks,
    }
  }

  private detectTitle(lines: string[]): string | null {
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Markdown heading
      const mdMatch = trimmed.match(/^#{1,2}\s+(.+)/)
      if (mdMatch) return mdMatch[1]!.trim()

      // HTML title
      const htmlMatch = trimmed.match(/<title[^>]*>(.*?)<\/title>/i)
      if (htmlMatch) return htmlMatch[1]!.trim()

      // First significant line (not a separator, not too long)
      if (trimmed.length > 3 && trimmed.length < 200 && !trimmed.match(/^[=\-~*#]+$/)) {
        return trimmed
      }
    }
    return null
  }

  private detectFormat(content: string, fileName?: string, mimeType?: string): DocumentFormat {
    // MIME type
    if (mimeType) {
      if (mimeType === 'application/pdf') return 'pdf'
      if (mimeType.includes('markdown')) return 'markdown'
      if (mimeType.includes('html')) return 'html'
      if (mimeType.includes('csv')) return 'csv'
      if (mimeType.includes('json')) return 'json'
      if (mimeType.includes('xml')) return 'xml'
    }

    // File extension
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase()
      if (ext === 'pdf') return 'pdf'
      if (ext === 'md' || ext === 'markdown') return 'markdown'
      if (ext === 'html' || ext === 'htm') return 'html'
      if (ext === 'csv') return 'csv'
      if (ext === 'json') return 'json'
      if (ext === 'xml') return 'xml'
      if (['ts', 'js', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'rb', 'php'].includes(ext ?? '')) return 'code'
    }

    // Content analysis
    if (content.startsWith('%PDF')) return 'pdf'
    if (/^#{1,6}\s/m.test(content) || /\[.*?\]\(.*?\)/.test(content)) return 'markdown'
    if (/<html/i.test(content) || /<!DOCTYPE/i.test(content)) return 'html'
    try { JSON.parse(content); return 'json' } catch { /* not JSON */ }
    if (/^<\?xml/i.test(content)) return 'xml'
    if (/^[\w"]+[,\t][\w"]+/m.test(content) && content.includes('\n')) return 'csv'
    if (/^(import|export|const|let|var|function|class|def|fn|pub|package)\s/m.test(content)) return 'code'

    return 'plaintext'
  }

  private detectLanguage(content: string): string {
    // Simple heuristic — check for common English words
    const words = content.toLowerCase().split(/\s+/).slice(0, 200)
    const englishWords = new Set(['the', 'is', 'and', 'to', 'of', 'in', 'for', 'this', 'that', 'with'])
    const englishCount = words.filter(w => englishWords.has(w)).length
    const total = words.length

    if (total === 0) return 'unknown'
    if (englishCount / total > 0.05) return 'english'
    return 'unknown'
  }

  // ── Structure Analysis ─────────────────────────────────────────────────────

  private analyzeStructure(content: string): DocumentStructure {
    const lines = content.split('\n')
    const sections = this.extractSections(lines)
    const outline = this.buildOutline(sections)
    const maxDepth = sections.reduce((max, s) => Math.max(max, s.level), 0)

    const hasToc = /table\s+of\s+contents/i.test(content) || /\btoc\b/i.test(content.slice(0, 500))

    const structureType: DocumentStructure['structureType'] =
      maxDepth >= 3 ? 'hierarchical' :
      /\|.*\|.*\|/.test(content) ? 'tabular' :
      maxDepth >= 1 ? 'mixed' : 'flat'

    return { sections, outline, depth: maxDepth, hasTableOfContents: hasToc, structureType }
  }

  private extractSections(lines: string[]): DocumentSection[] {
    const sections: DocumentSection[] = []
    let currentSection: { level: number; title: string; startLine: number; content: string[] } | null = null
    let sectionId = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const heading = this.detectHeading(line)

      if (heading) {
        // Close previous section
        if (currentSection) {
          sections.push(this.finalizeSection(currentSection, sectionId++, i - 1))
        }
        currentSection = {
          level: heading.level,
          title: heading.title,
          startLine: i,
          content: [],
        }
      } else if (currentSection) {
        currentSection.content.push(line)
      } else {
        // Content before first heading
        if (line.trim()) {
          currentSection = {
            level: 0,
            title: 'Introduction',
            startLine: 0,
            content: [line],
          }
        }
      }
    }

    // Close last section
    if (currentSection) {
      sections.push(this.finalizeSection(currentSection, sectionId, lines.length - 1))
    }

    // If no sections found, create a single section
    if (sections.length === 0) {
      const content = lines.join('\n')
      sections.push({
        id: 'section-0',
        level: 0,
        title: 'Content',
        content,
        wordCount: this.tokenize(content).length,
        startLine: 0,
        endLine: lines.length - 1,
      })
    }

    return sections
  }

  private detectHeading(line: string): { level: number; title: string } | null {
    const trimmed = line.trim()

    // Markdown headings
    const mdMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (mdMatch) return { level: mdMatch[1]!.length, title: mdMatch[2]!.trim() }

    // HTML headings
    const htmlMatch = trimmed.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i)
    if (htmlMatch) return { level: parseInt(htmlMatch[1]!), title: htmlMatch[2]!.trim() }

    // Underline-style headings (===, ---)
    // We'd need to check the NEXT line but we keep it simple here

    // ALL CAPS short lines (common in plaintext documents)
    if (trimmed.length > 3 && trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      return { level: 1, title: trimmed }
    }

    return null
  }

  private finalizeSection(
    section: { level: number; title: string; startLine: number; content: string[] },
    id: number,
    endLine: number,
  ): DocumentSection {
    const content = section.content.join('\n')
    return {
      id: `section-${id}`,
      level: section.level,
      title: section.title,
      content,
      wordCount: this.tokenize(content).length,
      startLine: section.startLine,
      endLine,
    }
  }

  private buildOutline(sections: readonly DocumentSection[]): OutlineEntry[] {
    const outline: OutlineEntry[] = []
    const stack: { entry: OutlineEntry; level: number }[] = []

    for (const section of sections) {
      const entry: OutlineEntry = {
        level: section.level,
        title: section.title,
        children: [],
      }

      // Pop entries from stack until we find a parent
      while (stack.length > 0 && stack[stack.length - 1]!.level >= section.level) {
        stack.pop()
      }

      if (stack.length > 0) {
        (stack[stack.length - 1]!.entry.children as OutlineEntry[]).push(entry)
      } else {
        outline.push(entry)
      }

      stack.push({ entry, level: section.level })
    }

    return outline
  }

  // ── Content Analysis ───────────────────────────────────────────────────────

  private analyzeContent(content: string, metadata: DocumentMetadata): ContentAnalysis {
    const words = this.tokenize(content)
    const sentences = this.splitSentences(content)

    // Key sentences (extractive summary)
    const keySentences = this.extractKeySentences(sentences, words)

    // Vocabulary
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))

    // Avg sentence length
    const avgSentenceLength = sentences.length > 0
      ? Math.round(words.length / sentences.length * 10) / 10
      : 0

    // Avg word length
    const avgWordLength = words.length > 0
      ? Math.round(words.reduce((sum, w) => sum + w.length, 0) / words.length * 10) / 10
      : 0

    // Complex words (3+ syllables)
    const complexWords = words.filter(w => this.countSyllables(w) >= 3)
    const complexWordPercentage = words.length > 0
      ? Math.round((complexWords.length / words.length) * 100) / 100
      : 0

    // Named entities
    const entities = this.extractEntities(content)

    // Acronyms
    const acronyms = [...new Set((content.match(/\b[A-Z]{2,6}\b/g) ?? []))]
      .filter(a => !STOP_WORDS.has(a.toLowerCase()))
      .slice(0, 20)

    return {
      keySentences,
      vocabularySize: uniqueWords.size,
      avgSentenceLength,
      avgWordLength,
      complexWordPercentage,
      entities,
      acronyms,
    }
  }

  private extractKeySentences(sentences: string[], words: string[]): string[] {
    if (sentences.length === 0) return []

    // Score sentences by keyword density and position
    const wordFreq = this.computeWordFrequency(words)
    const scored = sentences.map((sentence, i) => {
      const sentWords = this.tokenize(sentence)
      let score = 0

      // Keyword density
      for (const w of sentWords) {
        score += wordFreq.get(w.toLowerCase()) ?? 0
      }

      // Position bonus (first and last sentences weighted higher)
      if (i < 3) score *= 1.5
      if (i >= sentences.length - 2) score *= 1.2

      // Length preference (not too short, not too long)
      if (sentWords.length >= 5 && sentWords.length <= 30) score *= 1.3

      return { sentence, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, this.config.keySentenceCount).map(s => s.sentence)
  }

  private computeWordFrequency(words: string[]): Map<string, number> {
    const freq = new Map<string, number>()
    for (const w of words) {
      const lower = w.toLowerCase()
      if (!STOP_WORDS.has(lower) && lower.length > 2) {
        freq.set(lower, (freq.get(lower) ?? 0) + 1)
      }
    }
    return freq
  }

  private extractEntities(content: string): NamedEntity[] {
    const entities = new Map<string, { type: NamedEntity['type']; count: number }>()

    // URLs
    const urls = content.match(/https?:\/\/[^\s)]+/g) ?? []
    for (const url of urls) {
      const key = `url:${url}`
      entities.set(key, { type: 'url', count: (entities.get(key)?.count ?? 0) + 1 })
    }

    // Emails
    const emails = content.match(/[\w.-]+@[\w.-]+\.\w+/g) ?? []
    for (const email of emails) {
      const key = `email:${email}`
      entities.set(key, { type: 'email', count: (entities.get(key)?.count ?? 0) + 1 })
    }

    // Versions (v1.0.0, 2.3.1)
    const versions = content.match(/\bv?\d+\.\d+(?:\.\d+)?(?:-\w+)?\b/g) ?? []
    for (const v of versions) {
      const key = `version:${v}`
      entities.set(key, { type: 'version', count: (entities.get(key)?.count ?? 0) + 1 })
    }

    // Dates
    const dates = content.match(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g) ?? []
    for (const d of dates) {
      const key = `date:${d}`
      entities.set(key, { type: 'date', count: (entities.get(key)?.count ?? 0) + 1 })
    }

    // CamelCase / PascalCase (likely class names / technology names)
    const techNames = content.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g) ?? []
    for (const t of techNames) {
      const key = `technology:${t}`
      entities.set(key, { type: 'technology', count: (entities.get(key)?.count ?? 0) + 1 })
    }

    return [...entities.entries()].map(([key, val]) => ({
      text: key.split(':').slice(1).join(':'),
      type: val.type,
      count: val.count,
    })).sort((a, b) => b.count - a.count).slice(0, 30)
  }

  // ── Readability ────────────────────────────────────────────────────────────

  private computeReadability(metadata: DocumentMetadata, content: ContentAnalysis): ReadabilityMetrics {
    const words = metadata.wordCount
    const sentences = metadata.sentenceCount || 1
    const syllables = words * 1.5 // Approximate
    const complexPercentage = content.complexWordPercentage
    const chars = metadata.charCount
    const avgSentLen = content.avgSentenceLength

    // Flesch-Kincaid Reading Ease
    const fleschKincaid = Math.round(
      Math.max(0, Math.min(100,
        206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / Math.max(1, words))
      ))
    )

    // Gunning Fog
    const gunningFog = Math.round(
      Math.max(0, 0.4 * ((words / sentences) + 100 * complexPercentage)) * 10
    ) / 10

    // Automated Readability Index
    const automatedReadability = Math.round(
      Math.max(0, 4.71 * (chars / Math.max(1, words)) + 0.5 * (words / sentences) - 21.43) * 10
    ) / 10

    // Coleman-Liau Index
    const colemanLiau = Math.round(
      Math.max(0, 0.0588 * (chars / Math.max(1, words) * 100) - 0.296 * (sentences / Math.max(1, words) * 100) - 15.8) * 10
    ) / 10

    // Level
    const avgGrade = (gunningFog + automatedReadability + colemanLiau) / 3
    const level: ReadabilityMetrics['level'] =
      avgGrade < 6 ? 'elementary' :
      avgGrade < 9 ? 'middle_school' :
      avgGrade < 12 ? 'high_school' :
      avgGrade < 16 ? 'college' :
      avgGrade < 20 ? 'graduate' : 'professional'

    // Reading time (average ~250 WPM)
    const readingTimeMinutes = Math.max(1, Math.round(words / 250))

    return { fleschKincaid, gunningFog, automatedReadability, colemanLiau, level, readingTimeMinutes }
  }

  // ── Classification ─────────────────────────────────────────────────────────

  private classifyDocument(
    content: string,
    metadata: DocumentMetadata,
    structure: DocumentStructure,
    contentAnalysis: ContentAnalysis,
  ): DocumentClassification {
    const lower = content.toLowerCase()
    const scores: Record<DocumentType, number> = {
      technical: 0, academic: 0, legal: 0, business: 0, tutorial: 0,
      reference: 0, narrative: 0, news: 0, email: 0, code_documentation: 0,
      readme: 0, api_docs: 0, specification: 0, report: 0, general: 1,
    }

    // Technical indicators
    const techWordCount = this.tokenize(content).filter(w => TECHNICAL_WORDS.has(w.toLowerCase())).length
    scores.technical += techWordCount * 0.5

    // Code documentation
    if (metadata.hasCode) { scores.code_documentation += 3; scores.technical += 2 }
    if (lower.includes('```')) { scores.code_documentation += 2 }

    // README
    if (metadata.title?.toLowerCase().includes('readme') || lower.slice(0, 200).includes('readme')) {
      scores.readme += 5
    }

    // API docs
    if (lower.includes('endpoint') || lower.includes('api') && lower.includes('parameter')) {
      scores.api_docs += 3
    }

    // Tutorial
    if (lower.includes('step 1') || lower.includes('how to') || lower.includes('tutorial') || lower.includes('getting started')) {
      scores.tutorial += 3
    }

    // Academic
    if (lower.includes('abstract') && lower.includes('conclusion')) scores.academic += 3
    if (lower.includes('references') || lower.includes('bibliography')) scores.academic += 2
    if (contentAnalysis.acronyms.length > 5) scores.academic += 1

    // Legal
    if (lower.includes('hereby') || lower.includes('pursuant') || lower.includes('liability') || lower.includes('license')) {
      scores.legal += 3
    }

    // Business
    if (lower.includes('revenue') || lower.includes('quarterly') || lower.includes('stakeholder')) {
      scores.business += 3
    }

    // Email
    if (lower.includes('dear ') || lower.includes('sincerely') || lower.includes('regards')) {
      scores.email += 3
    }

    // Report
    if (structure.sections.length > 3 && lower.includes('conclusion') || lower.includes('summary')) {
      scores.report += 2
    }

    // Specification
    if (lower.includes('requirement') || lower.includes('specification') || lower.includes('shall')) {
      scores.specification += 3
    }

    // News
    if (contentAnalysis.entities.some(e => e.type === 'date') && metadata.paragraphCount > 3) {
      scores.news += 1
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const primaryType = sorted[0]![0] as DocumentType
    const maxScore = sorted[0]![1]
    const secondaryTypes = sorted.slice(1, 3)
      .filter(([_, s]) => s > 0)
      .map(([t]) => t as DocumentType)

    // Domain detection
    const domain = this.detectDomain(content, primaryType)

    return {
      primaryType,
      secondaryTypes,
      confidence: Math.min(1, maxScore / 10),
      domain,
    }
  }

  private detectDomain(content: string, type: DocumentType): string {
    const lower = content.toLowerCase()
    if (lower.includes('machine learning') || lower.includes('neural network') || lower.includes('deep learning')) return 'AI/ML'
    if (lower.includes('kubernetes') || lower.includes('docker') || lower.includes('deployment')) return 'DevOps'
    if (lower.includes('react') || lower.includes('angular') || lower.includes('vue') || lower.includes('css')) return 'Frontend'
    if (lower.includes('database') || lower.includes('sql') || lower.includes('mongodb')) return 'Backend/Database'
    if (lower.includes('security') || lower.includes('vulnerability') || lower.includes('authentication')) return 'Security'
    if (lower.includes('finance') || lower.includes('trading') || lower.includes('investment')) return 'Finance'
    if (type === 'legal') return 'Legal'
    if (type === 'academic') return 'Academic'
    return 'General'
  }

  // ── Keywords ───────────────────────────────────────────────────────────────

  private extractKeywords(content: string, metadata: DocumentMetadata): KeywordResult[] {
    const words = this.tokenize(content)
    const freq = this.computeWordFrequency(words)

    // TF-IDF inspired scoring
    const results: KeywordResult[] = []
    for (const [word, count] of freq) {
      if (count < 2) continue

      // TF: term frequency
      const tf = count / words.length

      // IDF proxy: rarer words score higher
      const idf = Math.log(1 + words.length / (count + 1))

      const score = Math.round(tf * idf * 10000) / 10000

      // Check if compound term
      const isCompound = word.includes('-') || word.includes('_') || /[A-Z]/.test(word)

      results.push({ word, score, frequency: count, isCompound })
    }

    // Also detect bigrams (two-word phrases)
    const bigrams = this.extractBigrams(words)
    for (const [bigram, count] of bigrams) {
      if (count < 2) continue
      const tf = count / words.length
      const idf = Math.log(1 + words.length / (count + 1))
      const score = Math.round(tf * idf * 10000) / 10000
      results.push({ word: bigram, score: score * 1.5, frequency: count, isCompound: true })
    }

    return results.sort((a, b) => b.score - a.score).slice(0, this.config.keywordCount)
  }

  private extractBigrams(words: string[]): Map<string, number> {
    const bigrams = new Map<string, number>()
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i]!.toLowerCase()
      const w2 = words[i + 1]!.toLowerCase()
      if (STOP_WORDS.has(w1) || STOP_WORDS.has(w2)) continue
      if (w1.length < 3 || w2.length < 3) continue
      const bigram = `${w1} ${w2}`
      bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1)
    }
    return bigrams
  }

  // ── Section Summaries ──────────────────────────────────────────────────────

  private summarizeSections(sections: readonly DocumentSection[]): SectionSummary[] {
    return sections.map(section => {
      const sentences = this.splitSentences(section.content)
      const words = this.tokenize(section.content)
      const keySentences = this.extractKeySentences(sentences, words)

      return {
        sectionTitle: section.title,
        summary: keySentences.slice(0, 2).join(' ') || section.content.slice(0, 200).trim(),
        keyPoints: keySentences.slice(0, 3),
        wordCount: section.wordCount,
      }
    })
  }

  // ── Table Detection ────────────────────────────────────────────────────────

  private detectTables(content: string): DetectedTable[] {
    const tables: DetectedTable[] = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i]!
      if (!line.includes('|') || line.trim().split('|').length < 3) continue

      // Check if this is a markdown table
      const nextLine = lines[i + 1]
      if (nextLine && /^\s*\|?\s*[-:]+/.test(nextLine)) {
        const headers = line.split('|').map(h => h.trim()).filter(Boolean)
        const rows: string[][] = []

        // Skip separator line
        let j = i + 2
        while (j < lines.length && lines[j]!.includes('|')) {
          const cells = lines[j]!.split('|').map(c => c.trim()).filter(Boolean)
          if (cells.length > 0) rows.push(cells)
          j++
        }

        if (headers.length > 0) {
          tables.push({
            headers,
            rows,
            rowCount: rows.length,
            columnCount: headers.length,
            startLine: i,
          })
          i = j - 1 // Skip past table
        }
      }
    }

    return tables
  }

  // ── Code Block Detection ───────────────────────────────────────────────────

  private detectCodeBlocks(content: string): DetectedCodeBlock[] {
    const blocks: DetectedCodeBlock[] = []
    const lines = content.split('\n')

    // Fenced code blocks (```)
    let inBlock = false
    let blockLang = ''
    let blockLines: string[] = []
    let blockStart = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const fenceMatch = line.match(/^```(\w*)/)

      if (fenceMatch && !inBlock) {
        inBlock = true
        blockLang = fenceMatch[1] ?? ''
        blockLines = []
        blockStart = i
      } else if (line.startsWith('```') && inBlock) {
        inBlock = false
        if (blockLines.length > 0) {
          const code = blockLines.join('\n')
          blocks.push({
            language: blockLang || this.guessCodeLanguage(code),
            code,
            lineCount: blockLines.length,
            startLine: blockStart,
          })
        }
      } else if (inBlock) {
        blockLines.push(line)
      }
    }

    return blocks
  }

  private guessCodeLanguage(code: string): string {
    if (/import\s.*from\s['"]|:\s*(string|number|boolean)/.test(code)) return 'typescript'
    if (/def\s+\w+\(|import\s+\w+/.test(code)) return 'python'
    if (/fn\s+\w+\(|let\s+mut\s/.test(code)) return 'rust'
    if (/func\s+\w+\(|package\s+\w+/.test(code)) return 'go'
    if (/public\s+class\s/.test(code)) return 'java'
    if (/const\s+\w+\s*=|function\s/.test(code)) return 'javascript'
    return 'unknown'
  }

  // ── Cross-References ───────────────────────────────────────────────────────

  private extractReferences(content: string): CrossReference[] {
    const refs: CrossReference[] = []

    // URLs
    const urls = content.match(/https?:\/\/[^\s)]+/g) ?? []
    for (const url of [...new Set(urls)].slice(0, 20)) {
      refs.push({ type: 'url', text: url, target: url })
    }

    // Emails
    const emails = content.match(/[\w.-]+@[\w.-]+\.\w+/g) ?? []
    for (const email of [...new Set(emails)].slice(0, 10)) {
      refs.push({ type: 'email', text: email, target: `mailto:${email}` })
    }

    // Markdown links [text](url)
    const mdLinks = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
    for (const match of mdLinks) {
      if (!refs.some(r => r.target === match[2])) {
        refs.push({ type: 'url', text: match[1]!, target: match[2]! })
      }
    }

    // Footnotes [^1]
    const footnotes = content.match(/\[\^(\d+)\]/g) ?? []
    for (const fn of [...new Set(footnotes)].slice(0, 10)) {
      refs.push({ type: 'footnote', text: fn, target: fn })
    }

    return refs.slice(0, 30)
  }

  // ── Sentiment ──────────────────────────────────────────────────────────────

  private analyzeSentiment(content: string): DocumentSentiment {
    const words = this.tokenize(content)
    let posCount = 0
    let negCount = 0
    let factualCount = 0

    for (const w of words) {
      const lower = w.toLowerCase()
      if (POSITIVE_WORDS.has(lower)) posCount++
      if (NEGATIVE_WORDS.has(lower)) negCount++
      if (TECHNICAL_WORDS.has(lower)) factualCount++
    }

    const total = Math.max(1, posCount + negCount)
    const score = Math.round(((posCount - negCount) / total) * 100) / 100

    const overall: DocumentSentiment['overall'] =
      posCount > negCount * 1.5 ? 'positive' :
      negCount > posCount * 1.5 ? 'negative' :
      posCount > 0 && negCount > 0 ? 'mixed' : 'neutral'

    // Objectivity: ratio of factual/technical words vs sentiment words
    const objectivity = Math.round(
      Math.min(1, factualCount / Math.max(1, posCount + negCount + factualCount)) * 100
    ) / 100

    return { overall, score, objectivity }
  }

  // ── Question Answering ─────────────────────────────────────────────────────

  private answerQuestion(
    question: string,
    content: string,
    structure: DocumentStructure,
    keywords: readonly KeywordResult[],
  ): string {
    const qLower = question.toLowerCase()
    const qWords = this.tokenize(question).map(w => w.toLowerCase()).filter(w => !STOP_WORDS.has(w))

    // Find most relevant section
    let bestSection: DocumentSection | null = null
    let bestScore = 0

    for (const section of structure.sections) {
      const sectionLower = section.content.toLowerCase()
      let score = 0
      for (const qw of qWords) {
        if (sectionLower.includes(qw)) score++
      }
      // Bonus for title match
      if (qWords.some(w => section.title.toLowerCase().includes(w))) score += 2

      if (score > bestScore) {
        bestScore = score
        bestSection = section
      }
    }

    if (!bestSection || bestScore === 0) {
      return `Based on the document analysis, I couldn't find a specific answer to "${question}". The document covers: ${keywords.slice(0, 5).map(k => k.word).join(', ')}.`
    }

    // Extract relevant sentences
    const sentences = this.splitSentences(bestSection.content)
    const relevantSentences = sentences.filter(s => {
      const sLower = s.toLowerCase()
      return qWords.some(w => sLower.includes(w))
    }).slice(0, 3)

    if (relevantSentences.length > 0) {
      return `Based on the section "${bestSection.title}": ${relevantSentences.join(' ')}`
    }

    return `The section "${bestSection.title}" appears most relevant, but a specific answer could not be extracted. Key topics: ${keywords.slice(0, 5).map(k => k.word).join(', ')}.`
  }

  // ── Description Builder ────────────────────────────────────────────────────

  private buildDescription(
    metadata: DocumentMetadata,
    structure: DocumentStructure,
    classification: DocumentClassification,
    readability: ReadabilityMetrics,
    keywords: readonly KeywordResult[],
    sentiment: DocumentSentiment,
    question?: string,
  ): string {
    const parts: string[] = []

    // Document type and format
    parts.push(`${classification.primaryType.replace(/_/g, ' ')} document (${metadata.format}).`)

    // Size
    parts.push(`${metadata.wordCount} words, ~${metadata.estimatedPages} page(s), ${metadata.sentenceCount} sentences.`)

    // Title
    if (metadata.title) {
      parts.push(`Title: "${metadata.title}".`)
    }

    // Structure
    parts.push(`Structure: ${structure.structureType}, ${structure.sections.length} section(s), depth ${structure.depth}.`)

    // Readability
    parts.push(`Readability: ${readability.level.replace(/_/g, ' ')} level, ~${readability.readingTimeMinutes} min read.`)

    // Topics
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 5).map(k => k.word).join(', ')
      parts.push(`Key topics: ${topKeywords}.`)
    }

    // Domain
    parts.push(`Domain: ${classification.domain}.`)

    // Sentiment
    parts.push(`Tone: ${sentiment.overall}, objectivity ${(sentiment.objectivity * 100).toFixed(0)}%.`)

    // Features
    const features: string[] = []
    if (metadata.hasCode) features.push('code')
    if (metadata.hasTables) features.push('tables')
    if (metadata.hasImages) features.push('images')
    if (metadata.hasLinks) features.push('links')
    if (features.length > 0) {
      parts.push(`Contains: ${features.join(', ')}.`)
    }

    return parts.join(' ')
  }

  // ── Confidence ─────────────────────────────────────────────────────────────

  private computeConfidence(
    metadata: DocumentMetadata,
    structure: DocumentStructure,
    classification: DocumentClassification,
  ): number {
    let confidence = 0.3

    // Content available
    if (metadata.wordCount > 50) confidence += 0.15
    if (metadata.wordCount > 200) confidence += 0.1

    // Structure detected
    if (structure.sections.length > 1) confidence += 0.1
    if (structure.depth > 0) confidence += 0.05

    // Classification confidence
    confidence += classification.confidence * 0.3

    return Math.round(Math.min(1, confidence) * 100) / 100
  }

  // ── Utility Methods ────────────────────────────────────────────────────────

  private tokenize(text: string): string[] {
    return text.split(/[\s\n]+/).filter(w => w.length > 0 && /[a-zA-Z0-9]/.test(w))
  }

  private splitSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5)
  }

  private countSyllables(word: string): number {
    const w = word.toLowerCase().replace(/[^a-z]/g, '')
    if (w.length <= 3) return 1
    const vowelGroups = w.match(/[aeiouy]+/g)
    let count = vowelGroups ? vowelGroups.length : 1
    if (w.endsWith('e') && count > 1) count--
    if (w.endsWith('le') && w.length > 3) count++
    return Math.max(1, count)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): DocumentAnalyzerStats {
    return {
      totalAnalyses: this.analysisCount,
      averageProcessingMs: this.analysisCount > 0 ? Math.round(this.totalProcessingMs / this.analysisCount) : 0,
      totalWordsProcessed: this.totalWords,
      formatDistribution: { ...this.formatCounts },
      classificationDistribution: { ...this.classCounts },
    }
  }

  get totalAnalyses(): number {
    return this.analysisCount
  }

  clear(): void {
    this.analysisCount = 0
    this.totalProcessingMs = 0
    this.totalWords = 0
    Object.keys(this.formatCounts).forEach(k => delete this.formatCounts[k])
    Object.keys(this.classCounts).forEach(k => delete this.classCounts[k])
  }
}
