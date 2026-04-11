# 📖 Commands, Chat Usage & Model Management Guide

Complete reference for running the AI, using chat features, managing models, and all available commands. Everything runs locally — no external API keys needed.

---

## Table of Contents

- [1. Run Commands](#1-run-commands)
- [2. Chat Usage](#2-chat-usage)
- [3. Model Commands](#3-model-commands)
- [4. Slash Commands Reference](#4-slash-commands-reference)
- [5. Tool Commands](#5-tool-commands)
- [6. Dashboard](#6-dashboard)
- [7. Development Commands](#7-development-commands)
- [8. Environment Configuration](#8-environment-configuration)
- [9. Docker Commands](#9-docker-commands)
- [10. Quick Reference Card](#10-quick-reference-card)

---

## 1. Run Commands

### Start the AI

```bash
# Start the AI CLI (interactive chat mode)
npm start

# Same as npm start (development mode)
npm run dev

# Start with a specific prompt
npm start -- "Explain how binary search works"

# Start in a specific directory
cd /path/to/project && npm start
```

### Setup & Installation

```bash
# Full setup (installs deps, checks Ollama, downloads models)
npm run setup

# Setup with auto-yes (non-interactive)
npm run setup -- --yes

# Setup, skip Ollama check
npm run setup -- --skip-ollama

# Setup, skip model downloads
npm run setup -- --skip-models

# Install dependencies only
npm install
```

### Model Downloads

```bash
# Interactive model download menu
npm run download-models

# Download Qwen 2.5 Coder 7B (recommended code model)
npm run download-models -- --qwen

# Download LLaMA 3.2 3B (recommended general model)
npm run download-models -- --llama

# Download both default models
npm run download-models -- --all

# List all available GGUF models with status
npm run download-models -- --list

# Download a specific model variant
npm run download-models -- --model qwen-7b-q8
npm run download-models -- --model qwen-7b-q4
npm run download-models -- --model qwen-7b-q5
npm run download-models -- --model qwen-7b-q3
npm run download-models -- --model qwen-7b-q2
npm run download-models -- --model qwen-1.5b-q4
npm run download-models -- --model qwen-1.5b-q8
npm run download-models -- --model qwen-3b-q4
npm run download-models -- --model qwen-3b-q8
npm run download-models -- --model llama-3b-q4
npm run download-models -- --model llama-8b-q4
npm run download-models -- --model llama-8b-q8
```

### Ollama Model Management

```bash
# Interactive Ollama model manager
npm run ollama-models

# Pull recommended models (Qwen 2.5 Coder 7B + LLaMA 3.2 3B)
npm run ollama-models -- --recommended

# Pull all supported models
npm run ollama-models -- --all

# List all models with install status
npm run ollama-models -- --list

# Pull a specific model
npm run ollama-models -- --pull qwen2.5-coder:7b
npm run ollama-models -- --pull llama3.2:3b
npm run ollama-models -- --pull mistral:7b

# Check Ollama server health
npm run ollama-models -- --health

# Remove a model
npm run ollama-models -- --remove qwen2.5-coder:7b
```

### Dashboard

```bash
# Start the web UI dashboard (default: http://localhost:3210)
npm run dashboard

# With custom port
AI_DASHBOARD_PORT=8080 npm run dashboard
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npx vitest

# Run a specific test file
npx vitest run src/chat/__tests__/ModelSpark.test.ts

# Run tests matching a pattern
npx vitest run --grep "LocalBrain"
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix lint errors automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Auto-format code
npm run format

# TypeScript type checking
npm run typecheck

# Build (compile TypeScript)
npm run build
```

---

## 2. Chat Usage

### Starting a Chat Session

```bash
# Start interactive chat
npm start

# The AI will greet you and wait for input
# Type your message and press Enter
```

### Chat Examples

Once the AI is running, you can have conversations like:

```
You: Write a Python function to sort a list using merge sort
AI: Here's a merge sort implementation...

You: Now add type hints and docstrings
AI: Here's the updated version with type hints...

You: Can you also write unit tests for it?
AI: Here are pytest tests for the merge sort function...
```

### Chat Features

| Feature | How to Use | Description |
|---------|-----------|-------------|
| **Free-form chat** | Just type naturally | Ask questions, get explanations |
| **Code generation** | "Write a function to..." | Generate code in 24 languages |
| **Code review** | "Review this code..." | Analyze and improve code |
| **Code explanation** | "Explain how this works" | Understand complex code |
| **Debugging help** | "Why does this error happen" | Debug errors and exceptions |
| **Multi-turn** | Ask follow-up questions | Context is maintained across turns |
| **File operations** | "Read file X" / "Edit file Y" | Read, write, edit files |
| **Shell commands** | "Run the tests" | Execute bash/shell commands |
| **Web search** | "Search for..." | Search the internet |
| **Image analysis** | Provide image data | Analyze PNG, JPEG, GIF, WebP |

### Using the Chat via Code (TypeScript API)

```typescript
import { IntegratedAI } from './chat/index.js'

const ai = new IntegratedAI({ title: 'My Session' })

// Simple chat
await ai.chat_send('Hello! How are you?')

// Code generation
await ai.writeCode({
  description: 'REST API with Express',
  language: 'typescript',
  style: 'production',
})

// Image analysis
await ai.analyzeImage({
  imageData: base64Image,
  mediaType: 'image/png',
})
```

### Using LocalBrain (Offline Chat)

```typescript
import { LocalBrain } from './chat/index.js'

const brain = new LocalBrain({ enableIntelligence: true })

// Chat with the offline brain
const response = brain.chat('What is a binary search tree?')
console.log(response.text)
console.log(response.confidence) // 0.0–1.0

// Teach the brain
brain.learn({
  pattern: 'kubernetes pod',
  response: 'A Pod is the smallest deployable unit in Kubernetes...',
  category: 'devops',
})

// Export/import brain state
const state = brain.export()
brain.import(state)
```

### Using ModelSpark (Dual-Model Ensemble)

```typescript
import { ModelSpark } from './chat/index.js'

const spark = new ModelSpark({
  primaryModel: 'qwen2.5-coder:7b',
  secondaryModel: 'llama3.2:3b',
})

// Basic inference
const result = await spark.infer('Explain the Observer pattern')
console.log(result.text)
console.log(result.confidence)

// Ensemble mode (both models answer, best wins)
const result2 = await spark.infer('Write a sorting algorithm', {
  strategy: 'ensemble',
})

// Available strategies:
// - route:           Smart routing to best model
// - ensemble:        Both models, pick best
// - cascade:         Try primary, fallback to secondary
// - speculative:     Fast draft + quality check
// - fusion:          Merge both responses
// - parallel_race:   First to finish wins
// - chain_of_thought: Step-by-step reasoning
```

### Using QwenLocalLLM (Direct LLM Access)

```typescript
import { QwenLocalLLM } from './chat/index.js'

const qwen = new QwenLocalLLM({
  backend: 'ollama',
  model: 'qwen2.5-coder:7b',
})

// Health check
const health = await qwen.healthCheck()

// Generate response
const response = await qwen.generate({
  prompt: 'Write a binary search in Python',
  temperature: 0.7,
  maxTokens: 2048,
})

// Streaming response
const stream = await qwen.generateStream({
  prompt: 'Explain React hooks',
})
for await (const chunk of stream) {
  process.stdout.write(chunk)
}

// Available prompt templates:
// - code_generation
// - code_review
// - code_explanation
// - bug_fix
// - general_chat
// - instruct
// - raw
```

### Using LocalLLMBridge (Smart Routing)

```typescript
import { LocalLLMBridge } from './chat/index.js'

const bridge = new LocalLLMBridge()

// The bridge auto-routes to the best method
const answer = await bridge.query('How do I implement a REST API?')
// Routes to: LLM for complex questions
// Routes to: Knowledge base for known topics
// Routes to: Hybrid for enriched answers

// Direct intent-based routing:
// - code:        Code generation/review → Qwen
// - explain:     Explanations → LLM + KB
// - debug:       Debugging → LLM + exploit knowledge
// - security:    Security questions → Cybersecurity modules
// - general:     General chat → LLM
// - search:      Search queries → Knowledge base
// - creative:    Creative tasks → LLM with high temperature
// - analysis:    Analysis → LLM + reasoning
```

### Using SparkAgent (Autonomous Agent)

```typescript
import { SparkAgent } from './chat/index.js'

const agent = new SparkAgent()

// Give a goal — agent plans and executes steps
const result = await agent.execute('Find all TODO comments in the codebase and create a summary report')

// Agent has 11 tools:
// - file_read, file_write, file_search
// - shell_exec, web_fetch
// - code_analysis, code_modify
// - math_compute
// - memory_store, memory_recall
// - task_plan
```

### Using UnifiedOrchestrator (Master Router)

```typescript
import { UnifiedOrchestrator } from './chat/index.js'

const orchestrator = new UnifiedOrchestrator()

// Routes to the best system automatically
const result = await orchestrator.process('Optimize this algorithm')
// May use: ModelSpark, LocalBrain, SparkAgent, or Hybrid
```

---

## 3. Model Commands

### Ollama Direct Commands

```bash
# ── Download Models ──
ollama pull qwen2.5-coder:7b       # Primary code model (★ recommended)
ollama pull qwen2.5-coder:1.5b     # Small code model
ollama pull qwen2.5-coder:3b       # Medium code model
ollama pull qwen2.5-coder:14b      # Large code model
ollama pull qwen2.5-coder:32b      # Very large code model
ollama pull qwen2.5:7b             # General Qwen 7B
ollama pull qwen2.5:72b            # Maximum quality Qwen
ollama pull llama3.2:3b             # Fast general model (★ recommended)
ollama pull llama3:8b               # General model
ollama pull llama3.1:8b             # Improved general model
ollama pull mistral:7b              # Reasoning specialist
ollama pull codellama:7b            # Meta code model
ollama pull deepseek-coder:6.7b    # Code specialist
ollama pull phi3:mini               # Efficient small model
ollama pull gemma2:9b               # Google model
ollama pull starcoder2:7b           # Code completion

# ── List & Info ──
ollama list                         # List all downloaded models
ollama show qwen2.5-coder:7b       # Show model details
ollama ps                           # Show running models + GPU info

# ── Run & Test Models ──
ollama run qwen2.5-coder:7b        # Start interactive chat
ollama run qwen2.5-coder:7b "Write hello world in Rust"  # One-shot prompt
ollama run llama3.2:3b "Summarize this text: ..."

# ── Server Management ──
ollama serve                        # Start Ollama server
ollama serve &                      # Start in background

# ── Remove Models ──
ollama rm qwen2.5-coder:7b         # Remove specific model
ollama rm llama3.2:3b

# ── Create Custom Models ──
ollama create my-model -f Modelfile  # Create from Modelfile
ollama cp qwen2.5-coder:7b my-qwen  # Copy/rename a model
```

### AI Slash Commands for Models

Inside the AI chat, use slash commands:

```
/model                    Show current model
/model qwen2.5-coder:7b  Switch to Qwen 2.5 Coder 7B
/model llama3.2:3b        Switch to LLaMA 3.2 3B
/model mistral:7b         Switch to Mistral 7B
```

### Custom Modelfiles

Create specialized model configurations:

```bash
# Create a code-focused Qwen profile
cat > Modelfile-code << 'EOF'
FROM qwen2.5-coder:7b

PARAMETER temperature 0.2
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER repeat_penalty 1.1

SYSTEM """You are an expert software engineer. You write clean, efficient,
well-tested code. Always include error handling and type annotations.
Explain your design decisions briefly."""
EOF

ollama create qwen-code -f Modelfile-code
ollama run qwen-code "Write a rate limiter class in Python"
```

```bash
# Create a general chat profile
cat > Modelfile-chat << 'EOF'
FROM llama3.2:3b

PARAMETER temperature 0.7
PARAMETER top_p 0.95
PARAMETER num_ctx 4096

SYSTEM """You are a helpful, friendly AI assistant.
You give clear, concise answers and ask clarifying questions when needed."""
EOF

ollama create llama-chat -f Modelfile-chat
ollama run llama-chat
```

### Ollama API (for programmatic access)

```bash
# Generate a response
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:7b",
  "prompt": "Write a hello world in Go",
  "stream": false
}'

# Chat endpoint (multi-turn)
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5-coder:7b",
  "messages": [
    {"role": "system", "content": "You are a coding assistant"},
    {"role": "user", "content": "Write a REST API in Node.js"}
  ],
  "stream": false
}'

# List models
curl http://localhost:11434/api/tags

# Show model info
curl http://localhost:11434/api/show -d '{"name": "qwen2.5-coder:7b"}'

# Pull a model
curl http://localhost:11434/api/pull -d '{"name": "qwen2.5-coder:7b"}'

# Delete a model
curl http://localhost:11434/api/delete -d '{"name": "old-model"}'

# Check server version
curl http://localhost:11434/api/version

# Embeddings
curl http://localhost:11434/api/embeddings -d '{
  "model": "qwen2.5-coder:7b",
  "prompt": "What is machine learning?"
}'
```

---

## 4. Slash Commands Reference

Use these commands inside the AI chat session (type `/` followed by the command):

### Core Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/model [name]` | Show or switch the AI model |
| `/config` | View/edit AI configuration |
| `/status` | Show AI system status |
| `/version` | Show version information |
| `/clear` | Clear the chat screen |
| `/exit` | Exit the AI |

### Chat & Conversation

| Command | Description |
|---------|-------------|
| `/compact` | Compact conversation to fit context window |
| `/memory` | Manage persistent memory across sessions |
| `/resume` | Resume a previous conversation |
| `/session` | Manage chat sessions |
| `/context` | View current context (git, env, project) |
| `/summary` | Summarize the current conversation |
| `/export` | Export conversation history |

### Code & Development

| Command | Description |
|---------|-------------|
| `/review` | Review code in a file or diff |
| `/diff` | Show git diff |
| `/commit` | Create a git commit |
| `/init` | Initialize a new project |
| `/plan` | Enter planning mode |
| `/doctor` | Diagnose project issues |
| `/stats` | Show project statistics |
| `/branch` | Manage git branches |

### Tools & Agents

| Command | Description |
|---------|-------------|
| `/agents` | Manage AI sub-agents |
| `/skills` | List and use AI skills |
| `/tasks` | Manage background tasks |
| `/mcp` | Model Context Protocol servers |
| `/plugin` | Manage plugins |

### System & Configuration

| Command | Description |
|---------|-------------|
| `/cost` | Show usage costs/stats |
| `/permissions` | View/set permission levels |
| `/env` | Environment variables info |
| `/login` | Authenticate (for remote features) |
| `/logout` | Log out |
| `/feedback` | Send feedback |
| `/voice` | Voice input/output settings |
| `/theme` | Change UI theme |
| `/vim` | Toggle vim keybindings |
| `/keybindings` | View/set keyboard shortcuts |

### Advanced

| Command | Description |
|---------|-------------|
| `/fast` | Toggle fast/quality mode |
| `/compact` | Compact message history |
| `/brief` | Get a brief of recent activity |
| `/teleport` | Jump to a specific state |
| `/rewind` | Undo last action |
| `/share` | Share conversation |
| `/copy` | Copy last response |

---

## 5. Tool Commands

The AI has **39 built-in tools** it can use during conversations:

### Shell & System

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `bash` | Run shell commands | "Run `npm test`" |
| `powerShell` | Run PowerShell | "List files with PowerShell" |

### File Operations

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `fileRead` | Read a file | "Show me the contents of package.json" |
| `fileWrite` | Write/create a file | "Create a new file called utils.ts" |
| `fileEdit` | Edit parts of a file | "Change the port from 3000 to 8080" |
| `glob` | Find files by pattern | "Find all TypeScript test files" |
| `grep` | Search file contents | "Search for TODO comments" |

### Web & Search

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `webFetch` | Fetch a URL | "Fetch the content of example.com" |
| `webSearch` | Search the web | "Search for React 19 features" |
| `toolSearch` | Find available tools | "What tools can I use?" |

### Database

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `database` | Query databases | "List tables in my SQLite database" |

### Code & Notebooks

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `notebookEdit` | Edit Jupyter notebooks | "Add a cell to the notebook" |
| `lsp` | Language Server features | "Find the definition of this function" |

### AI Agents & Teams

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `agent` | Spawn a sub-agent | "Create an agent to fix all lint errors" |
| `skill` | Run a predefined skill | "Use the code review skill" |
| `sendMessage` | Message between agents | "Tell the other agent to stop" |
| `teamCreate` | Create an agent team | "Create a team for the refactoring" |
| `teamDelete` | Delete a team | "Remove the testing team" |

### Task Management

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `taskCreate` | Create a background task | "Create a task to run tests" |
| `taskGet` | Get task status | "Check the task status" |
| `taskList` | List all tasks | "Show all running tasks" |
| `taskOutput` | Get task output | "Show the test results" |
| `taskStop` | Stop a task | "Cancel the build task" |
| `taskUpdate` | Update a task | "Update the task priority" |

### Planning & Workflow

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `enterPlanMode` | Start planning mode | "Let's plan the architecture" |
| `exitPlanMode` | Exit planning mode | "Execute the plan" |
| `enterWorktree` | Enter git worktree | "Work in a separate branch" |
| `exitWorktree` | Exit worktree | "Go back to main branch" |
| `todoWrite` | Manage TODOs | "Add a TODO for the API" |

### MCP (Model Context Protocol)

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `mcp` | Use MCP servers | "Connect to the MCP server" |
| `mcpList` | List MCP tools | "List MCP tools" |
| `mcpRead` | Read MCP resources | "Read from MCP server" |
| `mcpAuth` | MCP authentication | "Authenticate with MCP" |

### Productivity

| Tool | What It Does | Example Prompt |
|------|-------------|----------------|
| `brief` | Quick status brief | "Give me a brief" |
| `config` | System configuration | "Show the config" |
| `askUser` | Ask for user input | (Used internally by AI) |

---

## 6. Dashboard

The web-based dashboard provides a visual interface:

```bash
# Start dashboard
npm run dashboard

# Open in browser: http://localhost:3210
```

### Dashboard Pages

| Page | URL | What It Shows |
|------|-----|--------------|
| **Dashboard** | `/` | System overview, health, stats |
| **Models** | `/models` | Downloaded models, sizes, status |
| **Modules** | `/modules` | All 121 AI modules and their status |
| **Chat** | `/chat` | Web-based chat interface |
| **Settings** | `/settings` | Configuration management |

### Dashboard API Endpoints

```bash
# System info
curl http://localhost:3210/api/system

# List models
curl http://localhost:3210/api/models

# List modules
curl http://localhost:3210/api/modules

# Chat
curl http://localhost:3210/api/chat -d '{"message": "Hello!"}'
```

---

## 7. Development Commands

```bash
# ── Build & Test ──
npm run build              # Compile TypeScript
npm test                   # Run all tests (vitest)
npm run typecheck          # Type check without emitting

# ── Code Quality ──
npm run lint               # ESLint check
npm run lint:fix           # ESLint auto-fix
npm run format             # Prettier format
npm run format:check       # Prettier check

# ── Running Specific Tests ──
npx vitest run src/chat/__tests__/ModelSpark.test.ts
npx vitest run src/chat/__tests__/QwenLocalLLM.test.ts
npx vitest run src/chat/__tests__/LocalLLMBridge.test.ts
npx vitest run src/chat/__tests__/SparkUnified.test.ts
npx vitest run src/chat/__tests__/SparkEnhanced.test.ts
npx vitest run src/chat/__tests__/LocalBrain.test.ts
npx vitest run src/chat/__tests__/ExploitSearchEngine.test.ts
npx vitest run src/chat/__tests__/BufferOverflowDebugger.test.ts
npx vitest run src/chat/__tests__/PythonBlackHat.test.ts
npx vitest run src/dashboard/__tests__/dashboard.test.ts

# ── Watch Mode ──
npx vitest                 # Run tests in watch mode
npx vitest --ui            # Visual test UI

# ── Debug ──
DEBUG=ai:* npm start       # Start with debug logging
LOG_LEVEL=debug npm start  # Verbose logging
```

---

## 8. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Available Settings

```bash
# ── AI Configuration ──
OLLAMA_BASE_URL=http://localhost:11434    # Ollama server (default: localhost:11434)
LLAMACPP_BASE_URL=http://localhost:8080   # llama.cpp server (alternative backend)
AI_DEFAULT_MODEL=qwen2.5-coder:7b        # Default model to use

# ── Features ──
AI_CACHE_DISK=true                        # Enable disk caching (default: true)
AI_CACHE_DIR=~/.cache/ai                  # Cache directory
AI_DATA_DIR=~/.local/share/ai             # Brain/data directory
AI_DASHBOARD_PORT=3210                    # Dashboard web UI port

# ── Database (optional) ──
DATABASE_URL=postgresql://user:pass@localhost:5432/db   # PostgreSQL
MYSQL_URL=mysql://user:pass@localhost:3306/db           # MySQL

# ── Development ──
NODE_ENV=development                      # Environment (development/production/test)
DEBUG=ai:*                                # Debug output
LOG_LEVEL=info                            # Log level (error/warn/info/debug)
```

---

## 9. Docker Commands

```bash
# Build the Docker image
docker build -t ai .

# Run interactively
docker run -it --rm ai

# Run with Ollama (host network for localhost access)
docker run -it --rm --network host ai

# Run with mounted volume (persistent data)
docker run -it --rm \
  -v ~/.local/share/ai:/root/.local/share/ai \
  -v ~/.cache/ai:/root/.cache/ai \
  ai

# Docker Compose (AI + Ollama together)
docker-compose up

# Docker Compose in background
docker-compose up -d

# Stop Docker Compose
docker-compose down
```

---

## 10. Quick Reference Card

```bash
# ═══════════════════════════════════════════════════════════
#  AI — Quick Reference
# ═══════════════════════════════════════════════════════════

# ── First-Time Setup ──
npm run setup                              # Full guided setup
curl -fsSL https://ollama.com/install.sh | sh  # Install Ollama
ollama pull qwen2.5-coder:7b              # Download primary model
ollama pull llama3.2:3b                    # Download secondary model

# ── Start the AI ──
ollama serve &                             # Start Ollama server
npm start                                  # Start AI CLI
npm run dashboard                          # Start web dashboard

# ── Chat (inside AI) ──
# Just type naturally — the AI understands context
# Use /help to see all slash commands
# Use /model to switch models
# Use /compact to manage context window

# ── Model Management ──
npm run ollama-models -- --recommended     # Pull recommended models
npm run ollama-models -- --list            # List all models
npm run download-models -- --all           # Download GGUF files
ollama list                                # List installed models
ollama rm <model>                          # Remove a model

# ── Testing ──
npm test                                   # Run all tests
npm run lint                               # Check code style
npm run typecheck                          # Type check

# ── Ollama Commands ──
ollama pull <model>                        # Download a model
ollama run <model>                         # Chat with model
ollama run <model> "prompt"                # One-shot prompt
ollama list                                # List models
ollama ps                                  # Running models + GPU
ollama rm <model>                          # Delete model
ollama show <model>                        # Model details
ollama serve                               # Start server
```

---

## Supported Models Summary

| Model ID | Type | Size | Best For |
|----------|------|------|----------|
| `qwen2.5-coder:7b` ★ | Code | 4.7 GB | Code generation, review, debugging |
| `qwen2.5-coder:1.5b` | Code | 1 GB | Fast code on low RAM |
| `qwen2.5-coder:3b` | Code | 2 GB | Balanced code quality |
| `qwen2.5-coder:14b` | Code | 9 GB | High quality code |
| `qwen2.5-coder:32b` | Code | 20 GB | Very high quality code |
| `qwen2.5:7b` | General | 4.7 GB | General chat |
| `qwen2.5:72b` | General | 44 GB | Maximum quality |
| `llama3.2:3b` ★ | General | 2 GB | Fast general purpose |
| `llama3:8b` | General | 4.7 GB | General chat |
| `llama3.1:8b` | General | 4.9 GB | Complex reasoning |
| `mistral:7b` | General | 4.1 GB | Reasoning |
| `codellama:7b` | Code | 3.8 GB | Meta code model |
| `deepseek-coder:6.7b` | Code | 3.8 GB | Code specialist |
| `phi3:mini` | General | 2.2 GB | Efficient, low RAM |
| `gemma2:9b` | General | 5.4 GB | Google model |
| `starcoder2:7b` | Code | 4 GB | Code completion |

★ = recommended defaults

---

## All 121 AI Chat Modules

The AI system includes 121 specialized modules in `src/chat/`:

| Category | Modules | Examples |
|----------|---------|---------|
| **Core AI** | 6 | LocalBrain, ModelSpark, QwenLocalLLM, LocalLLMBridge, DevBrain, ImageAnalyzer |
| **Reasoning** | 12 | ReasoningEngine, CausalReasoner, AnalyticalReasoner, CounterfactualReasoner, LogicalProofEngine, HypothesisEngine, AnalogicalReasoner, ScientificReasoner, BayesianNetwork, InferenceEngine, ArgumentAnalyzer, EthicalReasoner |
| **NLP & Language** | 12 | IntentEngine, SemanticEngine, ContextManager, SentimentAnalyzer, LanguageDetector, DialogueManager, CoreferenceResolver, TopicModeler, NaturalLanguageGenerator, NormalizationEngine, DialogueActRecognizer, FactVerificationEngine |
| **Code Intelligence** | 8 | CodeAgent, CodeOptimizer, CodeIntentPredictor, IntelligentRefactorer, SemanticCodeAnalyzer, MQLCodeFixer, DataPipelineEngine, TokenBudgetManager |
| **Security & Hacking** | 12 | PythonBlackHat, ExploitSearchEngine, ExploitAnalyzer, ExploitWriter, BufferOverflowDebugger, VulnerabilityScanner, ThreatModeler, AttackChainEngine, NetworkForensics, CyberThreatIntelligence, CloudSecurityAnalyzer, SecurityTrainer |
| **Memory & Knowledge** | 10 | SemanticMemory, ContextualMemoryEngine, MemoryConsolidator, WorkingMemoryEngine, KnowledgeGraphEngine, KnowledgeReasoner, KnowledgeSynthesizer, OntologyManager, ConceptMapper, ConfidenceGate |
| **Planning & Decision** | 6 | PlanningEngine, StrategicPlanner, DecisionEngine, GoalManager, TaskOrchestrator, ProblemDecomposer |
| **Trading & Finance** | 5 | TradingEngine, AdvancedTradingEngine, TradingStrategyAnalyzer, MarketAnalyzer, PortfolioOptimizer, ChartPatternEngine, EconomicAnalyzer |
| **Learning & Adaptation** | 6 | AdaptiveLearner, FeedbackLearner, CurriculumOptimizer, SelfReflectionEngine, SelfModelEngine, SemanticTrainer |
| **Creative & Communication** | 5 | CreativeEngine, CreativeProblemSolver, NarrativeEngine, PersonalityEngine, EmotionEngine, EmotionalIntelligence |
| **Search & Analysis** | 5 | AdvancedSearchEngine, DocumentAnalyzer, InsightExtractor, PatternRecognizer, AnomalyDetector |
| **Utility** | 10+ | ExplanationEngine, MultiFormatGenerator, QueryDecomposer, ResponseQualityScorer, BrainContract, BrainEvalHarness, TemporalReasoner, CollaborationEngine, AIToolkitBridge, nlpUtils |
| **Kurdish Language** | 4 | KurdishLanguageUtils, KurdishMorphologicalAnalyzer, KurdishSentimentAnalyzer, KurdishTranslationCorpus |

All modules work **fully offline** with no external API dependencies.
