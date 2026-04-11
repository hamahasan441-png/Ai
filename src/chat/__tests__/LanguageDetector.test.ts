import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageDetector } from '../LanguageDetector.js'

describe('LanguageDetector', () => {
  let detector: LanguageDetector

  beforeEach(() => {
    detector = new LanguageDetector()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(detector).toBeInstanceOf(LanguageDetector)
    })
  })

  describe('detect', () => {
    it('should detect English text', () => {
      const result = detector.detect('The quick brown fox jumps over the lazy dog')
      expect(result.language).toBe('en')
      expect(result.script).toBe('latin')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should detect Kurdish text', () => {
      const result = detector.detect('ئەم بابەتە زۆر گرنگە بۆ ئێمە')
      expect(result.language).toBe('ku')
      expect(result.script).toBe('arabic')
    })

    it('should detect Arabic text', () => {
      const result = detector.detect('هذا هو النص العربي في هذه الصفحة')
      expect(result.language).toBe('ar')
      expect(result.script).toBe('arabic')
    })

    it('should detect Spanish text', () => {
      const result = detector.detect('El gato está en la casa con los niños')
      expect(result.language).toBe('es')
      expect(result.script).toBe('latin')
    })

    it('should detect French text', () => {
      const result = detector.detect('Le chat est dans la maison avec les enfants')
      expect(result.language).toBe('fr')
      expect(result.script).toBe('latin')
    })

    it('should detect German text', () => {
      const result = detector.detect('Die Katze ist in der Wohnung mit den Kindern')
      expect(result.language).toBe('de')
      expect(result.script).toBe('latin')
    })

    it('should detect code', () => {
      const result = detector.detect('function hello() { return "world"; }')
      expect(result.language).toBe('code')
      expect(result.confidence).toBeGreaterThan(0.3)
    })

    it('should detect code with multiple keywords', () => {
      const result = detector.detect(
        'const x = async () => { try { await fetch(); } catch (e) { throw e; } }',
      )
      expect(result.language).toBe('code')
    })

    it('should handle empty string', () => {
      const result = detector.detect('')
      expect(result.language).toBe('unknown')
      expect(result.confidence).toBe(0)
    })

    it('should handle short text with low confidence', () => {
      const result = detector.detect('Hi')
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(result.language).toBeDefined()
    })

    it('should detect CJK script', () => {
      const result = detector.detect('这是中文文本')
      expect(result.script).toBe('cjk')
    })

    it('should detect Cyrillic script', () => {
      const result = detector.detect('Это русский текст')
      expect(result.script).toBe('cyrillic')
    })

    it('should set isCodeMixed for mixed content', () => {
      const result = detector.detect('This function works well with the API')
      expect(typeof result.isCodeMixed).toBe('boolean')
    })

    it('should detect code blocks', () => {
      const result = detector.detect('```javascript\nconst x = 1;\n```')
      expect(result.language).toBe('code')
    })
  })

  describe('detectMultiple', () => {
    it('should detect languages in multiple segments', () => {
      const text = 'This is English text about programming.\n\nconst x = function() { return 1; }'
      const results = detector.detectMultiple(text)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle single segment', () => {
      const results = detector.detectMultiple('Hello world')
      expect(results.length).toBeLessThanOrEqual(1)
    })
  })

  describe('getStats', () => {
    it('should track detection count', () => {
      detector.detect('hello')
      detector.detect('world')
      const stats = detector.getStats()
      expect(stats.detectCount).toBe(2)
    })

    it('should track language counts', () => {
      detector.detect('The quick brown fox jumps over the lazy dog')
      const stats = detector.getStats()
      expect(Object.keys(stats.languageCounts).length).toBeGreaterThan(0)
    })
  })

  describe('serialize/deserialize', () => {
    it('should round-trip state', () => {
      detector.detect('hello world')
      const serialized = detector.serialize()
      const restored = LanguageDetector.deserialize(serialized)
      expect(restored.getStats().detectCount).toBe(1)
    })
  })
})
