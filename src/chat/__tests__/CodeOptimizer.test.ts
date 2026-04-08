import { describe, it, expect, beforeEach } from 'vitest'
import { CodeOptimizer, DEFAULT_CODE_OPTIMIZER_CONFIG } from '../CodeOptimizer.js'

describe('CodeOptimizer', () => {
  let opt: CodeOptimizer

  beforeEach(() => { opt = new CodeOptimizer() })

  describe('constructor & config', () => {
    it('uses default config', () => {
      expect(opt.getStats().totalAnalyses).toBe(0)
    })
    it('accepts custom config', () => {
      const o = new CodeOptimizer({ maxIssuesPerAnalysis: 5 })
      expect(o.getStats().totalAnalyses).toBe(0)
    })
    it('DEFAULT config has expected values', () => {
      expect(DEFAULT_CODE_OPTIMIZER_CONFIG.maxIssuesPerAnalysis).toBe(50)
      expect(DEFAULT_CODE_OPTIMIZER_CONFIG.enableCachingAnalysis).toBe(true)
    })
  })

  describe('complexity analysis', () => {
    it('detects O(1) for simple code', () => {
      const r = opt.analyzeComplexity('const x = 5; return x + 1;')
      expect(r.timeComplexity).toBe('O(1)')
      expect(r.loopDepth).toBe(0)
    })
    it('detects O(n) for single loop', () => {
      const r = opt.analyzeComplexity('for (let i = 0; i < n; i++) { sum += arr[i]; }')
      expect(r.timeComplexity).toBe('O(n)')
      expect(r.loopDepth).toBe(1)
    })
    it('detects O(n²) for nested loops', () => {
      const r = opt.analyzeComplexity(`
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) { result.push(i * j); }
        }
      `)
      expect(r.timeComplexity).toBe('O(n²)')
      expect(r.loopDepth).toBe(2)
    })
    it('detects O(n log n) for sort', () => {
      const r = opt.analyzeComplexity('for (let i = 0; i < n; i++) { arr.sort(); }')
      expect(r.timeComplexity).toBe('O(n log n)')
    })
    it('detects recursion', () => {
      const r = opt.analyzeComplexity('function fib(n) { return fib(n-1) + fib(n-2); }')
      expect(r.recursionDetected).toBe(true)
    })
    it('provides explanation', () => {
      const r = opt.analyzeComplexity('for (let i = 0; i < n; i++) {}')
      expect(r.explanation).toBeTruthy()
    })
  })

  describe('anti-pattern detection', () => {
    it('detects nested loop pattern', () => {
      const issues = opt.detectIssues(`
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < m; j++) { process(i, j); }
        }
      `)
      expect(issues.some(i => i.category === 'loop')).toBe(true)
    })
    it('detects array search in loop', () => {
      const issues = opt.detectIssues(`
        for (let i = 0; i < items.length; i++) {
          if (arr.includes(items[i])) { count++; }
        }
      `)
      expect(issues.some(i => i.description.includes('Linear search'))).toBe(true)
    })
    it('detects SELECT * in SQL', () => {
      const issues = opt.detectIssues('SELECT * FROM users WHERE active = true')
      expect(issues.some(i => i.category === 'database')).toBe(true)
    })
    it('detects sync file IO', () => {
      const issues = opt.detectIssues('const data = readFileSync("file.txt")')
      expect(issues.some(i => i.description.includes('Synchronous'))).toBe(true)
    })
    it('returns empty for clean code', () => {
      const issues = opt.detectIssues('const x = 5;')
      expect(issues).toHaveLength(0)
    })
  })

  describe('caching opportunities', () => {
    it('finds repeated function calls', () => {
      const opps = opt.findCachingOpportunities(`
        const a = compute(x);
        const b = compute(y);
        const c = compute(z);
      `)
      expect(opps.some(o => o.functionName === 'compute')).toBe(true)
    })
    it('finds JSON.parse opportunities', () => {
      const opps = opt.findCachingOpportunities('const data = JSON.parse(raw);')
      expect(opps.some(o => o.reason.includes('JSON'))).toBe(true)
    })
    it('finds HTTP caching opportunities', () => {
      const opps = opt.findCachingOpportunities('const res = await fetch("https://api.example.com/data");')
      expect(opps.some(o => o.strategy === 'ttl_cache')).toBe(true)
    })
    it('respects config disable', () => {
      const o = new CodeOptimizer({ enableCachingAnalysis: false })
      const opps = o.findCachingOpportunities('compute(x); compute(y); compute(z);')
      expect(opps).toHaveLength(0)
    })
  })

  describe('memory analysis', () => {
    it('detects event listener leak', () => {
      const issues = opt.analyzeMemory('element.addEventListener("click", handler);')
      expect(issues.some(i => i.pattern === 'event_listener_leak')).toBe(true)
    })
    it('detects interval leak', () => {
      const issues = opt.analyzeMemory('setInterval(() => poll(), 1000);')
      expect(issues.some(i => i.pattern === 'interval_leak')).toBe(true)
    })
    it('detects global state', () => {
      const issues = opt.analyzeMemory('window.myGlobal = data;')
      expect(issues.some(i => i.pattern === 'global_state')).toBe(true)
    })
    it('returns empty for clean code', () => {
      const issues = opt.analyzeMemory('const x = 5;')
      expect(issues).toHaveLength(0)
    })
    it('respects config disable', () => {
      const o = new CodeOptimizer({ enableMemoryAnalysis: false })
      expect(o.analyzeMemory('setInterval(() => {}, 1000)')).toHaveLength(0)
    })
  })

  describe('full analysis report', () => {
    it('generates complete report', () => {
      const report = opt.analyze(`
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < m; j++) {
            if (arr.includes(items[j])) { count++; }
          }
        }
      `)
      expect(report.complexity.timeComplexity).toBe('O(n²)')
      expect(report.issues.length).toBeGreaterThan(0)
      expect(report.suggestions.length).toBeGreaterThan(0)
      expect(report.overallScore).toBeLessThan(100)
    })
    it('gives high score for clean code', () => {
      const report = opt.analyze('const x = 5; return x + 1;')
      expect(report.overallScore).toBeGreaterThanOrEqual(90)
    })
    it('includes caching and memory analysis', () => {
      const report = opt.analyze(`
        element.addEventListener("click", handler);
        const a = compute(x); compute(y); compute(z);
      `)
      expect(report.cachingOpportunities.length).toBeGreaterThan(0)
      expect(report.memoryIssues.length).toBeGreaterThan(0)
    })
    it('increments analysis count', () => {
      opt.analyze('const x = 1;')
      expect(opt.getStats().totalAnalyses).toBe(1)
    })
  })

  describe('stats & serialization', () => {
    it('tracks all stats', () => {
      opt.analyze('test')
      opt.provideFeedback()
      const s = opt.getStats()
      expect(s.totalAnalyses).toBe(1)
      expect(s.feedbackCount).toBe(1)
    })
    it('serializes and deserializes', () => {
      opt.analyze('const x = 1;')
      opt.analyze('const y = 2;')
      const json = opt.serialize()
      const restored = CodeOptimizer.deserialize(json)
      expect(restored.getStats().totalAnalyses).toBe(2)
    })
  })
})
