/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Query Decomposer — Break Complex Questions Into Sub-Questions              ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Complexity Detection — Identify multi-part questions                    ║
 * ║    ✦ Strategy Selection — comparison, sequential, multi-aspect, conditional  ║
 * ║    ✦ Sub-question Generation — Break into focused sub-queries               ║
 * ║    ✦ Answer Synthesis — Combine sub-answers into coherent response           ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type DecompositionStrategy =
  | 'comparison'
  | 'sequential'
  | 'multi-aspect'
  | 'conditional'
  | 'simple'

export interface SubQuestion {
  id: number
  question: string
  type: 'factual' | 'comparative' | 'evaluative' | 'procedural'
  dependsOn: number[]
  priority: number
}

export interface DecompositionResult {
  originalQuery: string
  isComplex: boolean
  subQuestions: SubQuestion[]
  strategy: DecompositionStrategy
  confidence: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const COMPARISON_PATTERNS = [
  /\bvs\.?\b/i,
  /\bversus\b/i,
  /\bcompare\b/i,
  /\bcomparison\b/i,
  /\bdifference(?:s)?\s+between\b/i,
  /\bcompared\s+to\b/i,
  /\bwhich\s+is\s+(better|faster|best|worse|more|less)\b/i,
  /\bpros\s+and\s+cons\b/i,
  /\badvantages\s+and\s+disadvantages\b/i,
]

const SEQUENTIAL_PATTERNS = [
  /\bhow\s+to\b/i,
  /\bstep\s+by\s+step\b/i,
  /\bsteps\s+to\b/i,
  /\bprocess\s+for\b/i,
  /\bguide\s+(to|for)\b/i,
  /\btutorial\b/i,
  /\bfirst.+then\b/i,
  /\band\s+then\b/i,
]

const CONDITIONAL_PATTERNS = [
  /\bshould\s+i\s+use\b/i,
  /\bwhen\s+should\b/i,
  /\bif\s+.+\s+then\b/i,
  /\bwhat\s+if\b/i,
  /\bwhich\s+should\b/i,
  /\bbest\s+(for|when)\b/i,
]

const MULTI_ASPECT_PATTERNS = [
  /\btell\s+me\s+about\b/i,
  /\bexplain\b/i,
  /\bdescribe\b/i,
  /\bwhat\s+(is|are)\b/i,
  /\beverything\s+about\b/i,
  /\boverview\s+of\b/i,
]

const COMPLEXITY_MARKERS = [
  /\band\b/gi,
  /\balso\b/gi,
  /\badditionally\b/gi,
  /\bmoreover\b/gi,
  /\bfurthermore\b/gi,
  /,/g,
  /\?.*\?/, // multiple question marks
]

// ── QueryDecomposer Class ────────────────────────────────────────────────────

export class QueryDecomposer {
  private decomposeCount = 0
  private complexCount = 0
  private strategyCounts: Record<string, number> = {}

  constructor() {
    this.strategyCounts = {}
  }

  /**
   * Check if a query is complex enough to decompose
   */
  isComplex(query: string): boolean {
    if (!query || query.trim().length < 20) return false

    let complexityScore = 0

    // Word count
    const words = query.split(/\s+/).length
    if (words > 15) complexityScore += 1
    if (words > 25) complexityScore += 1

    // Complexity markers
    for (const pattern of COMPLEXITY_MARKERS) {
      if (pattern.test(query)) complexityScore += 0.5
    }

    // Multiple sentence/question detection
    const sentences = query.split(/[.!?]+/).filter(s => s.trim().length > 5)
    if (sentences.length > 1) complexityScore += 1

    // Pattern detection
    if (COMPARISON_PATTERNS.some(p => p.test(query))) complexityScore += 1
    if (SEQUENTIAL_PATTERNS.some(p => p.test(query))) complexityScore += 0.5
    if (CONDITIONAL_PATTERNS.some(p => p.test(query))) complexityScore += 1

    return complexityScore >= 1.5
  }

