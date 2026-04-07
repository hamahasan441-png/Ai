import { describe, it, expect, beforeEach } from 'vitest'
import { MultiLanguageSupport } from '../MultiLanguageSupport'

// ── Constructor Tests ──

describe('MultiLanguageSupport constructor', () => {
  it('creates an instance', () => {
    const mls = new MultiLanguageSupport()
    expect(mls).toBeInstanceOf(MultiLanguageSupport)
  })

  it('has all 24 languages after construction', () => {
    const mls = new MultiLanguageSupport()
    expect(mls.getSupportedLanguages()).toHaveLength(24)
  })

  it('getLanguageCount returns 24', () => {
    const mls = new MultiLanguageSupport()
    expect(mls.getLanguageCount()).toBe(24)
  })
})

// ── getSupportedLanguages Tests ──

describe('MultiLanguageSupport getSupportedLanguages', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('returns an array of 24 languages', () => {
    expect(mls.getSupportedLanguages()).toHaveLength(24)
  })

  it('includes typescript', () => {
    expect(mls.getSupportedLanguages()).toContain('typescript')
  })

  it('includes python', () => {
    expect(mls.getSupportedLanguages()).toContain('python')
  })

  it('includes rust, go, elixir, haskell', () => {
    const langs = mls.getSupportedLanguages()
    expect(langs).toContain('rust')
    expect(langs).toContain('go')
    expect(langs).toContain('elixir')
    expect(langs).toContain('haskell')
  })

  it('does not include unknown', () => {
    expect(mls.getSupportedLanguages()).not.toContain('unknown')
  })
})

// ── getProfile Tests ──

describe('MultiLanguageSupport getProfile', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('returns a profile for typescript', () => {
    const profile = mls.getProfile('typescript')
    expect(profile).toBeDefined()
    expect(profile!.displayName).toBe('TypeScript')
  })

  it('returns a profile for python with correct fields', () => {
    const profile = mls.getProfile('python')
    expect(profile).toBeDefined()
    expect(profile!.displayName).toBe('Python')
    expect(profile!.packageManager).toBe('pip')
    expect(profile!.namingConvention).toBe('snake_case')
  })

  it('returns a profile for rust with correct paradigms', () => {
    const profile = mls.getProfile('rust')
    expect(profile).toBeDefined()
    expect(profile!.paradigms).toContain('systems')
    expect(profile!.paradigms).toContain('functional')
  })

  it('returns a profile for go with static typing', () => {
    const profile = mls.getProfile('go')
    expect(profile).toBeDefined()
    expect(profile!.typingSystem).toBe('static')
  })

  it('returns a profile for java with correct file extensions', () => {
    const profile = mls.getProfile('java')
    expect(profile).toBeDefined()
    expect(profile!.fileExtensions).toContain('.java')
  })

  it('returns a profile for elixir with dynamic typing', () => {
    const profile = mls.getProfile('elixir')
    expect(profile).toBeDefined()
    expect(profile!.typingSystem).toBe('dynamic')
  })

  it('returns a profile for html with none typing system', () => {
    const profile = mls.getProfile('html')
    expect(profile).toBeDefined()
    expect(profile!.typingSystem).toBe('none')
  })

  it('returns a profile for csharp with PascalCase naming', () => {
    const profile = mls.getProfile('csharp')
    expect(profile).toBeDefined()
    expect(profile!.namingConvention).toBe('PascalCase')
  })

  it('profile has commentStyle with at least a line property', () => {
    const profile = mls.getProfile('python')
    expect(profile!.commentStyle.line).toBe('#')
  })

  it('returns a profile for javascript with dynamic typing', () => {
    const profile = mls.getProfile('javascript')
    expect(profile).toBeDefined()
    expect(profile!.typingSystem).toBe('dynamic')
    expect(profile!.fileExtensions).toContain('.js')
  })

  it('each profile has templates with at least hello-world', () => {
    const langs = mls.getSupportedLanguages()
    for (const lang of langs) {
      const profile = mls.getProfile(lang)
      expect(profile!.templates['hello-world']).toBeDefined()
    }
  })

  it('returns undefined for a non-existent language', () => {
    const profile = mls.getProfile('brainfuck' as any)
    expect(profile).toBeUndefined()
  })
})

// ── write Tests ──

