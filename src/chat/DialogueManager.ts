/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Dialogue Manager — State Tracking & Conversation Management                 ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Turn Management — Multi-turn dialogue history and navigation            ║
 * ║    ✦ Dialogue State Tracking — Slot filling, act classification, context     ║
 * ║    ✦ Goal Tracking — Conversation goals with completion monitoring           ║
 * ║    ✦ Conversation Flow — Graph-based flow control with transitions           ║
 * ║    ✦ Policy Engine — Rule-based next-action decisions                        ║
 * ║    ✦ Repair Strategies — Misunderstanding detection and recovery             ║
 * ║    ✦ Engagement Metrics — Cohesion, engagement, topic segmentation           ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface DialogueManagerConfig {
  maxTurns: number                // max turns to retain in history (default 200)
  maxGoals: number                // max concurrent goals (default 20)
  slotConfidenceThreshold: number // min confidence for slot fill (default 0.5)
  topicChangeThreshold: number    // cosine distance for topic change (default 0.4)
  engagementDecay: number         // decay factor for engagement score (default 0.9)
  repairMaxAttempts: number       // max repair attempts before escalation (default 3)
  flowTimeoutMs: number           // ms before a flow node times out (default 30000)
}

export type DialogueActType =
  | 'inform'
  | 'request'
  | 'confirm'
  | 'deny'
  | 'greet'
  | 'bye'
  | 'thank'
  | 'apologize'
  | 'clarify'
  | 'repeat'
  | 'correct'
  | 'acknowledge'
  | 'unknown'

export interface DialogueAct {
  type: DialogueActType
  confidence: number
  entities: Record<string, string>
  raw: string
}

export interface DialogueTurn {
  id: string
  role: 'user' | 'system'
  text: string
  act: DialogueAct
  timestamp: number
  metadata: Record<string, unknown>
}

export interface DialogueSlot {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'date'
  required: boolean
  prompt: string               // question to ask when slot is missing
  enumValues?: string[]        // valid values for enum type
  value: unknown | null
  confidence: number
  filledAt: number | null
}

export interface SlotFillingResult {
  filled: string[]
  missing: string[]
  ambiguous: string[]
  complete: boolean
}

export interface DialogueGoal {
  id: string
  name: string
  description: string
  requiredSlots: string[]
  completionCondition: string  // human-readable condition
  priority: number             // 0 = low, 1 = high
  status: 'active' | 'completed' | 'failed' | 'suspended'
  progress: number             // 0-1
  createdAt: number
  completedAt: number | null
}

export interface FlowTransition {
  from: string
  to: string
  condition: string            // label for the transition condition
  priority: number
}

export interface ConversationFlow {
  id: string
  name: string
  nodes: string[]
  transitions: FlowTransition[]
  startNode: string
  endNodes: string[]
  currentNode: string
  startedAt: number
  metadata: Record<string, unknown>
}

export interface DialoguePolicy {
  id: string
  name: string
  rules: PolicyRule[]
  priority: number
}

export interface DialogueState {
  turnCount: number
  currentAct: DialogueActType
  filledSlots: Record<string, unknown>
  activeGoals: string[]
  currentFlowNode: string | null
  context: Record<string, unknown>
  lastUpdated: number
}

export interface DialogueManagerStats {
  totalTurns: number
  userTurns: number
  systemTurns: number
  avgTurnLength: number
  totalGoals: number
  completedGoals: number
  activeGoals: number
  filledSlotCount: number
  totalSlotCount: number
  topicChanges: number
  engagementScore: number
  flowCount: number
}

// ── Internal Types ───────────────────────────────────────────────────────

interface PolicyRule {
  condition: string
  action: string
  response: string
}

interface TopicSegment {
  startTurn: number
  endTurn: number
  topic: string
  keywords: string[]
}

interface RepairSuggestion {
  type: 'rephrase' | 'confirm' | 'disambiguate' | 'escalate'
  message: string
  confidence: number
}

// ── Constants ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: DialogueManagerConfig = {
  maxTurns: 200,
  maxGoals: 20,
  slotConfidenceThreshold: 0.5,
  topicChangeThreshold: 0.4,
  engagementDecay: 0.9,
  repairMaxAttempts: 3,
  flowTimeoutMs: 30_000,
};

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'is', 'are', 'was', 'were', 'been', 'has', 'had', 'did', 'does', 'am',
]);

