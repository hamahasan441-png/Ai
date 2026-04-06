import { describe, it, expect, beforeEach } from 'vitest'
import { AsyncFlowAnalyzer } from '../AsyncFlowAnalyzer'
import type { AsyncFlowAnalysis } from '../AsyncFlowAnalyzer'

// ══════════════════════════════════════════════════════════════════════════════
// AsyncFlowAnalyzer Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('AsyncFlowAnalyzer', () => {
  let analyzer: AsyncFlowAnalyzer

  beforeEach(() => {
    analyzer = new AsyncFlowAnalyzer()
  })

  // ── Constructor Tests ──────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(analyzer).toBeInstanceOf(AsyncFlowAnalyzer)
    })
  })

  // ── Empty / Null Input Handling ────────────────────────────────────────

  describe('empty and null input handling', () => {
    it('should return safe defaults for empty string', () => {
      const result = analyzer.analyze('')
      expect(result.issues).toEqual([])
      expect(result.asyncFunctions).toEqual([])
      expect(result.promiseChains).toBe(0)
      expect(result.asyncSafetyScore).toBe(100)
      expect(result.summary).toBe('No code to analyze.')
    })

    it('should return safe defaults for whitespace-only input', () => {
      const result = analyzer.analyze('   \n\n  \t  ')
      expect(result.issues).toEqual([])
      expect(result.asyncSafetyScore).toBe(100)
      expect(result.summary).toBe('No code to analyze.')
    })
  })

  // ── Async Function Detection ───────────────────────────────────────────

  describe('async function detection', () => {
    it('should detect async function keyword declaration', () => {
      const code = `
async function fetchData() {
  await fetch('/api')
}
`
      const result = analyzer.analyze(code)
      expect(result.asyncFunctions.length).toBeGreaterThanOrEqual(1)
      const fn = result.asyncFunctions.find(f => f.name === 'fetchData')
      expect(fn).toBeDefined()
      expect(fn!.returnsPromise).toBe(true)
      expect(fn!.awaitCount).toBeGreaterThanOrEqual(1)
    })

    it('should detect async arrow function assigned to const', () => {
      const code = `
const loadItems = async () => {
  await readFile('data.json')
}
`
      const result = analyzer.analyze(code)
      const fn = result.asyncFunctions.find(f => f.name === 'loadItems')
      expect(fn).toBeDefined()
      expect(fn!.returnsPromise).toBe(true)
    })

    it('should detect async method with named assignment', () => {
      const code = `
let handler = async (req, res) => {
  await db.query('SELECT 1')
}
`
      const result = analyzer.analyze(code)
      const fn = result.asyncFunctions.find(f => f.name === 'handler')
      expect(fn).toBeDefined()
    })

    it('should detect error handling in async function with try/catch', () => {
      const code = `
async function safeFetch() {
  try {
    await fetch('/api')
  } catch (err) {
    console.error(err)
  }
}
`
      const result = analyzer.analyze(code)
      const fn = result.asyncFunctions.find(f => f.name === 'safeFetch')
      expect(fn).toBeDefined()
      expect(fn!.hasErrorHandling).toBe(true)
    })
  })

  // ── Missing Await Detection ────────────────────────────────────────────

  describe('missing await detection', () => {
    it('should flag known async function called without await', () => {
      const code = `
async function getData() {
  return 'data'
}

async function main() {
  getData()
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'missing-await' && i.title.includes('getData'),
      )
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('high')
    })

    it('should flag common async APIs called without await', () => {
      const code = `
async function load() {
  fetch('/api/data')
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'missing-await' && i.title.includes('fetch'),
      )
      expect(issue).toBeDefined()
    })

    it('should not flag awaited calls', () => {
      const code = `
async function load() {
  await fetch('/api/data')
}
`
      const result = analyzer.analyze(code)
      const missingAwait = result.issues.filter(i => i.type === 'missing-await')
      expect(missingAwait).toEqual([])
    })
  })

  // ── Unhandled Rejection Detection ──────────────────────────────────────

  describe('unhandled rejection detection', () => {
    it('should flag .then() without .catch()', () => {
      const code = `
fetch('/api').then(res => res.json())
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'unhandled-rejection')
      expect(issue).toBeDefined()
      expect(issue!.title).toContain('.then()')
    })

    it('should not flag .then() followed by .catch()', () => {
      const code = `
fetch('/api').then(res => res.json()).catch(err => console.error(err))
`
      const result = analyzer.analyze(code)
      const unhandled = result.issues.filter(
        i => i.type === 'unhandled-rejection' && i.title.includes('.then()'),
      )
      expect(unhandled).toEqual([])
    })

    it('should flag Promise constructor without reject', () => {
      const code = `
const p = new Promise((resolve) => {
  setTimeout(() => {
    resolve('done')
  }, 1000)
})
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'unhandled-rejection' && i.title.includes('reject'),
      )
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('medium')
    })
  })

  // ── Async Void Detection ───────────────────────────────────────────────

  describe('async void function detection', () => {
    it('should flag async function with void return type', () => {
      const code = `
async function handleClick(): void {
  await saveData()
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'async-void')
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('medium')
      expect(issue!.suggestion).toContain('Promise<void>')
    })
  })

  // ── Sequential Await Detection ─────────────────────────────────────────

  describe('sequential await detection', () => {
    it('should flag independent sequential awaits', () => {
      const code = `
async function load() {
  const users = await fetchUsers()
  const posts = await fetchPosts()
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'sequential-await')
      expect(issue).toBeDefined()
      expect(issue!.suggestion).toContain('Promise.all')
    })

    it('should not flag dependent sequential awaits', () => {
      const code = `
async function load() {
  const userId = await getCurrentUser()
  const posts = await getPostsForUser(userId)
}
`
      const result = analyzer.analyze(code)
      const sequential = result.issues.filter(i => i.type === 'sequential-await')
      expect(sequential).toEqual([])
    })
  })

  // ── Floating Promise Detection ─────────────────────────────────────────

  describe('floating promise detection', () => {
    it('should flag new Promise not assigned or awaited', () => {
      const code = `
function fire() {
  new Promise((resolve) => resolve('done'))
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'floating-promise')
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('high')
    })

    it('should not flag assigned Promise', () => {
      const code = `
const p = new Promise((resolve) => resolve('done'))
`
      const result = analyzer.analyze(code)
      const floating = result.issues.filter(i => i.type === 'floating-promise')
      expect(floating).toEqual([])
    })
  })

  // ── Callback Hell Detection ────────────────────────────────────────────

  describe('callback hell detection', () => {
    it('should flag 3+ levels of nested callbacks', () => {
      const code = `
fs.readFile('a', function(err, data) {
  fs.readFile('b', function(err, data) {
    fs.readFile('c', function(err, data) {
      console.log(data)
    })
  })
})
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'callback-hell')
      expect(issue).toBeDefined()
      expect(issue!.title).toMatch(/nesting depth/)
    })

    it('should not flag fewer than 3 levels of nesting', () => {
      const code = `
fs.readFile('a', function(err, data) {
  console.log(data)
})
`
      const result = analyzer.analyze(code)
      const callbackHell = result.issues.filter(i => i.type === 'callback-hell')
      expect(callbackHell).toEqual([])
    })
  })

  // ── Async in Loop Detection ────────────────────────────────────────────

  describe('async in loop detection', () => {
    it('should flag await inside for loop', () => {
      const code = `
async function processAll(items) {
  for (const item of items) {
    await processItem(item)
  }
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'async-in-loop')
      expect(issue).toBeDefined()
      expect(issue!.suggestion).toContain('Promise.all')
    })

    it('should flag await inside while loop', () => {
      const code = `
async function poll() {
  while (true) {
    await checkStatus()
  }
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'async-in-loop')
      expect(issue).toBeDefined()
    })
  })

  // ── Race Condition Detection ───────────────────────────────────────────

  describe('race condition detection', () => {
    it('should flag shared mutable state across async operations', () => {
      const code = `
async function update() {
  let count = 0
  await delay(100)
  count += 1
  await delay(200)
  count += 1
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'race-condition')
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('high')
      expect(issue!.title).toContain('race condition')
    })
  })

  // ── Error Swallowing Detection ─────────────────────────────────────────

  describe('error swallowing detection', () => {
    it('should flag empty .catch() handler', () => {
      const code = `
fetch('/api').then(r => r.json()).catch(() => {})
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'error-swallowing' && i.title.includes('Empty .catch()'),
      )
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('high')
    })

    it('should flag .catch() with unused error variable', () => {
      const code = `
fetch('/api').then(r => r.json()).catch((err) => {})
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(i => i.type === 'error-swallowing')
      expect(issue).toBeDefined()
    })

    it('should flag catch block that ignores the error variable', () => {
      const code = `
try {
  await doWork()
} catch (error) {
  console.log('something went wrong')
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'error-swallowing' && i.title.includes("error"),
      )
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('medium')
    })
  })

  // ── Mixed Async Patterns Detection ─────────────────────────────────────

  describe('mixed async patterns detection', () => {
    it('should flag mixing await and .then()', () => {
      const code = `
async function load() {
  const data = await fetch('/api')
  otherApi('/data').then(r => r.json())
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'mixed-async-patterns' && i.title.includes('await + .then()'),
      )
      expect(issue).toBeDefined()
      expect(issue!.severity).toBe('low')
    })

    it('should flag mixing callbacks and promises', () => {
      const code = `
async function process() {
  await fetchData()
  fs.readFile('a', function(err, data) {
    console.log(data)
  })
}
`
      const result = analyzer.analyze(code)
      const issue = result.issues.find(
        i => i.type === 'mixed-async-patterns' && i.title.includes('callbacks + promises'),
      )
      expect(issue).toBeDefined()
    })
  })

  // ── Promise Chain Counting ─────────────────────────────────────────────

  describe('promise chain counting', () => {
    it('should count .then() chains', () => {
      const code = `
fetch('/api')
  .then(res => res.json())
  .then(data => process(data))
  .catch(err => console.error(err))
`
      const result = analyzer.analyze(code)
      expect(result.promiseChains).toBe(2)
    })

    it('should return 0 when no promise chains exist', () => {
      const code = `
async function load() {
  const data = await fetch('/api')
}
`
      const result = analyzer.analyze(code)
      expect(result.promiseChains).toBe(0)
    })
  })

  // ── Async Safety Score Calculation ─────────────────────────────────────

  describe('async safety score calculation', () => {
    it('should return 100 for clean code', () => {
      const code = `
async function fetchData() {
  try {
    const res = await fetch('/api')
    return await res.json()
  } catch (err) {
    console.error(err)
    throw err
  }
}
`
      const result = analyzer.analyze(code)
      expect(result.asyncSafetyScore).toBe(100)
    })

    it('should reduce score for high-severity issues', () => {
      const code = `
async function load() {
  fetch('/api')
  fetch('/other').then(r => r.json())
}
`
      const result = analyzer.analyze(code)
      expect(result.asyncSafetyScore).toBeLessThan(100)
    })

    it('should never go below 0', () => {
      // Code with many issues
      const code = `
async function terrible() {
  fetch('/a')
  fetch('/b')
  fetch('/c')
  fetch('/d')
  fetch('/e')
  fetch('/f')
  fetch('/g')
  fetch('/h')
  fetch('/i')
  fetch('/j')
  somePromise.then(x => x)
  anotherPromise.then(y => y)
}
`
      const result = analyzer.analyze(code)
      expect(result.asyncSafetyScore).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Summary Generation ─────────────────────────────────────────────────

  describe('summary generation', () => {
    it('should report no async patterns for sync-only code', () => {
      const code = `
function add(a, b) {
  return a + b
}
`
      const result = analyzer.analyze(code)
      expect(result.summary).toBe('No async patterns detected.')
    })

    it('should report clean async functions with no issues', () => {
      const code = `
async function fetchData() {
  try {
    const res = await fetch('/api')
    return await res.json()
  } catch (err) {
    console.error(err)
    throw err
  }
}
`
      const result = analyzer.analyze(code)
      expect(result.summary).toContain('async function(s)')
      expect(result.summary).toContain('no issues')
      expect(result.summary).toContain('/100')
    })

    it('should include issue count and score when issues exist', () => {
      const code = `
async function main() {
  fetch('/api')
  fetch('/other').then(r => r.json())
}
`
      const result = analyzer.analyze(code)
      expect(result.summary).toContain('async issue(s)')
      expect(result.summary).toContain('Score:')
      expect(result.summary).toContain('/100')
    })
  })

  // ── Return Shape Validation ────────────────────────────────────────────

  describe('return shape validation', () => {
    it('should return all expected fields in AsyncFlowAnalysis', () => {
      const code = `
async function example() {
  await fetch('/api')
}
`
      const result: AsyncFlowAnalysis = analyzer.analyze(code)
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('asyncFunctions')
      expect(result).toHaveProperty('promiseChains')
      expect(result).toHaveProperty('asyncSafetyScore')
      expect(result).toHaveProperty('summary')
      expect(Array.isArray(result.issues)).toBe(true)
      expect(Array.isArray(result.asyncFunctions)).toBe(true)
      expect(typeof result.promiseChains).toBe('number')
      expect(typeof result.asyncSafetyScore).toBe('number')
      expect(typeof result.summary).toBe('string')
    })
  })
})
