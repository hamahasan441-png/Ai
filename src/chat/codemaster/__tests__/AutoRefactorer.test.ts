import { describe, it, expect } from 'vitest'
import { AutoRefactorer } from '../AutoRefactorer.js'
import type { RefactorRequest } from '../AutoRefactorer.js'

function req(overrides: Partial<RefactorRequest>): RefactorRequest {
  return { code: '', kind: 'extract-function', language: 'typescript', ...overrides }
}

describe('AutoRefactorer', () => {
  const r = new AutoRefactorer()

  // ────────────────────────────────────────────────────────────────────────
  // refactor() — dispatch
  // ────────────────────────────────────────────────────────────────────────
  describe('refactor()', () => {
    it('dispatches extract-function', () => {
      const code = 'line1\nline2\nline3'
      const res = r.refactor(req({ code, kind: 'extract-function', startLine: 2, endLine: 2 }))
      expect(res.success).toBe(true)
      expect(res.description).toContain('extractedFunction')
    })

    it('dispatches rename-symbol', () => {
      const res = r.refactor(
        req({ code: 'let foo = 1', kind: 'rename-symbol', oldName: 'foo', newName: 'bar' }),
      )
      expect(res.success).toBe(true)
      expect(res.code).toContain('bar')
    })

    it('returns failure for unsupported kind', () => {
      const res = r.refactor(req({ code: 'x', kind: 'add-async' as any }))
      expect(res.success).toBe(false)
      expect(res.description).toContain('Unsupported refactoring')
      expect(res.warnings[0]).toContain('not yet implemented')
      expect(res.changeCount).toBe(0)
      expect(res.code).toBe('x')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // extractFunction()
  // ────────────────────────────────────────────────────────────────────────
  describe('extractFunction()', () => {
    it('extracts lines into a named function', () => {
      const code = 'const a = 1\nconst b = a + 2\nconsole.log(b)'
      const res = r.extractFunction(req({ code, startLine: 2, endLine: 2, functionName: 'calc' }))
      expect(res.success).toBe(true)
      expect(res.extractedCode).toContain('function calc(')
      expect(res.extractedCode).toContain('const b = a + 2')
      expect(res.code).toContain('calc(')
      expect(res.description).toContain("'calc'")
      expect(res.changeCount).toBe(1)
    })

    it('returns failure for invalid range (startLine > endLine)', () => {
      const res = r.extractFunction(req({ code: 'a\nb', startLine: 3, endLine: 1 }))
      expect(res.success).toBe(false)
      expect(res.description).toBe('Invalid line range')
    })

    it('returns failure when startLine is missing', () => {
      const res = r.extractFunction(req({ code: 'a', endLine: 1 }))
      expect(res.success).toBe(false)
    })

    it('returns failure when endLine is missing', () => {
      const res = r.extractFunction(req({ code: 'a', startLine: 1 }))
      expect(res.success).toBe(false)
    })

    it('returns failure for out-of-bounds range', () => {
      const res = r.extractFunction(req({ code: 'line1\nline2', startLine: 1, endLine: 5 }))
      expect(res.success).toBe(false)
      expect(res.description).toBe('Line range out of bounds')
      expect(res.warnings[0]).toContain('exceeds file length')
    })

    it('returns failure for startLine < 1 (0 is falsy)', () => {
      const res = r.extractFunction(req({ code: 'line1', startLine: 0, endLine: 1 }))
      expect(res.success).toBe(false)
      expect(res.description).toBe('Invalid line range')
    })

    it('warns when extracted function has many parameters', () => {
      // 5+ unique variables triggers the warning
      const code = 'x\nalpha + beta + gamma + delta + epsilon\nx'
      const res = r.extractFunction(req({ code, startLine: 2, endLine: 2 }))
      expect(res.success).toBe(true)
      expect(res.warnings.length).toBeGreaterThan(0)
      expect(res.warnings[0]).toContain('many parameters')
    })

    it('detects return statement and assigns result', () => {
      const code = 'a\nreturn x + y\nb'
      const res = r.extractFunction(req({ code, startLine: 2, endLine: 2, functionName: 'fn' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('const result = fn(')
    })

    it('uses default function name when none given', () => {
      const code = 'a\nb\nc'
      const res = r.extractFunction(req({ code, startLine: 2, endLine: 2 }))
      expect(res.success).toBe(true)
      expect(res.extractedCode).toContain('function extractedFunction(')
    })

    it('generates a diff', () => {
      const code = 'a\nb\nc'
      const res = r.extractFunction(req({ code, startLine: 2, endLine: 2 }))
      expect(res.diff).toContain('---')
      expect(res.diff).toContain('+++')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // extractInterface()
  // ────────────────────────────────────────────────────────────────────────
  describe('extractInterface()', () => {
    it('extracts properties from an object literal', () => {
      const code = 'const obj = {\n  name: "Alice",\n  age: 30,\n}'
      const res = r.extractInterface(
        req({ code, kind: 'extract-interface', startLine: 1, endLine: 4, functionName: 'Person' }),
      )
      expect(res.success).toBe(true)
      expect(res.extractedCode).toContain('interface Person')
      expect(res.extractedCode).toContain('name: string')
      expect(res.extractedCode).toContain('age: number')
      expect(res.description).toContain('2 properties')
    })

    it('returns failure for empty block with no properties', () => {
      const code = 'const obj = {\n}\n'
      const res = r.extractInterface(
        req({ code, kind: 'extract-interface', startLine: 1, endLine: 2 }),
      )
      expect(res.success).toBe(false)
      expect(res.description).toBe('No properties found to extract')
    })

    it('returns failure when startLine/endLine missing', () => {
      const res = r.extractInterface(req({ code: '{}', kind: 'extract-interface' }))
      expect(res.success).toBe(false)
      expect(res.description).toBe('Invalid line range')
    })

    it('infers types from values correctly', () => {
      const code = [
        'const obj = {',
        '  s: "hello",',
        '  n: 42,',
        '  b: true,',
        '  a: [1, 2],',
        '  o: { k: 1 },',
        '  x: null,',
        '  u: undefined,',
        '  w: someVar,',
        '}',
      ].join('\n')
      const res = r.extractInterface(
        req({ code, kind: 'extract-interface', startLine: 1, endLine: 9, functionName: 'T' }),
      )
      expect(res.success).toBe(true)
      const ext = res.extractedCode!
      expect(ext).toContain('s: string')
      expect(ext).toContain('n: number')
      expect(ext).toContain('b: boolean')
      expect(ext).toContain('a: unknown[]')
      expect(ext).toContain('o: Record<string, unknown>')
      expect(ext).toContain('x: null')
      expect(ext).toContain('u: undefined')
      expect(ext).toContain('w: unknown')
    })

    it('uses default interface name when functionName not provided', () => {
      const code = 'const obj = {\n  x: 1,\n}'
      const res = r.extractInterface(
        req({ code, kind: 'extract-interface', startLine: 1, endLine: 3 }),
      )
      expect(res.success).toBe(true)
      expect(res.extractedCode).toContain('interface ExtractedInterface')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // renameSymbol()
  // ────────────────────────────────────────────────────────────────────────
  describe('renameSymbol()', () => {
    it('renames all occurrences of a symbol', () => {
      const code = 'const foo = 1\nconst bar = foo + 2\nconsole.log(foo)'
      const res = r.renameSymbol(
        req({ code, kind: 'rename-symbol', oldName: 'foo', newName: 'baz' }),
      )
      expect(res.success).toBe(true)
      expect(res.code).not.toContain('foo')
      expect(res.code).toContain('baz')
      expect(res.changeCount).toBe(3)
    })

    it('reports correct count of occurrences', () => {
      const code = 'x + x + x + x'
      const res = r.renameSymbol(req({ code, kind: 'rename-symbol', oldName: 'x', newName: 'y' }))
      expect(res.changeCount).toBe(4)
      expect(res.description).toContain('4 occurrences')
    })

    it('returns failure when oldName is missing', () => {
      const res = r.renameSymbol(req({ code: 'a', kind: 'rename-symbol', newName: 'b' }))
      expect(res.success).toBe(false)
      expect(res.description).toContain('required')
    })

    it('returns failure when newName is missing', () => {
      const res = r.renameSymbol(req({ code: 'a', kind: 'rename-symbol', oldName: 'a' }))
      expect(res.success).toBe(false)
    })

    it('returns failure when symbol not found', () => {
      const res = r.renameSymbol(
        req({ code: 'let a = 1', kind: 'rename-symbol', oldName: 'zz', newName: 'yy' }),
      )
      expect(res.success).toBe(false)
      expect(res.description).toContain('not found')
    })

    it('handles same old and new names', () => {
      const res = r.renameSymbol(
        req({ code: 'let a = 1', kind: 'rename-symbol', oldName: 'a', newName: 'a' }),
      )
      expect(res.success).toBe(true)
      expect(res.description).toBe('Names are identical')
      expect(res.changeCount).toBe(0)
    })

    it('uses word boundaries to avoid partial replacements', () => {
      const code = 'let fooBar = foo + aFoo'
      const res = r.renameSymbol(
        req({ code, kind: 'rename-symbol', oldName: 'foo', newName: 'baz' }),
      )
      expect(res.code).toContain('fooBar')
      expect(res.code).toContain('baz +')
      expect(res.code).toContain('aFoo')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // inlineVariable()
  // ────────────────────────────────────────────────────────────────────────
  describe('inlineVariable()', () => {
    it('inlines a simple variable', () => {
      const code = 'const x = 42\nconsole.log(x)'
      const res = r.inlineVariable(req({ code, kind: 'inline-variable', oldName: 'x' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('console.log(42)')
      expect(res.code).not.toMatch(/const x = 42/)
    })

    it('warns when value has side effects (await)', () => {
      const code = 'const val = await fetchData()\nconsole.log(val)'
      const res = r.inlineVariable(req({ code, kind: 'inline-variable', oldName: 'val' }))
      expect(res.success).toBe(true)
      expect(res.warnings.length).toBeGreaterThan(0)
      expect(res.warnings[0]).toContain('side effects')
    })

    it('warns when value has side effects (new)', () => {
      const code = 'const obj = new Map()\nreturn obj'
      const res = r.inlineVariable(req({ code, kind: 'inline-variable', oldName: 'obj' }))
      expect(res.success).toBe(true)
      expect(res.warnings.some(w => w.includes('side effects'))).toBe(true)
    })

    it('returns failure when variable not found', () => {
      const res = r.inlineVariable(
        req({ code: 'let a = 1', kind: 'inline-variable', oldName: 'missing' }),
      )
      expect(res.success).toBe(false)
      expect(res.description).toContain('not found')
    })

    it('returns failure when oldName is missing', () => {
      const res = r.inlineVariable(req({ code: 'x', kind: 'inline-variable' }))
      expect(res.success).toBe(false)
      expect(res.description).toContain('required')
    })

    it('cleans up empty lines after removal', () => {
      const code = 'a\n\nconst x = 5\n\n\nb = x'
      const res = r.inlineVariable(req({ code, kind: 'inline-variable', oldName: 'x' }))
      expect(res.success).toBe(true)
      // Should not have 3+ consecutive blank lines
      expect(res.code).not.toMatch(/\n\s*\n\s*\n\s*\n/)
    })

    it('reports correct changeCount (refs + 1 for decl removal)', () => {
      const code = 'const v = 10\na(v)\nb(v)'
      const res = r.inlineVariable(req({ code, kind: 'inline-variable', oldName: 'v' }))
      expect(res.success).toBe(true)
      // 2 references + 1 for declaration removal
      expect(res.changeCount).toBe(3)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // convertToArrow()
  // ────────────────────────────────────────────────────────────────────────
  describe('convertToArrow()', () => {
    it('converts a single-return function to arrow expression', () => {
      const code = 'function add(a, b) { return a + b }'
      const res = r.convertToArrow(req({ code, kind: 'convert-to-arrow' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('const add = (a, b) => a + b')
      expect(res.changeCount).toBe(1)
    })

    it('converts a multi-statement function to arrow with block', () => {
      const code = 'function greet(name) { console.log(name) }'
      const res = r.convertToArrow(req({ code, kind: 'convert-to-arrow' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('=>')
      expect(res.code).toContain('console.log(name)')
    })

    it('converts multiple functions', () => {
      const code = 'function a() { return 1 }\nfunction b() { return 2 }'
      const res = r.convertToArrow(req({ code, kind: 'convert-to-arrow' }))
      expect(res.success).toBe(true)
      expect(res.changeCount).toBe(2)
    })

    it('returns failure when no functions found', () => {
      const code = 'const x = 1\nconst y = 2'
      const res = r.convertToArrow(req({ code, kind: 'convert-to-arrow' }))
      expect(res.success).toBe(false)
      expect(res.description).toContain('No function declarations found')
    })

    it('generates a diff on conversion', () => {
      const code = 'function f() { return 0 }'
      const res = r.convertToArrow(req({ code, kind: 'convert-to-arrow' }))
      expect(res.diff).toContain('---')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // convertToFunction()
  // ────────────────────────────────────────────────────────────────────────
  describe('convertToFunction()', () => {
    it('converts an arrow function with block body to declaration', () => {
      const code = 'const add = (a, b) => { return a + b }'
      const res = r.convertToFunction(req({ code, kind: 'convert-to-function' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('function add(a, b)')
      expect(res.code).toContain('return a + b')
      expect(res.changeCount).toBe(1)
    })

    it('converts a short arrow expression to function with return', () => {
      const code = 'const double = (x) => x * 2'
      const res = r.convertToFunction(req({ code, kind: 'convert-to-function' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('function double(x)')
      expect(res.code).toContain('return x * 2')
    })

    it('returns failure when no arrows found', () => {
      const code = 'function f() { return 1 }'
      const res = r.convertToFunction(req({ code, kind: 'convert-to-function' }))
      expect(res.success).toBe(false)
      expect(res.description).toContain('No arrow functions found')
    })

    it('converts multiple arrow functions', () => {
      const code = 'const a = (x) => x + 1\nconst b = (y) => y * 2'
      const res = r.convertToFunction(req({ code, kind: 'convert-to-function' }))
      expect(res.success).toBe(true)
      expect(res.changeCount).toBe(2)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // simplifyConditional()
  // ────────────────────────────────────────────────────────────────────────
  describe('simplifyConditional()', () => {
    it('simplifies if/return true/false to return condition', () => {
      const code = 'if (x > 0) return true; else return false;'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('return x > 0')
      expect(res.code).not.toContain('true')
      expect(res.code).not.toContain('false')
    })

    it('simplifies if/return true + return false (no else keyword)', () => {
      const code = 'if (a) return true; return false;'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('return a')
    })

    it('simplifies x === true to x', () => {
      const code = 'if (valid === true) {}'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('if (valid)')
      expect(res.code).not.toContain('=== true')
    })

    it('simplifies x === false to !x', () => {
      const code = 'if (done === false) {}'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('!done')
    })

    it('simplifies x !== null && x !== undefined to x != null', () => {
      const code = 'if (val !== null && val !== undefined) {}'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(true)
      expect(res.code).toContain('val != null')
    })

    it('returns failure when no simplifiable conditionals', () => {
      const code = 'if (x > 0) { doSomething() }'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(false)
      expect(res.description).toContain('No simplifiable conditionals')
    })

    it('counts multiple simplifications', () => {
      const code = 'a === true\nb === false'
      const res = r.simplifyConditional(req({ code, kind: 'simplify-conditional' }))
      expect(res.success).toBe(true)
      expect(res.changeCount).toBe(2)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // extractConstant()
  // ────────────────────────────────────────────────────────────────────────
  describe('extractConstant()', () => {
    it('extracts a magic number into a named constant', () => {
      const code = 'const tax = price * 0.08'
      const res = r.extractConstant(
        req({ code, kind: 'extract-constant', oldName: '0.08', newName: 'TAX_RATE' }),
      )
      expect(res.success).toBe(true)
      expect(res.code).toContain('const TAX_RATE = 0.08')
      expect(res.code).toContain('price * TAX_RATE')
      expect(res.changeCount).toBe(1)
    })

    it('replaces multiple occurrences', () => {
      const code = 'a = 3.14\nb = 3.14\nc = 3.14'
      const res = r.extractConstant(
        req({ code, kind: 'extract-constant', oldName: '3.14', newName: 'PI' }),
      )
      expect(res.success).toBe(true)
      expect(res.changeCount).toBe(3)
    })

    it('returns failure when value not found', () => {
      const res = r.extractConstant(
        req({ code: 'x = 1', kind: 'extract-constant', oldName: '99', newName: 'C' }),
      )
      expect(res.success).toBe(false)
      expect(res.description).toContain('not found')
    })

    it('returns failure when oldName (value) is missing', () => {
      const res = r.extractConstant(req({ code: 'x', kind: 'extract-constant', newName: 'C' }))
      expect(res.success).toBe(false)
    })

    it('returns failure when newName (constantName) is missing', () => {
      const res = r.extractConstant(req({ code: 'x', kind: 'extract-constant', oldName: '1' }))
      expect(res.success).toBe(false)
    })

    it('warns when many occurrences are replaced', () => {
      const vals = Array(7).fill('val = 100').join('\n')
      const res = r.extractConstant(
        req({ code: vals, kind: 'extract-constant', oldName: '100', newName: 'MAX' }),
      )
      expect(res.success).toBe(true)
      expect(res.warnings.length).toBeGreaterThan(0)
      expect(res.warnings[0]).toContain('occurrences')
    })

    it('inserts constant after imports', () => {
      const code = 'import a from "a"\nimport b from "b"\nconst x = 42 + 42'
      const res = r.extractConstant(
        req({ code, kind: 'extract-constant', oldName: '42', newName: 'ANSWER' }),
      )
      expect(res.success).toBe(true)
      const lines = res.code.split('\n')
      const importIdx = lines.findIndex(l => l.startsWith('import b'))
      const constIdx = lines.findIndex(l => l.includes('const ANSWER'))
      expect(constIdx).toBeGreaterThan(importIdx)
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // getAvailableRefactorings()
  // ────────────────────────────────────────────────────────────────────────
  describe('getAvailableRefactorings()', () => {
    it('returns all 8 refactoring kinds', () => {
      const kinds = r.getAvailableRefactorings()
      expect(kinds).toHaveLength(8)
    })

    it('includes expected refactoring types', () => {
      const kinds = r.getAvailableRefactorings()
      expect(kinds).toContain('extract-function')
      expect(kinds).toContain('extract-interface')
      expect(kinds).toContain('rename-symbol')
      expect(kinds).toContain('inline-variable')
      expect(kinds).toContain('convert-to-arrow')
      expect(kinds).toContain('convert-to-function')
      expect(kinds).toContain('simplify-conditional')
      expect(kinds).toContain('extract-constant')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // suggestRefactorings()
  // ────────────────────────────────────────────────────────────────────────
  describe('suggestRefactorings()', () => {
    it('suggests convert-to-arrow for function declarations', () => {
      const s = r.suggestRefactorings('function foo() {}', 'typescript')
      expect(s).toContain('convert-to-arrow')
    })

    it('suggests convert-to-function for arrow functions', () => {
      const s = r.suggestRefactorings('const fn = (x) => x', 'typescript')
      expect(s).toContain('convert-to-function')
    })

    it('suggests simplify-conditional for === true', () => {
      const s = r.suggestRefactorings('if (x === true) {}', 'javascript')
      expect(s).toContain('simplify-conditional')
    })

    it('suggests simplify-conditional for !== null &&', () => {
      const s = r.suggestRefactorings('x !== null && x !== undefined', 'typescript')
      expect(s).toContain('simplify-conditional')
    })

    it('suggests extract-constant for magic numbers', () => {
      const s = r.suggestRefactorings('timeout = 3000', 'typescript')
      expect(s).toContain('extract-constant')
    })

    it('does not suggest extract-constant for CSS', () => {
      const s = r.suggestRefactorings('width: 100px', 'css')
      expect(s).not.toContain('extract-constant')
    })

    it('suggests extract-function for long code', () => {
      const longCode = Array(35).fill('const x = 1').join('\n')
      const s = r.suggestRefactorings(longCode, 'typescript')
      expect(s).toContain('extract-function')
    })

    it('suggests extract-interface for object literals in TS/JS', () => {
      const code = '{ name: "x", age: 1, }'
      const s = r.suggestRefactorings(code, 'typescript')
      expect(s).toContain('extract-interface')
    })

    it('returns empty for trivial code', () => {
      const s = r.suggestRefactorings('const x = 1', 'typescript')
      expect(s).toHaveLength(0)
    })
  })
})
