/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  EmotionalIntelligence — Deep emotional understanding & empathy modeling    ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Emotion Detection — Identify emotions from text signals                ║
 * ║    ✦ Empathy Modeling — Generate empathetic response suggestions            ║
 * ║    ✦ Tone Analysis — Analyze and recommend conversation tones               ║
 * ║    ✦ Frustration Detection — Identify user frustration levels               ║
 * ║    ✦ Emotional Context Tracking — Track emotional state over conversation   ║
 * ║    ✦ Adaptive Response Tuning — Adjust response style to user's mood       ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type Emotion =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'trust'
  | 'anticipation'
  | 'frustration'
  | 'confusion'
  | 'neutral'

export interface EmotionScore {
  emotion: Emotion
  score: number // 0-1 intensity
  confidence: number
}

export interface EmotionalAnalysis {
  primary: EmotionScore
  secondary: EmotionScore | null
  valence: number // -1 (negative) to +1 (positive)
  arousal: number // 0 (calm) to 1 (excited)
  dominance: number // 0 (submissive) to 1 (dominant)
  frustrationLevel: number // 0-1
  suggestions: string[]
}

export type ToneType =
  | 'professional'
  | 'casual'
  | 'empathetic'
  | 'encouraging'
  | 'technical'
  | 'humorous'
  | 'urgent'
  | 'neutral'

export interface ToneAnalysis {
  detectedTone: ToneType
  recommendedTone: ToneType
  confidence: number
  reasons: string[]
}

// ── Lexicons ─────────────────────────────────────────────────────────────────

const EMOTION_LEXICON: Record<string, Partial<Record<Emotion, number>>> = {
  // Joy
  happy: { joy: 0.9 },
  great: { joy: 0.8 },
  excellent: { joy: 0.9 },
  wonderful: { joy: 0.85 },
  amazing: { joy: 0.9 },
  love: { joy: 0.8 },
  fantastic: { joy: 0.9 },
  awesome: { joy: 0.85 },
  perfect: { joy: 0.8 },
  thanks: { joy: 0.5, trust: 0.4 },
  thank: { joy: 0.5, trust: 0.4 },
  glad: { joy: 0.7 },
  excited: { joy: 0.8, anticipation: 0.6 },
  // Sadness
  sad: { sadness: 0.8 },
  unfortunate: { sadness: 0.6 },
  sorry: { sadness: 0.5 },
  disappointed: { sadness: 0.7 },
  depressed: { sadness: 0.9 },
  miss: { sadness: 0.5 },
  lost: { sadness: 0.6, confusion: 0.3 },
  failed: { sadness: 0.7, frustration: 0.5 },
  // Anger / Frustration
  angry: { anger: 0.9 },
  furious: { anger: 1.0 },
  annoyed: { anger: 0.6, frustration: 0.7 },
  frustrated: { frustration: 0.9, anger: 0.4 },
  hate: { anger: 0.8, disgust: 0.5 },
  stupid: { anger: 0.5, frustration: 0.6 },
  broken: { frustration: 0.7, anger: 0.3 },
  bug: { frustration: 0.5 },
  crash: { frustration: 0.6, fear: 0.3 },
  error: { frustration: 0.5 },
  wrong: { frustration: 0.4, anger: 0.3 },
  stuck: { frustration: 0.8, confusion: 0.4 },
  impossible: { frustration: 0.7 },
  // Fear
  afraid: { fear: 0.8 },
  worried: { fear: 0.6, anticipation: 0.3 },
  scared: { fear: 0.8 },
  dangerous: { fear: 0.7 },
  risk: { fear: 0.4, anticipation: 0.3 },
  critical: { fear: 0.4 },
  urgent: { fear: 0.5, anticipation: 0.6 },
  // Surprise
  surprised: { surprise: 0.8 },
  unexpected: { surprise: 0.7 },
  wow: { surprise: 0.8, joy: 0.4 },
  whoa: { surprise: 0.7 },
  suddenly: { surprise: 0.5 },
  strange: { surprise: 0.5, confusion: 0.4 },
  // Trust
  trust: { trust: 0.8 },
  reliable: { trust: 0.7 },
  confident: { trust: 0.7 },
  safe: { trust: 0.6 },
  secure: { trust: 0.6 },
  // Confusion
  confused: { confusion: 0.9 },
  unclear: { confusion: 0.7 },
  understand: { confusion: 0.3 },
  what: { confusion: 0.2 },
  how: { confusion: 0.2 },
  why: { confusion: 0.3 },
  help: { confusion: 0.4, frustration: 0.3 },
}

