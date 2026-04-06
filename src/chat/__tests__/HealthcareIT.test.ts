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
      expect(response).toMatch(/ehr|fhir|hl7|hipaa|phi|interoperability/)
    })

    it('should respond to telemedicine and imaging queries', async () => {
      const response = await brain.chat('explain telemedicine telehealth remote patient monitoring clinical decision support medical imaging pacs radiology dicom')
      expect(response).toMatch(/telemedicine|remote\s+patient|clinical\s+decision|pacs|dicom|radiology/)
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
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('EHR & FHIR Standards')
      expect(names).toContain('HIPAA Compliance & PHI')
    })

    it('should relate EHR & FHIR Standards to HIPAA Compliance & PHI', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('EHR & FHIR Standards')
      const names = related.map(r => r.name)
      expect(names).toContain('HIPAA Compliance & PHI')
    })
  })
})
