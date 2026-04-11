/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Curriculum Optimizer — Phase 10 Intelligence Module for LocalBrain          ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Skill Registration — Register skills with difficulty & prerequisites    ║
 * ║    ✦ Prerequisite Graph — Build & traverse prerequisite chains (topo-sort)   ║
 * ║    ✦ Mastery Tracking — Track mastery levels 0–1 with practice counts        ║
 * ║    ✦ Knowledge Gap Detection — Identify weak/unlearned prerequisite skills   ║
 * ║    ✦ Learning Path Generation — Optimal paths from current state to target   ║
 * ║    ✦ Difficulty Calibration — Adjust recommendations to learner performance  ║
 * ║    ✦ Spaced Repetition — Forgetting-curve-based review recommendations      ║
 * ║    ✦ Learning Velocity — Track acquisition speed & adapt recommendations    ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Utility helpers ────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Configuration ──────────────────────────────────────────────────────────────

export interface CurriculumOptimizerConfig {
  /** Maximum number of skills that can be registered. */
  maxSkills: number
  /** Whether to enforce prerequisite ordering. */
  enablePrerequisites: boolean
  /** Whether to generate spaced-repetition review recommendations. */
  enableSpacedRepetition: boolean
  /** Whether to calibrate difficulty based on learner performance. */
  enableDifficultyCalibration: boolean
  /** Whether to track learning velocity across domains. */
  enableVelocityTracking: boolean
  /** Base interval in hours for the spaced-repetition schedule. */
  spacedRepetitionBase: number
  /** Rate at which difficulty calibration adjusts (0–1). */
  difficultyAdjustRate: number
  /** Minimum mastery required on a prerequisite before unlocking dependents. */
  minMasteryForPrereq: number
}

const DEFAULT_CONFIG: CurriculumOptimizerConfig = {
  maxSkills: 2000,
  enablePrerequisites: true,
  enableSpacedRepetition: true,
  enableDifficultyCalibration: true,
  enableVelocityTracking: true,
  spacedRepetitionBase: 24,
  difficultyAdjustRate: 0.15,
  minMasteryForPrereq: 0.6,
}

// ── Statistics ─────────────────────────────────────────────────────────────────

export interface CurriculumOptimizerStats {
  totalSkills: number
  totalPathsGenerated: number
  totalGapsDetected: number
  totalReviewsRecommended: number
  totalFeedbacks: number
  avgMastery: number
  avgLearningVelocity: number
  feedbackAccuracy: number
}

// ── Domain types ───────────────────────────────────────────────────────────────

export interface Skill {
  id: string
  name: string
  domain: string
  difficulty: number
  prerequisites: string[]
  description: string
  createdAt: number
}

export interface SkillMastery {
  skillId: string
  mastery: number
  practiceCount: number
  lastPracticed: number
  firstPracticed: number
  streak: number
  bestScore: number
}

export interface KnowledgeGap {
  skillId: string
  currentMastery: number
  requiredMastery: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  blockedSkills: string[]
}

export interface LearningPath {
  targetSkill: string
  steps: LearningStep[]
  estimatedDuration: number
  totalSkills: number
  confidence: number
}

export interface LearningStep {
  skillId: string
  skillName: string
  difficulty: number
  currentMastery: number
  targetMastery: number
  isPrerequisite: boolean
  estimatedEffort: number
}

export interface ReviewRecommendation {
  skillId: string
  skillName: string
  urgency: number
  daysSinceLastPractice: number
  expectedRetention: number
  reason: string
}

export interface LearningVelocity {
  domain: string
  skillsPerHour: number
  avgTimeToMastery: number
  trend: 'improving' | 'stable' | 'declining'
}

// ── Internal tracking types ────────────────────────────────────────────────────

interface PracticeEvent {
  skillId: string
  score: number
  timestamp: number
}

interface FeedbackRecord {
  pathId: string
  quality: number
  timestamp: number
}

// ── CurriculumOptimizer ────────────────────────────────────────────────────────

