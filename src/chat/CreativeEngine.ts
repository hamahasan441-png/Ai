/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Creative Engine — Creative Thinking & Lateral Reasoning Module              ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Brainstorming — Generate diverse ideas for any problem                  ║
 * ║    ✦ Lateral Thinking — Find unexpected connections & perspectives           ║
 * ║    ✦ SCAMPER Technique — Systematic creative transformation                  ║
 * ║    ✦ Metaphor Generation — Map concepts across domains                       ║
 * ║    ✦ Concept Blending — Combine disparate ideas into novel solutions         ║
 * ║    ✦ Idea Evolution — Iteratively refine and improve ideas                   ║
 * ║    ✦ Bisociation Detection — Koestler's theory of creative insight           ║
 * ║    ✦ Random Stimulus — Inject randomness to escape fixation                  ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface CreativeEngineConfig {
  divergenceLevel: number // 0-1, how wild ideas can get (default 0.7)
  maxIdeas: number // max ideas per brainstorm (default 10)
  noveltyThreshold: number // min novelty to keep idea (default 0.3)
  enableEvolution: boolean // allow iterative refinement (default true)
  maxEvolutionIterations: number // max iterations for evolveIdea (default 5)
  perspectiveCount: number // perspectives for reframing (default 4)
}

export interface CreativeEngineStats {
  totalBrainstorms: number
  totalIdeasGenerated: number
  totalLateralThinks: number
  totalMetaphorsGenerated: number
  totalCombinations: number
  totalReframes: number
  totalEvolutions: number
  avgNovelty: number
  avgFeasibility: number
}

export interface CreativeIdea {
  id: string
  description: string
  novelty: number // 0-1
  feasibility: number // 0-1
  category: string
  inspirations: string[]
}

export interface BrainstormResult {
  ideas: CreativeIdea[]
  bestIdea: CreativeIdea | null
  diversityScore: number // 0-1
  themes: string[]
}

export interface LateralThinkingResult {
  connection: string
  explanation: string
  novelty: number // 0-1
  technique: string
}

export interface Metaphor {
  source: string
  target: string
  mapping: Record<string, string>
  explanation: string
}

export interface CreativeCombination {
  conceptA: string
  conceptB: string
  combination: string
  explanation: string
  novelty: number // 0-1
}

export interface ReframingResult {
  perspective: string
  reframed: string
  insights: string[]
  novelty: number // 0-1
}

export interface InspirationSource {
  type: 'word' | 'analogy' | 'constraint' | 'domain' | 'nature' | 'inversion'
  content: string
  relevance: number // 0-1
}

export interface CreativeConstraint {
  name: string
  description: string
  effect: string // how it boosts creativity
}

export interface IdeaEvolution {
  original: CreativeIdea
  iterations: CreativeIdea[]
  finalIdea: CreativeIdea
  improvementScore: number // 0-1
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: CreativeEngineConfig = {
  divergenceLevel: 0.7,
  maxIdeas: 10,
  noveltyThreshold: 0.3,
  enableEvolution: true,
  maxEvolutionIterations: 5,
  perspectiveCount: 4,
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
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
  'can',
  'shall',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'about',
  'that',
  'this',
  'it',
  'its',
  'and',
  'or',
  'not',
  'but',
  'if',
  'then',
  'so',
  'up',
  'out',
  'no',
  'just',
  'also',
  'very',
  'what',
  'how',
  'like',
  'such',
  'when',
  'which',
  'there',
  'their',
  'than',
  'more',
  'some',
  'any',
  'each',
  'every',
  'all',
  'both',
  'few',
  'most',
  'need',
  'want',
  'use',
  'make',
  'get',
  'go',
  'take',
  'come',
])

// ── Random Word Association Database ─────────────────────────────────────────

/** Stimulus words grouped by category for random association. */
const STIMULUS_WORDS: Record<string, string[]> = {
  nature: [
    'river',
    'mountain',
    'forest',
    'ocean',
    'storm',
    'seed',
    'root',
    'branch',
    'coral',
    'volcano',
    'glacier',
    'tide',
    'canyon',
    'meadow',
    'lightning',
    'fog',
    'ecosystem',
    'metamorphosis',
    'symbiosis',
    'erosion',
  ],
  technology: [
    'satellite',
    'antenna',
    'circuit',
    'laser',
    'turbine',
    'engine',
    'lens',
    'sensor',
    'beacon',
    'radar',
    'telescope',
    'gyroscope',
    'hologram',
    'transistor',
    'oscillator',
    'capacitor',
    'fiber',
    'prism',
  ],
  art: [
    'mosaic',
    'sculpture',
    'canvas',
    'palette',
    'harmony',
    'rhythm',
    'contrast',
    'perspective',
    'composition',
    'texture',
    'silhouette',
    'collage',
    'improvisation',
    'resonance',
    'counterpoint',
    'fresco',
  ],
  society: [
    'marketplace',
    'festival',
    'library',
    'workshop',
    'garden',
    'bridge',
    'lighthouse',
    'compass',
    'crossroads',
    'village',
    'cathedral',
    'amphitheater',
    'bazaar',
    'academy',
    'sanctuary',
    'labyrinth',
  ],
  biology: [
    'cell',
    'DNA',
    'enzyme',
    'neuron',
    'mycelium',
    'mitosis',
    'antibody',
    'photosynthesis',
    'evolution',
    'migration',
    'camouflage',
    'pollination',
    'fermentation',
    'hibernation',
    'mutation',
    'tropism',
  ],
  physics: [
    'gravity',
    'momentum',
    'entropy',
    'resonance',
    'friction',
    'wave',
    'particle',
    'field',
    'quantum',
    'spectrum',
    'inertia',
    'diffusion',
    'refraction',
    'catalyst',
    'equilibrium',
    'polarity',
  ],
}

/** All stimulus words flattened for random access. */
const ALL_STIMULUS_WORDS: string[] = Object.values(STIMULUS_WORDS).flat()

// ── Pre-Built Metaphor Database for Programming Concepts ────────────────────

interface MetaphorEntry {
  concept: string
  domain: string
  source: string
  mapping: Record<string, string>
  explanation: string
}

