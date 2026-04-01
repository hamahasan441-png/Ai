/**
 * 🤖 Advanced AI — Complete Integrated System
 *
 * This module exports the ENTIRE AI system built from ALL repository files:
 *
 *   • AiChat.ts         → Core brain (chat, code, images, search, analytics)
 *   • AiIntegration.ts  → Integration layer (38 tools, 50+ commands, services)
 *   • LocalBrain.ts     → Standalone offline brain (self-learning, no API needed)
 *
 * The IntegratedAI class uses ALL 1,886 source files across 36+ modules.
 *
 * @example
 * ```ts
 * import { IntegratedAI, ALL_TOOLS, MODULE_DIRECTORY } from './chat/index.js'
 *
 * // Create AI that uses ALL repository modules
 * const ai = new IntegratedAI({
 *   title: 'Full AI Session',
 *   apiKey: 'sk-ant-...',
 *   model: 'claude-sonnet-4-20250514',
 * })
 *
 * // 💬 Chat (uses AiChat.ts AI Brain → Claude API)
 * await ai.chat_send('Explain how this project works')
 *
 * // 💻 Write code (uses AiChat.ts Code Writer — 24 languages)
 * await ai.writeCode({ description: 'REST API', language: 'typescript', style: 'production' })
 *
 * // 🖼 Analyze images (uses AiChat.ts Image Analyzer — like Claude Opus vision)
 * await ai.analyzeImage({ imageData: base64, mediaType: 'image/png' })
 *
 * // 🔧 Use any of the 38 tools (from src/tools/*)
 * console.log(`Tools available: ${ai.getToolCount()}`)  // 38
 *
 * // 📋 Use any of 50+ commands (from src/commands/*)
 * const cmds = await ai.getAvailableCommands()
 *
 * // 🌍 Get project context (from src/context.ts)
 * const ctx = await ai.getProjectContext()
 *
 * // 🧠 Load AI memory (from src/memdir/)
 * const memory = await ai.loadMemory()
 *
 * // 💰 Track costs (from src/cost-tracker.ts)
 * const costs = ai.getCostStats()
 *
 * // 📊 Full stats combining ALL modules
 * const stats = ai.getFullStats()
 *
 * // 📖 See what every module does
 * console.log(MODULE_DIRECTORY)
 * ```
 *
 * @example
 * ```ts
 * // 🧠 Standalone offline AI (no API key needed)
 * import { LocalBrain } from './chat/index.js'
 *
 * const brain = new LocalBrain({ learningEnabled: true })
 *
 * // Chat offline
 * const response = await brain.chat('How do I sort an array in Python?')
 *
 * // Write code offline
 * const code = await brain.writeCode({ description: 'binary search', language: 'typescript' })
 *
 * // Teach the brain
 * brain.learn('What is Redux?', 'Redux is a state management library for JavaScript apps.')
 *
 * // Save brain state
 * const state = brain.serializeBrain()
 * const restored = LocalBrain.deserializeBrain(state)
 * ```
 */

// ══════════════════════════════════════════════════════════════════════════════
// INTEGRATED AI — Uses ALL repository files (src/chat/AiIntegration.ts)
// ══════════════════════════════════════════════════════════════════════════════
export {
  IntegratedAI,
  ALL_TOOLS,
  TOOL_COUNT,
  MODULE_DIRECTORY,
  TOTAL_MODULES,
  TOTAL_SOURCE_FILES,
} from './AiIntegration.js'

// ══════════════════════════════════════════════════════════════════════════════
// AI CHAT BRAIN — Core intelligence (src/chat/AiChat.ts)
// ══════════════════════════════════════════════════════════════════════════════

// ── Main Classes ──
export { AdvancedChat, AiBrain } from './AiChat.js'

// ── Search Functions ──
export { searchMessages, searchByTool, getPinnedMessages } from './AiChat.js'

// ── Analytics Functions ──
export { computeAnalytics, getTopTools, getTurnBreakdown } from './AiChat.js'

// ── Export Functions ──
export { exportConversation } from './AiChat.js'

// ── Code Writer Functions ──
export {
  detectLanguage,
  countLinesOfCode,
  estimateComplexity,
  getCodeTemplate,
  getLanguageInfo,
  formatCode,
} from './AiChat.js'

// ── Image Analyzer Functions ──
export {
  isSupportedImageType,
  validateImageData,
  estimateImageSize,
  buildImageContentBlock,
  createImageBlock,
  parseImageAnalysis,
} from './AiChat.js'

// ══════════════════════════════════════════════════════════════════════════════
// LOCAL BRAIN — Standalone offline AI (src/chat/LocalBrain.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { LocalBrain } from './LocalBrain.js'

export type {
  LocalBrainConfig,
  KnowledgeEntry,
  LearnedPattern,
  KnowledgeSearchResult,
  LocalBrainState,
  LocalBrainStats,
} from './LocalBrain.js'

// ── All Types ──
export type {
  // Messages
  ChatMessageId, ChatMessage, ChatRole, ContentBlock, ContentBlockType, TokenUsage,
  // Conversation
  Branch, BranchId, Conversation, ConversationMetadata,
  // Search
  SearchMode, ChatSearchOptions, ChatSearchResult, SearchHighlight,
  // Analytics
  ConversationAnalytics, ModelUsageBreakdown, CodeStats, ImageStats,
  // Export
  ExportFormat, ExportOptions,
  // Context Window
  MessagePriority, ContextWindowConfig, ContextWindowResult,
  // Code Writer
  ProgrammingLanguage, CodeRequest, CodeResult, CodeReviewRequest, CodeReviewResult, CodeIssue,
  // Image Analyzer
  ImageAnalysisRequest, ImageAnalysisResult,
  // AI Brain
  AiBrainConfig, ApiMessage, ApiContentBlock, BrainInterface,
} from './AiChat.js'
