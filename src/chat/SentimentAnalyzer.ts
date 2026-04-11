/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║        💬  S E N T I M E N T   A N A L Y Z E R                              ║
 * ║                                                                             ║
 * ║   Phase 7 "Understanding" intelligence module for sentiment & opinion:       ║
 * ║     analyze → detect → classify → summarize                                 ║
 * ║                                                                             ║
 * ║     • Full-text and per-sentence sentiment scoring                          ║
 * ║     • Emotion detection based on Plutchik's 8 basic emotions               ║
 * ║     • Aspect-based sentiment extraction                                     ║
 * ║     • Subjectivity and opinion analysis                                     ║
 * ║     • Negation, intensifier, and diminisher handling                        ║
 * ║     • Sarcasm hint detection                                                ║
 * ║     • Customizable lexicon with feedback learning                           ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface SentimentAnalyzerConfig {
  enableAspectAnalysis: boolean
  enableEmotionDetection: boolean
  enableSubjectivity: boolean
  enableSarcasmDetection: boolean
  lexiconSize: 'small' | 'medium' | 'large'
  customLexicon: Record<string, number>
  negationWindow: number
}

export interface SentimentAnalyzerStats {
  totalAnalyses: number
  totalWordsProcessed: number
  totalAspectsExtracted: number
  totalEmotionsDetected: number
  avgAnalysisTime: number
  feedbackCount: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
}

export type SentimentLabel = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'

export type EmotionType =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'trust'
  | 'anticipation'

export interface SentimentScore {
  score: number
  magnitude: number
  label: SentimentLabel
  confidence: number
}

export interface AspectSentiment {
  aspect: string
  sentiment: SentimentScore
  mentions: number
  keywords: string[]
}

export interface EmotionScore {
  emotion: EmotionType
  intensity: number
  triggers: string[]
}

export interface SubjectivityScore {
  score: number
  label: 'objective' | 'subjective' | 'mixed'
  opinionPhrases: string[]
}

export interface OpinionInfo {
  holder: string | null
  target: string
  polarity: SentimentLabel
  expression: string
  confidence: number
}

export interface SentenceSentiment {
  text: string
  sentiment: SentimentScore
  emotions: EmotionScore[]
  subjectivity: SubjectivityScore
}

export interface SentimentSummary {
  dominantSentiment: SentimentLabel
  dominantEmotion: EmotionType | null
  aspectCount: number
  sentenceCount: number
  mostPositiveAspect: string | null
  mostNegativeAspect: string | null
}

export interface SentimentAnalysisResult {
  analysisId: string
  timestamp: number
  duration: number
  text: string
  overall: SentimentScore
  sentences: SentenceSentiment[]
  aspects: AspectSentiment[]
  emotions: EmotionScore[]
  subjectivity: SubjectivityScore
  opinions: OpinionInfo[]
  summary: SentimentSummary
}

// ── Default Configuration ────────────────────────────────────────────────────

const DEFAULT_CONFIG: SentimentAnalyzerConfig = {
  enableAspectAnalysis: true,
  enableEmotionDetection: true,
  enableSubjectivity: true,
  enableSarcasmDetection: true,
  lexiconSize: 'large',
  customLexicon: {},
  negationWindow: 3,
}

// ── Lexicon Data ─────────────────────────────────────────────────────────────

