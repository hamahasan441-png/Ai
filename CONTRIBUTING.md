# Contributing to Ai

Thank you for your interest in contributing to the Ai project! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Ai.git
   cd Ai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the tests to make sure everything works:
   ```bash
   npm test
   ```

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)
- **Git**

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

See `.env.example` for all available environment variables.

### Running the Project

```bash
# Start the AI CLI
npm start

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── chat/           # Core AI brain (LocalBrain, SemanticMemory, intelligence modules)
├── tools/          # 39+ executable tools (bash, files, web, database, etc.)
├── commands/       # 50+ slash commands
├── services/       # Backend services (API, cache, MCP, analytics)
├── components/     # React terminal UI components
├── utils/          # Shared utilities
├── hooks/          # React hooks
├── state/          # Application state management
├── coordinator/    # Multi-agent orchestration
├── skills/         # AI skill system
├── plugins/        # Plugin system
├── voice/          # Voice I/O
├── entrypoints/    # CLI entry points
└── types/          # TypeScript type definitions
```

### Key Files

| File | Purpose |
|------|---------|
| `src/chat/LocalBrain.ts` | Offline AI brain with self-learning |
| `src/chat/SemanticMemory.ts` | Semantic memory and embeddings |
| `src/chat/index.ts` | Public API exports |
| `src/tools/` | Tool implementations |
| `src/services/cache/` | Multi-tier caching system |

## Making Changes

1. Create a feature branch from the main branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes in small, focused commits
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Ensure code passes linting: `npm run lint`
6. Ensure code is properly formatted: `npm run format:check`

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add new knowledge domain for X`
- `fix: resolve keyword collision in LocalBrain`
- `test: add unit tests for CacheService`
- `docs: update README with new API examples`
- `refactor: extract TF-IDF logic from LocalBrain`

## Testing

We use [Vitest](https://vitest.dev/) for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npx vitest

# Run a specific test file
npx vitest run src/chat/__tests__/MyTest.test.ts

# Run tests matching a pattern
npx vitest run --reporter=verbose -t "pattern"
```

### Test Guidelines

- Place test files in `__tests__/` directories adjacent to the code they test
- Name test files `*.test.ts`
- Test both happy paths and edge cases
- Use descriptive test names that explain the expected behavior
- Keep tests focused and independent

## Code Style

- **TypeScript** with strict mode enabled
- **ESLint** for linting (zero warnings policy)
- **Prettier** for formatting
- Use `const` over `let` where possible (`prefer-const` enforced)
- No `var` declarations (`no-var` enforced)
- Prefix unused parameters with `_`
- Use `logError`/`logForDebugging` instead of `console.log`

## Pull Request Process

1. Update documentation if your changes affect the public API
2. Add tests for new functionality
3. Ensure CI passes (lint, format, typecheck, test)
4. Request review from maintainers
5. Address review feedback promptly

### CI Checks

All pull requests must pass:
- **ESLint** — zero warnings
- **Prettier** — consistent formatting
- **TypeScript** — strict type checking
- **Vitest** — all tests passing (on Node 18, 20, 22)

## Reporting Issues

- Use [GitHub Issues](https://github.com/hamahasan441-png/Ai/issues) to report bugs
- Include steps to reproduce, expected behavior, and actual behavior
- Include your Node.js version and operating system
- For security vulnerabilities, see [SECURITY.md](SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the [ISC License](LICENSE).