export class CurriculumOptimizer {
  private readonly config: CurriculumOptimizerConfig

  // Core stores
  private readonly skills: Map<string, Skill> = new Map()
  private readonly nameIndex: Map<string, string> = new Map()
  private readonly masteryStore: Map<string, SkillMastery> = new Map()

  // History / tracking
  private readonly practiceHistory: PracticeEvent[] = []
  private readonly feedbackLog: FeedbackRecord[] = []

  // Difficulty calibration: per-domain offset applied to recommendations
  private readonly difficultyOffset: Map<string, number> = new Map()

  // Stat counters
  private totalPathsGenerated = 0
  private totalGapsDetected = 0
  private totalReviewsRecommended = 0

  constructor(config?: Partial<CurriculumOptimizerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ── 1. Skill Registration ─────────────────────────────────────────────────

  /**
   * Register a new skill / topic in the curriculum.
   * Returns the created Skill with a generated id.
   */
  registerSkill(
    name: string,
    domain: string,
    difficulty: number,
    prerequisites: string[] = [],
    description = '',
  ): Skill {
    if (this.skills.size >= this.config.maxSkills) {
      throw new Error(`Skill limit reached (${this.config.maxSkills})`)
    }

    const id = generateId('sk')
    const skill: Skill = {
      id,
      name,
      domain,
      difficulty: clamp(difficulty, 0, 1),
      prerequisites: this.config.enablePrerequisites ? [...prerequisites] : [],
      description,
      createdAt: Date.now(),
    }

    this.skills.set(id, skill)
    this.nameIndex.set(name.toLowerCase(), id)
    return skill
  }

  /** Retrieve a skill by id. */
  getSkill(skillId: string): Skill | null {
    return this.skills.get(skillId) ?? null
  }

  /** Return all registered skills. */
  getAllSkills(): Skill[] {
    return [...this.skills.values()]
  }

  // ── 2. Mastery Tracking ───────────────────────────────────────────────────

  /**
   * Record a practice session for a skill.
   * `score` is 0–1 representing performance quality.
   * Updates mastery using exponential moving average.
   */
  recordPractice(skillId: string, score: number): SkillMastery {
    const skill = this.skills.get(skillId)
    if (!skill) throw new Error(`Unknown skill: ${skillId}`)

    const s = clamp(score, 0, 1)
    const now = Date.now()

    this.practiceHistory.push({ skillId, score: s, timestamp: now })

    let mastery = this.masteryStore.get(skillId)
    if (!mastery) {
      mastery = {
        skillId,
        mastery: 0,
        practiceCount: 0,
        lastPracticed: now,
        firstPracticed: now,
        streak: 0,
        bestScore: 0,
      }
      this.masteryStore.set(skillId, mastery)
    }

    // Exponential moving average: heavier weight for recent scores
    const alpha = 0.3
    mastery.mastery = round2(clamp(mastery.mastery * (1 - alpha) + s * alpha, 0, 1))
    mastery.practiceCount += 1
    mastery.lastPracticed = now
    mastery.bestScore = Math.max(mastery.bestScore, s)

    // Update streak
    mastery.streak = s >= 0.5 ? mastery.streak + 1 : 0

    // Difficulty calibration: if learner consistently over- or under-performs
    if (this.config.enableDifficultyCalibration) {
      this.calibrateDifficulty(skill.domain, s, skill.difficulty)
    }

    return { ...mastery }
  }

  /** Get the mastery record for a skill, or null if never practised. */
  getMastery(skillId: string): SkillMastery | null {
    const m = this.masteryStore.get(skillId)
    return m ? { ...m } : null
  }

  // ── 3. Prerequisite Graph ─────────────────────────────────────────────────

  /**
   * Compute the full prerequisite chain for a skill via depth-first traversal.
   * Returns skill ids in topologically-sorted order (dependencies first).
   */
  getPrerequisiteChain(skillId: string): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const dfs = (id: string): void => {
      if (visited.has(id)) return
      visited.add(id)
      const skill = this.skills.get(id)
      if (!skill) return
      for (const prereqId of skill.prerequisites) {
        dfs(prereqId)
      }
      result.push(id)
    }

    const skill = this.skills.get(skillId)
    if (!skill) return []

    // Traverse prerequisites only (exclude the target itself from prerequisites)
    for (const prereqId of skill.prerequisites) {
      dfs(prereqId)
    }

    return result
  }

