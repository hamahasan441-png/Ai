/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  FeedbackLearner — RLHF-like feedback integration & preference modeling    ║
 * ║                                                                            ║
 * ║  Learns from user corrections, preference signals, and explicit            ║
 * ║  feedback to improve future responses. Maintains preference models,        ║
 * ║  tracks quality calibration, and adjusts behavior over time.               ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Correction learning — extract lessons from user corrections           ║
 * ║    • Preference modeling — learn what the user prefers                     ║
 * ║    • Quality calibration — align confidence with actual quality            ║
 * ║    • Style adaptation — learn preferred response style                     ║
 * ║    • Mistake tracking — avoid repeating past errors                        ║
 * ║    • Reward signal processing — thumbs up/down, edits, follow-ups         ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Type of feedback signal. */
export type FeedbackSignalType =
  | 'thumbs_up'
  | 'thumbs_down'
  | 'correction'
  | 'edit'
  | 'follow_up'
  | 'regenerate'
  | 'explicit_rating'

/** A feedback signal from the user. */
export interface FeedbackSignal {
  readonly id: string
  readonly type: FeedbackSignalType
  readonly timestamp: number
  readonly originalOutput: string
  readonly correctedOutput?: string
  readonly rating?: number
  readonly domain: string
  readonly context: string
  readonly tags: string[]
}

/** A lesson extracted from a correction. */
export interface CorrectionLesson {
  readonly id: string
  readonly original: string
  readonly corrected: string
  readonly lesson: string
  readonly domain: string
  readonly category: CorrectionCategory
  readonly confidence: number
  readonly timesApplied: number
  readonly createdAt: number
}

/** Category of correction. */
export type CorrectionCategory =
  | 'factual_error'
  | 'style_preference'
  | 'format_preference'
  | 'detail_level'
  | 'tone_adjustment'
  | 'missing_information'
  | 'unnecessary_information'
  | 'wrong_approach'
  | 'terminology'

/** User preference model. */
export interface PreferenceModel {
  readonly userId: string
  /** Preferred response length: 'concise' | 'moderate' | 'detailed'. */
  responseLength: 'concise' | 'moderate' | 'detailed'
  /** Preferred formality: 'casual' | 'balanced' | 'formal'. */
  formality: 'casual' | 'balanced' | 'formal'
  /** Preferred code style: 'minimal' | 'commented' | 'verbose'. */
  codeStyle: 'minimal' | 'commented' | 'verbose'
  /** Preferred explanation depth: 'surface' | 'moderate' | 'deep'. */
  explanationDepth: 'surface' | 'moderate' | 'deep'
  /** Whether user prefers examples. */
  prefersExamples: boolean
  /** Whether user prefers step-by-step format. */
  prefersStepByStep: boolean
  /** Topics user frequently asks about. */
  topDomains: string[]
  /** Preferred language for responses. */
  preferredLanguage: string
  /** Confidence in this model. */
  confidence: number
  /** Number of signals used to build this model. */
  signalCount: number
  readonly lastUpdated: number
}

/** A tracked mistake to avoid repeating. */
export interface TrackedMistake {
  readonly id: string
  readonly pattern: string
  readonly correction: string
  readonly domain: string
  readonly severity: 'minor' | 'moderate' | 'major'
  readonly occurrences: number
  readonly lastOccurrence: number
}

/** Quality calibration record. */
export interface CalibrationRecord {
  readonly predictedQuality: number
  readonly actualQuality: number
  readonly domain: string
  readonly timestamp: number
}

/** Calibration summary. */
export interface CalibrationSummary {
  readonly totalRecords: number
  readonly calibrationError: number
  readonly overConfidenceRate: number
  readonly underConfidenceRate: number
  readonly domainCalibration: Record<string, number>
}

/** Reward signal summary for a time window. */
export interface RewardSummary {
  readonly totalSignals: number
  readonly positiveRate: number
  readonly correctionRate: number
  readonly avgRating: number
  readonly topCorrectionCategories: string[]
  readonly rewardTrend: 'improving' | 'stable' | 'declining'
}

/** Configuration for the feedback learner. */
export interface FeedbackLearnerConfig {
  /** Maximum feedback signals to store. Default: 2000 */
  readonly maxSignals: number
  /** Maximum correction lessons to store. Default: 500 */
  readonly maxLessons: number
  /** Maximum tracked mistakes. Default: 200 */
  readonly maxMistakes: number
  /** Maximum calibration records. Default: 500 */
  readonly maxCalibrationRecords: number
  /** Confidence decay per day without reinforcement. Default: 0.01 */
  readonly confidenceDecay: number
  /** Minimum signals to build a preference model. Default: 5 */
  readonly minSignalsForModel: number
}

