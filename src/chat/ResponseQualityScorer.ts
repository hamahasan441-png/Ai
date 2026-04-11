/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Response Quality Scorer — Self-Evaluate Response Quality                    ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Relevance Scoring — Measure query-response alignment                   ║
 * ║    ✦ Completeness Check — Verify all aspects addressed                       ║
 * ║    ✦ Clarity Assessment — Check readability                                  ║
 * ║    ✦ Formatting Check — Verify proper markdown/code formatting               ║
 * ║    ✦ Improvement Suggestions — Actionable quality improvements               ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface QualityScore {
  overall: number
  relevance: number
  completeness: number
  clarity: number
  accuracy: number
  formatting: number
  flags: string[]
}

export interface QualitySuggestion {
  type: 'improve_relevance' | 'add_detail' | 'simplify' | 'add_code' | 'add_example'
  description: string
  priority: number
}

// ── ResponseQualityScorer Class ──────────────────────────────────────────────

export class ResponseQualityScorer {
  private scoreCount = 0
  private avgScore = 0

  constructor() {
    // No external dependencies
  }

  /**
   * Score response quality relative to query
   */
  score(query: string, response: string): QualityScore {
    this.scoreCount++

    const flags: string[] = []

    const relevance = this.scoreRelevance(query, response, flags)
    const completeness = this.scoreCompleteness(query, response, flags)
    const clarity = this.scoreClarity(response, flags)
    const accuracy = this.scoreAccuracy(response, flags)
    const formatting = this.scoreFormatting(query, response, flags)

    const overall =
      relevance * 0.3 + completeness * 0.25 + clarity * 0.2 + accuracy * 0.15 + formatting * 0.1

    // Update running average
    this.avgScore = (this.avgScore * (this.scoreCount - 1) + overall) / this.scoreCount

    return { overall, relevance, completeness, clarity, accuracy, formatting, flags }
  }

  /**
   * Generate improvement suggestions
   */
  suggest(qualityScore: QualityScore): QualitySuggestion[] {
    const suggestions: QualitySuggestion[] = []

    if (qualityScore.relevance < 0.5) {
      suggestions.push({
        type: 'improve_relevance',
        description: 'Response may not directly address the query. Consider refocusing.',
        priority: 1,
      })
    }

    if (qualityScore.completeness < 0.5) {
      suggestions.push({
        type: 'add_detail',
        description: 'Response may be incomplete. Consider addressing all aspects of the query.',
        priority: 2,
      })
    }

    if (qualityScore.clarity < 0.5) {
      suggestions.push({
        type: 'simplify',
        description: 'Response may be unclear. Consider simplifying language.',
        priority: 3,
      })
    }

    if (qualityScore.formatting < 0.5 && qualityScore.flags.includes('code_without_blocks')) {
      suggestions.push({
        type: 'add_code',
        description: 'Code-like content detected without proper formatting. Use code blocks.',
        priority: 4,
      })
    }

    if (qualityScore.completeness < 0.7) {
      suggestions.push({
        type: 'add_example',
        description: 'Adding an example could improve understanding.',
        priority: 5,
      })
    }

    return suggestions.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Score relevance: keyword overlap between query and response
   */
  private scoreRelevance(query: string, response: string, flags: string[]): number {
    const queryWords = this.getSignificantWords(query)
    const responseWords = new Set(this.getSignificantWords(response))

    if (queryWords.length === 0) return 0.5

    let matches = 0
    for (const word of queryWords) {
      if (responseWords.has(word)) matches++
    }

    const score = matches / queryWords.length
    if (score < 0.2) flags.push('low_relevance')
    return Math.min(1, score * 1.5) // amplify slightly
  }

  /**
   * Score completeness: does response address query fully
   */
  private scoreCompleteness(query: string, response: string, flags: string[]): number {
    let score = 0.5

    // Length-based heuristic
    const queryWords = query.split(/\s+/).length
    const responseWords = response.split(/\s+/).length
    const ratio = responseWords / Math.max(queryWords, 1)

    if (ratio > 3) score += 0.2 // response is substantially longer than query
    if (ratio > 8) score += 0.1

    // Check if question words are addressed
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'which']
    const hasQuestion = questionWords.some(qw => query.toLowerCase().includes(qw))
    if (hasQuestion && responseWords > 20) score += 0.15

    // Multiple aspects
    const sentences = response.split(/[.!]+/).filter(s => s.trim().length > 10)
    if (sentences.length >= 3) score += 0.1

    if (score < 0.4) flags.push('incomplete_response')
    return Math.min(1, score)
  }

