# Ai
Smart

## Advanced AI Chat Module

The `src/chat/` module provides a full-featured advanced chat system built on top of the core AI assistant. Import it from `src/chat/index.ts`.

### Features

- **Conversation Branching** — Fork conversations at any point and switch between branches to explore different approaches.
- **Message Pinning & Tagging** — Bookmark important messages and add custom tags for easy filtering.
- **Smart Context Window** — Automatically manage which messages fit within the model's context window using configurable strategies (`truncate_oldest`, `summarize`, `drop_low_priority`).
- **Advanced Search** — Full-text, exact, regex, and fuzzy search with relevance scoring and highlighted snippets.
- **Rich Analytics** — Token usage tracking, cost estimation, tool frequency analysis, per-model breakdowns, and per-turn metrics.
- **Multi-Format Export** — Export conversations to Markdown, JSON, or plain text with configurable options.
- **Persistence** — Serialize and deserialize entire conversations for storage and resumption.

### Quick Start

```ts
import { AdvancedChat } from './chat/index.js'

const chat = new AdvancedChat({ title: 'My Session' })

// Add messages
chat.addUserMessage('Explain the repository structure')
chat.addAssistantMessage('This repo contains...', {
  model: 'claude-sonnet-4-20250514',
  tokenUsage: { inputTokens: 500, outputTokens: 1200 },
  apiDurationMs: 3400,
})

// Pin important messages
const msgs = chat.getMessages()
chat.togglePin(msgs[0].id)

// Fork a branch to try a different approach
chat.forkBranch(msgs[0].id, 'Alternative approach')
chat.addUserMessage('Try a different approach...')

// Search across all messages
const results = chat.search({ query: 'repository', mode: 'fuzzy' })

// Get analytics
const analytics = chat.getAnalytics()
console.log(`Turns: ${analytics.turnCount}, Cost: $${analytics.estimatedCostUsd}`)

// Export conversation
const md = chat.exportMarkdown()

// Context window management
const ctx = chat.buildContextWindow()
console.log(`${ctx.messages.length} messages fit (${ctx.totalTokens} tokens)`)

// Persist and restore
const serialized = chat.serialize()
const restored = AdvancedChat.deserialize(serialized)
```

### Module Structure

| File | Description |
| --- | --- |
| `types.ts` | Core type definitions (messages, branches, search, analytics, export) |
| `AdvancedChat.ts` | Main orchestrator class with all features |
| `ChatSearch.ts` | Search engine with fuzzy/exact/regex modes and relevance scoring |
| `ChatAnalytics.ts` | Conversation analytics, token tracking, tool frequency |
| `ChatExport.ts` | Multi-format export (Markdown, JSON, plain text) |
| `index.ts` | Public API — all exports in one place |