  /**
   * Decompose a complex query into sub-questions
   */
  decompose(query: string): DecompositionResult {
    this.decomposeCount++

    if (!query || query.trim().length === 0) {
      return {
        originalQuery: query,
        isComplex: false,
        subQuestions: [this.makeSubQuestion(0, query || '', 'factual')],
        strategy: 'simple',
        confidence: 0.1,
      }
    }

    const trimmed = query.trim()
    const complex = this.isComplex(trimmed)

    if (!complex) {
      return {
        originalQuery: trimmed,
        isComplex: false,
        subQuestions: [this.makeSubQuestion(0, trimmed, 'factual')],
        strategy: 'simple',
        confidence: 0.8,
      }
    }

    this.complexCount++

    // Detect strategy
    const strategy = this.detectStrategy(trimmed)
    this.strategyCounts[strategy] = (this.strategyCounts[strategy] || 0) + 1

    // Generate sub-questions based on strategy
    let subQuestions: SubQuestion[]
    let confidence: number

    switch (strategy) {
      case 'comparison':
        ;({ subQuestions, confidence } = this.decomposeComparison(trimmed))
        break
      case 'sequential':
        ;({ subQuestions, confidence } = this.decomposeSequential(trimmed))
        break
      case 'conditional':
        ;({ subQuestions, confidence } = this.decomposeConditional(trimmed))
        break
      case 'multi-aspect':
        ;({ subQuestions, confidence } = this.decomposeMultiAspect(trimmed))
        break
      default:
        subQuestions = [this.makeSubQuestion(0, trimmed, 'factual')]
        confidence = 0.5
    }

    return {
      originalQuery: trimmed,
      isComplex: true,
      subQuestions,
      strategy,
      confidence,
    }
  }

  /**
   * Synthesize sub-answers into a coherent response
   */
  synthesize(subAnswers: Array<{ question: string; answer: string }>): string {
    if (subAnswers.length === 0) return ''
    if (subAnswers.length === 1) return subAnswers[0]!.answer

    const parts: string[] = []
    for (const sa of subAnswers) {
      parts.push(`**${sa.question}**\n${sa.answer}`)
    }
    return parts.join('\n\n')
  }

  /**
   * Detect the decomposition strategy
   */
  private detectStrategy(query: string): DecompositionStrategy {
    if (COMPARISON_PATTERNS.some(p => p.test(query))) return 'comparison'
    if (SEQUENTIAL_PATTERNS.some(p => p.test(query))) return 'sequential'
    if (CONDITIONAL_PATTERNS.some(p => p.test(query))) return 'conditional'
    if (MULTI_ASPECT_PATTERNS.some(p => p.test(query))) return 'multi-aspect'
    return 'multi-aspect' // default for complex queries
  }

  /**
   * Decompose comparison queries ("X vs Y")
   */
  private decomposeComparison(query: string): { subQuestions: SubQuestion[]; confidence: number } {
    // Try to extract the compared items
    const vsMatch = query.match(/(.+?)\s+(?:vs\.?|versus|compared?\s+to)\s+(.+?)(?:\?|$)/i)
    const diffMatch = query.match(/differences?\s+between\s+(.+?)\s+and\s+(.+?)(?:\?|$)/i)

    let itemA = 'first option'
    let itemB = 'second option'

    if (vsMatch) {
      itemA = vsMatch[1]!.trim().replace(/^(what|how|which|compare)\s+/i, '')
      itemB = vsMatch[2]!.trim()
    } else if (diffMatch) {
      itemA = diffMatch[1]!.trim()
      itemB = diffMatch[2]!.trim()
    }

    const subQuestions: SubQuestion[] = [
      this.makeSubQuestion(0, `What is ${itemA}?`, 'factual'),
      this.makeSubQuestion(1, `What is ${itemB}?`, 'factual'),
      this.makeSubQuestion(
        2,
        `What are the key differences between ${itemA} and ${itemB}?`,
        'comparative',
        [0, 1],
      ),
      this.makeSubQuestion(3, `When should you use ${itemA} vs ${itemB}?`, 'evaluative', [2]),
    ]

    return { subQuestions, confidence: 0.8 }
  }

