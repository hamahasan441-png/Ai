import { describe, it, expect, beforeEach } from 'vitest'
import { PerformanceAnalyzer } from '../PerformanceAnalyzer'

// ── Constructor & setLanguage Tests ──

describe('PerformanceAnalyzer constructor', () => {
  it('creates an instance with default language', () => {
    const analyzer = new PerformanceAnalyzer()
    expect(analyzer).toBeInstanceOf(PerformanceAnalyzer)
  })

  it('creates an instance with a specific language', () => {
    const analyzer = new PerformanceAnalyzer('typescript')
    expect(analyzer).toBeInstanceOf(PerformanceAnalyzer)
  })
})

describe('PerformanceAnalyzer setLanguage', () => {
  it('allows changing the analysis language', () => {
    const analyzer = new PerformanceAnalyzer()
    analyzer.setLanguage('python')
    // Verify it still produces valid results after language change
    const result = analyzer.analyze('x = 1')
    expect(result).toBeDefined()
    expect(result.performanceScore).toBeLessThanOrEqual(100)
  })
})

// ── Empty / Null Input Handling ──

describe('PerformanceAnalyzer empty/null input', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer()
  })

  it('returns default analysis for empty string', () => {
    const result = analyzer.analyze('')
    expect(result.estimatedComplexity).toBe('O(1)')
    expect(result.issues).toEqual([])
    expect(result.suggestions).toEqual([])
    expect(result.hotspots).toEqual([])
    expect(result.performanceScore).toBe(100)
    expect(result.summary).toBe('No code to analyze.')
  })

  it('returns default analysis for whitespace-only string', () => {
    const result = analyzer.analyze('   \n\n  \t  ')
    expect(result.estimatedComplexity).toBe('O(1)')
    expect(result.issues).toEqual([])
    expect(result.performanceScore).toBe(100)
  })
})

// ── Nested Loop Detection ──

describe('PerformanceAnalyzer nested loop detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects a 2-level nested for loop as O(n²)', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    doWork(i, j);
  }
}
`
    const result = analyzer.analyze(code)
    const nestedIssues = result.issues.filter(i => i.type === 'nested-loop')
    expect(nestedIssues.length).toBeGreaterThanOrEqual(1)
    expect(nestedIssues[0].estimatedComplexity).toBe('O(n²)')
    expect(nestedIssues[0].severity).toBe('high')
  })

  it('detects a 3-level nested loop as O(n³) with critical severity', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      doWork(i, j, k);
    }
  }
}
`
    const result = analyzer.analyze(code)
    const nestedIssues = result.issues.filter(i => i.type === 'nested-loop')
    const triplyNested = nestedIssues.find(i => i.estimatedComplexity === 'O(n³)')
    expect(triplyNested).toBeDefined()
    expect(triplyNested!.severity).toBe('critical')
  })

  it('does not flag a single loop as nested', () => {
    const code = `
for (let i = 0; i < n; i++) {
  doWork(i);
}
`
    const result = analyzer.analyze(code)
    const nestedIssues = result.issues.filter(i => i.type === 'nested-loop')
    expect(nestedIssues).toHaveLength(0)
  })
})

// ── Recursion Without Memoization ──

