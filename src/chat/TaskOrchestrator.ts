/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🗂️  T A S K   O R C H E S T R A T O R                              ║
 * ║                                                                             ║
 * ║   Phase 8 "Task Orchestrator" intelligence module for LocalBrain:           ║
 * ║     decompose → plan → execute → track → recover                            ║
 * ║                                                                             ║
 * ║     • Goal Decomposition — Break complex tasks into ordered steps           ║
 * ║     • Execution State Machine — Track task lifecycle transitions            ║
 * ║     • DAG-based Dependencies — Topological ordering with cycle detection    ║
 * ║     • Progress Tracking — Real-time progress reports and milestones         ║
 * ║     • Backtracking & Recovery — Rollback, replan, and retry on failure      ║
 * ║     • Parallel Step Detection — Identify concurrently executable steps      ║
 * ║     • Cross-Turn Persistence — Pause, resume, serialize full state          ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — All data shapes for the task orchestrator                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Configuration ────────────────────────────────────────────────────────────

/** Configuration options for the TaskOrchestrator. */
export interface TaskOrchestratorConfig {
  /** Maximum number of concurrent task plans allowed. */
  maxTasks: number;
  /** Maximum number of steps allowed in a single task plan. */
  maxStepsPerTask: number;
  /** Whether to detect parallelizable step groups. */
  enableParallelDetection: boolean;
  /** Whether backtracking and state rollback are permitted. */
  enableBacktracking: boolean;
  /** Timeout in milliseconds before a running step is considered stuck. */
  stepTimeoutMs: number;
  /** Maximum retry attempts for a failed step. */
  maxRetries: number;
}

/** Aggregate statistics for the TaskOrchestrator instance. */
export interface TaskOrchestratorStats {
  /** Total number of task plans created. */
  totalTasksCreated: number;
  /** Number of task plans completed successfully. */
  totalTasksCompleted: number;
  /** Number of task plans that ended in failure. */
  totalTasksFailed: number;
  /** Total number of individual steps executed across all tasks. */
  totalStepsExecuted: number;
  /** Total number of step retries performed. */
  totalRetries: number;
  /** Total number of backtrack operations performed. */
  totalBacktracks: number;
  /** Total number of replan operations performed. */
  totalReplans: number;
  /** Number of currently active (in-progress) tasks. */
  activeTaskCount: number;
  /** Average number of steps per completed task. */
  avgStepsPerTask: number;
  /** Total feedback entries received. */
  feedbackCount: number;
}

// ── Task State ───────────────────────────────────────────────────────────────

/** Lifecycle state for a task or step. */
export type TaskState =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'skipped';

/** Classification of a step's purpose. */
export type StepType =
  | 'design'
  | 'implement'
  | 'test'
  | 'review'
  | 'configure'
  | 'document'
  | 'analyze'
  | 'deploy'
  | 'debug'
  | 'refactor';

// ── Step & Result ────────────────────────────────────────────────────────────

/** A single executable step within a task plan. */
export interface TaskStep {
  /** Unique identifier for this step. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Detailed description of what this step entails. */
  description: string;
  /** Classification of the step's purpose. */
  type: StepType;
  /** IDs of steps that must complete before this step can begin. */
  dependencies: string[];
  /** Current lifecycle state. */
  state: TaskState;
  /** Estimated complexity from 1 (trivial) to 10 (very complex). */
  estimatedComplexity: number;
  /** Result data populated after step execution. */
  result?: StepResult;
  /** Epoch timestamp when execution began. */
  startedAt?: number;
  /** Epoch timestamp when execution completed or failed. */
  completedAt?: number;
  /** Number of times this step has been retried. */
  retryCount: number;
}

/** Outcome of executing a single step. */
export interface StepResult {
  /** Whether the step succeeded. */
  success: boolean;
  /** Human-readable output or summary. */
  output: string;
  /** Optional list of produced artifact identifiers. */
  artifacts?: string[];
  /** Wall-clock duration in milliseconds. */
  duration: number;
}

// ── Task Plan ────────────────────────────────────────────────────────────────

/** A complete task plan produced by goal decomposition. */
export interface TaskPlan {
  /** Unique identifier for this task plan. */
  id: string;
  /** Short name for the task. */
  name: string;
  /** Longer description of the overall goal. */
  description: string;
  /** Ordered list of steps to execute. */
  steps: TaskStep[];
  /** Epoch timestamp when the plan was created. */
  createdAt: number;
  /** Epoch timestamp of the last modification. */
  updatedAt: number;
  /** Constraints or requirements that guided decomposition. */
  constraints: string[];
}

// ── Status & Progress ────────────────────────────────────────────────────────

/** Full status snapshot for a task plan. */
export interface TaskStatus {
  /** The task plan's identifier. */
  taskId: string;
  /** Aggregate state of the task. */
  state: TaskState;
  /** The step currently being executed, or null if none. */
  currentStep: TaskStep | null;
  /** Number of completed steps. */
  completedSteps: number;
  /** Total number of steps in the plan. */
  totalSteps: number;
  /** Completion percentage (0–100). */
  progressPercent: number;
  /** Human-readable progress summary. */
  summary: string;
  /** Epoch timestamp when the task was started. */
  startedAt: number;
  /** Number of remaining steps that have not completed. */
  estimatedRemainingSteps: number;
}

/** Detailed progress report for a task. */
export interface ProgressReport {
  /** The task plan's identifier. */
  taskId: string;
  /** Short name of the task. */
  taskName: string;
  /** Completion percentage (0–100). */
  progressPercent: number;
  /** Description of the current phase. */
  currentPhase: string;
  /** Names of steps that have been completed. */
  completedSteps: string[];
  /** Names of steps still pending. */
  pendingSteps: string[];
  /** Names of steps blocked by unmet dependencies. */
  blockedSteps: string[];
  /** Milliseconds elapsed since the task was started. */
  timeElapsedMs: number;
  /** Estimated milliseconds until completion (heuristic). */
  estimatedRemainingMs: number;
}

/** Summary information about an active task. */
export interface ActiveTaskInfo {
  /** The task plan's identifier. */
  taskId: string;
  /** Short name of the task. */
  taskName: string;
  /** Aggregate state. */
  state: TaskState;
  /** Completion percentage (0–100). */
  progressPercent: number;
  /** Epoch timestamp of the most recent activity. */
  lastActivity: number;
}

// ── Internal Types ───────────────────────────────────────────────────────────

/**
 * Snapshot of a task plan used for backtracking rollback.
 *
 * A snapshot is taken before each step begins execution. If a failure occurs
 * or the user requests a backtrack, the orchestrator restores the step states
 * from the closest snapshot matching the target step ID.
 */
interface TaskSnapshot {
  /** The step ID that was about to execute when this snapshot was taken. */
  beforeStepId: string;
  /** Deep-cloned steps at snapshot time. */
  steps: TaskStep[];
  /** Epoch timestamp of the snapshot. */
  timestamp: number;
}

/**
 * Internal record for tracking retry backoff per step.
 *
 * Uses exponential backoff: each failed retry doubles the current backoff
 * delay (starting at 1000 ms). Records are keyed by "taskId:stepId" and
 * persist across retries until the step succeeds or exhausts maxRetries.
 */
interface RetryRecord {
  /** Number of attempts so far. */
  attempts: number;
  /** Timestamp of the last retry attempt. */
  lastAttemptAt: number;
  /** Current backoff delay in milliseconds. */
  currentBackoffMs: number;
}

/**
 * Feedback log entry.
 *
 * Records user-provided feedback about orchestrator behaviour. Positive
 * feedback confirms decomposition quality; negative feedback (with an
 * optional message) can inform future template or heuristic tuning.
 */
interface FeedbackEntry {
  /** Epoch timestamp. */
  timestamp: number;
  /** Whether the feedback was positive. */
  correct: boolean;
  /** Optional message accompanying the feedback. */
  message: string;
}

// ── Template Definition ──────────────────────────────────────────────────────

/**
 * A predefined decomposition template for a known task pattern.
 *
 * Templates are matched by scoring keyword overlap between the user's goal
 * description and the template's keyword list. A minimum of 2 keyword
 * matches is required. The highest-scoring template is selected and its
 * step definitions are instantiated with unique IDs and proper dependency wiring.
 */
