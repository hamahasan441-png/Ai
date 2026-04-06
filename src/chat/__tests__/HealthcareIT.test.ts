import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('HealthcareIT', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should respond to EHR FHIR and HIPAA queries', async () => {
      const response = await brain.chat('explain electronic health record ehr emr fhir hl7 interoperability hipaa compliance protected health information phi')
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(/ehr|fhir|hl7|hipaa|phi|interoperability/)
    })

    it('should respond to telemedicine and imaging queries', async () => {
      const response = await brain.chat('explain telemedicine telehealth remote patient monitoring clinical decision support medical imaging pacs radiology dicom')
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(/telemedicine|remote\s+patient|clinical\s+decision|pacs|dicom|radiology/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Healthcare IT & HIPAA with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Healthcare IT & HIPAA')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have at least 5 connected sub-concepts including EHR & FHIR Standards and HIPAA Compliance & PHI', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Healthcare IT & HIPAA')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('EHR & FHIR Standards')
      expect(names).toContain('HIPAA Compliance & PHI')
    })

    it('should relate EHR & FHIR Standards to HIPAA Compliance & PHI', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('EHR & FHIR Standards')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('HIPAA Compliance & PHI')
    })
  })
})