  /**
   * Full topological sort of all skills (Kahn's algorithm).
   * Used internally for ordering learning paths.
   */
  private topologicalSort(skillIds: Set<string>): string[] {
    // Build in-degree map and adjacency list within the subset
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    for (const id of skillIds) {
      if (!inDegree.has(id)) inDegree.set(id, 0)
      if (!adjacency.has(id)) adjacency.set(id, [])
    }

    for (const id of skillIds) {
      const skill = this.skills.get(id)
      if (!skill) continue
      for (const prereq of skill.prerequisites) {
        if (!skillIds.has(prereq)) continue
        adjacency.get(prereq)!.push(id)
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
      }
    }

    // BFS from nodes with in-degree 0
    const queue: string[] = []
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id)
    }

    const sorted: string[] = []
    while (queue.length > 0) {
      // Pick easiest skill first among candidates for optimal learning order
      queue.sort((a, b) => {
        const sa = this.skills.get(a)
        const sb = this.skills.get(b)
        return (sa?.difficulty ?? 0) - (sb?.difficulty ?? 0)
      })
      const current = queue.shift()!
      sorted.push(current)

      for (const neighbor of adjacency.get(current) ?? []) {
        const newDeg = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, newDeg)
        if (newDeg === 0) queue.push(neighbor)
      }
    }

    return sorted
  }

  // ── 4. Knowledge Gap Detection ────────────────────────────────────────────

  /**
   * Detect knowledge gaps — skills where mastery is below what's required.
   * If `targetSkillId` is provided, only gaps relevant to reaching that skill
   * are returned. Otherwise all weak spots across the curriculum are reported.
   */
  detectGaps(targetSkillId?: string): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = []

    const relevantSkills: string[] = targetSkillId
      ? [...this.getPrerequisiteChain(targetSkillId), targetSkillId]
      : [...this.skills.keys()]

    for (const skillId of relevantSkills) {
      const skill = this.skills.get(skillId)
      if (!skill) continue

      const mastery = this.masteryStore.get(skillId)
      const currentMastery = mastery?.mastery ?? 0

      // Determine required mastery: prerequisites need minMasteryForPrereq,
      // the target itself needs a higher bar (0.8).
      const isPrereq = targetSkillId ? skillId !== targetSkillId : false
      const requiredMastery = isPrereq ? this.config.minMasteryForPrereq : 0.8

      if (currentMastery < requiredMastery) {
        // Find which downstream skills are blocked by this gap
        const blocked = this.findBlockedSkills(skillId)
        const deficit = requiredMastery - currentMastery

        gaps.push({
          skillId,
          currentMastery: round2(currentMastery),
          requiredMastery: round2(requiredMastery),
          priority: this.classifyGapPriority(deficit, blocked.length),
          blockedSkills: blocked,
        })
      }
    }

    this.totalGapsDetected += gaps.length
    return gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /** Find all skills that list `skillId` as a prerequisite. */
  private findBlockedSkills(skillId: string): string[] {
    const blocked: string[] = []
    for (const [id, skill] of this.skills) {
      if (skill.prerequisites.includes(skillId)) {
        blocked.push(id)
      }
    }
    return blocked
  }

  /** Classify a gap's priority based on deficit size and blocked count. */
  private classifyGapPriority(
    deficit: number,
    blockedCount: number,
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (deficit > 0.6 || blockedCount >= 3) return 'critical'
    if (deficit > 0.4 || blockedCount >= 2) return 'high'
    if (deficit > 0.2 || blockedCount >= 1) return 'medium'
    return 'low'
  }

  // ── 5. Learning Path Generation ───────────────────────────────────────────

  /**
   * Generate an optimal learning path from the learner's current state
   * to mastery of the target skill. The path respects prerequisite order
   * and skips skills the learner has already mastered.
   */
  generateLearningPath(targetSkillId: string): LearningPath {
    const target = this.skills.get(targetSkillId)
    if (!target) throw new Error(`Unknown skill: ${targetSkillId}`)

    // Collect all skills needed: prerequisites + target
    const prereqChain = this.getPrerequisiteChain(targetSkillId)
    const allNeeded = new Set<string>([...prereqChain, targetSkillId])

    // Filter out already-mastered skills (mastery >= minMasteryForPrereq for
    // prerequisites, >= 0.8 for the target)
    const unmastered = new Set<string>()
    for (const id of allNeeded) {
      const m = this.masteryStore.get(id)?.mastery ?? 0
      const threshold = id === targetSkillId ? 0.8 : this.config.minMasteryForPrereq
      if (m < threshold) unmastered.add(id)
    }

    // Topological sort of unmastered skills
    const ordered = this.topologicalSort(unmastered)

    // Build learning steps
    const steps: LearningStep[] = ordered.map(id => {
      const skill = this.skills.get(id)!
      const currentMastery = this.masteryStore.get(id)?.mastery ?? 0
      const targetMastery = id === targetSkillId ? 0.8 : this.config.minMasteryForPrereq
      const calibrated = this.getCalibratedDifficulty(skill)
      const effort = this.estimateEffort(calibrated, currentMastery, targetMastery)

      return {
        skillId: id,
        skillName: skill.name,
        difficulty: round2(calibrated),
        currentMastery: round2(currentMastery),
        targetMastery: round2(targetMastery),
        isPrerequisite: id !== targetSkillId,
        estimatedEffort: round2(effort),
      }
    })

    const totalDuration = steps.reduce((sum, s) => sum + s.estimatedEffort, 0)

    // Confidence = how likely the path leads to mastery,
    // based on average current mastery and prerequisite completeness
    const avgCurrent =
      steps.length > 0 ? steps.reduce((s, st) => s + st.currentMastery, 0) / steps.length : 0
    const confidence = round2(clamp(0.5 + avgCurrent * 0.4 + (steps.length > 0 ? 0.1 : 0), 0, 1))

    this.totalPathsGenerated += 1

    return {
      targetSkill: targetSkillId,
      steps,
      estimatedDuration: round2(totalDuration),
      totalSkills: steps.length,
      confidence,
    }
  }

  /** Hours required for full mastery of an easiest-difficulty skill. */
  private static readonly BASE_HOURS_TO_MASTERY = 10

  /**
   * Estimate effort (in hours) to go from currentMastery to targetMastery
   * at the given difficulty level.
   */
  private estimateEffort(
    difficulty: number,
    currentMastery: number,
    targetMastery: number,
  ): number {
    const gap = Math.max(0, targetMastery - currentMastery)
    // Harder skills take disproportionately more time
    const difficultyMultiplier = 1 + difficulty * 2
    return gap * difficultyMultiplier * CurriculumOptimizer.BASE_HOURS_TO_MASTERY
  }

  /** Apply calibration offset to a skill's raw difficulty. */
  private getCalibratedDifficulty(skill: Skill): number {
    if (!this.config.enableDifficultyCalibration) return skill.difficulty
    const offset = this.difficultyOffset.get(skill.domain) ?? 0
    return clamp(skill.difficulty + offset, 0, 1)
  }

  // ── 6. Difficulty Calibration ─────────────────────────────────────────────

  /**
   * Adjust difficulty perception based on learner performance.
   * If the learner consistently outperforms, difficulties feel lower;
   * if they struggle, difficulties feel higher.
   */
  private calibrateDifficulty(domain: string, score: number, nominalDifficulty: number): void {
    // Linear inverse model: difficulty 0 → expected score 1, difficulty 1 → expected score 0
    const expected = 1 - nominalDifficulty
    const surprise = score - expected // positive = outperformed
    const rate = this.config.difficultyAdjustRate

    const current = this.difficultyOffset.get(domain) ?? 0
    // If learner beats expectations, lower perceived difficulty (negative offset)
    const updated = current - surprise * rate
    this.difficultyOffset.set(domain, round2(clamp(updated, -0.3, 0.3)))
  }

  // ── 7. Spaced Repetition ──────────────────────────────────────────────────

  /**
   * Generate review recommendations based on the Ebbinghaus forgetting curve.
   *
   * Retention ≈ e^(−t / S) where:
   *   t = time since last practice (hours)
   *   S = stability (increases with mastery, practice count, and streak)
   *
   * Skills with expected retention below 0.7 are recommended for review,
   * prioritized by urgency.
   */
  getReviewRecommendations(limit = 10): ReviewRecommendation[] {
    if (!this.config.enableSpacedRepetition) return []

    const now = Date.now()
    const recommendations: ReviewRecommendation[] = []

    for (const [skillId, mastery] of this.masteryStore) {
      const skill = this.skills.get(skillId)
      if (!skill) continue

      const hoursSincePractice = (now - mastery.lastPracticed) / (1000 * 60 * 60)
      const daysSincePractice = hoursSincePractice / 24

      // Stability grows with mastery, practice count, and streak
      const stability =
        this.config.spacedRepetitionBase *
        (1 + mastery.mastery * 2) *
        (1 + Math.log2(mastery.practiceCount + 1)) *
        (1 + mastery.streak * 0.1)

      // Ebbinghaus forgetting curve
      const retention = Math.exp(-hoursSincePractice / stability)

      if (retention < 0.7) {
        const urgency = round2(clamp(1 - retention, 0, 1))

        let reason: string
        if (retention < 0.3) {
          reason = 'Significant decay — review urgently to avoid relearning'
        } else if (retention < 0.5) {
          reason = 'Noticeable decay — review soon to reinforce memory'
        } else {
          reason = 'Mild decay — optimal time for spaced review'
        }

        recommendations.push({
          skillId,
          skillName: skill.name,
          urgency,
          daysSinceLastPractice: round2(daysSincePractice),
          expectedRetention: round2(retention),
          reason,
        })
      }
    }

    this.totalReviewsRecommended += recommendations.length

    return recommendations.sort((a, b) => b.urgency - a.urgency).slice(0, limit)
  }

  // ── 8. Learning Velocity ──────────────────────────────────────────────────

  /**
   * Compute learning velocity — how fast the learner acquires skills.
   * If `domain` is given, scopes to that domain; otherwise computes globally.
   */
  getLearningVelocity(domain?: string): LearningVelocity {
    if (!this.config.enableVelocityTracking) {
      return { domain: domain ?? 'all', skillsPerHour: 0, avgTimeToMastery: 0, trend: 'stable' }
    }

    // Gather mastered skills (mastery >= minMasteryForPrereq)
    const masteredEntries: { skillId: string; firstPracticed: number; lastPracticed: number }[] = []

    for (const [skillId, mastery] of this.masteryStore) {
      if (mastery.mastery < this.config.minMasteryForPrereq) continue

      if (domain) {
        const skill = this.skills.get(skillId)
        if (!skill || skill.domain !== domain) continue
      }

      masteredEntries.push({
        skillId,
        firstPracticed: mastery.firstPracticed,
        lastPracticed: mastery.lastPracticed,
      })
    }

    if (masteredEntries.length === 0) {
      return { domain: domain ?? 'all', skillsPerHour: 0, avgTimeToMastery: 0, trend: 'stable' }
    }

    // Average time to mastery
    const timesToMastery = masteredEntries.map(
      e => (e.lastPracticed - e.firstPracticed) / (1000 * 60 * 60),
    )
    const avgTime = timesToMastery.reduce((s, t) => s + t, 0) / timesToMastery.length

    // Skills per hour: total mastered / total learning span
    const earliest = Math.min(...masteredEntries.map(e => e.firstPracticed))
    const latest = Math.max(...masteredEntries.map(e => e.lastPracticed))
    const totalHours = Math.max((latest - earliest) / (1000 * 60 * 60), 0.01)
    const skillsPerHour = masteredEntries.length / totalHours

    // Trend: compare first-half vs second-half acquisition rates
    const trend = this.computeTrend(masteredEntries)

    return {
      domain: domain ?? 'all',
      skillsPerHour: round2(skillsPerHour),
      avgTimeToMastery: round2(avgTime),
      trend,
    }
  }

  /** Compare acquisition speed in the first vs second half to determine trend. */
  private computeTrend(
    entries: { firstPracticed: number }[],
  ): 'improving' | 'stable' | 'declining' {
    if (entries.length < 4) return 'stable'

    const sorted = [...entries].sort((a, b) => a.firstPracticed - b.firstPracticed)
    const mid = Math.floor(sorted.length / 2)

    const firstHalf = sorted.slice(0, mid)
    const secondHalf = sorted.slice(mid)

    const avgFirst = this.avgInterval(firstHalf.map(e => e.firstPracticed))
    const avgSecond = this.avgInterval(secondHalf.map(e => e.firstPracticed))

    if (avgFirst === 0 || avgSecond === 0) return 'stable'

    const ratio = avgSecond / avgFirst
    if (ratio < 0.8) return 'improving' // shorter intervals = faster
    if (ratio > 1.2) return 'declining'
    return 'stable'
  }

  /** Average interval between consecutive timestamps. */
  private avgInterval(timestamps: number[]): number {
    if (timestamps.length < 2) return 0
    let sum = 0
    for (let i = 1; i < timestamps.length; i++) {
      sum += timestamps[i] - timestamps[i - 1]
    }
    return sum / (timestamps.length - 1)
  }

  // ── 9. Feedback & Stats ───────────────────────────────────────────────────

  /**
   * Provide quality feedback for a generated learning path.
   * @param pathId — Identifier for the path (caller's reference).
   * @param quality — A score from 0 (terrible) to 1 (perfect).
   */
  provideFeedback(pathId: string, quality: number): void {
    const q = clamp(quality, 0, 1)
    this.feedbackLog.push({ pathId, quality: q, timestamp: Date.now() })
  }

  /** Return aggregate statistics about the optimizer's activity. */
  getStats(): Readonly<CurriculumOptimizerStats> {
    // Average mastery across all tracked skills
    let masterySum = 0
    let masteryCount = 0
    for (const m of this.masteryStore.values()) {
      masterySum += m.mastery
      masteryCount += 1
    }
    const avgMastery = masteryCount > 0 ? masterySum / masteryCount : 0

    // Average learning velocity across all domains
    const velocity = this.getLearningVelocity()

    // Feedback accuracy: proportion of positive feedback (quality >= 0.5)
    const goodFeedback = this.feedbackLog.filter(f => f.quality >= 0.5).length
    const feedbackAccuracy =
      this.feedbackLog.length > 0 ? goodFeedback / this.feedbackLog.length : 0

    return {
      totalSkills: this.skills.size,
      totalPathsGenerated: this.totalPathsGenerated,
      totalGapsDetected: this.totalGapsDetected,
      totalReviewsRecommended: this.totalReviewsRecommended,
      totalFeedbacks: this.feedbackLog.length,
      avgMastery: round2(avgMastery),
      avgLearningVelocity: velocity.skillsPerHour,
      feedbackAccuracy: round2(feedbackAccuracy),
    }
  }

  /** Return a read-only copy of the active configuration. */
  getConfig(): CurriculumOptimizerConfig {
    return { ...this.config }
  }

  /** Reset all state — skills, mastery, history, and statistics. */
  reset(): void {
    this.skills.clear()
    this.nameIndex.clear()
    this.masteryStore.clear()
    this.practiceHistory.length = 0
    this.feedbackLog.length = 0
    this.difficultyOffset.clear()
    this.totalPathsGenerated = 0
    this.totalGapsDetected = 0
    this.totalReviewsRecommended = 0
  }
}