  /**
   * Score clarity: readability and structure
   */
  private scoreClarity(response: string, flags: string[]): number {
    let score = 0.6

    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length === 0) return 0.2

    // Average sentence length
    const avgLen = sentences.reduce((s, sent) => s + sent.split(/\s+/).length, 0) / sentences.length
    if (avgLen > 30) {
      score -= 0.2
      flags.push('long_sentences')
    }
    if (avgLen >= 8 && avgLen <= 20) score += 0.2

    // Has structure (lists, headers)
    if (/^[-*•]\s/m.test(response)) score += 0.1 // bullet lists
    if (/^#+\s/m.test(response)) score += 0.1 // headers
    if (/\*\*[^*]+\*\*/.test(response)) score += 0.05 // bold text

    return Math.min(1, score)
  }

  /**
   * Score accuracy: check for hedging language
   */
  private scoreAccuracy(response: string, flags: string[]): number {
    let score = 0.7

    // Hedging indicators reduce confidence
    const hedgingPatterns = [
      /\bmaybe\b/gi,
      /\bperhaps\b/gi,
      /\bi think\b/gi,
      /\bprobably\b/gi,
      /\bnot sure\b/gi,
      /\bmight be\b/gi,
      /\bcould be\b/gi,
      /\bpossibly\b/gi,
    ]

    let hedgingCount = 0
    for (const pattern of hedgingPatterns) {
      const matches = response.match(pattern)
      if (matches) hedgingCount += matches.length
    }

    if (hedgingCount > 3) {
      score -= 0.3
      flags.push('excessive_hedging')
    } else if (hedgingCount > 1) {
      score -= 0.1
    }

    return Math.min(1, Math.max(0, score))
  }

  /**
   * Score formatting: proper code blocks, lists
   */
  private scoreFormatting(query: string, response: string, flags: string[]): number {
    let score = 0.6

    // Check if code is properly formatted
    const hasCodeKeywords = /\b(function|class|const|let|var|def|import)\b/.test(response)
    const hasCodeBlocks = /```/.test(response)

    if (hasCodeKeywords && !hasCodeBlocks) {
      score -= 0.3
      flags.push('code_without_blocks')
    }
    if (hasCodeBlocks) score += 0.2

    // Check for proper list formatting when enumerating
    const isListQuery = /\b(list|what are|types of|options|features)\b/i.test(query)
    const hasLists = /^[-*•\d]+[.)]\s/m.test(response)
    if (isListQuery && hasLists) score += 0.2
    if (isListQuery && !hasLists && response.split(/[,;]/).length > 3) {
      score -= 0.1
      flags.push('list_not_formatted')
    }

    return Math.min(1, score)
  }

  /**
   * Get significant words (filter stop words)
   */
  private getSignificantWords(text: string): string[] {
    const stopWords = new Set([
      'the',
      'is',
      'are',
      'was',
      'were',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'this',
      'that',
      'it',
      'not',
      'be',
      'has',
      'have',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'can',
      'may',
      'what',
      'how',
      'why',
      'when',
      'where',
      'which',
      'who',
      'i',
      'me',
      'you',
      'we',
      'they',
      'my',
      'your',
      'our',
      'their',
      'its',
    ])

    return text
      .toLowerCase()
      .split(/[\s,.:;!?()[\]{}]+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  }

  /**
   * Get statistics
   */
  getStats(): { scoreCount: number; avgScore: number } {
    return {
      scoreCount: this.scoreCount,
      avgScore: Math.round(this.avgScore * 100) / 100,
    }
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      scoreCount: this.scoreCount,
      avgScore: this.avgScore,
    })
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): ResponseQualityScorer {
    const parsed = JSON.parse(data)
    const scorer = new ResponseQualityScorer()
    scorer.scoreCount = parsed.scoreCount || 0
    scorer.avgScore = parsed.avgScore || 0
    return scorer
  }
}