describe('PerformanceAnalyzer recursion without memo detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects recursive function without memoization', () => {
    const code = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`
    const result = analyzer.analyze(code)
    const recursionIssues = result.issues.filter(i => i.type === 'recursive-without-memo')
    expect(recursionIssues.length).toBeGreaterThanOrEqual(1)
    expect(recursionIssues[0].title).toContain('fibonacci')
    expect(recursionIssues[0].estimatedComplexity).toBe('O(2ⁿ)')
  })

  it('does not flag recursive function with memoization via Map', () => {
    const code = `
function fibonacci(n) {
  const cache = new Map();
  if (cache.has(n)) return cache.get(n);
  if (n <= 1) return n;
  const result = fibonacci(n - 1) + fibonacci(n - 2);
  cache.set(n, result);
  return result;
}
`
    const result = analyzer.analyze(code)
    const recursionIssues = result.issues.filter(i => i.type === 'recursive-without-memo')
    expect(recursionIssues).toHaveLength(0)
  })

  it('detects recursive arrow function without memoization', () => {
    const code = `
const factorial = (n) => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
`
    const result = analyzer.analyze(code)
    const recursionIssues = result.issues.filter(i => i.type === 'recursive-without-memo')
    expect(recursionIssues.length).toBeGreaterThanOrEqual(1)
    expect(recursionIssues[0].title).toContain('factorial')
  })
})

// ── Object Allocation in Loop ──

describe('PerformanceAnalyzer allocation in loop detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects new Array() inside a for loop', () => {
    const code = `
for (let i = 0; i < n; i++) {
  const arr = new Array(100);
  process(arr);
}
`
    const result = analyzer.analyze(code)
    const allocIssues = result.issues.filter(i => i.type === 'allocation-in-loop')
    expect(allocIssues.length).toBeGreaterThanOrEqual(1)
    expect(allocIssues[0].impact).toBe('medium')
  })

  it('detects JSON.parse inside a while loop', () => {
    const code = `
while (hasMore()) {
  const data = JSON.parse(raw);
  use(data);
}
`
    const result = analyzer.analyze(code)
    const allocIssues = result.issues.filter(i => i.type === 'allocation-in-loop')
    expect(allocIssues.length).toBeGreaterThanOrEqual(1)
  })
})

// ── String Concatenation in Loop ──

describe('PerformanceAnalyzer string concat in loop detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects += string concatenation in for loop', () => {
    const code = `
let result = "";
for (let i = 0; i < items.length; i++) {
  result += "item: " + items[i];
}
`
    const result = analyzer.analyze(code)
    const concatIssues = result.issues.filter(i => i.type === 'string-concat-in-loop')
    expect(concatIssues.length).toBeGreaterThanOrEqual(1)
    expect(concatIssues[0].estimatedComplexity).toBe('O(n²)')
  })
})

// ── Array Method Chain Detection ──

describe('PerformanceAnalyzer array method chain detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects multi-line chain of 3+ array methods', () => {
    const code = `
const result = data
  .map(x => x.value)
  .filter(v => v > 0)
  .sort((a, b) => a - b);
`
    const result = analyzer.analyze(code)
    const chainIssues = result.issues.filter(i => i.type === 'array-method-chain')
    expect(chainIssues.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Unnecessary Recomputation Detection ──

describe('PerformanceAnalyzer unnecessary recomputation detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects repeated calls to expensive operations (3+ times)', () => {
    const code = `
const a = JSON.parse(raw);
const b = JSON.parse(raw);
const c = JSON.parse(raw);
`
    const result = analyzer.analyze(code)
    const recompIssues = result.issues.filter(i => i.type === 'unnecessary-recomputation')
    expect(recompIssues.length).toBeGreaterThanOrEqual(1)
    expect(recompIssues[0].title).toContain('JSON.parse')
  })

  it('does not flag 2 or fewer repeated calls', () => {
    const code = `
const a = JSON.parse(raw);
const b = JSON.parse(raw);
`
    const result = analyzer.analyze(code)
    const recompIssues = result.issues.filter(i => i.type === 'unnecessary-recomputation')
    expect(recompIssues).toHaveLength(0)
  })
})

// ── Unbounded Growth Detection ──

describe('PerformanceAnalyzer unbounded growth detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects unbounded push in setInterval', () => {
    const code = `
const logs = [];
setInterval(() => {
  logs.push(getLog());
})
`
    const result = analyzer.analyze(code)
    const growthIssues = result.issues.filter(i => i.type === 'unbounded-growth')
    expect(growthIssues.length).toBeGreaterThanOrEqual(1)
    expect(growthIssues[0].severity).toBe('high')
  })

  it('detects unbounded push in event handler', () => {
    const code = `
const entries = [];
emitter.on('data', (d) => {
  entries.push(d);
})
`
    const result = analyzer.analyze(code)
    const growthIssues = result.issues.filter(i => i.type === 'unbounded-growth')
    expect(growthIssues.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Synchronous I/O in Loop Detection ──

describe('PerformanceAnalyzer sync I/O in loop detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects fs.readFileSync inside a for loop', () => {
    const code = `
for (let i = 0; i < files.length; i++) {
  const content = fs.readFileSync(files[i]);
  process(content);
}
`
    const result = analyzer.analyze(code)
    const syncIOIssues = result.issues.filter(i => i.type === 'sync-io-in-loop')
    expect(syncIOIssues.length).toBeGreaterThanOrEqual(1)
    expect(syncIOIssues[0].severity).toBe('high')
  })

  it('detects fs.existsSync inside a while loop', () => {
    const code = `
while (paths.length > 0) {
  const p = paths.pop();
  if (fs.existsSync(p)) {
    found.push(p);
  }
}
`
    const result = analyzer.analyze(code)
    const syncIOIssues = result.issues.filter(i => i.type === 'sync-io-in-loop')
    expect(syncIOIssues.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Regex Creation in Loop Detection ──

describe('PerformanceAnalyzer regex in loop detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects new RegExp() inside a for loop', () => {
    const code = `
for (let i = 0; i < patterns.length; i++) {
  const re = new RegExp(patterns[i]);
  if (re.test(input)) hits++;
}
`
    const result = analyzer.analyze(code)
    const regexIssues = result.issues.filter(i => i.type === 'regex-in-loop')
    expect(regexIssues.length).toBeGreaterThanOrEqual(1)
    expect(regexIssues[0].impact).toBe('medium')
  })
})

// ── Inefficient Data Structure Detection ──

describe('PerformanceAnalyzer inefficient data structure detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects Array.includes() inside a loop as O(n²)', () => {
    const code = `
for (let i = 0; i < items.length; i++) {
  if (list.includes(items[i])) {
    matches.push(items[i]);
  }
}
`
    const result = analyzer.analyze(code)
    const dsIssues = result.issues.filter(i => i.type === 'inefficient-data-structure')
    expect(dsIssues.length).toBeGreaterThanOrEqual(1)
    expect(dsIssues[0].estimatedComplexity).toBe('O(n²)')

    // Also generates a data-structure suggestion
    const dsSuggestions = result.suggestions.filter(s => s.category === 'data-structure')
    expect(dsSuggestions.length).toBeGreaterThanOrEqual(1)
  })

  it('detects Object.keys().find() as inefficient lookup', () => {
    const code = `
const key = Object.keys(obj).find(k => k === target);
`
    const result = analyzer.analyze(code)
    const dsIssues = result.issues.filter(i => i.type === 'inefficient-data-structure')
    expect(dsIssues.length).toBeGreaterThanOrEqual(1)
    expect(dsIssues[0].title).toContain('Object.keys()')
  })
})

// ── Redundant Iteration Detection ──

describe('PerformanceAnalyzer redundant iteration detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('detects .filter().length pattern', () => {
    const code = `
const hasActive = users.filter(u => u.active).length > 0;
`
    const result = analyzer.analyze(code)
    const redundantIssues = result.issues.filter(i => i.type === 'redundant-iteration')
    expect(redundantIssues.length).toBeGreaterThanOrEqual(1)
    expect(redundantIssues[0].title).toContain('.filter().length')
  })

  it('generates suggestion for .map().filter() chain', () => {
    const code = `
const result = items.map(x => x.value).filter(v => v > 0);
`
    const result = analyzer.analyze(code)
    const algoSuggestions = result.suggestions.filter(s => s.category === 'algorithm')
    expect(algoSuggestions.length).toBeGreaterThanOrEqual(1)
    expect(algoSuggestions[0].description).toContain('.map().filter()')
  })
})

// ── Complexity Estimation ──

describe('PerformanceAnalyzer estimateComplexity', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('returns O(1) for constant-time code', () => {
    const code = `
const x = a + b;
return x * 2;
`
    expect(analyzer.estimateComplexity(code)).toBe('O(1)')
  })

  it('returns O(n) for a single loop', () => {
    const code = `
for (let i = 0; i < n; i++) {
  sum += arr[i];
}
`
    expect(analyzer.estimateComplexity(code)).toBe('O(n)')
  })

  it('returns O(n²) for a doubly nested loop', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    matrix[i][j] = 0;
  }
}
`
    expect(analyzer.estimateComplexity(code)).toBe('O(n²)')
  })

  it('returns O(n³) for a triply nested loop', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      result += m1[i][k] * m2[k][j];
    }
  }
}
`
    expect(analyzer.estimateComplexity(code)).toBe('O(n³)')
  })

  it('returns O(2ⁿ) for recursive function without memoization', () => {
    const code = `
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
`
    expect(analyzer.estimateComplexity(code)).toBe('O(2ⁿ)')
  })

  it('returns O(n log n) for code with .sort()', () => {
    const code = `
