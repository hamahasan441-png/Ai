import { describe, it, expect, beforeEach } from 'vitest'
import { CodeAnalyzer } from '../CodeAnalyzer'

// ── Constructor Tests ──

describe('CodeAnalyzer constructor', () => {
  it('creates an instance with default options', () => {
    const analyzer = new CodeAnalyzer()
    expect(analyzer).toBeInstanceOf(CodeAnalyzer)
  })

  it('accepts a partial options object with depth only', () => {
    const analyzer = new CodeAnalyzer({ depth: 'deep' })
    expect(analyzer).toBeInstanceOf(CodeAnalyzer)
  })

  it('accepts a partial options object with securityLevel only', () => {
    const analyzer = new CodeAnalyzer({ securityLevel: 'strict' })
    expect(analyzer).toBeInstanceOf(CodeAnalyzer)
  })

  it('accepts full options with depth and securityLevel', () => {
    const analyzer = new CodeAnalyzer({ depth: 'quick', securityLevel: 'basic' })
    expect(analyzer).toBeInstanceOf(CodeAnalyzer)
  })
})

// ── detectLanguage Tests ──

describe('CodeAnalyzer detectLanguage', () => {
  let analyzer: CodeAnalyzer

  beforeEach(() => {
    analyzer = new CodeAnalyzer()
  })

  it('detects TypeScript from type annotations and interfaces', () => {
    const code = `
      import type { Foo } from './foo'
      export interface Bar {
        name: string
        count: number
      }
    `
    const result = analyzer.detectLanguage(code)
    expect(result.language).toBe('typescript')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects Python from def/class keywords', () => {
    const code = `
def hello(name):
    if __name__ == '__main__':
        print("hello")

class MyClass:
    pass
    `
    const result = analyzer.detectLanguage(code)
    expect(result.language).toBe('python')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects Rust from fn/impl/struct keywords', () => {
    const code = `
use std::io;

fn main() {
    let mut x = 5;
    println!("value: {}", x);
}

impl MyStruct {
    pub fn new() -> Self { Self {} }
}
    `
    const result = analyzer.detectLanguage(code)
    expect(result.language).toBe('rust')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects Go from func/package keywords', () => {
    const code = `
package main

import (
    "fmt"
)

func main() {
    x := 10
    fmt.Println(x)
}
    `
    const result = analyzer.detectLanguage(code)
    expect(result.language).toBe('go')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('returns "unknown" with zero confidence for empty input', () => {
    const result = analyzer.detectLanguage('   ')
    expect(result.language).toBe('unknown')
    expect(result.confidence).toBe(0)
  })
})

// ── analyze Tests ──

describe('CodeAnalyzer analyze', () => {
  let analyzer: CodeAnalyzer

  beforeEach(() => {
    analyzer = new CodeAnalyzer()
  })

  it('returns a CodeAnalysis with all required fields', () => {
    const code = `
const add = (a: number, b: number): number => {
  return a + b
}
    `
    const result = analyzer.analyze(code)
    expect(result.language).toBeDefined()
    expect(typeof result.languageConfidence).toBe('number')
    expect(result.complexity).toBeDefined()
    expect(Array.isArray(result.antiPatterns)).toBe(true)
    expect(result.dependencies).toBeDefined()
    expect(Array.isArray(result.codeSmells)).toBe(true)
    expect(Array.isArray(result.securityIssues)).toBe(true)
    expect(typeof result.qualityScore).toBe('number')
    expect(typeof result.summary).toBe('string')
  })

  it('uses the knownLanguage when provided', () => {
    const code = 'def hello(): pass'
    const result = analyzer.analyze(code, 'python')
    expect(result.language).toBe('python')
    expect(result.languageConfidence).toBe(1.0)
  })

  it('qualityScore is between 0 and 100', () => {
    const code = `
function process(data) {
  if (data) {
    return data
  }
  return null
}
    `
    const result = analyzer.analyze(code)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })

  it('skips anti-patterns and code smells at quick depth', () => {
    const quickAnalyzer = new CodeAnalyzer({ depth: 'quick' })
    const code = `
var x = 10
console.log(x)
    `
    const result = quickAnalyzer.analyze(code, 'javascript')
    expect(result.antiPatterns).toEqual([])
    expect(result.codeSmells).toEqual([])
  })

  it('detects anti-patterns at standard depth', () => {
    const code = `
var badVar = "hello"
console.log(badVar)
    `
    const result = analyzer.analyze(code, 'javascript')
    const varPattern = result.antiPatterns.find(p => p.name === 'var-usage')
    expect(varPattern).toBeDefined()
  })

  it('summary includes language and quality information', () => {
    const code = `
function add(a, b) {
  return a + b
}
    `
    const result = analyzer.analyze(code, 'javascript')
    expect(result.summary).toContain('javascript')
    expect(result.summary).toMatch(/Quality:/)
  })
})

// ── getComplexity Tests ──

describe('CodeAnalyzer getComplexity', () => {
  let analyzer: CodeAnalyzer

  beforeEach(() => {
    analyzer = new CodeAnalyzer()
  })

  it('returns ComplexityMetrics with all required fields', () => {
    const code = `
function greet(name) {
  return "Hello, " + name
}
    `
    const result = analyzer.getComplexity(code)
    expect(typeof result.cyclomatic).toBe('number')
    expect(typeof result.cognitive).toBe('number')
    expect(typeof result.linesOfCode).toBe('number')
    expect(typeof result.functionCount).toBe('number')
    expect(typeof result.maxNestingDepth).toBe('number')
    expect(typeof result.avgFunctionLength).toBe('number')
  })

  it('cyclomatic complexity increases with branching', () => {
    const simple = `function f() { return 1 }`
    const branching = `
function f(x) {
  if (x > 0) {
    return 1
  } else if (x < 0) {
    return -1
  }
  for (let i = 0; i < x; i++) {
    while (true) { break }
  }
  return 0
}
    `
    const simpleResult = analyzer.getComplexity(simple)
    const branchResult = analyzer.getComplexity(branching)
    expect(branchResult.cyclomatic).toBeGreaterThan(simpleResult.cyclomatic)
  })

  it('counts functions correctly', () => {
    const code = `
function foo() {}
function bar() {}
function baz() {}
    `
    const result = analyzer.getComplexity(code)
    expect(result.functionCount).toBe(3)
  })

  it('reports zero code lines for blank/comment-only input', () => {
    const code = `
// just a comment
// another comment
    `
    const result = analyzer.getComplexity(code)
    expect(result.linesOfCode).toBe(0)
  })
})

// ── securityScan Tests ──

describe('CodeAnalyzer securityScan', () => {
  let analyzer: CodeAnalyzer

  beforeEach(() => {
    analyzer = new CodeAnalyzer({ securityLevel: 'strict' })
  })

  it('detects eval usage as a security issue', () => {
    const code = `const result = eval(userInput)`
    const issues = analyzer.securityScan(code, 'javascript')
    const evalIssue = issues.find(i => i.type === 'eval-usage')
    expect(evalIssue).toBeDefined()
    expect(evalIssue!.severity).toBe('high')
  })

  it('detects hardcoded secrets', () => {
    const code = `const password = "mySuperSecretPassword123"`
    const issues = analyzer.securityScan(code, 'javascript')
    const secretIssue = issues.find(i => i.type === 'hardcoded-secret')
    expect(secretIssue).toBeDefined()
    expect(secretIssue!.severity).toBe('critical')
  })

  it('returns no issues for clean code', () => {
    const code = `
function add(a, b) {
  return a + b
}
    `
    const issues = analyzer.securityScan(code, 'javascript')
    expect(issues).toEqual([])
  })

  it('basic level only reports critical issues', () => {
    const basicAnalyzer = new CodeAnalyzer({ securityLevel: 'basic' })
    const code = `const result = eval(userInput)`
    const issues = basicAnalyzer.securityScan(code, 'javascript')
    // eval-usage is 'high' severity, which basic level does not include
    const evalIssue = issues.find(i => i.type === 'eval-usage')
    expect(evalIssue).toBeUndefined()
  })

  it('security issues include CWE identifiers when available', () => {
    const code = `const result = eval(userInput)`
    const issues = analyzer.securityScan(code, 'javascript')
    const evalIssue = issues.find(i => i.type === 'eval-usage')
    expect(evalIssue).toBeDefined()
    expect(evalIssue!.cwe).toBe('CWE-95')
  })

  it('auto-detects language when none is provided', () => {
    const code = `
const result = eval(userInput)
console.log(result)
    `
    const issues = analyzer.securityScan(code)
    expect(Array.isArray(issues)).toBe(true)
  })
})

// ── setDepth / setSecurityLevel Tests ──

describe('CodeAnalyzer setDepth and setSecurityLevel', () => {
  it('setDepth changes analysis depth dynamically', () => {
    const analyzer = new CodeAnalyzer({ depth: 'standard' })
    const code = `
var x = 10
console.log(x)
    `

    // Standard depth detects anti-patterns
    const standardResult = analyzer.analyze(code, 'javascript')
    expect(standardResult.antiPatterns.length).toBeGreaterThan(0)

    // Switch to quick depth — anti-patterns should be skipped
    analyzer.setDepth('quick')
    const quickResult = analyzer.analyze(code, 'javascript')
    expect(quickResult.antiPatterns).toEqual([])
  })

  it('setSecurityLevel changes scanning strictness dynamically', () => {
    const analyzer = new CodeAnalyzer({ securityLevel: 'basic' })
    const code = `const x = Math.random()`

    // Basic level should not catch medium-severity insecure-random
    const basicIssues = analyzer.securityScan(code, 'javascript')
    const randomBasic = basicIssues.find(i => i.type === 'insecure-random')
    expect(randomBasic).toBeUndefined()

    // Switch to strict — now it should catch it
    analyzer.setSecurityLevel('strict')
    const strictIssues = analyzer.securityScan(code, 'javascript')
    const randomStrict = strictIssues.find(i => i.type === 'insecure-random')
    expect(randomStrict).toBeDefined()
  })
})

// ── Edge Cases ──

describe('CodeAnalyzer edge cases', () => {
  let analyzer: CodeAnalyzer

  beforeEach(() => {
    analyzer = new CodeAnalyzer()
  })

  it('handles empty string input gracefully', () => {
    const result = analyzer.analyze('')
    expect(result.language).toBe('unknown')
    expect(result.complexity.linesOfCode).toBe(0)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles single-line code input', () => {
    const result = analyzer.analyze('const x = 1', 'javascript')
    expect(result.language).toBe('javascript')
    expect(result.complexity.linesOfCode).toBeGreaterThanOrEqual(1)
  })
})
