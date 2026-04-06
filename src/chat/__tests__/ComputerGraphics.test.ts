import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Computer Graphics & Visualization Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about graphics APIs and pipeline', async () => {
      const r = await brain.chat('Explain opengl vulkan directx graphics api rendering and shader program')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/opengl|vulkan|directx|graphics|pipeline|shader/)
    })

    it('answers about ray tracing and PBR', async () => {
      const r = await brain.chat('How does ray tracing path tracing global illumination and physically based rendering pbr work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ray\s*trac|path\s*trac|pbr|illumination|render/)
    })

    it('answers about 3D modeling and animation', async () => {
      const r = await brain.chat('Explain 3d modeling mesh polygon vertex normal and skeletal animation rigging')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mesh|polygon|vertex|texture|animation|3d|model/)
    })

    it('answers about web graphics', async () => {
      const r = await brain.chat('How does webgl threejs 3d web browser rendering and webgpu compute shader work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/webgl|three\.?js|webgpu|canvas|web/)
    })

    it('answers about image processing', async () => {
      const r = await brain.chat('Explain image processing convolution filter blur and color space rgb hsv')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/image|convolution|filter|color|rgb|hsv/)
    })

    it('answers about data visualization', async () => {
      const r = await brain.chat('How does data visualization chart plot d3 matplotlib and scientific visualization work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/visual|chart|d3|matplotlib|data/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Computer Graphics root concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Computer Graphics')
      expect(node).toBeDefined()
      expect(node!.domain).toBe('graphics')
    })

    it('has Graphics APIs & Pipeline concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Graphics APIs & Pipeline')
      expect(node).toBeDefined()
    })

    it('has Ray Tracing & PBR concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Ray Tracing & PBR')
      expect(node).toBeDefined()
    })

    it('has Web Graphics concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Web Graphics')
      expect(node).toBeDefined()
    })

    it('has Data Visualization concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Data Visualization')
      expect(node).toBeDefined()
    })

    it('Computer Graphics has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Computer Graphics')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Graphics APIs is related to Ray Tracing', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Graphics APIs & Pipeline')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Ray Tracing & PBR')
    })
  })
})
