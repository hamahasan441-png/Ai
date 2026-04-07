/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Workflow / Pipeline Engine — Types                                          ║
 * ║                                                                              ║
 * ║  Core type definitions for the workflow execution engine:                    ║
 * ║    • WorkflowDefinition — declarative pipeline schema                       ║
 * ║    • WorkflowStep — individual unit of work (action, condition, parallel)    ║
 * ║    • WorkflowExecution — runtime state of a running workflow                ║
 * ║    • WorkflowTrigger — how a workflow is started                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Workflow Definition ──

export interface WorkflowDefinition {
  /** Unique identifier for the workflow */
  id: string
  /** Human-readable name */
  name: string
  /** Description of what this workflow does */
  description: string
  /** Semantic version string */
  version: string
  /** Ordered list of steps to execute */
  steps: WorkflowStep[]
  /** Optional triggers that can start this workflow */
  triggers?: WorkflowTrigger[]
  /** Default variables available to all steps */
  variables?: Record<string, unknown>
}

// ── Step Types ──

export type WorkflowStepType = 'action' | 'condition' | 'parallel' | 'loop' | 'wait'

export interface WorkflowStep {
  /** Unique step identifier within the workflow */
  id: string
  /** Human-readable step name */
  name: string
  /** Determines how the step is executed */
  type: WorkflowStepType
  /** Action to perform (required for 'action' type) */
  action?: WorkflowAction
  /** Condition to evaluate (required for 'condition' type) */
  condition?: WorkflowCondition
  /** Step ID to go to on success */
  onSuccess?: string
  /** Step ID to go to on failure */
  onFailure?: string
  /** Step timeout in milliseconds */
  timeout?: number
  /** Number of retry attempts on failure */
  retries?: number
  /** IDs of steps that must complete before this step runs */
  dependencies: string[]
}

// ── Actions ──

export type WorkflowActionType = 'tool_call' | 'llm_request' | 'http_request' | 'transform' | 'notify'

export interface WorkflowAction {
  /** What kind of action to perform */
  type: WorkflowActionType
  /** Action-specific configuration */
  config: Record<string, unknown>
}

// ── Conditions ──

export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'matches'

export interface WorkflowCondition {
  /** Variable or field path to evaluate */
  field: string
  /** Comparison operator */
  operator: ConditionOperator
  /** Value to compare against */
  value: unknown
}

// ── Execution State ──

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export type StepExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface WorkflowExecution {
  /** Unique execution identifier */
  id: string
  /** ID of the workflow being executed */
  workflowId: string
  /** Current execution status */
  status: WorkflowExecutionStatus
  /** When execution started */
  startedAt: number
  /** When execution completed (success or failure) */
  completedAt?: number
  /** Per-step execution state */
  steps: StepExecution[]
  /** Runtime variables (includes defaults + overrides) */
  variables: Record<string, unknown>
  /** Error message if execution failed */
  error?: string
}

export interface StepExecution {
  /** ID of the step this execution corresponds to */
  stepId: string
  /** Current step status */
  status: StepExecutionStatus
  /** When step execution started */
  startedAt?: number
  /** When step execution completed */
  completedAt?: number
  /** Step result on success */
  result?: unknown
  /** Error message on failure */
  error?: string
  /** Number of attempts made (including initial) */
  attempts: number
}

// ── Triggers ──

export type WorkflowTriggerType = 'manual' | 'schedule' | 'event' | 'webhook'

export interface WorkflowTrigger {
  /** How the workflow is triggered */
  type: WorkflowTriggerType
  /** Trigger-specific configuration (e.g. cron expression, event name) */
  config: Record<string, unknown>
}
