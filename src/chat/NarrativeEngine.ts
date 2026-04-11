/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Narrative Engine — Story Analysis & Generation                              ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Story Analysis — Break text into narrative components                    ║
 * ║    ✦ Arc Detection — Rising/falling action, climax, resolution               ║
 * ║    ✦ Character Tracking — Arcs, relations, and trait evolution                ║
 * ║    ✦ Plot Point Extraction — Key events from text                            ║
 * ║    ✦ Theme Extraction — Recurring thematic elements                          ║
 * ║    ✦ Structure Classification — Three-act, hero's journey, etc.              ║
 * ║    ✦ Story Generation — Generate next narrative beats                        ║
 * ║    ✦ Coherence Analysis — Narrative consistency scoring                      ║
 * ║    ✦ Tension Curve — Map tension across story beats                          ║
 * ║    ✦ Foreshadowing Detection — Identify planted/paid-off elements            ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface NarrativeEngineConfig {
  maxBeats: number // default 100
  maxCharacters: number // default 50
  tensionDecayRate: number // default 0.15
  foreshadowingThreshold: number // default 0.3
  coherenceWindow: number // default 10
  arcSmoothingFactor: number // default 0.25
  themeMinOccurrences: number // default 2
  plotPointRelevanceMin: number // default 0.2
}

export type ArcPhase =
  | 'exposition'
  | 'rising_action'
  | 'climax'
  | 'falling_action'
  | 'resolution'
  | 'denouement'

export type StructureType =
  | 'three_act'
  | 'heros_journey'
  | 'five_act'
  | 'kishotenketsu'
  | 'freytag_pyramid'
  | 'in_medias_res'
  | 'frame_narrative'
  | 'unknown'

export type CharacterRole =
  | 'protagonist'
  | 'antagonist'
  | 'mentor'
  | 'sidekick'
  | 'love_interest'
  | 'trickster'
  | 'herald'
  | 'threshold_guardian'
  | 'supporting'
  | 'unknown'

export type RelationType =
  | 'ally'
  | 'enemy'
  | 'mentor_student'
  | 'romantic'
  | 'rival'
  | 'family'
  | 'neutral'

export interface StoryBeat {
  id: string
  index: number
  text: string
  phase: ArcPhase
  tension: number // 0-1
  characters: string[] // character IDs present
  themes: string[] // theme IDs active
  timestamp: number
}

export interface PlotPoint {
  id: string
  beatId: string
  description: string
  significance: number // 0-1
  type:
    | 'inciting_incident'
    | 'turning_point'
    | 'climax'
    | 'resolution'
    | 'revelation'
    | 'setback'
    | 'milestone'
  characters: string[]
  causalLinks: string[] // IDs of plot points this follows from
}

export interface NarrativeArc {
  id: string
  name: string
  beats: string[] // beat IDs in order
  phases: ArcPhase[]
  tensionCurve: number[]
  peakTension: number
  peakIndex: number
  resolved: boolean
}

export interface Character {
  id: string
  name: string
  traits: string[]
  role: CharacterRole
  firstAppearance: number // beat index
  mentions: number
  active: boolean
}

export interface CharacterArc {
  characterId: string
  beats: string[]
  traitProgression: Array<{ beatIndex: number; traits: string[] }>
  roleShifts: Array<{ beatIndex: number; from: CharacterRole; to: CharacterRole }>
  tensionContribution: number[]
}

export interface CharacterRelation {
  characterA: string
  characterB: string
  type: RelationType
  strength: number // 0-1
  firstInteraction: number // beat index
  coAppearances: number
}

export interface NarrativeStructure {
  type: StructureType
  confidence: number // 0-1
  matchedPhases: Array<{ phase: string; startBeat: number; endBeat: number }>
}

export interface Theme {
  id: string
  name: string
  keywords: string[]
  occurrences: number
  firstSeen: number // beat index
  lastSeen: number // beat index
  strength: number // 0-1
}

export interface NarrativePattern {
  name: string
  description: string
  occurrences: Array<{ startBeat: number; endBeat: number }>
  confidence: number
}

export interface ForeshadowingElement {
  plantBeatId: string
  payoffBeatId: string | null
  description: string
  keywords: string[]
  resolved: boolean
  confidence: number
}

export interface CoherenceReport {
  overallScore: number // 0-1
  characterConsistency: number
  plotConsistency: number
  thematicConsistency: number
  temporalConsistency: number
  issues: string[]
}

export interface TensionPoint {
  beatIndex: number
  tension: number
  phase: ArcPhase
  label: string
}

export interface NarrativeAnalysis {
  structure: NarrativeStructure
  arcs: NarrativeArc[]
  plotPoints: PlotPoint[]
  themes: Theme[]
  characters: Character[]
  coherence: CoherenceReport
  tensionCurve: TensionPoint[]
  foreshadowing: ForeshadowingElement[]
  patterns: NarrativePattern[]
  summary: string
}

export interface NarrativeEngineStats {
  totalBeats: number
  totalCharacters: number
  totalPlotPoints: number
  totalThemes: number
  totalArcs: number
  averageTension: number
  resolvedForeshadowing: number
  unresolvedForeshadowing: number
}

// ── Constants ────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the',
  'be',
  'to',
  'of',
  'and',
  'a',
  'in',
  'that',
  'have',
  'i',
  'it',
  'for',
  'not',
  'on',
  'with',
  'he',
  'as',
  'you',
  'do',
  'at',
  'this',
  'but',
  'his',
  'by',
  'from',
  'they',
  'we',
  'say',
  'her',
  'she',
  'or',
  'an',
  'will',
  'my',
  'one',
  'all',
  'would',
  'there',
  'their',
  'what',
  'so',
  'up',
  'out',
  'if',
  'about',
  'who',
  'get',
  'which',
  'go',
  'me',
  'when',
  'make',
  'can',
  'like',
  'no',
  'just',
  'him',
  'know',
  'take',
  'into',
  'your',
  'some',
  'could',
  'them',
  'see',
  'other',
  'than',
  'then',
  'now',
  'only',
  'come',
  'its',
  'over',
  'also',
  'back',
  'after',
  'how',
  'is',
  'are',
  'was',
  'were',
  'been',
  'has',
  'had',
  'did',
  'does',
  'am',
  'being',
  'doing',
  'should',
  'very',
  'much',
  'such',
  'each',
  'every',
  'own',
  'same',
  'too',
  'more',
  'need',
  'still',
  'between',
  'must',
  'through',
  'while',
  'where',
  'before',
  'those',
  'may',
])

const DEFAULT_CONFIG: NarrativeEngineConfig = {
  maxBeats: 100,
  maxCharacters: 50,
  tensionDecayRate: 0.15,
  foreshadowingThreshold: 0.3,
  coherenceWindow: 10,
  arcSmoothingFactor: 0.25,
  themeMinOccurrences: 2,
  plotPointRelevanceMin: 0.2,
}

