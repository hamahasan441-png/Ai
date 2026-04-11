/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Dialogue Act Recognizer — Classify User Utterance Types                     ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Act Classification — question, assertion, request, command, etc.        ║
 * ║    ✦ Sub-type Detection — refine act into specific sub-categories            ║
 * ║    ✦ Confidence Scoring — rate classification confidence                     ║
 * ║    ✦ Indicator Tracking — which patterns matched                             ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type DialogueAct =
  | 'question'
  | 'assertion'
  | 'request'
  | 'command'
  | 'challenge'
  | 'correction'
  | 'confirmation'
  | 'clarification'
  | 'greeting'
  | 'opinion'
  | 'comparison'
  | 'hypothetical'

export interface DialogueActResult {
  act: DialogueAct
  confidence: number
  subType?: string
  indicators: string[]
}

// ── Pattern Definitions ──────────────────────────────────────────────────────

interface ActPattern {
  act: DialogueAct
  patterns: RegExp[]
  keywords: string[]
  subTypes?: Record<string, RegExp>
}

const ACT_PATTERNS: ActPattern[] = [
  {
    act: 'question',
    patterns: [
      /\?\s*$/,
      /^(what|where|when|why|who|how|which|whose|whom)\b/i,
      /^(is|are|was|were|do|does|did|can|could|will|would|should|has|have)\b/i,
      /^(tell me|explain|describe)\b/i,
    ],
    keywords: ['what', 'where', 'when', 'why', 'who', 'how', 'which'],
    subTypes: {
      factual: /^(what is|what are|who is|who are|when was|where is)\b/i,
      procedural: /^(how (do|can|to|should)|what steps|what is the process)\b/i,
      causal: /^(why|what causes|what leads to)\b/i,
      definitional: /^(what (is|are) (a |an |the )?|define|meaning of)\b/i,
    },
  },
  {
    act: 'command',
    patterns: [
      /^(show|list|create|make|build|generate|write|run|execute|install|deploy)\b/i,
      /^(give me|get me|find|search|look up|open|close|start|stop)\b/i,
      /^(add|remove|delete|update|change|modify|set|configure)\b/i,
    ],
    keywords: ['show', 'list', 'create', 'build', 'generate', 'write', 'run'],
  },
  {
    act: 'request',
    patterns: [
      /^(please|can you|could you|would you|will you)\b/i,
      /^(i('d| would) like|i want|i need)\b/i,
      /^(help me|assist me)\b/i,
    ],
    keywords: ['please', 'help', 'need', 'want'],
  },
  {
    act: 'assertion',
    patterns: [
      /^(it is|this is|that is|there is|there are)\b/i,
      /\b(is|are|was|were)\s+(a|an|the)\b/i,
    ],
    keywords: [],
  },
  {
    act: 'challenge',
    patterns: [
      /^(that('s| is) (not|wrong|incorrect))\b/i,
      /^(i (don't|do not) (think|agree|believe))\b/i,
      /^(actually|but that|no,?\s+(that|it))\b/i,
      /\b(are you sure|really\?|prove it)\b/i,
    ],
    keywords: ['wrong', 'incorrect', 'disagree', 'doubt'],
  },
  {
    act: 'correction',
    patterns: [
      /^(actually|no,?\s+(it|the|that)('s| is))\b/i,
      /^(the (correct|right|actual) (answer|way))\b/i,
      /\b(should be|instead of|not .+, but)\b/i,
    ],
    keywords: ['correction', 'actually', 'incorrect'],
  },
  {
    act: 'confirmation',
    patterns: [
      /^(yes|yeah|yep|yup|correct|exactly|right|true|absolutely|definitely)\b/i,
      /^(that('s| is) (correct|right|true|exactly))\b/i,
      /^(i agree|agreed|indeed|precisely)\b/i,
    ],
    keywords: ['yes', 'correct', 'exactly', 'right', 'agree'],
  },
  {
    act: 'clarification',
    patterns: [
      /^(what do you mean|can you (explain|elaborate|clarify))\b/i,
      /^(i('m| am) (not sure|confused)|what exactly)\b/i,
      /\b(more specifically|in other words|for example)\b/i,
    ],
    keywords: ['clarify', 'elaborate', 'explain', 'mean', 'specifically'],
  },
  {
    act: 'greeting',
    patterns: [
      /^(hello|hi|hey|greetings|good (morning|afternoon|evening))\b/i,
      /^(thanks|thank you|cheers|bye|goodbye|see you)\b/i,
      /^(welcome|nice to|pleased to)\b/i,
    ],
    keywords: ['hello', 'hi', 'hey', 'thanks', 'bye', 'goodbye'],
  },
  {
    act: 'opinion',
    patterns: [
      /^(i (think|believe|feel|prefer|reckon))\b/i,
      /^(in my (opinion|view|experience))\b/i,
      /^(personally|from my perspective)\b/i,
      /\b(i (like|love|hate|dislike|prefer))\b/i,
    ],
    keywords: ['think', 'believe', 'opinion', 'prefer', 'feel'],
  },
  {
    act: 'comparison',
    patterns: [
      /\bvs\.?\b/i,
      /\b(compare|comparison|versus|difference between|compared to)\b/i,
      /\b(which is (better|faster|best|worse))\b/i,
      /\b(pros and cons|advantages and disadvantages)\b/i,
      /\b(X or Y|.+ or .+\?)\b/i,
    ],
    keywords: ['compare', 'versus', 'difference', 'better', 'worse'],
  },
  {
    act: 'hypothetical',
    patterns: [
      /^(what if|suppose|imagine|hypothetically)\b/i,
      /^(if (we|i|you|they) (could|would|were|had))\b/i,
      /\b(would happen if|what would)\b/i,
    ],
    keywords: ['what if', 'suppose', 'imagine', 'hypothetically'],
  },
]

// ── DialogueActRecognizer Class ──────────────────────────────────────────────

export class DialogueActRecognizer {
  private recognizeCount = 0
  private actCounts: Record<string, number> = {}

  constructor() {
    this.actCounts = {}
  }

  /**
   * Recognize the dialogue act of an utterance
   */
  recognize(text: string, context?: { previousAct?: string }): DialogueActResult {
    this.recognizeCount++

    if (!text || text.trim().length === 0) {
      return { act: 'assertion', confidence: 0.1, indicators: [] }
    }

    const trimmed = text.trim()

    // Score each act
    const scores: Array<{
      act: DialogueAct
      score: number
      indicators: string[]
      subType?: string
    }> = []

    for (const pattern of ACT_PATTERNS) {
      let score = 0
      const indicators: string[] = []

      // Check regex patterns
      for (const regex of pattern.patterns) {
        if (regex.test(trimmed)) {
          score += 0.4
          indicators.push(`pattern:${regex.source.slice(0, 30)}`)
        }
      }

      // Check keywords
      const lower = trimmed.toLowerCase()
      for (const keyword of pattern.keywords) {
        if (lower.includes(keyword)) {
          score += 0.15
          indicators.push(`keyword:${keyword}`)
        }
      }

      // Punctuation signals
      if (pattern.act === 'question' && trimmed.endsWith('?')) {
        score += 0.3
        indicators.push('punctuation:?')
      }
      if (pattern.act === 'command' && trimmed.endsWith('!')) {
        score += 0.1
        indicators.push('punctuation:!')
      }

      // Context bonus
      if (context?.previousAct) {
        if (pattern.act === 'confirmation' && context.previousAct === 'question') score += 0.1
        if (pattern.act === 'clarification' && context.previousAct === 'assertion') score += 0.1
        if (pattern.act === 'correction' && context.previousAct === 'assertion') score += 0.1
      }

      // Detect sub-type if applicable
      let subType: string | undefined
      if (pattern.subTypes) {
        for (const [st, regex] of Object.entries(pattern.subTypes)) {
          if (regex.test(trimmed)) {
            subType = st
            break
          }
        }
      }

      if (score > 0) {
        scores.push({ act: pattern.act, score: Math.min(1, score), indicators, subType })
      }
    }

    // Sort by score
    scores.sort((a, b) => b.score - a.score)

    // Default if nothing matches
    if (scores.length === 0) {
      return { act: 'assertion', confidence: 0.2, indicators: ['default'] }
    }

    const best = scores[0]!

    // Track
    this.actCounts[best.act] = (this.actCounts[best.act] || 0) + 1

    return {
      act: best.act,
      confidence: best.score,
      subType: best.subType,
      indicators: best.indicators,
    }
  }

  /**
   * Get statistics
   */
  getStats(): { recognizeCount: number; actCounts: Record<string, number> } {
    return {
      recognizeCount: this.recognizeCount,
      actCounts: { ...this.actCounts },
    }
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      recognizeCount: this.recognizeCount,
      actCounts: this.actCounts,
    })
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): DialogueActRecognizer {
    const parsed = JSON.parse(data)
    const recognizer = new DialogueActRecognizer()
    recognizer.recognizeCount = parsed.recognizeCount || 0
    recognizer.actCounts = parsed.actCounts || {}
    return recognizer
  }
}
