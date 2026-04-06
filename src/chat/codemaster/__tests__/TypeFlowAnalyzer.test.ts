import { describe, it, expect, beforeEach } from 'vitest'
import { TypeFlowAnalyzer } from '../TypeFlowAnalyzer'

// ── Constructor & setLanguage ────────────────────────────────────────────────

describe('TypeFlowAnalyzer constructor', () => {
  it('creates an instance with default language (typescript)', () => {
    const analyzer = new TypeFlowAnalyzer()
    expect(analyzer).toBeInstanceOf(TypeFlowAnalyzer)
    // Default language is typescript, verified indirectly by TS-specific detection
    const result = analyzer.analyze('const x: any = 1')
    expect(result.issues.some(i => i.type === 'any-type-usage')).toBe(true)
  })

  it('accepts an explicit language argument', () => {
    const analyzer = new TypeFlowAnalyzer('python')
    expect(analyzer).toBeInstanceOf(TypeFlowAnalyzer)
  })
})

describe('TypeFlowAnalyzer.setLanguage', () => {
  it('switches language so Python detectors run instead of TypeScript ones', () => {
    const analyzer = new TypeFlowAnalyzer('typescript')
    analyzer.setLanguage('python')
    const result = analyzer.analyze('def greet(name):\n  return name')
    expect(result.issues.some(i => i.title.includes('type hints'))).toBe(true)
  })
})

// ── Empty / null input handling ──────────────────────────────────────────────

describe('Empty and null input handling', () => {
  let analyzer: TypeFlowAnalyzer

  beforeEach(() => {
    analyzer = new TypeFlowAnalyzer()
  })

  it('returns a perfect score for an empty string', () => {
    const result = analyzer.analyze('')
    expect(result.safetyScore).toBe(100)
    expect(result.issues).toHaveLength(0)
    expect(result.summary).toBe('No code to analyze.')
  })

  it('returns a perfect score for whitespace-only input', () => {
    const result = analyzer.analyze('   \n\n  ')
    expect(result.safetyScore).toBe(100)
    expect(result.issues).toHaveLength(0)
  })

  it('returns empty arrays for nullableVars and assertions', () => {
    const result = analyzer.analyze('')
    expect(result.nullableVars).toEqual([])
    expect(result.assertions).toEqual([])
  })
})

// ── `any` type usage detection ───────────────────────────────────────────────

describe('any type usage detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects explicit : any annotation', () => {
    const code = 'const value: any = getData()'
    const result = analyzer.analyze(code)
    const anyIssues = result.issues.filter(i => i.type === 'any-type-usage')
    expect(anyIssues.length).toBeGreaterThanOrEqual(1)
    expect(anyIssues[0].severity).toBe('medium')
    expect(anyIssues[0].line).toBe(1)
  })

  it('ignores any in comments', () => {
    const code = '// const value: any = bad'
    const result = analyzer.analyze(code)
    const anyIssues = result.issues.filter(i => i.type === 'any-type-usage')
    expect(anyIssues).toHaveLength(0)
  })
})

// ── Unsafe `as any` assertion detection ──────────────────────────────────────

describe('unsafe as-any assertion detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects `as any` and marks it unsafe', () => {
    const code = 'const x = value as any'
    const result = analyzer.analyze(code)
    const unsafeAssertions = result.issues.filter(i => i.type === 'unsafe-assertion')
    expect(unsafeAssertions.length).toBeGreaterThanOrEqual(1)
    expect(unsafeAssertions[0].severity).toBe('high')

    const tracked = result.assertions.find(a => a.expression === 'as any')
    expect(tracked).toBeDefined()
    expect(tracked!.safe).toBe(false)
  })
})

// ── Double assertion detection ───────────────────────────────────────────────