function buildMetaphorDatabase(): MetaphorEntry[] {
  const entries: MetaphorEntry[] = []

  const add = (
    concept: string,
    domain: string,
    source: string,
    mapping: Record<string, string>,
    explanation: string,
  ) => {
    entries.push({ concept, domain, source, mapping, explanation })
  }

  // Architecture
  add(
    'microservices',
    'architecture',
    'city districts',
    { service: 'district', API: 'roads', database: 'local-resources', gateway: 'city-center' },
    'Microservices are like city districts: each is self-contained but connected by roads (APIs).',
  )
  add(
    'monolith',
    'architecture',
    'skyscraper',
    { module: 'floor', deployment: 'building', dependency: 'elevator', scaling: 'adding-floors' },
    'A monolith is like a skyscraper: everything in one building, interconnected by elevators.',
  )
  add(
    'event-driven',
    'architecture',
    'nervous system',
    { event: 'nerve-signal', handler: 'receptor', bus: 'spinal-cord', reaction: 'reflex' },
    'Event-driven architecture is like the nervous system: signals trigger reactions across the body.',
  )
  add(
    'pipeline',
    'architecture',
    'assembly line',
    { stage: 'station', data: 'product', transform: 'process', output: 'finished-good' },
    'A pipeline is like an assembly line: data passes through stages of transformation.',
  )

  // Data Structures
  add(
    'tree',
    'data-structures',
    'family tree',
    { root: 'ancestor', node: 'family-member', leaf: 'youngest-child', branch: 'lineage' },
    'A tree data structure is like a family tree: nodes branch from a root, with leaves at the ends.',
  )
  add(
    'hash map',
    'data-structures',
    'filing cabinet',
    { key: 'label', value: 'document', hash: 'filing-rule', bucket: 'drawer' },
    'A hash map is like a filing cabinet: a rule (hash) determines which drawer holds each document.',
  )
  add(
    'queue',
    'data-structures',
    'checkout line',
    { enqueue: 'join-line', dequeue: 'reach-cashier', FIFO: 'first-come-first-served' },
    'A queue is like a checkout line: first in, first out.',
  )
  add(
    'stack',
    'data-structures',
    'stack of plates',
    { push: 'add-plate', pop: 'take-top-plate', LIFO: 'last-placed-first-taken' },
    'A stack is like plates: you always add and remove from the top.',
  )
  add(
    'graph',
    'data-structures',
    'road network',
    { node: 'city', edge: 'road', weight: 'distance', path: 'route' },
    'A graph is like a road network: cities connected by roads with distances.',
  )

  // Patterns & Processes
  add(
    'recursion',
    'algorithms',
    'Russian nesting dolls',
    {
      'recursive-call': 'opening-a-doll',
      'base-case': 'smallest-doll',
      'stack-frame': 'doll-layer',
    },
    'Recursion is like Russian nesting dolls: each doll contains a smaller version until the smallest.',
  )
  add(
    'caching',
    'performance',
    'notebook of answers',
    {
      cache: 'notebook',
      lookup: 'checking-notes',
      miss: 'need-to-research',
      eviction: 'erasing-old-notes',
    },
    'Caching is like keeping a notebook of answers: check notes first, research only when needed.',
  )
  add(
    'refactoring',
    'process',
    'home renovation',
    { code: 'house', smell: 'structural-issue', test: 'inspection', improvement: 'renovation' },
    'Refactoring is like home renovation: improving structure without changing what the house does.',
  )
  add(
    'testing',
    'process',
    'safety inspection',
    {
      'unit-test': 'component-check',
      'integration-test': 'system-check',
      bug: 'defect',
      coverage: 'thoroughness',
    },
    'Testing is like safety inspection: each component and the whole system are checked for defects.',
  )
  add(
    'debugging',
    'process',
    'detective investigation',
    { bug: 'crime', stacktrace: 'evidence', breakpoint: 'stakeout', fix: 'arrest' },
    'Debugging is like a detective investigation: follow evidence to find and fix the culprit.',
  )
  add(
    'deployment',
    'devops',
    'rocket launch',
    { build: 'assembly', staging: 'countdown', production: 'orbit', rollback: 'abort-sequence' },
    'Deployment is like a rocket launch: careful preparation, staged countdown, and go/no-go checks.',
  )

  // Security
  add(
    'authentication',
    'security',
    'ID card check',
    {
      credentials: 'ID-card',
      login: 'showing-ID',
      session: 'visitor-badge',
      logout: 'returning-badge',
    },
    'Authentication is like an ID check: prove who you are, get a badge for the visit.',
  )
  add(
    'authorization',
    'security',
    'keycard access',
    {
      role: 'clearance-level',
      permission: 'door-access',
      deny: 'locked-door',
      grant: 'door-opens',
    },
    'Authorization is like keycard access: your clearance level determines which doors open.',
  )
  add(
    'encryption',
    'security',
    'locked safe',
    { plaintext: 'valuables', ciphertext: 'locked-safe', key: 'combination', decrypt: 'unlock' },
    'Encryption is like a locked safe: only someone with the combination can access the contents.',
  )

  return entries
}

// ── Perspective Catalog ──────────────────────────────────────────────────────

interface PerspectiveTemplate {
  name: string
  role: string
  concerns: string[]
  questions: string[]
}

const PERSPECTIVE_CATALOG: PerspectiveTemplate[] = [
  {
    name: 'user',
    role: 'End User',
    concerns: ['usability', 'speed', 'simplicity', 'reliability', 'accessibility'],
    questions: [
      'How does this affect the user experience?',
      'Can a non-technical person understand this?',
      "What happens when things go wrong from the user's perspective?",
    ],
  },
  {
    name: 'developer',
    role: 'Software Developer',
    concerns: ['maintainability', 'readability', 'extensibility', 'testability', 'elegance'],
    questions: [
      'Is this easy to maintain and extend?',
      'Will other developers understand this in 6 months?',
      'How does this affect the development workflow?',
    ],
  },
  {
    name: 'tester',
    role: 'QA Engineer',
    concerns: ['edge-cases', 'regression', 'coverage', 'reproducibility', 'automation'],
    questions: [
      'What could go wrong here?',
      'How would I test this exhaustively?',
      'What are the boundary conditions?',
    ],
  },
  {
    name: 'business',
    role: 'Business Stakeholder',
    concerns: ['cost', 'time-to-market', 'ROI', 'scalability', 'competitive-advantage'],
    questions: [
      'What is the business value of this approach?',
      'How does this affect time-to-market?',
      'What are the cost implications?',
    ],
  },
  {
    name: 'security',
    role: 'Security Analyst',
    concerns: ['vulnerabilities', 'attack-surface', 'data-privacy', 'compliance', 'audit-trail'],
    questions: [
      'What are the potential attack vectors?',
      'How is sensitive data protected?',
      'Does this comply with security standards?',
    ],
  },
  {
    name: 'performance',
    role: 'Performance Engineer',
    concerns: ['latency', 'throughput', 'memory', 'scalability', 'bottlenecks'],
    questions: [
      'What are the performance bottlenecks?',
      'How does this scale under load?',
      'What is the memory and CPU footprint?',
    ],
  },
  {
    name: 'beginner',
    role: 'Junior Developer',
    concerns: ['learning-curve', 'documentation', 'examples', 'conventions', 'mentorship'],
    questions: [
      'Is this approachable for someone new?',
      'Are there enough examples and documentation?',
      'What assumptions does this require?',
    ],
  },
  {
    name: 'architect',
    role: 'System Architect',
    concerns: ['modularity', 'coupling', 'cohesion', 'patterns', 'long-term-vision'],
    questions: [
      'How does this fit into the overall system design?',
      'What are the coupling and cohesion implications?',
      'Does this create technical debt?',
    ],
  },
]

// ── SCAMPER Templates ────────────────────────────────────────────────────────

interface ScamperPrompt {
  letter: string
  technique: string
  description: string
  prompts: string[]
}

const SCAMPER_PROMPTS: ScamperPrompt[] = [
  {
    letter: 'S',
    technique: 'Substitute',
    description: 'Replace a component, material, or person',
    prompts: [
      'What component can be replaced with something else?',
      'What if we used a different technology/approach?',
      'Can we substitute one process for another?',
      'What if a different person or team handled this?',
    ],
  },
  {
    letter: 'C',
    technique: 'Combine',
    description: 'Merge two or more elements together',
    prompts: [
      'What ideas or features can be combined?',
      'Can we merge this with another process?',
      'What if we bundled this with something else?',
      'Can two steps be done simultaneously?',
    ],
  },
  {
    letter: 'A',
    technique: 'Adapt',
    description: 'Adjust or tweak for a different context',
    prompts: [
      'How can this be adapted for a different context?',
      'What else is like this, and what can we learn?',
      'What ideas from other domains could we borrow?',
      'How would this work in a completely different industry?',
    ],
  },
  {
    letter: 'M',
    technique: 'Modify',
    description: 'Change size, shape, color, or other attributes',
    prompts: [
      'What if we made this bigger or smaller?',
      'Can we change the order or sequence?',
      'What if we exaggerated or minimized a feature?',
      'How would changing the frequency or intensity help?',
    ],
  },
  {
    letter: 'P',
    technique: 'Put to other use',
    description: 'Use it in a way it was not originally intended',
    prompts: [
      'Can this be used for a completely different purpose?',
      'Who else could benefit from this?',
      'What if we used this in a different context?',
      'Are there by-products we can leverage?',
    ],
  },
  {
    letter: 'E',
    technique: 'Eliminate',
    description: 'Remove elements, simplify, reduce to core',
    prompts: [
      'What can we remove without losing value?',
      'What would happen if we eliminated this step?',
      'Can we simplify this to its essential core?',
      'What is truly necessary vs nice-to-have?',
    ],
  },
  {
    letter: 'R',
    technique: 'Reverse',
    description: 'Turn it around, flip the order, do the opposite',
    prompts: [
      'What if we did the opposite?',
      'Can we reverse the process or sequence?',
      'What if the roles were swapped?',
      'What if we turned the problem inside out?',
    ],
  },
]

// ── Creative Constraints Database ────────────────────────────────────────────

