import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('ScientificComputing', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should respond to HPC parallel and GPU computing queries', async () => {
      const response = await brain.chat(
        'explain high performance computing hpc supercomputer parallel computing openmp gpu computing cuda opencl nvidia tensor core',
      )
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(/hpc|parallel|openmp|cuda|gpu|supercomputer/)
    })

    it('should respond to MPI and numerical methods queries', async () => {
      const response = await brain.chat(
        'explain mpi message passing interface distributed numerical methods finite element method simulation hpc storage lustre',
      )
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(
        /mpi|message\s+passing|finite\s+element|numerical|lustre|storage/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Scientific Computing & HPC with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Scientific Computing & HPC')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have at least 5 connected sub-concepts including Parallel Computing and GPU Computing & CUDA', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Scientific Computing & HPC')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Parallel Computing')
      expect(names).toContain('GPU Computing & CUDA')
    })

    it('should relate Parallel Computing to GPU Computing & CUDA', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Parallel Computing')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('GPU Computing & CUDA')
    })
  })
})
