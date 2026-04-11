import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('DevTools & Build Systems Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── KB entry tests ──────────────────────────────────────────────────
  it('knows about webpack and vite bundlers', async () => {
    const r = await brain.chat(
      'explain webpack bundler module federation code splitting and vite esbuild',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/webpack|vite|bundl|esbuild|code\s+split/)
  })

  it('knows about eslint and prettier', async () => {
    const r = await brain.chat(
      'eslint prettier code formatter linter static analysis tool typescript compiler tsc strict',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /eslint|prettier|lint|format|typescript|code\s+quality|tool/,
    )
  })

  it('knows about npm yarn pnpm monorepo', async () => {
    const r = await brain.chat(
      'explain npm yarn pnpm package manager workspace monorepo turborepo nx',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/npm|yarn|pnpm|monorepo|workspace|turbo/)
  })

  it('knows about docker dev environments', async () => {
    const r = await brain.chat(
      'explain docker compose container development environment devcontainer codespace',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/docker|container|devcontainer|codespace|environment/)
  })

  it('knows about git hooks and CI', async () => {
    const r = await brain.chat(
      'explain git hooks husky lint-staged pre-commit github actions ci cd',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/husky|lint.staged|hook|ci|pre.commit/)
  })

  it('knows about chrome devtools', async () => {
    const r = await brain.chat(
      'explain chrome devtools debugging performance profiler react devtools lighthouse',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/devtools|chrome|debug|performance|lighthouse/)
  })

  // ── Semantic concept tests ──────────────────────────────────────────
  it('has DevTools & Build Systems concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('DevTools & Build Systems')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('tooling')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('DevTools & Build Systems')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('JavaScript Bundlers')
    expect(names).toContain('Code Quality Tools')
  })

  it('Git Hooks is related to Code Quality', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Git Hooks & CI')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Code Quality Tools')
  })
})