interface TaskTemplate {
  /** Keywords that trigger this template. */
  keywords: string[];
  /** Human-readable template name. */
  name: string;
  /** Ordered step definitions for this template. */
  steps: Array<{
    name: string;
    description: string;
    type: StepType;
    complexity: number;
    dependsOnIndex: number[];
  }>;
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  ID GENERATION                                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Monotonically increasing counter for unique IDs. */
let idCounter = 0;

/** Generate a deterministic unique identifier with the given prefix. */
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  TASK TEMPLATES — Predefined decomposition patterns                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Library of common task decomposition templates.
 * Each template maps a known task pattern to a sequence of typed steps
 * with dependency relationships and complexity estimates.
 */
const TASK_TEMPLATES: TaskTemplate[] = [
  {
    keywords: ['build', 'rest', 'api', 'endpoint', 'server', 'backend'],
    name: 'Build a REST API',
    steps: [
      { name: 'Design API', description: 'Define endpoints, methods, request/response schemas, and error codes', type: 'design', complexity: 4, dependsOnIndex: [] },
      { name: 'Create models', description: 'Implement data models, validation schemas, and database entities', type: 'implement', complexity: 5, dependsOnIndex: [0] },
      { name: 'Implement routes', description: 'Build route handlers for each endpoint with proper HTTP methods', type: 'implement', complexity: 6, dependsOnIndex: [0, 1] },
      { name: 'Add middleware', description: 'Implement authentication, logging, error handling, and rate limiting middleware', type: 'configure', complexity: 4, dependsOnIndex: [2] },
      { name: 'Write tests', description: 'Create unit and integration tests for all endpoints and edge cases', type: 'test', complexity: 5, dependsOnIndex: [2, 3] },
      { name: 'Code review', description: 'Review implementation for correctness, security, and adherence to standards', type: 'review', complexity: 3, dependsOnIndex: [4] },
    ],
  },
  {
    keywords: ['create', 'component', 'widget', 'ui', 'frontend', 'interface'],
    name: 'Create a component',
    steps: [
      { name: 'Design component', description: 'Define component API, props interface, state management, and visual mockup', type: 'design', complexity: 3, dependsOnIndex: [] },
      { name: 'Implement component', description: 'Build the component logic, lifecycle handling, and event bindings', type: 'implement', complexity: 5, dependsOnIndex: [0] },
      { name: 'Style component', description: 'Apply CSS/styles, responsive layout, accessibility attributes, and theming', type: 'implement', complexity: 3, dependsOnIndex: [1] },
      { name: 'Write tests', description: 'Create unit tests for rendering, interaction, edge cases, and snapshots', type: 'test', complexity: 4, dependsOnIndex: [1, 2] },
      { name: 'Document component', description: 'Write usage docs, prop descriptions, examples, and storybook entries', type: 'document', complexity: 2, dependsOnIndex: [1] },
    ],
  },
  {
    keywords: ['debug', 'fix', 'bug', 'issue', 'error', 'crash', 'broken'],
    name: 'Debug an issue',
    steps: [
      { name: 'Reproduce issue', description: 'Create a reliable reproduction case with minimal steps and expected vs actual behavior', type: 'debug', complexity: 4, dependsOnIndex: [] },
      { name: 'Isolate cause', description: 'Narrow down the problem area using bisection, logging, or breakpoints', type: 'analyze', complexity: 5, dependsOnIndex: [0] },
      { name: 'Diagnose root cause', description: 'Identify the exact code path, data condition, or race causing the failure', type: 'analyze', complexity: 6, dependsOnIndex: [1] },
      { name: 'Implement fix', description: 'Apply the minimum correct change to resolve the root cause', type: 'implement', complexity: 4, dependsOnIndex: [2] },
      { name: 'Verify fix', description: 'Confirm the fix resolves the original issue and passes all existing tests', type: 'test', complexity: 3, dependsOnIndex: [3] },
      { name: 'Document resolution', description: 'Record root cause, fix details, and any preventive measures for future reference', type: 'document', complexity: 2, dependsOnIndex: [4] },
    ],
  },
  {
    keywords: ['refactor', 'restructure', 'reorganize', 'clean', 'improve', 'optimize'],
    name: 'Refactor code',
    steps: [
      { name: 'Analyze current code', description: 'Review existing implementation for code smells, complexity, and coupling issues', type: 'analyze', complexity: 4, dependsOnIndex: [] },
      { name: 'Plan refactoring', description: 'Define target architecture, identify extraction points, and sequence changes', type: 'design', complexity: 5, dependsOnIndex: [0] },
      { name: 'Extract abstractions', description: 'Pull out reusable functions, interfaces, and modules from existing code', type: 'refactor', complexity: 6, dependsOnIndex: [1] },
      { name: 'Restructure modules', description: 'Reorganize file structure, update imports, and align with target architecture', type: 'refactor', complexity: 5, dependsOnIndex: [2] },
      { name: 'Run tests', description: 'Execute full test suite to verify behavioral equivalence after refactoring', type: 'test', complexity: 3, dependsOnIndex: [3] },
      { name: 'Review changes', description: 'Peer review refactored code for clarity, consistency, and maintainability', type: 'review', complexity: 3, dependsOnIndex: [4] },
    ],
  },
  {
    keywords: ['setup', 'project', 'scaffold', 'initialize', 'bootstrap', 'new'],
    name: 'Setup project',
    steps: [
      { name: 'Scaffold project', description: 'Generate initial project structure with boilerplate files and directories', type: 'configure', complexity: 3, dependsOnIndex: [] },
      { name: 'Configure tooling', description: 'Set up linter, formatter, TypeScript config, and editor settings', type: 'configure', complexity: 3, dependsOnIndex: [0] },
      { name: 'Install dependencies', description: 'Add required packages, lock versions, and verify installation', type: 'configure', complexity: 2, dependsOnIndex: [0] },
      { name: 'Define structure', description: 'Create source directories, module boundaries, and barrel exports', type: 'design', complexity: 3, dependsOnIndex: [1, 2] },
      { name: 'Setup CI/CD', description: 'Configure continuous integration pipeline with build, test, and lint stages', type: 'deploy', complexity: 4, dependsOnIndex: [3] },
      { name: 'Write documentation', description: 'Create README, contributing guide, and architecture decision records', type: 'document', complexity: 2, dependsOnIndex: [3] },
    ],
  },
];

// ── Keyword Analysis Constants ───────────────────────────────────────────────

/** Maps keywords to step types for dynamic decomposition of unknown tasks. */
const KEYWORD_STEP_MAP: Array<{ keywords: string[]; type: StepType; name: string; description: string; complexity: number }> = [
  { keywords: ['design', 'plan', 'architect', 'specify', 'define', 'outline'], type: 'design', name: 'Design phase', description: 'Define requirements, architecture, and approach', complexity: 4 },
  { keywords: ['implement', 'build', 'code', 'create', 'develop', 'write'], type: 'implement', name: 'Implementation phase', description: 'Build the core functionality', complexity: 5 },
  { keywords: ['test', 'verify', 'validate', 'check', 'assert', 'spec'], type: 'test', name: 'Testing phase', description: 'Verify correctness with automated tests', complexity: 4 },
  { keywords: ['review', 'inspect', 'audit', 'approve', 'feedback'], type: 'review', name: 'Review phase', description: 'Review implementation for quality and correctness', complexity: 3 },
  { keywords: ['configure', 'setup', 'install', 'provision', 'connect'], type: 'configure', name: 'Configuration phase', description: 'Set up environment and configuration', complexity: 3 },
  { keywords: ['document', 'readme', 'guide', 'explain', 'describe'], type: 'document', name: 'Documentation phase', description: 'Write documentation and usage guides', complexity: 2 },
  { keywords: ['analyze', 'investigate', 'study', 'research', 'explore'], type: 'analyze', name: 'Analysis phase', description: 'Analyze the problem domain and gather information', complexity: 4 },
  { keywords: ['deploy', 'release', 'publish', 'ship', 'launch'], type: 'deploy', name: 'Deployment phase', description: 'Deploy to target environment', complexity: 4 },
  { keywords: ['debug', 'fix', 'diagnose', 'troubleshoot', 'trace'], type: 'debug', name: 'Debug phase', description: 'Identify and fix issues', complexity: 5 },
  { keywords: ['refactor', 'restructure', 'clean', 'simplify', 'extract'], type: 'refactor', name: 'Refactoring phase', description: 'Improve code structure without changing behavior', complexity: 5 },
];

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  DEFAULT CONFIGURATION                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const DEFAULT_CONFIG: TaskOrchestratorConfig = {
  maxTasks: 50,
  maxStepsPerTask: 30,
  enableParallelDetection: true,
  enableBacktracking: true,
  stepTimeoutMs: 300_000,
  maxRetries: 3,
};

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §5  TASK ORCHESTRATOR CLASS                                                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Task Orchestrator — Decomposes goals into executable plans, manages
 * lifecycle state transitions, tracks progress, and supports backtracking
 * with full cross-turn persistence.
 *
 * @example
 * ```ts
 * const orchestrator = new TaskOrchestrator();
 * const plan = orchestrator.decomposeGoal('Build a REST API for user management');
 * orchestrator.startTask(plan.id);
 *
 * const executable = orchestrator.getExecutableSteps(plan.id);
 * orchestrator.advanceStep(executable[0].id, { success: true, output: 'Done', duration: 1200 });
 *
 * const progress = orchestrator.getProgress(plan.id);
 * console.log(progress.summary); // "Step 1/6: Design API... (17% complete)"
 * ```
 */
export class TaskOrchestrator {
  private config: TaskOrchestratorConfig;
  private tasks: Map<string, TaskPlan> = new Map();
  private taskStates: Map<string, TaskState> = new Map();
  private taskStartTimes: Map<string, number> = new Map();
  private snapshots: Map<string, TaskSnapshot[]> = new Map();
  private retryRecords: Map<string, RetryRecord> = new Map();
  private feedbackLog: FeedbackEntry[] = [];