const CREATIVE_CONSTRAINTS: CreativeConstraint[] = [
  {
    name: 'One-line solution',
    description: 'Solve it in a single line of code or a single sentence',
    effect: 'Forces extreme simplification and clarity of thought',
  },
  {
    name: 'No technology',
    description: 'How would you solve this without any technology?',
    effect: 'Strips away assumptions about tools and focuses on core logic',
  },
  {
    name: 'Opposite day',
    description: 'What if the goal was the exact opposite?',
    effect: 'Reveals hidden assumptions and finds value in inversion',
  },
  {
    name: 'Time limit',
    description: 'You have 5 minutes. What is the simplest possible solution?',
    effect: 'Eliminates over-engineering and finds the MVP',
  },
  {
    name: 'Infinite resources',
    description: 'What if money, time, and people were unlimited?',
    effect: 'Removes artificial constraints to find the ideal solution',
  },
  {
    name: 'Explain to a child',
    description: 'How would you explain the solution to a 5-year-old?',
    effect: 'Forces clear, simple thinking and reveals complexity',
  },
  {
    name: 'Already exists',
    description: 'What if this problem was already solved somewhere else?',
    effect: 'Encourages research and cross-domain transfer',
  },
  {
    name: 'Make it fun',
    description: 'How would you make this solution genuinely enjoyable?',
    effect: 'Injects user empathy and engagement thinking',
  },
  {
    name: 'Scale to millions',
    description: 'What if a million people needed this simultaneously?',
    effect: 'Reveals scalability concerns early',
  },
  {
    name: 'Zero dependencies',
    description: 'Solve it with no external libraries or tools',
    effect: 'Forces deep understanding of fundamentals',
  },
  {
    name: 'Three components',
    description: 'The entire solution can only have three components',
    effect: 'Forces modular thinking and prioritization',
  },
  {
    name: 'Teach it',
    description: 'Design the solution so it teaches the user how it works',
    effect: 'Emphasizes transparency and documentation',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

/** Simple seeded pseudo-random number generator (linear congruential). */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/** Generate a unique ID with a prefix. */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Compute Jaccard similarity between two token arrays. */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = new Set([...a, ...b]).size
  return union > 0 ? intersection / union : 0
}

/** Compute cosine-like similarity between two term frequency maps. */
function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (const [term, weightA] of a) {
    normA += weightA * weightA
    const weightB = b.get(term) ?? 0
    dotProduct += weightA * weightB
  }
  for (const [, weightB] of b) {
    normB += weightB * weightB
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom > 0 ? dotProduct / denom : 0
}

/** Build a term frequency map from tokens. */
function termFrequencyMap(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1)
  }
  // Normalize
  const total = tokens.length || 1
  for (const [term, count] of freq) {
    freq.set(term, count / total)
  }
  return freq
}

