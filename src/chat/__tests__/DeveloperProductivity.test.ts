/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Developer Productivity Knowledge — Tests                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('DeveloperProductivity', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match IDE mastery and debugging techniques keywords', async () => {
      const r = await brain.chat(
        'explain ide editor mastery vs code extensions jetbrains plugins vim neovim lsp debugging techniques conditional breakpoints watchpoints remote debugging',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /ide|vs\s+code|jetbrains|vim|neovim|lsp|debugging|breakpoint|watchpoint/,
      )
    })

    it('should match profiling tools and code navigation keywords', async () => {
      const r = await brain.chat(
        'explain profiling tools cpu profilers memory profilers flame graphs async profiling ebpf code navigation code intelligence symbol search call hierarchies',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /profil|cpu|memory|flame\s+graph|ebpf|code\s+navigation|intelligence|symbol|call\s+hierarch/,
      )
    })

    it('should match CLI tools and development environments keywords', async () => {
      const r = await brain.chat(
        'explain cli tools developers ripgrep fd jq fzf tmux zoxide bat development environments devcontainers nix dotfiles codespaces',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /ide|vs\s+code|jetbrains|vim|neovim|lsp|debugging|profil|flame\s+graph|ripgrep|devcontainer/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Developer Productivity with domain tooling', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Developer Productivity')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('tooling')
    })

    it('should have >=5 connected sub-concepts including IDE & Editor Mastery and Debugging Techniques & Tools', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Developer Productivity')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('IDE & Editor Mastery')
      expect(names).toContain('Debugging Techniques & Tools')
    })

    it('should relate IDE & Editor Mastery to Code Navigation & Intelligence', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('IDE & Editor Mastery')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Code Navigation & Intelligence')
    })
  })
})