function buildSentimentLexicon(size: 'small' | 'medium' | 'large'): Record<string, number> {
  const core: Record<string, number> = {
    // ── Strongly Positive (0.7 – 1.0) ────────────────────────────
    amazing: 0.9,
    awesome: 0.9,
    brilliant: 0.9,
    excellent: 0.95,
    exceptional: 0.95,
    extraordinary: 0.9,
    fabulous: 0.9,
    fantastic: 0.9,
    incredible: 0.9,
    magnificent: 0.9,
    marvelous: 0.9,
    outstanding: 0.95,
    perfect: 1.0,
    phenomenal: 0.9,
    remarkable: 0.85,
    spectacular: 0.9,
    splendid: 0.85,
    stellar: 0.9,
    superb: 0.9,
    terrific: 0.85,
    tremendous: 0.85,
    wonderful: 0.9,
    glorious: 0.85,
    exquisite: 0.9,
    flawless: 0.95,
    masterful: 0.9,
    triumphant: 0.85,
    blissful: 0.9,
    delightful: 0.85,
    ecstatic: 0.9,
    elated: 0.85,
    euphoric: 0.9,
    overjoyed: 0.9,
    thrilled: 0.85,
    jubilant: 0.85,
    radiant: 0.8,
    sublime: 0.85,
    heavenly: 0.85,
    divine: 0.85,

    // ── Positive (0.3 – 0.7) ─────────────────────────────────────
    good: 0.5,
    great: 0.7,
    nice: 0.45,
    happy: 0.65,
    love: 0.7,
    like: 0.35,
    enjoy: 0.55,
    pleased: 0.55,
    glad: 0.55,
    beautiful: 0.7,
    fine: 0.3,
    better: 0.5,
    best: 0.75,
    positive: 0.5,
    fun: 0.55,
    cool: 0.45,
    exciting: 0.65,
    impressive: 0.65,
    reliable: 0.5,
    solid: 0.45,
    strong: 0.5,
    useful: 0.5,
    helpful: 0.55,
    friendly: 0.55,
    warm: 0.45,
    bright: 0.45,
    clean: 0.4,
    clever: 0.5,
    comfortable: 0.5,
    confident: 0.55,
    creative: 0.5,
    cute: 0.45,
    decent: 0.35,
    easy: 0.4,
    effective: 0.55,
    efficient: 0.55,
    elegant: 0.6,
    fair: 0.35,
    fast: 0.4,
    generous: 0.6,
    gentle: 0.45,
    genuine: 0.5,
    graceful: 0.55,
    grateful: 0.6,
    handy: 0.4,
    healthy: 0.5,
    honest: 0.5,
    innovative: 0.55,
    inspiring: 0.65,
    intelligent: 0.55,
    joyful: 0.7,
    kind: 0.55,
    lively: 0.5,
    lucky: 0.5,
    neat: 0.35,
    noble: 0.5,
    optimistic: 0.55,
    passionate: 0.6,
    patient: 0.45,
    peaceful: 0.55,
    pleasant: 0.5,
    polite: 0.45,
    powerful: 0.5,
    practical: 0.4,
    pretty: 0.45,
    productive: 0.5,
    professional: 0.45,
    proud: 0.55,
    quiet: 0.3,
    refreshing: 0.5,
    relaxed: 0.45,
    resilient: 0.5,
    respectful: 0.5,
    satisfying: 0.55,
    secure: 0.45,
    sharp: 0.4,
    simple: 0.35,
    sincere: 0.5,
    skilled: 0.5,
    smooth: 0.45,
    stable: 0.45,
    successful: 0.6,
    supportive: 0.55,
    sweet: 0.5,
    talented: 0.55,
    thoughtful: 0.55,
    welcome: 0.5,
    wise: 0.55,
    worthy: 0.5,
    charming: 0.55,
    cheerful: 0.6,
    cozy: 0.45,
    dazzling: 0.65,
    dreamy: 0.45,
    enchanting: 0.6,
    energetic: 0.5,
    enthusiastic: 0.6,
    favorable: 0.5,
    festive: 0.55,
    flourishing: 0.6,
    fortunate: 0.55,
    fresh: 0.4,
    fulfilling: 0.6,
    gleaming: 0.5,
    harmonious: 0.55,
    heartwarming: 0.65,
    heroic: 0.6,
    humorous: 0.5,
    ideal: 0.6,
    immaculate: 0.6,
    inviting: 0.5,
    likable: 0.45,
    loving: 0.65,
    magical: 0.6,
    majestic: 0.65,
    merry: 0.55,
    miraculous: 0.7,
    motivated: 0.5,
    nurturing: 0.55,
    paradise: 0.7,
    plentiful: 0.45,
    precious: 0.6,
    pristine: 0.55,
    prosperous: 0.6,
    reassuring: 0.5,
    rejuvenating: 0.55,
    rewarding: 0.6,
    scenic: 0.45,
    serene: 0.55,
    shining: 0.5,
    soothing: 0.5,
    spirited: 0.5,
    stunning: 0.65,
    sunny: 0.45,
    superior: 0.6,
    thriving: 0.6,
    tranquil: 0.5,
    uplifting: 0.6,
    victorious: 0.65,
    vivid: 0.5,
    wholesome: 0.55,
    witty: 0.45,
    youthful: 0.4,
    zesty: 0.45,

    // ── Slightly Positive (0.1 – 0.3) ───────────────────────────
    adequate: 0.2,
    alright: 0.15,
    average: 0.1,
    moderate: 0.15,
    normal: 0.1,
    okay: 0.15,
    passable: 0.15,
    reasonable: 0.25,
    satisfactory: 0.25,
    sufficient: 0.2,
    tolerable: 0.15,
    typical: 0.1,
    understandable: 0.2,
    acceptable: 0.2,
    balanced: 0.25,
    calm: 0.25,
    certain: 0.2,
    complete: 0.2,
    consistent: 0.25,
    correct: 0.25,
    familiar: 0.15,
    functional: 0.2,
    intact: 0.15,
    manageable: 0.2,
    mild: 0.15,
    notable: 0.25,
    orderly: 0.2,
    ready: 0.2,
    regular: 0.1,
    relevant: 0.2,
    safe: 0.25,
    standard: 0.15,
    steady: 0.2,

    // ── Strongly Negative (-0.7 – -1.0) ─────────────────────────
    abysmal: -0.9,
    appalling: -0.9,
    atrocious: -0.95,
    awful: -0.85,
    catastrophic: -0.95,
    deplorable: -0.9,
    despicable: -0.9,
    detestable: -0.9,
    devastating: -0.9,
    dreadful: -0.85,
    ghastly: -0.85,
    horrendous: -0.9,
    horrible: -0.85,
    horrific: -0.9,
    horrifying: -0.9,
    loathsome: -0.9,
    miserable: -0.8,
    nightmarish: -0.9,
    outrageous: -0.8,
    repulsive: -0.9,
    revolting: -0.85,
    terrible: -0.85,
    tragic: -0.85,
    unbearable: -0.85,
    unforgivable: -0.9,
    vile: -0.9,
    wretched: -0.85,
    abhorrent: -0.9,
    agonizing: -0.85,
    contemptible: -0.85,
    disastrous: -0.9,
    excruciating: -0.85,
    gruesome: -0.85,
    heinous: -0.9,
    insufferable: -0.85,
    monstrous: -0.9,
    reprehensible: -0.85,
    torturous: -0.85,
    unacceptable: -0.8,

    // ── Negative (-0.3 – -0.7) ──────────────────────────────────
    bad: -0.5,
    hate: -0.7,
    angry: -0.6,
    sad: -0.55,
    ugly: -0.6,
    poor: -0.55,
    worse: -0.6,
    worst: -0.75,
    boring: -0.5,
    broken: -0.6,
    cheap: -0.4,
    confusing: -0.45,
    dangerous: -0.65,
    dark: -0.35,
    difficult: -0.4,
    dirty: -0.5,
    disappointing: -0.6,
    dishonest: -0.6,
    dismal: -0.6,
    disturbing: -0.6,
    dull: -0.45,
    embarrassing: -0.55,
    evil: -0.7,
    exhausting: -0.5,
    expensive: -0.35,
    failing: -0.6,
    fake: -0.55,
    fearful: -0.55,
    filthy: -0.6,
    foolish: -0.5,
    fragile: -0.35,
    frustrating: -0.6,
    gloomy: -0.5,
    greedy: -0.55,
    guilty: -0.5,
    harmful: -0.6,
    harsh: -0.5,
    helpless: -0.55,
    hopeless: -0.65,
    hostile: -0.6,
    hurtful: -0.6,
    ignorant: -0.5,
    immature: -0.4,
    impatient: -0.4,
    impractical: -0.4,
    incompetent: -0.6,
    inferior: -0.55,
    insecure: -0.5,
    irritating: -0.55,
    jealous: -0.45,
    lazy: -0.45,
    lonely: -0.5,
    mean: -0.55,
    mediocre: -0.4,
    messy: -0.4,
    nasty: -0.6,
    negative: -0.5,
    neglected: -0.55,
    nervous: -0.4,
    noisy: -0.35,
    obnoxious: -0.6,
    offensive: -0.65,
    painful: -0.6,
    pathetic: -0.65,
    pessimistic: -0.5,
    pointless: -0.55,
    problematic: -0.5,
    rejected: -0.6,
    rude: -0.55,
    ruthless: -0.6,
    selfish: -0.5,
    shallow: -0.4,
    shameful: -0.6,
    sloppy: -0.45,
    slow: -0.3,
    stressful: -0.55,
    stupid: -0.6,
    suspicious: -0.45,
    tedious: -0.45,
    threatening: -0.6,
    toxic: -0.65,
    troubled: -0.5,
    unpleasant: -0.5,
    unreliable: -0.55,
    unsafe: -0.6,
    unstable: -0.5,
    useless: -0.65,
    vicious: -0.65,
    violent: -0.7,
    vulnerable: -0.45,
    wasteful: -0.5,
    weak: -0.45,
    worried: -0.45,
    worthless: -0.7,
    wrong: -0.5,
    annoying: -0.5,
    clumsy: -0.4,
    corrupt: -0.65,
    cruel: -0.7,
    defective: -0.55,
    demanding: -0.4,
    depressing: -0.65,
    desperate: -0.55,
    destructive: -0.65,
    disrespectful: -0.55,
    faulty: -0.5,
    flawed: -0.5,
    grim: -0.55,
    inadequate: -0.5,
    insulting: -0.6,
    lacking: -0.45,
    malicious: -0.7,
    misguided: -0.45,
    monotonous: -0.4,
    neglectful: -0.55,
    oppressive: -0.6,
    overwhelming: -0.45,
    pitiful: -0.6,
    regrettable: -0.55,
    resentful: -0.55,
    rigid: -0.35,
    risky: -0.4,
    rotten: -0.6,
    sinister: -0.65,
    spiteful: -0.6,
    stale: -0.35,
    suffering: -0.6,
    tiresome: -0.4,
    treacherous: -0.65,
    unattractive: -0.4,
    unfair: -0.55,
    unfortunate: -0.5,
    unhappy: -0.55,
    unkind: -0.5,
    unsatisfactory: -0.55,
    unwanted: -0.5,
    upset: -0.5,

    // ── Slightly Negative (-0.1 – -0.3) ─────────────────────────
    bland: -0.2,
    complex: -0.15,
    controversial: -0.2,
    costly: -0.25,
    delayed: -0.25,
    doubtful: -0.25,
    heavy: -0.15,
    hesitant: -0.2,
    inconsistent: -0.25,
    limited: -0.2,
    minor: -0.1,
    mixed: -0.15,
    narrow: -0.15,
    odd: -0.15,
    outdated: -0.25,
    overcrowded: -0.25,
    plain: -0.15,
    questionable: -0.25,
    repetitive: -0.2,
    rough: -0.2,
    small: -0.1,
    sparse: -0.2,
    tight: -0.15,
    tricky: -0.2,
    uncertain: -0.25,
    unclear: -0.2,
    uneven: -0.2,
    unfamiliar: -0.15,
    unlikely: -0.2,
    unpredictable: -0.25,
    unusual: -0.15,
    vague: -0.2,
  }

  if (size === 'small') return core

  const medium: Record<string, number> = {
    // ── Additional Positive ──────────────────────────────────────
    accomplish: 0.55,
    achieve: 0.6,
    admire: 0.55,
    advantage: 0.5,
    agree: 0.35,
    approve: 0.5,
    assist: 0.45,
    attract: 0.45,
    benefit: 0.5,
    bless: 0.55,
    bloom: 0.5,
    boost: 0.5,
    celebrate: 0.6,
    cherish: 0.6,
    commend: 0.55,
    compliment: 0.5,
    contribute: 0.45,
    courage: 0.55,
    delight: 0.6,
    deserve: 0.4,
    eager: 0.45,
    elevate: 0.5,
    embrace: 0.55,
    empower: 0.6,
    encourage: 0.55,
    endure: 0.35,
    excel: 0.6,
    flourish: 0.6,
    forgive: 0.45,
    freedom: 0.55,
    glow: 0.45,
    gratitude: 0.6,
    growth: 0.5,
    guide: 0.4,
    heal: 0.5,
    hope: 0.55,
    humor: 0.45,
    improve: 0.5,
    inspire: 0.6,
    integrity: 0.55,
    invite: 0.4,
    kindness: 0.55,
    laugh: 0.55,
    lead: 0.4,
    liberty: 0.5,
    light: 0.35,
    master: 0.5,
    mercy: 0.45,
    mindful: 0.4,
    miracle: 0.65,
    nourish: 0.45,
    nurture: 0.5,
    overcome: 0.55,
    patience: 0.45,
    persevere: 0.5,
    pioneer: 0.5,
    praise: 0.55,
    progress: 0.5,
    promise: 0.45,
    prosper: 0.55,
    protect: 0.45,
    radiance: 0.5,
    recommend: 0.5,
    refresh: 0.45,
    rejoice: 0.6,
    remedy: 0.45,
    renew: 0.45,
    rescue: 0.5,
    resolve: 0.45,
    restore: 0.5,
    revive: 0.5,
    reward: 0.55,
    savor: 0.45,
    shine: 0.5,
    simplify: 0.4,
    smile: 0.55,
    solution: 0.45,
    spark: 0.45,
    strength: 0.5,
    succeed: 0.6,
    sunshine: 0.5,
    surprise: 0.4,
    sustain: 0.4,
    sweeten: 0.4,
    tender: 0.45,
    thankful: 0.55,
    thrive: 0.6,
    treasure: 0.55,
    triumph: 0.65,
    unify: 0.45,
    uplift: 0.55,
    valor: 0.55,
    victory: 0.65,
    virtue: 0.5,
    vitality: 0.5,
    volunteer: 0.45,
    warmth: 0.5,
    wealth: 0.45,
    win: 0.6,
    wonder: 0.55,
    worship: 0.45,
    zeal: 0.5,

    // ── Additional Negative ──────────────────────────────────────
    abandon: -0.6,
    abuse: -0.7,
    accuse: -0.5,
    ache: -0.4,
    agony: -0.7,
    alarm: -0.45,
    alienate: -0.55,
    annihilate: -0.8,
    anxiety: -0.55,
    argue: -0.4,
    arrogant: -0.5,
    assault: -0.7,
    betray: -0.7,
    bitter: -0.5,
    blame: -0.5,
    bleed: -0.45,
    block: -0.35,
    burden: -0.5,
    burn: -0.4,
    bury: -0.4,
    cancel: -0.3,
    chaos: -0.6,
    cheat: -0.65,
    clash: -0.45,
    collapse: -0.6,
    complain: -0.45,
    condemn: -0.6,
    conflict: -0.5,
    confront: -0.35,
    crash: -0.55,
    crisis: -0.6,
    criticize: -0.45,
    cry: -0.5,
    curse: -0.55,
    damage: -0.55,
    danger: -0.55,
    decay: -0.5,
    deceive: -0.6,
    decline: -0.45,
    defeat: -0.55,
    degrade: -0.6,
    deny: -0.4,
    deprive: -0.55,
    despair: -0.7,
    destroy: -0.7,
    detach: -0.35,
    devastate: -0.75,
    diminish: -0.4,
    disaster: -0.7,
    disconnect: -0.35,
    discourage: -0.5,
    disease: -0.55,
    disgrace: -0.6,
    dismiss: -0.4,
    dispute: -0.4,
    distress: -0.55,
    disturb: -0.45,
    doom: -0.65,
    doubt: -0.4,
    drain: -0.4,
    dread: -0.6,
    drought: -0.5,
    dump: -0.4,
    endanger: -0.55,
    enrage: -0.6,
    erode: -0.4,
    error: -0.35,
    evict: -0.5,
    exile: -0.5,
    exploit: -0.55,
    fail: -0.55,
    fallout: -0.5,
    fatigue: -0.4,
    fault: -0.4,
    fear: -0.55,
    feud: -0.5,
    fight: -0.45,
    fire: -0.35,
    flee: -0.4,
    flood: -0.45,
    foe: -0.5,
    force: -0.3,
    forfeit: -0.45,
    fraud: -0.65,
    freeze: -0.3,
    fury: -0.6,
    grief: -0.65,
    grieve: -0.6,
    grudge: -0.5,
    guilt: -0.55,
    harass: -0.65,
    hardship: -0.55,
    harm: -0.6,
    havoc: -0.6,
    hazard: -0.5,
    hinder: -0.4,
    horror: -0.7,
    humiliate: -0.65,
    hunger: -0.5,
    hurt: -0.55,
    hysteria: -0.6,
    impair: -0.45,
    impede: -0.4,
    impose: -0.35,
    imprison: -0.6,
    infection: -0.5,
    inflict: -0.55,
    injure: -0.55,
    insult: -0.55,
    intimidate: -0.55,
    invade: -0.55,
    isolate: -0.5,
    jeopardize: -0.55,
    lament: -0.5,
    lie: -0.55,
    limp: -0.3,
    lose: -0.5,
    loss: -0.55,
    menace: -0.55,
    mourn: -0.55,
    murder: -0.9,
    negate: -0.4,
    obstruct: -0.4,
    offend: -0.5,
    oppress: -0.6,
    ordeal: -0.55,
    outrage: -0.6,
    panic: -0.55,
    paralyze: -0.55,
    penalty: -0.4,
    peril: -0.55,
    persecute: -0.65,
    plague: -0.6,
    plunder: -0.6,
    poison: -0.6,
    pollute: -0.5,
    poverty: -0.6,
    prey: -0.5,
    punish: -0.5,
    rage: -0.6,
    ravage: -0.65,
    rebel: -0.35,
    recession: -0.5,
    regret: -0.5,
    reject: -0.55,
    relapse: -0.5,
    remorse: -0.55,
    resent: -0.5,
    resign: -0.4,
    retreat: -0.35,
    revenge: -0.55,
    ridicule: -0.55,
    ruin: -0.65,
    rupture: -0.5,
    sabotage: -0.65,
    sacrifice: -0.35,
    scare: -0.5,
    scold: -0.45,
    scorn: -0.55,
    shatter: -0.6,
    shock: -0.5,
    shrink: -0.3,
    sin: -0.5,
    slaughter: -0.8,
    slave: -0.6,
    smother: -0.5,
    snare: -0.45,
    sob: -0.5,
    sorrow: -0.6,
    spite: -0.55,
    starve: -0.6,
    steal: -0.6,
    sting: -0.4,
    storm: -0.4,
    strain: -0.4,
    strangle: -0.65,
    strike: -0.4,
    struggle: -0.45,
    stumble: -0.3,
    sue: -0.4,
    suffer: -0.6,
    suppress: -0.5,
    surrender: -0.45,
    suspect: -0.35,
    swear: -0.35,
    tantrum: -0.45,
    taunt: -0.5,
    tear: -0.35,
    tempt: -0.25,
    tension: -0.4,
    terror: -0.7,
    theft: -0.6,
    threat: -0.55,
    torment: -0.65,
    torture: -0.8,
    trauma: -0.65,
    tremble: -0.4,
    turmoil: -0.55,
    tyranny: -0.65,
    undermine: -0.5,
    undo: -0.35,
    vanish: -0.35,
    victim: -0.55,
    violate: -0.65,
    violence: -0.7,
    void: -0.4,
    war: -0.6,
    warn: -0.35,
    waste: -0.45,
    woe: -0.55,
    wound: -0.55,
    wreck: -0.6,
  }

  if (size === 'medium') return { ...core, ...medium }

  const large: Record<string, number> = {
    // ── Extended Positive ────────────────────────────────────────
    accessible: 0.35,
    acclaimed: 0.6,
    adaptable: 0.4,
    admirable: 0.55,
    adventurous: 0.45,
    affectionate: 0.55,
    agreeable: 0.4,
    altruistic: 0.55,
    ambitious: 0.45,
    ample: 0.3,
    appealing: 0.45,
    appreciative: 0.5,
    articulate: 0.4,
    attentive: 0.45,
    authentic: 0.5,
    benevolent: 0.55,
    bliss: 0.7,
    bold: 0.45,
    bountiful: 0.5,
    brave: 0.55,
    breathtaking: 0.7,
    buoyant: 0.5,
    capable: 0.4,
    captivating: 0.6,
    caring: 0.55,
    charismatic: 0.55,
    classy: 0.5,
    commendable: 0.5,
    compassionate: 0.6,
    competent: 0.45,
    composed: 0.35,
    constructive: 0.45,
    cooperative: 0.45,
    courteous: 0.45,
    credible: 0.4,
    cultivated: 0.4,
    daring: 0.4,
    dedicated: 0.5,
    dependable: 0.5,
    determined: 0.45,
    diligent: 0.5,
    diplomatic: 0.4,
    distinguished: 0.55,
    dynamic: 0.5,
    earnest: 0.45,
    easygoing: 0.4,
    eloquent: 0.5,
    empathetic: 0.55,
    endearing: 0.5,
    engaging: 0.5,
    enriching: 0.5,
    ethical: 0.45,
    exuberant: 0.6,
    faithful: 0.5,
    fearless: 0.5,
    flexible: 0.4,
    focused: 0.4,
    forgiving: 0.5,
    forthright: 0.4,
    gallant: 0.5,
    generous: 0.55,
    gifted: 0.5,
    glamorous: 0.5,
    goodhearted: 0.55,
    gracious: 0.55,
    grounded: 0.4,
    gutsy: 0.4,
    handsome: 0.5,
    hardworking: 0.5,
    heartfelt: 0.55,
    heroic: 0.6,
    hospitable: 0.5,
    humble: 0.45,
    illustrious: 0.55,
    imaginative: 0.5,
    immense: 0.4,
    impactful: 0.5,
    impressive: 0.55,
    inclusive: 0.45,
    independent: 0.4,
    industrious: 0.45,
    influential: 0.5,
    ingenious: 0.6,
    insightful: 0.55,
    instinctive: 0.35,
    instrumental: 0.45,
    intuitive: 0.45,
    inventive: 0.5,
    invigorating: 0.55,
    irresistible: 0.55,
    knowledgeable: 0.5,
    laudable: 0.5,
    legendary: 0.6,
    legitimate: 0.35,
    liberating: 0.55,
    lucid: 0.4,
    luminous: 0.5,
    luxurious: 0.5,
    meaningful: 0.5,
    meritorious: 0.5,
    mesmerizing: 0.6,
    methodical: 0.35,
    mighty: 0.5,
    mindblowing: 0.7,
    monumental: 0.6,
    natural: 0.3,
    openhearted: 0.5,
    optimized: 0.4,
    orderly: 0.3,
    original: 0.45,
    panoramic: 0.4,
    paramount: 0.5,
    passionate: 0.55,
    perceptive: 0.45,
    persistent: 0.45,
    picturesque: 0.5,
    playful: 0.45,
    poised: 0.4,
    polished: 0.45,
    praiseworthy: 0.55,
    premium: 0.5,
    principled: 0.45,
    proactive: 0.5,
    proficient: 0.45,
    progressive: 0.45,
    prolific: 0.5,
    prominent: 0.45,
    punctual: 0.35,
    purposeful: 0.45,
    qualified: 0.4,
    quickwitted: 0.5,
    rational: 0.35,
    receptive: 0.4,
    refined: 0.45,
    regal: 0.5,
    relentless: 0.4,
    remarkable: 0.6,
    renowned: 0.55,
    resourceful: 0.5,
    reverent: 0.4,
    righteous: 0.5,
    robust: 0.45,
    romantic: 0.5,
    savvy: 0.45,
    seamless: 0.5,
    selfless: 0.55,
    sensational: 0.65,
    shrewd: 0.4,
    significant: 0.4,
    skillful: 0.5,
    sophisticated: 0.5,
    soulful: 0.5,
    spectacular: 0.65,
    spontaneous: 0.4,
    steadfast: 0.5,
    stimulating: 0.5,
    strategic: 0.4,
    striking: 0.5,
    suave: 0.4,
    substantial: 0.4,
    superb: 0.65,
    supreme: 0.6,
    tactful: 0.4,
    tenacious: 0.5,
    timeless: 0.5,
    tireless: 0.45,
    topnotch: 0.6,
    trailblazing: 0.55,
    transformative: 0.55,
    transparent: 0.4,
    unforgettable: 0.6,
    unique: 0.45,
    unmatched: 0.55,
    unparalleled: 0.6,
    unwavering: 0.5,
    versatile: 0.45,
    vigorous: 0.45,
    visionary: 0.55,
    vivacious: 0.5,
    wondrous: 0.6,
    zealous: 0.45,

    // ── Extended Negative ────────────────────────────────────────
    absurd: -0.45,
    aimless: -0.4,
    aloof: -0.35,
    apathetic: -0.45,
    archaic: -0.3,
    atrocity: -0.8,
    austere: -0.3,
    aversion: -0.5,
    awkward: -0.3,
    backlash: -0.5,
    banal: -0.35,
    bankrupt: -0.6,
    barren: -0.4,
    belligerent: -0.55,
    bewilder: -0.35,
    biased: -0.4,
    blight: -0.55,
    blunder: -0.5,
    brash: -0.35,
    brawl: -0.5,
    brittle: -0.35,
    brutal: -0.65,
    callous: -0.55,
    captive: -0.45,
    careless: -0.45,
    caustic: -0.5,
    censor: -0.35,
    chaotic: -0.55,
    coerce: -0.55,
    complacent: -0.35,
    constrict: -0.35,
    contempt: -0.6,
    corrode: -0.45,
    cowardly: -0.5,
    crass: -0.45,
    cripple: -0.55,
    cynical: -0.45,
    deceptive: -0.55,
    deficit: -0.4,
    delinquent: -0.45,
    delude: -0.5,
    demean: -0.55,
    demoralizing: -0.55,
    depraved: -0.7,
    desolate: -0.6,
    deteriorate: -0.5,
    devious: -0.55,
    dictator: -0.6,
    disarray: -0.45,
    disconcert: -0.4,
    discredit: -0.5,
    disdain: -0.55,
    disenchant: -0.45,
    disgust: -0.6,
    dishearten: -0.5,
    disillusioned: -0.5,
    disloyal: -0.55,
    dismay: -0.5,
    disorder: -0.45,
    disparity: -0.4,
    displace: -0.4,
    divisive: -0.5,
    domineering: -0.5,
    downturn: -0.45,
    draconian: -0.55,
    dreary: -0.4,
    egregious: -0.6,
    elitist: -0.4,
    entangle: -0.35,
    erratic: -0.4,
    estranged: -0.5,
    exasperate: -0.5,
    excessive: -0.35,
    exclusion: -0.45,
    famine: -0.65,
    fanatic: -0.5,
    feeble: -0.4,
    ferocious: -0.5,
    fiasco: -0.6,
    fickle: -0.35,
    foolhardy: -0.4,
    forfeit: -0.45,
    frantic: -0.45,
    frivolous: -0.35,
    futile: -0.55,
    ghetto: -0.5,
    gluttony: -0.45,
    grave: -0.5,
    grievance: -0.5,
    grotesque: -0.55,
    haphazard: -0.4,
    havoc: -0.55,
    heartless: -0.6,
    hectic: -0.35,
    helpless: -0.55,
    heresy: -0.45,
    hindrance: -0.4,
    hollow: -0.4,
    hopelessness: -0.65,
    hostage: -0.55,
    humiliation: -0.65,
    hypocrisy: -0.55,
    ignorance: -0.5,
    illicit: -0.55,
    immoral: -0.6,
    impasse: -0.45,
    impetuous: -0.35,
    implode: -0.55,
    impotent: -0.45,
    impoverish: -0.55,
    imprudent: -0.4,
    inane: -0.4,
    incapable: -0.5,
    incoherent: -0.4,
    indifferent: -0.4,
    indignation: -0.5,
    inept: -0.5,
    infamous: -0.55,
    infuriate: -0.6,
    inhumane: -0.65,
    insidious: -0.6,
    intolerable: -0.6,
    irrational: -0.45,
    irresponsible: -0.5,
    jagged: -0.3,
    lethargic: -0.4,
    liability: -0.4,
    ludicrous: -0.5,
    lurk: -0.35,
    malevolent: -0.65,
    manipulate: -0.55,
    marginalize: -0.5,
    mayhem: -0.6,
    mediocrity: -0.4,
    menacing: -0.55,
    merciless: -0.6,
    militant: -0.45,
    misery: -0.65,
    mockery: -0.5,
    morbid: -0.55,
    mundane: -0.3,
    negligent: -0.5,
    nihilism: -0.5,
    noxious: -0.55,
    nuisance: -0.4,
    oblivious: -0.35,
    obsolete: -0.4,
    ominous: -0.5,
    oppression: -0.6,
    ostracize: -0.55,
    overburden: -0.45,
    paranoid: -0.5,
    passive: -0.25,
    pedantic: -0.3,
    perilous: -0.55,
    perverse: -0.6,
    pessimism: -0.5,
    petty: -0.4,
    piteous: -0.5,
    pompous: -0.45,
    predicament: -0.45,
    prejudice: -0.55,
    primitive: -0.3,
    profane: -0.5,
    propaganda: -0.45,
    provoke: -0.45,
    punitive: -0.45,
    quarrel: -0.4,
    rampant: -0.45,
    rash: -0.35,
    reckless: -0.5,
    redundant: -0.3,
    remorseless: -0.6,
    repressive: -0.55,
    repugnant: -0.6,
    resent: -0.5,
    restless: -0.35,
    retaliatory: -0.5,
    ruthless: -0.6,
    savage: -0.6,
    scandalous: -0.55,
    scapegoat: -0.5,
    severe: -0.5,
    sinful: -0.5,
    skeptical: -0.3,
    slander: -0.55,
    sleazy: -0.55,
    sluggish: -0.35,
    sordid: -0.55,
    stagnant: -0.4,
    stigma: -0.5,
    strife: -0.55,
    subversive: -0.45,
    suffocate: -0.55,
    swindle: -0.6,
    tarnish: -0.45,
    terrifying: -0.65,
    thwart: -0.4,
    toxic: -0.6,
    traumatic: -0.6,
    treachery: -0.65,
    turbulent: -0.45,
    tyrannical: -0.6,
    unethical: -0.55,
    ungrateful: -0.45,
    unjust: -0.55,
    unmerciful: -0.6,
    unscrupulous: -0.6,
    upheaval: -0.5,
    vengeful: -0.55,
    vindictive: -0.55,
    volatile: -0.45,
    vulnerability: -0.4,
    wanton: -0.5,
    warfare: -0.6,
    woeful: -0.55,
  }

  return { ...core, ...medium, ...large }
}

