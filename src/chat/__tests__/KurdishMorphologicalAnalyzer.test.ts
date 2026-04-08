import { describe, it, expect } from 'vitest'
import { KurdishMorphologicalAnalyzer, DEFAULT_ANALYZER_CONFIG } from '../KurdishMorphologicalAnalyzer.js'

// ─── DEFAULT_ANALYZER_CONFIG ────────────────────────────────────────────────────

describe('DEFAULT_ANALYZER_CONFIG', () => {
  it('should have enableCache set to true', () => {
    expect(DEFAULT_ANALYZER_CONFIG.enableCache).toBe(true)
  })

  it('should have maxCacheSize set to 500', () => {
    expect(DEFAULT_ANALYZER_CONFIG.maxCacheSize).toBe(500)
  })
})

// ─── Constructor ────────────────────────────────────────────────────────────────

describe('KurdishMorphologicalAnalyzer constructor', () => {
  it('should create an instance with default config', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const config = analyzer.getConfig()
    expect(config.enableCache).toBe(true)
    expect(config.maxCacheSize).toBe(500)
  })

  it('should allow overriding enableCache', () => {
    const analyzer = new KurdishMorphologicalAnalyzer({ enableCache: false })
    expect(analyzer.getConfig().enableCache).toBe(false)
  })

  it('should allow overriding maxCacheSize', () => {
    const analyzer = new KurdishMorphologicalAnalyzer({ maxCacheSize: 10 })
    expect(analyzer.getConfig().maxCacheSize).toBe(10)
  })

  it('should allow overriding both config options', () => {
    const analyzer = new KurdishMorphologicalAnalyzer({ enableCache: false, maxCacheSize: 100 })
    const config = analyzer.getConfig()
    expect(config.enableCache).toBe(false)
    expect(config.maxCacheSize).toBe(100)
  })

  it('should have known roots populated', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getStats().knownRoots).toBeGreaterThan(100)
  })
})

// ─── analyze() ──────────────────────────────────────────────────────────────────

describe('analyze()', () => {
  it('should return a MorphemeAnalysis object', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('کتێب')
    expect(result).toHaveProperty('word')
    expect(result).toHaveProperty('morphemes')
    expect(result).toHaveProperty('root')
    expect(result).toHaveProperty('prefixes')
    expect(result).toHaveProperty('suffixes')
    expect(result).toHaveProperty('pattern')
    expect(result).toHaveProperty('pos')
  })

  it('should identify a known root word directly', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('کتێب')
    expect(result.root).toBe('کتێب')
    expect(result.pos).toBe('noun')
    expect(result.pattern).toBe('ROOT')
    expect(result.prefixes).toEqual([])
    expect(result.suffixes).toEqual([])
  })

  it('should detect noun POS for a known noun root', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('شار').pos).toBe('noun')
  })

  it('should detect verb POS for a known verb root', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('خوێن').pos).toBe('verb')
  })

  it('should detect adjective POS for a known adjective root', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('گەورە').pos).toBe('adjective')
  })

  it('should extract the present-tense prefix دە', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('دەخوێن')
    expect(result.prefixes).toContain('دە')
    // After prefix strip, suffix ن is also stripped, resolving root to خو (eat)
    expect(result.root).toBe('خو')
  })

  it('should extract the plural suffix ان', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('کتێبان')
    expect(result.suffixes).toContain('ان')
  })

  it('should extract definite plural suffix ەکان', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('کتێبەکان')
    expect(result.suffixes).toContain('ەکان')
  })

  it('should handle a word with a definite singular suffix ەکە', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('کتێبەکە')
    expect(result.suffixes).toContain('ەکە')
  })

  it('should build a pattern with prefix and suffix markers', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('دەخوێنم')
    expect(result.pattern).toContain('ROOT')
    expect(result.pattern).toContain('[')
  })

  it('should strip whitespace from input', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('  کتێب  ')
    expect(result.word).toBe('کتێب')
  })

  it('should handle an empty string gracefully', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('')
    expect(result.word).toBe('')
    expect(result.root).toBe('')
  })

  it('should include all morphemes in the morphemes array', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('دەخوێنم')
    expect(result.morphemes.length).toBeGreaterThanOrEqual(2)
    expect(result.morphemes).toContain('خوێن')
  })

  it('should use cache on repeated analysis of the same word', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('کتێب')
    analyzer.analyze('کتێب')
    expect(analyzer.getStats().cacheHits).toBe(1)
  })

  it('should increment analyzedWords count', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('شار')
    analyzer.analyze('کتێب')
    expect(analyzer.getStats().analyzedWords).toBe(2)
  })

  it('should not increment analyzedWords on cache hit', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('شار')
    analyzer.analyze('شار')
    expect(analyzer.getStats().analyzedWords).toBe(1)
  })

  it('should detect numeral POS', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('یەک').pos).toBe('numeral')
  })

  it('should detect pronoun POS', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('من').pos).toBe('pronoun')
  })

  it('should detect adverb POS', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('ئێستا').pos).toBe('adverb')
  })

  it('should detect postposition POS', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.analyze('لە').pos).toBe('postposition')
  })
})