describe('double assertion (as unknown as T) detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects as unknown as T and flags it as unsafe cast', () => {
    const code = 'const x = value as unknown as SpecificType'
    const result = analyzer.analyze(code)
    const castIssues = result.issues.filter(i => i.type === 'unsafe-cast')
    expect(castIssues.length).toBeGreaterThanOrEqual(1)
    expect(castIssues[0].severity).toBe('medium')
    expect(castIssues[0].title).toContain('Double type assertion')

    const tracked = result.assertions.find(a => a.expression === 'as unknown as ...')
    expect(tracked).toBeDefined()
    expect(tracked!.safe).toBe(false)
  })
})

// ── Non-null assertion operator (!) ──────────────────────────────────────────

describe('non-null assertion operator detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects the non-null assertion operator on property access', () => {
    const code = 'const val = obj!.property'
    const result = analyzer.analyze(code)
    const bangIssues = result.issues.filter(
      i => i.type === 'unsafe-assertion' && i.title.includes('Non-null assertion'),
    )
    expect(bangIssues.length).toBeGreaterThanOrEqual(1)
    expect(bangIssues[0].severity).toBe('medium')
  })

  it('does not flag !== as non-null assertion', () => {
    const code = 'if (x !== null) { doSomething() }'
    const result = analyzer.analyze(code)
    const bangIssues = result.issues.filter(
      i => i.type === 'unsafe-assertion' && i.title.includes('Non-null assertion'),
    )
    expect(bangIssues).toHaveLength(0)
  })
})

// ── Nullable variable access without null check ──────────────────────────────

describe('nullable variable access without null check', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects access to a .find() result without a guard', () => {
    const code = [
      'const item = items.find(i => i.id === 1)',
      'console.log(item.name)',
    ].join('\n')
    const result = analyzer.analyze(code)
    const nullableIssues = result.issues.filter(i => i.type === 'nullable-access')
    expect(nullableIssues.length).toBeGreaterThanOrEqual(1)
    expect(nullableIssues[0].title).toContain('item')
  })

  it('detects access to getElementById result without guard', () => {
    const code = [
      'const el = document.getElementById("root")',
      'el.style.display = "none"',
    ].join('\n')
    const result = analyzer.analyze(code)
    const nullableIssues = result.issues.filter(i => i.type === 'nullable-access')
    expect(nullableIssues.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Optional chaining opportunities ──────────────────────────────────────────

describe('optional chaining opportunity detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects manual a && a.b && a.b.c pattern', () => {
    const code = 'if (user && user.address && user.address.city) {}'
    const result = analyzer.analyze(code)
    const chainIssues = result.issues.filter(i => i.type === 'optional-chaining-opportunity')
    expect(chainIssues.length).toBeGreaterThanOrEqual(1)
    expect(chainIssues[0].severity).toBe('info')
  })

  it('detects x !== null && x !== undefined pattern', () => {
    const code = 'if (val !== null && val !== undefined) {}'
    const result = analyzer.analyze(code)
    const chainIssues = result.issues.filter(i => i.type === 'optional-chaining-opportunity')
    expect(chainIssues.length).toBeGreaterThanOrEqual(1)
    expect(chainIssues[0].title).toContain('Simplify')
  })
})

// ── Implicit any detection ───────────────────────────────────────────────────

describe('implicit any detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects empty array without type annotation', () => {
    const code = 'const items = []'
    const result = analyzer.analyze(code)
    const implicitAny = result.issues.filter(
      i => i.type === 'implicit-any' && i.title.includes('Empty array'),
    )
    expect(implicitAny.length).toBeGreaterThanOrEqual(1)
    expect(implicitAny[0].severity).toBe('low')
  })

  it('does not flag typed empty array', () => {
    const code = 'const items: string[] = []'
    const result = analyzer.analyze(code)
    const implicitAny = result.issues.filter(
      i => i.type === 'implicit-any' && i.title.includes('Empty array'),
    )
    expect(implicitAny).toHaveLength(0)
  })

  it('detects JSON.parse without type assertion', () => {
    const code = 'const data = JSON.parse(str)'
    const result = analyzer.analyze(code)
    const jsonIssues = result.issues.filter(
      i => i.type === 'implicit-any' && i.title.includes('JSON.parse'),
    )
    expect(jsonIssues.length).toBeGreaterThanOrEqual(1)
    expect(jsonIssues[0].severity).toBe('medium')
  })
})