/** Pick a random element from an array using a PRNG. */
function pickRandom<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Shuffle an array in-place using Fisher-Yates with a PRNG. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class CreativeEngine {
  private config: CreativeEngineConfig
  private metaphorDB: MetaphorEntry[]
  private rng: () => number
  private generatedIdeas: CreativeIdea[] = []
  private totalBrainstorms: number = 0
  private totalLateralThinks: number = 0
  private totalMetaphorsGenerated: number = 0
  private totalCombinations: number = 0
  private totalReframes: number = 0
  private totalEvolutions: number = 0
  private noveltyHistory: number[] = []
  private feasibilityHistory: number[] = []

  constructor(config?: Partial<CreativeEngineConfig>) {
    this.config = {
      divergenceLevel: config?.divergenceLevel ?? DEFAULT_CONFIG.divergenceLevel,
      maxIdeas: config?.maxIdeas ?? DEFAULT_CONFIG.maxIdeas,
      noveltyThreshold: config?.noveltyThreshold ?? DEFAULT_CONFIG.noveltyThreshold,
      enableEvolution: config?.enableEvolution ?? DEFAULT_CONFIG.enableEvolution,
      maxEvolutionIterations:
        config?.maxEvolutionIterations ?? DEFAULT_CONFIG.maxEvolutionIterations,
      perspectiveCount: config?.perspectiveCount ?? DEFAULT_CONFIG.perspectiveCount,
    }
    this.metaphorDB = buildMetaphorDatabase()
    this.rng = seededRandom(Date.now())
  }

  // ── Brainstorming ─────────────────────────────────────────────────────────

  /**
   * Generate diverse ideas for a problem.
   *
   * Uses multiple creative techniques (random stimulus, SCAMPER fragments,
   * metaphor-inspired thinking, constraint-based ideation, and bisociation)
   * to produce a set of novel and feasible ideas, then scores and ranks them.
   */
  brainstorm(problem: string, constraints?: string[]): BrainstormResult {
    this.totalBrainstorms++
    const tokens = tokenize(problem)
    const constraintTokens = (constraints ?? []).flatMap(c => tokenize(c))
    const ideas: CreativeIdea[] = []
    const maxIdeas = this.config.maxIdeas

    // Technique 1: Direct conceptual exploration
    const directIdeas = this.generateDirectIdeas(tokens, problem)
    ideas.push(...directIdeas)

    // Technique 2: Random stimulus injection
    const stimulusIdeas = this.generateStimulusIdeas(tokens, problem)
    ideas.push(...stimulusIdeas)

    // Technique 3: SCAMPER-inspired fragments
    const scamperIdeas = this.generateScamperIdeas(tokens, problem)
    ideas.push(...scamperIdeas)

    // Technique 4: Metaphor-inspired ideas
    const metaphorIdeas = this.generateMetaphorInspiredIdeas(tokens, problem)
    ideas.push(...metaphorIdeas)

    // Technique 5: Constraint-based ideation
    if (constraints && constraints.length > 0) {
      const constraintIdeas = this.generateConstraintIdeas(
        tokens,
        constraintTokens,
        problem,
        constraints,
      )
      ideas.push(...constraintIdeas)
    }

    // Technique 6: Bisociation (connect unrelated frames)
    const bisociationIdeas = this.generateBisociationIdeas(tokens, problem)
    ideas.push(...bisociationIdeas)

    // Score, filter, and rank
    for (const idea of ideas) {
      idea.novelty = this.computeNoveltyScore(
        idea.description,
        ideas.map(i => i.description),
      )
      idea.feasibility = this.computeFeasibilityScore(idea.description, constraintTokens)
    }

    // Filter by novelty threshold and deduplicate
    const filtered = this.deduplicateIdeas(
      ideas.filter(i => i.novelty >= this.config.noveltyThreshold),
    )

    // Sort by combined score (novelty + feasibility) and take top N
    filtered.sort((a, b) => b.novelty + b.feasibility - (a.novelty + a.feasibility))
    const topIdeas = filtered.slice(0, maxIdeas)

    // Record stats
    for (const idea of topIdeas) {
      this.generatedIdeas.push(idea)
      this.noveltyHistory.push(idea.novelty)
      this.feasibilityHistory.push(idea.feasibility)
    }

    // Compute diversity score across ideas
    const diversityScore = this.computeDiversityScore(topIdeas)

    // Extract themes
    const themes = this.extractThemes(topIdeas)

    const bestIdea = topIdeas.length > 0 ? topIdeas[0] : null

    return {
      ideas: topIdeas,
      bestIdea,
      diversityScore,
      themes,
    }
  }

  // ── Lateral Thinking ──────────────────────────────────────────────────────

  /**
   * Apply lateral thinking techniques to find unexpected connections and
   * reframe the problem space. Uses provocation, reversal, and random entry
   * point methods inspired by Edward de Bono's lateral thinking framework.
   */
  lateralThink(problem: string): LateralThinkingResult[] {
    this.totalLateralThinks++
    const tokens = tokenize(problem)
    const results: LateralThinkingResult[] = []

    // Technique 1: Provocation (PO) — make an absurd statement
    const provocation = this.generateProvocation(tokens, problem)
    results.push(provocation)

    // Technique 2: Reversal — flip the problem
    const reversal = this.generateReversal(tokens, problem)
    results.push(reversal)

    // Technique 3: Random entry point — use unrelated concept as lens
    const randomEntry = this.generateRandomEntryPoint(tokens, problem)
    results.push(randomEntry)

    // Technique 4: Analogy bridging — use a distant domain
    const analogyBridge = this.generateAnalogyBridge(tokens, problem)
    results.push(analogyBridge)

    // Technique 5: Challenge assumptions — identify and question implicit beliefs
    const assumption = this.challengeAssumption(tokens, problem)
    results.push(assumption)

    return results
  }

  // ── Creative Combination ──────────────────────────────────────────────────

  /**
   * Creatively combine two concepts using concept blending.
   *
   * Concept blending (Fauconnier & Turner) merges two input mental spaces
   * into a blended space that inherits structure from both, producing
   * emergent meaning that neither concept has alone.
   */
  combineCreatively(conceptA: string, conceptB: string): CreativeCombination {
    this.totalCombinations++
    const tokensA = tokenize(conceptA)
    const tokensB = tokenize(conceptB)

    // Find shared properties and unique properties
    const setA = new Set(tokensA)
    const setB = new Set(tokensB)
    const shared: string[] = []
    const uniqueA: string[] = []
    const uniqueB: string[] = []

    for (const t of setA) {
      if (setB.has(t)) shared.push(t)
      else uniqueA.push(t)
    }
    for (const t of setB) {
      if (!setA.has(t)) uniqueB.push(t)
    }

    // Generate blended description
    const blendElements: string[] = []
    if (shared.length > 0) {
      blendElements.push(`shared foundation of ${shared.join(', ')}`)
    }
    if (uniqueA.length > 0) {
      blendElements.push(`${conceptA}'s unique aspects (${uniqueA.slice(0, 3).join(', ')})`)
    }
    if (uniqueB.length > 0) {
      blendElements.push(`${conceptB}'s unique aspects (${uniqueB.slice(0, 3).join(', ')})`)
    }

    // Check metaphor database for related concepts
    const relatedA = this.findRelatedMetaphors(tokensA)
    const relatedB = this.findRelatedMetaphors(tokensB)

    const inspirations: string[] = []
    if (relatedA.length > 0) inspirations.push(relatedA[0].explanation)
    if (relatedB.length > 0) inspirations.push(relatedB[0].explanation)

    const combination =
      blendElements.length > 0
        ? `A blend of "${conceptA}" and "${conceptB}" combining ${blendElements.join(' with ')}`
        : `A novel fusion of "${conceptA}" and "${conceptB}" that creates emergent properties from their intersection`

    const explanation = this.generateBlendExplanation(
      conceptA,
      conceptB,
      shared,
      uniqueA,
      uniqueB,
      inspirations,
    )

    const novelty = this.computeConceptDistance(tokensA, tokensB)

    return {
      conceptA,
      conceptB,
      combination,
      explanation,
      novelty: round2(novelty),
    }
  }

  // ── Metaphor Generation ───────────────────────────────────────────────────

  /**
   * Generate useful metaphors for a concept, optionally targeting a
   * specific domain. Searches the pre-built metaphor database and
   * generates new metaphors using cross-domain mapping.
   */
  generateMetaphors(concept: string, targetDomain?: string): Metaphor[] {
    this.totalMetaphorsGenerated++
    const conceptTokens = tokenize(concept)
    const metaphors: Metaphor[] = []

    // Step 1: Search pre-built database
    const dbMatches = this.searchMetaphorDB(conceptTokens, targetDomain)
    for (const entry of dbMatches.slice(0, 3)) {
      metaphors.push({
        source: entry.source,
        target: concept,
        mapping: entry.mapping,
        explanation: entry.explanation,
      })
    }

    // Step 2: Generate new metaphors from stimulus categories
    const domains = targetDomain ? [targetDomain] : Object.keys(STIMULUS_WORDS).slice(0, 3)

    for (const domain of domains) {
      const words = STIMULUS_WORDS[domain]
      if (!words) continue

      const sourceWord = pickRandom(words, this.rng)
      const mapping = this.generateCrossMapping(conceptTokens, sourceWord, domain)
      if (mapping) {
        metaphors.push(mapping)
      }
    }

    // Step 3: Generate an inversion metaphor
    const inversionMetaphor = this.generateInversionMetaphor(concept, conceptTokens)
    if (inversionMetaphor) {
      metaphors.push(inversionMetaphor)
    }

    return metaphors
  }

  // ── Reframing ─────────────────────────────────────────────────────────────

  /**
   * Reframe a problem from different perspectives.
   *
   * Each perspective applies a different lens (user, developer, security, etc.)
   * to surface insights that may be invisible from the original viewpoint.
   */
  reframe(problem: string, perspectives?: string[]): ReframingResult[] {
    this.totalReframes++
    const tokens = tokenize(problem)
    const results: ReframingResult[] = []

    // Select perspectives
    const selectedPerspectives = perspectives
      ? PERSPECTIVE_CATALOG.filter(p =>
          perspectives.some(
            name =>
              p.name.toLowerCase() === name.toLowerCase() ||
              p.role.toLowerCase() === name.toLowerCase(),
          ),
        )
      : this.selectDiversePerspectives(this.config.perspectiveCount)

    // If custom perspectives were given but didn't match, use defaults
    const finalPerspectives =
      selectedPerspectives.length > 0
        ? selectedPerspectives
        : this.selectDiversePerspectives(this.config.perspectiveCount)

    for (const perspective of finalPerspectives) {
      const reframed = this.reframeFromPerspective(problem, tokens, perspective)
      results.push(reframed)
    }

    return results
  }

  // ── SCAMPER Technique ─────────────────────────────────────────────────────

  /**
   * Apply the full SCAMPER technique to a concept.
   *
   * SCAMPER: Substitute, Combine, Adapt, Modify, Put to other use,
   * Eliminate, Reverse. Each step produces a creative transformation
   * of the original concept.
   */
  scamper(concept: string): Record<string, { technique: string; ideas: string[] }> {
    const tokens = tokenize(concept)
    const result: Record<string, { technique: string; ideas: string[] }> = {}

    for (const prompt of SCAMPER_PROMPTS) {
      const ideas: string[] = []

      for (const question of prompt.prompts) {
        const idea = this.applyScamperPrompt(concept, tokens, prompt.technique, question)
        ideas.push(idea)
      }

      result[prompt.letter] = {
        technique: prompt.technique,
        ideas,
      }
    }

    return result
  }

  // ── Random Stimulus ───────────────────────────────────────────────────────

  /**
   * Use random stimulus for idea generation. Picks a random word from
   * an unrelated domain and forces a connection with the problem.
   */
  randomStimulus(problem: string): InspirationSource[] {
    const tokens = tokenize(problem)
    const sources: InspirationSource[] = []
    const usedCategories = new Set<string>()

    // Generate stimuli from different categories
    const categories = shuffle(Object.keys(STIMULUS_WORDS).slice(), this.rng)

    for (const category of categories.slice(0, 4)) {
      if (usedCategories.has(category)) continue
      usedCategories.add(category)

      const words = STIMULUS_WORDS[category]
      const word = pickRandom(words, this.rng)
      const relevance = this.computeStimulRelevance(tokens, word)

      sources.push({
        type: this.categorizeStimulus(category),
        content: `"${word}" (${category}): What if your problem (${problem}) was approached like ${word}? Consider how ${word}'s properties could inspire a solution.`,
        relevance: round2(relevance),
      })
    }

    // Add a creative constraint as stimulus
    const constraint = pickRandom(CREATIVE_CONSTRAINTS, this.rng)
    sources.push({
      type: 'constraint',
      content: `${constraint.name}: ${constraint.description}. ${constraint.effect}`,
      relevance: round2(0.5 + this.rng() * 0.3),
    })

    // Add an inversion stimulus
    sources.push({
      type: 'inversion',
      content: `Inversion: Instead of solving "${problem}", what if you made it worse on purpose? The opposite of that might be your solution.`,
      relevance: round2(0.6 + this.rng() * 0.2),
    })

    sources.sort((a, b) => b.relevance - a.relevance)
    return sources
  }

  // ── Novelty Evaluation ────────────────────────────────────────────────────

  /**
   * Score how novel an idea is compared to existing ideas.
   *
   * Uses a TF-IDF-like uniqueness metric: ideas containing rare tokens
   * relative to the existing idea corpus score higher. Also considers
   * semantic distance from the centroid of existing ideas.
   */
  evaluateNovelty(idea: string, existingIdeas?: string[]): number {
    const corpus = existingIdeas ?? this.generatedIdeas.map(i => i.description)
    return this.computeNoveltyScore(idea, corpus)
  }

  // ── Idea Evolution ────────────────────────────────────────────────────────

  /**
   * Iteratively improve an idea over multiple iterations.
   *
   * Each iteration applies a different creative transformation: adding a
   * constraint, combining with a random stimulus, reframing from a new
   * perspective, or simplifying. Tracks improvement over iterations.
   */
  evolveIdea(idea: CreativeIdea, iterations?: number): IdeaEvolution {
    this.totalEvolutions++
    const maxIter = Math.min(
      iterations ?? this.config.maxEvolutionIterations,
      this.config.maxEvolutionIterations,
    )

    const evolutionSteps: CreativeIdea[] = []
    let current = { ...idea }

    const techniques = ['constrain', 'stimulus', 'reframe', 'simplify', 'combine']

    for (let i = 0; i < maxIter; i++) {
      const technique = techniques[i % techniques.length]
      const evolved = this.applyEvolutionStep(current, technique, i)
      evolutionSteps.push(evolved)
      current = evolved
    }

    const finalIdea = evolutionSteps.length > 0 ? evolutionSteps[evolutionSteps.length - 1] : idea

    const improvementScore = clamp(
      finalIdea.novelty - idea.novelty + (finalIdea.feasibility - idea.feasibility),
      0,
      1,
    )

    return {
      original: idea,
      iterations: evolutionSteps,
      finalIdea,
      improvementScore: round2(improvementScore),
    }
  }

  // ── Connection Finding ────────────────────────────────────────────────────

  /**
   * Find unexpected connections between a set of concepts.
   *
   * Uses bisociation detection to identify bridges between seemingly
   * unrelated concepts. Inspired by Koestler's theory that creative
   * insight arises from connecting two normally separate frames of reference.
   */
  findConnections(
    concepts: string[],
  ): Array<{ pair: [string, string]; connection: string; strength: number }> {
    const connections: Array<{ pair: [string, string]; connection: string; strength: number }> = []

    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const a = concepts[i]
        const b = concepts[j]
        const tokensA = tokenize(a)
        const tokensB = tokenize(b)

        // Direct token overlap
        const shared = tokensA.filter(t => tokensB.includes(t))

        // Metaphor bridge: find metaphors that connect both concepts
        const bridgeMetaphors = this.findBridgeMetaphors(tokensA, tokensB)

        // Stimulus category overlap
        const catA = this.findStimulusCategories(tokensA)
        const catB = this.findStimulusCategories(tokensB)
        const sharedCategories = catA.filter(c => catB.includes(c))

        let connection: string
        let strength: number

        if (shared.length > 0) {
          connection = `Direct semantic link through shared concepts: ${shared.join(', ')}`
          strength = clamp(shared.length / Math.max(tokensA.length, tokensB.length, 1), 0.2, 1)
        } else if (bridgeMetaphors.length > 0) {
          connection = `Metaphorical bridge: ${bridgeMetaphors[0]}`
          strength = clamp(0.4 + bridgeMetaphors.length * 0.1, 0, 1)
        } else if (sharedCategories.length > 0) {
          connection = `Thematic link through ${sharedCategories.join(' and ')} domains`
          strength = clamp(0.3 + sharedCategories.length * 0.1, 0, 0.8)
        } else {
          // Force a creative connection via bisociation
          const forced = this.forceBisociation(a, b, tokensA, tokensB)
          connection = forced
          strength = round2(0.2 + this.rng() * 0.3)
        }

        connections.push({
          pair: [a, b],
          connection,
          strength: round2(strength),
        })
      }
    }

    connections.sort((a, b) => b.strength - a.strength)
    return connections
  }

  // ── Stats & Persistence ───────────────────────────────────────────────────

  /** Return aggregate statistics about the creative engine state. */
  getStats(): CreativeEngineStats {
    const avgNovelty =
      this.noveltyHistory.length > 0
        ? this.noveltyHistory.reduce((s, v) => s + v, 0) / this.noveltyHistory.length
        : 0
    const avgFeasibility =
      this.feasibilityHistory.length > 0
        ? this.feasibilityHistory.reduce((s, v) => s + v, 0) / this.feasibilityHistory.length
        : 0

    return {
      totalBrainstorms: this.totalBrainstorms,
      totalIdeasGenerated: this.generatedIdeas.length,
      totalLateralThinks: this.totalLateralThinks,
      totalMetaphorsGenerated: this.totalMetaphorsGenerated,
      totalCombinations: this.totalCombinations,
      totalReframes: this.totalReframes,
      totalEvolutions: this.totalEvolutions,
      avgNovelty: round2(avgNovelty),
      avgFeasibility: round2(avgFeasibility),
    }
  }

  /** Serialize the entire engine state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      generatedIdeas: this.generatedIdeas,
      totalBrainstorms: this.totalBrainstorms,
      totalLateralThinks: this.totalLateralThinks,
      totalMetaphorsGenerated: this.totalMetaphorsGenerated,
      totalCombinations: this.totalCombinations,
      totalReframes: this.totalReframes,
      totalEvolutions: this.totalEvolutions,
      noveltyHistory: this.noveltyHistory,
      feasibilityHistory: this.feasibilityHistory,
    })
  }

  /** Restore a CreativeEngine from a previously serialized JSON string. */
  static deserialize(json: string): CreativeEngine {
    const data = JSON.parse(json) as {
      config: CreativeEngineConfig
      generatedIdeas: CreativeIdea[]
      totalBrainstorms: number
      totalLateralThinks: number
      totalMetaphorsGenerated: number
      totalCombinations: number
      totalReframes: number
      totalEvolutions: number
      noveltyHistory: number[]
      feasibilityHistory: number[]
    }

    const engine = new CreativeEngine(data.config)

    if (Array.isArray(data.generatedIdeas)) {
      engine.generatedIdeas = data.generatedIdeas
    }

    engine.totalBrainstorms = data.totalBrainstorms ?? 0
    engine.totalLateralThinks = data.totalLateralThinks ?? 0
    engine.totalMetaphorsGenerated = data.totalMetaphorsGenerated ?? 0
    engine.totalCombinations = data.totalCombinations ?? 0
    engine.totalReframes = data.totalReframes ?? 0
    engine.totalEvolutions = data.totalEvolutions ?? 0

    if (Array.isArray(data.noveltyHistory)) {
      engine.noveltyHistory = data.noveltyHistory
    }
    if (Array.isArray(data.feasibilityHistory)) {
      engine.feasibilityHistory = data.feasibilityHistory
    }

    return engine
  }

  // ── Private: Idea Generation Techniques ───────────────────────────────────

  /** Generate ideas through direct conceptual exploration of problem tokens. */
  private generateDirectIdeas(tokens: string[], problem: string): CreativeIdea[] {
    const ideas: CreativeIdea[] = []
    if (tokens.length === 0) return ideas

    // Approach 1: Combine problem tokens with action verbs
    const actions = [
      'automate',
      'simplify',
      'parallelize',
      'cache',
      'decompose',
      'abstract',
      'invert',
      'visualize',
    ]
    for (const action of actions.slice(0, 3)) {
      const keyword = pickRandom(tokens, this.rng)
      ideas.push({
        id: generateId('idea'),
        description: `${action} the "${keyword}" aspect of the problem: ${problem}`,
        novelty: 0,
        feasibility: 0,
        category: 'direct',
        inspirations: [action, keyword],
      })
    }

    // Approach 2: Question-driven exploration
    const questions = ['What if', 'How might we', 'Why not']
    const questionPick = pickRandom(questions, this.rng)
    ideas.push({
      id: generateId('idea'),
      description: `${questionPick} approach "${problem}" by focusing on the relationship between ${tokens.slice(0, 3).join(' and ')}?`,
      novelty: 0,
      feasibility: 0,
      category: 'question',
      inspirations: tokens.slice(0, 3),
    })

    return ideas
  }

  /** Generate ideas using random stimulus words. */
  private generateStimulusIdeas(tokens: string[], problem: string): CreativeIdea[] {
    const ideas: CreativeIdea[] = []
    const numStimuli = Math.ceil(this.config.divergenceLevel * 3)

    for (let i = 0; i < numStimuli; i++) {
      const stimulus = pickRandom(ALL_STIMULUS_WORDS, this.rng)
      const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'solution'
      ideas.push({
        id: generateId('idea'),
        description: `Inspired by "${stimulus}": What if the solution to "${problem}" worked like a ${stimulus}? Consider how a ${stimulus} handles ${keyword}.`,
        novelty: 0,
        feasibility: 0,
        category: 'stimulus',
        inspirations: [stimulus, keyword],
      })
    }

    return ideas
  }

  /** Generate ideas using SCAMPER fragments. */
  private generateScamperIdeas(tokens: string[], problem: string): CreativeIdea[] {
    const ideas: CreativeIdea[] = []

    // Pick 2-3 random SCAMPER techniques
    const shuffled = shuffle([...SCAMPER_PROMPTS], this.rng)
    const selected = shuffled.slice(0, Math.min(3, shuffled.length))

    for (const prompt of selected) {
      const question = pickRandom(prompt.prompts, this.rng)
      const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'concept'

      ideas.push({
        id: generateId('idea'),
        description: `[${prompt.technique}] Applied to "${problem}": ${question} Focus on "${keyword}" as the element to ${prompt.technique.toLowerCase()}.`,
        novelty: 0,
        feasibility: 0,
        category: `scamper-${prompt.letter}`,
        inspirations: [prompt.technique, keyword],
      })
    }

    return ideas
  }

  /** Generate ideas inspired by metaphor database matches. */
  private generateMetaphorInspiredIdeas(tokens: string[], problem: string): CreativeIdea[] {
    const ideas: CreativeIdea[] = []
    const matches = this.searchMetaphorDB(tokens)

    for (const match of matches.slice(0, 2)) {
      ideas.push({
        id: generateId('idea'),
        description: `Metaphor-inspired: "${problem}" is like ${match.source}. ${match.explanation} Apply this mapping to find a solution.`,
        novelty: 0,
        feasibility: 0,
        category: 'metaphor',
        inspirations: [match.source, match.concept],
      })
    }

    return ideas
  }

  /** Generate ideas driven by explicit constraints. */
  private generateConstraintIdeas(
    tokens: string[],
    constraintTokens: string[],
    problem: string,
    constraints: string[],
  ): CreativeIdea[] {
    const ideas: CreativeIdea[] = []

    // Paradoxical constraint: treat the constraint as an advantage
    for (const constraint of constraints.slice(0, 2)) {
      ideas.push({
        id: generateId('idea'),
        description: `Embrace the constraint "${constraint}" as a feature, not a limitation. How does "${problem}" become better because of this constraint?`,
        novelty: 0,
        feasibility: 0,
        category: 'constraint',
        inspirations: [constraint, ...tokens.slice(0, 2)],
      })
    }

    // Creative constraint from database
    const cc = pickRandom(CREATIVE_CONSTRAINTS, this.rng)
    ideas.push({
      id: generateId('idea'),
      description: `Apply the "${cc.name}" constraint: ${cc.description}. For "${problem}", this means: ${cc.effect}`,
      novelty: 0,
      feasibility: 0,
      category: 'constraint',
      inspirations: [cc.name, ...constraintTokens.slice(0, 2)],
    })

    return ideas
  }

  /** Generate ideas using bisociation — connecting two unrelated frames. */
  private generateBisociationIdeas(tokens: string[], problem: string): CreativeIdea[] {
    const ideas: CreativeIdea[] = []

    // Pick two random, unrelated stimulus categories
    const categories = shuffle(Object.keys(STIMULUS_WORDS).slice(), this.rng)
    if (categories.length >= 2) {
      const wordA = pickRandom(STIMULUS_WORDS[categories[0]], this.rng)
      const wordB = pickRandom(STIMULUS_WORDS[categories[1]], this.rng)

      ideas.push({
        id: generateId('idea'),
        description: `Bisociation: Connect "${wordA}" (${categories[0]}) with "${wordB}" (${categories[1]}) in the context of "${problem}". The intersection of these unrelated frames could reveal a novel approach.`,
        novelty: 0,
        feasibility: 0,
        category: 'bisociation',
        inspirations: [wordA, wordB, categories[0], categories[1]],
      })
    }

    // Connect a problem token with a distant metaphor
    if (tokens.length > 0) {
      const keyword = pickRandom(tokens, this.rng)
      const distantCategory = pickRandom(categories, this.rng)
      const distantWord = pickRandom(
        STIMULUS_WORDS[distantCategory] ?? ALL_STIMULUS_WORDS,
        this.rng,
      )

      ideas.push({
        id: generateId('idea'),
        description: `Bisociation bridge: What do "${keyword}" and "${distantWord}" have in common? Finding their hidden connection could unlock a creative solution to "${problem}".`,
        novelty: 0,
        feasibility: 0,
        category: 'bisociation',
        inspirations: [keyword, distantWord],
      })
    }

    return ideas
  }

  // ── Private: Lateral Thinking Techniques ──────────────────────────────────

  /** Generate a provocation (PO) — an absurd or impossible statement. */
  private generateProvocation(tokens: string[], problem: string): LateralThinkingResult {
    const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'solution'
    const provocations = [
      `PO: What if "${keyword}" did not exist at all?`,
      `PO: What if "${keyword}" worked backwards?`,
      `PO: What if "${keyword}" was sentient and made its own decisions?`,
      `PO: What if we needed the opposite of "${keyword}"?`,
    ]

    const chosen = pickRandom(provocations, this.rng)
    return {
      connection: chosen,
      explanation: `Provocation applied to "${problem}": ${chosen} — Now move from this absurd statement to extract a practical movement. What useful idea does this trigger?`,
      novelty: round2(0.7 + this.rng() * 0.3),
      technique: 'provocation',
    }
  }

  /** Generate a reversal — flip the problem on its head. */
  private generateReversal(tokens: string[], problem: string): LateralThinkingResult {
    const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'challenge'
    return {
      connection: `Reversal: Instead of solving "${problem}", make it worse. What would that look like?`,
      explanation: `By deliberately worsening the "${keyword}" aspect, we identify exactly what factors matter most. The opposite of each worsening action becomes a potential solution strategy.`,
      novelty: round2(0.6 + this.rng() * 0.2),
      technique: 'reversal',
    }
  }

  /** Use a random unrelated concept as a lens for the problem. */
  private generateRandomEntryPoint(tokens: string[], problem: string): LateralThinkingResult {
    const randomWord = pickRandom(ALL_STIMULUS_WORDS, this.rng)
    const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'problem'
    return {
      connection: `Random entry: Use "${randomWord}" as a lens for "${problem}"`,
      explanation: `How is a ${randomWord} related to ${keyword}? A ${randomWord} has properties like structure, transformation, and purpose. Map these properties onto your problem to find unexpected angles.`,
      novelty: round2(0.5 + this.rng() * 0.4),
      technique: 'random-entry',
    }
  }

  /** Use a distant domain analogy as a bridge. */
  private generateAnalogyBridge(tokens: string[], problem: string): LateralThinkingResult {
    const categories = Object.keys(STIMULUS_WORDS)
    const category = pickRandom(categories, this.rng)
    const word = pickRandom(STIMULUS_WORDS[category], this.rng)

    return {
      connection: `Analogy bridge: "${problem}" is like "${word}" in the ${category} domain`,
      explanation: `If your problem were a challenge in ${category}, specifically related to "${word}", how would experts in that domain approach it? Transfer their solution strategy back to your original context.`,
      novelty: round2(0.6 + this.rng() * 0.3),
      technique: 'analogy-bridge',
    }
  }

  /** Identify and challenge an implicit assumption. */
  private challengeAssumption(tokens: string[], problem: string): LateralThinkingResult {
    const assumptions = [
      'that this needs to be solved with code',
      'that the current approach is the only way',
      'that speed/performance is the primary concern',
      'that the user needs all the features described',
      'that this needs to be done from scratch',
      'that the problem is correctly framed',
      'that the constraints are truly fixed',
    ]

    const assumption = pickRandom(assumptions, this.rng)
    return {
      connection: `Challenge assumption: What if we dropped the assumption ${assumption}?`,
      explanation: `Regarding "${problem}": We may be implicitly assuming ${assumption}. Dropping this assumption opens a new solution space. What solutions become possible when this assumption is removed?`,
      novelty: round2(0.5 + this.rng() * 0.3),
      technique: 'assumption-challenge',
    }
  }

  // ── Private: Metaphor Helpers ─────────────────────────────────────────────

  /** Search the metaphor database for entries matching the given tokens. */
  private searchMetaphorDB(tokens: string[], targetDomain?: string): MetaphorEntry[] {
    const scored: Array<{ entry: MetaphorEntry; score: number }> = []

    for (const entry of this.metaphorDB) {
      if (targetDomain && entry.domain.toLowerCase() !== targetDomain.toLowerCase()) continue

      const conceptLower = entry.concept.toLowerCase()
      let score = 0

      for (const token of tokens) {
        if (conceptLower.includes(token)) score += 0.5
        if (entry.source.toLowerCase().includes(token)) score += 0.2
        for (const key of Object.keys(entry.mapping)) {
          if (key.toLowerCase().includes(token)) score += 0.1
        }
      }

      if (score > 0) {
        scored.push({ entry, score })
      }
    }

    scored.sort((a, b) => b.score - a.score)
    return scored.map(s => s.entry)
  }

  /** Find metaphors related to a set of tokens. */
  private findRelatedMetaphors(tokens: string[]): MetaphorEntry[] {
    return this.searchMetaphorDB(tokens).slice(0, 3)
  }

  /** Generate a cross-domain mapping between concept tokens and a source word. */
  private generateCrossMapping(
    conceptTokens: string[],
    sourceWord: string,
    domain: string,
  ): Metaphor | null {
    if (conceptTokens.length === 0) return null

    const mapping: Record<string, string> = {}
    const sourceProperties = this.inferProperties(sourceWord, domain)

    for (let i = 0; i < Math.min(conceptTokens.length, sourceProperties.length); i++) {
      mapping[conceptTokens[i]] = sourceProperties[i]
    }

    if (Object.keys(mapping).length === 0) return null

    const concept = conceptTokens.join(' ')
    return {
      source: sourceWord,
      target: concept,
      mapping,
      explanation: `"${concept}" maps to "${sourceWord}" (${domain}): ${Object.entries(mapping)
        .map(([k, v]) => `${k} ↔ ${v}`)
        .join(', ')}.`,
    }
  }

  /** Infer properties of a stimulus word based on its domain. */
  private inferProperties(word: string, domain: string): string[] {
    const domainProperties: Record<string, string[]> = {
      nature: ['growth', 'adaptation', 'cycles', 'flow', 'resilience', 'interconnection'],
      technology: ['precision', 'amplification', 'transmission', 'processing', 'optimization'],
      art: ['expression', 'composition', 'balance', 'emotion', 'interpretation', 'creation'],
      society: ['collaboration', 'exchange', 'hierarchy', 'communication', 'tradition'],
      biology: ['reproduction', 'adaptation', 'specialization', 'signaling', 'metabolism'],
      physics: ['force', 'energy', 'transformation', 'equilibrium', 'conservation', 'interaction'],
    }

    return domainProperties[domain] ?? ['structure', 'function', 'relationship', 'change']
  }

  /** Generate a metaphor by inverting the concept's expected properties. */
  private generateInversionMetaphor(concept: string, tokens: string[]): Metaphor | null {
    if (tokens.length === 0) return null

    const inversions: Record<string, string> = {
      fast: 'slow-and-deliberate',
      complex: 'simple-and-elegant',
      large: 'compact-and-focused',
      static: 'fluid-and-adaptive',
      rigid: 'flexible-and-organic',
      automated: 'human-curated',
      centralized: 'distributed-and-autonomous',
      synchronous: 'event-driven',
      temporary: 'persistent-and-enduring',
      mutable: 'immutable-and-pure',
    }

    // Find a token that has an inversion
    for (const token of tokens) {
      const inversion = inversions[token]
      if (inversion) {
        return {
          source: `the ${inversion} alternative`,
          target: concept,
          mapping: { [token]: inversion },
          explanation: `What if "${concept}" was ${inversion} instead of ${token}? This inversion reveals hidden design possibilities.`,
        }
      }
    }

    // Generic inversion
    const keyword = tokens[0]
    return {
      source: `the opposite of ${keyword}`,
      target: concept,
      mapping: { [keyword]: `anti-${keyword}` },
      explanation: `Consider the opposite of "${keyword}" in "${concept}". What would a solution look like if it deliberately avoided ${keyword}?`,
    }
  }

  // ── Private: Reframing Helpers ────────────────────────────────────────────

  /** Select diverse perspectives from the catalog. */
  private selectDiversePerspectives(count: number): PerspectiveTemplate[] {
    const shuffled = shuffle([...PERSPECTIVE_CATALOG], this.rng)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  /** Reframe a problem from a specific perspective. */
  private reframeFromPerspective(
    problem: string,
    tokens: string[],
    perspective: PerspectiveTemplate,
  ): ReframingResult {
    const question = pickRandom(perspective.questions, this.rng)
    const concern = pickRandom(perspective.concerns, this.rng)

    const insights: string[] = []
    insights.push(`From the ${perspective.role}'s viewpoint, the key concern is ${concern}.`)
    insights.push(question)

    // Generate perspective-specific reframing
    const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'problem'
    insights.push(
      `Consider how "${keyword}" looks through the lens of ${concern}. ` +
        `What aspects become more or less important?`,
    )

    const reframed =
      `As a ${perspective.role}, I would reframe "${problem}" in terms of ` +
      `${perspective.concerns.slice(0, 3).join(', ')}. ${question}`

    return {
      perspective: perspective.role,
      reframed,
      insights,
      novelty: round2(0.4 + this.rng() * 0.4),
    }
  }

  // ── Private: SCAMPER Helpers ──────────────────────────────────────────────

  /** Apply a single SCAMPER prompt to a concept. */
  private applyScamperPrompt(
    concept: string,
    tokens: string[],
    technique: string,
    question: string,
  ): string {
    const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : concept

    const templates: Record<string, string> = {
      Substitute: `In "${concept}", substitute "${keyword}" with an alternative. ${question}`,
      Combine: `Merge "${keyword}" from "${concept}" with another element. ${question}`,
      Adapt: `Adapt "${keyword}" from "${concept}" to a different context. ${question}`,
      Modify: `Modify the "${keyword}" aspect of "${concept}" — make it bigger, smaller, or different. ${question}`,
      'Put to other use': `Take "${keyword}" from "${concept}" and use it for an entirely different purpose. ${question}`,
      Eliminate: `Remove "${keyword}" from "${concept}" entirely. What remains? ${question}`,
      Reverse: `Reverse the role of "${keyword}" in "${concept}". ${question}`,
    }

    return templates[technique] ?? `Apply ${technique} to "${keyword}" in "${concept}". ${question}`
  }

  // ── Private: Scoring & Analysis ───────────────────────────────────────────

  /**
   * Compute a novelty score for an idea relative to a corpus.
   * Uses token rarity (inverse document frequency analog) and
   * cosine distance from the corpus centroid.
   */
  private computeNoveltyScore(idea: string, corpus: string[]): number {
    const ideaTokens = tokenize(idea)
    if (ideaTokens.length === 0) return 0.5

    if (corpus.length === 0) return round2(0.7 + this.rng() * 0.2)

    // Compute document frequency for each token across the corpus
    const docFreq = new Map<string, number>()
    for (const doc of corpus) {
      const docTokens = new Set(tokenize(doc))
      for (const t of docTokens) {
        docFreq.set(t, (docFreq.get(t) ?? 0) + 1)
      }
    }

    // IDF-like scoring: tokens appearing in fewer corpus documents = higher novelty
    let raritySum = 0
    for (const token of ideaTokens) {
      const df = docFreq.get(token) ?? 0
      const idf = Math.log((corpus.length + 1) / (df + 1))
      raritySum += idf
    }
    const avgRarity = raritySum / ideaTokens.length
    const maxIdf = Math.log(corpus.length + 1)
    const rarityScore = maxIdf > 0 ? avgRarity / maxIdf : 0.5

    // Cosine distance from corpus centroid
    const ideaTF = termFrequencyMap(ideaTokens)
    const corpusTokens = corpus.flatMap(d => tokenize(d))
    const corpusTF = termFrequencyMap(corpusTokens)
    const similarity = cosineSimilarity(ideaTF, corpusTF)
    const distanceScore = 1 - similarity

    // Blend rarity and distance scores
    const novelty = clamp(rarityScore * 0.6 + distanceScore * 0.4, 0, 1)
    return round2(novelty)
  }

  /** Estimate feasibility based on the presence of actionable/concrete tokens. */
  private computeFeasibilityScore(idea: string, constraintTokens: string[]): number {
    const tokens = tokenize(idea)
    if (tokens.length === 0) return 0.5

    const actionWords = new Set([
      'automate',
      'simplify',
      'cache',
      'decompose',
      'refactor',
      'test',
      'parallelize',
      'optimize',
      'abstract',
      'modularize',
      'implement',
      'build',
      'deploy',
      'monitor',
      'integrate',
      'migrate',
      'design',
    ])

    const concreteWords = new Set([
      'api',
      'database',
      'function',
      'class',
      'module',
      'service',
      'component',
      'interface',
      'endpoint',
      'query',
      'table',
      'config',
      'pipeline',
      'workflow',
      'template',
      'schema',
      'model',
      'pattern',
    ])

    let actionScore = 0
    let concreteScore = 0

    for (const token of tokens) {
      if (actionWords.has(token)) actionScore += 1
      if (concreteWords.has(token)) concreteScore += 1
    }

    const actionRatio = Math.min(1, actionScore / 2)
    const concreteRatio = Math.min(1, concreteScore / 2)

    // Constraint compatibility
    let constraintBonus = 0
    if (constraintTokens.length > 0) {
      const tokenSet = new Set(tokens)
      let matches = 0
      for (const ct of constraintTokens) {
        if (tokenSet.has(ct)) matches++
      }
      constraintBonus = (matches / constraintTokens.length) * 0.2
    }

    const feasibility = clamp(
      actionRatio * 0.3 + concreteRatio * 0.3 + 0.4 + constraintBonus,
      0.1,
      1,
    )
    return round2(feasibility)
  }

  /** Compute diversity score across a set of ideas. */
  private computeDiversityScore(ideas: CreativeIdea[]): number {
    if (ideas.length <= 1) return 0

    const categories = new Set(ideas.map(i => i.category))
    const categoryDiversity = categories.size / ideas.length

    // Average pairwise distance between ideas
    let totalDistance = 0
    let pairs = 0

    for (let i = 0; i < ideas.length; i++) {
      for (let j = i + 1; j < ideas.length; j++) {
        const tokensA = tokenize(ideas[i].description)
        const tokensB = tokenize(ideas[j].description)
        const similarity = jaccardSimilarity(tokensA, tokensB)
        totalDistance += 1 - similarity
        pairs++
      }
    }

    const avgDistance = pairs > 0 ? totalDistance / pairs : 0

    return round2(clamp(categoryDiversity * 0.5 + avgDistance * 0.5, 0, 1))
  }

  /** Extract common themes from a set of ideas. */
  private extractThemes(ideas: CreativeIdea[]): string[] {
    const tokenCounts = new Map<string, number>()
    for (const idea of ideas) {
      const tokens = new Set(tokenize(idea.description))
      for (const t of tokens) {
        tokenCounts.set(t, (tokenCounts.get(t) ?? 0) + 1)
      }
    }

    // Themes are tokens appearing in at least 30% of ideas
    const threshold = Math.max(2, ideas.length * 0.3)
    const themes = Array.from(tokenCounts.entries())
      .filter(([, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term]) => term)

    return themes
  }

  /** Deduplicate ideas by removing those with high token overlap. */
  private deduplicateIdeas(ideas: CreativeIdea[]): CreativeIdea[] {
    const unique: CreativeIdea[] = []

    for (const idea of ideas) {
      const tokens = tokenize(idea.description)
      let isDuplicate = false

      for (const existing of unique) {
        const existingTokens = tokenize(existing.description)
        const similarity = jaccardSimilarity(tokens, existingTokens)
        if (similarity > 0.7) {
          isDuplicate = true
          break
        }
      }

      if (!isDuplicate) {
        unique.push(idea)
      }
    }

    return unique
  }

  /** Compute conceptual distance between two sets of tokens (0-1). */
  private computeConceptDistance(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 || tokensB.length === 0) return 0.8
    const similarity = jaccardSimilarity(tokensA, tokensB)
    return round2(1 - similarity)
  }

  /** Generate an explanation for a concept blend. */
  private generateBlendExplanation(
    conceptA: string,
    conceptB: string,
    shared: string[],
    uniqueA: string[],
    uniqueB: string[],
    inspirations: string[],
  ): string {
    const parts: string[] = []
    parts.push(`Blending "${conceptA}" with "${conceptB}":`)

    if (shared.length > 0) {
      parts.push(
        `They share common ground in ${shared.join(', ')}, which forms the foundation of the blend.`,
      )
    } else {
      parts.push(
        'These concepts come from different domains, making their blend particularly novel.',
      )
    }

    if (uniqueA.length > 0 && uniqueB.length > 0) {
      parts.push(
        `The blend inherits ${uniqueA.slice(0, 2).join(' and ')} from "${conceptA}" ` +
          `and ${uniqueB.slice(0, 2).join(' and ')} from "${conceptB}".`,
      )
    }

    if (inspirations.length > 0) {
      parts.push(`Related insight: ${inspirations[0]}`)
    }

    return parts.join(' ')
  }

  /** Compute relevance of a stimulus word to problem tokens. */
  private computeStimulRelevance(tokens: string[], stimulus: string): number {
    const stimulusTokens = tokenize(stimulus)
    if (tokens.length === 0 || stimulusTokens.length === 0) return 0.3

    // Low direct overlap = high novelty stimulus = moderate relevance
    const overlap = jaccardSimilarity(tokens, stimulusTokens)
    // Sweet spot: not too similar (boring) and not too different (irrelevant)
    return clamp(0.3 + (1 - overlap) * 0.5, 0.2, 0.9)
  }

  /** Categorize a stimulus domain into an InspirationSource type. */
  private categorizeStimulus(category: string): InspirationSource['type'] {
    const mapping: Record<string, InspirationSource['type']> = {
      nature: 'nature',
      biology: 'nature',
      technology: 'domain',
      art: 'analogy',
      society: 'analogy',
      physics: 'domain',
    }
    return mapping[category] ?? 'word'
  }

  /** Find metaphors that bridge two sets of tokens. */
  private findBridgeMetaphors(tokensA: string[], tokensB: string[]): string[] {
    const bridges: string[] = []

    for (const entry of this.metaphorDB) {
      const conceptTokens = tokenize(entry.concept)
      const sourceTokens = tokenize(entry.source)
      const allEntryTokens = [...conceptTokens, ...sourceTokens]

      const matchesA = tokensA.some(t => allEntryTokens.includes(t))
      const matchesB = tokensB.some(t => allEntryTokens.includes(t))

      if (matchesA && matchesB) {
        bridges.push(
          `Both connected through "${entry.concept} ↔ ${entry.source}": ${entry.explanation}`,
        )
      }
    }

    return bridges
  }

  /** Find which stimulus categories tokens belong to. */
  private findStimulusCategories(tokens: string[]): string[] {
    const categories: string[] = []
    for (const [category, words] of Object.entries(STIMULUS_WORDS)) {
      for (const token of tokens) {
        if (words.includes(token)) {
          categories.push(category)
          break
        }
      }
    }
    return categories
  }

  /** Force a creative bisociation between two seemingly unrelated concepts. */
  private forceBisociation(
    conceptA: string,
    conceptB: string,
    tokensA: string[],
    tokensB: string[],
  ): string {
    const templates = [
      `Both "${conceptA}" and "${conceptB}" involve transformation — one transforms {a} while the other transforms {b}. Their shared pattern of transformation could yield a novel combined approach.`,
      `"${conceptA}" operates through {a}, while "${conceptB}" operates through {b}. Applying the mechanism of one to the domain of the other opens unexpected possibilities.`,
      `Consider "${conceptA}" as the structure and "${conceptB}" as the process. What emerges when you run the process of one on the structure of the other?`,
      `If "${conceptA}" and "${conceptB}" were two ingredients in a recipe, their combination would create something neither possesses alone — a creative emergence.`,
    ]

    const template = pickRandom(templates, this.rng)
    const a = tokensA.length > 0 ? tokensA[0] : 'its elements'
    const b = tokensB.length > 0 ? tokensB[0] : 'its elements'

    return template.replace('{a}', a).replace('{b}', b)
  }

  /** Apply one evolution step to an idea using the specified technique. */
  private applyEvolutionStep(
    idea: CreativeIdea,
    technique: string,
    _iteration: number,
  ): CreativeIdea {
    const tokens = tokenize(idea.description)

    let evolvedDescription: string
    let evolvedInspirations: string[]

    switch (technique) {
      case 'constrain': {
        const constraint = pickRandom(CREATIVE_CONSTRAINTS, this.rng)
        evolvedDescription = `${idea.description} — Refined with constraint "${constraint.name}": ${constraint.description}`
        evolvedInspirations = [...idea.inspirations, constraint.name]
        break
      }
      case 'stimulus': {
        const stimulus = pickRandom(ALL_STIMULUS_WORDS, this.rng)
        evolvedDescription = `${idea.description} — Enhanced with "${stimulus}" inspiration: integrate ${stimulus}-like properties.`
        evolvedInspirations = [...idea.inspirations, stimulus]
        break
      }
      case 'reframe': {
        const perspective = pickRandom(PERSPECTIVE_CATALOG, this.rng)
        evolvedDescription = `${idea.description} — Viewed through ${perspective.role} lens: prioritize ${perspective.concerns[0]}.`
        evolvedInspirations = [...idea.inspirations, perspective.role]
        break
      }
      case 'simplify': {
        const keyword = tokens.length > 0 ? pickRandom(tokens, this.rng) : 'core'
        evolvedDescription = `Simplified core of: ${idea.description} — Focus on "${keyword}" as the essential element, remove everything else.`
        evolvedInspirations = [...idea.inspirations, 'simplification']
        break
      }
      case 'combine': {
        const distantWord = pickRandom(ALL_STIMULUS_WORDS, this.rng)
        evolvedDescription = `${idea.description} — Combined with "${distantWord}" to add: ${this.inferProperties(distantWord, 'nature')[0]}.`
        evolvedInspirations = [...idea.inspirations, distantWord]
        break
      }
      default: {
        evolvedDescription = idea.description
        evolvedInspirations = idea.inspirations
      }
    }

    const evolved: CreativeIdea = {
      id: generateId('evo'),
      description: evolvedDescription,
      novelty: 0,
      feasibility: 0,
      category: `evolution-${technique}`,
      inspirations: evolvedInspirations,
    }

    // Score the evolved idea
    evolved.novelty = this.computeNoveltyScore(evolved.description, [
      idea.description,
      ...this.generatedIdeas.map(i => i.description),
    ])
    evolved.feasibility = this.computeFeasibilityScore(evolved.description, [])

    // Ensure evolved idea is at least as good or slightly better
    evolved.novelty = round2(Math.max(evolved.novelty, idea.novelty * 0.9))
    evolved.feasibility = round2(Math.max(evolved.feasibility, idea.feasibility * 0.9))

    return evolved
  }
}
