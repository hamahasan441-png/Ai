import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('UI/UX Design Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Design Systems ─────────────────────────────────────────────────────
  describe('Design Systems', () => {
    it('explains design system components and patterns', async () => {
      const r = await brain.chat(
        'What is a design system component library with atomic design methodology?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /design\s*system|component|atomic|pattern|token|storybook/,
      )
    })

    it('covers Storybook documentation', async () => {
      const r = await brain.chat(
        'How does Storybook component documentation and visual testing work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /storybook|component|documentation|visual|testing|design/,
      )
    })
  })

  // ── Web Accessibility ──────────────────────────────────────────────────
  describe('Web Accessibility', () => {
    it('explains WCAG and ARIA guidelines', async () => {
      const r = await brain.chat(
        'What are accessibility WCAG ARIA screen reader a11y guidelines for the web?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/accessibility|wcag|aria|screen\s*reader|a11y|semantic/)
    })

    it('covers accessibility audit and compliance', async () => {
      const r = await brain.chat(
        'How do web accessibility guidelines compliance audit testing work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /accessibility|wcag|compliance|audit|contrast|keyboard|testing/,
      )
    })
  })

  // ── Responsive Design ──────────────────────────────────────────────────
  describe('Responsive Design', () => {
    it('explains responsive design techniques', async () => {
      const r = await brain.chat(
        'How does responsive design with media query mobile first breakpoints work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/responsive|media|query|mobile|grid|flexbox|breakpoint/)
    })

    it('covers CSS Grid and Flexbox layouts', async () => {
      const r = await brain.chat(
        'How do CSS grid flexbox layout responsive breakpoints and container queries work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /css|grid|flexbox|responsive|layout|container|breakpoint/,
      )
    })
  })

  // ── UX Research ────────────────────────────────────────────────────────
  describe('UX Research', () => {
    it('explains user research methods', async () => {
      const r = await brain.chat(
        'What are user research usability testing wireframe prototyping methods?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /user\s*research|usability|wireframe|prototype|persona|testing/,
      )
    })
  })

  // ── Visual Design ──────────────────────────────────────────────────────
  describe('Visual Design', () => {
    it('explains color theory and typography', async () => {
      const r = await brain.chat('How do color theory typography visual design UI principles work?')
      expect(r.text.toLowerCase()).toMatch(
        /color|typography|visual|design|hierarchy|whitespace|principle/,
      )
    })
  })

  // ── Design-Dev Workflow ────────────────────────────────────────────────
  describe('Design-Dev Workflow', () => {
    it('explains design handoff and theming', async () => {
      const r = await brain.chat(
        'How does design handoff Figma developer collaboration with design tokens work?',
      )
      expect(r.text.toLowerCase()).toMatch(/design|handoff|figma|token|css|theme|developer/)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────
  describe('Semantic Memory - UI/UX concepts', () => {
    it('has UI/UX Design concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('UI/UX Design')
      expect(c).toBeDefined()
      expect(c!.domain).toBe('design')
    })

    it('has Design Systems concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Design Systems')
      expect(c).toBeDefined()
    })

    it('has Web Accessibility concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Web Accessibility')
      expect(c).toBeDefined()
    })

    it('has Responsive Design concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Responsive Design')
      expect(c).toBeDefined()
    })

    it('UI/UX Design has many related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('UI/UX Design')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Design Systems is related to Design-Dev Workflow', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Design Systems')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Design-Dev Workflow')
    })
  })
})
