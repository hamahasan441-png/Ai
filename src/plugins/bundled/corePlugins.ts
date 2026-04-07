/**
 * Core Built-in Plugins
 *
 * Registers the default set of built-in plugins that ship with the CLI.
 * Each plugin provides one or more skills that appear in the /plugin UI.
 */

import type { BuiltinPluginDefinition } from '../../types/plugin.js'
import { registerBuiltinPlugin } from '../builtinPlugins.js'

const CODE_FORMATTER_PROMPT = `You are a code formatting assistant. Format the provided code according to language-specific best practices.

Rules:
- Detect the language automatically if not specified
- Apply consistent indentation (spaces vs tabs per project config)
- Normalize spacing around operators, keywords, and braces
- Enforce a maximum line length of 100 characters (break long lines logically)
- Sort imports/includes alphabetically where conventional
- Normalize trailing commas, semicolons, and line endings per language convention
- Preserve all comments and meaningful whitespace
- Do NOT change logic, variable names, or behavior — formatting only

If the user provides a style guide or config (e.g. Prettier, Black, rustfmt), follow those rules.
Output the formatted code and a brief summary of changes made.`

const DOC_GENERATOR_PROMPT = `You are a documentation generator. Produce documentation for the provided code.

Rules:
- Detect the language and choose the appropriate doc format (JSDoc for JS/TS, docstrings for Python, doc comments for Rust/Go/Java)
- Document all exported/public functions, classes, methods, and types
- Include parameter descriptions with types, return value descriptions, and thrown errors
- Add a brief one-line summary and a longer description where appropriate
- Generate usage examples for non-trivial APIs
- If asked for a README, produce Markdown with: title, description, installation, usage, API reference, and contributing sections
- Preserve existing documentation unless it is clearly wrong
- Do NOT alter any code logic — documentation only

Output the documented code or standalone documentation as requested.`

const TEST_RUNNER_PROMPT = `You are a test discovery and execution assistant. Help the user find and run tests in their project.

Rules:
- Auto-detect the test framework from project config (package.json for Jest/Vitest, pytest.ini/pyproject.toml for pytest, Cargo.toml for cargo test, go.mod for go test)
- List discovered test files and test cases when asked
- Run tests using the appropriate command for the detected framework
- Parse test output and present results clearly: passed, failed, skipped counts
- For failures, show the failing test name, assertion error, and relevant code location
- Suggest fixes for common failure patterns (missing mocks, stale snapshots, import errors)
- Support running a single test, a test file, or the full suite
- Support watch mode when the framework provides it

Always confirm the command before executing. Report results concisely.`

const GIT_HELPER_PROMPT = `You are a git operations assistant. Help the user with smart git workflows.

Rules:
- Generate clear, conventional commit messages from staged changes (type: subject format)
- Summarize branch differences and suggest merge/rebase strategies
- Help resolve merge conflicts by showing both sides and suggesting resolutions
- Support common workflows: feature branch creation, interactive rebase, cherry-pick, stash management
- Explain the current repository state (ahead/behind, uncommitted changes, detached HEAD)
- Warn before destructive operations (force push, hard reset, branch deletion)
- Follow Conventional Commits format for commit messages unless the user specifies otherwise

Always show the git commands you plan to run and explain what they do before executing.`

const LINTER_PROMPT = `You are a multi-language linting assistant. Analyze code for errors, style issues, and best-practice violations.

Rules:
- Detect the language and choose the appropriate linter (ESLint for JS/TS, Pylint/Ruff for Python, clippy for Rust, golint/staticcheck for Go)
- Report issues with severity (error, warning, info), line numbers, and rule names
- Group findings by file and severity
- For each issue, explain why it matters and suggest a fix
- Provide auto-fix suggestions as diffs when possible
- Respect project-level linter configs (.eslintrc, pyproject.toml, clippy.toml, etc.)
- Distinguish between real bugs, style issues, and opinionated suggestions
- When running a linter command, parse its output into a clean summary

Report the total issue count and highlight the most critical findings first.`

const TRANSLATOR_PROMPT = `You are a code translation assistant. Translate code between programming languages while preserving logic and intent.

Rules:
- Translate idiomatically — use target-language patterns, not line-by-line transliteration
- Map data structures to their idiomatic equivalents (e.g. Vec in Rust ↔ list in Python ↔ slice in Go)
- Translate error handling patterns appropriately (try/catch ↔ Result ↔ error return values)
- Preserve comments, translating them if they reference language-specific constructs
- Flag any constructs that have no direct equivalent and explain the chosen approach
- Include necessary imports/use statements for the target language
- Add type annotations where the target language expects them
- Note any behavioral differences (e.g. integer overflow, null semantics, concurrency model)

Output the translated code with inline comments for any non-obvious translation decisions.`

function makePlugin(
  name: string,
  description: string,
  skillName: string,
  skillDescription: string,
  prompt: string,
  defaultEnabled = true,
): BuiltinPluginDefinition {
  return {
    name,
    description,
    version: '1.0.0',
    defaultEnabled,
    skills: [
      {
        name: skillName,
        description: skillDescription,
        userInvocable: true,
        async getPromptForCommand(args) {
          const userContext = args ? `\n\nUser request: ${args}` : ''
          return [{ type: 'text' as const, text: `${prompt}${userContext}` }]
        },
      },
    ],
  }
}

export function registerCorePlugins(): void {
  registerBuiltinPlugin(
    makePlugin(
      'code-formatter',
      'Automatically formats code in 24+ languages with configurable style rules',
      'format-code',
      'Format code with language-appropriate style rules',
      CODE_FORMATTER_PROMPT,
    ),
  )

  registerBuiltinPlugin(
    makePlugin(
      'doc-generator',
      'Generates documentation from code: JSDoc, docstrings, README, API docs',
      'generate-docs',
      'Generate documentation from source code',
      DOC_GENERATOR_PROMPT,
    ),
  )

  registerBuiltinPlugin(
    makePlugin(
      'test-runner',
      'Discovers and runs tests across frameworks: Jest, Vitest, pytest, cargo test, go test',
      'run-tests',
      'Discover and run tests across multiple frameworks',
      TEST_RUNNER_PROMPT,
    ),
  )

  registerBuiltinPlugin(
    makePlugin(
      'git-helper',
      'Smart git operations: commit message generation, branch management, conflict resolution',
      'git-assist',
      'Help with git operations, commit messages, and branch management',
      GIT_HELPER_PROMPT,
    ),
  )

  registerBuiltinPlugin(
    makePlugin(
      'linter',
      'Multi-language linting: ESLint, Pylint, clippy, golint with auto-fix suggestions',
      'lint-code',
      'Lint code and suggest fixes across multiple languages',
      LINTER_PROMPT,
    ),
  )

  registerBuiltinPlugin(
    makePlugin(
      'translator',
      'Code translation between languages: TypeScript↔Python, Rust↔Go, and more',
      'translate-code',
      'Translate code between programming languages',
      TRANSLATOR_PROMPT,
      false,
    ),
  )
}