/** Runtime statistics. */
export interface FeedbackLearnerStats {
  readonly totalSignalsReceived: number
  readonly totalLessonsLearned: number
  readonly totalMistakesTracked: number
  readonly avgCalibrationError: number
  readonly positiveSignalRate: number
  readonly correctionRate: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_FEEDBACK_LEARNER_CONFIG: FeedbackLearnerConfig = {
  maxSignals: 2000,
  maxLessons: 500,
  maxMistakes: 200,
  maxCalibrationRecords: 500,
  confidenceDecay: 0.01,
  minSignalsForModel: 5,
}

/** Correction category detection patterns. */
const CORRECTION_CATEGORY_SIGNALS: Record<CorrectionCategory, string[]> = {
  factual_error: ['wrong', 'incorrect', 'false', 'mistake', 'error', 'not true', 'actually'],
  style_preference: ['prefer', 'rather', 'style', 'tone', 'voice', 'way of'],
  format_preference: ['format', 'layout', 'structure', 'organize', 'bullet', 'numbered'],
  detail_level: ['more detail', 'less detail', 'too long', 'too short', 'brief', 'elaborate'],
  tone_adjustment: ['formal', 'casual', 'professional', 'friendly', 'serious', 'lighter'],
  missing_information: ['missing', 'forgot', 'also mention', "didn't include", 'left out', 'add'],
  unnecessary_information: ['too much', 'unnecessary', 'remove', "don't need", 'excess', 'trim'],
  wrong_approach: ['different approach', 'instead', 'better way', 'wrong method', 'try using'],
  terminology: ['term', 'word', 'phrase', 'call it', 'named', 'referred to as'],
}

/** Domain detection keywords. */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  programming: ['code', 'function', 'class', 'variable', 'api', 'debug', 'compile'],
  security: ['vulnerability', 'exploit', 'attack', 'defense', 'security'],
  trading: ['market', 'stock', 'trade', 'price', 'indicator', 'strategy'],
  general: ['explain', 'describe', 'what', 'how', 'why', 'tell me'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `fl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function detectDomain(text: string): string {
  const lower = text.toLowerCase()
  let bestDomain = 'general'
  let bestScore = 0
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestDomain = domain
    }
  }
  return bestDomain
}

function detectCorrectionCategory(original: string, corrected: string): CorrectionCategory {
  const diff = corrected.toLowerCase()
  let bestCategory: CorrectionCategory = 'factual_error'
  let bestScore = 0
  for (const [category, signals] of Object.entries(CORRECTION_CATEGORY_SIGNALS)) {
    const score = signals.reduce((s, sig) => s + (diff.includes(sig) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestCategory = category as CorrectionCategory
    }
  }
  return bestCategory
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class FeedbackLearner {
  private readonly config: FeedbackLearnerConfig
  private readonly signals: FeedbackSignal[] = []
  private readonly lessons: Map<string, CorrectionLesson> = new Map()
  private readonly mistakes: Map<string, TrackedMistake> = new Map()
  private readonly calibrationRecords: CalibrationRecord[] = []
  private readonly preferenceModels: Map<string, PreferenceModel> = new Map()
  private stats = {
    totalSignals: 0,
    totalLessons: 0,
    totalMistakes: 0,
    positiveSignals: 0,
    corrections: 0,
    totalCalibrationError: 0,
    calibrationCount: 0,
  }

  constructor(config: Partial<FeedbackLearnerConfig> = {}) {
    this.config = { ...DEFAULT_FEEDBACK_LEARNER_CONFIG, ...config }
  }

  // ── Core: Process feedback signal ──────────────────────────────────────

  /** Process a feedback signal from the user. */
  processFeedback(signal: FeedbackSignal): void {
    this.signals.push(signal)
    this.stats.totalSignals++

    // Track positive/negative
    if (signal.type === 'thumbs_up') {
      this.stats.positiveSignals++
    }
    if (signal.type === 'correction' || signal.type === 'edit') {
      this.stats.corrections++
    }

    // Extract lessons from corrections
    if ((signal.type === 'correction' || signal.type === 'edit') && signal.correctedOutput) {
      this.learnFromCorrection(signal)
    }

    // Update preference model
    this.updatePreferenceModel('default', signal)

    // Prune history
    while (this.signals.length > this.config.maxSignals) {
      this.signals.shift()
    }
  }

  // ── Correction learning ────────────────────────────────────────────────

  private learnFromCorrection(signal: FeedbackSignal): void {
    if (!signal.correctedOutput) return

    const category = detectCorrectionCategory(signal.originalOutput, signal.correctedOutput)
    const lesson = this.extractLesson(signal.originalOutput, signal.correctedOutput, category)

    const correctionLesson: CorrectionLesson = {
      id: generateId(),
      original: signal.originalOutput.slice(0, 300),
      corrected: signal.correctedOutput.slice(0, 300),
      lesson,
      domain: signal.domain,
      category,
      confidence: 0.7,
      timesApplied: 0,
      createdAt: Date.now(),
    }

    this.lessons.set(correctionLesson.id, correctionLesson)
    this.stats.totalLessons++

    // Track as a mistake pattern
    this.trackMistake(signal.originalOutput, signal.correctedOutput, signal.domain, category)

    // Enforce max lessons
    if (this.lessons.size > this.config.maxLessons) {
      const oldest = [...this.lessons.entries()].sort(
        ([, a], [, b]) => a.createdAt - b.createdAt,
      )[0]
      if (oldest) this.lessons.delete(oldest[0])
    }
  }

  private extractLesson(original: string, corrected: string, category: CorrectionCategory): string {
    const lessons: Record<CorrectionCategory, string> = {
      factual_error: `Factual correction: "${original.slice(0, 60)}..." was corrected to "${corrected.slice(0, 60)}..."`,
      style_preference: `User prefers different style: "${corrected.slice(0, 80)}..."`,
      format_preference: `User prefers different format: "${corrected.slice(0, 80)}..."`,
      detail_level: `Adjust detail level: ${corrected.length > original.length ? 'provide more detail' : 'be more concise'}`,
      tone_adjustment: `Adjust tone based on correction: "${corrected.slice(0, 80)}..."`,
      missing_information: `Include missing information: "${corrected.slice(0, 80)}..."`,
      unnecessary_information: `Remove unnecessary content: response was trimmed`,
      wrong_approach: `Use different approach: "${corrected.slice(0, 80)}..."`,
      terminology: `Use correct terminology: "${corrected.slice(0, 80)}..."`,
    }
    return lessons[category]
  }

  // ── Mistake tracking ───────────────────────────────────────────────────

  private trackMistake(
    original: string,
    corrected: string,
    domain: string,
    category: CorrectionCategory,
  ): void {
    // Generate a pattern key from the original
    const patternKey = `${category}_${domain}_${original.slice(0, 50).toLowerCase().replace(/\s+/g, '_')}`

    const existing = this.mistakes.get(patternKey)
    if (existing) {
      const updated: TrackedMistake = {
        ...existing,
        occurrences: existing.occurrences + 1,
        lastOccurrence: Date.now(),
        severity:
          existing.occurrences >= 3 ? 'major' : existing.occurrences >= 1 ? 'moderate' : 'minor',
      }
      this.mistakes.set(patternKey, updated)
    } else {
      const mistake: TrackedMistake = {
        id: generateId(),
        pattern: original.slice(0, 200),
        correction: corrected.slice(0, 200),
        domain,
        severity: 'minor',
        occurrences: 1,
        lastOccurrence: Date.now(),
      }
      this.mistakes.set(patternKey, mistake)
      this.stats.totalMistakes++
    }

    // Enforce max mistakes
    if (this.mistakes.size > this.config.maxMistakes) {
      const oldest = [...this.mistakes.entries()].sort(
        ([, a], [, b]) => a.lastOccurrence - b.lastOccurrence,
      )[0]
      if (oldest) this.mistakes.delete(oldest[0])
    }
  }

  /** Check if a response matches a known mistake pattern. */
  checkForKnownMistakes(output: string): TrackedMistake[] {
    const lower = output.toLowerCase()
    const matches: TrackedMistake[] = []

    for (const mistake of this.mistakes.values()) {
      const patternLower = mistake.pattern.toLowerCase()
      // Simple similarity check
      const words = patternLower.split(/\s+/).filter(w => w.length > 3)
      const matchCount = words.filter(w => lower.includes(w)).length
      if (words.length > 0 && matchCount / words.length > 0.5) {
        matches.push(mistake)
      }
    }

    return matches.sort((a, b) => b.severity.localeCompare(a.severity))
  }

  // ── Preference modeling ────────────────────────────────────────────────

  private updatePreferenceModel(userId: string, signal: FeedbackSignal): void {
    let model = this.preferenceModels.get(userId)
    if (!model) {
      model = {
        userId,
        responseLength: 'moderate',
        formality: 'balanced',
        codeStyle: 'commented',
        explanationDepth: 'moderate',
        prefersExamples: true,
        prefersStepByStep: true,
        topDomains: [],
        preferredLanguage: 'english',
        confidence: 0,
        signalCount: 0,
        lastUpdated: Date.now(),
      }
    }

    // Update based on signal
    const updated = { ...model }
    updated.signalCount = model.signalCount + 1
    updated.confidence = clamp(model.signalCount / (this.config.minSignalsForModel * 2), 0, 1)

    // Infer preferences from corrections
    if (signal.correctedOutput && signal.originalOutput) {
      const origLen = signal.originalOutput.length
      const corrLen = signal.correctedOutput.length

      // Length preference
      if (corrLen < origLen * 0.6) {
        updated.responseLength = 'concise'
      } else if (corrLen > origLen * 1.5) {
        updated.responseLength = 'detailed'
      }

      // Format preference
      if (/\d+\.\s/.test(signal.correctedOutput) || /[-•*]\s/.test(signal.correctedOutput)) {
        updated.prefersStepByStep = true
      }

      // Code style
      if (/\/\//.test(signal.correctedOutput) || /\/\*/.test(signal.correctedOutput)) {
        updated.codeStyle = 'commented'
      }
    }

    // Track top domains
    if (signal.domain && !updated.topDomains.includes(signal.domain)) {
      updated.topDomains = [...updated.topDomains, signal.domain].slice(-5)
    }

    // Recalculate lastUpdated
    const finalModel: PreferenceModel = {
      ...updated,
      lastUpdated: Date.now(),
    }

    this.preferenceModels.set(userId, finalModel)
  }

  /** Get the preference model for a user. */
  getPreferenceModel(userId?: string): PreferenceModel | null {
    return this.preferenceModels.get(userId || 'default') || null
  }

  // ── Quality calibration ────────────────────────────────────────────────

  /** Record a calibration data point. */
  recordCalibration(predictedQuality: number, actualQuality: number, domain?: string): void {
    const record: CalibrationRecord = {
      predictedQuality,
      actualQuality,
      domain: domain || 'general',
      timestamp: Date.now(),
    }

    this.calibrationRecords.push(record)
    this.stats.totalCalibrationError += Math.abs(predictedQuality - actualQuality)
    this.stats.calibrationCount++

    // Enforce max records
    while (this.calibrationRecords.length > this.config.maxCalibrationRecords) {
      this.calibrationRecords.shift()
    }
  }

  /** Get calibration summary. */
  getCalibrationSummary(): CalibrationSummary {
    if (this.calibrationRecords.length === 0) {
      return {
        totalRecords: 0,
        calibrationError: 0,
        overConfidenceRate: 0,
        underConfidenceRate: 0,
        domainCalibration: {},
      }
    }

    let totalError = 0
    let overConfident = 0
    let underConfident = 0
    const domainErrors: Record<string, { total: number; count: number }> = {}

    for (const record of this.calibrationRecords) {
      const error = Math.abs(record.predictedQuality - record.actualQuality)
      totalError += error

      if (record.predictedQuality > record.actualQuality + 0.1) {
        overConfident++
      } else if (record.predictedQuality < record.actualQuality - 0.1) {
        underConfident++
      }

      if (!domainErrors[record.domain]) {
        domainErrors[record.domain] = { total: 0, count: 0 }
      }
      domainErrors[record.domain].total += error
      domainErrors[record.domain].count++
    }

    const n = this.calibrationRecords.length
    const domainCalibration: Record<string, number> = {}
    for (const [domain, data] of Object.entries(domainErrors)) {
      domainCalibration[domain] = data.total / data.count
    }

    return {
      totalRecords: n,
      calibrationError: totalError / n,
      overConfidenceRate: overConfident / n,
      underConfidenceRate: underConfident / n,
      domainCalibration,
    }
  }

  // ── Reward signal analysis ─────────────────────────────────────────────

  /** Get a summary of reward signals over a time window. */
  getRewardSummary(windowMs?: number): RewardSummary {
    const cutoff = windowMs ? Date.now() - windowMs : 0
    const relevant = this.signals.filter(s => s.timestamp >= cutoff)

    if (relevant.length === 0) {
      return {
        totalSignals: 0,
        positiveRate: 0,
        correctionRate: 0,
        avgRating: 0,
        topCorrectionCategories: [],
        rewardTrend: 'stable',
      }
    }

    const positive = relevant.filter(s => s.type === 'thumbs_up').length
    const corrections = relevant.filter(s => s.type === 'correction' || s.type === 'edit').length
    const ratings = relevant.filter(s => s.rating != null).map(s => s.rating!)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    // Top correction categories
    const categoryCounts: Record<string, number> = {}
    for (const lesson of this.lessons.values()) {
      categoryCounts[lesson.category] = (categoryCounts[lesson.category] || 0) + 1
    }
    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)

    // Trend: compare first half vs second half of signals
    const half = Math.floor(relevant.length / 2)
    const firstHalf = relevant.slice(0, half)
    const secondHalf = relevant.slice(half)
    const firstPositive =
      firstHalf.filter(s => s.type === 'thumbs_up').length / Math.max(firstHalf.length, 1)
    const secondPositive =
      secondHalf.filter(s => s.type === 'thumbs_up').length / Math.max(secondHalf.length, 1)
    const trend =
      secondPositive > firstPositive + 0.05
        ? ('improving' as const)
        : secondPositive < firstPositive - 0.05
          ? ('declining' as const)
          : ('stable' as const)

    return {
      totalSignals: relevant.length,
      positiveRate: positive / relevant.length,
      correctionRate: corrections / relevant.length,
      avgRating,
      topCorrectionCategories: topCategories,
      rewardTrend: trend,
    }
  }

  // ── Query for relevant lessons ─────────────────────────────────────────

  /** Find lessons relevant to a given context. */
  findRelevantLessons(context: string, domain?: string): CorrectionLesson[] {
    const lower = context.toLowerCase()
    const results: Array<{ lesson: CorrectionLesson; score: number }> = []

    for (const lesson of this.lessons.values()) {
      let score = 0
      const lessonWords = lesson.lesson
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
      const matchCount = lessonWords.filter(w => lower.includes(w)).length
      score += (matchCount / Math.max(lessonWords.length, 1)) * 0.5

      if (domain && lesson.domain === domain) score += 0.3
      score += lesson.confidence * 0.2

      if (score > 0.2) {
        results.push({ lesson, score })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(r => r.lesson)
  }

  // ── Public accessors ───────────────────────────────────────────────────

  /** Get all correction lessons. */
  getLessons(): readonly CorrectionLesson[] {
    return [...this.lessons.values()]
  }

  /** Get all tracked mistakes. */
  getMistakes(): readonly TrackedMistake[] {
    return [...this.mistakes.values()]
  }

  /** Get all feedback signals. */
  getSignals(): readonly FeedbackSignal[] {
    return [...this.signals]
  }

  // ── Statistics ─────────────────────────────────────────────────────────

  /** Get runtime statistics. */
  getStats(): Readonly<FeedbackLearnerStats> {
    return {
      totalSignalsReceived: this.stats.totalSignals,
      totalLessonsLearned: this.stats.totalLessons,
      totalMistakesTracked: this.stats.totalMistakes,
      avgCalibrationError:
        this.stats.calibrationCount > 0
          ? this.stats.totalCalibrationError / this.stats.calibrationCount
          : 0,
      positiveSignalRate:
        this.stats.totalSignals > 0 ? this.stats.positiveSignals / this.stats.totalSignals : 0,
      correctionRate:
        this.stats.totalSignals > 0 ? this.stats.corrections / this.stats.totalSignals : 0,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize engine state for persistence. */
  serialize(): string {
    return JSON.stringify({
      signals: this.signals.slice(-200),
      lessons: [...this.lessons.values()],
      mistakes: [...this.mistakes.values()],
      calibrationRecords: this.calibrationRecords.slice(-100),
      preferenceModels: [...this.preferenceModels.entries()],
      stats: this.stats,
    })
  }

  /** Restore engine state from serialized data. */
  static deserialize(json: string, config?: Partial<FeedbackLearnerConfig>): FeedbackLearner {
    const engine = new FeedbackLearner(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.signals)) {
        engine.signals.push(...data.signals)
      }
      if (Array.isArray(data.lessons)) {
        for (const l of data.lessons) engine.lessons.set(l.id, l)
      }
      if (Array.isArray(data.mistakes)) {
        for (const m of data.mistakes) engine.mistakes.set(m.id, m)
      }
      if (Array.isArray(data.calibrationRecords)) {
        engine.calibrationRecords.push(...data.calibrationRecords)
      }
      if (Array.isArray(data.preferenceModels)) {
        for (const [key, value] of data.preferenceModels) {
          engine.preferenceModels.set(key, value)
        }
      }
      if (data.stats) {
        Object.assign(engine.stats, data.stats)
      }
    } catch {
      // Return fresh engine on parse failure
    }
    return engine
  }
}