// ── Non-exhaustive switch detection ──────────────────────────────────────────

describe('non-exhaustive switch detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects switch without default case', () => {
    const code = [
      'switch (status) {',
      '  case "active":',
      '    break',
      '  case "inactive":',
      '    break',
      '}',
    ].join('\n')
    const result = analyzer.analyze(code)
    const switchIssues = result.issues.filter(i => i.type === 'non-exhaustive-switch')
    expect(switchIssues.length).toBeGreaterThanOrEqual(1)
    expect(switchIssues[0].severity).toBe('medium')
    expect(switchIssues[0].description).toContain('2 cases')
  })

  it('does not flag switch with default case', () => {
    const code = [
      'switch (status) {',
      '  case "active":',
      '    break',
      '  default:',
      '    break',
      '}',
    ].join('\n')
    const result = analyzer.analyze(code)
    const switchIssues = result.issues.filter(i => i.type === 'non-exhaustive-switch')
    expect(switchIssues).toHaveLength(0)
  })
})

// ── Unsafe index access detection ────────────────────────────────────────────

describe('unsafe index access detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects array access with a variable index without bounds check', () => {
    const code = 'const value = items[someVar]'
    const result = analyzer.analyze(code)
    const indexIssues = result.issues.filter(i => i.type === 'unsafe-index-access')
    expect(indexIssues.length).toBeGreaterThanOrEqual(1)
    expect(indexIssues[0].severity).toBe('low')
  })

  it('does not flag literal index access', () => {
    const code = 'const first = items[0]'
    const result = analyzer.analyze(code)
    const indexIssues = result.issues.filter(i => i.type === 'unsafe-index-access')
    expect(indexIssues).toHaveLength(0)
  })
})

// ── Type widening with `let` detection ───────────────────────────────────────

describe('type widening with let detection', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('detects let with a status-like string literal', () => {
    const code = 'let status = "pending"'
    const result = analyzer.analyze(code)
    const wideningIssues = result.issues.filter(i => i.type === 'type-widening')
    expect(wideningIssues.length).toBeGreaterThanOrEqual(1)
    expect(wideningIssues[0].severity).toBe('info')
    expect(wideningIssues[0].title).toContain('type widening')
  })

  it('does not flag let with a non-discriminator string', () => {
    const code = 'let name = "hello world"'
    const result = analyzer.analyze(code)
    const wideningIssues = result.issues.filter(i => i.type === 'type-widening')
    expect(wideningIssues).toHaveLength(0)
  })
})

// ── Python type issues ───────────────────────────────────────────────────────

describe('Python type issue detection', () => {
  const analyzer = new TypeFlowAnalyzer('python')

  it('detects function parameters without type hints', () => {
    const code = 'def greet(name):\n  return name'
    const result = analyzer.analyze(code)
    const hintIssues = result.issues.filter(
      i => i.type === 'implicit-any' && i.title.includes('type hints'),
    )
    expect(hintIssues.length).toBeGreaterThanOrEqual(1)
    expect(hintIssues[0].severity).toBe('low')
  })

  it('detects missing return type hint', () => {
    const code = 'def greet(name: str):'
    const result = analyzer.analyze(code)
    const returnIssues = result.issues.filter(i => i.title.includes('return type'))
    expect(returnIssues.length).toBeGreaterThanOrEqual(1)
    expect(returnIssues[0].severity).toBe('info')
  })

  it('does not run TypeScript detectors on Python code', () => {
    const code = 'const x: any = 1'
    const result = analyzer.analyze(code)
    const anyIssues = result.issues.filter(i => i.type === 'any-type-usage')
    expect(anyIssues).toHaveLength(0)
  })
})

