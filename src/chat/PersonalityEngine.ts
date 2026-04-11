/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PersonalityEngine — Communication style & personality modeling            ║
 * ║                                                                            ║
 * ║  Models communication personalities, adapts tone and language style,       ║
 * ║  tracks user preferences, and provides persona-consistent responses.       ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Personality profile definition (Big Five traits)                     ║
 * ║    • Communication style detection & adaptation                           ║
 * ║    • Tone analysis (formal, casual, enthusiastic, etc.)                   ║
 * ║    • User preference learning & memory                                    ║
 * ║    • Persona template system                                              ║
 * ║    • Empathy modeling & emotional response calibration                    ║
 * ║    • Cultural context awareness                                           ║
 * ║    • Interaction history analysis                                         ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PersonalityTrait =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism'

export type CommunicationStyle = 'analytical' | 'driver' | 'expressive' | 'amiable'

export type ToneType =
  | 'formal'
  | 'casual'
  | 'enthusiastic'
  | 'empathetic'
  | 'professional'
  | 'humorous'
  | 'encouraging'
  | 'neutral'

export type CulturalContext =
  | 'western'
  | 'eastern'
  | 'middle_eastern'
  | 'latin'
  | 'african'
  | 'universal'

export interface PersonalityProfile {
  readonly id: string
  readonly name: string
  readonly traits: Readonly<Record<PersonalityTrait, number>> // 0–1 scale
  readonly communicationStyle: CommunicationStyle
  readonly preferredTone: ToneType
  readonly culturalContext: CulturalContext
  readonly verbosity: number // 0=terse, 1=verbose
  readonly formality: number // 0=casual, 1=formal
}

export interface PersonaTemplate {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly profile: PersonalityProfile
  readonly greetings: readonly string[]
  readonly signoffs: readonly string[]
  readonly fillerPhrases: readonly string[]
}

export interface ToneAnalysis {
  readonly text: string
  readonly detectedTone: ToneType
  readonly confidence: number
  readonly formalityScore: number
  readonly emotionality: number
  readonly directness: number
}

export interface UserPreference {
  readonly userId: string
  readonly preferredTone: ToneType
  readonly preferredVerbosity: number
  readonly topicInterests: readonly string[]
  readonly communicationStyle: CommunicationStyle
  readonly interactionCount: number
  readonly lastInteraction: number
}

export interface EmpathyResponse {
  readonly detectedEmotion: string
  readonly empathyLevel: number
  readonly suggestedTone: ToneType
  readonly suggestedOpener: string
  readonly suggestedApproach: string
}

export interface StyleAdaptation {
  readonly original: string
  readonly adapted: string
  readonly targetProfile: string
  readonly changesApplied: readonly string[]
}

export interface PersonalityEngineConfig {
  readonly maxProfiles: number
  readonly maxPersonas: number
  readonly maxUserPrefs: number
  readonly defaultTone: ToneType
  readonly defaultFormality: number
}