/** Keywords that indicate rising tension. */
const TENSION_ESCALATORS = new Set([
  'danger',
  'fight',
  'battle',
  'war',
  'attack',
  'conflict',
  'threat',
  'chase',
  'escape',
  'scream',
  'fear',
  'terror',
  'rage',
  'fury',
  'desperate',
  'urgent',
  'crisis',
  'betrayal',
  'confront',
  'struggle',
  'destroy',
  'death',
  'kill',
  'wound',
  'trap',
  'showdown',
  'disaster',
])

/** Keywords that indicate falling tension / resolution. */
const TENSION_REDUCERS = new Set([
  'peace',
  'calm',
  'rest',
  'safe',
  'home',
  'love',
  'hope',
  'heal',
  'resolve',
  'forgive',
  'reunite',
  'celebrate',
  'victory',
  'triumph',
  'comfort',
  'embrace',
  'smile',
  'laugh',
  'joy',
  'harmony',
  'relief',
  'rescue',
  'save',
  'recover',
  'rebuild',
  'return',
  'dawn',
  'friend',
])

/** Theme lexicons mapping theme names to associated keywords. */
const THEME_LEXICONS: Array<{ name: string; keywords: string[] }> = [
  {
    name: 'love',
    keywords: ['love', 'heart', 'passion', 'romance', 'desire', 'affection', 'devotion'],
  },
  {
    name: 'power',
    keywords: ['power', 'control', 'authority', 'throne', 'rule', 'command', 'dominion'],
  },
  {
    name: 'redemption',
    keywords: ['redemption', 'forgive', 'atone', 'repent', 'salvation', 'mercy', 'guilt'],
  },
  {
    name: 'identity',
    keywords: ['identity', 'self', 'mask', 'mirror', 'true', 'discover', 'belong'],
  },
  {
    name: 'sacrifice',
    keywords: ['sacrifice', 'cost', 'price', 'loss', 'martyr', 'selfless', 'noble'],
  },
  { name: 'justice', keywords: ['justice', 'law', 'fair', 'right', 'wrong', 'judge', 'trial'] },
  { name: 'freedom', keywords: ['freedom', 'free', 'liberty', 'escape', 'cage', 'chain', 'rebel'] },
  {
    name: 'mortality',
    keywords: ['death', 'mortal', 'dying', 'grave', 'life', 'eternal', 'immortal'],
  },
  {
    name: 'betrayal',
    keywords: ['betray', 'traitor', 'deceive', 'lie', 'trust', 'broken', 'treachery'],
  },
  {
    name: 'growth',
    keywords: ['grow', 'learn', 'change', 'mature', 'wisdom', 'journey', 'evolve'],
  },
  {
    name: 'isolation',
    keywords: ['alone', 'lonely', 'exile', 'solitude', 'abandoned', 'outcast', 'distant'],
  },
  { name: 'courage', keywords: ['brave', 'courage', 'hero', 'fearless', 'bold', 'valor', 'defy'] },
]

/** Structure templates used for classifying narrative structure. */
const STRUCTURE_TEMPLATES: Array<{ type: StructureType; phases: string[]; weights: number[] }> = [
  {
    type: 'three_act',
    phases: ['setup', 'confrontation', 'resolution'],
    weights: [0.25, 0.5, 0.25],
  },
  {
    type: 'heros_journey',
    phases: [
      'ordinary_world',
      'call_to_adventure',
      'crossing_threshold',
      'trials',
      'ordeal',
      'reward',
      'return',
    ],
    weights: [0.1, 0.1, 0.1, 0.25, 0.2, 0.15, 0.1],
  },
  {
    type: 'five_act',
    phases: ['exposition', 'rising_action', 'climax', 'falling_action', 'denouement'],
    weights: [0.15, 0.25, 0.2, 0.25, 0.15],
  },
  {
    type: 'freytag_pyramid',
    phases: ['exposition', 'rising_action', 'climax', 'falling_action', 'catastrophe'],
    weights: [0.15, 0.3, 0.15, 0.25, 0.15],
  },
  {
    type: 'kishotenketsu',
    phases: ['introduction', 'development', 'twist', 'conclusion'],
    weights: [0.25, 0.25, 0.25, 0.25],
  },
]

/** Plot-point indicator keywords mapped to their type. */
const PLOT_POINT_INDICATORS: Array<{ type: PlotPoint['type']; keywords: string[] }> = [
  {
    type: 'inciting_incident',
    keywords: ['suddenly', 'discover', 'arrive', 'appear', 'begin', 'unexpected', 'surprise'],
  },
  {
    type: 'turning_point',
    keywords: ['realize', 'change', 'shift', 'transform', 'decision', 'choose', 'reveal'],
  },
  {
    type: 'climax',
    keywords: ['final', 'ultimate', 'showdown', 'confront', 'face', 'battle', 'last'],
  },
  {
    type: 'resolution',
    keywords: ['resolve', 'settle', 'peace', 'end', 'conclude', 'finish', 'achieve'],
  },
  {
    type: 'revelation',
    keywords: ['reveal', 'secret', 'truth', 'uncover', 'expose', 'confess', 'hidden'],
  },
  {
    type: 'setback',
    keywords: ['fail', 'lose', 'defeat', 'fall', 'collapse', 'break', 'captured'],
  },
  {
    type: 'milestone',
    keywords: ['achieve', 'reach', 'accomplish', 'gain', 'earn', 'win', 'overcome'],
  },
]

/** Narrative pattern templates. */
const NARRATIVE_PATTERNS: Array<{ name: string; description: string; tensionShape: number[] }> = [
  {
    name: 'reversal',
    description: 'A sudden shift in fortune or expectation',
    tensionShape: [0.3, 0.5, 0.8, 0.2],
  },
  {
    name: 'escalation',
    description: 'Steadily increasing stakes and tension',
    tensionShape: [0.2, 0.4, 0.6, 0.8],
  },
  {
    name: 'false_victory',
    description: 'Apparent success followed by greater setback',
    tensionShape: [0.6, 0.3, 0.8, 0.9],
  },
  {
    name: 'darkest_hour',
    description: 'Hope at lowest point before final triumph',
    tensionShape: [0.5, 0.7, 0.9, 0.3],
  },
  {
    name: 'mirror',
    description: 'Events echo or repeat with variation',
    tensionShape: [0.5, 0.3, 0.5, 0.3],
  },
  {
    name: 'convergence',
    description: 'Multiple threads coming together',
    tensionShape: [0.3, 0.4, 0.5, 0.9],
  },
]

// ── Internal Helpers ─────────────────────────────────────────────────────

/** Tokenize text into lowercase words, filtering stop words and short tokens. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
}

/** Split text into sentence-like segments. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/** Monotonically increasing counter for unique IDs. */
let idCounter = 0