describe('MultiLanguageSupport write', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('generates hello-world for typescript', () => {
    const result = mls.write({ language: 'typescript', template: 'hello-world' })
    expect(result.code).toContain('Hello, World!')
    expect(result.language).toBe('typescript')
    expect(result.fileName).toBe('main.ts')
  })

  it('generates hello-world for python', () => {
    const result = mls.write({ language: 'python', template: 'hello-world' })
    expect(result.code).toContain('Hello, World!')
    expect(result.fileName).toBe('main.py')
  })

  it('generates hello-world for rust', () => {
    const result = mls.write({ language: 'rust', template: 'hello-world' })
    expect(result.code).toContain('println!')
    expect(result.fileName).toBe('main.rs')
  })

  it('generates hello-world for go', () => {
    const result = mls.write({ language: 'go', template: 'hello-world' })
    expect(result.code).toContain('fmt.Println')
    expect(result.fileName).toBe('main.go')
  })

  it('generates hello-world for java', () => {
    const result = mls.write({ language: 'java', template: 'hello-world' })
    expect(result.code).toContain('System.out.println')
    expect(result.fileName).toBe('main.java')
  })

  it('generates hello-world for haskell', () => {
    const result = mls.write({ language: 'haskell', template: 'hello-world' })
    expect(result.code).toContain('putStrLn')
    expect(result.fileName).toBe('main.hs')
  })

  it('generates hello-world for elixir', () => {
    const result = mls.write({ language: 'elixir', template: 'hello-world' })
    expect(result.code).toContain('IO.puts')
    expect(result.fileName).toBe('main.ex')
  })

  it('generates function template with name substitution', () => {
    const result = mls.write({
      language: 'typescript',
      template: 'function',
      name: 'calculateSum',
    })
    expect(result.code).toContain('calculateSum')
    expect(result.fileName).toBe('calculateSum.ts')
  })

  it('generates function template for python with name', () => {
    const result = mls.write({
      language: 'python',
      template: 'function',
      name: 'fetch_data',
      description: 'url: str',
    })
    expect(result.code).toContain('def fetch_data(url: str)')
  })

  it('generates function template for go with name and description', () => {
    const result = mls.write({
      language: 'go',
      template: 'function',
      name: 'FetchData',
      description: 'url string',
    })
    expect(result.code).toContain('func FetchData(url string)')
    expect(result.fileName).toBe('FetchData.go')
  })

  it('uses default name myFunction when name is not provided', () => {
    const result = mls.write({ language: 'typescript', template: 'function' })
    expect(result.code).toContain('myFunction')
  })

  it('returns correct language in result', () => {
    const result = mls.write({ language: 'ruby', template: 'hello-world' })
    expect(result.language).toBe('ruby')
  })

  it('returns correct template in result', () => {
    const result = mls.write({ language: 'kotlin', template: 'function', name: 'greet' })
    expect(result.template).toBe('function')
  })

  it('falls back to hello-world when template is missing', () => {
    const result = mls.write({ language: 'lua', template: 'class' as any })
    expect(result.code).toContain('Hello, World!')
  })

  it('generates hello-world for c with correct include', () => {
    const result = mls.write({ language: 'c', template: 'hello-world' })
    expect(result.code).toContain('#include <stdio.h>')
    expect(result.fileName).toBe('main.c')
  })

  it('generates hello-world for cpp', () => {
    const result = mls.write({ language: 'cpp', template: 'hello-world' })
    expect(result.code).toContain('#include <iostream>')
    expect(result.fileName).toBe('main.cpp')
  })

  it('generates hello-world for kotlin', () => {
    const result = mls.write({ language: 'kotlin', template: 'hello-world' })
    expect(result.code).toContain('println("Hello, World!")')
    expect(result.fileName).toBe('main.kt')
  })

  it('generates function template for rust with name', () => {
    const result = mls.write({
      language: 'rust',
      template: 'function',
      name: 'process',
    })
    expect(result.code).toContain('pub fn process')
    expect(result.fileName).toBe('process.rs')
  })
})

// ── fix Tests ──