// ── Emotion Lexicons (Plutchik's 8 Basic Emotions) ──────────────────────────

const EMOTION_LEXICON: Record<EmotionType, string[]> = {
  joy: [
    'happy',
    'joy',
    'joyful',
    'delighted',
    'cheerful',
    'pleased',
    'glad',
    'elated',
    'ecstatic',
    'thrilled',
    'blissful',
    'merry',
    'jubilant',
    'euphoric',
    'overjoyed',
    'radiant',
    'content',
    'satisfied',
    'amused',
    'laugh',
    'laughter',
    'smile',
    'grin',
    'celebrate',
    'celebration',
    'fun',
    'playful',
    'wonderful',
    'amazing',
    'awesome',
    'fantastic',
    'love',
    'loving',
    'adore',
    'cherish',
    'treasure',
    'bliss',
    'paradise',
    'heaven',
    'delight',
    'pleasure',
    'enjoy',
    'enjoyable',
    'festive',
    'rejoice',
    'triumph',
    'victory',
    'win',
    'succeed',
    'grateful',
    'thankful',
    'blessed',
    'fortunate',
    'lucky',
    'exhilarated',
  ],
  sadness: [
    'sad',
    'sadness',
    'unhappy',
    'depressed',
    'depressing',
    'melancholy',
    'gloomy',
    'somber',
    'sorrowful',
    'mournful',
    'grief',
    'grieve',
    'mourn',
    'weep',
    'cry',
    'tear',
    'tears',
    'heartbroken',
    'heartbreak',
    'lonely',
    'loneliness',
    'isolated',
    'abandoned',
    'forsaken',
    'miserable',
    'wretched',
    'hopeless',
    'despair',
    'despondent',
    'dismay',
    'disappointed',
    'disappointing',
    'regret',
    'regretful',
    'remorse',
    'lament',
    'suffering',
    'anguish',
    'agony',
    'pain',
    'hurt',
    'wounded',
    'broken',
    'shattered',
    'devastated',
    'crushed',
    'dejected',
    'downcast',
    'forlorn',
    'glum',
    'blue',
    'dismal',
    'tragic',
    'tragedy',
    'loss',
    'lose',
    'lost',
    'miss',
    'missing',
  ],
  anger: [
    'angry',
    'anger',
    'furious',
    'enraged',
    'outraged',
    'irate',
    'livid',
    'fuming',
    'seething',
    'indignant',
    'incensed',
    'infuriated',
    'mad',
    'hostile',
    'aggressive',
    'violent',
    'rage',
    'wrath',
    'hate',
    'hatred',
    'loathe',
    'detest',
    'despise',
    'resent',
    'resentment',
    'bitter',
    'bitterness',
    'spite',
    'spiteful',
    'vengeful',
    'revenge',
    'retaliate',
    'attack',
    'fight',
    'combat',
    'battle',
    'irritated',
    'annoyed',
    'frustrated',
    'exasperated',
    'provoked',
    'offended',
    'insulted',
    'disrespected',
    'betrayed',
    'cheated',
    'cruel',
    'ruthless',
    'brutal',
    'vicious',
    'fierce',
    'ferocious',
    'explode',
    'scream',
    'yell',
    'shout',
    'curse',
    'damn',
  ],
  fear: [
    'afraid',
    'fear',
    'fearful',
    'scared',
    'terrified',
    'horrified',
    'petrified',
    'panic',
    'panicked',
    'anxious',
    'anxiety',
    'nervous',
    'dread',
    'dreading',
    'apprehensive',
    'worried',
    'worry',
    'concern',
    'alarmed',
    'frightened',
    'startled',
    'spooked',
    'uneasy',
    'tense',
    'threatened',
    'intimidated',
    'vulnerable',
    'helpless',
    'defenseless',
    'insecure',
    'paranoid',
    'phobia',
    'horror',
    'terror',
    'nightmare',
    'creepy',
    'eerie',
    'sinister',
    'ominous',
    'menacing',
    'threatening',
    'dangerous',
    'hazardous',
    'risky',
    'perilous',
    'treacherous',
    'trembling',
    'shaking',
    'shiver',
    'cowardly',
    'timid',
    'shy',
    'distressed',
    'desperate',
    'doom',
    'doomsday',
    'catastrophe',
  ],
  surprise: [
    'surprised',
    'surprise',
    'astonished',
    'amazed',
    'astounded',
    'stunned',
    'shocked',
    'startled',
    'bewildered',
    'dumbfounded',
    'flabbergasted',
    'speechless',
    'unexpected',
    'suddenly',
    'abrupt',
    'unbelievable',
    'incredible',
    'extraordinary',
    'remarkable',
    'unprecedented',
    'unusual',
    'strange',
    'odd',
    'peculiar',
    'wow',
    'whoa',
    'omg',
    'gasp',
    'unreal',
    'mindblowing',
    'revelation',
    'discover',
    'discovery',
    'reveal',
    'twist',
    'plot twist',
    'bombshell',
    'jaw-dropping',
    'eye-opening',
    'taken aback',
    'caught off guard',
    'out of nowhere',
    'shocking',
    'staggering',
    'breathtaking',
    'awe',
    'wonder',
  ],
  disgust: [
    'disgusted',
    'disgust',
    'disgusting',
    'revolting',
    'repulsive',
    'repugnant',
    'nauseating',
    'nauseous',
    'sickening',
    'vile',
    'gross',
    'nasty',
    'filthy',
    'foul',
    'putrid',
    'rotten',
    'loathsome',
    'abhorrent',
    'detestable',
    'contemptible',
    'despicable',
    'offensive',
    'obnoxious',
    'repellent',
    'distasteful',
    'unpalatable',
    'stomach-turning',
    'cringe',
    'yuck',
    'ugh',
    'ew',
    'eww',
    'hideous',
    'ghastly',
    'abominable',
    'appalling',
    'deplorable',
    'shameful',
    'vulgar',
    'obscene',
    'profane',
    'indecent',
    'corrupt',
    'immoral',
    'unethical',
    'sleazy',
    'sordid',
    'toxic',
    'contaminated',
    'polluted',
    'tainted',
    'infected',
  ],
  trust: [
    'trust',
    'trustworthy',
    'reliable',
    'dependable',
    'faithful',
    'loyal',
    'devoted',
    'dedicated',
    'committed',
    'honest',
    'sincere',
    'genuine',
    'authentic',
    'truthful',
    'transparent',
    'credible',
    'believable',
    'consistent',
    'steady',
    'stable',
    'secure',
    'safe',
    'confident',
    'assurance',
    'certainty',
    'integrity',
    'honor',
    'respect',
    'admire',
    'admiration',
    'believe',
    'belief',
    'faith',
    'hope',
    'optimistic',
    'supportive',
    'protective',
    'caring',
    'compassionate',
    'empathetic',
    'fair',
    'just',
    'ethical',
    'moral',
    'righteous',
    'accountable',
    'responsible',
    'mature',
    'wise',
    'prudent',
  ],
  anticipation: [
    'anticipate',
    'anticipation',
    'expect',
    'expectation',
    'await',
    'waiting',
    'eager',
    'eagerness',
    'excited',
    'excitement',
    'looking forward',
    'hopeful',
    'optimistic',
    'curious',
    'curiosity',
    'interested',
    'intrigued',
    'fascinated',
    'wonder',
    'wondering',
    'ready',
    'prepared',
    'planning',
    'plan',
    'forecast',
    'predict',
    'prediction',
    'prospect',
    'potential',
    'promising',
    'upcoming',
    'forthcoming',
    'imminent',
    'approaching',
    'soon',
    'dream',
    'aspire',
    'ambition',
    'goal',
    'vision',
    'imagine',
    'envision',
    'foresee',
    'speculate',
    'contemplate',
    'suspense',
    'cliff-hanger',
    'tension',
    'buildup',
    'momentum',
  ],
}

