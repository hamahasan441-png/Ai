/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ExplanationEngine — Multi-level explanation & teaching engine              ║
 * ║                                                                            ║
 * ║  Generates explanations at multiple abstraction levels, adapts to          ║
 * ║  audience expertise, creates step-by-step breakdowns, generates            ║
 * ║  analogies, and tracks understanding progression.                          ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Multi-level explanations (ELI5 → expert)                             ║
 * ║    • Step-by-step breakdowns with dependency ordering                      ║
 * ║    • Analogy generation from familiar domains                              ║
 * ║    • Audience adaptation (beginner / intermediate / expert)                ║
 * ║    • Understanding progression tracking                                    ║
 * ║    • Prerequisite identification and gap detection                         ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Expertise level of the target audience. */
export type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

/** Explanation abstraction level. */
export type AbstractionLevel = 'eli5' | 'simplified' | 'standard' | 'detailed' | 'technical'

/** A single explanation at one abstraction level. */
export interface LevelExplanation {
  readonly level: AbstractionLevel
  readonly text: string
  readonly wordCount: number
  readonly readingTime: number
  readonly technicalTerms: string[]
  readonly analogies: string[]
}

/** Multi-level explanation result. */
export interface MultiLevelExplanation {
  readonly topic: string
  readonly domain: string
  readonly levels: LevelExplanation[]
  readonly recommendedLevel: AbstractionLevel
  readonly prerequisites: string[]
  readonly relatedTopics: string[]
}

/** A single step in a step-by-step breakdown. */
export interface ExplanationStep {
  readonly stepNumber: number
  readonly title: string
  readonly content: string
  readonly prerequisites: number[]
  readonly difficulty: number
  readonly checkQuestion: string
}

/** Step-by-step breakdown result. */
export interface StepByStepBreakdown {
  readonly topic: string
  readonly totalSteps: number
  readonly steps: ExplanationStep[]
  readonly estimatedLearningTime: number
  readonly difficulty: number
}

/** An analogy mapping a concept to a familiar domain. */
export interface Analogy {
  readonly concept: string
  readonly familiarDomain: string
  readonly mapping: string
  readonly strengths: string[]
  readonly limitations: string[]
  readonly effectiveness: number
}

/** Audience profile for adaptation. */
export interface AudienceProfile {
  readonly expertise: ExpertiseLevel
  readonly familiarDomains: string[]
  readonly preferredStyle: 'visual' | 'textual' | 'step_by_step' | 'analogy_based'
  readonly knownConcepts: string[]
}

/** Understanding progression for a user. */
export interface UnderstandingProgress {
  readonly userId: string
  readonly topic: string
  readonly currentLevel: AbstractionLevel
  readonly conceptsMastered: string[]
  readonly conceptsInProgress: string[]
  readonly questionsAsked: number
  readonly progressScore: number
}

/** A prerequisite concept identified for a topic. */
export interface Prerequisite {
  readonly concept: string
  readonly importance: 'required' | 'helpful' | 'nice_to_have'
  readonly domain: string
}

/** Configuration for the explanation engine. */
export interface ExplanationEngineConfig {
  /** Maximum steps in a breakdown. Default: 20 */
  readonly maxSteps: number
  /** Maximum analogies to generate per concept. Default: 5 */
  readonly maxAnalogies: number
  /** Enable audience adaptation. Default: true */
  readonly enableAudienceAdaptation: boolean
  /** Maximum progress records per user. Default: 100 */
  readonly maxProgressRecords: number
}