/** Patterns used by dialogue act classification. */
const ACT_PATTERNS: Array<{ type: DialogueActType; patterns: RegExp[] }> = [
  {
    type: 'greet',
    patterns: [/\b(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i],
  },
  {
    type: 'bye',
    patterns: [/\b(bye|goodbye|see\s+you|farewell|take\s+care)\b/i],
  },
  {
    type: 'thank',
    patterns: [/\b(thanks?|thank\s+you|appreciate|grateful)\b/i],
  },
  {
    type: 'apologize',
    patterns: [/\b(sorry|apologi[sz]e|my\s+bad|excuse\s+me)\b/i],
  },
  {
    type: 'confirm',
    patterns: [/\b(yes|yeah|yep|correct|right|exactly|sure|absolutely|affirmative)\b/i],
  },
  {
    type: 'deny',
    patterns: [/\b(no|nope|nah|wrong|incorrect|negative|not\s+really)\b/i],
  },
  {
    type: 'request',
    patterns: [
      /\b(can\s+you|could\s+you|please|would\s+you|tell\s+me|show\s+me|help)\b/i,
      /\bwh(at|ere|en|o|y|ich|ose)\b.*\?/i,
      /\bhow\b.*\?/i,
    ],
  },
  {
    type: 'clarify',
    patterns: [
      /\b(what\s+do\s+you\s+mean|clarify|explain|elaborate|could\s+you\s+be\s+more\s+specific)\b/i,
    ],
  },
  {
    type: 'repeat',
    patterns: [/\b(repeat|say\s+that\s+again|come\s+again|pardon|what\s+was\s+that)\b/i],
  },
  {
    type: 'correct',
    patterns: [
      /\b(actually|correction|i\s+meant|let\s+me\s+correct|no\s*,?\s*i\s+(said|mean))\b/i,
    ],
  },
  {
    type: 'acknowledge',
    patterns: [/\b(ok|okay|alright|got\s+it|understood|i\s+see|makes\s+sense)\b/i],
  },
  {
    type: 'inform',
    patterns: [/\b(my|i\s+am|i'm|it\s+is|it's|the\s+\w+\s+is)\b/i],
  },
];

/** Monotonically increasing counter for unique turn IDs. */
let turnCounter = 0;

/** Generate a unique turn ID. */
function generateTurnId(): string {
  turnCounter += 1;
  return `turn_${Date.now().toString(36)}_${turnCounter.toString(36)}`;
}

/** Generate a unique goal ID. */
let goalCounter = 0;
function generateGoalId(): string {
  goalCounter += 1;
  return `goal_${Date.now().toString(36)}_${goalCounter.toString(36)}`;
}

/** Tokenize text into lowercase words, filtering stop words. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

/** Cosine similarity between two token frequency maps. */
function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, freqA] of a) {
    normA += freqA * freqA;
    const freqB = b.get(term) ?? 0;
    dotProduct += freqA * freqB;
  }
  for (const freqB of b.values()) {
    normB += freqB * freqB;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dotProduct / denom : 0;
}

/** Build token frequency map from text. */
function buildFrequencyMap(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

/** Extract key-value entities from text using simple patterns. */
function extractEntities(text: string): Record<string, string> {
  const entities: Record<string, string> = {};
  const lower = text.toLowerCase();

  // Pattern: "my <slot> is <value>"
  const myPattern = /my\s+(\w+)\s+is\s+([^,.!?]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = myPattern.exec(lower)) !== null) {
    entities[match[1].trim()] = match[2].trim();
  }

  // Pattern: "<slot>: <value>"
  const colonPattern = /(\w+)\s*:\s*([^,.!?\n]+)/g;
  while ((match = colonPattern.exec(lower)) !== null) {
    entities[match[1].trim()] = match[2].trim();
  }

  // Pattern: "I am <value>" / "I'm <value>"
  const iAmPattern = /i(?:'m|\s+am)\s+([^,.!?]+)/gi;
  while ((match = iAmPattern.exec(lower)) !== null) {
    entities['identity'] = match[1].trim();
  }

  // Email extraction
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) {
    entities['email'] = emailMatch[0];
  }

  // Number extraction
  const numMatch = text.match(/\b\d{1,10}\b/);
  if (numMatch) {
    entities['number'] = numMatch[0];
  }

  return entities;
}

// ── DialogueManager ──────────────────────────────────────────────────────

export class DialogueManager {
  private turns: DialogueTurn[] = [];
  private slots: Map<string, DialogueSlot> = new Map();
  private goals: Map<string, DialogueGoal> = new Map();
  private flows: Map<string, ConversationFlow> = new Map();
  private policies: Map<string, DialoguePolicy> = new Map();
  private topicSegments: TopicSegment[] = [];
  private repairAttempts: number = 0;
  private config: DialogueManagerConfig;

