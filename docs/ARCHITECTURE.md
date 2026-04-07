# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   CLI    │  │ REST API │  │   SSE    │  │  Swagger UI  │   │
│  │ (Ink.js) │  │ (HTTP)   │  │ Stream   │  │  /api/docs   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘   │
└───────┼──────────────┼─────────────┼───────────────────────────┘
        │              │             │
┌───────┼──────────────┼─────────────┼───────────────────────────┐
│       ▼              ▼             ▼       Core Engine          │
│  ┌──────────────────────────────────────┐                      │
│  │            LocalBrain                │  8,200+ lines        │
│  │  ┌──────────┐ ┌────────────────┐    │                      │
│  │  │ Knowledge│ │ Semantic Memory│    │                      │
│  │  │   Base   │ │    Engine      │    │                      │
│  │  └──────────┘ └────────────────┘    │                      │
│  │  ┌──────────┐ ┌────────────────┐    │                      │
│  │  │ Intent   │ │   Response     │    │                      │
│  │  │ Matching │ │   Builder      │    │                      │
│  │  └──────────┘ └────────────────┘    │                      │
│  └──────────────────────────────────────┘                      │
│       │              │             │                            │
│  ┌────▼────┐  ┌──────▼───┐  ┌─────▼──────┐                    │
│  │  Tools  │  │  Plugin  │  │  Workflow  │                    │
│  │ (39+)   │  │   SDK    │  │   Engine   │                    │
│  └─────────┘  └──────────┘  └────────────┘                    │
└────────────────────────────────────────────────────────────────┘
        │              │             │
┌───────┼──────────────┼─────────────┼───────────────────────────┐
│       ▼              ▼             ▼       Infrastructure      │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │Database │  │   Auth   │  │ Recovery │  │   Metrics    │   │
│  │ Layer   │  │  (RBAC)  │  │ & DLQ    │  │  & Logging   │   │
│  └─────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

## Module Map

| Directory | Description | Tests |
|-----------|-------------|-------|
| `src/chat/` | LocalBrain, DevBrain, SemanticMemory, intelligence modules, 180+ knowledge domains | ~7,700 |
| `src/api/` | REST API server, router, middleware, OpenAPI spec, SSE streaming | ~210 |
| `src/auth/` | RBAC (4 roles), session management, API key management | 62 |
| `src/database/` | Database abstraction (memory/SQLite/Postgres/MySQL), migrations, repository | 81 |
| `src/services/` | LLM providers, metrics, cache, API retry, circuit breaker, recovery, workflow engine | ~260 |
| `src/plugins/` | Plugin SDK, lifecycle management, permissions, dependency resolution | 23 |
| `src/utils/` | Logger, errors, config validation, input validation | ~160 |
| `src/tools/` | 39 tools for file, code, database, web, bash operations | varies |
| `src/commands/` | 50+ CLI commands | varies |
| `src/server/` | Direct-connect session management | varies |

## Data Flow

```
User Input → CLI/API → Intent Matching → Knowledge Search → Response Builder → Output
                ↓              ↓                ↓
           Auth/RBAC    Semantic Memory    Tool Execution
                ↓              ↓                ↓
           Rate Limit   Pattern Learning   Plugin System
```

## Key Design Decisions

1. **Zero external dependencies for infrastructure** — Auth, API, database, config all use Node.js built-ins
2. **In-memory-first** — All stores (database, cache, checkpoints) work in-memory with optional persistence
3. **Plugin-based extensibility** — 11 permission types, lifecycle hooks, per-plugin storage
4. **Resilience patterns** — Retry with exponential backoff, circuit breaker, dead letter queue
5. **Multi-model support** — Unified LLM interface supporting Claude, OpenAI, and Ollama

## Technology Stack

- **Runtime**: Node.js 18/20/22
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest with v8 coverage
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions (lint, format, typecheck, test, coverage, Docker, security audit)