const sorted = arr.sort((a, b) => a - b);
`
    expect(analyzer.estimateComplexity(code)).toBe('O(n log n)')
  })
})

// ── Performance Scoring ──

describe('PerformanceAnalyzer performance scoring', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('gives a perfect score (100) for clean code', () => {
    const code = `
const x = 1 + 2;
return x;
`
    const result = analyzer.analyze(code)
    expect(result.performanceScore).toBe(100)
  })

  it('reduces score for code with performance issues', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    doWork(i, j);
  }
}
`
    const result = analyzer.analyze(code)
    expect(result.performanceScore).toBeLessThan(100)
  })

  it('score never goes below 0 even with many issues', () => {
    const code = `
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      const d = new Date();
      const re = new RegExp("test");
      result += "hello";
      fs.readFileSync("file");
    }
  }
}
`
    const result = analyzer.analyze(code)
    expect(result.performanceScore).toBeGreaterThanOrEqual(0)
  })
})

// ── Suggestion Generation ──

describe('PerformanceAnalyzer suggestion generation', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('generates algorithm suggestion for nested loops', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    compare(arr[i], arr[j]);
  }
}
`
    const result = analyzer.analyze(code)
    const algoSuggestions = result.suggestions.filter(s => s.category === 'algorithm')
    expect(algoSuggestions.length).toBeGreaterThanOrEqual(1)
    expect(algoSuggestions[0].description).toContain('hash')
  })

  it('generates caching suggestion for recursion without memo', () => {
    const code = `
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
`
    const result = analyzer.analyze(code)
    const cacheSuggestions = result.suggestions.filter(s => s.category === 'caching')
    expect(cacheSuggestions.length).toBeGreaterThanOrEqual(1)
    expect(cacheSuggestions[0].description).toContain('memoization')
  })

  it('generates parallelism suggestion for sync I/O in loop', () => {
    const code = `
