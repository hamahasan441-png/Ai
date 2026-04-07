/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MLOps & Feature Engineering Knowledge — Tests                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MLOpsEngineering', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match ML pipeline and model registry keywords', async () => {
      const r = await brain.chat('explain ml pipeline kubeflow mlflow airflow metaflow model registry mlflow model versioning ab testing shadow deployment')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ml\s+pipeline|kubeflow|mlflow|model\s+registry|versioning/)
    })

    it('should match feature store and data versioning keywords', async () => {
      const r = await brain.chat('explain feature store feast tecton hopsworks online offline data versioning dvc delta lake lakefs data lineage')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/feature\s+store|feast|tecton|dvc|delta\s+lake|data\s+versioning/)
    })

    it('should match experiment tracking and model monitoring keywords', async () => {
      const r = await brain.chat('explain experiment tracking mlflow tracking weights biases neptune model monitoring data drift concept drift retraining trigger')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mlflow|tracking|monitoring|drift|feature\s+store|pipeline/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept MLOps & Feature Engineering with domain ml', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('MLOps & Feature Engineering')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('ml')
    })

    it('should have >=5 connected sub-concepts including ML Pipelines & Orchestration', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('MLOps & Feature Engineering')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('ML Pipelines & Orchestration')
      expect(names).toContain('Model Registry & Deployment')
    })

    it('should relate ML Pipelines & Orchestration to Feature Stores & Serving', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('ML Pipelines & Orchestration')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Feature Stores & Serving')
    })
  })
})
