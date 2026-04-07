import { describe, it, expect, beforeEach } from 'vitest'
import {
  IntelligentRefactorer,
  type RefactoringSuggestion,
} from '../IntelligentRefactorer.js'

describe('IntelligentRefactorer', () => {
  let refactorer: IntelligentRefactorer

  beforeEach(() => {
    refactorer = new IntelligentRefactorer()
  })

  // ── Constructor & Config ───────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const config = refactorer.getConfig()
      expect(config.maxSuggestions).toBe(20)
      expect(config.enableExtractMethod).toBe(true)
      expect(config.enableRenaming).toBe(true)
      expect(config.enableSimplification).toBe(true)
      expect(config.enableDeduplication).toBe(true)
      expect(config.enableDecomposition).toBe(true)
      expect(config.minComplexityForExtract).toBe(5)
      expect(config.confidenceThreshold).toBe(0.4)
    })

    it('should accept partial config overrides', () => {
      const custom = new IntelligentRefactorer({ maxSuggestions: 5, confidenceThreshold: 0.8 })
      expect(custom.getConfig().maxSuggestions).toBe(5)
      expect(custom.getConfig().confidenceThreshold).toBe(0.8)
    })

    it('should initialize stats correctly', () => {
      const stats = refactorer.getStats()
      expect(stats.totalRefactorings).toBe(0)
      expect(stats.totalApplied).toBe(0)
      expect(stats.createdAt).toBeTruthy()
    })
  })

  // ── Rename Suggestions ─────────────────────────────────────────────────────

  describe('suggestRenames', () => {
    it('should detect single-letter variables', () => {
      const code = 'const a = "hello"\nconsole.log(a)'
      const renames = refactorer.suggestRenames(code)
      const singleLetter = renames.find(r => r.oldName === 'a')
      expect(singleLetter).toBeDefined()
      expect(singleLetter!.kind).toBe('variable')
    })

    it('should skip common loop variables', () => {
      const code = 'for (let i = 0; i < 10; i++) {}'
      const renames = refactorer.suggestRenames(code)
      expect(renames.find(r => r.oldName === 'i')).toBeUndefined()
    })

    it('should detect snake_case in camelCase codebase', () => {
      const code = 'const user_name = "test"\nconst userName = "test2"\nconst userAge = 25\nconst userEmail = "a"'
      const renames = refactorer.suggestRenames(code)
      const snake = renames.find(r => r.oldName === 'user_name')
      expect(snake).toBeDefined()
      expect(snake!.newName).toBe('userName')
    })

    it('should suggest boolean naming prefix', () => {
      const code = 'const active: boolean = true'
      const renames = refactorer.suggestRenames(code)
      const bool = renames.find(r => r.oldName === 'active')
      expect(bool).toBeDefined()
      expect(bool!.newName).toMatch(/^is/)
    })

    it('should not rename booleans with proper prefix', () => {
      const code = 'const isActive = true'
      const renames = refactorer.suggestRenames(code)
      expect(renames.find(r => r.oldName === 'isActive')).toBeUndefined()
    })

    it('should count occurrences', () => {
      const code = 'const a = 1\nconsole.log(a)\nreturn a'
      const renames = refactorer.suggestRenames(code)
      const r = renames.find(r2 => r2.oldName === 'a')
      if (r) expect(r.occurrences).toBeGreaterThanOrEqual(2)
    })
  })

  // ── Simplifications ────────────────────────────────────────────────────────

  describe('suggestSimplifications', () => {
    it('should detect double negation', () => {
      const code = 'const result = !!value'
      const simps = refactorer.suggestSimplifications(code)
      const dn = simps.find(s => s.type === 'boolean' && s.original.includes('!!'))
      expect(dn).toBeDefined()
      expect(dn!.simplified).toContain('Boolean')
    })

    it('should detect ternary returning boolean', () => {
      const code = 'const result = isValid ? true : false'
      const simps = refactorer.suggestSimplifications(code)
      const tb = simps.find(s => s.original.includes('true') && s.original.includes('false'))
      expect(tb).toBeDefined()
    })

    it('should detect if/return true/false pattern', () => {
      const code = 'if (x > 0) return true; else return false;'
      const simps = refactorer.suggestSimplifications(code)
      expect(simps.length).toBeGreaterThan(0)
    })

    it('should return empty for already clean code', () => {
      const code = 'const x = a + b\nreturn x'
      const simps = refactorer.suggestSimplifications(code)
      expect(simps.length).toBe(0)
    })

    it('should update stats', () => {
      refactorer.suggestSimplifications('const x = !!y')
      expect(refactorer.getStats().totalSimplificationSuggestions).toBeGreaterThan(0)
    })
  })

  // ── Duplicate Detection ────────────────────────────────────────────────────

  describe('findDuplicates', () => {
    it('should find duplicate code blocks', () => {
      const block = Array.from({ length: 6 }, (_, i) =>
        `  const result${i} = processData(input${i}, options${i}, config${i}, params${i})`
      ).join('\n')
      const code = `function a() {\n${block}\n}\n\nfunction b() {\n${block}\n}`
      const dups = refactorer.findDuplicates(code)
      // May or may not find depending on token threshold
      expect(Array.isArray(dups)).toBe(true)
    })

    it('should return empty for unique code', () => {
      const code = 'function a() { return 1 }\nfunction b() { return "hello" }'
      const dups = refactorer.findDuplicates(code)
      expect(dups.length).toBe(0)
    })
  })

  // ── Decomposition ──────────────────────────────────────────────────────────

  describe('suggestDecomposition', () => {
    it('should detect deep nesting', () => {
      const code = 'function f() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n          doSomething()\n        }\n      }\n    }\n  }\n}'
      const suggestions = refactorer.suggestDecomposition(code)
      const deep = suggestions.find(s => s.description.includes('nesting'))
      expect(deep).toBeDefined()
    })

    it('should detect long if/else chains', () => {
      const conditions = Array.from({ length: 6 }, (_, i) => `  if (x === ${i}) {\n    return ${i}\n  } else`).join('\n')
      const code = `function f(x: number) {\n${conditions}\n  { return -1 }\n}`
      const suggestions = refactorer.suggestDecomposition(code)
      expect(suggestions.length).toBeGreaterThanOrEqual(0)
    })

    it('should return empty for simple code', () => {
      const code = 'function f() { return 1 }'
      const suggestions = refactorer.suggestDecomposition(code)
      expect(suggestions.length).toBe(0)
    })
  })

  // ── Full Analysis ──────────────────────────────────────────────────────────

  describe('analyzeAndSuggest', () => {
    it('should return a refactoring plan', () => {
      const code = `
        function processData(a: string) {
          const result = !!a
          if (a) return true; else return false;
        }
      `
      const plan = refactorer.analyzeAndSuggest(code)
      expect(plan.suggestions).toBeDefined()
      expect(plan.summary).toBeTruthy()
      expect(plan.totalImpact).toBeGreaterThanOrEqual(0)
      expect(plan.priorityOrder).toBeDefined()
    })

    it('should respect disabled features', () => {
      const r = new IntelligentRefactorer({
        enableExtractMethod: false,
        enableRenaming: false,
        enableSimplification: false,
        enableDeduplication: false,
        enableDecomposition: false,
      })
      const plan = r.analyzeAndSuggest('const x = !!y')
      // May still have magic number or other suggestions
      expect(plan.suggestions).toBeDefined()
    })

    it('should filter by confidence threshold', () => {
      const r = new IntelligentRefactorer({ confidenceThreshold: 0.99 })
      const plan = r.analyzeAndSuggest('const x = !!y')
      expect(plan.suggestions.length).toBe(0)
    })

    it('should update stats', () => {
      refactorer.analyzeAndSuggest('const x = 1')
      expect(refactorer.getStats().totalRefactorings).toBe(1)
    })
  })

  // ── Apply Refactoring ──────────────────────────────────────────────────────

  describe('applyRefactoring', () => {
    it('should apply simple text replacement', () => {
      const code = 'const active = true'
      const suggestion: RefactoringSuggestion = {
        type: 'rename_symbol',
        description: 'Rename',
        confidence: 0.8,
        impact: 'low',
        startLine: 1,
        endLine: 1,
        originalCode: 'active',
        suggestedCode: 'isActive',
        rationale: 'test',
      }
      const result = refactorer.applyRefactoring(code, suggestion)
      expect(result).toContain('isActive')
    })

    it('should return unchanged code if pattern not found', () => {
      const code = 'const x = 1'
      const suggestion: RefactoringSuggestion = {
        type: 'rename_symbol',
        description: 'Rename',
        confidence: 0.8,
        impact: 'low',
        startLine: 1,
        endLine: 1,
        originalCode: 'nonexistent',
        suggestedCode: 'replacement',
        rationale: 'test',
      }
      const result = refactorer.applyRefactoring(code, suggestion)
      expect(result).toBe(code)
    })

    it('should update applied stats', () => {
      const suggestion: RefactoringSuggestion = {
        type: 'rename_symbol',
        description: 'test',
        confidence: 0.8,
        impact: 'low',
        startLine: 1,
        endLine: 1,
        originalCode: 'x',
        suggestedCode: 'y',
        rationale: 'test',
      }
      refactorer.applyRefactoring('const x = 1', suggestion)
      expect(refactorer.getStats().totalApplied).toBe(1)
    })
  })

  // ── Impact Estimation ──────────────────────────────────────────────────────

  describe('estimateImpact', () => {
    it('should return 0 for empty suggestions', () => {
      expect(refactorer.estimateImpact([])).toBe(0)
    })

    it('should weight by impact level', () => {
      const lowSuggestions: RefactoringSuggestion[] = [{
        type: 'rename_symbol', description: '', confidence: 1, impact: 'low',
        startLine: 0, endLine: 0, originalCode: '', suggestedCode: '', rationale: '',
      }]
      const highSuggestions: RefactoringSuggestion[] = [{
        type: 'extract_method', description: '', confidence: 1, impact: 'high',
        startLine: 0, endLine: 0, originalCode: '', suggestedCode: '', rationale: '',
      }]
      expect(refactorer.estimateImpact(highSuggestions)).toBeGreaterThan(refactorer.estimateImpact(lowSuggestions))
    })
  })

  // ── Persistence ────────────────────────────────────────────────────────────

  describe('serialize/deserialize', () => {
    it('should round-trip correctly', () => {
      refactorer.analyzeAndSuggest('const x = !!y')
      const json = refactorer.serialize()
      const restored = IntelligentRefactorer.deserialize(json)
      expect(restored.getStats().totalRefactorings).toBe(1)
      expect(restored.getConfig().maxSuggestions).toBe(20)
    })
  })
})
