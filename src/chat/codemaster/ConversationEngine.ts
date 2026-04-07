/**
 * 💬 ConversationEngine — Multi-Turn Conversation Intelligence
 *
 * Manages intelligent conversations like GitHub Copilot agent:
 *   • Multi-turn conversation with memory
 *   • Intent tracking across turns
 *   • Context accumulation and summarization
 *   • Code reference tracking (which files/symbols discussed)
 *   • Task state management (what's been done, what's next)
 *   • Conversation branching and rollback
 *   • Smart follow-up question generation
 *   • Conversation export/import
 *
 * Works fully offline — zero external deps.
 */

import type { AnalysisLanguage, TaskIntent } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Role in a conversation. */
export type ConversationRole = 'user' | 'assistant' | 'system'

/** A single message in a conversation. */
export interface ConversationMessage {
  /** Unique message ID. */
  id: string
  /** Role of the sender. */
  role: ConversationRole
  /** Message content. */
  content: string
  /** Timestamp (ISO). */
  timestamp: string
  /** Code references in this message. */
  codeRefs: CodeReference[]
  /** Detected intent. */
  intent?: TaskIntent
  /** Whether this message has been summarized (for context compression). */
  summarized: boolean
  /** Metadata. */
  metadata?: Record<string, unknown>
}

/** A reference to code in the conversation. */
export interface CodeReference {
  /** File path. */
  filePath: string
  /** Start line (if applicable). */
  startLine?: number
  /** End line. */
  endLine?: number
  /** Symbol name (function/class/etc). */
  symbolName?: string
  /** Language. */
  language: AnalysisLanguage
}

/** Current state of a conversation. */
export interface ConversationState {
  /** Conversation ID. */
  id: string
  /** Title (auto-generated or user-set). */
  title: string
  /** All messages. */
  messages: ConversationMessage[]
  /** Files mentioned/discussed. */
  mentionedFiles: Set<string>
  /** Symbols mentioned/discussed. */
  mentionedSymbols: Set<string>
  /** Current task intent. */
  currentIntent: TaskIntent | null
  /** Tasks completed so far. */
  completedTasks: string[]
  /** Pending tasks. */
  pendingTasks: string[]
  /** Conversation created time. */
  createdAt: string
  /** Last message time. */
  lastMessageAt: string
  /** Total token estimate. */
  tokenEstimate: number
  /** Topics discussed across conversation turns. */
  topics: Set<string>
}

/** A conversation summary for context compression. */
export interface ConversationSummary {
  /** Summary text. */
  text: string
  /** Key decisions made. */
  keyDecisions: string[]
  /** Key files discussed. */
  keyFiles: string[]
  /** Current task state. */
  taskState: string
  /** Number of messages summarized. */
  messageCount: number
}

/** Follow-up question suggestion. */
export interface FollowUpSuggestion {
  /** The suggested question/action. */
  text: string
  /** Category. */
  category: 'clarify' | 'next-step' | 'alternative' | 'review'
  /** Relevance score (0-1). */
  relevance: number
}

/** Conversation checkpoint for branching. */
export interface ConversationCheckpoint {
  /** Checkpoint ID. */
  id: string
  /** Label. */
  label: string
  /** Message index at checkpoint. */
  messageIndex: number
  /** Snapshot of state at checkpoint. */
  state: Omit<ConversationState, 'messages'>
  /** Timestamp. */
  timestamp: string
}

/** Sentiment detected in conversation messages. */
export type ConversationSentiment = 'positive' | 'neutral' | 'frustrated' | 'confused' | 'curious'

/** A smart response suggestion generated from conversation context. */
export interface SmartSuggestion {
  /** Suggested text. */
  text: string
  /** Type of suggestion. */
  type: 'action' | 'question' | 'explanation' | 'code'
  /** Confidence score (0-1). */
  confidence: number
  /** Reason for this suggestion. */
  reason: string
}

// ══════════════════════════════════════════════════════════════════════════════
// INTENT DETECTION
// ══════════════════════════════════════════════════════════════════════════════