  /**
   * Decompose sequential/procedural queries
   */
  private decomposeSequential(query: string): { subQuestions: SubQuestion[]; confidence: number } {
    // Extract the goal
    const goalMatch =
      query.match(/how\s+to\s+(.+?)(?:\?|$)/i) ||
      query.match(/steps?\s+(?:to|for)\s+(.+?)(?:\?|$)/i) ||
      query.match(/guide\s+(?:to|for)\s+(.+?)(?:\?|$)/i)

    const goal = goalMatch ? goalMatch[1]!.trim() : query.replace(/\?/g, '').trim()

    const subQuestions: SubQuestion[] = [
      this.makeSubQuestion(0, `What are the prerequisites for ${goal}?`, 'factual'),
      this.makeSubQuestion(1, `What is the first step to ${goal}?`, 'procedural', [0]),
      this.makeSubQuestion(2, `What are the main steps to ${goal}?`, 'procedural', [1]),
      this.makeSubQuestion(3, `What are common pitfalls when ${goal}?`, 'evaluative', [2]),
    ]

    return { subQuestions, confidence: 0.75 }
  }

  /**
   * Decompose conditional queries ("should I use X or Y for Z?")
   */
  private decomposeConditional(query: string): { subQuestions: SubQuestion[]; confidence: number } {
    const match = query.match(/should\s+i\s+use\s+(.+?)\s+(?:or|vs)\s+(.+?)\s+for\s+(.+?)(?:\?|$)/i)

    let optionA = 'option A'
    let optionB = 'option B'
    let context = 'your use case'

    if (match) {
      optionA = match[1]!.trim()
      optionB = match[2]!.trim()
      context = match[3]!.trim()
    }

    const subQuestions: SubQuestion[] = [
      this.makeSubQuestion(0, `What are the requirements for ${context}?`, 'factual'),
      this.makeSubQuestion(1, `How does ${optionA} handle ${context}?`, 'evaluative', [0]),
      this.makeSubQuestion(2, `How does ${optionB} handle ${context}?`, 'evaluative', [0]),
      this.makeSubQuestion(
        3,
        `Which is better for ${context}: ${optionA} or ${optionB}?`,
        'comparative',
        [1, 2],
      ),
    ]

    return { subQuestions, confidence: 0.7 }
  }

  /**
   * Decompose multi-aspect queries (tell me about X)
   */
  private decomposeMultiAspect(query: string): { subQuestions: SubQuestion[]; confidence: number } {
    const topicMatch = query.match(
      /(?:tell\s+me\s+about|explain|describe|what\s+(?:is|are))\s+(.+?)(?:\?|$)/i,
    )
    const topic = topicMatch ? topicMatch[1]!.trim() : query.replace(/\?/g, '').trim()

    const subQuestions: SubQuestion[] = [
      this.makeSubQuestion(0, `What is ${topic}?`, 'factual'),
      this.makeSubQuestion(1, `What are the key features of ${topic}?`, 'factual', [0]),
      this.makeSubQuestion(2, `What are common use cases for ${topic}?`, 'evaluative', [0]),
      this.makeSubQuestion(3, `What are the pros and cons of ${topic}?`, 'evaluative', [1]),
    ]

    return { subQuestions, confidence: 0.7 }
  }

  /**
   * Create a SubQuestion
   */
  private makeSubQuestion(
    id: number,
    question: string,
    type: SubQuestion['type'],
    dependsOn: number[] = [],
  ): SubQuestion {
    return {
      id,
      question,
      type,
      dependsOn,
      priority: id, // lower id = higher priority
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    decomposeCount: number
    complexCount: number
    strategyCounts: Record<string, number>
  } {
    return {
      decomposeCount: this.decomposeCount,
      complexCount: this.complexCount,
      strategyCounts: { ...this.strategyCounts },
    }
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      decomposeCount: this.decomposeCount,
      complexCount: this.complexCount,
      strategyCounts: this.strategyCounts,
    })
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): QueryDecomposer {
    const parsed = JSON.parse(data)
    const decomposer = new QueryDecomposer()
    decomposer.decomposeCount = parsed.decomposeCount || 0
    decomposer.complexCount = parsed.complexCount || 0
    decomposer.strategyCounts = parsed.strategyCounts || {}
    return decomposer
  }
}