export interface PersonalityEngineStats {
  readonly totalProfiles: number
  readonly totalPersonas: number
  readonly totalToneAnalyses: number
  readonly totalAdaptations: number
  readonly totalEmpathyResponses: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_PERSONALITY_CONFIG: PersonalityEngineConfig = {
  maxProfiles: 100,
  maxPersonas: 50,
  maxUserPrefs: 1000,
  defaultTone: 'professional',
  defaultFormality: 0.6,
}

// ─── Data ──────────────────────────────────────────────────────────────────────

function buildToneKeywords(): ReadonlyMap<ToneType, readonly string[]> {
  const m = new Map<ToneType, readonly string[]>()
  m.set('formal', [
    'furthermore',
    'therefore',
    'consequently',
    'hereby',
    'pursuant',
    'regarding',
    'accordingly',
  ])
  m.set('casual', ['hey', 'cool', 'awesome', 'gonna', 'kinda', 'basically', 'pretty much', 'stuff'])
  m.set('enthusiastic', [
    'amazing',
    'fantastic',
    'incredible',
    'love',
    'excited',
    'wonderful',
    'brilliant',
  ])
  m.set('empathetic', [
    'understand',
    'feel',
    'sorry',
    'care',
    'support',
    'concern',
    'listen',
    'here for you',
  ])
  m.set('professional', [
    'recommend',
    'suggest',
    'analysis',
    'strategy',
    'implement',
    'objective',
    'deliverable',
  ])
  m.set('humorous', ['funny', 'joke', 'laugh', 'haha', 'ironic', 'amusing', 'entertaining'])
  m.set('encouraging', [
    'great job',
    'well done',
    'keep going',
    'proud',
    'progress',
    'capable',
    'believe',
  ])
  m.set('neutral', ['the', 'is', 'are', 'was', 'it', 'that', 'this'])
  return m
}

function buildEmotionKeywords(): ReadonlyMap<string, readonly string[]> {
  const m = new Map<string, readonly string[]>()
  m.set('happy', ['happy', 'glad', 'joy', 'excited', 'pleased', 'delighted', 'thrilled'])
  m.set('sad', ['sad', 'unhappy', 'depressed', 'down', 'upset', 'disappointed', 'heartbroken'])
  m.set('angry', ['angry', 'furious', 'mad', 'frustrated', 'irritated', 'annoyed', 'outraged'])
  m.set('anxious', ['anxious', 'worried', 'nervous', 'stressed', 'concerned', 'afraid', 'uneasy'])
  m.set('confused', ['confused', 'lost', 'unsure', 'uncertain', 'puzzled', 'bewildered'])
  m.set('grateful', ['thank', 'grateful', 'appreciate', 'thankful', 'blessed'])
  return m
}

const TONE_KEYWORDS = buildToneKeywords()
const EMOTION_KEYWORDS = buildEmotionKeywords()

// ─── Engine ────────────────────────────────────────────────────────────────────

export class PersonalityEngine {
  private readonly config: PersonalityEngineConfig
  private readonly profiles = new Map<string, PersonalityProfile>()
  private readonly personas = new Map<string, PersonaTemplate>()
  private readonly userPrefs = new Map<string, UserPreference>()
  private stats = {
    totalProfiles: 0,
    totalPersonas: 0,
    totalToneAnalyses: 0,
    totalAdaptations: 0,
    totalEmpathyResponses: 0,
    feedbackCount: 0,
  }

  constructor(config: Partial<PersonalityEngineConfig> = {}) {
    this.config = { ...DEFAULT_PERSONALITY_CONFIG, ...config }
  }

  // ── Profile management ───────────────────────────────────────────────

  createProfile(
    name: string,
    traits: Record<PersonalityTrait, number>,
    options: {
      communicationStyle?: CommunicationStyle
      preferredTone?: ToneType
      culturalContext?: CulturalContext
      verbosity?: number
      formality?: number
    } = {},
  ): PersonalityProfile {
    const id = `prof_${++this.stats.totalProfiles}`
    const clamped: Record<PersonalityTrait, number> = {} as Record<PersonalityTrait, number>
    for (const [k, v] of Object.entries(traits)) {
      clamped[k as PersonalityTrait] = Math.max(0, Math.min(1, v))
    }
    const profile: PersonalityProfile = {
      id,
      name,
      traits: clamped,
      communicationStyle: options.communicationStyle ?? this.inferStyle(clamped),
      preferredTone: options.preferredTone ?? this.config.defaultTone,
      culturalContext: options.culturalContext ?? 'universal',
      verbosity: options.verbosity ?? 0.5,
      formality: options.formality ?? this.config.defaultFormality,
    }
    this.profiles.set(id, profile)
    return profile
  }

  getProfile(id: string): PersonalityProfile | null {
    return this.profiles.get(id) ?? null
  }