// ── Safe assertions tracked properly ─────────────────────────────────────────

describe('safe assertion tracking', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('tracks safe as ConcreteType assertion', () => {
    const code = 'const el = event.target as HTMLInputElement'
    const result = analyzer.analyze(code)
    const safeAssertion = result.assertions.find(a => a.safe === true)
    expect(safeAssertion).toBeDefined()
    expect(safeAssertion!.expression).toContain('HTMLInputElement')
  })

  it('does not mark as-any as safe', () => {
    const code = 'const x = value as any'
    const result = analyzer.analyze(code)
    const unsafeAssertions = result.assertions.filter(a => a.safe === false)
    expect(unsafeAssertions.length).toBeGreaterThanOrEqual(1)
    expect(result.assertions.filter(a => a.safe === true)).toHaveLength(0)
  })
})

// ── Nullable variable tracking ───────────────────────────────────────────────

describe('nullable variable tracking (guarded vs unguarded)', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('populates unsafeAccessLines for unguarded access', () => {
    const code = [
      'const item = items.find(i => i.id === 1)',
      'console.log(item.name)',
    ].join('\n')
    const result = analyzer.analyze(code)
    const entry = result.nullableVars.find(v => v.name === 'item')
    expect(entry).toBeDefined()
    expect(entry!.unsafeAccessLines.length).toBeGreaterThanOrEqual(1)
  })

  it('populates guardedLines when access is preceded by a null check', () => {
    const code = [
      'const item = items.find(i => i.id === 1)',
      'if (item) {',
      '  console.log(item.name)',
      '}',
    ].join('\n')
    const result = analyzer.analyze(code)
    const entry = result.nullableVars.find(v => v.name === 'item')
    expect(entry).toBeDefined()
    expect(entry!.guardedLines.length).toBeGreaterThanOrEqual(1)
    expect(entry!.unsafeAccessLines).toHaveLength(0)
  })
})

// ── Safety score calculation ─────────────────────────────────────────────────

describe('safety score calculation', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('returns 100 for clean code with no issues', () => {
    const code = 'const x: number = 42'
    const result = analyzer.analyze(code)
    expect(result.safetyScore).toBe(100)
  })

  it('reduces score for high-severity issues', () => {
    const code = 'const x = val as any'
    const result = analyzer.analyze(code)
    expect(result.safetyScore).toBeLessThan(100)
  })

  it('never goes below 0', () => {
    const lines: string[] = []
    for (let i = 0; i < 50; i++) {
      lines.push(`const x${i} = val${i} as any`)
    }
    const result = analyzer.analyze(lines.join('\n'))
    expect(result.safetyScore).toBeGreaterThanOrEqual(0)
  })
})

// ── Summary generation ───────────────────────────────────────────────────────

describe('summary generation', () => {
  const analyzer = new TypeFlowAnalyzer()

  it('returns no-issues summary for clean code', () => {
    const code = 'const x: number = 42'
    const result = analyzer.analyze(code)
    expect(result.summary).toContain('No type safety issues detected')
    expect(result.summary).toContain('100/100')
  })

  it('includes issue count and severity breakdown', () => {
    const code = [
      'const a = val as any',
      'const b: any = 1',
    ].join('\n')
    const result = analyzer.analyze(code)
    expect(result.summary).toMatch(/Found \d+ type safety issue/)
    expect(result.summary).toMatch(/high-severity/)
    expect(result.summary).toMatch(/score: \d+\/100/i)
  })

  it('counts high and medium severity correctly', () => {
    const code = [
      'const a = val as any',
      'const b = val as unknown as Foo',
    ].join('\n')
    const result = analyzer.analyze(code)
    const highCount = result.issues.filter(
      i => i.severity === 'critical' || i.severity === 'high',
    ).length
    const mediumCount = result.issues.filter(i => i.severity === 'medium').length
    expect(result.summary).toContain(`${highCount} high-severity`)
    expect(result.summary).toContain(`${mediumCount} medium`)
  })
})
