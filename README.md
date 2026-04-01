# 🤖 Ai — Complete Integrated AI System

**1,886 source files · 36+ modules · 38 tools · 50+ commands — ALL connected into one AI.**

## What Is This?

An AI system that **uses every file in the repository**. Three files work together:

| File | Lines | What It Does |
| --- | --- | --- |
| `src/chat/AiChat.ts` | 1,526 | 🧠 **AI Brain** — Chat, code writing (24 langs), image analysis, search, analytics, export |
| `src/chat/AiIntegration.ts` | 1,001 | 🔗 **Integration Layer** — Imports from ALL 36+ modules, wires 38 tools, 50+ commands, services |
| `src/chat/index.ts` | 135+ | 📦 **Public API** — Clean exports for everything |

## Prerequisites

- **[Bun](https://bun.sh/)** v1.0 or later — this project uses Bun as its JavaScript/TypeScript runtime
- **Git** — for version control and project context features
- **Access to Claude** — via one of these providers:
  - [Anthropic API key](https://console.anthropic.com/settings/keys) (direct)
  - [AWS Bedrock](https://aws.amazon.com/bedrock/) (use Claude through your AWS account)
  - [Google Cloud Vertex AI](https://cloud.google.com/vertex-ai) (use Claude through GCP)
  - [Azure AI Foundry](https://azure.microsoft.com/en-us/products/ai-foundry) (use Claude through Microsoft Azure)

### Install Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
```

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/hamahasan441-png/Ai.git
cd Ai

# 2. Install dependencies
bun install
```

## Configuration

You need **one** of the following authentication methods to access Claude.

### Option 1: Anthropic API Key (Direct)

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Get your API key from the [Anthropic Console](https://console.anthropic.com/settings/keys).

### Option 2: AWS Bedrock (No Anthropic Key Needed)

Use Claude through your AWS account — no separate Anthropic API key required.

```bash
export CLAUDE_CODE_USE_BEDROCK=1

# AWS region (defaults to us-east-1)
export AWS_REGION="us-east-1"
```

Authentication uses your standard AWS credentials (environment variables, `~/.aws/credentials`, or IAM roles). Make sure your AWS account has [access to Claude models on Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html).

### Option 3: Google Cloud Vertex AI (No Anthropic Key Needed)

Use Claude through Google Cloud — no separate Anthropic API key required.

**Step-by-step setup:**

1. **Create a Google Cloud account** — sign up at [cloud.google.com](https://cloud.google.com/) (free tier available with $300 credits)

2. **Create a GCP project** — in the [GCP Console](https://console.cloud.google.com/), create a new project (or use an existing one) and note the **project ID**

3. **Enable the Vertex AI API** — go to [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) and click **Enable** for your project

4. **Enable Claude models** — in the [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden), find Claude models and enable access ([full instructions](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude))

5. **Install the Google Cloud CLI** — follow the [gcloud CLI install guide](https://cloud.google.com/sdk/docs/install)

6. **Authenticate locally:**
   ```bash
   gcloud auth application-default login
   ```

7. **Set environment variables:**
   ```bash
   export CLAUDE_CODE_USE_VERTEX=1
   export ANTHROPIC_VERTEX_PROJECT_ID="your-gcp-project-id"

   # Region (optional, defaults to us-east5)
   export CLOUD_ML_REGION="us-east5"
   ```

> **Note:** Vertex AI does not use a traditional API key. Authentication is handled through your Google Cloud credentials (gcloud CLI login, service account JSON file via `GOOGLE_APPLICATION_CREDENTIALS`, or managed identity on GCP).

### Option 4: Azure AI Foundry (No Anthropic Key Needed)

Use Claude through Microsoft Azure — no separate Anthropic API key required.

```bash
export CLAUDE_CODE_USE_FOUNDRY=1

# Provide one of:
export ANTHROPIC_FOUNDRY_RESOURCE="your-azure-resource-name"
# or
export ANTHROPIC_FOUNDRY_BASE_URL="https://your-resource.azure.com"

# Optional: API key (otherwise uses Azure Default Credentials)
export ANTHROPIC_FOUNDRY_API_KEY="your-foundry-api-key"
```

Authentication uses an Azure API key or [Azure Default Credentials](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential) (environment variables, managed identity, or Azure CLI).

### Optional Environment Variables

| Variable | Description |
| --- | --- |
| `GITHUB_TOKEN` | GitHub authentication for git operations and PR features |

## How to Run

### Run the CLI (Interactive REPL)

```bash
# Start the interactive AI REPL
bun run src/entrypoints/cli.tsx
```

This launches an interactive terminal session where you can chat with the AI, run commands, and use all 38 built-in tools.

### Run with a Prompt (Non-Interactive)

```bash
# Send a single prompt and get a response
bun run src/entrypoints/cli.tsx "Explain this project"
```

### Run as an MCP Server

```bash
# Start as a Model Context Protocol server
bun run src/entrypoints/mcp.ts
```

### Use Programmatically (SDK)

```ts
import { IntegratedAI, MODULE_DIRECTORY } from './src/chat/index.js'

const ai = new IntegratedAI({
  title: 'My Session',
  model: 'claude-sonnet-4-20250514',
})

// Send a chat message
await ai.chat_send('Explain this project')

// Write code in any of 24 supported languages
await ai.writeCode({ description: 'REST API', language: 'typescript', style: 'production' })

// Analyze an image
await ai.analyzeImage({ imageData: base64, mediaType: 'image/png' })

// Get available tools and commands
console.log(`Tools: ${ai.getToolCount()}`)        // 38 tools
const cmds = await ai.getAvailableCommands()       // 50+ commands
```

## Usage Guide

### Interactive Commands

Once in the REPL, use `/` commands to interact with the system:

| Command | What It Does |
| --- | --- |
| `/help` | Show all available commands |
| `/commit` | Create a git commit with AI-generated message |
| `/diff` | Show current git diff |
| `/review` | AI code review of changes |
| `/config` | View or update configuration |
| `/cost` | Show API usage and cost tracking |
| `/memory` | Manage persistent AI memory |
| `/doctor` | Diagnose and fix common issues |
| `/model` | Switch the active AI model |
| `/exit` | Exit the session |

### Example Workflows

**Chat and ask questions:**
```
> What does the src/tools/ directory contain?
> Explain how the QueryEngine agentic loop works
```

**Write and edit code:**
```
> Write a REST API server in TypeScript with error handling
> Edit src/utils/format.ts to add a new date formatter
```

**Work with git:**
```
> /diff
> /commit
> /review
```

**Search and explore:**
```
> Find all files that import from the services/ directory
> Search for TODO comments in the codebase
```

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

## Programmatic API Reference

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

## The 38 Tools

| Category | Tools | What They Do |
| --- | --- | --- |
| 🖥 Shell | `bash`, `powerShell` | Execute any command, build, test, deploy |
| 📁 Files | `fileRead`, `fileWrite`, `fileEdit` | Read/write/edit any file |
| 🔍 Search | `glob`, `grep`, `toolSearch` | Find files, search contents, discover tools |
| 🌐 Web | `webFetch`, `webSearch` | Fetch URLs, search the internet |
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

## Troubleshooting

### "No API key" or authentication errors

This project **requires** access to Claude through one of four providers. It will not work without any authentication configured.

| Error | Cause | Fix |
| --- | --- | --- |
| `No API key or cloud provider configured` | No `ANTHROPIC_API_KEY` and no cloud provider env var set | Set up any of the 4 options in [Configuration](#configuration) |
| `Invalid API key` | `ANTHROPIC_API_KEY` is set but incorrect or expired | Get a new key from [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `Authentication failed` on Vertex AI | GCP credentials expired or not set up | Run `gcloud auth application-default login` |
| `Authentication failed` on Bedrock | AWS credentials missing or expired | Check `~/.aws/credentials` or run `aws configure` |

### Quick check: is auth configured?

```ts
import { AiBrain } from './src/chat/index.js'

const brain = new AiBrain()
const check = brain.validateConfig()
if (!check.ok) {
  console.error(check.message) // Shows all 4 auth options with exact commands
}
```

### Which option should I choose?

| Option | Best For | Cost |
| --- | --- | --- |
| **Anthropic API Key** | Quickest to start, personal projects | Pay-per-use via Anthropic |
| **AWS Bedrock** | Teams already on AWS, enterprise | Via your AWS bill |
| **Google Vertex AI** | Teams already on GCP, $300 free credits | Via your GCP bill |
| **Azure AI Foundry** | Teams already on Azure, enterprise | Via your Azure bill |
