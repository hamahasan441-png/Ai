# 🦙 Ollama & Qwen LLM Setup Guide

Complete guide for downloading, installing, and integrating Ollama and Qwen models with the AI system. Everything runs locally — no API keys or internet required after initial setup.

---

## Table of Contents

- [Overview](#overview)
- [1. Install Ollama](#1-install-ollama)
- [2. Download Qwen Models](#2-download-qwen-models)
- [3. Download Other Recommended Models](#3-download-other-recommended-models)
- [4. Verify Models Are Working](#4-verify-models-are-working)
- [5. Connect to Our AI](#5-connect-to-our-ai)
- [6. Model Comparison Table](#6-model-comparison-table)
- [7. Advanced Configuration](#7-advanced-configuration)
- [8. Alternative: llama.cpp Backend](#8-alternative-llamacpp-backend)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Uninstall / Cleanup](#10-uninstall--cleanup)

---

## Overview

Our AI uses **Ollama** as the primary backend for running local LLMs. Ollama makes it easy to download and run models like **Qwen 2.5 Coder**, **LLaMA 3**, **Mistral**, and more — all offline on your machine.

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│               Our AI System                      │
│                                                  │
│  QwenLocalLLM.ts ──┐                            │
│  LocalLLMBridge.ts ─┤──► Ollama HTTP API        │
│  ModelSpark.ts ─────┘    (localhost:11434)       │
│                              │                   │
│                              ▼                   │
│                     ┌────────────────┐           │
│                     │  Ollama Server │           │
│                     │  ┌──────────┐  │           │
│                     │  │ Qwen 2.5 │  │           │
│                     │  │ LLaMA 3  │  │           │
│                     │  │ Mistral  │  │           │
│                     │  │ ...more  │  │           │
│                     │  └──────────┘  │           │
│                     └────────────────┘           │
└─────────────────────────────────────────────────┘
```

---

## 1. Install Ollama

### Linux (recommended)

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS

```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.com/download/mac
```

### Windows

Download the installer from [https://ollama.com/download/windows](https://ollama.com/download/windows)

Or using winget:
```powershell
winget install Ollama.Ollama
```

### Termux (Android)

```bash
# Ollama doesn't officially support Termux, but you can use llama.cpp instead
# See "Alternative: llama.cpp Backend" section below
# Or use our download script for GGUF models:
npm run download-models
```

### Docker

```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# With GPU support (NVIDIA)
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### Verify Installation

```bash
ollama --version
# ollama version is 0.x.x

# Start the server (runs in background)
ollama serve
```

---

## 2. Download Qwen Models

Qwen 2.5 Coder is our **primary recommended model** for code-related tasks. It's optimized for code generation, completion, and understanding.

### Quick Start (Recommended)

```bash
# Start Ollama server (if not already running)
ollama serve &

# Pull Qwen 2.5 Coder 7B — best balance of quality and speed
ollama pull qwen2.5-coder:7b
```

### All Available Qwen Models

| Model | Command | Size | RAM | Best For |
|-------|---------|------|-----|----------|
| **Qwen 2.5 Coder 0.5B** | `ollama pull qwen2.5-coder:0.5b` | ~400 MB | 1 GB | Ultra-fast, low-resource devices |
| **Qwen 2.5 Coder 1.5B** | `ollama pull qwen2.5-coder:1.5b` | ~1 GB | 2 GB | Fast, mobile/embedded |
| **Qwen 2.5 Coder 3B** | `ollama pull qwen2.5-coder:3b` | ~2 GB | 4 GB | Good quality, moderate resources |
| **Qwen 2.5 Coder 7B** ★ | `ollama pull qwen2.5-coder:7b` | ~4.7 GB | 6 GB | **Recommended** — best quality/speed balance |
| **Qwen 2.5 Coder 14B** | `ollama pull qwen2.5-coder:14b` | ~9 GB | 12 GB | High quality, needs good hardware |
| **Qwen 2.5 Coder 32B** | `ollama pull qwen2.5-coder:32b` | ~20 GB | 24 GB | Very high quality, needs lots of RAM |
| **Qwen 2.5 72B** (general) | `ollama pull qwen2.5:72b` | ~44 GB | 48 GB | Maximum quality, server-grade hardware |

### General-Purpose Qwen Models

| Model | Command | Size | RAM | Best For |
|-------|---------|------|-----|----------|
| **Qwen 2.5 0.5B** | `ollama pull qwen2.5:0.5b` | ~400 MB | 1 GB | Ultra-lightweight chatbot |
| **Qwen 2.5 3B** | `ollama pull qwen2.5:3b` | ~2 GB | 4 GB | General chat, moderate quality |
| **Qwen 2.5 7B** | `ollama pull qwen2.5:7b` | ~4.7 GB | 6 GB | Good general-purpose model |
| **Qwen 2.5 14B** | `ollama pull qwen2.5:14b` | ~9 GB | 12 GB | High quality general use |
| **Qwen 2.5 32B** | `ollama pull qwen2.5:32b` | ~20 GB | 24 GB | Near-frontier quality |

### Quick Test

```bash
# Test that Qwen is working
ollama run qwen2.5-coder:7b "Write a hello world in Python"

# You should see something like:
# ```python
# print("Hello, World!")
# ```
```

---

## 3. Download Other Recommended Models

Our AI system supports multiple models. Here are the ones we recommend:

### Essential Models

```bash
# Code specialist (primary) — MUST HAVE
ollama pull qwen2.5-coder:7b

# General purpose (secondary) — RECOMMENDED
ollama pull llama3.2:3b
```

### Additional Models (Optional)

```bash
# LLaMA 3.1 8B — more capable general model
ollama pull llama3.1:8b

# Mistral 7B — great for reasoning
ollama pull mistral:7b

# CodeLlama 7B — Meta's code model
ollama pull codellama:7b

# DeepSeek Coder 6.7B — coding specialist
ollama pull deepseek-coder:6.7b

# Phi-3 Mini — Microsoft's small model, very efficient
ollama pull phi3:mini

# Gemma 2 9B — Google's model
ollama pull gemma2:9b

# StarCoder 2 7B — code completion specialist
ollama pull starcoder2:7b
```

### Using Our Script

We also provide a script to download GGUF model files directly from HuggingFace:

```bash
# Interactive model download menu
npm run download-models

# Download specific models
npm run download-models -- --qwen      # Qwen 2.5 Coder 7B
npm run download-models -- --llama     # LLaMA 3.2 3B
npm run download-models -- --all       # Both defaults

# List all available GGUF models
npm run download-models -- --list
```

### Using Our Ollama Management Script

```bash
# Pull recommended models for our AI
npm run ollama-models -- --recommended

# Pull all supported models
npm run ollama-models -- --all

# List models and their status
npm run ollama-models -- --list

# Pull a specific model
npm run ollama-models -- --pull qwen2.5-coder:7b

# Check Ollama server health
npm run ollama-models -- --health
```

---

## 4. Verify Models Are Working

### Check Ollama Is Running

```bash
# Check if Ollama server is up
curl http://localhost:11434/api/version

# Expected: {"version":"0.x.x"}
```

### List Downloaded Models

```bash
ollama list

# Example output:
# NAME                    ID              SIZE    MODIFIED
# qwen2.5-coder:7b       a]1b2c3d4e5f    4.7 GB  2 hours ago
# llama3.2:3b             f6g7h8i9j0k1    2.0 GB  2 hours ago
```

### Test a Model

```bash
# Quick one-shot test
ollama run qwen2.5-coder:7b "Explain what a binary search tree is in 2 sentences"

# Interactive chat mode
ollama run qwen2.5-coder:7b

# Test via API (what our AI uses)
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5-coder:7b",
  "messages": [{"role": "user", "content": "Hello!"}],
  "stream": false
}'
```

---

## 5. Connect to Our AI

### Automatic Connection

Once Ollama is running with models downloaded, our AI connects automatically:

```bash
# Start Ollama (if not running)
ollama serve &

# Start our AI
npm start
```

The AI will:
1. Detect Ollama at `http://localhost:11434`
2. List available models
3. Use `qwen2.5-coder:7b` as the default model
4. Fall back to other models if needed

### Environment Configuration

Optionally configure in `.env`:

```bash
# Copy example config
cp .env.example .env

# Edit .env with your preferences:
OLLAMA_BASE_URL=http://localhost:11434    # Ollama server address
AI_DEFAULT_MODEL=qwen2.5-coder:7b        # Default model
```

### Using in Code

```typescript
import { QwenLocalLLM } from './chat/QwenLocalLLM.js'
import { LocalLLMBridge } from './chat/LocalLLMBridge.js'
import { ModelSpark } from './chat/ModelSpark.js'

// ── Option 1: Direct Qwen LLM usage ──
const qwen = new QwenLocalLLM({
  backend: 'ollama',
  model: 'qwen2.5-coder:7b',
  baseUrl: 'http://localhost:11434',
})

// Check if the model is available
const health = await qwen.healthCheck()
console.log(health)  // { ok: true, backend: 'ollama', model: 'qwen2.5-coder:7b' }

// Generate a response
const response = await qwen.generate({
  prompt: 'Write a function to reverse a linked list',
  temperature: 0.7,
  maxTokens: 2048,
})
console.log(response.text)

// ── Option 2: Smart routing via LocalLLMBridge ──
const bridge = new LocalLLMBridge()

// The bridge automatically routes to the best model/method
const answer = await bridge.query('How do I implement a binary search?')
// Routes to: Qwen for code → enriches with knowledge base → returns enhanced answer

// ── Option 3: Dual-model ensemble via ModelSpark ──
const spark = new ModelSpark({
  primaryModel: 'qwen2.5-coder:7b',
  secondaryModel: 'llama3.2:3b',
  strategy: 'ensemble',           // Both models answer, best wins
})

const result = await spark.infer('Explain the Observer pattern')
console.log(result.text)
console.log(result.confidence)    // 0.0–1.0 quality score
console.log(result.strategy)      // Which strategy was used
```

### How Models Are Used Internally

| Component | Default Model | Purpose |
|-----------|---------------|---------|
| `QwenLocalLLM` | `qwen2.5-coder:7b` | Direct inference, code generation |
| `LocalLLMBridge` | Auto-selects | Smart routing between LLM + knowledge base |
| `ModelSpark` | Qwen + LLaMA | Dual-model ensemble for best quality |
| `SparkAgent` | Via ModelSpark | Autonomous multi-step agent |
| `UnifiedOrchestrator` | All available | Master router for all AI capabilities |

---

## 6. Model Comparison Table

| Model | Parameters | Code | General | Speed | RAM |
|-------|-----------|------|---------|-------|-----|
| Qwen 2.5 Coder 7B ★ | 7B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 6 GB |
| Qwen 2.5 Coder 1.5B | 1.5B | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 2 GB |
| Qwen 2.5 Coder 14B | 14B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 12 GB |
| LLaMA 3.2 3B | 3B | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 3 GB |
| LLaMA 3.1 8B | 8B | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 6 GB |
| Mistral 7B | 7B | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 6 GB |
| CodeLlama 7B | 7B | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | 6 GB |
| DeepSeek Coder 6.7B | 6.7B | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 6 GB |
| Phi-3 Mini | 3.8B | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 4 GB |
| Gemma 2 9B | 9B | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 8 GB |
| StarCoder 2 7B | 7B | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | 6 GB |

**Recommendation by hardware:**
- **4 GB RAM:** Qwen 2.5 Coder 1.5B + Phi-3 Mini
- **8 GB RAM:** Qwen 2.5 Coder 7B + LLaMA 3.2 3B ★
- **16 GB RAM:** Qwen 2.5 Coder 7B + LLaMA 3.1 8B + Mistral 7B
- **32+ GB RAM:** Qwen 2.5 Coder 14B + LLaMA 3.1 8B + any extras

---

## 7. Advanced Configuration

### Custom Ollama Server

If Ollama runs on a different machine or port:

```bash
# In .env
OLLAMA_BASE_URL=http://192.168.1.100:11434
```

### GPU Acceleration

Ollama automatically uses GPU if available:

```bash
# Check GPU status
ollama ps

# Force CPU-only mode
CUDA_VISIBLE_DEVICES="" ollama serve
```

### Custom Model Parameters

Create a custom Modelfile for fine-tuned behavior:

```bash
# Create a custom Qwen profile
cat > /tmp/Modelfile-qwen-custom << 'EOF'
FROM qwen2.5-coder:7b

# Set temperature for more deterministic code output
PARAMETER temperature 0.3

# Increase context window
PARAMETER num_ctx 8192

# System prompt for our AI
SYSTEM """You are an expert AI coding assistant. You write clean, efficient,
well-documented code. You explain your reasoning step by step."""
EOF

# Create the custom model
ollama create qwen-custom -f /tmp/Modelfile-qwen-custom

# Use it
ollama run qwen-custom "Write a React component for a todo list"
```

### Multiple Models Running

Ollama can serve multiple models. The AI automatically selects the best one:

```bash
# Pre-load models into memory for faster switching
ollama run qwen2.5-coder:7b ""
ollama run llama3.2:3b ""
```

---

## 8. Alternative: llama.cpp Backend

If you can't install Ollama (e.g., on Termux), use llama.cpp with GGUF files:

### Download GGUF Models

```bash
# Use our download script
npm run download-models -- --all

# Or download manually from HuggingFace:
# Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
# LLaMA: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
```

### Run with llama.cpp

```bash
# Install llama.cpp
# Linux/macOS:
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make -j

# Start the server (OpenAI-compatible API)
./llama-server \
  -m ~/.local/share/ai/models/qwen2.5-coder-7b-instruct-q4_k_m.gguf \
  --port 11434 \
  --host 0.0.0.0 \
  -c 8192
```

### Configure Our AI for llama.cpp

```bash
# In .env
LLAMACPP_BASE_URL=http://localhost:8080
```

---

## 9. Troubleshooting

### Ollama won't start

```bash
# Check if port 11434 is in use
lsof -i :11434

# Kill any existing Ollama process
pkill ollama

# Start fresh
ollama serve
```

### Model download fails

```bash
# Retry the download
ollama pull qwen2.5-coder:7b

# If network issues, use our GGUF downloader instead
npm run download-models -- --qwen
```

### Out of memory

```bash
# Use a smaller model
ollama pull qwen2.5-coder:1.5b

# Or use a lower quantization (via GGUF download)
npm run download-models -- --model qwen-7b-q2
```

### AI can't connect to Ollama

```bash
# 1. Check Ollama is running
curl http://localhost:11434/api/version

# 2. Check models are downloaded
ollama list

# 3. Verify the correct URL in .env
cat .env | grep OLLAMA

# 4. Test API directly
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5-coder:7b",
  "messages": [{"role": "user", "content": "test"}],
  "stream": false
}'
```

### Slow inference

```bash
# Check if GPU is being used
ollama ps

# Use a smaller model for faster responses
ollama pull qwen2.5-coder:3b

# Reduce context window
# Create a Modelfile with smaller num_ctx (see Advanced Configuration)
```

---

## 10. Uninstall / Cleanup

### Remove Models

```bash
# Remove a specific model
ollama rm qwen2.5-coder:7b

# Remove all models
ollama list | tail -n +2 | awk '{print $1}' | xargs -I {} ollama rm {}

# Remove GGUF files
rm -rf ~/.local/share/ai/models/
```

### Uninstall Ollama

```bash
# Linux
sudo rm /usr/local/bin/ollama
sudo rm -rf /usr/share/ollama
sudo userdel ollama
sudo groupdel ollama

# macOS (Homebrew)
brew uninstall ollama

# Windows — use Add/Remove Programs
```

---

## Quick Reference Card

```bash
# ── Install ──
curl -fsSL https://ollama.com/install.sh | sh    # Install Ollama

# ── Download Models ──
ollama pull qwen2.5-coder:7b                      # Primary code model
ollama pull llama3.2:3b                            # Secondary general model
npm run download-models                            # Our GGUF downloader
npm run ollama-models -- --recommended             # Pull all recommended

# ── Run ──
ollama serve                                       # Start server
npm start                                          # Start our AI (auto-connects)

# ── Manage ──
ollama list                                        # List downloaded models
ollama ps                                          # Running models + GPU info
ollama rm <model>                                  # Delete a model

# ── Test ──
ollama run qwen2.5-coder:7b "Hello!"             # Quick test
curl http://localhost:11434/api/version            # API health check
npm run ollama-models -- --health                  # Full health check
```