// ── Negation, Intensifier & Diminisher Words ─────────────────────────────────

const NEGATION_WORDS = new Set([
  'not',
  'no',
  'never',
  'neither',
  'nobody',
  'nothing',
  'nowhere',
  'nor',
  'none',
  "n't",
  'cannot',
  "can't",
  "won't",
  "wouldn't",
  "shouldn't",
  "couldn't",
  "doesn't",
  "didn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "hasn't",
  "haven't",
  "hadn't",
  'hardly',
  'barely',
  'scarcely',
  'seldom',
  'rarely',
  'without',
  'lack',
  'lacking',
  'absent',
  'devoid',
  'minus',
])

const INTENSIFIERS: Record<string, number> = {
  very: 1.5,
  extremely: 1.8,
  incredibly: 1.7,
  absolutely: 1.8,
  totally: 1.6,
  completely: 1.6,
  utterly: 1.7,
  truly: 1.4,
  really: 1.4,
  highly: 1.5,
  deeply: 1.5,
  immensely: 1.7,
  enormously: 1.6,
  exceedingly: 1.7,
  remarkably: 1.5,
  particularly: 1.3,
  especially: 1.4,
  exceptionally: 1.6,
  extraordinarily: 1.7,
  most: 1.4,
  quite: 1.2,
  so: 1.3,
  such: 1.3,
  super: 1.5,
  mega: 1.6,
  ultra: 1.6,
  damn: 1.5,
  freaking: 1.5,
  ridiculously: 1.6,
  insanely: 1.7,
  wildly: 1.5,
  fantastically: 1.6,
  amazingly: 1.6,
  awfully: 1.4,
  terribly: 1.4,
  severely: 1.5,
  gravely: 1.5,
  profoundly: 1.6,
  supremely: 1.6,
}

