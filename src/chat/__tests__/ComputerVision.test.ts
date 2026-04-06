import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('ComputerVision', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match object detection/yolo/segmentation keywords', () => {
      const response = brain.chat('explain object detection yolo ssd faster rcnn image segmentation semantic instance panoptic')
      expect(response).toMatch(/yolo|object\s+detection|segmentation|rcnn/i)
    })

    it('should match optical flow/3d vision keywords', () => {
      const response = brain.chat('explain optical flow motion estimation video tracking image enhancement restoration super resolution denoising')
      expect(response).toMatch(/optical\s+flow|tracking|restoration|super\s+resolution/i)
    })

    it('should match opencv/face/ocr keywords', () => {
      const response = brain.chat('explain opencv image processing face detection recognition deepface arcface ocr optical character recognition tesseract')
      expect(response).toMatch(/opencv|face|recognition|ocr|tesseract/i)
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
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Object Detection & Recognition')
      expect(names).toContain('Image Segmentation')
    })

    it('should relate Object Detection & Recognition to Image Segmentation', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Object Detection & Recognition')
      const names = related.map(r => r.name)
      expect(names).toContain('Image Segmentation')
    })
  })
})