  private inferStyle(traits: Record<PersonalityTrait, number>): CommunicationStyle {
    const { extraversion, agreeableness, conscientiousness } = traits
    if (extraversion > 0.6 && agreeableness > 0.6) return 'expressive'
    if (extraversion > 0.6 && agreeableness <= 0.6) return 'driver'
    if (extraversion <= 0.6 && conscientiousness > 0.6) return 'analytical'
    return 'amiable'
  }

  // ── Persona templates ────────────────────────────────────────────────

  createPersona(
    name: string,
    description: string,
    profile: PersonalityProfile,
    greetings: string[],
    signoffs: string[],
    fillers: string[] = [],
  ): PersonaTemplate {
    const id = `persona_${++this.stats.totalPersonas}`
    const persona: PersonaTemplate = {
      id,
      name,
      description,
      profile,
      greetings,
      signoffs,
      fillerPhrases: fillers,
    }
    this.personas.set(id, persona)
    return persona
  }

  getPersona(id: string): PersonaTemplate | null {
    return this.personas.get(id) ?? null
  }

  listPersonas(): PersonaTemplate[] {
    return [...this.personas.values()]
  }

  // ── Tone analysis ────────────────────────────────────────────────────

  analyzeTone(text: string): ToneAnalysis {
    this.stats.totalToneAnalyses++
    const lower = text.toLowerCase()
    const words = lower.split(/\s+/)

    let bestTone: ToneType = 'neutral'
    let bestScore = 0

    for (const [tone, keywords] of TONE_KEYWORDS) {
      const matches = keywords.filter(k => lower.includes(k)).length
      const score = matches / keywords.length
      if (score > bestScore) {
        bestScore = score
        bestTone = tone
      }
    }

    // Formality: longer sentences + formal keywords = more formal
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(1, words.length)
    const formalityScore = Math.min(1, (avgWordLen - 3) / 4)

    // Emotionality: presence of emotion keywords and punctuation
    const exclamations = (text.match(/!/g) ?? []).length
    const questions = (text.match(/\?/g) ?? []).length
    const emotionality = Math.min(1, exclamations * 0.2 + questions * 0.1 + bestScore * 0.5)

    // Directness: short sentences, imperative mood
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentLen = words.length / Math.max(1, sentences.length)
    const directness = Math.min(1, Math.max(0, 1 - (avgSentLen - 5) / 20))

    return {
      text,
      detectedTone: bestTone,
      confidence: Math.max(0.3, bestScore),
      formalityScore,
      emotionality,
      directness,
    }
  }

  // ── Empathy response ─────────────────────────────────────────────────

  generateEmpathyResponse(userText: string): EmpathyResponse {
    this.stats.totalEmpathyResponses++
    const lower = userText.toLowerCase()

    let detectedEmotion = 'neutral'
    let maxMatches = 0
    for (const [emotion, keywords] of EMOTION_KEYWORDS) {
      const matches = keywords.filter(k => lower.includes(k)).length
      if (matches > maxMatches) {
        maxMatches = matches
        detectedEmotion = emotion
      }
    }

    const empathyLevel = Math.min(1, maxMatches * 0.25 + 0.3)

    const toneMap: Record<string, ToneType> = {
      happy: 'enthusiastic',
      sad: 'empathetic',
      angry: 'empathetic',
      anxious: 'encouraging',
      confused: 'professional',
      grateful: 'enthusiastic',
      neutral: 'professional',
    }

    const openerMap: Record<string, string> = {
      happy: "That's wonderful to hear!",
      sad: "I'm sorry you're feeling this way.",
      angry: 'I understand your frustration.',
      anxious: "It's okay to feel that way. Let's work through this.",
      confused: 'Let me help clarify things for you.',
      grateful: 'I appreciate your kind words!',
      neutral: "I'm here to help.",
    }

    const approachMap: Record<string, string> = {
      happy: 'Build on the positive momentum',
      sad: 'Offer support and acknowledge their feelings',
      angry: 'Listen actively and validate concerns before problem-solving',
      anxious: 'Provide reassurance and break the problem into manageable steps',
      confused: 'Explain clearly with examples and check understanding',
      grateful: 'Acknowledge and continue providing excellent support',
      neutral: 'Engage with clear, helpful information',
    }

    return {
      detectedEmotion,
      empathyLevel,
      suggestedTone: toneMap[detectedEmotion] ?? 'professional',
      suggestedOpener: openerMap[detectedEmotion] ?? "I'm here to help.",
      suggestedApproach: approachMap[detectedEmotion] ?? 'Provide helpful information',
    }
  }

