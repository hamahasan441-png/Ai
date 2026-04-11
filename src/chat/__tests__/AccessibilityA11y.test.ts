import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Accessibility (a11y) Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── KB entry tests ──────────────────────────────────────────────────
  it('knows about WCAG and ARIA', async () => {
    const r = await brain.chat(
      'explain wcag web content accessibility guidelines aria role attribute landmark screen reader',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/wcag|aria|accessibility|screen\s+reader|guideline/)
  })

  it('knows about keyboard navigation and focus', async () => {
    const r = await brain.chat(
      'explain keyboard navigation focus management tab order skip link focus trap modal accessible',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/keyboard|focus|tab|skip\s+link|modal|navigation/)
  })

  it('knows about color contrast and cognitive a11y', async () => {
    const r = await brain.chat(
      'explain color contrast ratio accessible palette responsive touch target cognitive accessibility',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/contrast|color|touch\s+target|cognitive|accessible/)
  })

  it('knows about axe testing and lighthouse', async () => {
    const r = await brain.chat(
      'explain axe core testing tool accessibility audit jest-axe lighthouse accessibility score',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/axe|lighthouse|testing|audit|accessibility/)
  })

  it('knows about semantic HTML and accessible components', async () => {
    const r = await brain.chat(
      'explain semantic html heading structure alt text accessible component library react aria radix ui',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/semantic|heading|alt\s+text|component|aria|radix/)
  })

  it('knows about inclusive design and compliance', async () => {
    const r = await brain.chat(
      'explain inclusive design universal design disability assistive technology section 508 ada compliance',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /inclusive|disability|assistive|ada|section\s+508|compliance/,
    )
  })

  // ── Semantic concept tests ──────────────────────────────────────────
  it('has Accessibility concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Accessibility (a11y)')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('accessibility')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Accessibility (a11y)')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('WCAG & WAI-ARIA')
    expect(names).toContain('Keyboard Accessibility')
  })

  it('WCAG is related to Keyboard A11y', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('WCAG & WAI-ARIA')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Keyboard Accessibility')
  })

  it('Semantic HTML is related to WCAG', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Semantic HTML & Components')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('WCAG & WAI-ARIA')
  })
})