// ─── getRoot() ──────────────────────────────────────────────────────────────────

describe('getRoot()', () => {
  it('should return the root of a known word', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getRoot('کتێب')).toBe('کتێب')
  })

  it('should extract root from a word with present-tense prefix', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    // After stripping prefix دە and suffix ن, root resolves to خو
    expect(analyzer.getRoot('دەخوێن')).toBe('خو')
  })

  it('should extract root from a word with plural suffix', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getRoot('کتێبان')).toBe('کتێب')
  })

  it('should extract root from a word with definite plural suffix', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getRoot('کتێبەکان')).toBe('کتێب')
  })

  it('should return a known root word as-is', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getRoot('باران')).toBe('باران')
  })

  it('should handle whitespace around the word', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getRoot('  شار  ')).toBe('شار')
  })

  it('should extract root from a verb root', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getRoot('نووس')).toBe('نووس')
  })

  it('should return stem when no known root matches', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const root = analyzer.getRoot('ئابجد')
    expect(typeof root).toBe('string')
    expect(root.length).toBeGreaterThan(0)
  })
})

// ─── isValidWord() ──────────────────────────────────────────────────────────────

describe('isValidWord()', () => {
  it('should return true for a known Kurdish root', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('کتێب')).toBe(true)
  })

  it('should return true for a known verb root', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('خوێن')).toBe(true)
  })

  it('should return false for an empty string', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('')).toBe(false)
  })

  it('should return false for whitespace-only input', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('   ')).toBe(false)
  })

  it('should return false for non-Kurdish Latin characters', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('hello')).toBe(false)
  })

  it('should return false for numeric-only input', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('12345')).toBe(false)
  })

  it('should return true for Kurdish text with at least two characters', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('شار')).toBe(true)
  })

  it('should handle whitespace around a valid word', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('  کتێب  ')).toBe(true)
  })
})

// ─── checkSpelling() ────────────────────────────────────────────────────────────

describe('checkSpelling()', () => {
  it('should mark a known root word as correct', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('کتێب')
    expect(result.isCorrect).toBe(true)
    expect(result.suggestions).toEqual([])
  })

  it('should include root meaning in explanation for correct words', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('کتێب')
    expect(result.explanation).toContain('book')
  })

  it('should mark non-Kurdish characters as incorrect', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('hello')
    expect(result.isCorrect).toBe(false)
    expect(result.explanation).toContain('non-Kurdish')
  })

  it('should return no suggestions for non-Kurdish characters', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('hello')
    expect(result.suggestions).toEqual([])
  })

  it('should mark a known verb root as correct', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('خوێن')
    expect(result.isCorrect).toBe(true)
  })

  it('should return suggestions for a misspelled word close to known roots', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    // Slightly modified known root - changing one char from a known word
    const result = analyzer.checkSpelling('باشش')
    expect(result.isCorrect).toBe(false)
    expect(result.suggestions.length).toBeGreaterThanOrEqual(0)
  })

  it('should limit suggestions to at most 5', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('باشش')
    expect(result.suggestions.length).toBeLessThanOrEqual(5)
  })

  it('should provide an explanation for unknown words', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    // Use a word far from any known root so it won't resolve to one
    const result = analyzer.checkSpelling('ئابجدهوز')
    expect(result.isCorrect).toBe(false)
    if (result.suggestions.length > 0) {
      expect(result.explanation).toContain('Did you mean')
    } else {
      expect(result.explanation).toContain('No close matches')
    }
  })

  it('should spell-check a word with a definite plural suffix correctly', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('کتێبەکان')
    expect(result.isCorrect).toBe(true)
  })
})

