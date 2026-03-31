# 🤖 Ai — Advanced AI System
Smart

## What Is This?

A **complete AI system** in a single TypeScript file (`src/chat/AiChat.ts`) that can:

| Capability | Description |
| --- | --- |
| 💬 **Chat** | Intelligent conversation powered by Claude API |
| 💻 **Write Code** | Generate production-quality code in 24 languages |
| 🔍 **Review Code** | Find bugs, security issues, and style problems |
| 🖼 **Analyze Images** | Describe and understand photos (vision AI) |
| 🌿 **Branch** | Fork conversations to explore different approaches |
| 📌 **Pin & Tag** | Bookmark important messages with custom labels |
| 🔎 **Search** | Fuzzy, exact, and regex search with relevance scoring |
| 📊 **Analytics** | Token usage, cost, tool frequency, code & image stats |
| 📤 **Export** | Conversations to Markdown, JSON, or plain text |
| 🧠 **Context Window** | Smart management of what fits in the LLM |
| 💾 **Persistence** | Save and restore complete sessions |

## How the File Is Organized

Everything lives in **one file** (`src/chat/AiChat.ts`), divided into 8 clear sections:

```
§1  TYPES           — Every data shape the AI uses
§2  SEARCH ENGINE   — Find any message instantly
§3  ANALYTICS       — Token, cost & tool tracking
§4  EXPORT          — Markdown / JSON / Text output
§5  CODE WRITER     — Generate, review & fix code in 24 languages
§6  IMAGE ANALYZER  — Describe & understand photos (like Claude Opus)
§7  AI BRAIN        — Core intelligence (Claude API connection)
§8  ADVANCED CHAT   — Main class tying it ALL together
```

## Quick Start

```ts
import { AdvancedChat } from './chat/index.js'

// Create the AI (set ANTHROPIC_API_KEY env var or pass apiKey)
const ai = new AdvancedChat({
  title: 'My Session',
  model: 'claude-sonnet-4-20250514',
})

// 💬 Chat
const reply = await ai.sendMessage('How do I build a REST API?')

// 💻 Write code
const { result } = await ai.writeCode({
  description: 'HTTP server with authentication',
  language: 'typescript',
  style: 'production',
})
console.log(result.code)

// 🔍 Review code
const { result: review } = await ai.reviewCode({
  code: myCode,
  language: 'python',
  focus: ['bugs', 'security'],
})
console.log(`Score: ${review.score}/100`)

// 🖼 Analyze an image
const { result: img } = await ai.analyzeImage({
  imageData: base64String,
  mediaType: 'image/png',
  question: 'What do you see?',
})
console.log(img.description)

// 📊 Get analytics
const stats = ai.getAnalytics()
console.log(`Cost: $${stats.estimatedCostUsd}`)
console.log(`Code: ${stats.codeStats.totalSnippets} snippets`)
console.log(`Images: ${stats.imageStats.totalImagesAnalyzed} analyzed`)

// 📤 Export
const markdown = ai.exportMarkdown()
```

## Supported Languages (Code Writer)

TypeScript, JavaScript, Python, Rust, Go, Java, C, C++, C#, Swift,
Kotlin, Ruby, PHP, HTML, CSS, SQL, Bash, PowerShell, R, Dart,
Scala, Lua, Haskell, Elixir

## Supported Image Formats (Vision AI)

PNG, JPEG, GIF, WebP