for (let i = 0; i < files.length; i++) {
  const data = fs.readFileSync(files[i]);
  results.push(data);
}
`
    const result = analyzer.analyze(code)
    const parSuggestions = result.suggestions.filter(s => s.category === 'parallelism')
    expect(parSuggestions.length).toBeGreaterThanOrEqual(1)
    expect(parSuggestions[0].description).toContain('async')
  })

  it('generates algorithm suggestion for allocation in loop', () => {
    const code = `
for (let i = 0; i < n; i++) {
  const arr = new Array(100);
  process(arr);
}
`
    const result = analyzer.analyze(code)
    const algoSuggestions = result.suggestions.filter(s => s.category === 'algorithm')
    expect(algoSuggestions.length).toBeGreaterThanOrEqual(1)
    expect(algoSuggestions.some(s => s.description.toLowerCase().includes('hoist'))).toBe(true)
  })
})

// ── Summary Generation ──

describe('PerformanceAnalyzer summary', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('reports no issues for clean code', () => {
    const code = `const x = 1;`
    const result = analyzer.analyze(code)
    expect(result.summary).toContain('No performance issues detected')
    expect(result.summary).toContain('Score:')
  })

  it('includes issue count and complexity in summary for problematic code', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    work();
  }
}
`
    const result = analyzer.analyze(code)
    expect(result.summary).toContain('performance issue')
    expect(result.summary).toContain('Estimated complexity:')
    expect(result.summary).toContain('Performance score:')
  })
})

// ── Hotspot Detection ──

describe('PerformanceAnalyzer hotspot detection', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer('typescript')
  })

  it('reports a hotspot for nested loops', () => {
    const code = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    work(i, j);
  }
}
`
    const result = analyzer.analyze(code)
    expect(result.hotspots.length).toBeGreaterThanOrEqual(1)
    expect(result.hotspots[0].complexity).toBe('O(n²)')
  })

  it('reports a hotspot for recursive function without memo', () => {
    const code = `
function solve(n) {
  if (n <= 0) return 0;
  return solve(n - 1) + solve(n - 2);
}
`
    const result = analyzer.analyze(code)
    const recHotspots = result.hotspots.filter(h => h.name === 'solve')
    expect(recHotspots.length).toBeGreaterThanOrEqual(1)
    expect(recHotspots[0].complexity).toBe('O(2ⁿ)')
  })
})