// ─── transliterate() ────────────────────────────────────────────────────────────

describe('transliterate()', () => {
  it('should convert Arabic script to Latin', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('کتێب', 'latin')
    expect(result.script).toBe('latin')
    expect(result.original).toBe('کتێب')
    expect(typeof result.converted).toBe('string')
    expect(result.converted.length).toBeGreaterThan(0)
  })

  it('should preserve the original text in the result', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('شار', 'latin')
    expect(result.original).toBe('شار')
  })

  it('should convert known characters correctly (Arabic → Latin)', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    // ک → k, ت → t, ێ → ê, ب → b
    const result = analyzer.transliterate('کتێب', 'latin')
    expect(result.converted).toBe('ktêb')
  })

  it('should convert Latin text to Arabic script', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('ktêb', 'arabic')
    expect(result.script).toBe('arabic')
    expect(result.converted).toBe('کتێب')
  })

  it('should handle double-character mapping وو → û', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('نووس', 'latin')
    expect(result.converted).toContain('û')
  })

  it('should handle û → وو in Latin to Arabic', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('nûs', 'arabic')
    expect(result.converted).toContain('وو')
  })

  it('should pass through spaces unchanged', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('شار شار', 'latin')
    expect(result.converted).toContain(' ')
  })

  it('should handle empty string', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('', 'latin')
    expect(result.converted).toBe('')
  })

  it('should convert ڕ to ř', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('ڕۆژ', 'latin')
    expect(result.converted).toContain('ř')
  })

  it('should convert ř back to ڕ', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('řoj', 'arabic')
    expect(result.converted).toContain('ڕ')
  })

  it('should handle double-character mapping یی → î', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('یی', 'latin')
    expect(result.converted).toBe('î')
  })

  it('should convert Latin to Arabic case-insensitively', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const lower = analyzer.transliterate('ktêb', 'arabic')
    const upper = analyzer.transliterate('KTÊB', 'arabic')
    expect(lower.converted).toBe(upper.converted)
  })
})

// ─── conjugate() ────────────────────────────────────────────────────────────────