interface IntentKeyword {
  intent: TaskIntent
  keywords: string[]
  weight: number
}

const INTENT_KEYWORDS: IntentKeyword[] = [
  { intent: 'new-feature', keywords: ['add', 'create', 'implement', 'build', 'new', 'develop', 'scaffold', 'generate'], weight: 1.0 },
  { intent: 'fix-bug', keywords: ['fix', 'bug', 'error', 'crash', 'broken', 'issue', 'wrong', 'fail', 'not working'], weight: 1.2 },
  { intent: 'refactor', keywords: ['refactor', 'restructure', 'reorganize', 'clean', 'simplify', 'extract', 'rename', 'move'], weight: 1.0 },
  { intent: 'optimize', keywords: ['optimize', 'performance', 'speed', 'fast', 'slow', 'memory', 'cache', 'efficient'], weight: 1.0 },
  { intent: 'add-tests', keywords: ['test', 'testing', 'unit test', 'spec', 'coverage', 'mock', 'assert'], weight: 1.0 },
  { intent: 'documentation', keywords: ['document', 'docs', 'readme', 'comment', 'explain', 'describe', 'jsdoc'], weight: 0.8 },
  { intent: 'security', keywords: ['security', 'vulnerability', 'auth', 'permission', 'encrypt', 'sanitize', 'xss', 'injection'], weight: 1.1 },
]

const TOPIC_KEYWORDS: Record<string, string[]> = {
  programming: ['code', 'function', 'variable', 'class', 'method', 'programming', 'syntax'],
  databases: ['database', 'sql', 'query', 'table', 'schema', 'postgres', 'mysql', 'mongo', 'redis'],
  security: ['security', 'auth', 'encrypt', 'vulnerability', 'xss', 'injection', 'csrf', 'token'],
  testing: ['test', 'spec', 'assert', 'mock', 'coverage', 'unit test', 'integration test'],
  deployment: ['deploy', 'ci/cd', 'pipeline', 'docker', 'kubernetes', 'release', 'staging'],
  architecture: ['architecture', 'microservice', 'monolith', 'pattern', 'solid', 'layer', 'module'],
  debugging: ['debug', 'breakpoint', 'stack trace', 'log', 'error', 'exception'],
  performance: ['performance', 'optimize', 'cache', 'latency', 'throughput', 'benchmark', 'profil'],
  documentation: ['document', 'readme', 'jsdoc', 'comment', 'api doc', 'wiki'],
  devops: ['devops', 'terraform', 'ansible', 'jenkins', 'github actions', 'ci', 'cd', 'infrastructure'],
  'ai/ml': ['machine learning', 'neural', 'model', 'training', 'tensor', 'nlp'],
  networking: ['network', 'http', 'tcp', 'websocket', 'dns', 'proxy', 'load balancer'],
  mobile: ['mobile', 'ios', 'android', 'react native', 'flutter'],
  web: ['web', 'html', 'css', 'browser', 'dom', 'frontend', 'spa', 'ssr'],
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'lambda', 's3', 'serverless'],
  api: ['api', 'rest', 'graphql', 'endpoint', 'request', 'response', 'grpc'],
  'design-patterns': ['singleton', 'factory', 'observer', 'strategy', 'decorator', 'adapter'],
  algorithms: ['algorithm', 'sort', 'search', 'graph', 'tree', 'dynamic programming', 'recursion'],
  'data-structures': ['array', 'linked list', 'hash map', 'stack', 'queue', 'heap', 'trie'],
  concurrency: ['async', 'await', 'thread', 'mutex', 'concurrent', 'parallel', 'race condition', 'promise'],
}