  // Stats counters
  private totalTasksCreated = 0;
  private totalTasksCompleted = 0;
  private totalTasksFailed = 0;
  private totalStepsExecuted = 0;
  private totalRetries = 0;
  private totalBacktracks = 0;
  private totalReplans = 0;
  private feedbackCount = 0;

  constructor(config: Partial<TaskOrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Goal Decomposition ───────────────────────────────────────────────────

  /**
   * Decompose a high-level goal description into an executable task plan.
   *
   * First attempts to match the description against the template library.
   * If no template matches, falls back to dynamic keyword-based decomposition.
   *
   * @param description - Natural language description of the goal.
   * @param constraints - Optional list of constraints to guide decomposition.
   * @returns A fully formed TaskPlan ready for execution.
   */
  decomposeGoal(description: string, constraints?: string[]): TaskPlan {
    if (this.tasks.size >= this.config.maxTasks) {
      throw new Error(`Maximum task limit reached (${this.config.maxTasks})`);
    }

    const normalizedDesc = description.toLowerCase().trim();
    const appliedConstraints = constraints ?? [];

    // Try template matching first
    const matchedTemplate = this.matchTemplate(normalizedDesc);

    let steps: TaskStep[];
    let planName: string;

    if (matchedTemplate) {
      planName = matchedTemplate.name;
      steps = this.buildStepsFromTemplate(matchedTemplate);
    } else {
      planName = this.extractPlanName(normalizedDesc);
      steps = this.buildStepsFromKeywords(normalizedDesc, appliedConstraints);
    }

    // Enforce max steps limit
    if (steps.length > this.config.maxStepsPerTask) {
      steps = steps.slice(0, this.config.maxStepsPerTask);
    }

    const now = Date.now();
    const plan: TaskPlan = {
      id: generateId('task'),
      name: planName,
      description,
      steps,
      createdAt: now,
      updatedAt: now,
      constraints: appliedConstraints,
    };

    this.tasks.set(plan.id, plan);
    this.taskStates.set(plan.id, 'pending');
    this.snapshots.set(plan.id, []);
    this.totalTasksCreated++;

    return plan;
  }

  /**
   * Match a normalized description against the template library.
   * Returns the template with the highest keyword overlap, or null if no
   * template achieves at least 2 keyword matches.
   */
  private matchTemplate(normalizedDesc: string): TaskTemplate | null {
    const words = normalizedDesc.split(/\s+/);
    let bestTemplate: TaskTemplate | null = null;
    let bestScore = 0;

    for (const template of TASK_TEMPLATES) {
      let score = 0;
      for (const keyword of template.keywords) {
        if (words.includes(keyword) || normalizedDesc.includes(keyword)) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }

    // Require at least 2 keyword matches for template selection
    return bestScore >= 2 ? bestTemplate : null;
  }

  /**
   * Build TaskStep instances from a matched template definition.
   * Each step receives a unique ID and proper dependency wiring.
   */
  private buildStepsFromTemplate(template: TaskTemplate): TaskStep[] {
    const steps: TaskStep[] = [];
    const stepIds: string[] = [];

    for (let i = 0; i < template.steps.length; i++) {
      const def = template.steps[i];
      const stepId = generateId('step');
      stepIds.push(stepId);

      const dependencies: string[] = [];
      for (const depIdx of def.dependsOnIndex) {
        if (depIdx >= 0 && depIdx < stepIds.length) {
          dependencies.push(stepIds[depIdx]);
        }
      }

      steps.push({
        id: stepId,
        name: def.name,
        description: def.description,
        type: def.type,
        dependencies,
        state: 'pending',
        estimatedComplexity: def.complexity,
        retryCount: 0,
      });
    }

    return steps;
  }

  /**
   * Dynamically decompose an unknown task using keyword analysis.
   *
   * Scans the description for keywords associated with each step type,
   * scores them, and constructs a linear pipeline of relevant phases.
   * Always ensures at least a design, implement, and test step.
   */
  private buildStepsFromKeywords(normalizedDesc: string, constraints: string[]): TaskStep[] {
    const words = normalizedDesc.split(/\s+/);
    const constraintText = constraints.join(' ').toLowerCase();
    const allText = normalizedDesc + ' ' + constraintText;

    // Score each step type by keyword overlap
    const scored: Array<{ type: StepType; name: string; description: string; complexity: number; score: number }> = [];

    for (const mapping of KEYWORD_STEP_MAP) {
      let score = 0;
      for (const kw of mapping.keywords) {
        if (words.includes(kw) || allText.includes(kw)) {
          score++;
        }
      }
      scored.push({
        type: mapping.type,
        name: mapping.name,
        description: mapping.description,
        complexity: mapping.complexity,
        score,
      });
    }

    // Sort by score descending; stable sort preserves declaration order for ties
    scored.sort((a, b) => b.score - a.score);

    // Select the top phases, ensuring minimum coverage
    const selectedTypes = new Set<StepType>();
    const selected: typeof scored = [];

    for (const entry of scored) {
      if (entry.score > 0 && !selectedTypes.has(entry.type)) {
        selectedTypes.add(entry.type);
        selected.push(entry);
      }
    }

    // Always include these core phases if not already present
    const corePipeline: StepType[] = ['design', 'implement', 'test'];
    for (const coreType of corePipeline) {
      if (!selectedTypes.has(coreType)) {
        const mapping = KEYWORD_STEP_MAP.find(m => m.type === coreType);
        if (mapping) {
          selected.push({ ...mapping, score: 0 });
          selectedTypes.add(coreType);
        }
      }
    }

    // Order by a canonical pipeline sequence
    const pipelineOrder: StepType[] = [
      'analyze', 'design', 'configure', 'implement', 'refactor',
      'debug', 'test', 'review', 'document', 'deploy',
    ];

    selected.sort((a, b) => {
      const ai = pipelineOrder.indexOf(a.type);
      const bi = pipelineOrder.indexOf(b.type);
      return ai - bi;
    });

    // Build steps with linear dependency chain
    const steps: TaskStep[] = [];
    let prevId: string | null = null;

    for (const entry of selected) {
      const stepId = generateId('step');
      steps.push({
        id: stepId,
        name: entry.name,
        description: entry.description,
        type: entry.type,
        dependencies: prevId ? [prevId] : [],
        state: 'pending',
        estimatedComplexity: entry.complexity,
        retryCount: 0,
      });
      prevId = stepId;
    }

    return steps;
  }

  /**
   * Extract a concise plan name from the goal description.
   * Takes the first 60 characters or up to the first sentence boundary.
   */
  private extractPlanName(normalizedDesc: string): string {
    const sentenceEnd = normalizedDesc.search(/[.!?]/);
    const raw = sentenceEnd > 0 && sentenceEnd <= 60
      ? normalizedDesc.slice(0, sentenceEnd)
      : normalizedDesc.slice(0, 60);
    // Capitalize first letter
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // ── Execution State Machine ──────────────────────────────────────────────

  /**
   * Begin executing a task plan.
   *
   * Transitions the task from 'pending' to 'in_progress' and marks all
   * steps with satisfied dependencies as ready for execution.
   *
   * @param taskId - Identifier of the task plan to start.
   * @throws Error if the task is not found or not in 'pending' state.
   */
  startTask(taskId: string): void {
    const plan = this.getTaskPlanOrThrow(taskId);
    const currentState = this.taskStates.get(taskId);

    if (currentState !== 'pending') {
      throw new Error(`Cannot start task "${taskId}": current state is "${currentState}"`);
    }

    this.taskStates.set(taskId, 'in_progress');
    this.taskStartTimes.set(taskId, Date.now());
    plan.updatedAt = Date.now();

    // Take initial snapshot
    this.takeSnapshot(taskId, plan.steps[0]?.id ?? 'start');

    // Resolve initial dependencies — mark steps with no deps as ready
    this.resolveDependencies(plan);
  }

  /**
   * Mark a step as completed and advance the task plan.
   *
   * Records the result, updates timestamps, resolves downstream
   * dependencies, and checks whether the entire task is complete.
   *
   * @param stepId - Identifier of the step to advance.
   * @param result - Optional execution result for the step.
   * @throws Error if the step is not found or not in 'in_progress' state.
   */
  advanceStep(stepId: string, result?: StepResult): void {
    const { plan, step } = this.findStepOrThrow(stepId);
    const taskId = plan.id;

    if (step.state !== 'in_progress') {
      throw new Error(`Cannot advance step "${stepId}": current state is "${step.state}"`);
    }

    const now = Date.now();
    step.state = 'completed';
    step.completedAt = now;
    step.result = result ?? { success: true, output: 'Completed', duration: step.startedAt ? now - step.startedAt : 0 };
    plan.updatedAt = now;
    this.totalStepsExecuted++;

    // Resolve dependencies for downstream steps
    this.resolveDependencies(plan);

    // Check if the entire task is now complete
    this.checkTaskCompletion(taskId);
  }

  /**
   * Mark a step as failed and determine next actions.
   *
   * If retries are available, the step remains eligible for retry.
   * Otherwise, the step is marked 'failed' and dependent steps are blocked.
   *
   * @param stepId - Identifier of the step that failed.
   * @param reason - Human-readable failure reason.
   * @throws Error if the step is not found.
   */
  failStep(stepId: string, reason: string): void {
    const { plan, step } = this.findStepOrThrow(stepId);
    const now = Date.now();

    step.completedAt = now;
    step.result = { success: false, output: reason, duration: step.startedAt ? now - step.startedAt : 0 };
    plan.updatedAt = now;

    // Check retry eligibility
    const retryKey = `${plan.id}:${stepId}`;
    const record = this.retryRecords.get(retryKey) ?? { attempts: 0, lastAttemptAt: 0, currentBackoffMs: 1000 };

    if (record.attempts < this.config.maxRetries) {
      // Schedule retry — reset step to pending for re-execution
      record.attempts++;
      record.lastAttemptAt = now;
      record.currentBackoffMs = record.currentBackoffMs * 2;
      this.retryRecords.set(retryKey, record);

      step.state = 'pending';
      step.retryCount++;
      step.startedAt = undefined;
      step.completedAt = undefined;
      step.result = undefined;
      this.totalRetries++;
    } else {
      // No retries remaining — mark as failed
      step.state = 'failed';
      this.blockDependents(plan, stepId);
      this.checkTaskFailure(plan.id);
    }
  }

  /**
   * Get full status of a task plan including progress metrics.
   *
   * @param taskId - Identifier of the task to query.
   * @returns Complete TaskStatus snapshot.
   * @throws Error if the task is not found.
   */
  getTaskStatus(taskId: string): TaskStatus {
    const plan = this.getTaskPlanOrThrow(taskId);
    const state = this.taskStates.get(taskId) ?? 'pending';
    const startedAt = this.taskStartTimes.get(taskId) ?? plan.createdAt;

    const completedSteps = plan.steps.filter(s => s.state === 'completed').length;
    const totalSteps = plan.steps.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const currentStep = plan.steps.find(s => s.state === 'in_progress') ?? null;
    const remainingSteps = plan.steps.filter(s => s.state !== 'completed' && s.state !== 'skipped' && s.state !== 'failed').length;

    const currentStepName = currentStep ? currentStep.name : 'Waiting';
    const summary = `Step ${completedSteps + (currentStep ? 1 : 0)}/${totalSteps}: ${currentStepName}... (${progressPercent}% complete)`;

    return {
      taskId,
      state,
      currentStep,
      completedSteps,
      totalSteps,
      progressPercent,
      summary,
      startedAt,
      estimatedRemainingSteps: remainingSteps,
    };
  }

  /**
   * Resolve dependencies after a step completes.
   * Steps whose prerequisites are all 'completed' become eligible for execution.
   */
  private resolveDependencies(plan: TaskPlan): void {
    const completedIds = new Set(
      plan.steps.filter(s => s.state === 'completed').map(s => s.id)
    );

    for (const step of plan.steps) {
      if (step.state === 'pending' || step.state === 'blocked') {
        const allDepsMet = step.dependencies.every(depId => completedIds.has(depId));
        if (allDepsMet && step.state === 'blocked') {
          step.state = 'pending';
        }
      }
    }
  }

  /**
   * Block all steps that transitively depend on a failed step.
   */
  private blockDependents(plan: TaskPlan, failedStepId: string): void {
    const blocked = new Set<string>([failedStepId]);
    let changed = true;

    while (changed) {
      changed = false;
      for (const step of plan.steps) {
        if (blocked.has(step.id)) continue;
        if (step.state === 'completed' || step.state === 'skipped') continue;

        const hasBlockedDep = step.dependencies.some(depId => blocked.has(depId));
        if (hasBlockedDep) {
          step.state = 'blocked';
          blocked.add(step.id);
          changed = true;
        }
      }
    }
  }

  /**
   * Check whether all steps are completed and mark the task as done.
   */
  private checkTaskCompletion(taskId: string): void {
    const plan = this.tasks.get(taskId);
    if (!plan) return;

    const allDone = plan.steps.every(
      s => s.state === 'completed' || s.state === 'skipped'
    );

    if (allDone) {
      this.taskStates.set(taskId, 'completed');
      plan.updatedAt = Date.now();
      this.totalTasksCompleted++;
    }
  }

  /**
   * Check whether a task should be marked as failed.
   * A task fails if any step is 'failed' and no recovery is possible.
   */
  private checkTaskFailure(taskId: string): void {
    const plan = this.tasks.get(taskId);
    if (!plan) return;

    const hasFailed = plan.steps.some(s => s.state === 'failed');
    const hasRunnable = plan.steps.some(
      s => s.state === 'pending' || s.state === 'in_progress'
    );

    if (hasFailed && !hasRunnable) {
      this.taskStates.set(taskId, 'failed');
      plan.updatedAt = Date.now();
      this.totalTasksFailed++;
    }
  }

  /**
   * Detect steps that have exceeded the configured timeout.
   *
   * @param taskId - Identifier of the task to check.
   * @returns Array of step IDs that are stuck (timed out).
   */
  detectTimeouts(taskId: string): string[] {
    const plan = this.getTaskPlanOrThrow(taskId);
    const now = Date.now();
    const timedOut: string[] = [];

    for (const step of plan.steps) {
      if (step.state === 'in_progress' && step.startedAt) {
        if (now - step.startedAt > this.config.stepTimeoutMs) {
          timedOut.push(step.id);
        }
      }
    }

    return timedOut;
  }

  // ── Step Dependencies — DAG Operations ───────────────────────────────────

  /**
   * Check whether a step can be executed.
   * A step is executable if it is 'pending' and all its dependencies are 'completed'.
   *
   * @param stepId - Identifier of the step to check.
   * @returns True if the step is ready for execution.
   */
  canExecute(stepId: string): boolean {
    const { plan, step } = this.findStepOrThrow(stepId);

    if (step.state !== 'pending') {
      return false;
    }

    const completedIds = new Set(
      plan.steps.filter(s => s.state === 'completed').map(s => s.id)
    );

    return step.dependencies.every(depId => completedIds.has(depId));
  }

  /**
   * Get all steps in a task that are currently ready to execute.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Array of TaskStep instances that can be started immediately.
   */
  getExecutableSteps(taskId: string): TaskStep[] {
    const plan = this.getTaskPlanOrThrow(taskId);
    const completedIds = new Set(
      plan.steps.filter(s => s.state === 'completed').map(s => s.id)
    );

    return plan.steps.filter(step => {
      if (step.state !== 'pending') return false;
      return step.dependencies.every(depId => completedIds.has(depId));
    });
  }

  /**
   * Get all steps that are blocked by unmet dependencies.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Array of TaskStep instances waiting on prerequisites.
   */
  getBlockedSteps(taskId: string): TaskStep[] {
    const plan = this.getTaskPlanOrThrow(taskId);
    const completedIds = new Set(
      plan.steps.filter(s => s.state === 'completed').map(s => s.id)
    );

    return plan.steps.filter(step => {
      if (step.state === 'completed' || step.state === 'skipped' || step.state === 'failed') {
        return false;
      }
      return step.dependencies.some(depId => !completedIds.has(depId));
    });
  }

  /**
   * Detect cycles in the dependency graph of a task plan.
   *
   * Uses iterative depth-first search with a visited/recursion-stack pattern.
   *
   * @param taskId - Identifier of the task plan.
   * @returns True if a cycle exists in the dependency graph.
   */
  hasCycle(taskId: string): boolean {
    const plan = this.getTaskPlanOrThrow(taskId);
    const adjacency = new Map<string, string[]>();

    // Build adjacency: step → steps that depend on it (reversed for cycle check)
    for (const step of plan.steps) {
      if (!adjacency.has(step.id)) {
        adjacency.set(step.id, []);
      }
    }
    // For cycle detection, we traverse dependencies normally
    for (const step of plan.steps) {
      adjacency.set(step.id, [...step.dependencies]);
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();

    for (const step of plan.steps) {
      if (visited.has(step.id)) continue;

      // Iterative DFS using an explicit stack
      const stack: Array<{ id: string; childIndex: number }> = [{ id: step.id, childIndex: 0 }];
      inStack.add(step.id);

      while (stack.length > 0) {
        const frame = stack[stack.length - 1];
        const deps = adjacency.get(frame.id) ?? [];

        if (frame.childIndex >= deps.length) {
          // All children explored — backtrack
          inStack.delete(frame.id);
          visited.add(frame.id);
          stack.pop();
          continue;
        }

        const childId = deps[frame.childIndex];
        frame.childIndex++;

        if (inStack.has(childId)) {
          return true; // Cycle detected
        }

        if (!visited.has(childId)) {
          inStack.add(childId);
          stack.push({ id: childId, childIndex: 0 });
        }
      }
    }

    return false;
  }

  /**
   * Compute the critical path of a task plan.
   *
   * The critical path is the longest chain of dependent steps by estimated
   * complexity, representing the minimum time to complete the task.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Ordered array of step IDs along the critical path.
   */
  getCriticalPath(taskId: string): string[] {
    const plan = this.getTaskPlanOrThrow(taskId);
    const stepMap = new Map<string, TaskStep>();
    for (const step of plan.steps) {
      stepMap.set(step.id, step);
    }

    // Compute longest path to each node using topological ordering
    const longestTo = new Map<string, number>();
    const predecessorOn = new Map<string, string | null>();

    // Initialize
    for (const step of plan.steps) {
      longestTo.set(step.id, step.estimatedComplexity);
      predecessorOn.set(step.id, null);
    }

    // Topological sort via Kahn's algorithm
    const inDegree = new Map<string, number>();
    const forward = new Map<string, string[]>(); // dependency → dependents

    for (const step of plan.steps) {
      inDegree.set(step.id, step.dependencies.length);
      if (!forward.has(step.id)) {
        forward.set(step.id, []);
      }
      for (const depId of step.dependencies) {
        const fwd = forward.get(depId);
        if (fwd) {
          fwd.push(step.id);
        } else {
          forward.set(depId, [step.id]);
        }
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLen = longestTo.get(current) ?? 0;
      const dependents = forward.get(current) ?? [];

      for (const depId of dependents) {
        const depStep = stepMap.get(depId);
        if (!depStep) continue;

        const newLen = currentLen + depStep.estimatedComplexity;
        if (newLen > (longestTo.get(depId) ?? 0)) {
          longestTo.set(depId, newLen);
          predecessorOn.set(depId, current);
        }

        const deg = (inDegree.get(depId) ?? 1) - 1;
        inDegree.set(depId, deg);
        if (deg === 0) {
          queue.push(depId);
        }
      }
    }

    // Find the endpoint with the longest path
    let maxLen = 0;
    let endId: string | null = null;
    for (const [id, len] of longestTo) {
      if (len > maxLen) {
        maxLen = len;
        endId = id;
      }
    }

    // Trace back the critical path
    const path: string[] = [];
    let current: string | null = endId;
    while (current !== null) {
      path.unshift(current);
      current = predecessorOn.get(current) ?? null;
    }

    return path;
  }

  // ── Progress Tracking ────────────────────────────────────────────────────

  /**
   * Generate a detailed progress report for a task.
   *
   * @param taskId - Identifier of the task plan.
   * @returns A ProgressReport with current state, timings, and estimates.
   */
  getProgress(taskId: string): ProgressReport {
    const plan = this.getTaskPlanOrThrow(taskId);
    const startedAt = this.taskStartTimes.get(taskId) ?? plan.createdAt;
    const now = Date.now();
    const timeElapsedMs = now - startedAt;

    const completed = plan.steps.filter(s => s.state === 'completed');
    const pending = plan.steps.filter(s => s.state === 'pending');
    const blocked = plan.steps.filter(s => s.state === 'blocked');
    const inProgress = plan.steps.find(s => s.state === 'in_progress');

    const completedCount = completed.length;
    const totalSteps = plan.steps.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    // Estimate remaining time based on average step duration
    let avgStepDuration = 0;
    if (completedCount > 0) {
      let totalDuration = 0;
      for (const step of completed) {
        if (step.result) {
          totalDuration += step.result.duration;
        }
      }
      avgStepDuration = totalDuration / completedCount;
    }

    const remainingCount = totalSteps - completedCount;
    const estimatedRemainingMs = completedCount > 0
      ? Math.round(avgStepDuration * remainingCount)
      : 0;

    const currentPhase = inProgress
      ? inProgress.name
      : (pending.length > 0 ? 'Waiting to start next step' : 'All steps complete');

    return {
      taskId,
      taskName: plan.name,
      progressPercent,
      currentPhase,
      completedSteps: completed.map(s => s.name),
      pendingSteps: pending.map(s => s.name),
      blockedSteps: blocked.map(s => s.name),
      timeElapsedMs,
      estimatedRemainingMs,
    };
  }

  /**
   * Detect milestone completions for a task.
   *
   * Milestones are defined at 25%, 50%, 75%, and 100% completion.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Array of milestone percentage thresholds that have been reached.
   */
  getReachedMilestones(taskId: string): number[] {
    const plan = this.getTaskPlanOrThrow(taskId);
    const completedCount = plan.steps.filter(s => s.state === 'completed').length;
    const totalSteps = plan.steps.length;

    if (totalSteps === 0) return [];

    const percent = (completedCount / totalSteps) * 100;
    const milestones = [25, 50, 75, 100];

    return milestones.filter(m => percent >= m);
  }

  /**
   * Get a human-readable progress summary string.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Summary like "Step 3/6: Implementing routes... (50% complete)"
   */
  getProgressSummary(taskId: string): string {
    const status = this.getTaskStatus(taskId);
    return status.summary;
  }

  /**
   * Get per-step time tracking data.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Array of objects with step name, duration, and state.
   */
  getStepTimings(taskId: string): Array<{ stepName: string; durationMs: number; state: TaskState }> {
    const plan = this.getTaskPlanOrThrow(taskId);
    return plan.steps.map(step => {
      let durationMs = 0;
      if (step.startedAt && step.completedAt) {
        durationMs = step.completedAt - step.startedAt;
      } else if (step.startedAt) {
        durationMs = Date.now() - step.startedAt;
      }
      return {
        stepName: step.name,
        durationMs,
        state: step.state,
      };
    });
  }

  // ── Backtracking & Recovery ──────────────────────────────────────────────

  /**
   * Take a snapshot of the current task state for potential rollback.
   *
   * @param taskId - Identifier of the task plan.
   * @param beforeStepId - The step about to execute when this snapshot is taken.
   */
  private takeSnapshot(taskId: string, beforeStepId: string): void {
    if (!this.config.enableBacktracking) return;

    const plan = this.tasks.get(taskId);
    if (!plan) return;

    const snapshotList = this.snapshots.get(taskId) ?? [];
    const snapshot: TaskSnapshot = {
      beforeStepId,
      steps: plan.steps.map(s => ({ ...s, result: s.result ? { ...s.result } : undefined })),
      timestamp: Date.now(),
    };

    snapshotList.push(snapshot);
    this.snapshots.set(taskId, snapshotList);
  }

  /**
   * Backtrack a task to a previous step, restoring the snapshot state.
   *
   * All steps after the target step are reset to their snapshot state.
   *
   * @param taskId - Identifier of the task plan.
   * @param toStepId - The step ID to backtrack to (this step and later are reset).
   * @throws Error if backtracking is disabled or no matching snapshot exists.
   */
  backtrack(taskId: string, toStepId: string): void {
    if (!this.config.enableBacktracking) {
      throw new Error('Backtracking is disabled in configuration');
    }

    const plan = this.getTaskPlanOrThrow(taskId);
    const snapshotList = this.snapshots.get(taskId) ?? [];

    // Find the snapshot taken before the target step
    let targetSnapshot: TaskSnapshot | null = null;
    for (let i = snapshotList.length - 1; i >= 0; i--) {
      if (snapshotList[i].beforeStepId === toStepId) {
        targetSnapshot = snapshotList[i];
        // Remove all snapshots after this point
        snapshotList.length = i + 1;
        break;
      }
    }

    if (!targetSnapshot) {
      // No exact snapshot — reset all steps from toStepId onward
      const stepIndex = plan.steps.findIndex(s => s.id === toStepId);
      if (stepIndex < 0) {
        throw new Error(`Step "${toStepId}" not found in task "${taskId}"`);
      }

      for (let i = stepIndex; i < plan.steps.length; i++) {
        plan.steps[i].state = 'pending';
        plan.steps[i].startedAt = undefined;
        plan.steps[i].completedAt = undefined;
        plan.steps[i].result = undefined;
      }
    } else {
      // Restore steps from snapshot
      const snapshotMap = new Map<string, TaskStep>();
      for (const s of targetSnapshot.steps) {
        snapshotMap.set(s.id, s);
      }

      for (let i = 0; i < plan.steps.length; i++) {
        const restored = snapshotMap.get(plan.steps[i].id);
        if (restored) {
          plan.steps[i] = { ...restored, result: restored.result ? { ...restored.result } : undefined };
        }
      }
    }

    // Ensure the task is still in progress
    this.taskStates.set(taskId, 'in_progress');
    plan.updatedAt = Date.now();
    this.totalBacktracks++;

    // Re-resolve dependencies
    this.resolveDependencies(plan);
  }

  /**
   * Re-decompose a task from its current state.
   *
   * Preserves completed steps and generates a new plan for remaining work,
   * incorporating the reason for replanning into the constraints.
   *
   * @param taskId - Identifier of the task to replan.
   * @param reason - Why replanning is needed (added to constraints).
   * @returns The updated TaskPlan.
   */
  replan(taskId: string, reason: string): TaskPlan {
    const plan = this.getTaskPlanOrThrow(taskId);
    const completedSteps = plan.steps.filter(s => s.state === 'completed');
    const completedNames = new Set(completedSteps.map(s => s.name.toLowerCase()));

    // Add replan reason to constraints
    const newConstraints = [...plan.constraints, `Replan reason: ${reason}`];
    const completedInfo = completedSteps.map(s => s.name).join(', ');
    if (completedInfo) {
      newConstraints.push(`Already completed: ${completedInfo}`);
    }

    // Re-decompose the original goal with updated constraints
    const normalizedDesc = plan.description.toLowerCase().trim();
    const matchedTemplate = this.matchTemplate(normalizedDesc);

    let newSteps: TaskStep[];
    if (matchedTemplate) {
      newSteps = this.buildStepsFromTemplate(matchedTemplate);
    } else {
      newSteps = this.buildStepsFromKeywords(normalizedDesc, newConstraints);
    }

    // Filter out steps that have already been completed
    newSteps = newSteps.filter(s => !completedNames.has(s.name.toLowerCase()));

    // Wire the first new step to depend on last completed step
    const lastCompleted = completedSteps[completedSteps.length - 1];
    if (lastCompleted && newSteps.length > 0) {
      const firstNew = newSteps[0];
      if (!firstNew.dependencies.includes(lastCompleted.id)) {
        firstNew.dependencies = [lastCompleted.id, ...firstNew.dependencies];
      }
    }

    // Merge: keep completed steps + new steps
    plan.steps = [...completedSteps, ...newSteps];
    plan.updatedAt = Date.now();
    plan.constraints = newConstraints;

    this.totalReplans++;

    // Take snapshot of new plan state
    const nextStep = newSteps[0];
    if (nextStep) {
      this.takeSnapshot(taskId, nextStep.id);
    }

    // Resolve dependencies
    this.resolveDependencies(plan);

    return plan;
  }

  /**
   * Get the retry record for a specific step.
   *
   * @param taskId - Identifier of the task plan.
   * @param stepId - Identifier of the step.
   * @returns RetryRecord or null if no retries have been attempted.
   */
  getRetryInfo(taskId: string, stepId: string): { attempts: number; maxRetries: number; nextBackoffMs: number } | null {
    const key = `${taskId}:${stepId}`;
    const record = this.retryRecords.get(key);
    if (!record) return null;

    return {
      attempts: record.attempts,
      maxRetries: this.config.maxRetries,
      nextBackoffMs: record.currentBackoffMs,
    };
  }

  /**
   * Generate an alternative execution path when the primary path for a step fails.
   *
   * Creates a simplified replacement step sequence that attempts to achieve
   * the same goal through a different approach.
   *
   * @param taskId - Identifier of the task plan.
   * @param failedStepId - The step that failed.
   * @returns Array of alternative replacement steps, or empty if none generated.
   */
  generateAlternativePath(taskId: string, failedStepId: string): TaskStep[] {
    const plan = this.getTaskPlanOrThrow(taskId);
    const failedStep = plan.steps.find(s => s.id === failedStepId);
    if (!failedStep) return [];

    // Generate a simplified alternative approach
    const alternatives: TaskStep[] = [];

    // Create an analysis step to understand the failure
    const analyzeId = generateId('step');
    alternatives.push({
      id: analyzeId,
      name: `Analyze failure: ${failedStep.name}`,
      description: `Investigate why "${failedStep.name}" failed and identify alternative approaches`,
      type: 'analyze',
      dependencies: [...failedStep.dependencies],
      state: 'pending',
      estimatedComplexity: Math.min(failedStep.estimatedComplexity + 1, 10),
      retryCount: 0,
    });

    // Create a simplified retry step
    const retryId = generateId('step');
    alternatives.push({
      id: retryId,
      name: `Alternative: ${failedStep.name}`,
      description: `Simplified alternative approach for "${failedStep.name}"`,
      type: failedStep.type,
      dependencies: [analyzeId],
      state: 'pending',
      estimatedComplexity: failedStep.estimatedComplexity,
      retryCount: 0,
    });

    // Create a verification step
    alternatives.push({
      id: generateId('step'),
      name: `Verify alternative: ${failedStep.name}`,
      description: `Confirm the alternative approach produces correct results`,
      type: 'test',
      dependencies: [retryId],
      state: 'pending',
      estimatedComplexity: 3,
      retryCount: 0,
    });

    return alternatives;
  }

  /**
   * Begin execution of a specific step.
   *
   * Marks the step as 'in_progress' and records its start time.
   * Takes a snapshot before execution for potential rollback.
   *
   * @param stepId - Identifier of the step to begin.
   * @throws Error if the step cannot be executed.
   */
  beginStep(stepId: string): void {
    const { plan, step } = this.findStepOrThrow(stepId);

    if (!this.canExecute(stepId)) {
      throw new Error(`Cannot begin step "${stepId}": dependencies not met or not in pending state`);
    }

    // Take snapshot before execution
    this.takeSnapshot(plan.id, stepId);

    step.state = 'in_progress';
    step.startedAt = Date.now();
    plan.updatedAt = Date.now();
  }

  /**
   * Skip a step, marking it as 'skipped' and resolving downstream dependencies.
   *
   * @param stepId - Identifier of the step to skip.
   * @throws Error if the step is not found.
   */
  skipStep(stepId: string): void {
    const { plan, step } = this.findStepOrThrow(stepId);

    if (step.state === 'completed' || step.state === 'in_progress') {
      throw new Error(`Cannot skip step "${stepId}": current state is "${step.state}"`);
    }

    step.state = 'skipped';
    step.completedAt = Date.now();
    plan.updatedAt = Date.now();

    // Skipped steps count as resolved for dependency purposes
    this.resolveDependencies(plan);
    this.checkTaskCompletion(plan.id);
  }

  // ── Parallel Step Detection ──────────────────────────────────────────────

  /**
   * Identify groups of steps that can be executed in parallel.
   *
   * Two steps can run concurrently if neither depends on the other and all
   * of their prerequisites are met. Groups are formed by shared dependency sets.
   *
   * @param taskId - Identifier of the task plan.
   * @returns Array of step groups, where each group can run in parallel.
   */
  findParallelGroups(taskId: string): TaskStep[][] {
    if (!this.config.enableParallelDetection) {
      return [];
    }

    const plan = this.getTaskPlanOrThrow(taskId);
    const completedIds = new Set(
      plan.steps.filter(s => s.state === 'completed' || s.state === 'skipped').map(s => s.id)
    );

    // Find all executable steps (pending with all deps met)
    const executable = plan.steps.filter(step => {
      if (step.state !== 'pending') return false;
      return step.dependencies.every(depId => completedIds.has(depId));
    });

    if (executable.length <= 1) {
      return executable.length === 1 ? [executable] : [];
    }

    // Group by shared dependency signature
    const groups = new Map<string, TaskStep[]>();
    for (const step of executable) {
      const depKey = [...step.dependencies].sort().join(',');
      const group = groups.get(depKey) ?? [];
      group.push(step);
      groups.set(depKey, group);
    }

    // Also check for independence between different groups
    // Steps are parallel if neither depends on the other
    const result: TaskStep[][] = [];
    const allDepSets = Array.from(groups.values());

    // Merge groups that are mutually independent
    const merged: TaskStep[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < allDepSets.length; i++) {
      if (used.has(i)) continue;

      const mergedGroup = [...allDepSets[i]];
      used.add(i);

      for (let j = i + 1; j < allDepSets.length; j++) {
        if (used.has(j)) continue;

        // Check if groups are independent (no step in one group depends on the other)
        const canMerge = this.areGroupsIndependent(mergedGroup, allDepSets[j]);
        if (canMerge) {
          mergedGroup.push(...allDepSets[j]);
          used.add(j);
        }
      }

      merged.push(mergedGroup);
    }

    // Only return groups with more than one step
    for (const group of merged) {
      if (group.length > 1) {
        result.push(group);
      }
    }

    // If no multi-step groups, but multiple executable steps, they form one group
    if (result.length === 0 && executable.length > 1) {
      result.push(executable);
    }

    return result;
  }

  /**
   * Check whether two groups of steps are mutually independent.
   * Groups are independent if no step in either group depends on any step in the other.
   */
  private areGroupsIndependent(groupA: TaskStep[], groupB: TaskStep[]): boolean {
    const idsA = new Set(groupA.map(s => s.id));
    const idsB = new Set(groupB.map(s => s.id));

    for (const step of groupA) {
      if (step.dependencies.some(depId => idsB.has(depId))) return false;
    }
    for (const step of groupB) {
      if (step.dependencies.some(depId => idsA.has(depId))) return false;
    }

    // Check for resource conflicts based on step type
    const typesA = new Set(groupA.map(s => s.type));
    const typesB = new Set(groupB.map(s => s.type));

    // Deploy steps conflict with each other
    if (typesA.has('deploy') && typesB.has('deploy')) return false;

    return true;
  }

  /**
   * Detect potential resource conflicts between steps.
   *
   * @param stepA - First step.
   * @param stepB - Second step.
   * @returns True if the steps may conflict when run in parallel.
   */
  hasResourceConflict(stepA: TaskStep, stepB: TaskStep): boolean {
    // Same-type steps in certain categories conflict
    const conflictingTypes: StepType[] = ['deploy', 'configure'];
    if (conflictingTypes.includes(stepA.type) && stepA.type === stepB.type) {
      return true;
    }

    // Steps referencing each other's artifacts conflict
    const aArtifacts = stepA.result?.artifacts ?? [];
    const bArtifacts = stepB.result?.artifacts ?? [];
    for (const art of aArtifacts) {
      if (bArtifacts.includes(art)) return true;
    }

    return false;
  }

  // ── Cross-Turn Persistence ───────────────────────────────────────────────

  /**
   * Get information about the currently active (in-progress) task.
   *
   * @returns ActiveTaskInfo for the most recently active task, or null.
   */
  getActiveTask(): ActiveTaskInfo | null {
    let latest: ActiveTaskInfo | null = null;
    let latestActivity = 0;

    for (const [taskId, state] of this.taskStates) {
      if (state !== 'in_progress') continue;

      const plan = this.tasks.get(taskId);
      if (!plan) continue;

      const activity = plan.updatedAt;
      if (activity > latestActivity) {
        latestActivity = activity;
        const completedCount = plan.steps.filter(s => s.state === 'completed').length;
        const totalSteps = plan.steps.length;
        const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

        latest = {
          taskId,
          taskName: plan.name,
          state,
          progressPercent,
          lastActivity: activity,
        };
      }
    }

    return latest;
  }

  /**
   * Get information about all active tasks.
   *
   * @returns Array of ActiveTaskInfo for all in-progress tasks.
   */
  getAllActiveTasks(): ActiveTaskInfo[] {
    const result: ActiveTaskInfo[] = [];

    for (const [taskId, state] of this.taskStates) {
      if (state !== 'in_progress') continue;

      const plan = this.tasks.get(taskId);
      if (!plan) continue;

      const completedCount = plan.steps.filter(s => s.state === 'completed').length;
      const totalSteps = plan.steps.length;
      const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

      result.push({
        taskId,
        taskName: plan.name,
        state,
        progressPercent,
        lastActivity: plan.updatedAt,
      });
    }

    return result;
  }

  /**
   * Resume an in-progress or paused task after a conversation break.
   *
   * Re-resolves dependencies and returns the current status.
   *
   * @param taskId - Identifier of the task to resume.
   * @returns Current TaskStatus after resumption.
   * @throws Error if the task is not found or has already completed/failed.
   */
  resumeTask(taskId: string): TaskStatus {
    const plan = this.getTaskPlanOrThrow(taskId);
    const state = this.taskStates.get(taskId);

    if (state === 'completed' || state === 'failed') {
      throw new Error(`Cannot resume task "${taskId}": task has ${state}`);
    }

    // If paused (pending with a start time), transition back to in_progress
    if (state === 'pending' && this.taskStartTimes.has(taskId)) {
      this.taskStates.set(taskId, 'in_progress');
    }

    plan.updatedAt = Date.now();

    // Re-resolve dependencies in case state was partially saved
    this.resolveDependencies(plan);

    // Detect and handle timed-out steps
    const timedOut = this.detectTimeouts(taskId);
    for (const stepId of timedOut) {
      const step = plan.steps.find(s => s.id === stepId);
      if (step) {
        step.state = 'pending';
        step.startedAt = undefined;
      }
    }

    return this.getTaskStatus(taskId);
  }

  /**
   * Pause an in-progress task, saving its state for later resumption.
   *
   * @param taskId - Identifier of the task to pause.
   * @throws Error if the task is not found or not in_progress.
   */
  pauseTask(taskId: string): void {
    const plan = this.getTaskPlanOrThrow(taskId);
    const state = this.taskStates.get(taskId);

    if (state !== 'in_progress') {
      throw new Error(`Cannot pause task "${taskId}": current state is "${state}"`);
    }

    // Pause any in-progress steps
    for (const step of plan.steps) {
      if (step.state === 'in_progress') {
        step.state = 'pending';
        step.startedAt = undefined;
      }
    }

    this.taskStates.set(taskId, 'pending');
    plan.updatedAt = Date.now();
  }

  /**
   * Get a specific task plan by ID.
   *
   * @param taskId - Identifier of the task plan.
   * @returns The TaskPlan, or undefined if not found.
   */
  getTaskPlan(taskId: string): TaskPlan | undefined {
    return this.tasks.get(taskId);
  }

  // ── Feedback ─────────────────────────────────────────────────────────────

  /**
   * Record feedback about the orchestrator's performance.
   *
   * @param correct - Whether the orchestrator's behavior was correct.
   * @param message - Optional feedback message with details.
   */
  feedback(correct: boolean, message: string = ''): void {
    this.feedbackCount++;
    this.feedbackLog.push({
      timestamp: Date.now(),
      correct,
      message,
    });
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  /**
   * Get current performance statistics.
   *
   * @returns Readonly snapshot of TaskOrchestratorStats.
   */
  getStats(): TaskOrchestratorStats {
    const activeCount = Array.from(this.taskStates.values()).filter(s => s === 'in_progress').length;
    const completedCount = this.totalTasksCompleted;

    let totalStepsInCompleted = 0;
    for (const [taskId, state] of this.taskStates) {
      if (state === 'completed') {
        const plan = this.tasks.get(taskId);
        if (plan) {
          totalStepsInCompleted += plan.steps.length;
        }
      }
    }

    return {
      totalTasksCreated: this.totalTasksCreated,
      totalTasksCompleted: this.totalTasksCompleted,
      totalTasksFailed: this.totalTasksFailed,
      totalStepsExecuted: this.totalStepsExecuted,
      totalRetries: this.totalRetries,
      totalBacktracks: this.totalBacktracks,
      totalReplans: this.totalReplans,
      activeTaskCount: activeCount,
      avgStepsPerTask: completedCount > 0 ? totalStepsInCompleted / completedCount : 0,
      feedbackCount: this.feedbackCount,
    };
  }

  // ── Serialization ────────────────────────────────────────────────────────

  /**
   * Serialize the entire orchestrator state to a JSON string.
   *
   * Includes configuration, all task plans, state mappings, snapshots,
   * retry records, and statistics.
   *
   * @returns JSON string representing the full orchestrator state.
   */
  serialize(): string {
    const tasksArray: Array<{ id: string; plan: TaskPlan; state: TaskState; startedAt?: number }> = [];

    for (const [taskId, plan] of this.tasks) {
      tasksArray.push({
        id: taskId,
        plan,
        state: this.taskStates.get(taskId) ?? 'pending',
        startedAt: this.taskStartTimes.get(taskId),
      });
    }

    const snapshotsArray: Array<{ taskId: string; snapshots: TaskSnapshot[] }> = [];
    for (const [taskId, snaps] of this.snapshots) {
      snapshotsArray.push({ taskId, snapshots: snaps });
    }

    const retryArray: Array<{ key: string; record: RetryRecord }> = [];
    for (const [key, record] of this.retryRecords) {
      retryArray.push({ key, record });
    }

    return JSON.stringify({
      version: 1,
      config: this.config,
      tasks: tasksArray,
      snapshots: snapshotsArray,
      retryRecords: retryArray,
      feedbackLog: this.feedbackLog,
      stats: {
        totalTasksCreated: this.totalTasksCreated,
        totalTasksCompleted: this.totalTasksCompleted,
        totalTasksFailed: this.totalTasksFailed,
        totalStepsExecuted: this.totalStepsExecuted,
        totalRetries: this.totalRetries,
        totalBacktracks: this.totalBacktracks,
        totalReplans: this.totalReplans,
        feedbackCount: this.feedbackCount,
      },
    });
  }

  /**
   * Restore a TaskOrchestrator from a previously serialized JSON string.
   *
   * @param json - Serialized state produced by serialize().
   * @returns A fully restored TaskOrchestrator instance.
   */
  static deserialize(json: string): TaskOrchestrator {
    const data = JSON.parse(json) as {
      config: TaskOrchestratorConfig;
      tasks: Array<{ id: string; plan: TaskPlan; state: TaskState; startedAt?: number }>;
      snapshots: Array<{ taskId: string; snapshots: TaskSnapshot[] }>;
      retryRecords: Array<{ key: string; record: RetryRecord }>;
      feedbackLog: FeedbackEntry[];
      stats: {
        totalTasksCreated: number;
        totalTasksCompleted: number;
        totalTasksFailed: number;
        totalStepsExecuted: number;
        totalRetries: number;
        totalBacktracks: number;
        totalReplans: number;
        feedbackCount: number;
      };
    };

    const orchestrator = new TaskOrchestrator(data.config);

    // Restore tasks
    if (Array.isArray(data.tasks)) {
      for (const entry of data.tasks) {
        orchestrator.tasks.set(entry.id, entry.plan);
        orchestrator.taskStates.set(entry.id, entry.state);
        if (entry.startedAt !== undefined) {
          orchestrator.taskStartTimes.set(entry.id, entry.startedAt);
        }
      }
    }

    // Restore snapshots
    if (Array.isArray(data.snapshots)) {
      for (const entry of data.snapshots) {
        orchestrator.snapshots.set(entry.taskId, entry.snapshots ?? []);
      }
    }

    // Restore retry records
    if (Array.isArray(data.retryRecords)) {
      for (const entry of data.retryRecords) {
        orchestrator.retryRecords.set(entry.key, entry.record);
      }
    }

    // Restore feedback log
    if (Array.isArray(data.feedbackLog)) {
      orchestrator.feedbackLog = data.feedbackLog;
    }

    // Restore stat counters
    if (data.stats) {
      orchestrator.totalTasksCreated = data.stats.totalTasksCreated ?? 0;
      orchestrator.totalTasksCompleted = data.stats.totalTasksCompleted ?? 0;
      orchestrator.totalTasksFailed = data.stats.totalTasksFailed ?? 0;
      orchestrator.totalStepsExecuted = data.stats.totalStepsExecuted ?? 0;
      orchestrator.totalRetries = data.stats.totalRetries ?? 0;
      orchestrator.totalBacktracks = data.stats.totalBacktracks ?? 0;
      orchestrator.totalReplans = data.stats.totalReplans ?? 0;
      orchestrator.feedbackCount = data.stats.feedbackCount ?? 0;
    }

    return orchestrator;
  }

  // ── Internal Helpers ─────────────────────────────────────────────────────

  /**
   * Retrieve a task plan by ID or throw if not found.
   *
   * @param taskId - Identifier of the task plan.
   * @returns The TaskPlan.
   * @throws Error if the task is not found.
   */
  private getTaskPlanOrThrow(taskId: string): TaskPlan {
    const plan = this.tasks.get(taskId);
    if (!plan) {
      throw new Error(`Task "${taskId}" not found`);
    }
    return plan;
  }

  /**
   * Find a step by ID across all task plans.
   *
   * @param stepId - Identifier of the step.
   * @returns Object containing the parent plan and the step.
   * @throws Error if the step is not found in any task.
   */
  private findStepOrThrow(stepId: string): { plan: TaskPlan; step: TaskStep } {
    for (const plan of this.tasks.values()) {
      const step = plan.steps.find(s => s.id === stepId);
      if (step) {
        return { plan, step };
      }
    }
    throw new Error(`Step "${stepId}" not found in any task`);
  }
}