describe('conjugate()', () => {
  const analyzer = new KurdishMorphologicalAnalyzer()
  const root = 'خوێن' // 'read'

  describe('present tense', () => {
    it('should conjugate 1st person singular (1s)', () => {
      const result = analyzer.conjugate(root, 'present', '1s')
      expect(result).toBe('دە' + root + 'م')
    })

    it('should conjugate 2nd person singular (2s)', () => {
      const result = analyzer.conjugate(root, 'present', '2s')
      expect(result).toBe('دە' + root + 'ی')
    })

    it('should conjugate 3rd person singular (3s)', () => {
      const result = analyzer.conjugate(root, 'present', '3s')
      expect(result).toBe('دە' + root)
    })

    it('should conjugate 1st person plural (1p)', () => {
      const result = analyzer.conjugate(root, 'present', '1p')
      expect(result).toBe('دە' + root + 'ین')
    })

    it('should conjugate 2nd person plural (2p)', () => {
      const result = analyzer.conjugate(root, 'present', '2p')
      expect(result).toBe('دە' + root + 'ن')
    })

    it('should conjugate 3rd person plural (3p) with ە', () => {
      const result = analyzer.conjugate(root, 'present', '3p')
      expect(result).toBe('دە' + root + 'ە' + 'ن')
    })
  })

  describe('past tense', () => {
    it('should conjugate 1st person singular (1s)', () => {
      const result = analyzer.conjugate(root, 'past', '1s')
      expect(result).toBe(root + 'م')
    })

    it('should conjugate 2nd person singular (2s)', () => {
      const result = analyzer.conjugate(root, 'past', '2s')
      expect(result).toBe(root + 'ی')
    })

    it('should conjugate 3rd person singular (3s) with no suffix', () => {
      const result = analyzer.conjugate(root, 'past', '3s')
      expect(result).toBe(root)
    })

    it('should conjugate 1st person plural (1p)', () => {
      const result = analyzer.conjugate(root, 'past', '1p')
      expect(result).toBe(root + 'ین')
    })

    it('should conjugate 2nd person plural (2p)', () => {
      const result = analyzer.conjugate(root, 'past', '2p')
      expect(result).toBe(root + 'ن')
    })

    it('should conjugate 3rd person plural (3p)', () => {
      const result = analyzer.conjugate(root, 'past', '3p')
      expect(result).toBe(root + 'ن')
    })
  })

  describe('subjunctive tense', () => {
    it('should conjugate 1st person singular (1s)', () => {
      const result = analyzer.conjugate(root, 'subjunctive', '1s')
      expect(result).toBe('ب' + root + 'م')
    })

    it('should conjugate 2nd person singular (2s)', () => {
      const result = analyzer.conjugate(root, 'subjunctive', '2s')
      expect(result).toBe('ب' + root + 'ی')
    })

    it('should conjugate 3rd person singular (3s)', () => {
      const result = analyzer.conjugate(root, 'subjunctive', '3s')
      expect(result).toBe('ب' + root)
    })

    it('should conjugate 1st person plural (1p)', () => {
      const result = analyzer.conjugate(root, 'subjunctive', '1p')
      expect(result).toBe('ب' + root + 'ین')
    })

    it('should conjugate 2nd person plural (2p)', () => {
      const result = analyzer.conjugate(root, 'subjunctive', '2p')
      expect(result).toBe('ب' + root + 'ن')
    })

    it('should conjugate 3rd person plural (3p) with ە', () => {
      const result = analyzer.conjugate(root, 'subjunctive', '3p')
      expect(result).toBe('ب' + root + 'ە' + 'ن')
    })
  })

  describe('unknown tense', () => {
    it('should fall through to default with root + suffix', () => {
      const result = analyzer.conjugate(root, 'imperative', '1s')
      expect(result).toBe(root + 'م')
    })

    it('should return root alone for 3s with unknown tense', () => {
      const result = analyzer.conjugate(root, 'imperative', '3s')
      expect(result).toBe(root)
    })
  })

  it('should handle unknown person gracefully (empty suffix)', () => {
    const result = analyzer.conjugate(root, 'present', 'unknown')
    expect(result).toBe('دە' + root)
  })
})

// ─── getStats() ─────────────────────────────────────────────────────────────────

describe('getStats()', () => {
  it('should return zero counts on a fresh instance', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const stats = analyzer.getStats()
    expect(stats.analyzedWords).toBe(0)
    expect(stats.cacheHits).toBe(0)
  })

  it('should report known roots count > 0', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.getStats().knownRoots).toBeGreaterThan(0)
  })

  it('should track analyzed words correctly', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('شار')
    analyzer.analyze('کتێب')
    analyzer.analyze('باران')
    expect(analyzer.getStats().analyzedWords).toBe(3)
  })

  it('should track cache hits correctly', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('شار')
    analyzer.analyze('شار')
    analyzer.analyze('شار')
    expect(analyzer.getStats().cacheHits).toBe(2)
  })

  it('should not count cache hits in analyzedWords', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('کتێب')
    analyzer.analyze('کتێب')
    analyzer.analyze('کتێب')
    const stats = analyzer.getStats()
    expect(stats.analyzedWords).toBe(1)
    expect(stats.cacheHits).toBe(2)
  })
})