describe('MultiLanguageSupport fix', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('applies use-const fix for typescript let declarations', () => {
    const result = mls.fix({
      code: 'let x = 42;',
      language: 'typescript',
    })
    expect(result.fixed).toContain('const x = 42;')
    expect(result.fixesApplied).toContain('use-const')
    expect(result.unchanged).toBe(false)
  })

  it('applies missing-type-annotation fix for typescript functions', () => {
    const result = mls.fix({
      code: 'function greet() {',
      language: 'typescript',
    })
    expect(result.fixed).toContain('): void {')
    expect(result.fixesApplied).toContain('missing-type-annotation')
  })

  it('applies use-strict-equality fix for javascript', () => {
    const result = mls.fix({
      code: 'if (a == b) {}',
      language: 'javascript',
    })
    expect(result.fixed).toContain('===')
    expect(result.fixesApplied).toContain('use-strict-equality')
  })

  it('applies use-const fix for javascript var declarations', () => {
    const result = mls.fix({
      code: 'var x = 10;',
      language: 'javascript',
    })
    expect(result.fixed).toContain('const x = 10;')
    expect(result.fixesApplied).toContain('use-const')
  })

  it('applies remove-bare-except fix for python', () => {
    const result = mls.fix({
      code: 'except:',
      language: 'python',
    })
    expect(result.fixed).toContain('except Exception:')
    expect(result.fixesApplied).toContain('remove-bare-except')
  })

  it('applies use-nullptr fix for cpp', () => {
    const result = mls.fix({
      code: 'if (ptr == NULL) return;',
      language: 'cpp',
    })
    expect(result.fixed).toContain('nullptr')
    expect(result.fixesApplied).toContain('use-nullptr')
  })

  it('returns unchanged true when no fixes apply', () => {
    const result = mls.fix({
      code: 'const x: number = 42;',
      language: 'typescript',
    })
    expect(result.unchanged).toBe(true)
    expect(result.fixesApplied).toHaveLength(0)
  })

  it('preserves original code in result', () => {
    const code = 'let y = 10;'
    const result = mls.fix({ code, language: 'typescript' })
    expect(result.original).toBe(code)
  })

  it('returns the correct language in result', () => {
    const result = mls.fix({ code: 'pass', language: 'python' })
    expect(result.language).toBe('python')
  })

  it('only applies relevant fixes when issues are specified', () => {
    const result = mls.fix({
      code: 'let x = 42;\nfunction greet() {',
      language: 'typescript',
      issues: ['use-const'],
    })
    expect(result.fixesApplied).toContain('use-const')
    expect(result.fixesApplied).not.toContain('missing-type-annotation')
  })

  it('returns unchanged result for unsupported language', () => {
    const result = mls.fix({
      code: 'some code',
      language: 'brainfuck' as any,
    })
    expect(result.unchanged).toBe(true)
    expect(result.fixed).toBe('some code')
  })

  it('applies check-error fix for go underscore error handling', () => {
    const result = mls.fix({
      code: 'result, _ := doSomething()',
      language: 'go',
    })
    expect(result.fixed).toContain('err :=')
    expect(result.fixesApplied).toContain('check-error')
  })

  it('applies use-val fix for kotlin var declarations', () => {
    const result = mls.fix({
      code: 'var name = "hello"',
      language: 'kotlin',
    })
    expect(result.fixed).toContain('val name')
    expect(result.fixesApplied).toContain('use-val')
  })
})

// ── isSupported Tests ──

describe('MultiLanguageSupport isSupported', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('returns true for typescript', () => {
    expect(mls.isSupported('typescript')).toBe(true)
  })

  it('returns true for python', () => {
    expect(mls.isSupported('python')).toBe(true)
  })

  it('returns true for all 24 supported languages', () => {
    const langs = mls.getSupportedLanguages()
    for (const lang of langs) {
      expect(mls.isSupported(lang)).toBe(true)
    }
  })

  it('returns false for unknown', () => {
    expect(mls.isSupported('unknown')).toBe(false)
  })

  it('returns false for a random string', () => {
    expect(mls.isSupported('foobar')).toBe(false)
  })
})

// ── getFileExtension Tests ──

describe('MultiLanguageSupport getFileExtension', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('returns .ts for typescript', () => {
    expect(mls.getFileExtension('typescript')).toBe('.ts')
  })

  it('returns .py for python', () => {
    expect(mls.getFileExtension('python')).toBe('.py')
  })

  it('returns .rs for rust', () => {
    expect(mls.getFileExtension('rust')).toBe('.rs')
  })

  it('returns .go for go', () => {
    expect(mls.getFileExtension('go')).toBe('.go')
  })

  it('returns .ex for elixir', () => {
    expect(mls.getFileExtension('elixir')).toBe('.ex')
  })
})

// ── getCapabilitiesSummary Tests ──

describe('MultiLanguageSupport getCapabilitiesSummary', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('returns a string mentioning 24 languages', () => {
    const summary = mls.getCapabilitiesSummary()
    expect(summary).toContain('24')
  })

  it('contains display names of languages', () => {
    const summary = mls.getCapabilitiesSummary()
    expect(summary).toContain('TypeScript')
    expect(summary).toContain('Python')
    expect(summary).toContain('Rust')
  })

  it('starts with CodeMaster supports', () => {
    const summary = mls.getCapabilitiesSummary()
    expect(summary).toMatch(/^CodeMaster supports/)
  })
})
