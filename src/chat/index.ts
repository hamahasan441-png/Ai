/**
 * 🤖 Advanced AI Chat — Public API
 *
 * Everything is in ONE file: AiChat.ts
 * Import anything you need from here.
 *
 * @example
 * ```ts
 * import { AdvancedChat, AiBrain } from './chat/index.js'
 *
 * // Create a smart AI that can chat, write code, and analyze images
 * const ai = new AdvancedChat({
 *   title: 'My AI Session',
 *   apiKey: 'sk-ant-...',          // or set ANTHROPIC_API_KEY env var
 *   model: 'claude-sonnet-4-20250514',
 * })
 *
 * // 💬 Chat with the AI
 * const reply = await ai.sendMessage('Explain how React hooks work')
 *
 * // 💻 Write code (AI generates production-quality code)
 * const { result } = await ai.writeCode({
 *   description: 'REST API with authentication',
 *   language: 'typescript',
 *   style: 'production',
 * })
 * console.log(result.code)
 *
 * // 🔍 Review code for bugs and security issues
 * const { result: review } = await ai.reviewCode({
 *   code: 'function add(a, b) { return a + b }',
 *   language: 'javascript',
 *   focus: ['bugs', 'security', 'style'],
 * })
 * console.log(`Score: ${review.score}/100`)
 *
 * // 🖼 Analyze images (like Claude Opus vision)
 * const { result: analysis } = await ai.analyzeImage({
 *   imageData: base64ImageString,
 *   mediaType: 'image/png',
 *   question: 'What is in this image?',
 * })
 * console.log(analysis.description)
 *
 * // 🌿 Branch conversations
 * const msgs = ai.getMessages()
 * ai.forkBranch(msgs[0].id, 'Try different approach')
 *
 * // 📌 Pin important messages
 * ai.togglePin(msgs[0].id)
 *
 * // 🔍 Search through history
 * const results = ai.search({ query: 'authentication', mode: 'fuzzy' })
 *
 * // 📊 Get analytics
 * const stats = ai.getAnalytics()
 * console.log(`Cost: $${stats.estimatedCostUsd}, Code: ${stats.codeStats.totalSnippets} snippets`)
 *
 * // 📤 Export conversation
 * const markdown = ai.exportMarkdown()
 * const json = ai.exportJSON()
 *
 * // 💾 Save and restore
 * const saved = ai.serialize()
 * const restored = AdvancedChat.deserialize(saved)
 * ```
 */

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
  AiBrainConfig, ApiMessage, ApiContentBlock,
} from './AiChat.js'