const FRUSTRATION_INDICATORS = [
  /\b(still|again|yet another|another)\s+(not|doesn'?t|won'?t|can'?t)\b/i,
  /\b(nothing|none)\s+(works?|is working)\b/i,
  /\bwhy\s+(won'?t|doesn'?t|can'?t|isn'?t)\b/i,
  /\b(this is|that's)\s+(stupid|dumb|ridiculous|terrible|awful)\b/i,
  /\bI'?ve\s+tried\s+everything\b/i,
  /\b(please|just)\s+work\b/i,
  /!{2,}/,
  /\b(ugh|argh|grr)\b/i,
]

const TONE_INDICATORS: Record<ToneType, RegExp[]> = {
  professional: [/\bregarding\b/i, /\bplease\s+advise\b/i, /\bper\s+our\b/i, /\bkindly\b/i],
  casual: [/\bhey\b/i, /\byeah\b/i, /\bcool\b/i, /\blol\b/i, /\bbtw\b/i, /\bguess\b/i],
  empathetic: [/\bI\s+understand\b/i, /\bI\s+feel\b/i, /\bsorry\s+to\s+hear\b/i],
  encouraging: [/\bgreat\s+job\b/i, /\bkeep\s+(going|it\s+up)\b/i, /\bwell\s+done\b/i],
  technical: [/\bAPI\b/, /\bfunction\b/i, /\bimplementation\b/i, /\barchitecture\b/i, /\bdebug\b/i],
  humorous: [/\bhaha\b/i, /\blol\b/i, /\bjk\b/i, /\bjust\s+kidding\b/i],
  urgent: [/\basap\b/i, /\burgent\b/i, /\bcritical\b/i, /\bimmediate\b/i, /\bblocking\b/i],
  neutral: [],
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class EmotionalIntelligence {
  private emotionHistory: EmotionScore[] = []
  private readonly maxHistory = 50

  constructor() {}

  // ── Core Emotion Detection ───────────────────────────────────────────────

  /**
   * Analyze text for emotional content
   */
  analyzeEmotion(text: string): EmotionalAnalysis {
    const words = text.toLowerCase().split(/\s+/)
    const emotionScores = new Map<Emotion, number>()

    // Scan for emotion words
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '')
      const emotions = EMOTION_LEXICON[cleanWord]
      if (emotions) {
        for (const [emotion, score] of Object.entries(emotions)) {
          const current = emotionScores.get(emotion as Emotion) || 0
          emotionScores.set(emotion as Emotion, Math.min(1, current + score))
        }
      }
    }

    // Check frustration indicators
    let frustrationBoost = 0
    for (const pattern of FRUSTRATION_INDICATORS) {
      if (pattern.test(text)) frustrationBoost += 0.2
    }
    if (frustrationBoost > 0) {
      const current = emotionScores.get('frustration') || 0
      emotionScores.set('frustration', Math.min(1, current + frustrationBoost))
    }

    // Sort and pick primary/secondary
    const sorted = [...emotionScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, score]) => ({
        emotion,
        score: Math.min(1, score),
        confidence: Math.min(0.95, 0.4 + score * 0.5),
      }))

    const primary: EmotionScore = sorted[0] || { emotion: 'neutral', score: 0.5, confidence: 0.6 }
    const secondary = sorted[1] && sorted[1].score > 0.2 ? sorted[1] : null

    // Calculate VAD (Valence, Arousal, Dominance)
    const valence = this.calculateValence(emotionScores)
    const arousal = this.calculateArousal(emotionScores)
    const dominance = this.calculateDominance(emotionScores)
    const frustrationLevel = Math.min(1, (emotionScores.get('frustration') || 0) + frustrationBoost)

    // Track
    this.emotionHistory.push(primary)
    if (this.emotionHistory.length > this.maxHistory) {
      this.emotionHistory = this.emotionHistory.slice(-this.maxHistory)
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(primary, frustrationLevel, valence)

    return {
      primary,
      secondary,
      valence,
      arousal,
      dominance,
      frustrationLevel,
      suggestions,
    }
  }

  // ── Tone Analysis ────────────────────────────────────────────────────────

  /**
   * Analyze conversation tone and recommend appropriate response tone
   */
  analyzeTone(text: string): ToneAnalysis {
    const scores = new Map<ToneType, number>()

    for (const [tone, patterns] of Object.entries(TONE_INDICATORS) as [ToneType, RegExp[]][]) {
      let matches = 0
      for (const pattern of patterns) {
        if (pattern.test(text)) matches++
      }
      if (matches > 0) {
        scores.set(tone, matches / Math.max(patterns.length, 1))
      }
    }

    const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1])
    const detectedTone: ToneType = sorted[0]?.[0] || 'neutral'

    // Recommend appropriate response tone
    const recommendedTone = this.recommendTone(detectedTone)
    const reasons = this.getToneReasons(detectedTone, recommendedTone)

    return {
      detectedTone,
      recommendedTone,
      confidence: sorted[0] ? Math.min(0.95, sorted[0][1] + 0.3) : 0.4,
      reasons,
    }
  }

  // ── Frustration Detection ────────────────────────────────────────────────

  /**
   * Detect user frustration level (0-1)
   */
  detectFrustration(text: string, conversationLength: number = 0): number {
    let level = 0

    // Check frustration indicators
    for (const pattern of FRUSTRATION_INDICATORS) {
      if (pattern.test(text)) level += 0.15
    }

    // Check emotion lexicon
    const words = text.toLowerCase().split(/\s+/)
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '')
      const emotions = EMOTION_LEXICON[cleanWord]
      if (emotions?.frustration) level += emotions.frustration * 0.2
      if (emotions?.anger) level += emotions.anger * 0.15
    }

    // Conversation length factor (longer conversations may indicate frustration)
    if (conversationLength > 10) level += 0.1
    if (conversationLength > 20) level += 0.1

    // All caps detection
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1)
    if (capsRatio > 0.5 && text.length > 10) level += 0.2

    // Recent emotion history factor
    const recentFrustration = this.emotionHistory
      .slice(-5)
      .filter(e => e.emotion === 'frustration' || e.emotion === 'anger').length
    level += recentFrustration * 0.05

    return Math.min(1, level)
  }

  // ── Empathy Response ─────────────────────────────────────────────────────

  /**
   * Generate empathetic response prefix based on emotional analysis
   */
  generateEmpathyResponse(analysis: EmotionalAnalysis): string {
    const { primary, frustrationLevel, valence } = analysis

    if (frustrationLevel > 0.7) {
      return 'I understand this is really frustrating. Let me help you work through this step by step.'
    }

    if (frustrationLevel > 0.4) {
      return "I can see this has been challenging. Let's figure this out together."
    }

    switch (primary.emotion) {
      case 'joy':
        return "That's great to hear! "
      case 'sadness':
        return "I'm sorry to hear that. Let me see how I can help."
      case 'anger':
        return 'I understand your frustration. Let me address this directly.'
      case 'fear':
        return 'I understand your concern. Let me provide some clarity.'
      case 'surprise':
        return valence > 0 ? 'That is exciting! ' : 'That is unexpected. Let me look into this.'
      case 'confusion':
        return 'Let me help clarify things. '
      case 'trust':
        return 'I appreciate your confidence. '
      default:
        return ''
    }
  }

  // ── Emotional Context Tracking ───────────────────────────────────────────

  /**
   * Get emotional trend over recent interactions
   */
  getEmotionalTrend(): { trend: 'improving' | 'declining' | 'stable'; avgValence: number } {
    if (this.emotionHistory.length < 3) {
      return { trend: 'stable', avgValence: 0 }
    }

    const recent = this.emotionHistory.slice(-5)
    const older = this.emotionHistory.slice(-10, -5)

    if (older.length === 0) {
      return { trend: 'stable', avgValence: 0 }
    }

    const recentPositive =
      recent.filter(
        e => e.emotion === 'joy' || e.emotion === 'trust' || e.emotion === 'anticipation',
      ).length / recent.length

    const olderPositive =
      older.filter(
        e => e.emotion === 'joy' || e.emotion === 'trust' || e.emotion === 'anticipation',
      ).length / older.length

    const diff = recentPositive - olderPositive
    const avgValence = recentPositive - (1 - recentPositive)

    if (diff > 0.2) return { trend: 'improving', avgValence }
    if (diff < -0.2) return { trend: 'declining', avgValence }
    return { trend: 'stable', avgValence }
  }

  /**
   * Get emotion history length
   */
  getHistoryLength(): number {
    return this.emotionHistory.length
  }

  /**
   * Reset emotional state
   */
  reset(): void {
    this.emotionHistory = []
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private calculateValence(emotions: Map<Emotion, number>): number {
    const positive =
      (emotions.get('joy') || 0) +
      (emotions.get('trust') || 0) +
      (emotions.get('anticipation') || 0)
    const negative =
      (emotions.get('sadness') || 0) +
      (emotions.get('anger') || 0) +
      (emotions.get('fear') || 0) +
      (emotions.get('disgust') || 0) +
      (emotions.get('frustration') || 0)
    const total = positive + negative
    if (total === 0) return 0
    return (positive - negative) / total
  }

  private calculateArousal(emotions: Map<Emotion, number>): number {
    const high =
      (emotions.get('anger') || 0) +
      (emotions.get('fear') || 0) +
      (emotions.get('surprise') || 0) +
      (emotions.get('joy') || 0) * 0.5
    const low = (emotions.get('sadness') || 0) * 0.5 + (emotions.get('trust') || 0) * 0.3
    return Math.min(1, Math.max(0, high - low + 0.5))
  }

  private calculateDominance(emotions: Map<Emotion, number>): number {
    const dominant =
      (emotions.get('anger') || 0) + (emotions.get('trust') || 0) + (emotions.get('joy') || 0) * 0.5
    const submissive =
      (emotions.get('fear') || 0) +
      (emotions.get('sadness') || 0) +
      (emotions.get('confusion') || 0)
    return Math.min(1, Math.max(0, dominant - submissive + 0.5))
  }

  private recommendTone(detected: ToneType): ToneType {
    const mapping: Record<ToneType, ToneType> = {
      professional: 'professional',
      casual: 'casual',
      empathetic: 'empathetic',
      encouraging: 'encouraging',
      technical: 'technical',
      humorous: 'casual',
      urgent: 'professional',
      neutral: 'neutral',
    }
    return mapping[detected]
  }

  private getToneReasons(detected: ToneType, recommended: ToneType): string[] {
    const reasons: string[] = [`Detected tone: ${detected}`]
    if (detected !== recommended) {
      reasons.push(`Recommended to respond with ${recommended} tone for better engagement`)
    }
    return reasons
  }

  private generateSuggestions(
    primary: EmotionScore,
    frustrationLevel: number,
    valence: number,
  ): string[] {
    const suggestions: string[] = []

    if (frustrationLevel > 0.5) {
      suggestions.push('Acknowledge frustration before providing solutions')
      suggestions.push('Break down solution into smaller, manageable steps')
    }

    if (primary.emotion === 'confusion') {
      suggestions.push('Provide clear, structured explanation')
      suggestions.push('Use examples to illustrate concepts')
    }

    if (valence < -0.3) {
      suggestions.push('Use encouraging and supportive language')
      suggestions.push("Validate the user's experience")
    }

    if (primary.emotion === 'joy' || valence > 0.5) {
      suggestions.push('Match positive energy in response')
    }

    return suggestions
  }
}
