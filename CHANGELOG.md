# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-04-07

### Added
- **AIToolkitBridge** — Integration with Ostris ai-toolkit for diffusion model training
  - 22+ model support, YAML config builders for image generation and LoRA training
  - 29 tests covering all bridge functionality
- **8 MQL4/MQL5 coding domains** — Order types, money management, chart objects, file operations, network/web, strategy patterns, indicator formulas, testing quality
- **8 advanced MT4/MT5 domains** — Error debugging, EA development patterns, advanced indicators, code optimization, MT4/MT5 migration, advanced EA features, syntax mistakes, trading code templates
- **8 trading knowledge domains** — Forex analysis, technical analysis deep, crypto trading, options/derivatives, quantitative trading, trading psychology, market microstructure, portfolio management
- **6 chat/knowledge domains** — Conversational AI, NLU, knowledge graphs, cognitive science, information retrieval, pragmatics & discourse
- **16 coding KB domains** — Advanced algorithms, concurrency patterns, reactive programming, metaprogramming, micro-frontends, refactoring patterns, MLOps, advanced testing, API patterns, database internals, functional deep, systems programming, developer productivity, code review, clean code, version control
- **12 semantic domains** — Computer vision, cryptography, recommendation systems, data visualization, event-driven architecture, real-time systems, type theory, scientific computing/HPC, FinTech, healthcare IT, graph databases, chaos engineering
- **Kurdish NLP improvements** — Stemming with 18 suffix rules, expanded lexicon (180+ words), ZWNJ handling
- Standard project files: LICENSE, CONTRIBUTING.md, CHANGELOG.md, SECURITY.md, CODE_OF_CONDUCT.md, .env.example, .editorconfig

### Fixed
- Kurdish sentiment analyzer — 11 failing tests resolved via stemming and lexicon expansion
- Keyword collision refinements for information retrieval domain

## [2.0.0] - 2025-12-01

### Added
- **DatabaseTool** — Query SQLite, PostgreSQL, and MySQL databases directly from the AI
  - Read-only by default for safety
  - Lazy-loaded drivers for minimal startup impact
- **CachingService** — Multi-tier caching (L1 memory + L2 disk)
  - LRU in-memory cache (session-scoped)
  - Persistent JSON disk cache (cross-session, TTL-based)
- **LocalBrain Self-Learning v2**
  - TF-IDF pattern matching for semantic similarity
  - Confidence decay for unused patterns
  - Cross-session persistence (auto-save/load)
  - Conflict resolution with smart priority system
  - Multi-turn feedback support
  - Learning priorities: cloud-learned > user-corrected > reinforced > learned
  - Export/import brain state
- **Intelligence Modules**
  - SemanticEngine — Dense vector embeddings, cosine similarity
  - IntentEngine — 18 intent types, entity extraction
  - ContextManager — Sliding-window context, topic detection
  - ReasoningEngine — Chain-of-thought reasoning pipeline
  - MetaCognition — Confidence calibration, knowledge gap detection
- **CodeMaster Suite** — Code analysis, review, auto-fix, decomposition, learning
- Docker support with multi-stage build

### Changed
- Upgraded to Node.js >= 18.0.0 requirement
- Enhanced knowledge base with 60+ semantic domains

## [1.0.0] - 2025-06-01

### Added
- Initial release
- Core AI chat system with Claude API integration
- 38 executable tools
- 50+ slash commands
- Multi-agent coordination
- Voice I/O support
- Terminal UI (Ink + React)
- MCP server integration
- Plugin system foundation

[2.1.0]: https://github.com/hamahasan441-png/Ai/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/hamahasan441-png/Ai/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/hamahasan441-png/Ai/releases/tag/v1.0.0