  // ── Style adaptation ─────────────────────────────────────────────────

  adaptToProfile(text: string, profileId: string): StyleAdaptation | null {
    const profile = this.profiles.get(profileId)
    if (!profile) return null

    this.stats.totalAdaptations++
    const changes: string[] = []
    let adapted = text

    // Adjust formality
    if (profile.formality > 0.7) {
      adapted = adapted
        .replace(/\bdon't\b/g, 'do not')
        .replace(/\bcan't\b/g, 'cannot')
        .replace(/\bwon't\b/g, 'will not')
      adapted = adapted.replace(/\bgonna\b/g, 'going to').replace(/\bwanna\b/g, 'want to')
      changes.push('Increased formality (expanded contractions)')
    } else if (profile.formality < 0.3) {
      adapted = adapted
        .replace(/\bdo not\b/g, "don't")
        .replace(/\bcannot\b/g, "can't")
        .replace(/\bwill not\b/g, "won't")
      changes.push('Decreased formality (used contractions)')
    }

    // Adjust verbosity
    if (profile.verbosity < 0.3) {
      const sentences = adapted.split(/(?<=[.!?])\s+/)
      if (sentences.length > 3) {
        adapted = sentences.slice(0, 3).join(' ')
        changes.push('Reduced verbosity (trimmed to key sentences)')
      }
    }

    // Add persona touches
    if (profile.communicationStyle === 'expressive') {
      if (!adapted.endsWith('!')) adapted += '!'
      changes.push('Added expressive punctuation')
    }

    return { original: text, adapted, targetProfile: profile.name, changesApplied: changes }
  }

  // ── User preference tracking ─────────────────────────────────────────

  updateUserPreference(
    userId: string,
    updates: Partial<Omit<UserPreference, 'userId' | 'interactionCount' | 'lastInteraction'>>,
  ): UserPreference {
    const existing = this.userPrefs.get(userId)
    const pref: UserPreference = {
      userId,
      preferredTone: updates.preferredTone ?? existing?.preferredTone ?? this.config.defaultTone,
      preferredVerbosity: updates.preferredVerbosity ?? existing?.preferredVerbosity ?? 0.5,
      topicInterests: updates.topicInterests ?? existing?.topicInterests ?? [],
      communicationStyle: updates.communicationStyle ?? existing?.communicationStyle ?? 'amiable',
      interactionCount: (existing?.interactionCount ?? 0) + 1,
      lastInteraction: Date.now(),
    }
    this.userPrefs.set(userId, pref)
    return pref
  }

  getUserPreference(userId: string): UserPreference | null {
    return this.userPrefs.get(userId) ?? null
  }

  // ── Stats & serialization ────────────────────────────────────────────

  getStats(): Readonly<PersonalityEngineStats> {
    return { ...this.stats }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  serialize(): string {
    return JSON.stringify({
      profiles: [...this.profiles.values()],
      personas: [...this.personas.values()],
      userPrefs: [...this.userPrefs.values()],
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<PersonalityEngineConfig>): PersonalityEngine {
    const data = JSON.parse(json)
    const engine = new PersonalityEngine(config)
    for (const p of data.profiles ?? []) engine.profiles.set(p.id, p)
    for (const p of data.personas ?? []) engine.personas.set(p.id, p)
    for (const u of data.userPrefs ?? []) engine.userPrefs.set(u.userId, u)
    Object.assign(engine.stats, data.stats ?? {})
    return engine
  }
}