/** Runtime statistics. */
export interface ExplanationEngineStats {
  readonly totalExplanationsGenerated: number
  readonly totalBreakdownsCreated: number
  readonly totalAnalogiesGenerated: number
  readonly avgExplanationLevels: number
  readonly mostExplainedDomains: string[]
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_EXPLANATION_ENGINE_CONFIG: ExplanationEngineConfig = {
  maxSteps: 20,
  maxAnalogies: 5,
  enableAudienceAdaptation: true,
  maxProgressRecords: 100,
}

/** Abstraction level ordering from simplest to most technical. */
const LEVEL_ORDER: AbstractionLevel[] = ['eli5', 'simplified', 'standard', 'detailed', 'technical']

/** Templates for different abstraction levels. */
const LEVEL_TEMPLATES: Record<AbstractionLevel, { prefix: string; style: string; maxSentenceLength: number }> = {
  eli5: {
    prefix: 'Imagine',
    style: 'Use simple words, short sentences, everyday analogies. No jargon.',
    maxSentenceLength: 15,
  },
  simplified: {
    prefix: 'In simple terms',
    style: 'Accessible language, minimal jargon, clear examples.',
    maxSentenceLength: 20,
  },
  standard: {
    prefix: '',
    style: 'Balanced detail, some technical terms defined inline.',
    maxSentenceLength: 25,
  },
  detailed: {
    prefix: 'In detail',
    style: 'Thorough explanation with technical details and nuances.',
    maxSentenceLength: 35,
  },
  technical: {
    prefix: 'Technically speaking',
    style: 'Full technical depth, assumes domain knowledge.',
    maxSentenceLength: 50,
  },
}

/** Common analogy source domains. */
const ANALOGY_DOMAINS: Record<string, string[]> = {
  programming: [
    'cooking recipe', 'building a house', 'assembly line', 'library organization',
    'traffic control', 'postal service', 'orchestra conductor',
  ],
  security: [
    'home security', 'bank vault', 'castle defense', 'immune system',
    'airport security', 'locks and keys',
  ],
  networking: [
    'postal service', 'highway system', 'telephone network', 'water pipes',
    'restaurant ordering', 'mail sorting',
  ],
  databases: [
    'filing cabinet', 'library catalog', 'phone book', 'spreadsheet',
    'recipe book index', 'warehouse inventory',
  ],
  algorithms: [
    'sorting cards', 'finding a word in dictionary', 'maze solving',
    'treasure hunt', 'assembly instructions', 'GPS navigation',
  ],
  general: [
    'everyday life', 'cooking', 'sports', 'travel', 'building', 'nature',
  ],
}

/** Domain detection keywords. */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  programming: ['code', 'function', 'variable', 'class', 'algorithm', 'api', 'software', 'program'],
  security: ['vulnerability', 'attack', 'defense', 'encryption', 'authentication', 'firewall'],
  networking: ['network', 'protocol', 'server', 'client', 'tcp', 'http', 'dns', 'ip'],
  databases: ['database', 'sql', 'query', 'table', 'index', 'schema', 'nosql'],
  algorithms: ['sort', 'search', 'graph', 'tree', 'hash', 'complexity', 'optimize'],
  math: ['equation', 'formula', 'proof', 'theorem', 'calculate', 'number'],
  science: ['theory', 'experiment', 'hypothesis', 'observation', 'research'],
  general: ['explain', 'describe', 'what', 'how', 'why'],
}