const DIMINISHERS: Record<string, number> = {
  slightly: 0.5,
  somewhat: 0.6,
  rather: 0.7,
  fairly: 0.7,
  mildly: 0.5,
  marginally: 0.4,
  a_bit: 0.5,
  a_little: 0.5,
  moderately: 0.6,
  partly: 0.6,
  partially: 0.6,
  kind_of: 0.6,
  sort_of: 0.6,
  almost: 0.7,
  nearly: 0.7,
  barely: 0.4,
  hardly: 0.3,
  just: 0.7,
  only: 0.6,
  merely: 0.5,
  relatively: 0.7,
  comparatively: 0.7,
  occasionally: 0.5,
  sometimes: 0.6,
  scarcely: 0.4,
}

// ── Subjectivity Cues ────────────────────────────────────────────────────────

const OPINION_CUES = new Set([
  'think',
  'believe',
  'feel',
  'opinion',
  'seems',
  'appears',
  'suggest',
  'argue',
  'claim',
  'consider',
  'assume',
  'suppose',
  'guess',
  'imagine',
  'prefer',
  'recommend',
  'advise',
  'urge',
  'insist',
  'maintain',
  'contend',
  'assert',
  'allege',
  'speculate',
  'doubt',
  'suspect',
  'question',
  'wonder',
  'hope',
  'wish',
  'personally',
  'subjectively',
  'arguably',
  'supposedly',
  'allegedly',
  'perhaps',
  'maybe',
  'possibly',
  'probably',
  'likely',
  'unlikely',
  'definitely',
  'certainly',
  'obviously',
  'clearly',
  'evidently',
  'apparently',
  'presumably',
  'unfortunately',
  'fortunately',
  'hopefully',
  'frankly',
  'honestly',
  'truthfully',
  'admittedly',
  'ideally',
  'best',
  'worst',
  'favorite',
  'terrible',
  'wonderful',
  'awful',
  'love',
  'hate',
  'enjoy',
  'despise',
  'adore',
  'loathe',
  'should',
  'must',
  'ought',
  'need',
  'deserve',
])

const OBJECTIVE_CUES = new Set([
  'according',
  'data',
  'study',
  'research',
  'statistics',
  'evidence',
  'reported',
  'measured',
  'calculated',
  'observed',
  'documented',
  'recorded',
  'published',
  'percent',
  'percentage',
  'number',
  'figure',
  'total',
  'average',
  'median',
  'result',
  'findings',
  'analysis',
  'experiment',
  'survey',
  'report',
  'census',
  'fact',
  'factual',
  'proven',
  'confirmed',
  'verified',
  'established',
  'official',
  'formal',
  'scientific',
  'empirical',
  'systematic',
  'quantitative',
  'qualitative',
  'objective',
  'neutral',
  'unbiased',
])

// ── Sarcasm Patterns ─────────────────────────────────────────────────────────

const SARCASM_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
  { pattern: /\boh great\b/i, weight: 0.7 },
  { pattern: /\boh wonderful\b/i, weight: 0.7 },
  { pattern: /\boh fantastic\b/i, weight: 0.7 },
  { pattern: /\boh perfect\b/i, weight: 0.7 },
  { pattern: /\byeah right\b/i, weight: 0.65 },
  { pattern: /\bsure thing\b/i, weight: 0.4 },
  { pattern: /\bthanks a lot\b/i, weight: 0.5 },
  { pattern: /\bhow nice\b/i, weight: 0.5 },
  { pattern: /\bjust great\b/i, weight: 0.6 },
  { pattern: /\bjust wonderful\b/i, weight: 0.6 },
  { pattern: /\bjust perfect\b/i, weight: 0.6 },
  { pattern: /\bjust what i needed\b/i, weight: 0.6 },
  { pattern: /\bwhat a surprise\b/i, weight: 0.5 },
  { pattern: /\btell me about it\b/i, weight: 0.4 },
  { pattern: /\bnice going\b/i, weight: 0.5 },
  { pattern: /\bnice job\b/i, weight: 0.35 },
  { pattern: /\bwow\b.*\bimpressed\b/i, weight: 0.4 },
  { pattern: /\breally\b\?/i, weight: 0.3 },
  { pattern: /\bso helpful\b/i, weight: 0.35 },
  { pattern: /\bclearly\b.*\bgood idea\b/i, weight: 0.5 },
  { pattern: /\bbrilliant\b.*\bmove\b/i, weight: 0.4 },
  { pattern: /\bwhat a joy\b/i, weight: 0.5 },
  { pattern: /\boh how lovely\b/i, weight: 0.6 },
  { pattern: /\bcolor me surprised\b/i, weight: 0.6 },
]

