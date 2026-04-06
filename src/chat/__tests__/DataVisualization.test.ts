import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('DataVisualization', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match charts/dashboards keywords', async () => {
      const r = await brain.chat('explain data visualization chart bar line scatter dashboard design layout tableau power bi grafana d3 js plotly matplotlib')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/chart|dashboard|tableau|d3|plotly|matplotlib|visualization/)
    })

    it('should match interactive/geospatial keywords', async () => {
      const r = await brain.chat('explain interactive visualization brushing linking zoom geospatial visualization map choropleth leaflet storytelling data')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/interactive|geospatial|choropleth|leaflet|storytelling/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Data Visualization & Dashboarding with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Data Visualization & Dashboarding')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have >=5 connected sub-concepts including Chart Types & Grammar of Graphics and Interactive Visualization', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Data Visualization & Dashboarding')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Chart Types & Grammar of Graphics')
      expect(names).toContain('Interactive Visualization')
    })

    it('should relate Chart Types & Grammar of Graphics to Interactive Visualization', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Chart Types & Grammar of Graphics')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Interactive Visualization')
    })
  })
})
