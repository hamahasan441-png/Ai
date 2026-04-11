import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('ComputerVision', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match object detection/yolo/segmentation keywords', async () => {
      const r = await brain.chat(
        'explain object detection yolo ssd faster rcnn image segmentation semantic instance panoptic',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/yolo|object\s+detection|segmentation|rcnn/)
    })

    it('should match optical flow/3d vision keywords', async () => {
      const r = await brain.chat(
        'explain optical flow motion estimation video tracking image enhancement restoration super resolution denoising',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/optical\s+flow|tracking|restoration|super\s+resolution/)
    })

    it('should match opencv/face/ocr keywords', async () => {
      const r = await brain.chat(
        'explain opencv image processing face detection recognition deepface arcface ocr optical character recognition tesseract',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/opencv|face|recognition|ocr|tesseract/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Computer Vision & Image Processing with domain ai', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Computer Vision & Image Processing')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('ai')
    })

    it('should have >=5 connected sub-concepts including Object Detection & Recognition and Image Segmentation', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Computer Vision & Image Processing')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Object Detection & Recognition')
      expect(names).toContain('Image Segmentation')
    })

    it('should relate Object Detection & Recognition to Image Segmentation', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Object Detection & Recognition')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Image Segmentation')
    })
  })
})