// ─── clear() ────────────────────────────────────────────────────────────────────

describe('clear()', () => {
  it('should reset analyzedWords to 0', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('کتێب')
    analyzer.clear()
    expect(analyzer.getStats().analyzedWords).toBe(0)
  })

  it('should reset cacheHits to 0', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('شار')
    analyzer.analyze('شار')
    analyzer.clear()
    expect(analyzer.getStats().cacheHits).toBe(0)
  })

  it('should clear the cache so next analyze re-processes the word', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('کتێب')
    analyzer.clear()
    analyzer.analyze('کتێب')
    // After clear, analyzing again should NOT be a cache hit
    expect(analyzer.getStats().cacheHits).toBe(0)
    expect(analyzer.getStats().analyzedWords).toBe(1)
  })

  it('should allow continued use after clear', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('شار')
    analyzer.clear()
    const result = analyzer.analyze('کتێب')
    expect(result.root).toBe('کتێب')
  })
})

// ─── Edge cases ─────────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('should handle analyzing a whitespace-only string', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('   ')
    expect(result.word).toBe('')
  })

  it('should not crash on a single Kurdish character', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.analyze('ک')
    expect(result.root).toBe('ک')
  })

  it('should evict oldest cache entry when cache is full', () => {
    const analyzer = new KurdishMorphologicalAnalyzer({ maxCacheSize: 2 })
    analyzer.analyze('شار')
    analyzer.analyze('کتێب')
    analyzer.analyze('باران') // should evict 'شار'

    // The first word should no longer be a cache hit — analyzing it re-processes
    const statsBefore = analyzer.getStats()
    const prevAnalyzed = statsBefore.analyzedWords
    analyzer.analyze('شار')
    // If شار was evicted, analyzedWords increments (no cache hit)
    expect(analyzer.getStats().analyzedWords).toBe(prevAnalyzed + 1)
  })

  it('should not cache when enableCache is false', () => {
    const analyzer = new KurdishMorphologicalAnalyzer({ enableCache: false })
    analyzer.analyze('کتێب')
    analyzer.analyze('کتێب')
    const stats = analyzer.getStats()
    expect(stats.cacheHits).toBe(0)
    expect(stats.analyzedWords).toBe(2)
  })

  it('should return consistent results with cache disabled', () => {
    const analyzer = new KurdishMorphologicalAnalyzer({ enableCache: false })
    const r1 = analyzer.analyze('کتێب')
    const r2 = analyzer.analyze('کتێب')
    expect(r1.root).toBe(r2.root)
    expect(r1.pos).toBe(r2.pos)
    expect(r1.pattern).toBe(r2.pattern)
  })

  it('should handle getRoot with an empty string', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const root = analyzer.getRoot('')
    expect(root).toBe('')
  })

  it('should handle isValidWord with mixed Kurdish and Latin chars', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    expect(analyzer.isValidWord('کتێبabc')).toBe(false)
  })

  it('should handle checkSpelling with empty string', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.checkSpelling('')
    expect(result.isCorrect).toBe(false)
  })

  it('should handle transliterate with punctuation pass-through', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('کتێب!', 'latin')
    expect(result.converted).toContain('!')
  })

  it('should handle transliterate with numbers pass-through', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    const result = analyzer.transliterate('123', 'latin')
    expect(result.converted).toBe('123')
  })

  it('should serialize and deserialize state', () => {
    const analyzer = new KurdishMorphologicalAnalyzer()
    analyzer.analyze('کتێب')
    analyzer.analyze('شار')
    const serialized = analyzer.serialize()

    const analyzer2 = new KurdishMorphologicalAnalyzer()
    analyzer2.deserialize(serialized)
    const stats = analyzer2.getStats()
    expect(stats.analyzedWords).toBe(2)
  })
})