// ── Aspect Categories ────────────────────────────────────────────────────────

const ASPECT_CATEGORIES: Record<string, string[]> = {
  product: [
    'quality',
    'design',
    'durability',
    'price',
    'value',
    'packaging',
    'size',
    'color',
    'material',
    'weight',
    'appearance',
    'texture',
    'feature',
    'functionality',
    'performance',
    'reliability',
    'brand',
    'warranty',
    'battery',
    'screen',
    'camera',
    'sound',
    'build',
  ],
  service: [
    'service',
    'support',
    'staff',
    'response',
    'delivery',
    'shipping',
    'return',
    'refund',
    'communication',
    'availability',
    'speed',
    'efficiency',
    'professionalism',
    'friendliness',
    'helpfulness',
    'experience',
    'wait',
    'queue',
    'attitude',
    'courtesy',
  ],
  food: [
    'taste',
    'flavor',
    'freshness',
    'portion',
    'presentation',
    'menu',
    'ingredients',
    'seasoning',
    'temperature',
    'texture',
    'aroma',
    'cooking',
    'recipe',
    'nutrition',
    'spice',
    'sweetness',
  ],
  code: [
    'code',
    'api',
    'documentation',
    'performance',
    'security',
    'testing',
    'deployment',
    'scalability',
    'maintainability',
    'readability',
    'architecture',
    'framework',
    'library',
    'dependency',
    'interface',
    'implementation',
    'bug',
    'error',
    'latency',
    'throughput',
    'coverage',
    'refactor',
    'syntax',
    'compatibility',
  ],
  accommodation: [
    'room',
    'bed',
    'bathroom',
    'cleanliness',
    'location',
    'amenities',
    'view',
    'noise',
    'wifi',
    'breakfast',
    'parking',
    'pool',
    'staff',
    'check-in',
    'checkout',
    'comfort',
    'space',
    'decor',
  ],
}

// ── Opinion Expression Patterns ──────────────────────────────────────────────

const OPINION_PATTERNS: Array<{
  regex: RegExp
  holderGroup: number | null
  targetGroup: number
  expressionGroup: number
}> = [
  {
    regex:
      /\b(i|we|they|he|she)\s+(think|believe|feel|find)\s+(?:that\s+)?(?:the\s+)?(\w+)\s+(?:is|are|was|were)\s+(\w+)/i,
    holderGroup: 1,
    targetGroup: 3,
    expressionGroup: 4,
  },
  {
    regex:
      /\b(?:the\s+)?(\w+)\s+(?:is|are|was|were)\s+(very\s+|extremely\s+|quite\s+|rather\s+)?(\w+)/i,
    holderGroup: null,
    targetGroup: 1,
    expressionGroup: 3,
  },
  {
    regex: /\b(i|we)\s+(love|hate|enjoy|dislike|prefer|adore|detest)\s+(?:the\s+)?(\w+)/i,
    holderGroup: 1,
    targetGroup: 3,
    expressionGroup: 2,
  },
  {
    regex:
      /\b(?:the\s+)?(\w+)\s+(?:is|are)\s+(?:not\s+)?(?:a\s+)?(\w+)\s+(thing|idea|choice|option|approach|solution)/i,
    holderGroup: null,
    targetGroup: 1,
    expressionGroup: 2,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0)
}

