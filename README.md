# 🤖 Ai — Complete Integrated AI System

[![CI](https://github.com/hamahasan441-png/Ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hamahasan441-png/Ai/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-2.3.0-orange)](https://github.com/hamahasan441-png/Ai/releases)

**1,886+ source files · 36+ modules · 39 tools · 50+ commands — ALL connected into one AI.**

## 🚀 Quick Installation

### Linux (one-line)
```bash
curl -fsSL https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-linux.sh | bash
```

With optional features:
```bash
curl -fsSL https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-linux.sh | bash -s -- --with-voice --with-sqlite
```

### Windows (PowerShell, one-line)
```powershell
irm https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-windows.ps1 | iex
```

### Termux (Android)
```bash
curl -fsSL https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-termux.sh | bash
```

With all optional features:
```bash
curl -fsSL https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-termux.sh | bash -s -- --full
```

Or install dependencies manually using `requirements.txt`:
```bash
pkg update && pkg install -y nodejs-lts git build-essential python make clang
git clone https://github.com/hamahasan441-png/Ai.git && cd Ai
npm install
```

### Docker
```bash
docker build -t ai .
docker run -it --rm ai
```

### From Source (Development)
```bash
git clone https://github.com/hamahasan441-png/Ai.git
cd Ai
npm install
npm test
```

## 🦙 Local LLM Setup (Ollama & Qwen)

This AI runs **fully offline** using local LLMs via [Ollama](https://ollama.com). No API keys needed.

### Quick Setup

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Start the Ollama server
ollama serve &

# 3. Download recommended models
ollama pull qwen2.5-coder:7b    # Primary — code specialist (4.7 GB)
ollama pull llama3.2:3b          # Secondary — general purpose (2.0 GB)

# 4. Start our AI (auto-connects to Ollama)
npm start
```

Or use our management scripts:
```bash
npm run ollama-models -- --recommended    # Pull recommended models via script
npm run download-models -- --all          # Download GGUF files from HuggingFace
```

### Available Qwen Models

| Model | Command | Size | RAM | Best For |
|-------|---------|------|-----|----------|
| Qwen 2.5 Coder 0.5B | `ollama pull qwen2.5-coder:0.5b` | 400 MB | 1 GB | Ultra-light, low-resource |
| Qwen 2.5 Coder 1.5B | `ollama pull qwen2.5-coder:1.5b` | 1 GB | 2 GB | Fast, mobile/embedded |
| Qwen 2.5 Coder 3B | `ollama pull qwen2.5-coder:3b` | 2 GB | 4 GB | Good quality, moderate |
| **Qwen 2.5 Coder 7B** ★ | `ollama pull qwen2.5-coder:7b` | **4.7 GB** | **6 GB** | **Recommended** |
| Qwen 2.5 Coder 14B | `ollama pull qwen2.5-coder:14b` | 9 GB | 12 GB | High quality |
| Qwen 2.5 Coder 32B | `ollama pull qwen2.5-coder:32b` | 20 GB | 24 GB | Very high quality |
| Qwen 2.5 72B | `ollama pull qwen2.5:72b` | 44 GB | 48 GB | Maximum quality |

### Other Supported Models

```bash
ollama pull llama3.1:8b          # LLaMA 3.1 — better general reasoning
ollama pull mistral:7b           # Mistral — strong reasoning
ollama pull codellama:7b         # CodeLlama — Meta code model
ollama pull deepseek-coder:6.7b  # DeepSeek Coder
ollama pull phi3:mini            # Phi-3 Mini — Microsoft efficient model
ollama pull gemma2:9b            # Gemma 2 — Google model
ollama pull starcoder2:7b        # StarCoder 2 — code completion
```

### How It Connects

The AI auto-detects Ollama at `localhost:11434` and uses models through these components:

| Component | What It Does |
|-----------|-------------|
| `QwenLocalLLM` | Direct Qwen inference — code generation, completions |
| `LocalLLMBridge` | Smart routing — picks best model/method per query |
| `ModelSpark` | Dual-model ensemble — Qwen + LLaMA for best quality |

**📖 Full guide:** [docs/OLLAMA_QWEN_GUIDE.md](docs/OLLAMA_QWEN_GUIDE.md) — installation, configuration, troubleshooting, and advanced usage.

---

## ✨ What's New in v2.2

### 📋 Structured Logging (NEW)
Production-ready structured logging with log levels, correlation IDs, and child loggers:
```ts
import { logger, createLogger } from './utils/logger.js'

// Default app logger
logger.info('Server started', { port: 3000 })
logger.error('Request failed', { userId: 123, error: 'timeout' })

// Child logger with inherited context
const cacheLog = logger.child({ service: 'cache' })
cacheLog.debug('Cache miss', { key: 'user:123' })

// Correlation ID tracking
logger.setCorrelationId('req-abc-123')
logger.info('Processing request')  // All entries tagged with correlationId
```
- **6 log levels**: trace, debug, info, warn, error, fatal
- **JSON output** in production, pretty-print in development
- **Correlation IDs** for distributed tracing
- **Child loggers** with inherited context

### 🛡️ Input Validation Framework (NEW)
Unified security validation layer for all tool inputs:
```ts
import { validateToolInput, detectSqlInjection, compose, maxLength } from './utils/inputValidation.js'

// Validate tool inputs before execution
const result = validateToolInput('database', {
  command: 'query',
  connection_string: 'sqlite:///data.db',
  sql: userInput,  // Automatically checked for SQL injection
})
if (!result.valid) throw result.errors[0]

// Composable validators
const validateQuery = compose(isNonEmptyString, maxLength(10000), detectSqlInjection)
```
- **SQL injection** detection (14 patterns)
- **Command injection** prevention (6 patterns)
- **Path traversal** blocking
- **Schema-based** validation for all tool inputs

### 🔄 API Retry & Circuit Breaker (NEW)
Resilient API call wrapper with exponential backoff:
```ts
import { RetryPolicy, CircuitBreaker, withResilience } from './services/apiRetry.js'

// Retry with exponential backoff + jitter
const retry = new RetryPolicy({ maxRetries: 3, baseDelayMs: 1000 })
const result = await retry.execute(() => callClaudeAPI(prompt))

// Circuit breaker prevents cascading failures
const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 30000 })
const data = await breaker.execute(() => externalService())
```

### 🧩 Plugin SDK (NEW)
Full plugin development kit with lifecycle management:
```ts
import { PluginSDK, definePlugin } from './plugins/PluginSDK.js'

const sdk = new PluginSDK()
sdk.register(definePlugin({
  manifest: {
    id: 'my-translator',
    name: 'Translator Plugin',
    version: '1.0.0',
    description: 'Translates text',
    permissions: ['services:api', 'knowledge:write'],
  },
  tools: [{ name: 'translate', description: 'Translate text', execute: async (input) => ... }],
  knowledge: [{ category: 'translation', keywords: 'translate language', content: '...' }],
}))
await sdk.activate('my-translator')
```
- **Manifest schema** with validation
- **Lifecycle hooks** (onInstall, onActivate, onDeactivate, onUninstall)
- **11 permission types** for sandboxed execution
- **Dependency resolution** between plugins
- **Plugin-provided** tools, commands, and knowledge

### 📊 Observability & Metrics (NEW)
OpenTelemetry-compatible metrics collection:
```ts
import { metrics } from './services/metrics.js'

metrics.counter('requests_total', 'Total requests').inc({ method: 'chat' })
metrics.histogram('response_time_ms', 'Latency').observe(42, { endpoint: '/chat' })
metrics.gauge('active_sessions', 'Sessions').set(sessionCount)

const snapshot = metrics.snapshot()  // All metrics as JSON
```
- **Counter**, **Gauge**, **Histogram** metric types
- **Labeled dimensions** for multi-dimensional analysis
- **Percentiles** (P50, P95, P99) for histograms
- **JSON export** for dashboards

---

## ✨ What's New in v2

### 🗄️ DatabaseTool (NEW)
Query SQLite, PostgreSQL, and MySQL databases directly from the AI:
```ts
// List tables, run queries, explore schemas
await ai.tools.database({ command: 'tables', connection_string: 'sqlite:///data.db' })
await ai.tools.database({ command: 'query', connection_string: 'sqlite:///data.db', sql: 'SELECT * FROM users LIMIT 10' })
```
- **Read-only by default** for safety
- **Lazy-loaded drivers** — no startup bloat
- Supports: SQLite (embedded), PostgreSQL, MySQL

### ⚡ Caching Service (NEW)
Multi-tier caching for AI responses, knowledge, and tool results:
```ts
import { initCache, withCache, getCacheStats } from './services/cache/index.js'

initCache({ enableDisk: true })
const response = await withCache('chat:key', () => expensiveApiCall())
console.log(getCacheStats())  // { memory: { hits: 5, misses: 1 }, disk: { ... } }
```
- **L1: Memory** — LRU in-memory (session-scoped, fast)
- **L2: Disk** — Persistent JSON files (cross-session, TTL-based)

### 🧠 LocalBrain Self-Learning v2 (ENHANCED)
Major upgrades to the offline AI brain:
- **TF-IDF Pattern Matching** — Semantic similarity instead of just keywords
- **Confidence Decay** — Unused patterns fade, reinforced ones persist
- **Cross-Session Persistence** — Auto-save/load brain state to disk
- **Conflict Resolution** — Smart priority system when patterns clash
- **Multi-Turn Feedback** — Give feedback on any conversation turn
- **Learning Priorities** — `cloud-learned` > `user-corrected` > `reinforced` > `learned`
- **Export/Import** — Share brain state between machines

### 🧩 Intelligence Modules (NEW)
Five cognitive modules that enhance LocalBrain with advanced capabilities:

| Module | What It Does |
| --- | --- |
| `SemanticEngine` | Dense vector embeddings, cosine similarity, synonym expansion, disambiguation |
| `IntentEngine` | Multi-intent classification (18 intent types), entity extraction (9 entity types) |
| `ContextManager` | Sliding-window context tracking, topic detection, entity decay, pronoun resolution |
| `ReasoningEngine` | Chain-of-thought reasoning: decompose → plan → solve → verify pipeline |
| `MetaCognition` | Confidence calibration, knowledge gap detection, epistemic state tracking |

```ts
import { SemanticEngine, IntentEngine, ContextManager, ReasoningEngine, MetaCognition } from './chat/index.js'

// Use individually
const semantic = new SemanticEngine()
const results = semantic.findSimilar('database query', documents)

const intent = new IntentEngine()
const classified = intent.classify('Write a React component')
// → { primary: { label: 'code_write', confidence: 0.95 }, entities: [...] }

const reasoning = new ReasoningEngine()
const result = reasoning.reason('Compare REST vs GraphQL')
// → { answer: '...', steps: [...], confidence: 0.85, alternatives: [...] }

// Or use via LocalBrain (auto-integrated when enableIntelligence: true)
const brain = new LocalBrain({ enableIntelligence: true })
const stats = brain.getIntelligenceStats()
// → { enabled: true, contextTurns: 5, contextTopicCount: 3, ... }
```

## What Is This?

An AI system that **uses every file in the repository**. Three files work together:

| File | Lines | What It Does |
| --- | --- | --- |
| `src/chat/AiChat.ts` | 1,526 | 🧠 **AI Brain** — Chat, code writing (24 langs), image analysis, search, analytics, export |
| `src/chat/AiIntegration.ts` | 1,001 | 🔗 **Integration Layer** — Imports from ALL 36+ modules, wires 38 tools, 50+ commands, services |
| `src/chat/index.ts` | 135+ | 📦 **Public API** — Clean exports for everything |

## Architecture — How ALL Files Connect

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IntegratedAI (AiIntegration.ts)                     │
│                                                                             │
│   ┌──────────────┐  ┌────────────────┐  ┌────────────────────────────────┐ │
│   │ 🧠 AiChat.ts │  │ 🔧 38 Tools    │  │ ⚡ QueryEngine.ts             │ │
│   │              │  │                │  │                                │ │
│   │ Chat         │  │ BashTool       │  │ Agentic loop:                  │ │
│   │ Code Writer  │  │ FileReadTool   │  │  1. Send to Claude API         │ │
│   │ Image AI     │  │ FileWriteTool  │  │  2. Detect tool calls          │ │
│   │ Search       │  │ FileEditTool   │  │  3. Execute tools              │ │
│   │ Analytics    │  │ GrepTool       │  │  4. Return results             │ │
│   │ Export       │  │ GlobTool       │  │  5. Loop until done            │ │
│   │ Branching    │  │ WebFetchTool   │  │                                │ │
│   │              │  │ WebSearchTool  │  └────────────────────────────────┘ │
│   └──────────────┘  │ AgentTool      │                                     │
│                     │ MCPTool        │  ┌────────────────────────────────┐ │
│   ┌──────────────┐  │ LSPTool        │  │ 📋 50+ Commands               │ │
│   │ 🌍 Context   │  │ NotebookTool   │  │                                │ │
│   │              │  │ TaskTools (6)  │  │ /commit  /diff   /help         │ │
│   │ Git status   │  │ TeamTools (2)  │  │ /review  /mcp    /login        │ │
│   │ Environment  │  │ PlanTools (2)  │  │ /config  /memory /doctor       │ │
│   │ User prefs   │  │ WorktreeTools  │  │ /init    /cost   /resume       │ │
│   └──────────────┘  │ + 15 more...   │  │ + 40 more...                   │ │
│                     └────────────────┘  └────────────────────────────────┘ │
│                                                                             │
│   ┌──────────────┐  ┌────────────────┐  ┌────────────────────────────────┐ │
│   │ 📡 Services  │  │ 🎯 Skills      │  │ 🤝 Coordinator                │ │
│   │              │  │                │  │                                │ │
│   │ Claude API   │  │ Bundled        │  │ Multi-agent                    │ │
│   │ MCP servers  │  │ File-loaded    │  │ Parallel tasks                 │ │
│   │ Analytics    │  │ MCP-sourced    │  │ Team management                │ │
│   │ OAuth        │  │                │  │                                │ │
│   │ Compacting   │  └────────────────┘  └────────────────────────────────┘ │
│   └──────────────┘                                                         │
│                                                                             │
│   ┌──────────────┐  ┌────────────────┐  ┌────────────────────────────────┐ │
│   │ 💾 State     │  │ 🧠 Memory      │  │ 🔌 Plugins                    │ │
│   │              │  │                │  │                                │ │
│   │ AppState     │  │ Persistent     │  │ Custom tools                   │ │
│   │ Store        │  │ Cross-session  │  │ Custom commands                │ │
│   │ Selectors    │  │ Memory prompt  │  │ Extensibility                  │ │
│   └──────────────┘  └────────────────┘  └────────────────────────────────┘ │
│                                                                             │
│   ┌──────────────┐  ┌────────────────┐  ┌────────────────────────────────┐ │
│   │ 💰 Cost      │  │ 🎤 Voice       │  │ 🖥 UI (Ink + React)           │ │
│   │              │  │                │  │                                │ │
│   │ Real-time    │  │ Speech-to-text │  │ Screens (REPL, Doctor)         │ │
│   │ Per-model    │  │ Transcription  │  │ Components                     │ │
│   │ Total spend  │  │ Audio I/O      │  │ Keybindings                    │ │
│   └──────────────┘  └────────────────┘  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Every Module and What It Does

| Module | Files | What It Contributes to the AI |
| --- | --- | --- |
| `src/chat/AiChat.ts` | 1 | 🧠 Core brain — chat, code (24 langs), images, search, analytics, export |
| `src/chat/AiIntegration.ts` | 1 | 🔗 Integration layer — connects brain to all modules |
| `src/chat/LocalBrain.ts` | 1 | 🧠 Standalone offline brain — self-learning, no API needed |
| `src/chat/HybridBrain.ts` | 1 | 🌐🧠 Cloud + offline hybrid — auto-fallback, self-learning |
| `src/chat/DevBrain.ts` | 1 | 🔓 Private dev brain — LocalBrain + OpenAI, unrestricted |
| `src/chat/SemanticEngine.ts` | 1 | 📐 Semantic similarity — vector embeddings, cosine search, disambiguation |
| `src/chat/IntentEngine.ts` | 1 | 🎯 Intent detection — 18 intents, entity extraction, compound parsing |
| `src/chat/ContextManager.ts` | 1 | 📋 Context tracking — sliding window, topic detection, entity decay |
| `src/chat/ReasoningEngine.ts` | 1 | 🔗 Chain-of-thought — decompose → plan → solve → verify pipeline |
| `src/chat/MetaCognition.ts` | 1 | 🔮 Meta-cognition — confidence calibration, knowledge gap detection |
| `src/chat/codemaster/` | 5 | 🔍 Code intelligence — analysis, review, auto-fix, decomposition, learning |
| `src/tools/` | 38 dirs | 🔧 38 executable tools (bash, files, web, search, agents, MCP, tasks...) |
| `src/tools.ts` | 1 | Tool registry — permission-filtered tool loading |
| `src/Tool.ts` | 1 | Tool type system — `buildTool()` factory |
| `src/QueryEngine.ts` | 1 | ⚡ Agentic loop — stream → detect → execute → loop |
| `src/commands.ts` | 1 | 📋 Command registry — 50+ slash commands |
| `src/commands/` | 50+ | Command implementations |
| `src/services/api/` | 10+ | 📡 Claude API client — streaming, tokens, errors |
| `src/services/mcp/` | 10+ | MCP servers — external tool integration |
| `src/services/analytics/` | 5+ | 📊 Usage analytics & telemetry |
| `src/services/compact/` | 5+ | Message compacting — fit context window |
| `src/services/oauth/` | 5+ | 🔐 Authentication & authorization |
| `src/skills/` | 4 | 🎯 Skill system — reusable AI behaviors |
| `src/state/` | 6 | 💾 Application state — central store |
| `src/context.ts` | 1 | 🌍 System & user context — git, env, project |
| `src/context/` | 8+ | React contexts — notifications, modal, voice |
| `src/coordinator/` | 5+ | 🤝 Multi-agent orchestration |
| `src/screens/` | 5+ | 🖥 UI screens — REPL, Doctor, Resume |
| `src/components/` | 15+ | React components for terminal UI |
| `src/voice/` | 5+ | 🎤 Voice I/O — speech-to-text |
| `src/hooks/` | 10+ | React hooks — permissions, component logic |
| `src/utils/` | 20+ | 🛠 Utilities — auth, config, format, debug |
| `src/memdir/` | 3+ | 🧠 Persistent memory across sessions |
| `src/plugins/` | 3+ | 🔌 Plugin system — extensibility |
| `src/schemas/` | 3+ | Data validation schemas |
| `src/bridge/` | 5+ | Bridge API client connections |
| `src/remote/` | 5+ | Remote session & WebSocket |
| `src/buddy/` | 3+ | Companion sprite system |
| `src/vim/` | 3+ | Vim editor integration |
| `src/ink/` | 10+ | Terminal UI rendering (ink) |
| `src/keybindings/` | 3+ | Keyboard shortcut handling |
| `src/entrypoints/` | 3+ | SDK entry points |
| `src/bootstrap/` | 5+ | App startup & initialization |
| `src/query/` | 5+ | Token budgeting & query config |
| `src/tasks/` | 3+ | Task management |
| `src/types/` | 10+ | TypeScript type definitions |
| `src/constants/` | 5+ | App-wide constants |

## Quick Start

```ts
import { IntegratedAI, MODULE_DIRECTORY } from './chat/index.js'

// Create the integrated AI (uses ALL modules)
const ai = new IntegratedAI({
  title: 'My Session',
  model: 'claude-sonnet-4-20250514',
})

// 💬 Chat (uses AiChat.ts brain → Claude API)
await ai.chat_send('Explain this project')

// 💻 Write code (uses Code Writer — 24 languages)
await ai.writeCode({ description: 'REST API', language: 'typescript', style: 'production' })

// 🖼 Analyze images (uses Image Analyzer — like Claude Opus vision)
await ai.analyzeImage({ imageData: base64, mediaType: 'image/png' })

// 🔧 See all 38 tools
console.log(`Tools: ${ai.getToolCount()}`)  // 38

// 📋 See all 50+ commands
const cmds = await ai.getAvailableCommands()

// 🌍 Get project context
const ctx = await ai.getProjectContext()

// 🧠 Load persistent memory
const memory = await ai.loadMemory()

// 💰 Track costs
const costs = ai.getCostStats()

// 📊 Full stats from ALL modules
const stats = ai.getFullStats()
console.log(stats)

// 📖 See what every module does
console.log(MODULE_DIRECTORY)
```

## The 39 Tools

| Category | Tools | What They Do |
| --- | --- | --- |
| 🖥 Shell | `bash`, `powerShell` | Execute any command, build, test, deploy |
| 📁 Files | `fileRead`, `fileWrite`, `fileEdit` | Read/write/edit any file |
| 🔍 Search | `glob`, `grep`, `toolSearch` | Find files, search contents, discover tools |
| 🌐 Web | `webFetch`, `webSearch` | Fetch URLs, search the internet |
| 🗄 Database | `database` | Query SQLite, PostgreSQL, MySQL databases |
| 📓 Notebooks | `notebookEdit` | Edit Jupyter notebooks |
| 🤖 Agents | `agent`, `skill`, `sendMessage` | Spawn sub-agents, run skills |
| 📋 Tasks | `taskCreate/Get/List/Output/Stop/Update` | Full task management |
| 👥 Teams | `teamCreate`, `teamDelete` | Multi-agent team coordination |
| 🔌 MCP | `mcp`, `mcpList/Read/Auth` | External tool server connections |
| 📝 Planning | `enterPlanMode`, `exitPlanMode` | Structured planning workflow |
| 🌿 Git | `enterWorktree`, `exitWorktree` | Git worktree management |
| ✅ Productivity | `todoWrite`, `brief`, `config`, `askUser` | Todos, briefs, config |
| 🔗 LSP | `lsp` | Language Server Protocol integration |

## Code Writer — 24 Languages

TypeScript, JavaScript, Python, Rust, Go, Java, C, C++, C#, Swift,
Kotlin, Ruby, PHP, HTML, CSS, SQL, Bash, PowerShell, R, Dart,
Scala, Lua, Haskell, Elixir

## Image Analysis (Vision AI)

Supported formats: PNG, JPEG, GIF, WebP

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and pull request guidelines.

## Security

To report security vulnerabilities, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the [ISC License](LICENSE).