/** Generate a unique ID with the given prefix. */
function generateId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`
}

/** Compute cosine similarity between two number arrays. */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom > 0 ? dot / denom : 0
}

/** Clamp a value between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Smooth a numeric array using a simple moving average. */
function smoothArray(arr: number[], windowSize: number): number[] {
  if (arr.length === 0) return []
  const result: number[] = []
  const half = Math.floor(windowSize / 2)
  for (let i = 0; i < arr.length; i++) {
    let sum = 0
    let count = 0
    for (let j = Math.max(0, i - half); j <= Math.min(arr.length - 1, i + half); j++) {
      sum += arr[j]
      count++
    }
    result.push(sum / count)
  }
  return result
}

/** Compute how well a tension curve matches a pattern shape. */
function shapeSimilarity(curve: number[], shape: number[]): number {
  if (curve.length < shape.length) return 0

  // Resample curve to match shape length
  const resampled: number[] = []
  for (let i = 0; i < shape.length; i++) {
    const idx = Math.floor((i / shape.length) * curve.length)
    resampled.push(curve[Math.min(idx, curve.length - 1)])
  }

  return cosineSimilarity(resampled, shape)
}

// ── NarrativeEngine ──────────────────────────────────────────────────────

export class NarrativeEngine {
  private beats: Map<string, StoryBeat> = new Map()
  private beatOrder: string[] = []
  private characters: Map<string, Character> = new Map()
  private characterArcs: Map<string, CharacterArc> = new Map()
  private relations: CharacterRelation[] = []
  private plotPoints: Map<string, PlotPoint> = new Map()
  private themes: Map<string, Theme> = new Map()
  private arcs: Map<string, NarrativeArc> = new Map()
  private foreshadowing: ForeshadowingElement[] = []
  private config: NarrativeEngineConfig

  constructor(config: Partial<NarrativeEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ── Story Analysis ──────────────────────────────────────────────────

  /**
   * Full narrative analysis: breaks text into beats, extracts all
   * narrative components, and returns a comprehensive analysis.
   */
  analyzeNarrative(text: string): NarrativeAnalysis {
    const sentences = splitSentences(text)
    if (sentences.length === 0) {
      return this.emptyAnalysis()
    }

    // Add each sentence as a beat
    const addedBeatIds: string[] = []
    for (const sentence of sentences) {
      const id = this.addBeat(sentence)
      addedBeatIds.push(id)
    }

    // Run all analyses
    const detectedArcs = this.detectArcs()
    const extractedPlotPoints = this.extractPlotPoints(text)
    const extractedThemes = this.extractThemes()
    const structure = this.classifyStructure()
    const coherence = this.analyzeCoherence()
    const tensionCurve = this.buildTensionCurve()
    const foreshadowingElements = this.detectForeshadowing()
    const patterns = this.detectPatterns()
    const summary = this.summarizeNarrative()

    return {
      structure,
      arcs: detectedArcs,
      plotPoints: extractedPlotPoints,
      themes: extractedThemes,
      characters: Array.from(this.characters.values()),
      coherence,
      tensionCurve,
      foreshadowing: foreshadowingElements,
      patterns,
      summary,
    }
  }

  // ── Beat Management ─────────────────────────────────────────────────

  /** Add a story beat and classify its phase and tension. */
  addBeat(text: string): string {
    if (this.beatOrder.length >= this.config.maxBeats) {
      const oldest = this.beatOrder.shift()!
      this.beats.delete(oldest)
    }

    const id = generateId('beat')
    const index = this.beatOrder.length
    const tokens = tokenize(text)
    const tension = this.computeBeatTension(tokens)
    const phase = this.classifyPhase(index, tension)
    const characterIds = this.detectCharactersInText(text)
    const themeIds = this.detectThemesInTokens(tokens)

    const beat: StoryBeat = {
      id,
      index,
      text,
      phase,
      tension,
      characters: characterIds,
      themes: themeIds,
      timestamp: Date.now(),
    }

    this.beats.set(id, beat)
    this.beatOrder.push(id)

    // Update character mentions
    for (const charId of characterIds) {
      const char = this.characters.get(charId)
      if (char) {
        char.mentions++
        char.active = true
      }
    }

    // Update co-appearance relations
    this.updateRelationsForBeat(characterIds, index)

    return id
  }

  /** Get a beat by ID. */
  getBeat(id: string): StoryBeat | null {
    return this.beats.get(id) ?? null
  }

  /** Get all beats in order. */
  getBeats(): StoryBeat[] {
    return this.beatOrder.map(id => this.beats.get(id)!).filter(Boolean)
  }

  // ── Arc Detection ───────────────────────────────────────────────────

  /** Detect narrative arcs from the current beats. */
  detectArcs(): NarrativeArc[] {
    const beats = this.getBeats()
    if (beats.length < 3) return []

    const tensions = beats.map(b => b.tension)
    const smoothed = smoothArray(tensions, 3)

    // Find peaks (potential climax points)
    const peaks: number[] = []
    for (let i = 1; i < smoothed.length - 1; i++) {
      if (smoothed[i] > smoothed[i - 1] && smoothed[i] >= smoothed[i + 1]) {
        if (smoothed[i] > 0.4) {
          peaks.push(i)
        }
      }
    }

    // If no peaks, treat the max tension point as the single peak
    if (peaks.length === 0) {
      let maxIdx = 0
      for (let i = 1; i < smoothed.length; i++) {
        if (smoothed[i] > smoothed[maxIdx]) maxIdx = i
      }
      peaks.push(maxIdx)
    }

    // Merge close peaks
    const mergedPeaks: number[] = [peaks[0]]
    for (let i = 1; i < peaks.length; i++) {
      if (peaks[i] - mergedPeaks[mergedPeaks.length - 1] > 3) {
        mergedPeaks.push(peaks[i])
      }
    }

    // Build arcs around peaks
    this.arcs.clear()
    const detectedArcs: NarrativeArc[] = []

    for (let pi = 0; pi < mergedPeaks.length; pi++) {
      const peakIdx = mergedPeaks[pi]
      const start = pi === 0 ? 0 : Math.floor((mergedPeaks[pi - 1] + peakIdx) / 2)
      const end =
        pi === mergedPeaks.length - 1
          ? beats.length - 1
          : Math.floor((peakIdx + mergedPeaks[pi + 1]) / 2)

      const arcBeats = beats.slice(start, end + 1)
      const arcBeatIds = arcBeats.map(b => b.id)
      const arcTensions = arcBeats.map(b => b.tension)
      const arcPhases = arcBeats.map(b => b.phase)

      const arc: NarrativeArc = {
        id: generateId('arc'),
        name: `Arc ${pi + 1}`,
        beats: arcBeatIds,
        phases: arcPhases,
        tensionCurve: arcTensions,
        peakTension: smoothed[peakIdx],
        peakIndex: peakIdx - start,
        resolved: end === beats.length - 1 && arcTensions[arcTensions.length - 1] < 0.3,
      }

      this.arcs.set(arc.id, arc)
      detectedArcs.push(arc)
    }

    return detectedArcs
  }

  /** Get all detected arcs. */
  getArcs(): NarrativeArc[] {
    return Array.from(this.arcs.values())
  }

  // ── Character Tracking ──────────────────────────────────────────────

  /** Add a character to the engine. */
  addCharacter(name: string, role: CharacterRole = 'unknown', traits: string[] = []): Character {
    if (this.characters.size >= this.config.maxCharacters) {
      // Evict least-mentioned inactive character
      let leastMentioned: Character | null = null
      for (const char of this.characters.values()) {
        if (!char.active && (!leastMentioned || char.mentions < leastMentioned.mentions)) {
          leastMentioned = char
        }
      }
      if (leastMentioned) {
        this.characters.delete(leastMentioned.id)
        this.characterArcs.delete(leastMentioned.id)
      }
    }

    const id = generateId('char')
    const character: Character = {
      id,
      name,
      traits: [...traits],
      role,
      firstAppearance: this.beatOrder.length,
      mentions: 0,
      active: true,
    }

    this.characters.set(id, character)
    this.characterArcs.set(id, {
      characterId: id,
      beats: [],
      traitProgression: [{ beatIndex: character.firstAppearance, traits: [...traits] }],
      roleShifts: [],
      tensionContribution: [],
    })

    return character
  }

  /** Get a character by ID. */
  getCharacter(id: string): Character | null {
    return this.characters.get(id) ?? null
  }

  /** Find a character by name (case-insensitive). */
  getCharacterByName(name: string): Character | null {
    const lower = name.toLowerCase()
    for (const char of this.characters.values()) {
      if (char.name.toLowerCase() === lower) return char
    }
    return null
  }

  /** Get all characters. */
  getCharacters(): Character[] {
    return Array.from(this.characters.values())
  }

  /** Track character arc progression — record trait changes for a beat. */
  trackCharacterArc(
    characterId: string,
    beatIndex: number,
    newTraits?: string[],
    newRole?: CharacterRole,
  ): CharacterArc | null {
    const char = this.characters.get(characterId)
    const arc = this.characterArcs.get(characterId)
    if (!char || !arc) return null

    const beat = this.beatOrder[beatIndex]
    if (beat) {
      arc.beats.push(beat)
    }

    if (newTraits && newTraits.length > 0) {
      char.traits = [...newTraits]
      arc.traitProgression.push({ beatIndex, traits: [...newTraits] })
    }

    if (newRole && newRole !== char.role) {
      arc.roleShifts.push({ beatIndex, from: char.role, to: newRole })
      char.role = newRole
    }

    // Compute tension contribution based on beats where this character appears
    const beats = this.getBeats()
    arc.tensionContribution = beats
      .filter(b => b.characters.includes(characterId))
      .map(b => b.tension)

    return { ...arc }
  }

  /** Get the arc for a character. */
  getCharacterArc(characterId: string): CharacterArc | null {
    const arc = this.characterArcs.get(characterId)
    return arc ? { ...arc } : null
  }

  /** Get all relations for a character. */
  getCharacterRelations(characterId?: string): CharacterRelation[] {
    if (!characterId) return [...this.relations]
    return this.relations.filter(r => r.characterA === characterId || r.characterB === characterId)
  }

  /** Manually add a relation between two characters. */
  addRelation(
    characterA: string,
    characterB: string,
    type: RelationType,
    strength: number = 0.5,
  ): CharacterRelation | null {
    if (!this.characters.has(characterA) || !this.characters.has(characterB)) return null

    // Check for existing relation
    const existing = this.relations.find(
      r =>
        (r.characterA === characterA && r.characterB === characterB) ||
        (r.characterA === characterB && r.characterB === characterA),
    )
    if (existing) {
      existing.type = type
      existing.strength = clamp(strength, 0, 1)
      return { ...existing }
    }

    const relation: CharacterRelation = {
      characterA,
      characterB,
      type,
      strength: clamp(strength, 0, 1),
      firstInteraction: this.beatOrder.length,
      coAppearances: 0,
    }

    this.relations.push(relation)
    return { ...relation }
  }

  // ── Plot Point Extraction ───────────────────────────────────────────

  /** Extract plot points from text based on keyword indicators. */
  extractPlotPoints(text: string): PlotPoint[] {
    const sentences = splitSentences(text)
    const extracted: PlotPoint[] = []

    for (const sentence of sentences) {
      const tokens = tokenize(sentence)
      if (tokens.length === 0) continue

      let bestType: PlotPoint['type'] = 'milestone'
      let bestScore = 0

      for (const indicator of PLOT_POINT_INDICATORS) {
        let score = 0
        for (const kw of indicator.keywords) {
          if (tokens.includes(kw)) {
            score += 1 / indicator.keywords.length
          }
        }
        if (score > bestScore) {
          bestScore = score
          bestType = indicator.type
        }
      }

      if (bestScore < this.config.plotPointRelevanceMin) continue

      // Find the beat this sentence corresponds to
      let matchedBeatId = ''
      for (const [id, beat] of this.beats) {
        if (beat.text === sentence) {
          matchedBeatId = id
          break
        }
      }

      const characterIds = this.detectCharactersInText(sentence)

      // Link to previous plot point if one exists
      const causalLinks: string[] = []
      if (extracted.length > 0) {
        causalLinks.push(extracted[extracted.length - 1].id)
      }

      const plotPoint: PlotPoint = {
        id: generateId('pp'),
        beatId: matchedBeatId,
        description: sentence.length > 120 ? sentence.slice(0, 117) + '...' : sentence,
        significance: clamp(bestScore, 0, 1),
        type: bestType,
        characters: characterIds,
        causalLinks,
      }

      this.plotPoints.set(plotPoint.id, plotPoint)
      extracted.push(plotPoint)
    }

    return extracted
  }

  /** Get all plot points. */
  getPlotPoints(): PlotPoint[] {
    return Array.from(this.plotPoints.values())
  }

  // ── Theme Extraction ────────────────────────────────────────────────

  /** Extract themes from all current beats using theme lexicons. */
  extractThemes(): Theme[] {
    const beats = this.getBeats()
    if (beats.length === 0) return []

    const themeCounts = new Map<
      string,
      {
        keywords: string[]
        occurrences: number
        firstSeen: number
        lastSeen: number
        totalStrength: number
      }
    >()

    for (const beat of beats) {
      const tokens = tokenize(beat.text)
      const tokenSet = new Set(tokens)

      for (const lexicon of THEME_LEXICONS) {
        let matchCount = 0
        const matchedKeywords: string[] = []
        for (const kw of lexicon.keywords) {
          if (tokenSet.has(kw)) {
            matchCount++
            matchedKeywords.push(kw)
          }
        }

        if (matchCount === 0) continue

        const strength = matchCount / lexicon.keywords.length
        const existing = themeCounts.get(lexicon.name)
        if (existing) {
          existing.occurrences++
          existing.lastSeen = beat.index
          existing.totalStrength += strength
          for (const kw of matchedKeywords) {
            if (!existing.keywords.includes(kw)) existing.keywords.push(kw)
          }
        } else {
          themeCounts.set(lexicon.name, {
            keywords: matchedKeywords,
            occurrences: 1,
            firstSeen: beat.index,
            lastSeen: beat.index,
            totalStrength: strength,
          })
        }
      }
    }

    // Filter by minimum occurrences and build Theme objects
    this.themes.clear()
    const extractedThemes: Theme[] = []

    for (const [name, data] of themeCounts) {
      if (data.occurrences < this.config.themeMinOccurrences) continue

      const theme: Theme = {
        id: generateId('theme'),
        name,
        keywords: data.keywords,
        occurrences: data.occurrences,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
        strength: clamp(data.totalStrength / data.occurrences, 0, 1),
      }

      this.themes.set(theme.id, theme)
      extractedThemes.push(theme)
    }

    extractedThemes.sort((a, b) => b.strength - a.strength)
    return extractedThemes
  }

  /** Get all extracted themes. */
  getThemes(): Theme[] {
    return Array.from(this.themes.values())
  }

  // ── Narrative Structure Classification ──────────────────────────────

  /** Classify the narrative into a known structure type. */
  classifyStructure(): NarrativeStructure {
    const beats = this.getBeats()
    if (beats.length < 3) {
      return { type: 'unknown', confidence: 0, matchedPhases: [] }
    }

    const tensions = beats.map(b => b.tension)
    const n = tensions.length

    let bestStructure: NarrativeStructure = { type: 'unknown', confidence: 0, matchedPhases: [] }

    for (const template of STRUCTURE_TEMPLATES) {
      const phaseCount = template.phases.length
      const matchedPhases: Array<{ phase: string; startBeat: number; endBeat: number }> = []

      // Divide beats into phases according to template weights
      let cursor = 0
      const phaseTensions: number[][] = []
      for (let p = 0; p < phaseCount; p++) {
        const phaseLen = Math.max(1, Math.round(template.weights[p] * n))
        const end = p === phaseCount - 1 ? n : Math.min(cursor + phaseLen, n)
        const phaseBeatTensions = tensions.slice(cursor, end)
        phaseTensions.push(phaseBeatTensions)
        matchedPhases.push({ phase: template.phases[p], startBeat: cursor, endBeat: end - 1 })
        cursor = end
      }

      // Score how well the tension profile matches the expected pattern
      const confidence = this.scoreStructureMatch(template.type, phaseTensions)

      if (confidence > bestStructure.confidence) {
        bestStructure = { type: template.type, confidence, matchedPhases }
      }
    }

    return bestStructure
  }

  // ── Story Generation ────────────────────────────────────────────────

  /**
   * Generate the next story beat suggestion based on current narrative state.
   * Returns a StoryBeat with suggested text, phase, and tension.
   */
  generateStoryBeat(context?: string): StoryBeat {
    const beats = this.getBeats()
    const currentIndex = beats.length
    const recentBeats = beats.slice(-5)

    // Determine expected phase and tension
    const expectedPhase = this.predictNextPhase(recentBeats)
    const expectedTension = this.predictNextTension(recentBeats)

    // Gather active characters
    const activeChars = Array.from(this.characters.values()).filter(c => c.active)
    const charNames = activeChars.slice(0, 3).map(c => c.name)

    // Gather active themes
    const activeThemes = Array.from(this.themes.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2)
    const themeNames = activeThemes.map(t => t.name)

    // Build the suggested text from narrative state
    const suggestion = this.composeBeatSuggestion(
      expectedPhase,
      expectedTension,
      charNames,
      themeNames,
      context,
    )

    const beat: StoryBeat = {
      id: generateId('gen'),
      index: currentIndex,
      text: suggestion,
      phase: expectedPhase,
      tension: expectedTension,
      characters: activeChars.slice(0, 3).map(c => c.id),
      themes: activeThemes.map(t => t.id),
      timestamp: Date.now(),
    }

    return beat
  }

  // ── Coherence Analysis ──────────────────────────────────────────────

  /** Analyze narrative coherence across multiple dimensions. */
  analyzeCoherence(): CoherenceReport {
    const beats = this.getBeats()
    if (beats.length < 2) {
      return {
        overallScore: 1,
        characterConsistency: 1,
        plotConsistency: 1,
        thematicConsistency: 1,
        temporalConsistency: 1,
        issues: [],
      }
    }

    const issues: string[] = []

    // Character consistency: characters shouldn't appear/disappear erratically
    const charConsistency = this.computeCharacterConsistency(beats, issues)

    // Plot consistency: tension shouldn't have wild unsmoothed jumps
    const plotConsistency = this.computePlotConsistency(beats, issues)

    // Thematic consistency: themes should recur, not appear once
    const thematicConsistency = this.computeThematicConsistency(issues)

    // Temporal consistency: phases should follow a logical order
    const temporalConsistency = this.computeTemporalConsistency(beats, issues)

    const overallScore = clamp(
      charConsistency * 0.25 +
        plotConsistency * 0.3 +
        thematicConsistency * 0.2 +
        temporalConsistency * 0.25,
      0,
      1,
    )

    return {
      overallScore,
      characterConsistency: charConsistency,
      plotConsistency,
      thematicConsistency,
      temporalConsistency,
      issues,
    }
  }

  // ── Tension Curve ───────────────────────────────────────────────────

  /** Build a tension curve mapping tension values across all beats. */
  buildTensionCurve(): TensionPoint[] {
    const beats = this.getBeats()
    if (beats.length === 0) return []

    const tensions = beats.map(b => b.tension)
    const smoothed = smoothArray(tensions, 3)

    return beats.map((beat, i) => ({
      beatIndex: beat.index,
      tension: smoothed[i],
      phase: beat.phase,
      label: this.tensionLabel(smoothed[i]),
    }))
  }

  // ── Foreshadowing Detection ─────────────────────────────────────────

  /**
   * Detect foreshadowing by finding keyword/theme echoes between
   * earlier and later beats.
   */
  detectForeshadowing(): ForeshadowingElement[] {
    const beats = this.getBeats()
    if (beats.length < 4) return []

    this.foreshadowing = []
    const windowSize = Math.max(3, Math.floor(beats.length * 0.3))

    // Compare early beats with later beats for keyword echoes
    for (let i = 0; i < beats.length - windowSize; i++) {
      const earlyTokens = tokenize(beats[i].text)
      const earlySet = new Set(earlyTokens)

      for (let j = i + windowSize; j < beats.length; j++) {
        const lateTokens = tokenize(beats[j].text)
        const lateSet = new Set(lateTokens)

        // Find shared non-trivial keywords
        const shared: string[] = []
        for (const token of earlySet) {
          if (lateSet.has(token) && token.length >= 4) {
            shared.push(token)
          }
        }

        if (shared.length === 0) continue

        const confidence = clamp(shared.length / Math.max(earlySet.size, 1), 0, 1)
        if (confidence < this.config.foreshadowingThreshold) continue

        // Check if the later beat has higher tension (payoff tends to be intense)
        const tensionDiff = beats[j].tension - beats[i].tension
        const isPayoff =
          tensionDiff > 0.1 || beats[j].phase === 'climax' || beats[j].phase === 'resolution'

        this.foreshadowing.push({
          plantBeatId: beats[i].id,
          payoffBeatId: isPayoff ? beats[j].id : null,
          description: `Keywords [${shared.slice(0, 3).join(', ')}] echo from beat ${i} to beat ${j}`,
          keywords: shared,
          resolved: isPayoff,
          confidence,
        })
      }
    }

    // Deduplicate: keep highest-confidence per plant beat
    const bestByPlant = new Map<string, ForeshadowingElement>()
    for (const fs of this.foreshadowing) {
      const existing = bestByPlant.get(fs.plantBeatId)
      if (!existing || fs.confidence > existing.confidence) {
        bestByPlant.set(fs.plantBeatId, fs)
      }
    }

    this.foreshadowing = Array.from(bestByPlant.values())
    return [...this.foreshadowing]
  }

  /** Get all detected foreshadowing elements. */
  getForeshadowing(): ForeshadowingElement[] {
    return [...this.foreshadowing]
  }

  // ── Narrative Patterns ──────────────────────────────────────────────

  /** Detect recurring narrative patterns in the tension curve. */
  detectPatterns(): NarrativePattern[] {
    const beats = this.getBeats()
    if (beats.length < 4) return []

    const tensions = beats.map(b => b.tension)
    const detected: NarrativePattern[] = []

    for (const pattern of NARRATIVE_PATTERNS) {
      const windowLen = pattern.tensionShape.length
      const occurrences: Array<{ startBeat: number; endBeat: number }> = []

      for (let i = 0; i <= tensions.length - windowLen; i++) {
        const window = tensions.slice(i, i + windowLen)
        const similarity = shapeSimilarity(window, pattern.tensionShape)
        if (similarity > 0.7) {
          // Avoid overlapping occurrences
          const lastOcc = occurrences[occurrences.length - 1]
          if (!lastOcc || i > lastOcc.endBeat) {
            occurrences.push({ startBeat: i, endBeat: i + windowLen - 1 })
          }
        }
      }

      if (occurrences.length > 0) {
        detected.push({
          name: pattern.name,
          description: pattern.description,
          occurrences,
          confidence: clamp(occurrences.length * 0.3, 0, 1),
        })
      }
    }

    detected.sort((a, b) => b.confidence - a.confidence)
    return detected
  }

  // ── Narrative Summary ───────────────────────────────────────────────

  /** Produce a condensed summary of the narrative so far. */
  summarizeNarrative(): string {
    const beats = this.getBeats()
    if (beats.length === 0) return ''

    const parts: string[] = []

    // Opening
    const expositionBeats = beats.filter(b => b.phase === 'exposition')
    if (expositionBeats.length > 0) {
      parts.push(`The story begins: ${this.truncate(expositionBeats[0].text, 80)}`)
    }

    // Characters
    const chars = Array.from(this.characters.values())
    if (chars.length > 0) {
      const charList = chars
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 3)
        .map(c => `${c.name} (${c.role})`)
      parts.push(`Key characters: ${charList.join(', ')}.`)
    }

    // Rising action
    const risingBeats = beats.filter(b => b.phase === 'rising_action')
    if (risingBeats.length > 0) {
      const midPoint = risingBeats[Math.floor(risingBeats.length / 2)]
      parts.push(`Tension builds: ${this.truncate(midPoint.text, 80)}`)
    }

    // Climax
    const climaxBeats = beats.filter(b => b.phase === 'climax')
    if (climaxBeats.length > 0) {
      parts.push(`Climax: ${this.truncate(climaxBeats[0].text, 80)}`)
    }

    // Themes
    const themes = Array.from(this.themes.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
    if (themes.length > 0) {
      parts.push(`Central themes: ${themes.map(t => t.name).join(', ')}.`)
    }

    // Resolution
    const resolutionBeats = beats.filter(b => b.phase === 'resolution' || b.phase === 'denouement')
    if (resolutionBeats.length > 0) {
      parts.push(
        `Resolution: ${this.truncate(resolutionBeats[resolutionBeats.length - 1].text, 80)}`,
      )
    }

    return parts.join(' ')
  }

  // ── Stats & Persistence ──────────────────────────────────────────────

  /** Return aggregate statistics about the engine state. */
  getStats(): NarrativeEngineStats {
    const beats = this.getBeats()
    const totalTension = beats.reduce((sum, b) => sum + b.tension, 0)

    return {
      totalBeats: this.beats.size,
      totalCharacters: this.characters.size,
      totalPlotPoints: this.plotPoints.size,
      totalThemes: this.themes.size,
      totalArcs: this.arcs.size,
      averageTension: beats.length > 0 ? totalTension / beats.length : 0,
      resolvedForeshadowing: this.foreshadowing.filter(f => f.resolved).length,
      unresolvedForeshadowing: this.foreshadowing.filter(f => !f.resolved).length,
    }
  }

  /** Serialize the entire engine state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      beats: Array.from(this.beats.values()),
      beatOrder: this.beatOrder,
      characters: Array.from(this.characters.values()),
      characterArcs: Array.from(this.characterArcs.values()),
      relations: this.relations,
      plotPoints: Array.from(this.plotPoints.values()),
      themes: Array.from(this.themes.values()),
      arcs: Array.from(this.arcs.values()),
      foreshadowing: this.foreshadowing,
    })
  }

  /** Restore a NarrativeEngine from a previously serialized JSON string. */
  static deserialize(json: string): NarrativeEngine {
    const data = JSON.parse(json) as {
      config: NarrativeEngineConfig
      beats: StoryBeat[]
      beatOrder: string[]
      characters: Character[]
      characterArcs: CharacterArc[]
      relations: CharacterRelation[]
      plotPoints: PlotPoint[]
      themes: Theme[]
      arcs: NarrativeArc[]
      foreshadowing: ForeshadowingElement[]
    }

    const engine = new NarrativeEngine(data.config)

    if (Array.isArray(data.beats)) {
      for (const entry of data.beats) {
        engine.beats.set(entry.id, {
          id: entry.id,
          index: entry.index,
          text: entry.text,
          phase: entry.phase,
          tension: entry.tension,
          characters: entry.characters,
          themes: entry.themes,
          timestamp: entry.timestamp,
        })
      }
    }

    if (Array.isArray(data.beatOrder)) {
      engine.beatOrder = data.beatOrder
    }

    if (Array.isArray(data.characters)) {
      for (const char of data.characters) {
        engine.characters.set(char.id, char)
      }
    }

    if (Array.isArray(data.characterArcs)) {
      for (const entry of data.characterArcs) {
        engine.characterArcs.set(entry.characterId, {
          characterId: entry.characterId,
          beats: entry.beats,
          traitProgression: entry.traitProgression,
          roleShifts: entry.roleShifts,
          tensionContribution: entry.tensionContribution,
        })
      }
    }

    if (Array.isArray(data.relations)) {
      engine.relations = data.relations
    }

    if (Array.isArray(data.plotPoints)) {
      for (const pp of data.plotPoints) {
        engine.plotPoints.set(pp.id, pp)
      }
    }

    if (Array.isArray(data.themes)) {
      for (const theme of data.themes) {
        engine.themes.set(theme.id, theme)
      }
    }

    if (Array.isArray(data.arcs)) {
      for (const arc of data.arcs) {
        engine.arcs.set(arc.id, arc)
      }
    }

    if (Array.isArray(data.foreshadowing)) {
      engine.foreshadowing = data.foreshadowing
    }

    return engine
  }

  // ── Private Helpers ──────────────────────────────────────────────────

  /** Compute tension level for a beat based on keyword analysis. */
  private computeBeatTension(tokens: string[]): number {
    if (tokens.length === 0) return 0

    let escalation = 0
    let reduction = 0
    for (const token of tokens) {
      if (TENSION_ESCALATORS.has(token)) escalation++
      if (TENSION_REDUCERS.has(token)) reduction++
    }

    const rawTension = (escalation - reduction * 0.7) / Math.max(tokens.length, 1)

    // Apply smoothing against previous beats
    const prevBeats = this.getBeats().slice(-3)
    if (prevBeats.length > 0) {
      const prevAvg = prevBeats.reduce((sum, b) => sum + b.tension, 0) / prevBeats.length
      const smoothed =
        prevAvg * this.config.arcSmoothingFactor +
        (rawTension + 0.5) * (1 - this.config.arcSmoothingFactor)
      return clamp(smoothed, 0, 1)
    }

    return clamp(rawTension + 0.3, 0, 1)
  }

  /** Classify the narrative phase based on position and tension. */
  private classifyPhase(index: number, tension: number): ArcPhase {
    const totalBeats = this.beatOrder.length + 1
    const position = index / Math.max(totalBeats, 1)

    if (position < 0.15) return 'exposition'
    if (position < 0.25 && tension < 0.5) return 'exposition'
    if (tension > 0.75) return 'climax'
    if (position > 0.85 && tension < 0.4) return 'denouement'
    if (position > 0.7 && tension < 0.5) return 'resolution'
    if (position > 0.6) return 'falling_action'
    return 'rising_action'
  }

  /** Detect which known characters appear in text (case-insensitive). */
  private detectCharactersInText(text: string): string[] {
    const lower = text.toLowerCase()
    const found: string[] = []
    for (const char of this.characters.values()) {
      if (lower.includes(char.name.toLowerCase())) {
        found.push(char.id)
      }
    }
    return found
  }

  /** Detect which themes are present in a token set. */
  private detectThemesInTokens(tokens: string[]): string[] {
    const tokenSet = new Set(tokens)
    const found: string[] = []
    for (const [id, theme] of this.themes) {
      for (const kw of theme.keywords) {
        if (tokenSet.has(kw)) {
          found.push(id)
          break
        }
      }
    }
    return found
  }

  /** Update character co-appearance relations for a beat. */
  private updateRelationsForBeat(characterIds: string[], beatIndex: number): void {
    for (let i = 0; i < characterIds.length; i++) {
      for (let j = i + 1; j < characterIds.length; j++) {
        const a = characterIds[i]
        const b = characterIds[j]
        const existing = this.relations.find(
          r =>
            (r.characterA === a && r.characterB === b) ||
            (r.characterA === b && r.characterB === a),
        )
        if (existing) {
          existing.coAppearances++
          existing.strength = clamp(existing.strength + 0.05, 0, 1)
        } else {
          this.relations.push({
            characterA: a,
            characterB: b,
            type: 'neutral',
            strength: 0.2,
            firstInteraction: beatIndex,
            coAppearances: 1,
          })
        }
      }
    }
  }

  /** Score how well phase tensions match a structure template. */
  private scoreStructureMatch(type: StructureType, phaseTensions: number[][]): number {
    const avgTensions = phaseTensions.map(phase =>
      phase.length > 0 ? phase.reduce((s, v) => s + v, 0) / phase.length : 0,
    )

    let score = 0

    switch (type) {
      case 'three_act':
        // Setup: low, Confrontation: high, Resolution: medium-low
        score = (1 - avgTensions[0]) * 0.3 + avgTensions[1] * 0.4 + (1 - avgTensions[2]) * 0.3
        break

      case 'heros_journey':
        // Builds from low to high in middle, then comes down
        if (avgTensions.length >= 7) {
          score =
            (1 - avgTensions[0]) * 0.1 +
            avgTensions[3] * 0.3 +
            avgTensions[4] * 0.3 +
            (1 - avgTensions[6]) * 0.3
        }
        break

      case 'five_act':
      case 'freytag_pyramid':
        // Classic pyramid: low → high → low
        if (avgTensions.length >= 5) {
          score =
            (1 - avgTensions[0]) * 0.2 +
            avgTensions[1] * 0.2 +
            avgTensions[2] * 0.3 +
            (avgTensions[2] > avgTensions[3] ? 0.15 : 0) +
            (1 - avgTensions[4]) * 0.15
        }
        break

      case 'kishotenketsu':
        // Relatively flat then twist
        if (avgTensions.length >= 4) {
          const flatness = 1 - Math.abs(avgTensions[0] - avgTensions[1])
          const twist = Math.abs(avgTensions[2] - avgTensions[1])
          score = flatness * 0.4 + twist * 0.4 + (1 - avgTensions[3]) * 0.2
        }
        break

      default:
        score = 0
    }

    return clamp(score, 0, 1)
  }

  /** Predict the next expected narrative phase. */
  private predictNextPhase(recentBeats: StoryBeat[]): ArcPhase {
    if (recentBeats.length === 0) return 'exposition'

    const lastPhase = recentBeats[recentBeats.length - 1].phase
    const phaseOrder: ArcPhase[] = [
      'exposition',
      'rising_action',
      'climax',
      'falling_action',
      'resolution',
      'denouement',
    ]
    const currentIdx = phaseOrder.indexOf(lastPhase)

    // Tend to advance the phase, but allow staying
    const avgTension = recentBeats.reduce((s, b) => s + b.tension, 0) / recentBeats.length
    if (avgTension > 0.7 && lastPhase !== 'climax') return 'climax'
    if (lastPhase === 'climax') return 'falling_action'
    if (currentIdx < phaseOrder.length - 1) return phaseOrder[currentIdx + 1]
    return lastPhase
  }

  /** Predict the next expected tension level. */
  private predictNextTension(recentBeats: StoryBeat[]): number {
    if (recentBeats.length === 0) return 0.3

    const tensions = recentBeats.map(b => b.tension)
    const avg = tensions.reduce((s, v) => s + v, 0) / tensions.length

    // Check trend direction
    if (tensions.length >= 2) {
      const trend = tensions[tensions.length - 1] - tensions[0]
      const predicted = avg + trend * 0.3
      return clamp(predicted, 0, 1)
    }

    return clamp(avg, 0, 1)
  }

  /** Compose a narrative beat suggestion from current state. */
  private composeBeatSuggestion(
    phase: ArcPhase,
    tension: number,
    characters: string[],
    themes: string[],
    context?: string,
  ): string {
    const parts: string[] = []

    // Phase-based framing
    switch (phase) {
      case 'exposition':
        parts.push('The scene is set')
        break
      case 'rising_action':
        parts.push('Tension builds as')
        break
      case 'climax':
        parts.push('In the decisive moment')
        break
      case 'falling_action':
        parts.push('In the aftermath')
        break
      case 'resolution':
        parts.push('Things begin to settle as')
        break
      case 'denouement':
        parts.push('And so')
        break
    }

    // Character involvement
    if (characters.length > 0) {
      const charStr =
        characters.length === 1
          ? characters[0]
          : `${characters.slice(0, -1).join(', ')} and ${characters[characters.length - 1]}`
      parts.push(
        `${charStr} ${tension > 0.6 ? 'face a critical challenge' : 'navigate the unfolding events'}`,
      )
    }

    // Thematic elements
    if (themes.length > 0) {
      parts.push(`exploring themes of ${themes.join(' and ')}`)
    }

    // Context integration
    if (context) {
      parts.push(`amid ${context}`)
    }

    return parts.join(', ') + '.'
  }

  /** Compute character consistency score. */
  private computeCharacterConsistency(beats: StoryBeat[], issues: string[]): number {
    if (this.characters.size === 0) return 1

    let consistencySum = 0
    let checks = 0

    for (const char of this.characters.values()) {
      // Characters with arcs should have gradual trait progression
      const arc = this.characterArcs.get(char.id)
      if (arc && arc.traitProgression.length > 1) {
        // Check for sudden large trait changes
        for (let i = 1; i < arc.traitProgression.length; i++) {
          const prev = new Set(arc.traitProgression[i - 1].traits)
          const curr = new Set(arc.traitProgression[i].traits)
          let overlap = 0
          for (const t of prev) {
            if (curr.has(t)) overlap++
          }
          const union = new Set([...prev, ...curr]).size
          const similarity = union > 0 ? overlap / union : 1
          consistencySum += similarity
          checks++

          if (similarity < 0.3) {
            issues.push(
              `Character "${char.name}" undergoes abrupt trait change at beat ${arc.traitProgression[i].beatIndex}`,
            )
          }
        }
      }

      // Characters should have reasonable mention distribution
      const beatCount = beats.filter(b => b.characters.includes(char.id)).length
      if (char.role === 'protagonist' && beatCount < beats.length * 0.2) {
        issues.push(`Protagonist "${char.name}" appears in few beats`)
        consistencySum += 0.5
      } else {
        consistencySum += 1
      }
      checks++
    }

    return checks > 0 ? consistencySum / checks : 1
  }

  /** Compute plot consistency score. */
  private computePlotConsistency(beats: StoryBeat[], issues: string[]): number {
    if (beats.length < 2) return 1

    let jumpCount = 0
    const maxJump = 0.5

    for (let i = 1; i < beats.length; i++) {
      const diff = Math.abs(beats[i].tension - beats[i - 1].tension)
      if (diff > maxJump) {
        jumpCount++
        issues.push(`Abrupt tension shift between beats ${i - 1} and ${i} (${diff.toFixed(2)})`)
      }
    }

    const jumpRatio = jumpCount / Math.max(beats.length - 1, 1)
    return clamp(1 - jumpRatio * 2, 0, 1)
  }

  /** Compute thematic consistency score. */
  private computeThematicConsistency(issues: string[]): number {
    const themes = Array.from(this.themes.values())
    if (themes.length === 0) return 1

    let score = 0
    for (const theme of themes) {
      if (theme.occurrences >= this.config.themeMinOccurrences) {
        score += 1
      } else {
        issues.push(`Theme "${theme.name}" appears only ${theme.occurrences} time(s)`)
        score += 0.3
      }
    }

    return clamp(score / themes.length, 0, 1)
  }

  /** Compute temporal consistency score based on phase ordering. */
  private computeTemporalConsistency(beats: StoryBeat[], issues: string[]): number {
    if (beats.length < 3) return 1

    const phaseOrder: Record<ArcPhase, number> = {
      exposition: 0,
      rising_action: 1,
      climax: 2,
      falling_action: 3,
      resolution: 4,
      denouement: 5,
    }

    let regressions = 0
    let maxPhase = 0

    for (const beat of beats) {
      const phaseValue = phaseOrder[beat.phase]
      if (phaseValue < maxPhase - 1) {
        regressions++
      }
      maxPhase = Math.max(maxPhase, phaseValue)
    }

    if (regressions > beats.length * 0.3) {
      issues.push('Narrative phases regress frequently, weakening temporal flow')
    }

    const regressionRatio = regressions / Math.max(beats.length, 1)
    return clamp(1 - regressionRatio * 2, 0, 1)
  }

  /** Map tension value to a human-readable label. */
  private tensionLabel(tension: number): string {
    if (tension < 0.2) return 'calm'
    if (tension < 0.4) return 'mild'
    if (tension < 0.6) return 'moderate'
    if (tension < 0.8) return 'high'
    return 'intense'
  }

  /** Truncate text to a max length with ellipsis. */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }

  /** Return an empty analysis object. */
  private emptyAnalysis(): NarrativeAnalysis {
    return {
      structure: { type: 'unknown', confidence: 0, matchedPhases: [] },
      arcs: [],
      plotPoints: [],
      themes: [],
      characters: [],
      coherence: {
        overallScore: 0,
        characterConsistency: 0,
        plotConsistency: 0,
        thematicConsistency: 0,
        temporalConsistency: 0,
        issues: [],
      },
      tensionCurve: [],
      foreshadowing: [],
      patterns: [],
      summary: '',
    }
  }
}