/** Prerequisite mappings for common concepts. */
const PREREQUISITE_MAP: Record<string, string[]> = {
  'recursion': ['functions', 'call stack', 'base case'],
  'api': ['http', 'client-server', 'request-response'],
  'database': ['data structures', 'queries', 'tables'],
  'encryption': ['binary', 'keys', 'algorithms'],
  'machine learning': ['statistics', 'linear algebra', 'optimization'],
  'docker': ['containers', 'operating systems', 'networking'],
  'kubernetes': ['docker', 'containers', 'networking', 'yaml'],
  'react': ['javascript', 'html', 'components', 'state'],
  'typescript': ['javascript', 'types', 'interfaces'],
  'git': ['version control', 'files', 'branches'],
  'rest api': ['http', 'urls', 'json', 'client-server'],
  'sql': ['tables', 'data types', 'relational model'],
  'css': ['html', 'selectors', 'box model'],
  'async': ['callbacks', 'event loop', 'promises'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
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

function estimateReadingTime(wordCount: number): number {
  // Average reading speed: ~200 words/minute
  return Math.ceil(wordCount / 200)
}

function extractTechnicalTerms(text: string): string[] {
  const techPatterns = [
    /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g, // CamelCase
    /\b[a-z]+_[a-z_]+\b/g,               // snake_case
    /\b(?:API|HTTP|SQL|DNS|TCP|IP|URL|JSON|XML|HTML|CSS|JWT|OAuth|REST|CRUD|ACID)\b/gi,
  ]
  const terms = new Set<string>()
  for (const pattern of techPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      terms.add(match[0])
    }
  }
  return [...terms]
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class ExplanationEngine {
  private readonly config: ExplanationEngineConfig
  private readonly progressMap: Map<string, UnderstandingProgress[]> = new Map()
  private stats = {
    totalExplanations: 0,
    totalBreakdowns: 0,
    totalAnalogies: 0,
    totalLevels: 0,
    domainCounts: {} as Record<string, number>,
  }

  constructor(config: Partial<ExplanationEngineConfig> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_ENGINE_CONFIG, ...config }
  }

  // ── Multi-level explanation ────────────────────────────────────────────

  /** Generate explanations at multiple abstraction levels. */
  explain(topic: string, audience?: Partial<AudienceProfile>): MultiLevelExplanation {
    this.stats.totalExplanations++
    const domain = detectDomain(topic)
    this.stats.domainCounts[domain] = (this.stats.domainCounts[domain] || 0) + 1

    const levels = LEVEL_ORDER.map(level => this.generateLevelExplanation(topic, level, domain))
    const recommendedLevel = this.recommendLevel(audience)
    const prerequisites = this.identifyPrerequisites(topic)
    const relatedTopics = this.findRelatedTopics(topic, domain)

    this.stats.totalLevels += levels.length

    return {
      topic,
      domain,
      levels,
      recommendedLevel,
      prerequisites: prerequisites.map(p => p.concept),
      relatedTopics,
    }
  }

  private generateLevelExplanation(
    topic: string,
    level: AbstractionLevel,
    domain: string,
  ): LevelExplanation {
    const template = LEVEL_TEMPLATES[level]
    const analogies = level === 'eli5' || level === 'simplified'
      ? this.generateAnalogies(topic, domain).map(a => a.mapping)
      : []

    // Build explanation text based on level
    const parts: string[] = []

    if (template.prefix) {
      parts.push(`${template.prefix},`)
    }

    // Core explanation adapted to level
    const coreExplanation = this.buildCoreExplanation(topic, level, domain)
    parts.push(coreExplanation)

    // Add analogies for simpler levels
    if (analogies.length > 0) {
      parts.push(`Think of it like ${analogies[0]}.`)
    }

    // Add technical details for advanced levels
    if (level === 'detailed' || level === 'technical') {
      parts.push(this.addTechnicalDetails(topic, domain))
    }

    const text = parts.join(' ').trim()
    const wordCount = text.split(/\s+/).length
    const technicalTerms = extractTechnicalTerms(text)

    return {
      level,
      text,
      wordCount,
      readingTime: estimateReadingTime(wordCount),
      technicalTerms,
      analogies,
    }
  }

  private buildCoreExplanation(topic: string, level: AbstractionLevel, domain: string): string {
    const topicLower = topic.toLowerCase()

    // Simple templates based on level
    switch (level) {
      case 'eli5':
        return `${topic} is like a special tool that helps with ${domain} tasks. ` +
          `It makes things easier by handling the hard parts for you.`
      case 'simplified':
        return `${topic} is a concept in ${domain} that provides a way to ` +
          `organize and process information more effectively. ` +
          `It works by breaking down complex tasks into simpler ones.`
      case 'standard':
        return `${topic} is a ${domain} concept that enables structured ` +
          `processing of data or operations. It provides a framework for ` +
          `managing complexity through well-defined interfaces and patterns.`
      case 'detailed':
        return `${topic} in the context of ${domain} refers to a systematic approach ` +
          `for handling complex operations. It involves multiple components working together ` +
          `through defined protocols and data flows. The key aspects include initialization, ` +
          `processing, error handling, and cleanup phases.`
      case 'technical':
        return `${topic} is a ${domain} construct characterized by its specific ` +
          `computational properties and interface contracts. Implementation typically involves ` +
          `state management, event-driven processing, and resource lifecycle control. ` +
          `Performance characteristics depend on the underlying data structures and algorithms used.`
    }
  }

  private addTechnicalDetails(topic: string, domain: string): string {
    return `Key considerations for ${topic} in ${domain} include ` +
      `performance implications, error handling strategies, ` +
      `scalability patterns, and integration with existing systems.`
  }

  private recommendLevel(audience?: Partial<AudienceProfile>): AbstractionLevel {
    if (!audience?.expertise) return 'standard'
    const mapping: Record<ExpertiseLevel, AbstractionLevel> = {
      beginner: 'simplified',
      intermediate: 'standard',
      advanced: 'detailed',
      expert: 'technical',
    }
    return mapping[audience.expertise]
  }

  // ── Step-by-step breakdown ─────────────────────────────────────────────

  /** Create a step-by-step breakdown of a topic. */
  createBreakdown(topic: string, targetLevel?: ExpertiseLevel): StepByStepBreakdown {
    this.stats.totalBreakdowns++
    const domain = detectDomain(topic)
    const prerequisites = this.identifyPrerequisites(topic)

    const steps: ExplanationStep[] = []
    let stepNum = 1

    // Step 1: Prerequisites
    if (prerequisites.length > 0) {
      steps.push({
        stepNumber: stepNum++,
        title: 'Prerequisites',
        content: `Before diving in, make sure you understand: ${prerequisites.map(p => p.concept).join(', ')}.`,
        prerequisites: [],
        difficulty: 0.2,
        checkQuestion: `Can you explain what ${prerequisites[0]?.concept || topic} means?`,
      })
    }

    // Step 2: Core concept
    steps.push({
      stepNumber: stepNum++,
      title: `What is ${topic}?`,
      content: `${topic} is a concept in ${domain} that provides a foundation for more advanced operations. ` +
        `Understanding this core idea is essential before moving to practical applications.`,
      prerequisites: prerequisites.length > 0 ? [1] : [],
      difficulty: 0.3,
      checkQuestion: `In your own words, what is ${topic}?`,
    })

    // Step 3: How it works
    steps.push({
      stepNumber: stepNum++,
      title: `How ${topic} works`,
      content: `The mechanism behind ${topic} involves processing inputs through defined rules or algorithms. ` +
        `Each input is transformed step by step until the desired output is produced.`,
      prerequisites: [stepNum - 2],
      difficulty: 0.5,
      checkQuestion: `Can you describe the main steps in how ${topic} processes data?`,
    })

    // Step 4: Common patterns
    steps.push({
      stepNumber: stepNum++,
      title: 'Common patterns and use cases',
      content: `${topic} is commonly used in scenarios involving ${domain}-related tasks. ` +
        `Typical patterns include initialization, processing loops, and cleanup operations.`,
      prerequisites: [stepNum - 2],
      difficulty: 0.6,
      checkQuestion: `Name two common use cases for ${topic}.`,
    })

    // Step 5: Best practices
    steps.push({
      stepNumber: stepNum++,
      title: 'Best practices',
      content: `When working with ${topic}, follow these practices: handle errors gracefully, ` +
        `test edge cases, document your approach, and consider performance implications.`,
      prerequisites: [stepNum - 2],
      difficulty: 0.7,
      checkQuestion: `What are the key best practices when using ${topic}?`,
    })

    // Step 6: Advanced topics (for advanced/expert)
    if (targetLevel === 'advanced' || targetLevel === 'expert') {
      steps.push({
        stepNumber: stepNum++,
        title: 'Advanced considerations',
        content: `Advanced usage of ${topic} includes optimization strategies, ` +
          `scalability patterns, integration with other systems, and custom extensions.`,
        prerequisites: [stepNum - 2],
        difficulty: 0.85,
        checkQuestion: `How would you optimize ${topic} for a large-scale system?`,
      })
    }

    const avgDifficulty = steps.reduce((s, step) => s + step.difficulty, 0) / steps.length
    const estimatedTime = steps.length * 3 // ~3 minutes per step

    return {
      topic,
      totalSteps: steps.length,
      steps,
      estimatedLearningTime: estimatedTime,
      difficulty: avgDifficulty,
    }
  }

  // ── Analogy generation ─────────────────────────────────────────────────

  /** Generate analogies for a concept. */
  generateAnalogies(concept: string, domain?: string): Analogy[] {
    const detectedDomain = domain || detectDomain(concept)
    const sourceDomains = ANALOGY_DOMAINS[detectedDomain] || ANALOGY_DOMAINS['general']

    const analogies: Analogy[] = []

    for (const source of sourceDomains.slice(0, this.config.maxAnalogies)) {
      const analogy = this.createAnalogy(concept, source, detectedDomain)
      analogies.push(analogy)
      this.stats.totalAnalogies++
    }

    return analogies.sort((a, b) => b.effectiveness - a.effectiveness)
  }

  private createAnalogy(concept: string, familiarDomain: string, conceptDomain: string): Analogy {
    const mapping = `${concept} is like ${familiarDomain} — ` +
      `just as ${familiarDomain} organizes and manages its elements, ` +
      `${concept} does the same for ${conceptDomain} tasks.`

    const strengths = [
      `Familiar to most people from everyday experience`,
      `Captures the organizational aspect of ${concept}`,
    ]

    const limitations = [
      `Simplifies the technical complexity`,
      `May not capture all edge cases of ${concept}`,
    ]

    // Effectiveness based on domain match
    const effectiveness = familiarDomain.includes('everyday') ? 0.8 :
      familiarDomain.includes('cook') ? 0.7 : 0.6

    return {
      concept,
      familiarDomain,
      mapping,
      strengths,
      limitations,
      effectiveness,
    }
  }

  // ── Prerequisites ──────────────────────────────────────────────────────

  /** Identify prerequisites for understanding a topic. */
  identifyPrerequisites(topic: string): Prerequisite[] {
    const lower = topic.toLowerCase()
    const prerequisites: Prerequisite[] = []

    for (const [key, prereqs] of Object.entries(PREREQUISITE_MAP)) {
      if (lower.includes(key)) {
        for (const prereq of prereqs) {
          prerequisites.push({
            concept: prereq,
            importance: 'required',
            domain: detectDomain(prereq),
          })
        }
      }
    }

    return prerequisites
  }

  // ── Related topics ─────────────────────────────────────────────────────

  private findRelatedTopics(topic: string, domain: string): string[] {
    const related: string[] = []
    const lower = topic.toLowerCase()

    // Check prerequisite map for reverse connections
    for (const [key, prereqs] of Object.entries(PREREQUISITE_MAP)) {
      if (prereqs.some(p => lower.includes(p.toLowerCase()))) {
        related.push(key)
      }
      if (lower.includes(key)) {
        related.push(...prereqs)
      }
    }

    return [...new Set(related)].slice(0, 8)
  }

  // ── Understanding progression ──────────────────────────────────────────

  /** Track a user's understanding progress. */
  trackProgress(userId: string, topic: string, masteredConcept?: string): UnderstandingProgress {
    const key = `${userId}_${topic}`
    let records = this.progressMap.get(userId) || []

    let existing = records.find(r => r.topic === topic)
    if (!existing) {
      existing = {
        userId,
        topic,
        currentLevel: 'eli5',
        conceptsMastered: [],
        conceptsInProgress: [topic],
        questionsAsked: 0,
        progressScore: 0,
      }
      records.push(existing)
    }

    // Update mastered concepts
    const conceptsMastered = [...existing.conceptsMastered]
    if (masteredConcept && !conceptsMastered.includes(masteredConcept)) {
      conceptsMastered.push(masteredConcept)
    }

    // Update progress score
    const prerequisites = this.identifyPrerequisites(topic)
    const prereqCount = prerequisites.length || 1
    const masteredPrereqs = prerequisites.filter(p => conceptsMastered.includes(p.concept)).length
    const progressScore = Math.min(1, (masteredPrereqs + conceptsMastered.length) / (prereqCount + 3))

    // Update level based on progress
    const levelIndex = Math.min(
      Math.floor(progressScore * LEVEL_ORDER.length),
      LEVEL_ORDER.length - 1,
    )

    const updated: UnderstandingProgress = {
      ...existing,
      conceptsMastered,
      questionsAsked: existing.questionsAsked + 1,
      progressScore,
      currentLevel: LEVEL_ORDER[levelIndex],
    }

    records = records.map(r => r.topic === topic ? updated : r)

    // Enforce max records
    if (records.length > this.config.maxProgressRecords) {
      records = records.slice(-this.config.maxProgressRecords)
    }

    this.progressMap.set(userId, records)
    return updated
  }

  /** Get a user's progress across all topics. */
  getUserProgress(userId: string): readonly UnderstandingProgress[] {
    return [...(this.progressMap.get(userId) || [])]
  }

  // ── Statistics ─────────────────────────────────────────────────────────

  /** Get runtime statistics. */
  getStats(): Readonly<ExplanationEngineStats> {
    const mostExplainedDomains = Object.entries(this.stats.domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain]) => domain)

    return {
      totalExplanationsGenerated: this.stats.totalExplanations,
      totalBreakdownsCreated: this.stats.totalBreakdowns,
      totalAnalogiesGenerated: this.stats.totalAnalogies,
      avgExplanationLevels: this.stats.totalExplanations > 0
        ? this.stats.totalLevels / this.stats.totalExplanations
        : 0,
      mostExplainedDomains,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize engine state for persistence. */
  serialize(): string {
    const progressEntries: Array<[string, UnderstandingProgress[]]> = []
    for (const [key, value] of this.progressMap.entries()) {
      progressEntries.push([key, value])
    }
    return JSON.stringify({
      progress: progressEntries,
      stats: this.stats,
    })
  }

  /** Restore engine state from serialized data. */
  static deserialize(json: string, config?: Partial<ExplanationEngineConfig>): ExplanationEngine {
    const engine = new ExplanationEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.progress)) {
        for (const [key, value] of data.progress) {
          engine.progressMap.set(key, value)
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