function splitSentences(text: string): string[] {
  const raw = text
    .replace(/([.!?]+)\s+/g, '$1\n')
    .replace(/([.!?]+)$/, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (raw.length === 0 && text.trim().length > 0) {
    return [text.trim()]
  }

  return raw
}

function scoreToLabel(score: number): SentimentLabel {
  if (score <= -0.6) return 'very_negative'
  if (score <= -0.2) return 'negative'
  if (score <= 0.2) return 'neutral'
  if (score <= 0.6) return 'positive'
  return 'very_positive'
}

function labelToScore(label: SentimentLabel): number {
  switch (label) {
    case 'very_negative':
      return -0.8
    case 'negative':
      return -0.4
    case 'neutral':
      return 0.0
    case 'positive':
      return 0.4
    case 'very_positive':
      return 0.8
  }
}

function isNounLike(word: string): boolean {
  const suffixes = [
    'tion',
    'ment',
    'ness',
    'ity',
    'ence',
    'ance',
    'ism',
    'ist',
    'ing',
    'ure',
    'age',
    'ship',
    'dom',
    'hood',
    'ery',
    'ology',
  ]
  const lower = word.toLowerCase()
  return suffixes.some(s => lower.endsWith(s)) || lower.length >= 4
}

function isAdjectiveLike(word: string, lexicon: Record<string, number>): boolean {
  const suffixes = [
    'ful',
    'less',
    'ous',
    'ive',
    'able',
    'ible',
    'al',
    'ish',
    'ic',
    'ical',
    'ent',
    'ant',
    'ary',
    'ory',
  ]
  const lower = word.toLowerCase()
  if (lower in lexicon) return true
  return suffixes.some(s => lower.endsWith(s))
}

// Common stop words to exclude from aspect extraction
const STOP_WORDS = new Set([
  'the',
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
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'can',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'what',
  'which',
  'who',
  'whom',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'not',
  'only',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'because',
  'as',
  'if',
  'then',
  'else',
  'about',
  'up',
  'out',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'again',
  'further',
  'once',
  'here',
  'there',
  'any',
  'many',
  'much',
  'also',
  'still',
  'even',
  'get',
  'got',
  'let',
  'make',
  'say',
  'said',
  'go',
  'going',
  'went',
  'come',
  'came',
  'take',
  'took',
  'give',
  'gave',
  'know',
  'knew',
  'see',
  'saw',
  'think',
  'thought',
  'thing',
  'things',
  'way',
  'well',
  'really',
  'actually',
  'quite',
  'rather',
  'bit',
  'lot',
  'something',
  'nothing',
  'everything',
  'anything',
  'one',
  'two',
  'three',
  'been',
])

// ── Main Class ──────────────────────────────────────────────────────────────

export class SentimentAnalyzer {
  private readonly config: SentimentAnalyzerConfig
  private readonly sentimentLexicon: Record<string, number>
  private readonly customLexicon: Record<string, number>
  private readonly analysisHistory: Array<{
    analysisId: string
    timestamp: number
    label: SentimentLabel
    wordCount: number
  }> = []
  private readonly feedbackLog: Array<{
    analysisId: string
    correctedLabel: SentimentLabel
  }> = []
  private totalAnalyses = 0
  private totalWordsProcessed = 0
  private totalAspectsExtracted = 0
  private totalEmotionsDetected = 0
  private positiveCount = 0
  private negativeCount = 0
  private neutralCount = 0
  private analysisTimesMs: number[] = []

  constructor(config?: Partial<SentimentAnalyzerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sentimentLexicon = buildSentimentLexicon(this.config.lexiconSize)
    this.customLexicon = { ...this.config.customLexicon }
  }

  // ── Full Analysis ──────────────────────────────────────────────────────

  /** Perform a comprehensive sentiment analysis on the given text. */
  analyze(text: string): SentimentAnalysisResult {
    const startTime = Date.now()
    const analysisId = generateId('SA')

    const sentences = splitSentences(text)
    const sentenceSentiments = sentences.map(s => this.analyzeSentence(s))
    const overall = this.computeOverallFromSentences(sentenceSentiments)

    const aspects = this.config.enableAspectAnalysis ? this.extractAspects(text) : []

    const emotions = this.config.enableEmotionDetection ? this.detectEmotions(text) : []

    const subjectivity = this.config.enableSubjectivity
      ? this.measureSubjectivity(text)
      : { score: 0.5, label: 'mixed' as const, opinionPhrases: [] }

    const opinions = this.extractOpinions(text)

    const summary = this.buildSummary(overall, sentenceSentiments, aspects, emotions)

    const duration = Date.now() - startTime

    // Update stats
    this.totalAnalyses++
    const words = tokenize(text)
    this.totalWordsProcessed += words.length
    this.totalAspectsExtracted += aspects.length
    this.totalEmotionsDetected += emotions.filter(e => e.intensity > 0.1).length
    this.analysisTimesMs.push(duration)

    if (overall.label === 'positive' || overall.label === 'very_positive') {
      this.positiveCount++
    } else if (overall.label === 'negative' || overall.label === 'very_negative') {
      this.negativeCount++
    } else {
      this.neutralCount++
    }

    this.analysisHistory.push({
      analysisId,
      timestamp: startTime,
      label: overall.label,
      wordCount: words.length,
    })

    return {
      analysisId,
      timestamp: startTime,
      duration,
      text,
      overall,
      sentences: sentenceSentiments,
      aspects,
      emotions,
      subjectivity,
      opinions,
      summary,
    }
  }

  // ── Sentence Analysis ──────────────────────────────────────────────────

  /** Analyze a single sentence for sentiment, emotion, and subjectivity. */
  analyzeSentence(sentence: string): SentenceSentiment {
    const sentiment = this.scoreSentence(sentence)
    const emotions = this.config.enableEmotionDetection ? this.detectEmotions(sentence) : []
    const subjectivity = this.config.enableSubjectivity
      ? this.measureSubjectivity(sentence)
      : { score: 0.5, label: 'mixed' as const, opinionPhrases: [] }

    return { text: sentence, sentiment, emotions, subjectivity }
  }

  // ── Quick Sentiment ────────────────────────────────────────────────────

  /** Get a quick overall sentiment score for the given text. */
  getOverallSentiment(text: string): SentimentScore {
    const sentences = splitSentences(text)
    const scored = sentences.map(s => this.scoreSentence(s))
    return this.computeOverallFromScores(scored)
  }

  // ── Emotion Detection ──────────────────────────────────────────────────

  /** Detect emotions present in the text, based on Plutchik's 8 basic emotions. */
  detectEmotions(text: string): EmotionScore[] {
    const words = tokenize(text)
    const results: EmotionScore[] = []

    for (const emotionType of Object.keys(EMOTION_LEXICON) as EmotionType[]) {
      const emotionWords = EMOTION_LEXICON[emotionType]
      const triggers: string[] = []
      let totalIntensity = 0

      for (const word of words) {
        if (emotionWords.includes(word)) {
          triggers.push(word)
          // Check if an intensifier precedes this word
          const wordIndex = words.indexOf(word)
          let modifier = 1.0
          if (wordIndex > 0) {
            const prev = words[wordIndex - 1]
            if (prev in INTENSIFIERS) {
              modifier = INTENSIFIERS[prev]
            } else if (prev in DIMINISHERS) {
              modifier = DIMINISHERS[prev]
            }
          }
          totalIntensity += modifier
        }
      }

      const maxPossible = Math.max(words.length * 0.3, 1)
      const intensity = clamp(totalIntensity / maxPossible, 0, 1)

      if (triggers.length > 0) {
        results.push({
          emotion: emotionType,
          intensity: round2(intensity),
          triggers: [...new Set(triggers)],
        })
      }
    }

    // Sort by intensity descending
    results.sort((a, b) => b.intensity - a.intensity)
    return results
  }

  // ── Aspect Extraction ──────────────────────────────────────────────────

  /** Extract aspect-based sentiment from the text. */
  extractAspects(text: string): AspectSentiment[] {
    const words = tokenize(text)
    const lexicon = this.getMergedLexicon()
    const aspectMap = new Map<string, { scores: number[]; keywords: Set<string> }>()

    // Extract aspects from known categories
    const allAspectWords = new Set<string>()
    for (const category of Object.values(ASPECT_CATEGORIES)) {
      for (const word of category) {
        allAspectWords.add(word.toLowerCase())
      }
    }

    // Scan for aspect words and nearby sentiment
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      if (!allAspectWords.has(word) && !this.isContentNoun(word, words, i)) continue
      if (STOP_WORDS.has(word)) continue

      const aspect = word
      const windowStart = Math.max(0, i - 4)
      const windowEnd = Math.min(words.length, i + 5)
      const contextWords = words.slice(windowStart, windowEnd)

      let sentimentScore = 0
      let sentimentCount = 0
      const keywords = new Set<string>()

      for (let j = 0; j < contextWords.length; j++) {
        const cw = contextWords[j]
        if (cw in lexicon) {
          let score = lexicon[cw]
          // Check for negation
          if (j > 0 && NEGATION_WORDS.has(contextWords[j - 1])) {
            score = -score * 0.8
          }
          sentimentScore += score
          sentimentCount++
          keywords.add(cw)
        }
      }

      if (sentimentCount > 0 || allAspectWords.has(aspect)) {
        if (!aspectMap.has(aspect)) {
          aspectMap.set(aspect, { scores: [], keywords: new Set() })
        }
        const entry = aspectMap.get(aspect)!
        entry.scores.push(sentimentCount > 0 ? sentimentScore / sentimentCount : 0)
        for (const kw of keywords) entry.keywords.add(kw)
      }
    }

    const results: AspectSentiment[] = []
    for (const [aspect, data] of aspectMap) {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      const clamped = clamp(avgScore, -1, 1)
      results.push({
        aspect,
        sentiment: {
          score: round2(clamped),
          magnitude: round2(Math.abs(clamped)),
          label: scoreToLabel(clamped),
          confidence: round2(clamp(data.scores.length * 0.25, 0.1, 0.95)),
        },
        mentions: data.scores.length,
        keywords: [...data.keywords],
      })
    }

    results.sort((a, b) => b.mentions - a.mentions)
    return results
  }

  // ── Subjectivity Measurement ───────────────────────────────────────────

  /** Measure how subjective or objective the text is. */
  measureSubjectivity(text: string): SubjectivityScore {
    const words = tokenize(text)
    let opinionCount = 0
    let objectiveCount = 0
    const opinionPhrases: string[] = []

    // Check for opinion cue words
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      if (OPINION_CUES.has(word)) {
        opinionCount++
        // Extract a small phrase around the opinion cue
        const phraseStart = Math.max(0, i - 1)
        const phraseEnd = Math.min(words.length, i + 3)
        const phrase = words.slice(phraseStart, phraseEnd).join(' ')
        if (phrase.length > 3) {
          opinionPhrases.push(phrase)
        }
      }
      if (OBJECTIVE_CUES.has(word)) {
        objectiveCount++
      }
    }

    // Check for sentiment-laden words (subjective indicators)
    const lexicon = this.getMergedLexicon()
    let sentimentWordCount = 0
    for (const word of words) {
      if (word in lexicon && Math.abs(lexicon[word]) > 0.3) {
        sentimentWordCount++
      }
    }

    const totalCues = opinionCount + objectiveCount + sentimentWordCount
    if (totalCues === 0) {
      return { score: 0.5, label: 'mixed', opinionPhrases: [] }
    }

    const subjectiveCues = opinionCount + sentimentWordCount * 0.5
    const objectiveCues = objectiveCount
    const rawScore = subjectiveCues / (subjectiveCues + objectiveCues + 1)
    const score = clamp(rawScore, 0, 1)

    let label: 'objective' | 'subjective' | 'mixed'
    if (score < 0.35) {
      label = 'objective'
    } else if (score > 0.65) {
      label = 'subjective'
    } else {
      label = 'mixed'
    }

    return {
      score: round2(score),
      label,
      opinionPhrases: [...new Set(opinionPhrases)].slice(0, 10),
    }
  }

  // ── Opinion Extraction ─────────────────────────────────────────────────

  /** Extract explicit opinion expressions from the text. */
  extractOpinions(text: string): OpinionInfo[] {
    const opinions: OpinionInfo[] = []
    const lexicon = this.getMergedLexicon()

    for (const { regex, holderGroup, targetGroup, expressionGroup } of OPINION_PATTERNS) {
      const matches = text.matchAll(new RegExp(regex, 'gi'))
      for (const match of matches) {
        const holder = holderGroup !== null ? (match[holderGroup] ?? null) : null
        const target = match[targetGroup] ?? ''
        const expression = match[expressionGroup] ?? ''

        if (!target || !expression) continue
        if (STOP_WORDS.has(target.toLowerCase())) continue

        const expressionLower = expression.toLowerCase()
        const score = lexicon[expressionLower] ?? 0
        const polarity = scoreToLabel(score)

        opinions.push({
          holder: holder ? holder.toLowerCase() : null,
          target: target.toLowerCase(),
          polarity,
          expression: expression.toLowerCase(),
          confidence: round2(clamp(Math.abs(score) + 0.2, 0.1, 0.95)),
        })
      }
    }

    // Deduplicate by target + expression
    const seen = new Set<string>()
    return opinions.filter(op => {
      const key = `${op.target}:${op.expression}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // ── Sentiment Comparison ───────────────────────────────────────────────

  /** Compare sentiment between two texts. */
  compareSentiment(
    textA: string,
    textB: string,
  ): { textA: SentimentScore; textB: SentimentScore; difference: number } {
    const scoreA = this.getOverallSentiment(textA)
    const scoreB = this.getOverallSentiment(textB)
    return {
      textA: scoreA,
      textB: scoreB,
      difference: round2(scoreA.score - scoreB.score),
    }
  }

  // ── Custom Lexicon Management ──────────────────────────────────────────

  /** Add a word with a sentiment score to the custom lexicon. */
  addCustomWord(word: string, score: number): void {
    this.customLexicon[word.toLowerCase()] = clamp(score, -1, 1)
  }

  /** Remove a word from the custom lexicon. */
  removeCustomWord(word: string): boolean {
    const lower = word.toLowerCase()
    if (lower in this.customLexicon) {
      delete this.customLexicon[lower]
      return true
    }
    return false
  }

  /** Get a copy of the current custom lexicon. */
  getCustomLexicon(): Record<string, number> {
    return { ...this.customLexicon }
  }

  // ── Feedback ───────────────────────────────────────────────────────────

  /** Provide feedback to improve future analyses via lexicon adjustment. */
  provideFeedback(analysisId: string, correctedLabel: SentimentLabel): void {
    this.feedbackLog.push({ analysisId, correctedLabel })

    // Look up the original analysis
    const original = this.analysisHistory.find(h => h.analysisId === analysisId)
    if (!original) return

    const originalScore = labelToScore(original.label)
    const correctedScore = labelToScore(correctedLabel)
    const diff = correctedScore - originalScore

    // Slight adjustment: nudge sentiment words seen in context
    // This is a simplified learning step: boost or reduce custom entries
    if (Math.abs(diff) > 0.1) {
      for (const [word, score] of Object.entries(this.customLexicon)) {
        const adjusted = score + diff * 0.05
        this.customLexicon[word] = clamp(adjusted, -1, 1)
      }
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  /** Return aggregate statistics for the analyzer. */
  getStats(): Readonly<SentimentAnalyzerStats> {
    const avgAnalysisTime =
      this.analysisTimesMs.length > 0
        ? this.analysisTimesMs.reduce((s, v) => s + v, 0) / this.analysisTimesMs.length
        : 0

    return {
      totalAnalyses: this.totalAnalyses,
      totalWordsProcessed: this.totalWordsProcessed,
      totalAspectsExtracted: this.totalAspectsExtracted,
      totalEmotionsDetected: this.totalEmotionsDetected,
      avgAnalysisTime: round2(avgAnalysisTime),
      feedbackCount: this.feedbackLog.length,
      positiveCount: this.positiveCount,
      negativeCount: this.negativeCount,
      neutralCount: this.neutralCount,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize the analyzer state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      customLexicon: this.customLexicon,
      totalAnalyses: this.totalAnalyses,
      totalWordsProcessed: this.totalWordsProcessed,
      totalAspectsExtracted: this.totalAspectsExtracted,
      totalEmotionsDetected: this.totalEmotionsDetected,
      positiveCount: this.positiveCount,
      negativeCount: this.negativeCount,
      neutralCount: this.neutralCount,
      analysisTimesMs: this.analysisTimesMs,
      analysisHistory: this.analysisHistory,
      feedbackLog: this.feedbackLog,
    })
  }

  /** Restore a SentimentAnalyzer from serialized JSON. */
  static deserialize(json: string): SentimentAnalyzer {
    const data = JSON.parse(json) as {
      config: SentimentAnalyzerConfig
      customLexicon: Record<string, number>
      totalAnalyses: number
      totalWordsProcessed: number
      totalAspectsExtracted: number
      totalEmotionsDetected: number
      positiveCount: number
      negativeCount: number
      neutralCount: number
      analysisTimesMs: number[]
      analysisHistory: Array<{
        analysisId: string
        timestamp: number
        label: SentimentLabel
        wordCount: number
      }>
      feedbackLog: Array<{
        analysisId: string
        correctedLabel: SentimentLabel
      }>
    }

    const instance = new SentimentAnalyzer(data.config)

    // Restore custom lexicon
    for (const [word, score] of Object.entries(data.customLexicon)) {
      instance.customLexicon[word] = score
    }

    instance.totalAnalyses = data.totalAnalyses
    instance.totalWordsProcessed = data.totalWordsProcessed
    instance.totalAspectsExtracted = data.totalAspectsExtracted
    instance.totalEmotionsDetected = data.totalEmotionsDetected
    instance.positiveCount = data.positiveCount
    instance.negativeCount = data.negativeCount
    instance.neutralCount = data.neutralCount
    instance.analysisTimesMs = data.analysisTimesMs

    for (const entry of data.analysisHistory) {
      instance.analysisHistory.push(entry)
    }
    for (const entry of data.feedbackLog) {
      instance.feedbackLog.push(entry)
    }

    return instance
  }

  // ── Private Helpers ────────────────────────────────────────────────────

  /** Get the merged lexicon (built-in + custom, custom overrides built-in). */
  private getMergedLexicon(): Record<string, number> {
    return { ...this.sentimentLexicon, ...this.customLexicon }
  }

  /** Score a single sentence, handling negation, intensifiers, and sarcasm. */
  private scoreSentence(sentence: string): SentimentScore {
    const words = tokenize(sentence)
    const lexicon = this.getMergedLexicon()
    const negWindow = this.config.negationWindow

    let totalScore = 0
    let wordCount = 0
    let negationActive = false
    let negationCountdown = 0

    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      // Check for negation
      if (NEGATION_WORDS.has(word)) {
        negationActive = true
        negationCountdown = negWindow
        continue
      }

      // Decay negation window
      if (negationActive) {
        negationCountdown--
        if (negationCountdown <= 0) {
          negationActive = false
        }
      }

      // Look up word in lexicon
      if (word in lexicon) {
        let score = lexicon[word]

        // Apply intensifier / diminisher from preceding word
        if (i > 0) {
          const prev = words[i - 1]
          if (prev in INTENSIFIERS) {
            score *= INTENSIFIERS[prev]
          } else if (prev in DIMINISHERS) {
            score *= DIMINISHERS[prev]
          }
          // Two-word lookback for "a_bit", "a_little" etc.
          if (i > 1) {
            const compound = `${words[i - 2]}_${prev}`
            if (compound in DIMINISHERS) {
              score *= DIMINISHERS[compound]
            }
          }
        }

        // Apply negation
        if (negationActive) {
          score = -score * 0.75
        }

        totalScore += clamp(score, -1, 1)
        wordCount++
      }
    }

    let rawScore = wordCount > 0 ? totalScore / wordCount : 0

    // Sarcasm adjustment
    if (this.config.enableSarcasmDetection) {
      const sarcasmScore = this.detectSarcasmScore(sentence)
      if (sarcasmScore > 0.5 && rawScore > 0) {
        // Likely sarcasm: flip positive to negative
        rawScore = -rawScore * sarcasmScore
      }
    }

    // Punctuation-based intensity boost
    const exclamations = (sentence.match(/!/g) || []).length
    const allCaps = (sentence.match(/\b[A-Z]{2,}\b/g) || []).length
    const intensityBoost = 1.0 + Math.min(exclamations * 0.1, 0.3) + Math.min(allCaps * 0.05, 0.2)

    rawScore = clamp(rawScore * intensityBoost, -1, 1)

    const magnitude = round2(Math.abs(rawScore))
    const confidence = round2(
      clamp(wordCount > 0 ? Math.min(wordCount / 5, 1) * 0.6 + magnitude * 0.4 : 0.1, 0.1, 0.99),
    )

    return {
      score: round2(rawScore),
      magnitude,
      label: scoreToLabel(rawScore),
      confidence,
    }
  }

  /** Detect potential sarcasm in a sentence. Returns 0-1 sarcasm likelihood. */
  private detectSarcasmScore(sentence: string): number {
    let maxWeight = 0
    for (const { pattern, weight } of SARCASM_PATTERNS) {
      if (pattern.test(sentence)) {
        maxWeight = Math.max(maxWeight, weight)
      }
    }

    // Contrast detection: positive word followed by negative context
    const words = tokenize(sentence)
    const lexicon = this.getMergedLexicon()
    let hasPositive = false
    let hasNegative = false
    for (const w of words) {
      if (w in lexicon) {
        if (lexicon[w] > 0.3) hasPositive = true
        if (lexicon[w] < -0.3) hasNegative = true
      }
    }
    if (hasPositive && hasNegative) {
      maxWeight = Math.max(maxWeight, 0.3)
    }

    // Excessive punctuation hint
    if (/!{3,}/.test(sentence) || /\.{3,}/.test(sentence)) {
      maxWeight = Math.max(maxWeight, 0.2)
    }

    return clamp(maxWeight, 0, 1)
  }

  /** Compute an overall sentiment from an array of sentence sentiments. */
  private computeOverallFromSentences(sentenceSentiments: SentenceSentiment[]): SentimentScore {
    return this.computeOverallFromScores(sentenceSentiments.map(s => s.sentiment))
  }

  /** Compute a weighted average from an array of sentiment scores. */
  private computeOverallFromScores(scores: SentimentScore[]): SentimentScore {
    if (scores.length === 0) {
      return { score: 0, magnitude: 0, label: 'neutral', confidence: 0.1 }
    }

    let weightedSum = 0
    let totalWeight = 0
    let maxMagnitude = 0

    for (const s of scores) {
      const weight = s.confidence
      weightedSum += s.score * weight
      totalWeight += weight
      maxMagnitude = Math.max(maxMagnitude, s.magnitude)
    }

    const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 0
    const clamped = clamp(avgScore, -1, 1)
    const avgConfidence = scores.reduce((s, v) => s + v.confidence, 0) / scores.length

    return {
      score: round2(clamped),
      magnitude: round2(Math.abs(clamped)),
      label: scoreToLabel(clamped),
      confidence: round2(clamp(avgConfidence, 0.1, 0.99)),
    }
  }

  /** Check if a word is likely a content noun relevant for aspect extraction. */
  private isContentNoun(word: string, words: string[], index: number): boolean {
    if (STOP_WORDS.has(word)) return false
    if (word.length < 3) return false

    const lexicon = this.getMergedLexicon()

    // If an adjective-like word is nearby, the noun is more likely an aspect
    if (isNounLike(word)) {
      const windowStart = Math.max(0, index - 2)
      const windowEnd = Math.min(words.length, index + 3)
      for (let j = windowStart; j < windowEnd; j++) {
        if (j === index) continue
        if (isAdjectiveLike(words[j], lexicon)) return true
      }
    }

    return false
  }

  /** Build a summary from analysis components. */
  private buildSummary(
    overall: SentimentScore,
    sentences: SentenceSentiment[],
    aspects: AspectSentiment[],
    emotions: EmotionScore[],
  ): SentimentSummary {
    const dominantEmotion = emotions.length > 0 ? emotions[0].emotion : null

    let mostPositiveAspect: string | null = null
    let mostNegativeAspect: string | null = null
    let highestScore = -Infinity
    let lowestScore = Infinity

    for (const a of aspects) {
      if (a.sentiment.score > highestScore) {
        highestScore = a.sentiment.score
        mostPositiveAspect = a.aspect
      }
      if (a.sentiment.score < lowestScore) {
        lowestScore = a.sentiment.score
        mostNegativeAspect = a.aspect
      }
    }

    return {
      dominantSentiment: overall.label,
      dominantEmotion,
      aspectCount: aspects.length,
      sentenceCount: sentences.length,
      mostPositiveAspect,
      mostNegativeAspect,
    }
  }
}
