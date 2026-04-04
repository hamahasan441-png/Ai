import { describe, it, expect, beforeEach } from 'vitest'
import { NormalizationEngine } from '../NormalizationEngine.js'

describe('NormalizationEngine', () => {
  let engine: NormalizationEngine

  beforeEach(() => {
    engine = new NormalizationEngine()
  })

  // ── Constructor & Config ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const e = new NormalizationEngine()
      const stats = e.getStats()
      expect(stats.totalNormalizations).toBe(0)
      expect(stats.totalRules).toBe(0)
    })

    it('accepts partial config overrides', () => {
      const e = new NormalizationEngine({ caseFolding: false, stripAccents: true })
      const result = e.normalize('HELLO')
      expect(result.text.normalized).toBe('HELLO')
    })

    it('seeds built-in abbreviations on creation', () => {
      const abbrs = engine.getAbbreviations()
      expect(abbrs.length).toBeGreaterThan(0)
      const map = new Map(abbrs)
      expect(map.get("can't")).toBe('cannot')
    })

    it('respects locale config', () => {
      const e = new NormalizationEngine({ locale: 'fr' })
      // Should not throw; locale is stored
      expect(e.getStats().totalNormalizations).toBe(0)
    })
  })

  // ── normalize() ──

  describe('normalize', () => {
    it('lowercases text by default', () => {
      const result = engine.normalize('HELLO WORLD')
      expect(result.text.normalized).toBe('hello world')
    })

    it('collapses whitespace by default', () => {
      const result = engine.normalize('hello   world\n\tfoo')
      expect(result.text.normalized).toBe('hello world foo')
    })

    it('preserves original text in result', () => {
      const result = engine.normalize('FOO  BAR')
      expect(result.text.original).toBe('FOO  BAR')
    })

    it('records changes made during normalization', () => {
      const result = engine.normalize('HELLO   WORLD')
      expect(result.text.changes.length).toBeGreaterThan(0)
    })

    it('tracks processing time', () => {
      const result = engine.normalize('test')
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('strips punctuation when configured', () => {
      const e = new NormalizationEngine({ stripPunctuation: true })
      const result = e.normalize('hello, world!')
      expect(result.text.normalized).not.toContain(',')
      expect(result.text.normalized).not.toContain('!')
    })

    it('strips accents when configured', () => {
      const e = new NormalizationEngine({ stripAccents: true })
      const result = e.normalize('café résumé')
      expect(result.text.normalized).toBe('cafe resume')
    })

    it('applies unicode normalization', () => {
      const e = new NormalizationEngine({ unicodeNormalization: 'NFC' })
      const result = e.normalize('te\u0301st')
      expect(result.text.normalized).toBeDefined()
    })

    it('skips unicode normalization when set to none', () => {
      const e = new NormalizationEngine({ unicodeNormalization: 'none', caseFolding: false, trimWhitespace: false })
      const result = e.normalize('Hello')
      expect(result.text.normalized).toBe('Hello')
    })

    it('expands built-in abbreviations by default', () => {
      const result = engine.normalize('check the config')
      expect(result.text.normalized).toContain('configuration')
      expect(result.abbreviationsExpanded).toBeGreaterThan(0)
    })

    it('preserves case of listed tokens', () => {
      const e = new NormalizationEngine({ preserveCase: ['NASA'] })
      const result = e.normalize('NASA is great')
      expect(result.text.normalized).toContain('NASA')
    })

    it('caches normalization results', () => {
      engine.normalize('cache me')
      const cached = engine.getCached('cache me')
      expect(cached).toBeDefined()
    })
  })

  // ── Custom Rules ──

  describe('addRule / removeRule', () => {
    it('adds a custom rule and applies it during normalization', () => {
      const rule = engine.addRule('replace-foo', 'foo', 'bar')
      expect(rule.id).toBeTruthy()
      expect(rule.name).toBe('replace-foo')

      const result = engine.normalize('I have foo')
      expect(result.text.normalized).toContain('bar')
      expect(result.rulesApplied).toContain(rule.id)
    })

    it('removes a rule by ID', () => {
      const rule = engine.addRule('temp', 'xyz', '123')
      expect(engine.removeRule(rule.id)).toBe(true)
      expect(engine.getRule(rule.id)).toBeUndefined()
    })

    it('returns false when removing non-existent rule', () => {
      expect(engine.removeRule('no-such-rule')).toBe(false)
    })

    it('respects rule priority ordering', () => {
      engine.addRule('second', 'aaa', 'bbb', { priority: 200 })
      engine.addRule('first', 'test', 'aaa', { priority: 100 })
      const result = engine.normalize('test')
      // 'test' -> 'aaa' (priority 100) -> 'bbb' (priority 200)
      expect(result.text.normalized).toBe('bbb')
    })

    it('supports disabling a rule', () => {
      const rule = engine.addRule('disable-me', 'hello', 'goodbye')
      engine.setRuleEnabled(rule.id, false)
      const result = engine.normalize('hello')
      expect(result.text.normalized).toBe('hello')
    })

    it('enables a disabled rule', () => {
      const rule = engine.addRule('re-enable', 'alpha', 'beta', { enabled: false })
      engine.setRuleEnabled(rule.id, true)
      const result = engine.normalize('alpha')
      expect(result.text.normalized).toBe('beta')
    })

    it('filters rules by category', () => {
      engine.addRule('r1', 'a', 'b', { category: 'formatting' })
      engine.addRule('r2', 'c', 'd', { category: 'cleanup' })
      const formatting = engine.getRules('formatting')
      expect(formatting).toHaveLength(1)
      expect(formatting[0].category).toBe('formatting')
    })

    it('returns all rules when no category filter', () => {
      engine.addRule('r1', 'a', 'b')
      engine.addRule('r2', 'c', 'd')
      expect(engine.getRules().length).toBe(2)
    })

    it('setRuleEnabled returns false for non-existent rule', () => {
      expect(engine.setRuleEnabled('nope', true)).toBe(false)
    })
  })

  // ── Pipeline Management ──

  describe('createPipeline / executePipeline', () => {
    it('creates a pipeline with steps', () => {
      const pipe = engine.createPipeline('test-pipe', [
        { type: 'whitespace', enabled: true, params: {} },
        { type: 'caseFold', enabled: true, params: {} },
      ])
      expect(pipe.id).toBeTruthy()
      expect(pipe.name).toBe('test-pipe')
      expect(pipe.steps).toHaveLength(2)
      expect(pipe.executionCount).toBe(0)
    })

    it('executes a pipeline applying steps in order', () => {
      const pipe = engine.createPipeline('collapse-lower', [
        { type: 'whitespace', enabled: true, params: {} },
        { type: 'caseFold', enabled: true, params: {} },
      ])
      const result = engine.executePipeline(pipe.id, 'HELLO   WORLD')
      expect(result.text.normalized).toBe('hello world')
      expect(result.pipelineId).toBe(pipe.id)
    })

    it('skips disabled pipeline steps', () => {
      const pipe = engine.createPipeline('skip-test', [
        { type: 'caseFold', enabled: false, params: {} },
        { type: 'whitespace', enabled: true, params: {} },
      ])
      const result = engine.executePipeline(pipe.id, 'HELLO   WORLD')
      expect(result.text.normalized).toBe('HELLO WORLD')
    })

    it('returns unchanged text for non-existent pipeline', () => {
      const result = engine.executePipeline('no-such-pipe', 'hello')
      expect(result.text.normalized).toBe('hello')
    })

    it('increments pipeline execution count', () => {
      const pipe = engine.createPipeline('counter', [
        { type: 'trim', enabled: true, params: {} },
      ])
      engine.executePipeline(pipe.id, '  hi  ')
      engine.executePipeline(pipe.id, '  bye  ')
      const retrieved = engine.getPipeline(pipe.id)
      expect(retrieved?.executionCount).toBe(2)
    })

    it('supports punctuation step in pipeline', () => {
      const pipe = engine.createPipeline('strip-punct', [
        { type: 'punctuation', enabled: true, params: {} },
      ])
      const result = engine.executePipeline(pipe.id, 'hello, world!')
      expect(result.text.normalized).not.toContain(',')
    })

    it('supports abbreviation step in pipeline', () => {
      const pipe = engine.createPipeline('abbr-pipe', [
        { type: 'abbreviations', enabled: true, params: {} },
      ])
      const result = engine.executePipeline(pipe.id, 'check the config')
      expect(result.text.normalized).toContain('configuration')
    })

    it('supports synonym step in pipeline', () => {
      engine.addSynonyms('happy', ['glad', 'joyful'])
      const pipe = engine.createPipeline('syn-pipe', [
        { type: 'synonyms', enabled: true, params: {} },
      ])
      const result = engine.executePipeline(pipe.id, 'I am glad')
      expect(result.text.normalized).toContain('happy')
    })

    it('supports stripAccents step in pipeline', () => {
      const pipe = engine.createPipeline('accent-pipe', [
        { type: 'stripAccents', enabled: true, params: {} },
      ])
      const result = engine.executePipeline(pipe.id, 'café')
      expect(result.text.normalized).toBe('cafe')
    })

    it('removes a pipeline by ID', () => {
      const pipe = engine.createPipeline('removable', [])
      expect(engine.removePipeline(pipe.id)).toBe(true)
      expect(engine.getPipeline(pipe.id)).toBeUndefined()
    })

    it('lists all pipelines', () => {
      engine.createPipeline('p1', [])
      engine.createPipeline('p2', [])
      expect(engine.getPipelines()).toHaveLength(2)
    })
  })

  // ── Token Normalization ──

  describe('normalizeTokens', () => {
    it('returns token info for each word', () => {
      const tokens = engine.normalizeTokens('Hello World')
      expect(tokens).toHaveLength(2)
      expect(tokens[0].original).toBe('Hello')
      expect(tokens[0].normalized).toBe('hello')
    })

    it('marks case-folded tokens', () => {
      const tokens = engine.normalizeTokens('HELLO world')
      expect(tokens[0].wasFolded).toBe(true)
      expect(tokens[1].wasFolded).toBe(false)
    })

    it('identifies stop words', () => {
      const tokens = engine.normalizeTokens('the cat is on the mat')
      const stopTokens = tokens.filter(t => t.isStopWord)
      expect(stopTokens.length).toBeGreaterThan(0)
      expect(stopTokens.some(t => t.normalized === 'the')).toBe(true)
    })

    it('computes stem for each token', () => {
      const tokens = engine.normalizeTokens('running dogs')
      expect(tokens[0].stem).toBeDefined()
      expect(tokens[0].stem.length).toBeLessThanOrEqual(tokens[0].normalized.length)
    })

    it('strips accents from tokens when configured', () => {
      const e = new NormalizationEngine({ stripAccents: true })
      const tokens = e.normalizeTokens('café résumé')
      expect(tokens[0].normalized).toBe('cafe')
      expect(tokens[0].wasStripped).toBe(true)
    })

    it('preserves case of tokens in preserveCase list', () => {
      const e = new NormalizationEngine({ preserveCase: ['NASA'] })
      const tokens = e.normalizeTokens('NASA launched')
      expect(tokens[0].normalized).toBe('NASA')
      expect(tokens[0].wasFolded).toBe(false)
    })

    it('increments totalTokensProcessed stat', () => {
      engine.normalizeTokens('one two three')
      expect(engine.getStats().totalTokensProcessed).toBe(3)
    })
  })

  // ── Synonym Handling ──

  describe('addSynonyms / resolveSynonyms', () => {
    it('resolves a synonym to its canonical form', () => {
      engine.addSynonyms('happy', ['glad', 'joyful'])
      const result = engine.resolveSynonyms('I am glad')
      expect(result.normalized).toContain('happy')
    })

    it('does not modify words that are not synonyms', () => {
      engine.addSynonyms('happy', ['glad'])
      const result = engine.resolveSynonyms('I am sad')
      expect(result.normalized).toContain('sad')
    })

    it('merges synonyms into existing mapping', () => {
      engine.addSynonyms('happy', ['glad'])
      engine.addSynonyms('happy', ['joyful', 'cheerful'])
      const maps = engine.getSynonyms()
      const happyMap = maps.find(m => m.canonical === 'happy')
      expect(happyMap?.synonyms).toContain('glad')
      expect(happyMap?.synonyms).toContain('joyful')
      expect(happyMap?.synonyms).toContain('cheerful')
    })

    it('supports bidirectional synonym mapping', () => {
      engine.addSynonyms('happy', ['glad'], 'general', true)
      const maps = engine.getSynonyms()
      // Both 'happy' and 'glad' should have entries
      expect(maps.some(m => m.canonical === 'happy')).toBe(true)
      expect(maps.some(m => m.canonical === 'glad')).toBe(true)
    })

    it('removes a synonym mapping', () => {
      engine.addSynonyms('fast', ['quick', 'rapid'])
      expect(engine.removeSynonyms('fast')).toBe(true)
      // After removal, 'quick' should not resolve
      const result = engine.resolveSynonyms('quick')
      expect(result.normalized).toBe('quick')
    })

    it('returns false when removing non-existent synonym', () => {
      expect(engine.removeSynonyms('nonexistent')).toBe(false)
    })

    it('resolves synonyms during normalize when enabled', () => {
      engine.addSynonyms('happy', ['glad'])
      const result = engine.normalize('I am glad')
      expect(result.synonymsResolved).toBeGreaterThan(0)
    })
  })

  // ── Abbreviation Expansion ──

  describe('addAbbreviation / expandAbbreviations', () => {
    it('expands a custom abbreviation', () => {
      engine.addAbbreviation('asap', 'as soon as possible')
      const result = engine.expandAbbreviations('reply asap')
      expect(result.normalized).toContain('as soon as possible')
    })

    it('expands built-in abbreviations', () => {
      const result = engine.expandAbbreviations("i can't go")
      expect(result.normalized).toContain('cannot')
    })

    it('removes a custom abbreviation', () => {
      engine.addAbbreviation('brb', 'be right back')
      expect(engine.removeAbbreviation('brb')).toBe(true)
      const result = engine.expandAbbreviations('brb')
      expect(result.normalized).toBe('brb')
    })

    it('lists all abbreviations', () => {
      const abbrs = engine.getAbbreviations()
      expect(abbrs.length).toBeGreaterThan(0)
    })

    it('custom abbreviation overrides built-in', () => {
      engine.addAbbreviation('config', 'my custom config meaning')
      const result = engine.expandAbbreviations('check config')
      expect(result.normalized).toContain('my custom config meaning')
    })
  })

  // ── Text Profiling ──

  describe('profileText', () => {
    it('returns character and word counts', () => {
      const profile = engine.profileText('Hello World')
      expect(profile.characterCount).toBe(11)
      expect(profile.wordCount).toBe(2)
    })

    it('counts sentences', () => {
      const profile = engine.profileText('Hello. How are you? Fine!')
      expect(profile.sentenceCount).toBe(3)
    })

    it('calculates vocabulary richness', () => {
      const profile = engine.profileText('the the the cat')
      expect(profile.vocabularyRichness).toBeLessThan(1)
      expect(profile.vocabularyRichness).toBeGreaterThan(0)
    })

    it('detects dominant case as lower', () => {
      const profile = engine.profileText('all lowercase text here')
      expect(profile.dominantCase).toBe('lower')
    })

    it('detects dominant case as upper', () => {
      const profile = engine.profileText('ALL UPPERCASE TEXT HERE')
      expect(profile.dominantCase).toBe('upper')
    })

    it('detects URLs in text', () => {
      const profile = engine.profileText('Visit https://example.com today')
      expect(profile.containsUrls).toBe(true)
    })

    it('detects emails in text', () => {
      const profile = engine.profileText('Contact user@example.com for help')
      expect(profile.containsEmails).toBe(true)
    })

    it('detects code patterns', () => {
      const profile = engine.profileText('function foo() { return x; }')
      expect(profile.containsCode).toBe(true)
    })

    it('detects English language hints', () => {
      const profile = engine.profileText('The cat is on the mat with the dog')
      expect(profile.languageHints).toContain('en')
    })

    it('returns complexity score between 0 and 1', () => {
      const profile = engine.profileText('A simple sentence. Another one.')
      expect(profile.complexityScore).toBeGreaterThanOrEqual(0)
      expect(profile.complexityScore).toBeLessThanOrEqual(1)
    })

    it('handles empty string gracefully', () => {
      const profile = engine.profileText('')
      expect(profile.characterCount).toBe(0)
      expect(profile.wordCount).toBe(0)
    })
  })

  // ── Fuzzy Matching ──

  describe('fuzzyMatch', () => {
    it('finds exact match with distance 0', () => {
      const results = engine.fuzzyMatch('hello', ['hello', 'world'])
      expect(results[0].distance).toBe(0)
      expect(results[0].candidate).toBe('hello')
      expect(results[0].similarity).toBe(1)
    })

    it('sorts results by ascending edit distance', () => {
      const results = engine.fuzzyMatch('cat', ['car', 'bat', 'dog', 'cats'])
      expect(results[0].distance).toBeLessThanOrEqual(results[1].distance)
    })

    it('filters by maxDistance', () => {
      const results = engine.fuzzyMatch('cat', ['car', 'dog', 'elephant'], 1)
      for (const r of results) {
        expect(r.distance).toBeLessThanOrEqual(1)
      }
      expect(results.some(r => r.candidate === 'car')).toBe(true)
      expect(results.some(r => r.candidate === 'elephant')).toBe(false)
    })

    it('computes similarity as 1 - distance/maxLen', () => {
      const results = engine.fuzzyMatch('abc', ['abd'])
      expect(results[0].distance).toBe(1)
      expect(results[0].similarity).toBeCloseTo(1 - 1 / 3, 2)
    })

    it('is case-insensitive by default', () => {
      const results = engine.fuzzyMatch('Hello', ['HELLO', 'world'])
      expect(results[0].distance).toBe(0)
    })

    it('respects caseFolding=false config', () => {
      const e = new NormalizationEngine({ caseFolding: false })
      const results = e.fuzzyMatch('Hello', ['HELLO'])
      // Without case folding, 'Hello' vs 'HELLO' has distance > 0
      expect(results[0].distance).toBeGreaterThan(0)
    })

    it('returns empty array when no candidates within maxDistance', () => {
      const results = engine.fuzzyMatch('abc', ['xyz', 'qrs'], 1)
      expect(results).toHaveLength(0)
    })
  })

  // ── Batch Processing ──

  describe('normalizeBatch', () => {
    it('normalizes multiple texts', () => {
      const results = engine.normalizeBatch(['HELLO', 'WORLD'])
      expect(results).toHaveLength(2)
      expect(results[0].text.normalized).toBe('hello')
      expect(results[1].text.normalized).toBe('world')
    })

    it('uses a pipeline when specified', () => {
      const pipe = engine.createPipeline('batch-pipe', [
        { type: 'caseFold', enabled: true, params: {} },
      ])
      const results = engine.normalizeBatch(['HELLO', 'WORLD'], pipe.id)
      expect(results[0].text.normalized).toBe('hello')
      expect(results[0].pipelineId).toBe(pipe.id)
    })
  })

  // ── Code Normalization ──

  describe('normalizeCode', () => {
    it('normalizes line endings to unix', () => {
      const result = engine.normalizeCode('line1\r\nline2\rline3')
      expect(result.normalized).toBe('line1\nline2\nline3')
    })

    it('collapses excessive blank lines', () => {
      const result = engine.normalizeCode('a\n\n\n\nb')
      expect(result.normalized).toBe('a\n\nb')
    })

    it('strips trailing whitespace', () => {
      const result = engine.normalizeCode('hello   \nworld  ')
      expect(result.normalized).toBe('hello\nworld')
    })
  })

  // ── Cache ──

  describe('cache', () => {
    it('returns undefined for uncached input', () => {
      expect(engine.getCached('never-seen')).toBeUndefined()
    })

    it('returns cached output after normalization', () => {
      engine.normalize('test input')
      expect(engine.getCached('test input')).toBeDefined()
    })

    it('clears cache', () => {
      engine.normalize('abc')
      engine.clearCache()
      expect(engine.getCacheSize()).toBe(0)
    })

    it('reports cache size', () => {
      engine.normalize('a')
      engine.normalize('b')
      expect(engine.getCacheSize()).toBe(2)
    })
  })

  // ── Serialization ──

  describe('serialize / deserialize', () => {
    it('round-trips engine state', () => {
      engine.addRule('my-rule', 'foo', 'bar')
      engine.addSynonyms('happy', ['glad'])
      engine.addAbbreviation('brb', 'be right back')
      engine.createPipeline('my-pipe', [
        { type: 'caseFold', enabled: true, params: {} },
      ])
      engine.normalize('some text foo')

      const json = engine.serialize()
      const restored = NormalizationEngine.deserialize(json)

      expect(restored.getRules()).toHaveLength(1)
      expect(restored.getSynonyms().some(s => s.canonical === 'happy')).toBe(true)
      expect(restored.getPipelines()).toHaveLength(1)
      expect(restored.getStats().totalNormalizations).toBe(1)
    })

    it('preserves rule usage stats after deserialization', () => {
      const rule = engine.addRule('used-rule', 'x', 'y')
      engine.normalize('x text')

      const restored = NormalizationEngine.deserialize(engine.serialize())
      const stats = restored.getStats()
      expect(stats.mostUsedRule).toBe(rule.id)
    })

    it('preserves abbreviations after deserialization', () => {
      engine.addAbbreviation('tbd', 'to be determined')
      const restored = NormalizationEngine.deserialize(engine.serialize())
      const abbrs = new Map(restored.getAbbreviations())
      expect(abbrs.get('tbd')).toBe('to be determined')
    })

    it('preserves config after deserialization', () => {
      const e = new NormalizationEngine({ caseFolding: false, stripAccents: true })
      const restored = NormalizationEngine.deserialize(e.serialize())
      const result = restored.normalize('HELLO')
      expect(result.text.normalized).toBe('HELLO')
    })
  })

  // ── Statistics ──

  describe('getStats', () => {
    it('starts with zero stats', () => {
      const stats = engine.getStats()
      expect(stats.totalNormalizations).toBe(0)
      expect(stats.totalTokensProcessed).toBe(0)
      expect(stats.mostUsedRule).toBeNull()
      expect(stats.mostUsedPipeline).toBeNull()
    })

    it('increments totalNormalizations on each normalize call', () => {
      engine.normalize('a')
      engine.normalize('b')
      expect(engine.getStats().totalNormalizations).toBe(2)
    })

    it('tracks most used rule', () => {
      const rule = engine.addRule('popular', 'test', 'pass')
      engine.normalize('test 1')
      engine.normalize('test 2')
      expect(engine.getStats().mostUsedRule).toBe(rule.id)
    })

    it('tracks most used pipeline', () => {
      const pipe = engine.createPipeline('popular-pipe', [
        { type: 'trim', enabled: true, params: {} },
      ])
      engine.executePipeline(pipe.id, ' a ')
      engine.executePipeline(pipe.id, ' b ')
      expect(engine.getStats().mostUsedPipeline).toBe(pipe.id)
    })

    it('computes average processing time', () => {
      engine.normalize('hello world')
      const stats = engine.getStats()
      expect(stats.avgProcessingTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('counts total rules and pipelines', () => {
      engine.addRule('r1', 'a', 'b')
      engine.createPipeline('p1', [])
      const stats = engine.getStats()
      expect(stats.totalRules).toBe(1)
      expect(stats.totalPipelines).toBe(1)
    })

    it('tracks synonym and abbreviation totals', () => {
      const stats = engine.getStats()
      expect(stats.totalAbbreviations).toBeGreaterThan(0)
      engine.addSynonyms('fast', ['quick'])
      expect(engine.getStats().totalSynonymMaps).toBeGreaterThan(0)
    })
  })
})