const EXPERTISE_PATTERNS: Record<string, Record<string, string[]>> = {
  languages: {
    typescript: ['typescript', '.ts', '.tsx'],
    javascript: ['javascript', '.js', '.jsx', 'node', 'npm'],
    python: ['python', '.py', 'pip', 'django', 'flask'],
    rust: ['rust', '.rs', 'cargo'],
    go: ['golang', '.go', 'go mod'],
    java: ['java', '.java', 'maven', 'gradle'],
    csharp: ['c#', '.cs', 'dotnet', '.net'],
    ruby: ['ruby', '.rb', 'rails', 'gem'],
    php: ['php', '.php', 'laravel', 'composer'],
    swift: ['swift', '.swift', 'xcode'],
    kotlin: ['kotlin', '.kt'],
    sql: ['sql', '.sql'],
  },
  frameworks: {
    react: ['react', 'jsx', 'tsx', 'next.js', 'nextjs'],
    vue: ['vue', 'vuex', 'nuxt'],
    angular: ['angular'],
    express: ['express', 'middleware'],
    django: ['django'],
    flask: ['flask'],
    spring: ['spring', 'spring boot'],
    rails: ['rails', 'ruby on rails'],
    svelte: ['svelte', 'sveltekit'],
  },
  tools: {
    docker: ['docker', 'container', 'dockerfile'],
    git: ['git', 'commit', 'branch', 'merge', 'rebase'],
    webpack: ['webpack', 'bundle'],
    vite: ['vite'],
    jest: ['jest'],
    vitest: ['vitest'],
    eslint: ['eslint', 'lint'],
    kubernetes: ['kubernetes', 'k8s', 'kubectl'],
    terraform: ['terraform'],
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

let messageCounter = 0

function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageCounter}`
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4)
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATION ENGINE CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ConversationEngine — Multi-turn conversation manager.
 *
 * Tracks conversation state, code references, intent, and tasks
 * like GitHub Copilot agent manages its conversation context.
 */
export class ConversationEngine {
  private state: ConversationState
  private checkpoints: ConversationCheckpoint[] = []
  private maxMessages: number
  private maxTokens: number
  private contextMemory: Map<string, string> = new Map()

  constructor(options?: { title?: string; maxMessages?: number; maxTokens?: number }) {
    this.maxMessages = options?.maxMessages ?? 200
    this.maxTokens = options?.maxTokens ?? 100000
    this.state = {
      id: generateConversationId(),
      title: options?.title ?? 'New Conversation',
      messages: [],
      mentionedFiles: new Set(),
      mentionedSymbols: new Set(),
      currentIntent: null,
      completedTasks: [],
      pendingTasks: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      tokenEstimate: 0,
      topics: new Set(),
    }
  }

  /**
   * Add a user message.
   */
  addUserMessage(content: string, metadata?: Record<string, unknown>): ConversationMessage {
    const codeRefs = this.extractCodeReferences(content)
    const intent = this.detectIntent(content)
    const sentiment = this.analyzeSentiment(content)
    const topics = this.extractTopics(content)

    for (const topic of topics) {
      this.state.topics.add(topic)
    }

    // Auto-remember recurring topics and language preference
    if (topics.length > 0) {
      this.contextMemory.set('recent_topics', topics.join(', '))
    }
    const langMentions = ['typescript', 'javascript', 'python', 'rust', 'go', 'java']
    for (const lang of langMentions) {
      if (content.toLowerCase().includes(lang)) {
        this.contextMemory.set('language_preference', lang)
        break
      }
    }

    const message: ConversationMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      codeRefs,
      intent: intent ?? undefined,
      summarized: false,
      metadata: { ...metadata, sentiment },
    }

    this.state.messages.push(message)
    this.updateState(message)

    return message
  }

  /**
   * Add an assistant message.
   */
  addAssistantMessage(content: string, metadata?: Record<string, unknown>): ConversationMessage {
    const codeRefs = this.extractCodeReferences(content)

    const message: ConversationMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      codeRefs,
      summarized: false,
      metadata,
    }

    this.state.messages.push(message)
    this.updateState(message)

    return message
  }

  /**
   * Add a system message.
   */
  addSystemMessage(content: string): ConversationMessage {
    const message: ConversationMessage = {
      id: generateMessageId(),
      role: 'system',
      content,
      timestamp: new Date().toISOString(),
      codeRefs: [],
      summarized: false,
    }

    this.state.messages.push(message)
    this.state.tokenEstimate += estimateTokens(content)
    this.state.lastMessageAt = message.timestamp

    return message
  }

  /**
   * Detect intent from a message.
   */
  detectIntent(content: string): TaskIntent | null {
    const lower = content.toLowerCase()
    let bestIntent: TaskIntent | null = null
    let bestScore = 0

    for (const ik of INTENT_KEYWORDS) {
      let score = 0
      for (const kw of ik.keywords) {
        if (lower.includes(kw)) score += ik.weight
      }
      if (score > bestScore) {
        bestScore = score
        bestIntent = ik.intent
      }
    }

    return bestScore >= 1.0 ? bestIntent : null
  }

  /**
   * Extract code references from a message (file paths, symbols).
   */
  extractCodeReferences(content: string): CodeReference[] {
    const refs: CodeReference[] = []
    const seen = new Set<string>()

    // File path patterns: src/path/file.ts, ./path/file.js, path/to/file.py
    const filePattern = /(?:^|\s|`)((?:\.\/|src\/|lib\/|app\/)?[\w./-]+\.(?:ts|tsx|js|jsx|py|rs|go|java|c|cpp|cs|rb|php|html|css|sql|sh|kt|swift|dart|scala))\b/gi
    let match: RegExpExecArray | null
    while ((match = filePattern.exec(content)) !== null) {
      const filePath = match[1]
      if (!seen.has(filePath)) {
        seen.add(filePath)
        const ext = filePath.substring(filePath.lastIndexOf('.'))
        const langMap: Record<string, AnalysisLanguage> = {
          '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
          '.py': 'python', '.rs': 'rust', '.go': 'go', '.java': 'java',
        }
        refs.push({ filePath, language: langMap[ext] ?? 'unknown' })
      }
    }

    // Line number patterns: file.ts:42 or line 42
    const linePattern = /([\w./-]+\.\w+):(\d+)(?::(\d+))?/g
    while ((match = linePattern.exec(content)) !== null) {
      const existing = refs.find(r => r.filePath === match![1])
      if (existing) {
        existing.startLine = parseInt(match[2], 10)
        if (match[3]) existing.endLine = parseInt(match[3], 10)
      }
    }

    // Function/class names: function foo(), class Bar, interface IBaz
    const symbolPattern = /(?:function|class|interface|type|const|let|var|export)\s+(\w+)/g
    while ((match = symbolPattern.exec(content)) !== null) {
      const symbolName = match[1]
      if (symbolName.length > 2 && !seen.has(`sym:${symbolName}`)) {
        seen.add(`sym:${symbolName}`)
        // Try to find which file this symbol belongs to
        const ref = refs.find(r => content.includes(`${r.filePath}`) && content.includes(symbolName))
        if (ref) {
          ref.symbolName = symbolName
        }
      }
    }

    return refs
  }

  /**
   * Get the current conversation state.
   */
  getState(): ConversationState {
    return { ...this.state, mentionedFiles: new Set(this.state.mentionedFiles), mentionedSymbols: new Set(this.state.mentionedSymbols), topics: new Set(this.state.topics) }
  }

  /**
   * Get all messages.
   */
  getMessages(): ConversationMessage[] {
    return [...this.state.messages]
  }

  /**
   * Get recent messages (for context window).
   */
  getRecentMessages(count: number): ConversationMessage[] {
    return this.state.messages.slice(-count)
  }

  /**
   * Get message count.
   */
  getMessageCount(): number {
    return this.state.messages.length
  }

  /**
   * Generate a conversation summary.
   */
  summarize(): ConversationSummary {
    const msgs = this.state.messages
    const userMessages = msgs.filter(m => m.role === 'user')
    const assistantMessages = msgs.filter(m => m.role === 'assistant')

    // Extract key decisions (assistant messages with action words)
    const keyDecisions: string[] = []
    for (const msg of assistantMessages) {
      const first100 = msg.content.substring(0, 100)
      if (/(?:created|fixed|added|removed|updated|modified|refactored)/i.test(first100)) {
        keyDecisions.push(first100.replace(/\n/g, ' ').trim())
      }
    }

    // Key files
    const keyFiles = [...this.state.mentionedFiles].slice(0, 10)

    // Task state
    const completed = this.state.completedTasks.length
    const pending = this.state.pendingTasks.length
    const taskState = pending > 0
      ? `${completed} tasks completed, ${pending} pending`
      : completed > 0
        ? `${completed} tasks completed`
        : 'No tasks tracked'

    // Summary text
    const turns = userMessages.length
    const intentStr = this.state.currentIntent ? ` Intent: ${this.state.currentIntent}.` : ''
    const text = `Conversation with ${turns} user turns.${intentStr} ${taskState}. Key files: ${keyFiles.join(', ') || 'none'}.`

    return {
      text,
      keyDecisions: keyDecisions.slice(0, 5),
      keyFiles,
      taskState,
      messageCount: msgs.length,
    }
  }

  /**
   * Suggest follow-up questions/actions.
   */
  suggestFollowUps(): FollowUpSuggestion[] {
    const suggestions: FollowUpSuggestion[] = []
    const msgs = this.state.messages
    const lastMsg = msgs[msgs.length - 1]

    if (!lastMsg) return suggestions

    const hasCode = lastMsg.codeRefs.length > 0
    const intent = this.state.currentIntent

    // Always suggest reviewing
    if (hasCode) {
      suggestions.push({
        text: 'Can you review the changes for potential issues?',
        category: 'review',
        relevance: 0.7,
      })
    }

    // Intent-based suggestions
    if (intent === 'new-feature') {
      suggestions.push({ text: 'Should we add tests for this new feature?', category: 'next-step', relevance: 0.9 })
      suggestions.push({ text: 'Should we update the documentation?', category: 'next-step', relevance: 0.6 })
    } else if (intent === 'fix-bug') {
      suggestions.push({ text: 'Can you add a regression test for this bug?', category: 'next-step', relevance: 0.9 })
      suggestions.push({ text: 'Are there similar bugs elsewhere in the code?', category: 'alternative', relevance: 0.7 })
    } else if (intent === 'refactor') {
      suggestions.push({ text: 'Should we run the test suite to verify nothing broke?', category: 'next-step', relevance: 0.9 })
      suggestions.push({ text: 'Are there other files that need the same refactoring?', category: 'alternative', relevance: 0.7 })
    } else if (intent === 'add-tests') {
      suggestions.push({ text: 'Should we add edge case tests too?', category: 'next-step', relevance: 0.8 })
      suggestions.push({ text: 'What is the current test coverage?', category: 'clarify', relevance: 0.6 })
    }

    // Pending tasks
    if (this.state.pendingTasks.length > 0) {
      suggestions.push({
        text: `Continue with next task: ${this.state.pendingTasks[0]}`,
        category: 'next-step',
        relevance: 0.95,
      })
    }

    // Sort by relevance
    suggestions.sort((a, b) => b.relevance - a.relevance)
    return suggestions.slice(0, 5)
  }

  /**
   * Create a checkpoint for conversation branching.
   */
  createCheckpoint(label: string): ConversationCheckpoint {
    const checkpoint: ConversationCheckpoint = {
      id: `ckpt_${Date.now()}`,
      label,
      messageIndex: this.state.messages.length,
      state: {
        id: this.state.id,
        title: this.state.title,
        mentionedFiles: new Set(this.state.mentionedFiles),
        mentionedSymbols: new Set(this.state.mentionedSymbols),
        currentIntent: this.state.currentIntent,
        completedTasks: [...this.state.completedTasks],
        pendingTasks: [...this.state.pendingTasks],
        createdAt: this.state.createdAt,
        lastMessageAt: this.state.lastMessageAt,
        tokenEstimate: this.state.tokenEstimate,
        topics: new Set(this.state.topics),
      },
      timestamp: new Date().toISOString(),
    }

    this.checkpoints.push(checkpoint)
    return checkpoint
  }

  /**
   * Rollback to a checkpoint.
   */
  rollbackToCheckpoint(checkpointId: string): boolean {
    const checkpoint = this.checkpoints.find(c => c.id === checkpointId)
    if (!checkpoint) return false

    // Trim messages
    this.state.messages = this.state.messages.slice(0, checkpoint.messageIndex)

    // Restore state
    this.state.mentionedFiles = new Set(checkpoint.state.mentionedFiles)
    this.state.mentionedSymbols = new Set(checkpoint.state.mentionedSymbols)
    this.state.currentIntent = checkpoint.state.currentIntent
    this.state.completedTasks = [...checkpoint.state.completedTasks]
    this.state.pendingTasks = [...checkpoint.state.pendingTasks]
    this.state.tokenEstimate = checkpoint.state.tokenEstimate
    this.state.topics = new Set(checkpoint.state.topics)

    // Remove checkpoints after this one
    const idx = this.checkpoints.indexOf(checkpoint)
    this.checkpoints = this.checkpoints.slice(0, idx + 1)

    return true
  }

  /**
   * Get all checkpoints.
   */
  getCheckpoints(): ConversationCheckpoint[] {
    return [...this.checkpoints]
  }

  /**
   * Add a completed task.
   */
  addCompletedTask(task: string): void {
    this.state.completedTasks.push(task)
    // Remove from pending if it was there
    this.state.pendingTasks = this.state.pendingTasks.filter(t => t !== task)
  }

  /**
   * Add a pending task.
   */
  addPendingTask(task: string): void {
    if (!this.state.pendingTasks.includes(task)) {
      this.state.pendingTasks.push(task)
    }
  }

  /**
   * Set the conversation title.
   */
  setTitle(title: string): void {
    this.state.title = title
  }

  /**
   * Get the conversation ID.
   */
  getId(): string {
    return this.state.id
  }

  /**
   * Get token estimate.
   */
  getTokenEstimate(): number {
    return this.state.tokenEstimate
  }

  /**
   * Export conversation to a serializable format.
   */
  export(): {
    id: string
    title: string
    messages: ConversationMessage[]
    completedTasks: string[]
    pendingTasks: string[]
    mentionedFiles: string[]
    currentIntent: TaskIntent | null
    createdAt: string
    lastMessageAt: string
  } {
    return {
      id: this.state.id,
      title: this.state.title,
      messages: [...this.state.messages],
      completedTasks: [...this.state.completedTasks],
      pendingTasks: [...this.state.pendingTasks],
      mentionedFiles: [...this.state.mentionedFiles],
      currentIntent: this.state.currentIntent,
      createdAt: this.state.createdAt,
      lastMessageAt: this.state.lastMessageAt,
    }
  }

  /**
   * Reset conversation state.
   */
  reset(): void {
    this.state = {
      id: generateConversationId(),
      title: 'New Conversation',
      messages: [],
      mentionedFiles: new Set(),
      mentionedSymbols: new Set(),
      currentIntent: null,
      completedTasks: [],
      pendingTasks: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      tokenEstimate: 0,
      topics: new Set(),
    }
    this.checkpoints = []
    this.contextMemory.clear()
  }

  // ── Sentiment Awareness ──

  /**
   * Analyze sentiment/mood of a message.
   */
  analyzeSentiment(content: string): ConversationSentiment {
    const lower = content.toLowerCase()

    const frustratedKw = ['not working', 'broken', 'stuck', 'error again']
    const positiveKw = ['thanks', 'great', 'perfect', 'awesome', 'works', 'nice']
    const curiousKw = ['how', 'what', 'explain', 'tell me', 'show me']
    const confusedKw = ["don't understand", 'unclear', 'confused', 'what do you mean', 'lost']

    let frustratedScore = 0
    let positiveScore = 0
    let curiousScore = 0
    let confusedScore = 0

    for (const kw of frustratedKw) { if (lower.includes(kw)) frustratedScore++ }
    for (const kw of positiveKw) { if (lower.includes(kw)) positiveScore++ }
    for (const kw of curiousKw) { if (lower.includes(kw)) curiousScore++ }
    for (const kw of confusedKw) { if (lower.includes(kw)) confusedScore++ }

    if (frustratedScore > 0 && frustratedScore >= confusedScore) return 'frustrated'
    if (confusedScore > 0) return 'confused'
    if (positiveScore > 0 && positiveScore >= curiousScore) return 'positive'
    if (curiousScore > 0) return 'curious'

    return 'neutral'
  }

  // ── Smart Response Suggestions ──

  /**
   * Generate context-aware smart suggestions based on sentiment, intent, and topics.
   */
  generateSmartSuggestions(): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    const msgs = this.state.messages
    const lastUserMsg = [...msgs].reverse().find(m => m.role === 'user')

    if (!lastUserMsg) return suggestions

    const sentiment = this.analyzeSentiment(lastUserMsg.content)
    const intent = this.state.currentIntent
    const topics = [...this.state.topics]

    if (sentiment === 'frustrated') {
      suggestions.push({
        text: 'Let me help debug this step by step',
        type: 'action',
        confidence: 0.9,
        reason: 'User appears frustrated — offering structured debugging help',
      })
      suggestions.push({
        text: 'Can you share the exact error message?',
        type: 'question',
        confidence: 0.85,
        reason: 'Gathering specific error details to provide targeted help',
      })
    }

    if (sentiment === 'confused') {
      suggestions.push({
        text: 'Let me break this down into simpler concepts',
        type: 'explanation',
        confidence: 0.9,
        reason: 'User seems confused — simplifying explanation',
      })
      suggestions.push({
        text: 'Here is a minimal example to illustrate',
        type: 'code',
        confidence: 0.8,
        reason: 'Providing concrete code example for clarity',
      })
    }

    if (sentiment === 'curious') {
      suggestions.push({
        text: 'Would you like a deeper dive into this topic?',
        type: 'question',
        confidence: 0.8,
        reason: 'User is curious — offering deeper exploration',
      })
      if (topics.length > 0) {
        suggestions.push({
          text: `Related topics you might explore: ${topics.slice(0, 3).join(', ')}`,
          type: 'explanation',
          confidence: 0.7,
          reason: 'Suggesting related topics based on conversation',
        })
      }
    }

    if (intent === 'new-feature' || intent === 'fix-bug') {
      suggestions.push({
        text: 'Shall I suggest tests for this change?',
        type: 'action',
        confidence: 0.85,
        reason: 'Building/fixing code — testing is a logical next step',
      })
      suggestions.push({
        text: 'Should we document this change?',
        type: 'action',
        confidence: 0.6,
        reason: 'Code changes benefit from documentation',
      })
    }

    if (sentiment === 'positive') {
      suggestions.push({
        text: 'Would you like to tackle the next task?',
        type: 'action',
        confidence: 0.75,
        reason: 'User is positive — momentum for next steps',
      })
    }

    suggestions.sort((a, b) => b.confidence - a.confidence)
    return suggestions.slice(0, 5)
  }

  // ── Contextual Memory ──

  /**
   * Store a key-value fact in contextual memory.
   */
  remember(key: string, value: string): void {
    this.contextMemory.set(key, value)
  }

  /**
   * Recall a fact from contextual memory.
   */
  recall(key: string): string | undefined {
    return this.contextMemory.get(key)
  }

  /**
   * Get all stored memory as a plain object.
   */
  getMemoryContext(): Record<string, string> {
    return Object.fromEntries(this.contextMemory)
  }

  // ── Understanding Score ──

  /**
   * Rate how well the engine understands the current conversation (0-100).
   */
  getUnderstandingScore(): { score: number; breakdown: Record<string, number> } {
    const msgs = this.state.messages
    const userMsgs = msgs.filter(m => m.role === 'user')

    const intentClarity = userMsgs.length > 0
      ? Math.round((userMsgs.filter(m => m.intent).length / userMsgs.length) * 100)
      : 0

    const codeRefDensity = msgs.length > 0
      ? Math.round((msgs.filter(m => m.codeRefs.length > 0).length / msgs.length) * 100)
      : 0

    const topicConsistency = userMsgs.length > 0
      ? Math.round(Math.min(this.state.topics.size / Math.max(userMsgs.length * 0.5, 1), 1) * 100)
      : 0

    let sentimentTracking = 0
    if (userMsgs.length > 0) {
      const withSentiment = userMsgs.filter(m =>
        m.metadata?.sentiment && m.metadata.sentiment !== 'neutral',
      )
      sentimentTracking = Math.round((withSentiment.length / userMsgs.length) * 100)
    }

    const breakdown: Record<string, number> = {
      intentClarity,
      codeRefDensity,
      topicConsistency,
      sentimentTracking,
    }

    const score = Math.round(
      intentClarity * 0.3 +
      codeRefDensity * 0.25 +
      topicConsistency * 0.25 +
      sentimentTracking * 0.2,
    )

    return { score: Math.min(score, 100), breakdown }
  }

  // ── Language Expertise Detection ──

  /**
   * Detect languages, frameworks, and tools discussed in the conversation.
   */
  getDetectedExpertise(): { languages: string[]; frameworks: string[]; tools: string[] } {
    const allContent = this.state.messages.map(m => m.content).join(' ').toLowerCase()

    const detected: { languages: string[]; frameworks: string[]; tools: string[] } = {
      languages: [],
      frameworks: [],
      tools: [],
    }

    for (const [category, entries] of Object.entries(EXPERTISE_PATTERNS)) {
      for (const [name, keywords] of Object.entries(entries)) {
        for (const kw of keywords) {
          if (allContent.includes(kw)) {
            const list = detected[category as keyof typeof detected]
            if (!list.includes(name)) {
              list.push(name)
            }
            break
          }
        }
      }
    }

    return detected
  }

  // ── Private helpers ──

  private updateState(message: ConversationMessage): void {
    // Update token estimate
    this.state.tokenEstimate += estimateTokens(message.content)
    this.state.lastMessageAt = message.timestamp

    // Track mentioned files
    for (const ref of message.codeRefs) {
      this.state.mentionedFiles.add(ref.filePath)
      if (ref.symbolName) {
        this.state.mentionedSymbols.add(ref.symbolName)
      }
    }

    // Update intent if detected
    if (message.intent) {
      this.state.currentIntent = message.intent
    }

    // Auto-generate title from first user message
    if (this.state.messages.length === 1 && message.role === 'user') {
      const titleText = message.content.substring(0, 60).replace(/\n/g, ' ').trim()
      this.state.title = titleText + (message.content.length > 60 ? '...' : '')
    }

    // Context management: summarize old messages if over limit
    if (this.state.messages.length > this.maxMessages || this.state.tokenEstimate > this.maxTokens) {
      this.compressContext()
    }
  }

  private compressContext(): void {
    // Mark older messages as summarized (keep recent ones)
    const keepCount = Math.floor(this.maxMessages / 2)
    const toSummarize = this.state.messages.slice(0, -keepCount)

    for (const msg of toSummarize) {
      if (!msg.summarized) {
        msg.summarized = true
        // Replace content with a shorter version
        if (msg.content.length > 200) {
          msg.content = msg.content.substring(0, 200) + '... [summarized]'
        }
      }
    }

    // Recalculate token estimate
    this.state.tokenEstimate = this.state.messages.reduce(
      (sum, m) => sum + estimateTokens(m.content),
      0,
    )
  }

  private extractTopics(content: string): string[] {
    const lower = content.toLowerCase()
    const found: string[] = []
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          found.push(topic)
          break
        }
      }
    }
    return found
  }
}
