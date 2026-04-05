/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ImageAnalyzer — Tests                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ImageAnalyzer, DEFAULT_ANALYZER_CONFIG } from '../ImageAnalyzer.js'

// Small valid base64 PNG signature (1x1 pixel PNG)
const TINY_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
// Small valid base64 JPEG signature
const TINY_JPEG_B64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsM'

describe('ImageAnalyzer', () => {
  let analyzer: ImageAnalyzer

  beforeEach(() => {
    analyzer = new ImageAnalyzer()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      expect(analyzer.totalAnalyses).toBe(0)
    })

    it('accepts custom config', () => {
      const custom = new ImageAnalyzer({ colorCount: 4, deepAnalysis: false })
      expect(custom.totalAnalyses).toBe(0)
    })
  })

  // ── Format Detection ──

  describe('format detection', () => {
    it('detects PNG format from signature', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.format.formatName).toBe('PNG')
      expect(result.format.mimeType).toBe('image/png')
      expect(result.format.hasAlphaChannel).toBe(true)
    })

    it('detects JPEG format from signature', () => {
      const result = analyzer.analyze(TINY_JPEG_B64, 'image/jpeg')
      expect(result.format.formatName).toBe('JPEG')
      expect(result.format.mimeType).toBe('image/jpeg')
      expect(result.format.hasAlphaChannel).toBe(false)
    })

    it('estimates size from base64 data', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.format.estimatedSizeBytes).toBeGreaterThan(0)
      expect(result.format.estimatedSizeKB).toBeGreaterThanOrEqual(0)
    })

    it('estimates dimensions', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.format.estimatedWidth).toBeGreaterThan(0)
      expect(result.format.estimatedHeight).toBeGreaterThan(0)
    })

    it('detects bit depth', () => {
      const pngResult = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(pngResult.format.bitDepth).toBe(32) // PNG with alpha

      const jpegResult = analyzer.analyze(TINY_JPEG_B64, 'image/jpeg')
      expect(jpegResult.format.bitDepth).toBe(24) // JPEG no alpha
    })
  })

  // ── Pixel Analysis ──

  describe('pixel analysis', () => {
    it('extracts dominant colors', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.pixelAnalysis.dominantColors.length).toBeGreaterThan(0)
      for (const color of result.pixelAnalysis.dominantColors) {
        expect(color.name).toBeTruthy()
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i)
        expect(['warm', 'cool', 'neutral']).toContain(color.category)
        expect(color.percentage).toBeGreaterThanOrEqual(0)
        expect(color.percentage).toBeLessThanOrEqual(1)
      }
    })

    it('computes brightness in 0-1 range', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.pixelAnalysis.averageBrightness).toBeGreaterThanOrEqual(0)
      expect(result.pixelAnalysis.averageBrightness).toBeLessThanOrEqual(1)
    })

    it('computes contrast in 0-1 range', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.pixelAnalysis.contrast).toBeGreaterThanOrEqual(0)
      expect(result.pixelAnalysis.contrast).toBeLessThanOrEqual(1)
    })

    it('builds histogram buckets', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.pixelAnalysis.histogram.length).toBe(8)
      for (const bucket of result.pixelAnalysis.histogram) {
        expect(bucket.range).toBeTruthy()
        expect(bucket.count).toBeGreaterThanOrEqual(0)
        expect(bucket.percentage).toBeGreaterThanOrEqual(0)
      }
    })

    it('classifies color space', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(['grayscale', 'limited', 'standard', 'rich', 'vibrant']).toContain(result.pixelAnalysis.colorSpace)
    })
  })

  // ── Structure Analysis ──

  describe('structure analysis', () => {
    it('computes edge density', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.structure.edgeDensity).toBeGreaterThanOrEqual(0)
      expect(result.structure.edgeDensity).toBeLessThanOrEqual(1)
    })

    it('computes symmetry score', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.structure.symmetryScore).toBeGreaterThanOrEqual(0)
      expect(result.structure.symmetryScore).toBeLessThanOrEqual(1)
    })

    it('detects composition type', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      const validTypes = ['centered', 'rule_of_thirds', 'symmetrical', 'diagonal', 'scattered', 'layered', 'uniform']
      expect(validTypes).toContain(result.structure.composition)
    })

    it('assesses complexity', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(['minimal', 'simple', 'moderate', 'complex', 'very_complex']).toContain(result.structure.complexity)
    })
  })

  // ── Content Classification ──

  describe('content classification', () => {
    it('classifies image content type', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      const validTypes = ['photograph', 'screenshot', 'diagram', 'chart', 'illustration',
        'icon', 'text_document', 'map', 'code_snippet', 'ui_mockup', 'meme', 'infographic', 'unknown']
      expect(validTypes).toContain(result.classification.primaryType)
    })

    it('provides confidence score', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.classification.confidence).toBeGreaterThanOrEqual(0)
      expect(result.classification.confidence).toBeLessThanOrEqual(1)
    })

    it('generates tags', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.classification.tags.length).toBeGreaterThan(0)
    })

    it('uses question hints for classification', () => {
      const chartResult = analyzer.analyze(TINY_PNG_B64, 'image/png', 'What does this chart show?')
      expect(chartResult.classification.primaryType === 'chart' || chartResult.classification.secondaryTypes.includes('chart')).toBe(true)

      const codeResult = analyzer.analyze(TINY_PNG_B64, 'image/png', 'What code is in this snippet?')
      expect(codeResult.classification.primaryType === 'code_snippet' || codeResult.classification.secondaryTypes.includes('code_snippet')).toBe(true)
    })
  })

  // ── Text Detection ──

  describe('text detection', () => {
    it('returns text regions array', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(Array.isArray(result.textRegions)).toBe(true)
    })

    it('can be disabled', () => {
      const noText = new ImageAnalyzer({ detectText: false })
      const result = noText.analyze(TINY_PNG_B64, 'image/png')
      expect(result.textRegions).toHaveLength(0)
    })
  })

  // ── Scene Analysis ──

  describe('scene analysis', () => {
    it('detects environment', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(['indoor', 'outdoor', 'abstract', 'digital', 'mixed']).toContain(result.scene.environment)
    })

    it('detects mood', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.scene.mood).toBeTruthy()
    })

    it('detects lighting', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(['bright', 'dim', 'natural', 'artificial', 'mixed', 'dark']).toContain(result.scene.lighting)
    })

    it('detects depth', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(['flat', 'shallow', 'deep']).toContain(result.scene.depth)
    })
  })

  // ── Quality Assessment ──

  describe('quality assessment', () => {
    it('assesses resolution', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(['low', 'medium', 'high', 'very_high']).toContain(result.quality.resolution)
    })

    it('computes sharpness 0-1', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.quality.sharpness).toBeGreaterThanOrEqual(0)
      expect(result.quality.sharpness).toBeLessThanOrEqual(1)
    })

    it('computes overall quality score', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.quality.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.quality.overallScore).toBeLessThanOrEqual(1)
    })

    it('lists quality issues', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(Array.isArray(result.quality.issues)).toBe(true)
    })
  })

  // ── Description ──

  describe('description', () => {
    it('generates a text description', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.description).toBeTruthy()
      expect(result.description.length).toBeGreaterThan(50)
    })

    it('includes question context in description', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png', 'What colors are in this?')
      expect(result.description).toContain('colors')
    })
  })

  // ── Confidence & Processing ──

  describe('confidence and processing', () => {
    it('has confidence between 0 and 1', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('records processing time', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png')
      expect(result.processingMs).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Validation ──

  describe('input validation', () => {
    it('throws on empty data', () => {
      expect(() => analyzer.analyze('', 'image/png')).toThrow('empty')
    })

    it('throws on oversized data', () => {
      const small = new ImageAnalyzer({ maxSizeBytes: 10 })
      expect(() => small.analyze(TINY_PNG_B64, 'image/png')).toThrow('exceeds')
    })
  })

  // ── Stats ──

  describe('stats', () => {
    it('tracks analysis count', () => {
      analyzer.analyze(TINY_PNG_B64, 'image/png')
      analyzer.analyze(TINY_JPEG_B64, 'image/jpeg')
      expect(analyzer.totalAnalyses).toBe(2)
    })

    it('tracks format distribution', () => {
      analyzer.analyze(TINY_PNG_B64, 'image/png')
      analyzer.analyze(TINY_JPEG_B64, 'image/jpeg')
      const stats = analyzer.getStats()
      expect(stats.formatDistribution['PNG']).toBe(1)
      expect(stats.formatDistribution['JPEG']).toBe(1)
    })

    it('computes average processing time', () => {
      analyzer.analyze(TINY_PNG_B64, 'image/png')
      const stats = analyzer.getStats()
      expect(stats.averageProcessingMs).toBeGreaterThanOrEqual(0)
    })

    it('clears stats', () => {
      analyzer.analyze(TINY_PNG_B64, 'image/png')
      analyzer.clear()
      expect(analyzer.totalAnalyses).toBe(0)
      expect(analyzer.getStats().formatDistribution).toEqual({})
    })
  })

  // ── Different Formats ──

  describe('different formats', () => {
    it('analyzes JPEG images', () => {
      const result = analyzer.analyze(TINY_JPEG_B64, 'image/jpeg')
      expect(result.format.formatName).toBe('JPEG')
      expect(result.description).toBeTruthy()
    })

    it('analyzes GIF images', () => {
      // GIF89a signature in base64
      const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      const result = analyzer.analyze(gifB64, 'image/gif')
      expect(result.format.formatName).toBe('GIF')
    })

    it('analyzes WebP images', () => {
      const webpB64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaACdAEO/hepAA=='
      const result = analyzer.analyze(webpB64, 'image/webp')
      expect(result.format.formatName).toBe('WEBP')
    })
  })

  // ── Question Answering ──

  describe('question answering', () => {
    it('answers color questions', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png', 'What colors are in this image?')
      expect(result.description.toLowerCase()).toContain('color')
    })

    it('answers text detection questions', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png', 'What text is in this image?')
      expect(result.description.toLowerCase()).toContain('text')
    })

    it('answers general what-is questions', () => {
      const result = analyzer.analyze(TINY_PNG_B64, 'image/png', 'What is this image?')
      expect(result.description.toLowerCase()).toContain('appears')
    })
  })
})
