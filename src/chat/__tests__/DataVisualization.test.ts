import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('DataVisualization', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match charts/dashboards keywords', () => {
      const response = brain.chat('explain data visualization chart bar line scatter dashboard design layout tableau power bi grafana d3 js plotly matplotlib')
      expect(response).toMatch(/chart|dashboard|tableau|d3|plotly|matplotlib|visualization/i)
    })

    it('should match interactive/geospatial keywords', () => {
      const response = brain.chat('explain interactive visualization brushing linking zoom geospatial visualization map choropleth leaflet storytelling data')
      expect(response).toMatch(/interactive|geospatial|choropleth|leaflet|storytelling/i)
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
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Chart Types & Grammar of Graphics')
      expect(names).toContain('Interactive Visualization')
    })

    it('should relate Chart Types & Grammar of Graphics to Interactive Visualization', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Chart Types & Grammar of Graphics')
      const names = related.map(r => r.name)
      expect(names).toContain('Interactive Visualization')
    })
  })
})
