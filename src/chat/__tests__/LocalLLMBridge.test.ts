import { describe, it, expect, beforeEach } from 'vitest'
import { LocalLLMBridge, type BridgeConfig, type QueryIntent } from '../LocalLLMBridge.js'

describe('LocalLLMBridge', () => {
  let bridge: LocalLLMBridge

  beforeEach(() => {
    bridge = new LocalLLMBridge()
  })

  // ── Intent Classification ──────────────────────────────────────────────

  describe('Intent Classification', () => {
    it('should classify code generation intent', () => {
      const result = bridge.classifyIntent('Write a function to sort an array in Python')
      expect(result.intent).toBe('code_generation')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should classify code review intent', () => {
      const result = bridge.classifyIntent('Review this code for bugs and security issues')
      expect(result.intent).toBe('code_review')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should classify debugging intent', () => {
      const result = bridge.classifyIntent(
        'Debug this error: TypeError cannot read property of null',
      )
      expect(result.intent).toBe('debugging')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should classify exploit analysis intent', () => {
      const result = bridge.classifyIntent('Analyze this exploit chain for privilege escalation')
      expect(result.intent).toBe('exploit_analysis')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should classify vulnerability search intent', () => {
      const result = bridge.classifyIntent('Search for CVE vulnerabilities in Apache 2.4')
      expect(result.intent).toBe('vulnerability_search')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should classify overflow debug intent', () => {
      const result = bridge.classifyIntent('Debug this stack buffer overflow crash at 0x41414141')
      expect(result.intent).toBe('overflow_debug')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should classify heap overflow intent', () => {
      const result = bridge.classifyIntent(
        'Analyze this heap buffer overflow with tcache poisoning',
      )
      expect(result.intent).toBe('overflow_debug')
    })

    it('should classify knowledge lookup intent', () => {
      const result = bridge.classifyIntent('What is a binary search tree?')
      expect(result.intent).toBe('knowledge_lookup')
    })

    it('should classify general questions', () => {
      const result = bridge.classifyIntent('Can you help me with something?')
      expect(result.intent).toBe('general_question')
    })

    it('should determine routing target', () => {
      const result = bridge.classifyIntent('Write a function to sort an array')
      expect(['llm', 'hybrid', 'knowledge_base', 'fallback']).toContain(result.target)
      expect(result.reason).toBeTruthy()
    })

    it('should route to KB when LLM is disabled', () => {
      const noLLM = new LocalLLMBridge(undefined, { enableLLM: false })
      const result = noLLM.classifyIntent('Write code')
      expect(result.target).toBe('knowledge_base')
    })

    it('should include context needs for security intents', () => {
      const result = bridge.classifyIntent('Search for CVE vulnerabilities in OpenSSL')
      expect(result.contextNeeded).toContain('cve_database')
    })

    it('should include context needs for overflow intents', () => {
      const result = bridge.classifyIntent('Debug this buffer overflow crash')
      expect(result.contextNeeded).toContain('overflow_patterns')
    })
  })

  // ── Query Processing ───────────────────────────────────────────────────

  describe('Query Processing', () => {
    it('should process a general query', async () => {
      const response = await bridge.processQuery('What is a linked list?')
      expect(response.text).toBeTruthy()
      expect(response.intent).toBeTruthy()
      expect(response.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should process a code generation query', async () => {
      const response = await bridge.processQuery('Write a function to calculate fibonacci')
      expect(response.text).toBeTruthy()
      expect(response.source).toBeTruthy()
    })

    it('should process a vulnerability search query', async () => {
      const response = await bridge.processQuery('Find CVE vulnerabilities in Log4j')
      expect(response.text).toBeTruthy()
    })

    it('should process an overflow debug query', async () => {
      const response = await bridge.processQuery('Debug this stack buffer overflow with SIGSEGV')
      expect(response.text).toBeTruthy()
    })

    it('should update statistics on each query', async () => {
      await bridge.processQuery('Hello')
      await bridge.processQuery('World')
      const stats = bridge.getStats()
      expect(stats.totalQueries).toBe(2)
    })

    it('should track intent distribution', async () => {
      await bridge.processQuery('Write a function to sort')
      await bridge.processQuery('Search for CVE in Apache')
      const stats = bridge.getStats()
      const totalIntents = Object.values(stats.intentDistribution).reduce((a, b) => a + b, 0)
      expect(totalIntents).toBe(2)
    })

    it('should maintain conversation history', async () => {
      await bridge.processQuery('Hello, I need help')
      await bridge.processQuery('Can you write code?')
      const history = bridge.getHistory()
      expect(history.length).toBe(4) // 2 user + 2 assistant
    })

    it('should cache responses when enabled', async () => {
      // First query — cache miss
      const r1 = await bridge.processQuery('What is a binary tree?')
      expect(r1.cached).toBe(false)

      // Same query — cache hit
      const r2 = await bridge.processQuery('What is a binary tree?')
      expect(r2.cached).toBe(true)

      const stats = bridge.getStats()
      expect(stats.cacheHits).toBe(1)
    })

    it('should not cache when disabled', async () => {
      const noCache = new LocalLLMBridge(undefined, { enableCache: false })
      await noCache.processQuery('test query')
      await noCache.processQuery('test query')
      expect(noCache.getCacheSize()).toBe(0)
    })
  })

  // ── Context Enrichment ─────────────────────────────────────────────────

  describe('Context Enrichment', () => {
    it('should add and retrieve knowledge context', () => {
      bridge.addKnowledgeContext('security', [
        'CVE-2021-44228: Log4Shell',
        'CVE-2014-0160: Heartbleed',
      ])
      const ctx = bridge.getContextForIntent('vulnerability_search')
      expect(ctx).toContain('CVE-2021-44228: Log4Shell')
    })

    it('should add overflow context', () => {
      bridge.addKnowledgeContext('overflow_patterns', ['Stack BOF: overwrite return address'])
      const ctx = bridge.getContextForIntent('overflow_debug')
      expect(ctx).toContain('Stack BOF: overwrite return address')
    })

    it('should add code context', () => {
      bridge.addKnowledgeContext('code_templates', ['Use TypeScript strict mode'])
      const ctx = bridge.getContextForIntent('code_generation')
      expect(ctx).toContain('Use TypeScript strict mode')
    })

    it('should return empty array for missing context', () => {
      const ctx = bridge.getContextForIntent('general_question')
      expect(ctx).toEqual([])
    })

    it('should build enriched prompt with context', () => {
      bridge.addKnowledgeContext('security', ['Known CVE: Log4Shell'])
      const prompt = bridge.buildEnrichedPrompt('Find vulnerabilities', 'vulnerability_search')
      expect(prompt).toContain('Known CVE: Log4Shell')
      expect(prompt).toContain('Find vulnerabilities')
    })

    it('should build enriched prompt with external context', () => {
      const prompt = bridge.buildEnrichedPrompt('Query', 'general_question', ['Extra context'])
      expect(prompt).toContain('Extra context')
      expect(prompt).toContain('Query')
    })

    it('should truncate context exceeding max tokens', () => {
      const longContext = Array(1000).fill('A'.repeat(100))
      bridge.addKnowledgeContext('general', longContext)
      const prompt = bridge.buildEnrichedPrompt('test', 'general_question')
      // Should contain truncation indicator
      expect(prompt.length).toBeLessThan(longContext.join('\n').length)
    })

    it('should include conversation history in enriched prompt', async () => {
      await bridge.processQuery('Hello, first message')
      const prompt = bridge.buildEnrichedPrompt('Second message', 'general_question')
      expect(prompt).toContain('Recent Conversation')
    })
  })

  // ── Specialized Queries ────────────────────────────────────────────────

  describe('Specialized Queries', () => {
    it('should search exploits with KB context', async () => {
      const result = await bridge.searchExploits('Apache path traversal', [
        'CVE-2021-41773: Apache 2.4.49 path traversal',
      ])
      expect(result.intent).toBe('vulnerability_search')
      expect(result.source).toBe('hybrid')
      expect(result.contextSources).toContain('exploit_search_engine')
    })

    it('should search exploits without KB context', async () => {
      const result = await bridge.searchExploits('Log4j RCE')
      expect(result.contextSources).toContain('qwen_llm')
    })

    it('should debug overflow with KB context', async () => {
      const result = await bridge.debugOverflow(
        'SIGSEGV at 0x41414141',
        'NX: enabled, ASLR: enabled',
        ['Stack overflow detected: return address overwritten with pattern bytes'],
      )
      expect(result.intent).toBe('overflow_debug')
      expect(result.source).toBe('hybrid')
      expect(result.contextSources).toContain('buffer_overflow_debugger')
    })

    it('should debug overflow without KB context', async () => {
      const result = await bridge.debugOverflow('SIGSEGV at 0x0', 'NX: enabled')
      expect(result.contextSources).toContain('qwen_llm')
    })

    it('should generate code with context', async () => {
      const result = await bridge.generateCode('sort function', 'Python', [
        'Use quicksort algorithm',
      ])
      expect(result.intent).toBe('code_generation')
      expect(result.contextSources).toContain('code_templates')
    })

    it('should generate code without context', async () => {
      const result = await bridge.generateCode('hello world', 'Python')
      expect(result.contextSources).toContain('qwen_llm')
    })

    it('should review code', async () => {
      const result = await bridge.reviewCode('function add(a, b) { return a + b }', 'JavaScript')
      expect(result.intent).toBe('code_review')
      expect(result.source).toBe('llm')
    })
  })

  // ── Management ─────────────────────────────────────────────────────────

  describe('Management', () => {
    it('should get underlying LLM instance', () => {
      const llm = bridge.getLLM()
      expect(llm).toBeTruthy()
      expect(llm.getAvailableModels().length).toBeGreaterThan(0)
    })

    it('should get and reset statistics', async () => {
      await bridge.processQuery('test')
      expect(bridge.getStats().totalQueries).toBe(1)
      bridge.resetStats()
      expect(bridge.getStats().totalQueries).toBe(0)
    })

    it('should get and update configuration', () => {
      expect(bridge.getConfig().enableLLM).toBe(true)
      bridge.updateConfig({ enableLLM: false })
      expect(bridge.getConfig().enableLLM).toBe(false)
    })

    it('should clear cache', async () => {
      await bridge.processQuery('cached query')
      expect(bridge.getCacheSize()).toBeGreaterThan(0)
      bridge.clearCache()
      expect(bridge.getCacheSize()).toBe(0)
    })

    it('should clear conversation history', async () => {
      await bridge.processQuery('test')
      expect(bridge.getHistory().length).toBeGreaterThan(0)
      bridge.clearHistory()
      expect(bridge.getHistory().length).toBe(0)
    })

    it('should generate status report', () => {
      const report = bridge.generateStatusReport()
      expect(report).toContain('Bridge')
      expect(report).toContain('Qwen2.5-Coder')
      expect(report).toContain('Configuration')
    })

    it('should have sensible default config', () => {
      const config = bridge.getConfig()
      expect(config.enableLLM).toBe(true)
      expect(config.enableCache).toBe(true)
      expect(config.cacheMaxSize).toBe(500)
      expect(config.enableContextEnrichment).toBe(true)
      expect(config.confidenceThreshold).toBe(0.6)
      expect(config.fallbackToKB).toBe(true)
    })

    it('should accept custom bridge config', () => {
      const custom = new LocalLLMBridge(undefined, {
        enableCache: false,
        confidenceThreshold: 0.8,
      })
      const config = custom.getConfig()
      expect(config.enableCache).toBe(false)
      expect(config.confidenceThreshold).toBe(0.8)
    })

    it('should accept custom LLM config', () => {
      const custom = new LocalLLMBridge({ backend: 'llama_cpp', port: 8080 })
      const llm = custom.getLLM()
      const config = llm.getConfig()
      expect(config.backend).toBe('llama_cpp')
      expect(config.port).toBe(8080)
    })
  })

  // ── Edge Cases ─────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle empty query', async () => {
      const response = await bridge.processQuery('')
      expect(response.text).toBeTruthy()
    })

    it('should handle very long query', async () => {
      const longQuery = 'a'.repeat(10000)
      const response = await bridge.processQuery(longQuery)
      expect(response.text).toBeTruthy()
    })

    it('should handle special characters in query', async () => {
      const response = await bridge.processQuery('What about <script>alert("xss")</script>?')
      expect(response.text).toBeTruthy()
    })

    it('should evict cache entries when full', async () => {
      const smallCache = new LocalLLMBridge(undefined, { cacheMaxSize: 2 })
      await smallCache.processQuery('query 1')
      await smallCache.processQuery('query 2')
      await smallCache.processQuery('query 3')
      expect(smallCache.getCacheSize()).toBeLessThanOrEqual(2)
    })

    it('should limit conversation history', async () => {
      for (let i = 0; i < 15; i++) {
        await bridge.processQuery(`message ${i}`)
      }
      // History should be trimmed to 20 entries (user + assistant pairs)
      expect(bridge.getHistory().length).toBeLessThanOrEqual(20)
    })
  })
})