  constructor(config: Partial<DialogueManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Turn Management ─────────────────────────────────────────────────

  /** Add a new turn to the dialogue history and update internal state. */
  addTurn(role: 'user' | 'system', text: string, metadata: Record<string, unknown> = {}): DialogueTurn {
    const act = this.classifyAct(text);
    const turn: DialogueTurn = {
      id: generateTurnId(),
      role,
      text,
      act,
      timestamp: Date.now(),
      metadata,
    };

    this.turns.push(turn);

    // Enforce max turns
    if (this.turns.length > this.config.maxTurns) {
      this.turns = this.turns.slice(this.turns.length - this.config.maxTurns);
    }

    // Attempt to fill slots from user turns
    if (role === 'user') {
      this.autoFillSlots(text);
      this.detectAndRecordTopicChange(turn);
    }

    return turn;
  }

  /** Get all turns in chronological order. */
  getTurns(): DialogueTurn[] {
    return [...this.turns];
  }

  /** Get the most recent turn, or null if no turns exist. */
  getLatestTurn(): DialogueTurn | null {
    return this.turns.length > 0 ? this.turns[this.turns.length - 1] : null;
  }

  /** Get turns filtered by role. */
  getTurnsByRole(role: 'user' | 'system'): DialogueTurn[] {
    return this.turns.filter(t => t.role === role);
  }

  /** Get the last N turns. */
  getRecentTurns(count: number): DialogueTurn[] {
    return this.turns.slice(-Math.max(0, count));
  }

  /** Get a specific turn by ID. */
  getTurnById(id: string): DialogueTurn | null {
    return this.turns.find(t => t.id === id) ?? null;
  }

  // ── Dialogue State Tracking ─────────────────────────────────────────

  /** Get the current dialogue state snapshot. */
  getState(): DialogueState {
    const latestAct = this.turns.length > 0
      ? this.turns[this.turns.length - 1].act.type
      : 'unknown' as DialogueActType;

    const filledSlots: Record<string, unknown> = {};
    for (const [name, slot] of this.slots) {
      if (slot.value !== null) {
        filledSlots[name] = slot.value;
      }
    }

    const activeGoals = Array.from(this.goals.values())
      .filter(g => g.status === 'active')
      .map(g => g.id);

    const activeFlow = this.getActiveFlow();

    return {
      turnCount: this.turns.length,
      currentAct: latestAct,
      filledSlots,
      activeGoals,
      currentFlowNode: activeFlow?.currentNode ?? null,
      context: this.buildContext(),
      lastUpdated: Date.now(),
    };
  }

  /** Update dialogue state with partial overrides applied to context. */
  updateState(updates: Record<string, unknown>): DialogueState {
    // Apply updates to the next getState() call by storing context overrides
    const latestTurn = this.getLatestTurn();
    if (latestTurn) {
      latestTurn.metadata = { ...latestTurn.metadata, ...updates };
    }
    return this.getState();
  }

  /** Reset dialogue state, clearing turns, slots, and goals. */
  resetState(): void {
    this.turns = [];
    for (const slot of this.slots.values()) {
      slot.value = null;
      slot.confidence = 0;
      slot.filledAt = null;
    }
    for (const goal of this.goals.values()) {
      if (goal.status === 'active') {
        goal.status = 'failed';
      }
    }
    this.topicSegments = [];
    this.repairAttempts = 0;
  }

  // ── Dialogue Act Classification ─────────────────────────────────────

  /** Classify the dialogue act of a given utterance. */
  classifyAct(text: string): DialogueAct {
    const entities = extractEntities(text);
    let bestType: DialogueActType = 'unknown';
    let bestConfidence = 0;

    for (const { type, patterns } of ACT_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          // Compute confidence based on pattern specificity and text length
          const matchResult = text.match(pattern);
          const matchLen = matchResult ? matchResult[0].length : 0;
          const confidence = Math.min(1, 0.5 + (matchLen / Math.max(text.length, 1)) * 0.5);

          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestType = type;
          }
        }
      }
    }

    // Boost confidence if entities are found with 'inform' act
    if (bestType === 'inform' && Object.keys(entities).length > 0) {
      bestConfidence = Math.min(1, bestConfidence + 0.1);
    }

    // Short utterances with no match default to 'unknown' with low confidence
    if (bestType === 'unknown') {
      bestConfidence = 0.1;
    }

    return {
      type: bestType,
      confidence: Math.round(bestConfidence * 1000) / 1000,
      entities,
      raw: text,
    };
  }

  // ── Slot Filling ────────────────────────────────────────────────────

  /** Define slots for the current dialogue task. */
  defineSlots(slots: Array<Omit<DialogueSlot, 'value' | 'confidence' | 'filledAt'>>): void {
    for (const slotDef of slots) {
      this.slots.set(slotDef.name, {
        ...slotDef,
        value: null,
        confidence: 0,
        filledAt: null,
      });
    }
  }

  /** Attempt to fill slots from a user utterance. Returns a summary of results. */
  fillSlots(text: string): SlotFillingResult {
    const entities = extractEntities(text);
    const lower = text.toLowerCase().trim();
    const filled: string[] = [];
    const missing: string[] = [];
    const ambiguous: string[] = [];

    for (const [name, slot] of this.slots) {
      if (slot.value !== null && slot.confidence >= this.config.slotConfidenceThreshold) {
        filled.push(name);
        continue;
      }

      const result = this.attemptSlotFill(slot, lower, entities);
      if (result.value !== null) {
        if (result.confidence >= this.config.slotConfidenceThreshold) {
          slot.value = result.value;
          slot.confidence = result.confidence;
          slot.filledAt = Date.now();
          filled.push(name);
        } else {
          ambiguous.push(name);
        }
      } else {
        missing.push(name);
      }
    }

    return {
      filled,
      missing,
      ambiguous,
      complete: missing.length === 0 && ambiguous.length === 0,
    };
  }

  /** Get all slots that still need to be filled. */
  getMissingSlots(): DialogueSlot[] {
    const result: DialogueSlot[] = [];
    for (const slot of this.slots.values()) {
      if (slot.required && (slot.value === null || slot.confidence < this.config.slotConfidenceThreshold)) {
        result.push({ ...slot });
      }
    }
    return result;
  }

  /** Get all slots that have been filled. */
  getFilledSlots(): DialogueSlot[] {
    const result: DialogueSlot[] = [];
    for (const slot of this.slots.values()) {
      if (slot.value !== null && slot.confidence >= this.config.slotConfidenceThreshold) {
        result.push({ ...slot });
      }
    }
    return result;
  }

  /** Get a specific slot by name. */
  getSlot(name: string): DialogueSlot | null {
    const slot = this.slots.get(name);
    return slot ? { ...slot } : null;
  }

  /** Manually set a slot value. */
  setSlot(name: string, value: unknown, confidence: number = 1.0): void {
    const slot = this.slots.get(name);
    if (!slot) return;
    slot.value = value;
    slot.confidence = Math.min(1, Math.max(0, confidence));
    slot.filledAt = Date.now();
  }

  /** Clear a specific slot. */
  clearSlot(name: string): void {
    const slot = this.slots.get(name);
    if (!slot) return;
    slot.value = null;
    slot.confidence = 0;
    slot.filledAt = null;
  }

  // ── Goal Tracking ───────────────────────────────────────────────────

  /** Add a new conversation goal. */
  addGoal(
    name: string,
    description: string,
    requiredSlots: string[] = [],
    priority: number = 0.5,
  ): DialogueGoal {
    if (this.goals.size >= this.config.maxGoals) {
      // Evict lowest-priority completed goal, or oldest completed goal
      const completed = Array.from(this.goals.values())
        .filter(g => g.status === 'completed' || g.status === 'failed')
        .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
      if (completed.length > 0) {
        this.goals.delete(completed[0].id);
      }
    }

    const goal: DialogueGoal = {
      id: generateGoalId(),
      name,
      description,
      requiredSlots,
      completionCondition: requiredSlots.length > 0
        ? `All required slots filled: ${requiredSlots.join(', ')}`
        : 'Manual completion',
      priority: Math.min(1, Math.max(0, priority)),
      status: 'active',
      progress: 0,
      createdAt: Date.now(),
      completedAt: null,
    };

    this.goals.set(goal.id, goal);
    this.updateGoalProgress(goal);
    return goal;
  }

  /** Get all goals. */
  getGoals(): DialogueGoal[] {
    return Array.from(this.goals.values());
  }

  /** Check if a specific goal is complete. */
  isGoalComplete(goalId: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    this.updateGoalProgress(goal);
    return goal.status === 'completed';
  }

  /** Get all currently active goals. */
  getActiveGoals(): DialogueGoal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'active');
  }

  /** Manually mark a goal as completed. */
  completeGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (!goal || goal.status !== 'active') return;
    goal.status = 'completed';
    goal.progress = 1;
    goal.completedAt = Date.now();
  }

  /** Suspend a goal temporarily. */
  suspendGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (!goal || goal.status !== 'active') return;
    goal.status = 'suspended';
  }

  /** Resume a suspended goal. */
  resumeGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (!goal || goal.status !== 'suspended') return;
    goal.status = 'active';
  }

  // ── Conversation Flow ───────────────────────────────────────────────

  /** Define a conversation flow with nodes and transitions. */
  defineFlow(
    name: string,
    nodes: string[],
    transitions: FlowTransition[],
    startNode: string,
    endNodes: string[],
    metadata: Record<string, unknown> = {},
  ): ConversationFlow {
    if (nodes.length === 0 || !nodes.includes(startNode)) {
      throw new Error(`Start node "${startNode}" must be in the nodes list`);
    }
    for (const en of endNodes) {
      if (!nodes.includes(en)) {
        throw new Error(`End node "${en}" must be in the nodes list`);
      }
    }

    const flow: ConversationFlow = {
      id: `flow_${Date.now().toString(36)}_${name.replace(/\s+/g, '_')}`,
      name,
      nodes,
      transitions,
      startNode,
      endNodes,
      currentNode: startNode,
      startedAt: Date.now(),
      metadata,
    };

    this.flows.set(flow.id, flow);
    return flow;
  }

  /**
   * Advance the flow to the next node based on a condition label.
   * Returns the new current node, or null if no valid transition exists.
   */
  advanceFlow(flowId: string, condition: string): string | null {
    const flow = this.flows.get(flowId);
    if (!flow) return null;

    if (flow.endNodes.includes(flow.currentNode)) {
      return null; // already at an end node
    }

    // Find matching transitions from current node, sorted by priority
    const candidates = flow.transitions
      .filter(t => t.from === flow.currentNode && t.condition === condition)
      .sort((a, b) => b.priority - a.priority);

    if (candidates.length === 0) return null;

    const target = candidates[0].to;
    if (!flow.nodes.includes(target)) return null;

    flow.currentNode = target;
    return target;
  }

  /** Get the current node of a specific flow. */
  getCurrentFlowNode(flowId: string): string | null {
    const flow = this.flows.get(flowId);
    return flow?.currentNode ?? null;
  }

  /** Get a specific flow by ID. */
  getFlow(flowId: string): ConversationFlow | null {
    return this.flows.get(flowId) ?? null;
  }

  /** Get the first active (non-ended) flow, or null. */
  getActiveFlow(): ConversationFlow | null {
    for (const flow of this.flows.values()) {
      if (!flow.endNodes.includes(flow.currentNode)) {
        return flow;
      }
    }
    return null;
  }

  /** Check if a flow has reached an end node. */
  isFlowComplete(flowId: string): boolean {
    const flow = this.flows.get(flowId);
    if (!flow) return false;
    return flow.endNodes.includes(flow.currentNode);
  }

  /** Reset a flow to its start node. */
  resetFlow(flowId: string): void {
    const flow = this.flows.get(flowId);
    if (!flow) return;
    flow.currentNode = flow.startNode;
  }

  // ── Context Management ──────────────────────────────────────────────

  /** Build a context object summarizing the current dialogue state. */
  getDialogueContext(): Record<string, unknown> {
    return this.buildContext();
  }

  /** Generate a brief summary of the dialogue so far. */
  summarizeDialogue(): string {
    if (this.turns.length === 0) return 'No dialogue has occurred.';

    const userTurns = this.turns.filter(t => t.role === 'user');
    const systemTurns = this.turns.filter(t => t.role === 'system');

    const parts: string[] = [];
    parts.push(`Dialogue with ${this.turns.length} turns (${userTurns.length} user, ${systemTurns.length} system).`);

    // Act distribution
    const actCounts = new Map<DialogueActType, number>();
    for (const turn of this.turns) {
      actCounts.set(turn.act.type, (actCounts.get(turn.act.type) ?? 0) + 1);
    }
    const topActs = Array.from(actCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([act, count]) => `${act}(${count})`);
    if (topActs.length > 0) {
      parts.push(`Top acts: ${topActs.join(', ')}.`);
    }

    // Slot status
    const filledCount = this.getFilledSlots().length;
    const totalSlots = this.slots.size;
    if (totalSlots > 0) {
      parts.push(`Slots: ${filledCount}/${totalSlots} filled.`);
    }

    // Goal status
    const activeGoals = this.getActiveGoals();
    const completedGoals = Array.from(this.goals.values()).filter(g => g.status === 'completed');
    if (this.goals.size > 0) {
      parts.push(`Goals: ${activeGoals.length} active, ${completedGoals.length} completed.`);
    }

    // Topic segments
    if (this.topicSegments.length > 0) {
      const topics = this.topicSegments.map(s => s.topic);
      const uniqueTopics = [...new Set(topics)];
      parts.push(`Topics discussed: ${uniqueTopics.slice(0, 5).join(', ')}.`);
    }

    return parts.join(' ');
  }

  // ── Policy ──────────────────────────────────────────────────────────

  /** Register a dialogue policy. */
  setPolicy(name: string, rules: PolicyRule[], priority: number = 0.5): DialoguePolicy {
    const policy: DialoguePolicy = {
      id: `policy_${Date.now().toString(36)}_${name.replace(/\s+/g, '_')}`,
      name,
      rules,
      priority: Math.min(1, Math.max(0, priority)),
    };
    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Apply all registered policies to determine the next system action.
   * Returns the best matching rule's response, or a default fallback.
   */
  applyPolicy(): { action: string; response: string; policyName: string } | null {
    if (this.policies.size === 0) return null;

    const state = this.getState();
    const context = this.buildContext();

    // Sort policies by priority descending
    const sortedPolicies = Array.from(this.policies.values())
      .sort((a, b) => b.priority - a.priority);

    for (const policy of sortedPolicies) {
      for (const rule of policy.rules) {
        if (this.evaluateCondition(rule.condition, state, context)) {
          return {
            action: rule.action,
            response: rule.response,
            policyName: policy.name,
          };
        }
      }
    }

    // Default: check for missing required slots
    const missingSlots = this.getMissingSlots();
    if (missingSlots.length > 0) {
      const nextSlot = missingSlots[0];
      return {
        action: 'ask_slot',
        response: nextSlot.prompt,
        policyName: 'default',
      };
    }

    return null;
  }

  // ── Repair Strategies ───────────────────────────────────────────────

  /** Detect if the latest exchange indicates a misunderstanding. */
  detectMisunderstanding(): boolean {
    if (this.turns.length < 2) return false;

    const latest = this.turns[this.turns.length - 1];
    const previous = this.turns[this.turns.length - 2];

    // A user correction or clarification request after a system turn
    if (latest.role === 'user' && previous.role === 'system') {
      if (['correct', 'deny', 'clarify', 'repeat'].includes(latest.act.type)) {
        this.repairAttempts++;
        return true;
      }
    }

    // Repeated unknown acts suggest communication breakdown
    if (latest.act.type === 'unknown' && previous.act.type === 'unknown') {
      this.repairAttempts++;
      return true;
    }

    // Low confidence on consecutive turns
    if (latest.act.confidence < 0.3 && previous.act.confidence < 0.3) {
      this.repairAttempts++;
      return true;
    }

    return false;
  }

  /** Suggest a repair strategy based on the current dialogue state. */
  suggestRepair(): RepairSuggestion {
    if (this.repairAttempts >= this.config.repairMaxAttempts) {
      return {
        type: 'escalate',
        message: 'I seem to be having trouble understanding. Let me connect you with additional help.',
        confidence: 0.9,
      };
    }

    const latest = this.getLatestTurn();
    if (!latest) {
      return {
        type: 'rephrase',
        message: 'Could you please rephrase your request?',
        confidence: 0.5,
      };
    }

    if (latest.act.type === 'clarify' || latest.act.type === 'repeat') {
      // User wants repetition — find last system utterance
      const lastSystem = this.turns.filter(t => t.role === 'system').slice(-1)[0];
      if (lastSystem) {
        return {
          type: 'rephrase',
          message: `Let me rephrase: ${lastSystem.text}`,
          confidence: 0.7,
        };
      }
    }

    if (latest.act.type === 'correct') {
      return {
        type: 'confirm',
        message: 'I understand there was an error. Could you please tell me the correct information?',
        confidence: 0.8,
      };
    }

    // Ambiguous slots — ask for disambiguation
    const missingSlots = this.getMissingSlots();
    if (missingSlots.length > 0) {
      return {
        type: 'disambiguate',
        message: missingSlots[0].prompt,
        confidence: 0.7,
      };
    }

    return {
      type: 'rephrase',
      message: 'I didn\'t quite catch that. Could you please rephrase?',
      confidence: 0.6,
    };
  }

  /** Reset the repair attempt counter. */
  resetRepairAttempts(): void {
    this.repairAttempts = 0;
  }

  // ── Topic Segmentation ──────────────────────────────────────────────

  /** Detect if the latest user turn represents a topic change. */
  detectTopicChange(): boolean {
    const userTurns = this.turns.filter(t => t.role === 'user');
    if (userTurns.length < 2) return false;

    const latest = userTurns[userTurns.length - 1];
    const previous = userTurns[userTurns.length - 2];

    const simScore = cosineSimilarity(
      buildFrequencyMap(latest.text),
      buildFrequencyMap(previous.text),
    );

    return simScore < (1 - this.config.topicChangeThreshold);
  }

  /** Get all detected topic segments. */
  getTopicSegments(): TopicSegment[] {
    return [...this.topicSegments];
  }

  // ── Engagement Metrics ──────────────────────────────────────────────

  /**
   * Compute an engagement score (0–1) based on turn frequency,
   * user response length, and dialogue act variety.
   */
  getEngagementScore(): number {
    if (this.turns.length === 0) return 0;

    const userTurns = this.turns.filter(t => t.role === 'user');
    if (userTurns.length === 0) return 0;

    // Factor 1: Response length trend (longer responses = more engaged)
    const avgLength = userTurns.reduce((sum, t) => sum + t.text.length, 0) / userTurns.length;
    const lengthScore = Math.min(1, avgLength / 100);

    // Factor 2: Turn frequency (recent turns are weighted more)
    let frequencyScore = 0;
    if (userTurns.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < userTurns.length; i++) {
        intervals.push(userTurns[i].timestamp - userTurns[i - 1].timestamp);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      // Quick responses (< 10s) = high engagement, slow (> 60s) = low
      frequencyScore = Math.max(0, Math.min(1, 1 - (avgInterval / 60_000)));
    } else {
      frequencyScore = 0.5;
    }

    // Factor 3: Dialogue act variety (more variety = more complex engagement)
    const actTypes = new Set(userTurns.map(t => t.act.type));
    const varietyScore = Math.min(1, actTypes.size / 5);

    // Factor 4: Proportion of substantive acts vs. unknown
    const substantive = userTurns.filter(t => t.act.type !== 'unknown').length;
    const clarityScore = substantive / userTurns.length;

    // Weighted combination with decay
    const rawScore =
      lengthScore * 0.25 +
      frequencyScore * 0.25 +
      varietyScore * 0.25 +
      clarityScore * 0.25;

    return Math.round(rawScore * 1000) / 1000;
  }

  /**
   * Compute dialogue cohesion (0–1) measuring how well the conversation
   * stays on topic across turns.
   */
  getDialogueCohesion(): number {
    if (this.turns.length < 2) return 1;

    let totalSimilarity = 0;
    let pairs = 0;

    for (let i = 1; i < this.turns.length; i++) {
      const prev = buildFrequencyMap(this.turns[i - 1].text);
      const curr = buildFrequencyMap(this.turns[i].text);
      totalSimilarity += cosineSimilarity(prev, curr);
      pairs++;
    }

    if (pairs === 0) return 1;
    return Math.round((totalSimilarity / pairs) * 1000) / 1000;
  }

  // ── Stats & Persistence ─────────────────────────────────────────────

  /** Return aggregate statistics about the dialogue state. */
  getStats(): DialogueManagerStats {
    const userTurns = this.turns.filter(t => t.role === 'user');
    const systemTurns = this.turns.filter(t => t.role === 'system');
    const totalLength = this.turns.reduce((sum, t) => sum + t.text.length, 0);

    const completedGoals = Array.from(this.goals.values())
      .filter(g => g.status === 'completed').length;
    const activeGoals = Array.from(this.goals.values())
      .filter(g => g.status === 'active').length;

    return {
      totalTurns: this.turns.length,
      userTurns: userTurns.length,
      systemTurns: systemTurns.length,
      avgTurnLength: this.turns.length > 0
        ? Math.round(totalLength / this.turns.length)
        : 0,
      totalGoals: this.goals.size,
      completedGoals,
      activeGoals,
      filledSlotCount: this.getFilledSlots().length,
      totalSlotCount: this.slots.size,
      topicChanges: this.topicSegments.length,
      engagementScore: this.getEngagementScore(),
      flowCount: this.flows.size,
    };
  }

  /** Serialize the entire dialogue manager state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      turns: this.turns,
      slots: Array.from(this.slots.values()),
      goals: Array.from(this.goals.values()),
      flows: Array.from(this.flows.values()),
      policies: Array.from(this.policies.values()),
      topicSegments: this.topicSegments,
      repairAttempts: this.repairAttempts,
    });
  }

  /** Restore a DialogueManager from a previously serialized JSON string. */
  static deserialize(json: string): DialogueManager {
    const data = JSON.parse(json) as {
      config: DialogueManagerConfig
      turns: DialogueTurn[]
      slots: DialogueSlot[]
      goals: DialogueGoal[]
      flows: ConversationFlow[]
      policies: DialoguePolicy[]
      topicSegments: TopicSegment[]
      repairAttempts: number
    };

    const manager = new DialogueManager(data.config);

    if (Array.isArray(data.turns)) {
      manager.turns = data.turns;
    }

    if (Array.isArray(data.slots)) {
      for (const slot of data.slots) {
        manager.slots.set(slot.name, slot);
      }
    }

    if (Array.isArray(data.goals)) {
      for (const goal of data.goals) {
        manager.goals.set(goal.id, goal);
      }
    }

    if (Array.isArray(data.flows)) {
      for (const flow of data.flows) {
        manager.flows.set(flow.id, flow);
      }
    }

    if (Array.isArray(data.policies)) {
      for (const policy of data.policies) {
        manager.policies.set(policy.id, policy);
      }
    }

    if (Array.isArray(data.topicSegments)) {
      manager.topicSegments = data.topicSegments;
    }

    if (typeof data.repairAttempts === 'number') {
      manager.repairAttempts = data.repairAttempts;
    }

    return manager;
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  /** Attempt to auto-fill slots from a user utterance. */
  private autoFillSlots(text: string): void {
    const entities = extractEntities(text);
    const lower = text.toLowerCase().trim();

    for (const [, slot] of this.slots) {
      if (slot.value !== null && slot.confidence >= this.config.slotConfidenceThreshold) {
        continue;
      }
      const result = this.attemptSlotFill(slot, lower, entities);
      if (result.value !== null && result.confidence >= this.config.slotConfidenceThreshold) {
        slot.value = result.value;
        slot.confidence = result.confidence;
        slot.filledAt = Date.now();
      }
    }
  }

  /** Try to extract a slot value from text and entities. */
  private attemptSlotFill(
    slot: DialogueSlot,
    text: string,
    entities: Record<string, string>,
  ): { value: unknown | null; confidence: number } {
    // Direct entity match
    if (entities[slot.name] !== undefined) {
      const raw = entities[slot.name];
      const parsed = this.parseSlotValue(slot, raw);
      if (parsed !== null) {
        return { value: parsed, confidence: 0.85 };
      }
    }

    // Enum matching: check if the text contains any of the valid enum values
    if (slot.type === 'enum' && slot.enumValues) {
      for (const enumVal of slot.enumValues) {
        if (text.includes(enumVal.toLowerCase())) {
          return { value: enumVal, confidence: 0.8 };
        }
      }
    }

    // Boolean detection
    if (slot.type === 'boolean') {
      if (/\b(yes|yeah|yep|true|correct|sure|absolutely)\b/i.test(text)) {
        return { value: true, confidence: 0.75 };
      }
      if (/\b(no|nope|false|incorrect|nah)\b/i.test(text)) {
        return { value: false, confidence: 0.75 };
      }
    }

    // Number detection
    if (slot.type === 'number' && entities['number']) {
      const num = parseFloat(entities['number']);
      if (!isNaN(num)) {
        return { value: num, confidence: 0.7 };
      }
    }

    // Date detection
    if (slot.type === 'date') {
      const dateMatch = text.match(
        /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/,
      );
      if (dateMatch) {
        return { value: dateMatch[1], confidence: 0.7 };
      }
      // Relative dates
      if (/\b(today|tomorrow|yesterday)\b/i.test(text)) {
        const relMatch = text.match(/\b(today|tomorrow|yesterday)\b/i);
        if (relMatch) {
          return { value: relMatch[1].toLowerCase(), confidence: 0.65 };
        }
      }
    }

    // String: if slot name appears in text and there's following content
    if (slot.type === 'string') {
      const nameIdx = text.indexOf(slot.name.toLowerCase());
      if (nameIdx >= 0) {
        const after = text.slice(nameIdx + slot.name.length).trim();
        // Strip leading "is", ":", "=" etc.
        const cleaned = after.replace(/^(is|:|=)\s*/i, '').trim();
        if (cleaned.length > 0 && cleaned.length < 100) {
          const value = cleaned.split(/[,.!?\n]/)[0].trim();
          if (value.length > 0) {
            return { value, confidence: 0.6 };
          }
        }
      }
    }

    return { value: null, confidence: 0 };
  }

  /** Parse a raw string into the appropriate slot type. */
  private parseSlotValue(slot: DialogueSlot, raw: string): unknown | null {
    switch (slot.type) {
      case 'string':
        return raw.trim() || null;
      case 'number': {
        const num = parseFloat(raw);
        return isNaN(num) ? null : num;
      }
      case 'boolean': {
        const lower = raw.toLowerCase().trim();
        if (['true', 'yes', 'yeah', 'yep', '1'].includes(lower)) return true;
        if (['false', 'no', 'nah', 'nope', '0'].includes(lower)) return false;
        return null;
      }
      case 'enum':
        if (slot.enumValues) {
          const lower = raw.toLowerCase().trim();
          const match = slot.enumValues.find(v => v.toLowerCase() === lower);
          return match ?? null;
        }
        return null;
      case 'date':
        return raw.trim() || null;
      default:
        return raw.trim() || null;
    }
  }

  /** Update goal progress based on filled slots. */
  private updateGoalProgress(goal: DialogueGoal): void {
    if (goal.status !== 'active') return;
    if (goal.requiredSlots.length === 0) return;

    let filledCount = 0;
    for (const slotName of goal.requiredSlots) {
      const slot = this.slots.get(slotName);
      if (slot && slot.value !== null && slot.confidence >= this.config.slotConfidenceThreshold) {
        filledCount++;
      }
    }

    goal.progress = filledCount / goal.requiredSlots.length;

    if (goal.progress >= 1) {
      goal.status = 'completed';
      goal.completedAt = Date.now();
    }
  }

  /** Evaluate a simple condition string against current state and context. */
  private evaluateCondition(
    condition: string,
    state: DialogueState,
    context: Record<string, unknown>,
  ): boolean {
    const lower = condition.toLowerCase().trim();

    // "act == <type>"
    const actMatch = lower.match(/^act\s*==\s*(\w+)$/);
    if (actMatch) {
      return state.currentAct === actMatch[1];
    }

    // "slot.<name> == filled"
    const slotFilledMatch = lower.match(/^slot\.(\w+)\s*==\s*filled$/);
    if (slotFilledMatch) {
      return state.filledSlots[slotFilledMatch[1]] !== undefined;
    }

    // "slot.<name> == missing"
    const slotMissingMatch = lower.match(/^slot\.(\w+)\s*==\s*missing$/);
    if (slotMissingMatch) {
      return state.filledSlots[slotMissingMatch[1]] === undefined;
    }

    // "goals.active > N"
    const goalsMatch = lower.match(/^goals\.active\s*>\s*(\d+)$/);
    if (goalsMatch) {
      return state.activeGoals.length > parseInt(goalsMatch[1], 10);
    }

    // "turns > N"
    const turnsMatch = lower.match(/^turns\s*>\s*(\d+)$/);
    if (turnsMatch) {
      return state.turnCount > parseInt(turnsMatch[1], 10);
    }

    // "all_slots_filled"
    if (lower === 'all_slots_filled') {
      return this.getMissingSlots().length === 0 && this.slots.size > 0;
    }

    // "has_missing_slots"
    if (lower === 'has_missing_slots') {
      return this.getMissingSlots().length > 0;
    }

    // "flow == <node>"
    const flowMatch = lower.match(/^flow\s*==\s*(\w+)$/);
    if (flowMatch) {
      return state.currentFlowNode === flowMatch[1];
    }

    // "context.<key> == <value>"
    const contextMatch = lower.match(/^context\.(\w+)\s*==\s*(.+)$/);
    if (contextMatch) {
      const ctxVal = context[contextMatch[1]];
      return String(ctxVal) === contextMatch[2].trim();
    }

    // "always" — catch-all rule
    if (lower === 'always') {
      return true;
    }

    return false;
  }

  /** Build a context object from the current dialogue state. */
  private buildContext(): Record<string, unknown> {
    const context: Record<string, unknown> = {};

    // Recent turn texts for context window
    const recentTurns = this.getRecentTurns(5);
    context['recentUtterances'] = recentTurns.map(t => ({
      role: t.role,
      text: t.text,
      act: t.act.type,
    }));

    // Filled slot values
    const filledSlots: Record<string, unknown> = {};
    for (const [name, slot] of this.slots) {
      if (slot.value !== null) {
        filledSlots[name] = slot.value;
      }
    }
    context['slots'] = filledSlots;

    // Active goals summary
    context['activeGoals'] = this.getActiveGoals().map(g => ({
      name: g.name,
      progress: g.progress,
    }));

    // Current flow state
    const activeFlow = this.getActiveFlow();
    if (activeFlow) {
      context['currentFlow'] = {
        name: activeFlow.name,
        node: activeFlow.currentNode,
      };
    }

    // Topic context
    if (this.topicSegments.length > 0) {
      const latest = this.topicSegments[this.topicSegments.length - 1];
      context['currentTopic'] = latest.topic;
    }

    // Engagement
    context['engagement'] = this.getEngagementScore();

    // Repair state
    context['repairAttempts'] = this.repairAttempts;

    // Metadata from latest turn
    const latest = this.getLatestTurn();
    if (latest && latest.metadata) {
      for (const [key, val] of Object.entries(latest.metadata)) {
        if (!(key in context)) {
          context[key] = val;
        }
      }
    }

    return context;
  }

  /** Detect topic change and record a new segment if one occurred. */
  private detectAndRecordTopicChange(turn: DialogueTurn): void {
    const userTurns = this.turns.filter(t => t.role === 'user');
    if (userTurns.length < 2) {
      // First user turn — create initial segment
      if (userTurns.length === 1) {
        const keywords = tokenize(turn.text).slice(0, 5);
        this.topicSegments.push({
          startTurn: 0,
          endTurn: 0,
          topic: keywords.length > 0 ? keywords.slice(0, 3).join(' / ') : 'general',
          keywords,
        });
      }
      return;
    }

    const previous = userTurns[userTurns.length - 2];
    const simScore = cosineSimilarity(
      buildFrequencyMap(turn.text),
      buildFrequencyMap(previous.text),
    );

    if (simScore < (1 - this.config.topicChangeThreshold)) {
      // Close previous segment
      if (this.topicSegments.length > 0) {
        this.topicSegments[this.topicSegments.length - 1].endTurn = this.turns.length - 2;
      }

      // Open new segment
      const keywords = tokenize(turn.text).slice(0, 5);
      this.topicSegments.push({
        startTurn: this.turns.length - 1,
        endTurn: this.turns.length - 1,
        topic: keywords.length > 0 ? keywords.slice(0, 3).join(' / ') : 'general',
        keywords,
      });
    } else if (this.topicSegments.length > 0) {
      // Extend current segment
      this.topicSegments[this.topicSegments.length - 1].endTurn = this.turns.length - 1;
    }
  }
}
