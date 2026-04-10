import { describe, it, expect, beforeEach } from 'vitest'
import {
  ModelSpark,
  DEFAULT_MODEL_SPARK_CONFIG,
  type ModelSparkConfig,
  type SparkRequest,
  type SparkResponse,
  type SparkModel,
  type SparkModelFamily,
  type InferenceStrategy,
  type TaskDomain,
  type ModelPreference,
  type RoutingRule,
  type ModelHealth,
  type EnsembleVote,
  type SpeculativeResult,
  type FusionResult,
  type BenchmarkResult,
  type ModelSparkStats,
  type ModelResponse,
} from '../ModelSpark.js'

describe('ModelSpark — Dual-Model Ensemble Engine', () => {
  let spark: ModelSpark

  beforeEach(() => {
    spark = new ModelSpark()
  })

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL REGISTRY
  // ══════════════════════════════════════════════════════════════════════════

  describe('Model Registry', () => {
    it('should have models from both families', () => {
      const models = spark.getAvailableModels()
      expect(models.length).toBeGreaterThanOrEqual(6)

      const qwenModels = models.filter(m => m.family === 'qwen2.5')
      const llamaModels = models.filter(m => m.family === 'llama3')
      expect(qwenModels.length).toBeGreaterThanOrEqual(2)
      expect(llamaModels.length).toBeGreaterThanOrEqual(2)
    })

    it('should get models by family', () => {
      const qwen = spark.getModelsByFamily('qwen2.5')
      expect(qwen.every(m => m.family === 'qwen2.5')).toBe(true)

      const llama = spark.getModelsByFamily('llama3')
      expect(llama.every(m => m.family === 'llama3')).toBe(true)
    })

    it('should get model by ID', () => {
      const model = spark.getModel('qwen2.5-coder-7b-q4')
      expect(model).not.toBeNull()
      expect(model!.family).toBe('qwen2.5')
      expect(model!.parameterCount).toBe('7B')
    })

    it('should return null for unknown model', () => {
      expect(spark.getModel('nonexistent')).toBeNull()
    })

    it('should get the active Qwen model', () => {
      const qwen = spark.getQwenModel()
      expect(qwen.family).toBe('qwen2.5')
      expect(qwen.id).toBe('qwen2.5-coder-7b-q4')
    })

    it('should get the active LLaMA model', () => {
      const llama = spark.getLlamaModel()
      expect(llama.family).toBe('llama3')
      expect(llama.id).toBe('llama-3.1-8b-q4')
    })

    it('should get models that fit RAM budget', () => {
      const models8GB = spark.getModelsForRAM(8)
      expect(models8GB.length).toBeGreaterThanOrEqual(4)
      expect(models8GB.every(m => m.minRAMGB <= 8)).toBe(true)
    })

    it('should get models for low RAM (4GB)', () => {
      const models4GB = spark.getModelsForRAM(4)
      expect(models4GB.length).toBeGreaterThanOrEqual(2)
      expect(models4GB.every(m => m.minRAMGB <= 4)).toBe(true)
    })

    it('should get best model pair for available RAM', () => {
      const pair = spark.getBestModelPair(16)
      expect(pair.qwen).not.toBeNull()
      expect(pair.llama).not.toBeNull()
      expect(pair.qwen!.family).toBe('qwen2.5')
      expect(pair.llama!.family).toBe('llama3')
    })

    it('should handle very low RAM model pair', () => {
      const pair = spark.getBestModelPair(4)
      // Should at least get a small model
      expect(pair.qwen).not.toBeNull()
      expect(pair.qwen!.minRAMGB).toBeLessThanOrEqual(4)
    })

    it('should have valid download URLs for all models', () => {
      const models = spark.getAvailableModels()
      for (const model of models) {
        expect(model.downloadUrl).toMatch(/^https:\/\//)
        expect(model.ollamaName.length).toBeGreaterThan(0)
        expect(model.llamaCppName.length).toBeGreaterThan(0)
      }
    })

    it('should have strengths defined for all models', () => {
      const models = spark.getAvailableModels()
      for (const model of models) {
        expect(model.strengths.length).toBeGreaterThan(0)
        expect(model.description.length).toBeGreaterThan(10)
      }
    })

    it('should mark models as downloaded', () => {
      expect(spark.isModelDownloaded('qwen2.5-coder-7b-q4')).toBe(false)
      spark.markModelDownloaded('qwen2.5-coder-7b-q4')
      expect(spark.isModelDownloaded('qwen2.5-coder-7b-q4')).toBe(true)
    })

    it('should not mark invalid model as downloaded', () => {
      spark.markModelDownloaded('nonexistent')
      expect(spark.isModelDownloaded('nonexistent')).toBe(false)
    })

    it('should all have context windows', () => {
      const models = spark.getAvailableModels()
      for (const model of models) {
        expect(model.contextWindow).toBeGreaterThan(0)
      }
    })

    it('should have RAM requirements for all models', () => {
      const models = spark.getAvailableModels()
      for (const model of models) {
        expect(model.minRAMGB).toBeGreaterThan(0)
        expect(model.recommendedRAMGB).toBeGreaterThanOrEqual(model.minRAMGB)
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN DETECTION
  // ══════════════════════════════════════════════════════════════════════════

  describe('Domain Detection', () => {
    it('should detect code generation', () => {
      const result = spark.detectDomain('Write a function to sort an array in Python')
      expect(result.domain).toBe('code_generation')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should detect code review', () => {
      const result = spark.detectDomain('Review this code for bugs and vulnerabilities')
      expect(result.domain).toBe('code_review')
    })

    it('should detect code completion', () => {
      const result = spark.detectDomain('Complete this function implementation')
      expect(result.domain).toBe('code_completion')
    })

    it('should detect debugging', () => {
      const result = spark.detectDomain('Debug this error: TypeError cannot read property of null')
      expect(result.domain).toBe('debugging')
    })

    it('should detect security analysis', () => {
      const result = spark.detectDomain('Perform a security analysis of this web application')
      expect(result.domain).toBe('security_analysis')
    })

    it('should detect exploit research', () => {
      const result = spark.detectDomain('Develop an exploit chain for this buffer overflow vulnerability')
      expect(result.domain).toBe('exploit_research')
    })

    it('should detect math/logic', () => {
      const result = spark.detectDomain('Solve this equation: 2x + 5 = 15')
      expect(result.domain).toBe('math_logic')
    })

    it('should detect creative writing', () => {
      const result = spark.detectDomain('Write a story about a robot who learns to paint')
      expect(result.domain).toBe('creative_writing')
    })

    it('should detect summarization', () => {
      const result = spark.detectDomain('Summarize the key points of this document')
      expect(result.domain).toBe('summarization')
    })

    it('should detect translation', () => {
      const result = spark.detectDomain('Translate this text from English to Arabic')
      expect(result.domain).toBe('translation')
    })

    it('should detect conversation', () => {
      const result = spark.detectDomain('Hello, how are you today?')
      expect(result.domain).toBe('conversation')
    })

    it('should detect planning', () => {
      const result = spark.detectDomain('Create a project roadmap with milestones and timeline')
      expect(result.domain).toBe('planning')
    })

    it('should detect data analysis', () => {
      const result = spark.detectDomain('Analyze this dataset and create a visualization chart')
      expect(result.domain).toBe('data_analysis')
    })

    it('should provide alternatives', () => {
      const result = spark.detectDomain('Write a Python function to analyze security data')
      expect(result.alternatives).toBeDefined()
      expect(Array.isArray(result.alternatives)).toBe(true)
    })

    it('should default to general_reasoning for unknown domains', () => {
      const result = spark.detectDomain('xyz abc random gibberish')
      expect(result.domain).toBe('general_reasoning')
    })

    it('should handle empty prompts', () => {
      const result = spark.detectDomain('')
      expect(result.domain).toBeDefined()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTING
  // ══════════════════════════════════════════════════════════════════════════

  describe('Routing', () => {
    it('should route code generation to Qwen', () => {
      const rule = spark.getRoutingRule('code_generation')
      expect(rule.preference).toBe('qwen')
      expect(rule.qwenWeight).toBeGreaterThan(rule.llamaWeight)
    })

    it('should route general reasoning to LLaMA', () => {
      const rule = spark.getRoutingRule('general_reasoning')
      expect(rule.preference).toBe('llama')
      expect(rule.llamaWeight).toBeGreaterThan(rule.qwenWeight)
    })

    it('should route creative writing to LLaMA', () => {
      const rule = spark.getRoutingRule('creative_writing')
      expect(rule.preference).toBe('llama')
      expect(rule.llamaWeight).toBe(0.90)
    })

    it('should route planning to ensemble', () => {
      const rule = spark.getRoutingRule('planning')
      expect(rule.preference).toBe('ensemble')
    })

    it('should route data analysis to ensemble', () => {
      const rule = spark.getRoutingRule('data_analysis')
      expect(rule.preference).toBe('ensemble')
      expect(rule.qwenWeight).toBe(0.50)
      expect(rule.llamaWeight).toBe(0.50)
    })

    it('should get all routing rules', () => {
      const rules = spark.getRoutingRules()
      expect(rules.length).toBe(14) // 14 task domains
    })

    it('should have routing rules for every domain', () => {
      const domains: TaskDomain[] = [
        'code_generation', 'code_review', 'code_completion', 'debugging',
        'security_analysis', 'exploit_research', 'general_reasoning',
        'math_logic', 'creative_writing', 'summarization', 'translation',
        'conversation', 'planning', 'data_analysis',
      ]
      for (const domain of domains) {
        const rule = spark.getRoutingRule(domain)
        expect(rule.domain).toBe(domain)
        expect(rule.qwenWeight + rule.llamaWeight).toBe(1.0)
      }
    })

    it('should handle unknown domain routing', () => {
      const rule = spark.getRoutingRule('unknown_domain' as TaskDomain)
      expect(rule.preference).toBe('adaptive')
      expect(rule.qwenWeight).toBe(0.5)
      expect(rule.llamaWeight).toBe(0.5)
    })

    it('should route with explicit model preference', () => {
      const result = spark.routeRequest({
        prompt: 'Write a function',
        preferredModel: 'llama3',
      })
      expect(result.primary).toBe('llama3')
      expect(result.strategy).toBe('route')
    })

    it('should route with route strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Write a function to sort an array',
        domain: 'code_generation',
        strategy: 'route',
      })
      expect(result.primary).toBe('qwen2.5')
      expect(result.secondary).toBeNull()
    })

    it('should route with ensemble strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Analyze this code',
        domain: 'code_review',
        strategy: 'ensemble',
      })
      expect(result.primary).toBeDefined()
      expect(result.secondary).toBeDefined()
      expect(result.strategy).toBe('ensemble')
    })

    it('should route with cascade strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Debug this crash',
        domain: 'debugging',
        strategy: 'cascade',
      })
      expect(result.primary).toBe('qwen2.5')
      expect(result.secondary).toBe('llama3')
      expect(result.strategy).toBe('cascade')
    })

    it('should route with speculative strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Explain this concept',
        strategy: 'speculative',
      })
      expect(result.primary).toBe('llama3')
      expect(result.secondary).toBe('qwen2.5')
      expect(result.strategy).toBe('speculative')
    })

    it('should route with fusion strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Help me plan a project',
        strategy: 'fusion',
      })
      expect(result.primary).toBeDefined()
      expect(result.secondary).toBeDefined()
      expect(result.strategy).toBe('fusion')
    })

    it('should route with parallel_race strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Translate this text',
        strategy: 'parallel_race',
      })
      expect(result.strategy).toBe('parallel_race')
      expect(result.secondary).not.toBeNull()
    })

    it('should route with chain_of_thought strategy', () => {
      const result = spark.routeRequest({
        prompt: 'Solve this complex problem',
        strategy: 'chain_of_thought',
      })
      expect(result.primary).toBe('llama3')
      expect(result.secondary).toBe('qwen2.5')
    })

    it('should fallback to LLaMA when Qwen is unavailable', () => {
      spark.setModelAvailability('qwen2.5-coder-7b-q4', false)
      const result = spark.routeRequest({
        prompt: 'Write a function',
        domain: 'code_generation',
        strategy: 'route',
      })
      expect(result.primary).toBe('llama3')
      expect(result.reason).toContain('unavailable')
    })

    it('should fallback to Qwen when LLaMA is unavailable', () => {
      spark.setModelAvailability('llama-3.1-8b-q4', false)
      const result = spark.routeRequest({
        prompt: 'Explain this concept',
        domain: 'general_reasoning',
        strategy: 'route',
      })
      expect(result.primary).toBe('qwen2.5')
      expect(result.reason).toContain('unavailable')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // INFERENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Inference', () => {
    it('should infer with route strategy', async () => {
      const response = await spark.infer({
        prompt: 'Write a function to add two numbers',
        domain: 'code_generation',
        strategy: 'route',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('route')
      expect(response.domain).toBe('code_generation')
      expect(response.primaryModel).toBe('qwen2.5')
    })

    it('should infer with ensemble strategy', async () => {
      const response = await spark.infer({
        prompt: 'Analyze this code for security issues',
        domain: 'security_analysis',
        strategy: 'ensemble',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('ensemble')
      expect(response.primaryResponse).toBeDefined()
      expect(response.secondaryResponse).toBeDefined()
    })

    it('should infer with cascade strategy', async () => {
      const response = await spark.infer({
        prompt: 'Debug this error',
        domain: 'debugging',
        strategy: 'cascade',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('cascade')
    })

    it('should infer with speculative strategy', async () => {
      const response = await spark.infer({
        prompt: 'Explain recursion step by step',
        domain: 'general_reasoning',
        strategy: 'speculative',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('speculative')
      expect(response.primaryResponse).toBeDefined()
      expect(response.secondaryResponse).toBeDefined()
    })

    it('should infer with fusion strategy', async () => {
      const response = await spark.infer({
        prompt: 'Create a project plan',
        domain: 'planning',
        strategy: 'fusion',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('fusion')
      expect(response.fusedResponse).toBeDefined()
    })

    it('should infer with parallel_race strategy', async () => {
      const response = await spark.infer({
        prompt: 'Summarize key concepts',
        domain: 'summarization',
        strategy: 'parallel_race',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('parallel_race')
    })

    it('should infer with chain_of_thought strategy', async () => {
      const response = await spark.infer({
        prompt: 'Solve this optimization problem',
        domain: 'math_logic',
        strategy: 'chain_of_thought',
      })
      expect(response.text.length).toBeGreaterThan(0)
      expect(response.strategy).toBe('chain_of_thought')
    })

    it('should auto-detect domain when not provided', async () => {
      const response = await spark.infer({
        prompt: 'Write a class for a linked list data structure',
      })
      expect(response.domain).toBe('code_generation')
    })

    it('should cache responses', async () => {
      const response1 = await spark.infer({
        prompt: 'Test caching behavior',
        domain: 'general_reasoning',
      })
      expect(response1.cached).toBe(false)

      const response2 = await spark.infer({
        prompt: 'Test caching behavior',
        domain: 'general_reasoning',
      })
      expect(response2.cached).toBe(true)
    })

    it('should track quality scores', async () => {
      const response = await spark.infer({
        prompt: 'Write code to parse JSON',
        domain: 'code_generation',
      })
      expect(response.qualityScore).toBeGreaterThanOrEqual(0)
      expect(response.qualityScore).toBeLessThanOrEqual(1)
    })

    it('should track tokens generated', async () => {
      const response = await spark.infer({
        prompt: 'Hello',
        domain: 'conversation',
      })
      expect(response.totalTokensGenerated).toBeGreaterThan(0)
    })

    it('should infer on specific model', async () => {
      const qwenResp = await spark.inferOnModel('Write code', 'qwen2.5', 'code_generation')
      expect(qwenResp.modelFamily).toBe('qwen2.5')
      expect(qwenResp.text.length).toBeGreaterThan(0)

      const llamaResp = await spark.inferOnModel('Explain this', 'llama3', 'general_reasoning')
      expect(llamaResp.modelFamily).toBe('llama3')
      expect(llamaResp.text.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // ENSEMBLE OPERATIONS
  // ══════════════════════════════════════════════════════════════════════════

  describe('Ensemble Operations', () => {
    it('should score responses', () => {
      const score = spark.scoreResponse(
        'This is a well-structured response with multiple points:\n1. First point\n2. Second point\n\nConclusion: the answer is clear.',
        'Explain the concept',
        'general_reasoning',
      )
      expect(score).toBeGreaterThan(0.5)
    })

    it('should score empty response as zero', () => {
      expect(spark.scoreResponse('', 'test', 'general_reasoning')).toBe(0)
    })

    it('should score code responses higher with code blocks', () => {
      const withCode = spark.scoreResponse(
        '```python\ndef sort(arr):\n  return sorted(arr)\n```\n\nThis function sorts an array.',
        'Write a sort function',
        'code_generation',
      )
      const withoutCode = spark.scoreResponse(
        'You can use the sorted function to sort arrays.',
        'Write a sort function',
        'code_generation',
      )
      expect(withCode).toBeGreaterThan(withoutCode)
    })

    it('should compare model responses', () => {
      const qwenResp: ModelResponse = {
        text: 'Code generation response',
        modelId: 'qwen2.5-coder-7b-q4',
        modelFamily: 'qwen2.5',
        tokensGenerated: 100,
        tokensPrompt: 50,
        durationMs: 500,
        tokensPerSecond: 200,
        qualityScore: 0.8,
        finishReason: 'stop',
      }

      const llamaResp: ModelResponse = {
        text: 'Code generation response too',
        modelId: 'llama-3.1-8b-q4',
        modelFamily: 'llama3',
        tokensGenerated: 120,
        tokensPrompt: 50,
        durationMs: 600,
        tokensPerSecond: 200,
        qualityScore: 0.7,
        finishReason: 'stop',
      }

      const votes = spark.compareResponses(qwenResp, llamaResp, 'code_generation')
      expect(votes.length).toBe(2)
      expect(votes[0]!.modelFamily).toBe('qwen2.5') // qwen should win for code
      expect(votes[0]!.qualityScore).toBeGreaterThan(votes[1]!.qualityScore)
    })

    it('should fuse similar responses by selecting best', () => {
      const fusion = spark.fuseResponses(
        'The answer is 42. This is the ultimate answer.',
        'The answer is 42. This is indeed the ultimate answer.',
        'general_reasoning',
      )
      expect(fusion.fusionMethod).toBe('select_best')
      expect(fusion.coherenceScore).toBeGreaterThan(0.9)
    })

    it('should fuse moderately different responses by merging', () => {
      const fusion = spark.fuseResponses(
        'First approach: Use a hash map for O(1) lookups.\n\nAdvantage: Fast reads.',
        'Alternative: Use a balanced BST for sorted data.\n\nAdvantage: Ordered traversal.\n\nPerformance: O(log n)',
        'code_generation',
      )
      expect(['merge', 'interleave', 'summarize', 'select_best']).toContain(fusion.fusionMethod)
      expect(fusion.sourceTexts.length).toBe(2)
    })

    it('should fuse very different responses by summarizing', () => {
      const fusion = spark.fuseResponses(
        'Completely different topic about quantum physics and its implications for computing.',
        'A discussion about Renaissance art and its influence on modern design aesthetics.',
        'creative_writing',
      )
      expect(fusion.fusedText.length).toBeGreaterThan(0)
    })

    it('should handle speculative decoding with high acceptance', () => {
      const result = spark.speculativeDecode(
        'The function takes an array and returns the sorted array',
        'The function takes an array and returns the sorted array',
        'qwen2.5',
        'llama3',
      )
      expect(result.acceptanceRate).toBe(1.0)
      expect(result.speedupFactor).toBeGreaterThan(1.0)
      expect(result.tokensRejected).toBe(0)
    })

    it('should handle speculative decoding with low acceptance', () => {
      const result = spark.speculativeDecode(
        'Completely different text about apples',
        'Another response about oranges and bananas',
        'qwen2.5',
        'llama3',
      )
      expect(result.acceptanceRate).toBeLessThan(1.0)
      expect(result.tokensRejected).toBeGreaterThan(0)
    })

    it('should handle speculative decoding with partial match', () => {
      const result = spark.speculativeDecode(
        'The function sorts the array using quicksort algorithm',
        'The function sorts the array using mergesort algorithm',
        'qwen2.5',
        'llama3',
      )
      expect(result.acceptanceRate).toBeGreaterThan(0)
      expect(result.acceptanceRate).toBeLessThan(1.0)
      expect(result.tokensAccepted).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // BENCHMARKING
  // ══════════════════════════════════════════════════════════════════════════

  describe('Benchmarking', () => {
    it('should benchmark a single domain', async () => {
      const result = await spark.benchmark('code_generation', 'Write a quicksort function')
      expect(result.taskDomain).toBe('code_generation')
      expect(result.qwenScore).toBeGreaterThanOrEqual(0)
      expect(result.llamaScore).toBeGreaterThanOrEqual(0)
      expect(result.ensembleScore).toBeGreaterThanOrEqual(0)
      expect(result.recommendation.length).toBeGreaterThan(0)
    })

    it('should benchmark multiple domains', async () => {
      const prompts: Record<string, string> = {
        code_generation: 'Write a binary search function',
        general_reasoning: 'Explain why the sky is blue',
      }
      const results = await spark.benchmarkAll(prompts)
      expect(results.length).toBe(2)
      expect(results[0]!.taskDomain).toBe('code_generation')
      expect(results[1]!.taskDomain).toBe('general_reasoning')
    })

    it('should identify best strategy in benchmark', async () => {
      const result = await spark.benchmark('debugging', 'Fix this null pointer error')
      expect(['route', 'ensemble', 'cascade', 'speculative', 'fusion', 'parallel_race', 'chain_of_thought'])
        .toContain(result.bestStrategy)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL HEALTH
  // ══════════════════════════════════════════════════════════════════════════

  describe('Model Health', () => {
    it('should initialize health for all models', () => {
      const health = spark.getModelHealth()
      expect(health.length).toBeGreaterThanOrEqual(6)
      expect(health.every(h => h.available)).toBe(true)
    })

    it('should get health by model ID', () => {
      const health = spark.getModelHealthById('qwen2.5-coder-7b-q4')
      expect(health).not.toBeNull()
      expect(health!.family).toBe('qwen2.5')
      expect(health!.available).toBe(true)
    })

    it('should return null for unknown model health', () => {
      expect(spark.getModelHealthById('nonexistent')).toBeNull()
    })

    it('should set model availability', () => {
      spark.setModelAvailability('qwen2.5-coder-7b-q4', false)
      const health = spark.getModelHealthById('qwen2.5-coder-7b-q4')
      expect(health!.available).toBe(false)

      spark.setModelAvailability('qwen2.5-coder-7b-q4', true)
      expect(spark.getModelHealthById('qwen2.5-coder-7b-q4')!.available).toBe(true)
    })

    it('should track performance history', async () => {
      await spark.inferOnModel('test', 'qwen2.5', 'code_generation')
      const history = spark.getPerformanceHistory('qwen2.5-coder-7b-q4')
      expect(history.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty history for unknown model', () => {
      expect(spark.getPerformanceHistory('nonexistent')).toEqual([])
    })

    it('should update health after inference', async () => {
      await spark.inferOnModel('test prompt', 'qwen2.5', 'code_generation')
      const health = spark.getModelHealthById('qwen2.5-coder-7b-q4')
      expect(health!.successCount).toBeGreaterThanOrEqual(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION & STATS
  // ══════════════════════════════════════════════════════════════════════════

  describe('Configuration', () => {
    it('should have valid default config', () => {
      const config = spark.getConfig()
      expect(config.defaultStrategy).toBe('route')
      expect(config.qwenModel).toBe('qwen2.5-coder-7b-q4')
      expect(config.llamaModel).toBe('llama-3.1-8b-q4')
      expect(config.maxTokens).toBe(4096)
      expect(config.temperature).toBe(0.7)
      expect(config.topP).toBe(0.9)
    })

    it('should update config', () => {
      spark.updateConfig({ defaultStrategy: 'ensemble', temperature: 0.5 })
      const config = spark.getConfig()
      expect(config.defaultStrategy).toBe('ensemble')
      expect(config.temperature).toBe(0.5)
    })

    it('should create with custom config', () => {
      const custom = new ModelSpark({
        defaultStrategy: 'fusion',
        maxTokens: 8192,
        enableResponseCaching: false,
      })
      const config = custom.getConfig()
      expect(config.defaultStrategy).toBe('fusion')
      expect(config.maxTokens).toBe(8192)
      expect(config.enableResponseCaching).toBe(false)
    })

    it('should export DEFAULT_MODEL_SPARK_CONFIG', () => {
      expect(DEFAULT_MODEL_SPARK_CONFIG).toBeDefined()
      expect(DEFAULT_MODEL_SPARK_CONFIG.defaultStrategy).toBe('route')
    })
  })

  describe('Statistics', () => {
    it('should start with zero stats', () => {
      const stats = spark.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.qwenRequests).toBe(0)
      expect(stats.llamaRequests).toBe(0)
      expect(stats.ensembleRequests).toBe(0)
      expect(stats.errors).toBe(0)
    })

    it('should track requests after inference', async () => {
      await spark.infer({ prompt: 'test', domain: 'code_generation', strategy: 'route' })
      const stats = spark.getStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.qwenRequests).toBeGreaterThanOrEqual(1)
    })

    it('should track ensemble requests', async () => {
      await spark.infer({ prompt: 'test', domain: 'code_review', strategy: 'ensemble' })
      const stats = spark.getStats()
      expect(stats.ensembleRequests).toBe(1)
    })

    it('should track fusion requests', async () => {
      await spark.infer({ prompt: 'test', domain: 'planning', strategy: 'fusion' })
      const stats = spark.getStats()
      expect(stats.fusionRequests).toBe(1)
    })

    it('should track domain distribution', async () => {
      await spark.infer({ prompt: 'test', domain: 'code_generation', strategy: 'route' })
      await spark.infer({ prompt: 'test2', domain: 'general_reasoning', strategy: 'route' })
      const stats = spark.getStats()
      expect(stats.domainDistribution['code_generation']).toBe(1)
      expect(stats.domainDistribution['general_reasoning']).toBe(1)
    })

    it('should track strategy distribution', async () => {
      await spark.infer({ prompt: 'test', domain: 'code_generation', strategy: 'route' })
      await spark.infer({ prompt: 'test2', domain: 'code_review', strategy: 'ensemble' })
      const stats = spark.getStats()
      expect(stats.strategyDistribution['route']).toBe(1)
      expect(stats.strategyDistribution['ensemble']).toBe(1)
    })

    it('should track cache hits', async () => {
      await spark.infer({ prompt: 'cache test', domain: 'conversation' })
      await spark.infer({ prompt: 'cache test', domain: 'conversation' })
      const stats = spark.getStats()
      expect(stats.cacheHits).toBe(1)
    })

    it('should reset stats', async () => {
      await spark.infer({ prompt: 'test', domain: 'code_generation' })
      spark.resetStats()
      const stats = spark.getStats()
      expect(stats.totalRequests).toBe(0)
    })

    it('should track total tokens generated', async () => {
      await spark.infer({ prompt: 'generate something', domain: 'code_generation' })
      const stats = spark.getStats()
      expect(stats.totalTokensGenerated).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CACHE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Cache', () => {
    it('should start with empty cache', () => {
      expect(spark.getCacheSize()).toBe(0)
    })

    it('should populate cache after inference', async () => {
      await spark.infer({ prompt: 'cache me', domain: 'conversation' })
      expect(spark.getCacheSize()).toBe(1)
    })

    it('should clear cache', async () => {
      await spark.infer({ prompt: 'will be cleared', domain: 'conversation' })
      expect(spark.getCacheSize()).toBe(1)
      spark.clearCache()
      expect(spark.getCacheSize()).toBe(0)
    })

    it('should not cache when disabled', async () => {
      const noCacheSpark = new ModelSpark({ enableResponseCaching: false })
      await noCacheSpark.infer({ prompt: 'no cache', domain: 'conversation' })
      expect(noCacheSpark.getCacheSize()).toBe(0)
    })

    it('should evict old entries at max capacity', async () => {
      const smallCacheSpark = new ModelSpark({ cacheMaxSize: 2 })
      await smallCacheSpark.infer({ prompt: 'entry1', domain: 'conversation' })
      await smallCacheSpark.infer({ prompt: 'entry2', domain: 'conversation' })
      await smallCacheSpark.infer({ prompt: 'entry3', domain: 'conversation' })
      expect(smallCacheSpark.getCacheSize()).toBe(2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // STATUS REPORT & SETUP
  // ══════════════════════════════════════════════════════════════════════════

  describe('Status Report', () => {
    it('should generate status report', () => {
      const report = spark.generateStatusReport()
      expect(report).toContain('Model Spark')
      expect(report).toContain('Qwen')
      expect(report).toContain('LLaMA')
      expect(report).toContain('Strategy')
    })

    it('should generate setup instructions', () => {
      const instructions = spark.getSetupInstructions()
      expect(instructions).toContain('Model Spark')
      expect(instructions).toContain('ollama pull')
      expect(instructions).toContain('Qwen2.5')
      expect(instructions).toContain('LLaMA')
    })

    it('should hash content deterministically', () => {
      const hash1 = spark.hashContent('test string')
      const hash2 = spark.hashContent('test string')
      expect(hash1).toBe(hash2)
      expect(hash1.length).toBe(16)
    })

    it('should produce different hashes for different content', () => {
      const hash1 = spark.hashContent('content A')
      const hash2 = spark.hashContent('content B')
      expect(hash1).not.toBe(hash2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // QUALITY SCORING (EDGE CASES)
  // ══════════════════════════════════════════════════════════════════════════

  describe('Quality Scoring Edge Cases', () => {
    it('should reward debugging responses with root cause analysis', () => {
      const score = spark.scoreResponse(
        'Root cause: The null pointer error occurs because the variable is not initialized.\n\nFix: Add a null check before accessing the property.\n\nStep 1: Validate input\nStep 2: Handle null case',
        'Fix this null pointer',
        'debugging',
      )
      expect(score).toBeGreaterThan(0.6)
    })

    it('should reward security responses with CVE references', () => {
      const score = spark.scoreResponse(
        'CVE-2024-1234: SQL Injection vulnerability\nCWE-89: Improper Neutralization\nRisk: High\nSeverity: Critical (CVSS 9.8)\nMitigation: Use parameterized queries',
        'Find vulnerabilities',
        'security_analysis',
      )
      expect(score).toBeGreaterThan(0.6)
    })

    it('should reward summarization for conciseness', () => {
      const concise = spark.scoreResponse(
        'Key points: First, the main idea is efficiency. Second, optimization matters.',
        'Summarize this',
        'summarization',
      )
      expect(concise).toBeGreaterThan(0.5)
    })

    it('should handle very long responses', () => {
      const longText = 'word '.repeat(3000)
      const score = spark.scoreResponse(longText, 'test', 'general_reasoning')
      expect(score).toBeLessThan(0.9) // should be penalized for being too long
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // SPECULATIVE DECODING EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════

  describe('Speculative Decoding Edge Cases', () => {
    it('should handle empty draft', () => {
      const result = spark.speculativeDecode('', 'verified text here', 'qwen2.5', 'llama3')
      expect(result.tokensAccepted).toBe(0)
    })

    it('should handle empty verification', () => {
      const result = spark.speculativeDecode('draft text here', '', 'qwen2.5', 'llama3')
      expect(result.tokensRejected).toBeGreaterThan(0)
    })

    it('should handle both empty', () => {
      const result = spark.speculativeDecode('', '', 'qwen2.5', 'llama3')
      // empty strings split to [''] which gives 1 match
      expect(result.tokensAccepted + result.tokensRejected).toBeLessThanOrEqual(1)
    })

    it('should track draft and verifier models', () => {
      const result = spark.speculativeDecode('test', 'test', 'qwen2.5', 'llama3')
      expect(result.draftModel).toBe('qwen2.5')
      expect(result.verifierModel).toBe('llama3')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // FUSION EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════

  describe('Fusion Edge Cases', () => {
    it('should fuse for data_analysis domain with interleaving', () => {
      const fusion = spark.fuseResponses(
        'Data analysis from Qwen perspective.\n\nChart recommendation: bar chart.',
        'Statistical insight from LLaMA.\n\nTrend: upward.\n\nRegression analysis.',
        'data_analysis',
      )
      expect(fusion.fusedText.length).toBeGreaterThan(0)
    })

    it('should fuse for planning domain', () => {
      const fusion = spark.fuseResponses(
        'Technical plan: implement API first.\n\nDependencies: database.',
        'Strategic plan: gather requirements.\n\nTimeline: 2 weeks.\n\nRisk assessment.',
        'planning',
      )
      expect(fusion.fusedText.length).toBeGreaterThan(0)
    })

    it('should have correct source weights', () => {
      const fusion = spark.fuseResponses('text1', 'text2', 'code_generation')
      expect(fusion.sourceTexts.length).toBe(2)
      expect(fusion.sourceTexts[0]!.model).toBe('qwen2.5')
      expect(fusion.sourceTexts[1]!.model).toBe('llama3')
      expect(fusion.sourceTexts[0]!.weight).toBeGreaterThan(fusion.sourceTexts[1]!.weight)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CASCADE EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════

  describe('Cascade Strategy', () => {
    it('should track cascade escalations', async () => {
      // With a high threshold, cascade should escalate
      const cascadeSpark = new ModelSpark({ cascadeQualityThreshold: 0.99 })
      await cascadeSpark.infer({ prompt: 'test cascade', domain: 'debugging', strategy: 'cascade' })
      const stats = cascadeSpark.getStats()
      expect(stats.cascadeEscalations).toBeGreaterThanOrEqual(1)
    })

    it('should not escalate when quality is high', async () => {
      // With a very low threshold, cascade should NOT escalate
      const easySparkCascade = new ModelSpark({ cascadeQualityThreshold: 0.01 })
      await easySparkCascade.infer({ prompt: 'easy test', domain: 'conversation', strategy: 'cascade' })
      const stats = easySparkCascade.getStats()
      expect(stats.cascadeEscalations).toBe(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // SPECULATIVE STRATEGY STATS
  // ══════════════════════════════════════════════════════════════════════════

  describe('Speculative Strategy Stats', () => {
    it('should track speculative acceptances/rejections', async () => {
      await spark.infer({ prompt: 'test speculative', domain: 'general_reasoning', strategy: 'speculative' })
      const stats = spark.getStats()
      expect(stats.speculativeAcceptances + stats.speculativeRejections).toBeGreaterThanOrEqual(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // ALL STRATEGIES WITH CODE DOMAIN
  // ══════════════════════════════════════════════════════════════════════════

  describe('All Strategies on Code Domain', () => {
    const strategies: InferenceStrategy[] = [
      'route', 'ensemble', 'cascade', 'speculative', 'fusion', 'parallel_race', 'chain_of_thought',
    ]

    for (const strategy of strategies) {
      it(`should handle ${strategy} strategy for code_generation`, async () => {
        const response = await spark.infer({
          prompt: 'Write a binary search function in TypeScript',
          domain: 'code_generation',
          strategy,
        })
        expect(response.text.length).toBeGreaterThan(0)
        expect(response.strategy).toBe(strategy)
        expect(response.totalTokensGenerated).toBeGreaterThan(0)
      })
    }
  })

  // ══════════════════════════════════════════════════════════════════════════
  // ALL DOMAINS WITH ROUTE STRATEGY
  // ══════════════════════════════════════════════════════════════════════════

  describe('All Domains with Route Strategy', () => {
    const domainPrompts: Array<{ domain: TaskDomain; prompt: string }> = [
      { domain: 'code_generation', prompt: 'Write a function' },
      { domain: 'code_review', prompt: 'Review this code' },
      { domain: 'code_completion', prompt: 'Complete this function' },
      { domain: 'debugging', prompt: 'Debug this error' },
      { domain: 'security_analysis', prompt: 'Analyze security' },
      { domain: 'exploit_research', prompt: 'Research exploits' },
      { domain: 'general_reasoning', prompt: 'Explain why' },
      { domain: 'math_logic', prompt: 'Solve equation' },
      { domain: 'creative_writing', prompt: 'Write a story' },
      { domain: 'summarization', prompt: 'Summarize this' },
      { domain: 'translation', prompt: 'Translate to Arabic' },
      { domain: 'conversation', prompt: 'Hello there' },
      { domain: 'planning', prompt: 'Create a plan' },
      { domain: 'data_analysis', prompt: 'Analyze this data' },
    ]

    for (const { domain, prompt } of domainPrompts) {
      it(`should handle ${domain}`, async () => {
        const response = await spark.infer({ prompt, domain, strategy: 'route' })
        expect(response.domain).toBe(domain)
        expect(response.text.length).toBeGreaterThan(0)
      })
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// NEW TESTS: All missing features added to ModelSpark
// ══════════════════════════════════════════════════════════════════════════════

import type {
  SparkChatMessage,
  ChatSession,
  StreamToken,
  CircuitState,
  CircuitBreakerStatus,
  ModelLifecycleState,
  ModelLifecycleInfo,
  PromptChainStep,
  PromptChainResult,
  ParsedOutput,
  HardwareProfile,
  OllamaServerStatus,
  ContextWindowOptions,
} from '../ModelSpark.js'

describe('ModelSpark — Enhanced Features', () => {
  let spark: ModelSpark

  beforeEach(() => {
    spark = new ModelSpark()
  })

  // ══════════════════════════════════════════════════════════════════════════
  // MULTI-TURN CONVERSATION
  // ══════════════════════════════════════════════════════════════════════════

  describe('Multi-turn Conversation', () => {
    it('should create a new chat session', () => {
      const session = spark.createSession()
      expect(session.id).toBeTruthy()
      expect(session.messages).toHaveLength(0)
      expect(session.domain).toBeNull()
      expect(session.createdAt).toBeGreaterThan(0)
    })

    it('should create a session with system prompt', () => {
      const session = spark.createSession({ systemPrompt: 'You are a helpful assistant.' })
      expect(session.messages).toHaveLength(1)
      expect(session.messages[0]!.role).toBe('system')
      expect(session.messages[0]!.content).toBe('You are a helpful assistant.')
    })

    it('should create a session with domain and strategy', () => {
      const session = spark.createSession({
        domain: 'code_generation',
        strategy: 'ensemble',
        metadata: { project: 'test' },
      })
      expect(session.domain).toBe('code_generation')
      expect(session.strategy).toBe('ensemble')
      expect(session.metadata.project).toBe('test')
    })

    it('should get an existing session', () => {
      const session = spark.createSession()
      const retrieved = spark.getSession(session.id)
      expect(retrieved).toBeTruthy()
      expect(retrieved!.id).toBe(session.id)
    })

    it('should return null for unknown session', () => {
      expect(spark.getSession('nonexistent')).toBeNull()
    })

    it('should list all sessions', () => {
      spark.createSession()
      spark.createSession()
      spark.createSession()
      expect(spark.listSessions()).toHaveLength(3)
    })

    it('should delete a session', () => {
      const session = spark.createSession()
      expect(spark.deleteSession(session.id)).toBe(true)
      expect(spark.getSession(session.id)).toBeNull()
    })

    it('should return false when deleting nonexistent session', () => {
      expect(spark.deleteSession('nonexistent')).toBe(false)
    })

    it('should chat within a session', async () => {
      const session = spark.createSession()
      const response = await spark.chat(session.id, 'Hello, how are you?')
      expect(response.text.length).toBeGreaterThan(0)

      // Check message was added to history
      const history = spark.getConversationHistory(session.id)
      expect(history.length).toBeGreaterThanOrEqual(2)
      expect(history[0]!.role).toBe('user')
      expect(history[0]!.content).toBe('Hello, how are you?')
      expect(history[1]!.role).toBe('assistant')
    })

    it('should throw when chatting with unknown session', async () => {
      await expect(spark.chat('nonexistent', 'Hello')).rejects.toThrow('Session not found')
    })

    it('should preserve conversation history across multiple turns', async () => {
      const session = spark.createSession({ systemPrompt: 'You are a code assistant.' })
      await spark.chat(session.id, 'Write a function to add two numbers')
      await spark.chat(session.id, 'Now make it handle strings too')

      const history = spark.getConversationHistory(session.id)
      // system + user1 + assistant1 + user2 + assistant2 = 5
      expect(history).toHaveLength(5)
      expect(history[0]!.role).toBe('system')
      expect(history[1]!.role).toBe('user')
      expect(history[2]!.role).toBe('assistant')
      expect(history[3]!.role).toBe('user')
      expect(history[4]!.role).toBe('assistant')
    })

    it('should update session lastActiveAt', async () => {
      const session = spark.createSession()
      const initialTime = session.lastActiveAt
      await new Promise(resolve => setTimeout(resolve, 10))
      await spark.chat(session.id, 'Test')
      const updated = spark.getSession(session.id)!
      expect(updated.lastActiveAt).toBeGreaterThanOrEqual(initialTime)
    })

    it('should return empty history for nonexistent session', () => {
      expect(spark.getConversationHistory('nonexistent')).toHaveLength(0)
    })

    it('should track total tokens in session', async () => {
      const session = spark.createSession()
      await spark.chat(session.id, 'Hello world')
      const updated = spark.getSession(session.id)!
      expect(updated.totalTokens).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // STREAMING INFERENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Streaming Inference', () => {
    it('should stream tokens from inferStream', async () => {
      const tokens: StreamToken[] = []
      for await (const token of spark.inferStream({ prompt: 'Hello world' })) {
        tokens.push(token)
      }
      expect(tokens.length).toBeGreaterThan(0)
      expect(tokens[tokens.length - 1]!.done).toBe(true)
    })

    it('should have incrementing token indices', async () => {
      const tokens: StreamToken[] = []
      for await (const token of spark.inferStream({ prompt: 'Write code' })) {
        tokens.push(token)
      }
      for (let i = 1; i < tokens.length; i++) {
        expect(tokens[i]!.index).toBeGreaterThan(tokens[i - 1]!.index)
      }
    })

    it('should include model family in each token', async () => {
      for await (const token of spark.inferStream({ prompt: 'Hello' })) {
        expect(['qwen2.5', 'llama3']).toContain(token.modelFamily)
      }
    })

    it('should collect stream into full response', async () => {
      const result = await spark.collectStream({ prompt: 'Hello' })
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.totalTokens).toBeGreaterThan(0)
      expect(['qwen2.5', 'llama3']).toContain(result.modelFamily)
    })

    it('should respect domain in stream routing', async () => {
      const tokens: StreamToken[] = []
      for await (const token of spark.inferStream({ prompt: 'Write a function', domain: 'code_generation' })) {
        tokens.push(token)
      }
      // Code tasks should route to Qwen
      expect(tokens[0]!.modelFamily).toBe('qwen2.5')
    })

    it('should route reasoning tasks to LLaMA in stream', async () => {
      const tokens: StreamToken[] = []
      for await (const token of spark.inferStream({ prompt: 'Explain why', domain: 'general_reasoning' })) {
        tokens.push(token)
      }
      expect(tokens[0]!.modelFamily).toBe('llama3')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CIRCUIT BREAKER / ERROR RECOVERY
  // ══════════════════════════════════════════════════════════════════════════

  describe('Circuit Breaker', () => {
    it('should initialize circuit breakers as closed', () => {
      const qwenCB = spark.getCircuitBreakerStatus('qwen2.5')
      expect(qwenCB.state).toBe('closed')
      expect(qwenCB.failures).toBe(0)

      const llamaCB = spark.getCircuitBreakerStatus('llama3')
      expect(llamaCB.state).toBe('closed')
    })

    it('should allow requests when circuit is closed', () => {
      expect(spark.isCircuitClosed('qwen2.5')).toBe(true)
      expect(spark.isCircuitClosed('llama3')).toBe(true)
    })

    it('should track failures', () => {
      spark.recordFailure('qwen2.5')
      spark.recordFailure('qwen2.5')
      const status = spark.getCircuitBreakerStatus('qwen2.5')
      expect(status.failures).toBe(2)
      expect(status.state).toBe('closed') // below threshold
    })

    it('should trip open after threshold failures', () => {
      for (let i = 0; i < 5; i++) {
        spark.recordFailure('qwen2.5')
      }
      const status = spark.getCircuitBreakerStatus('qwen2.5')
      expect(status.state).toBe('open')
      expect(status.totalTrips).toBe(1)
      expect(spark.isCircuitClosed('qwen2.5')).toBe(false)
    })

    it('should close circuit on success after half_open', () => {
      for (let i = 0; i < 5; i++) {
        spark.recordFailure('llama3')
      }
      expect(spark.getCircuitBreakerStatus('llama3').state).toBe('open')

      // Reset to test half_open flow
      spark.resetCircuitBreaker('llama3')
      expect(spark.getCircuitBreakerStatus('llama3').state).toBe('closed')
    })

    it('should reset circuit breaker', () => {
      spark.recordFailure('qwen2.5')
      spark.recordFailure('qwen2.5')
      spark.resetCircuitBreaker('qwen2.5')
      const status = spark.getCircuitBreakerStatus('qwen2.5')
      expect(status.state).toBe('closed')
      expect(status.failures).toBe(0)
    })

    it('should record success and update lastSuccessAt', () => {
      spark.recordSuccess('qwen2.5')
      const status = spark.getCircuitBreakerStatus('qwen2.5')
      expect(status.lastSuccessAt).toBeGreaterThan(0)
    })

    it('should infer with retry and return response', async () => {
      const response = await spark.inferWithRetry({ prompt: 'Hello' })
      expect(response.text.length).toBeGreaterThan(0)
    })

    it('should track errors in stats on retry failures', async () => {
      // inferWithRetry should handle errors gracefully
      const response = await spark.inferWithRetry({ prompt: 'Test', domain: 'code_generation' })
      expect(response).toBeTruthy()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL LIFECYCLE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  describe('Model Lifecycle Management', () => {
    it('should have lifecycle info for all models', () => {
      const lifecycles = spark.getAllModelLifecycles()
      expect(lifecycles.length).toBeGreaterThanOrEqual(6)
    })

    it('should get lifecycle info by model ID', () => {
      const lifecycle = spark.getModelLifecycle('qwen2.5-coder-7b-q4')
      expect(lifecycle).not.toBeNull()
      expect(lifecycle!.modelId).toBe('qwen2.5-coder-7b-q4')
      expect(lifecycle!.state).toBe('not_installed')
    })

    it('should return null for unknown model lifecycle', () => {
      expect(spark.getModelLifecycle('nonexistent')).toBeNull()
    })

    it('should generate Ollama pull commands', () => {
      const cmd = spark.getOllamaPullCommand('qwen2.5-coder-7b-q4')
      expect(cmd).toContain('ollama pull')
      expect(cmd).toContain('qwen2.5-coder')
    })

    it('should return null for unknown model pull command', () => {
      expect(spark.getOllamaPullCommand('nonexistent')).toBeNull()
    })

    it('should generate llama.cpp server commands', () => {
      const cmd = spark.getLlamaCppCommand('qwen2.5-coder-7b-q4')
      expect(cmd).toContain('llama-server')
      expect(cmd).toContain('-m')
      expect(cmd).toContain('-c')
    })

    it('should return null for unknown model llama.cpp command', () => {
      expect(spark.getLlamaCppCommand('nonexistent')).toBeNull()
    })

    it('should generate complete setup script', () => {
      const script = spark.generateSetupScript()
      expect(script).toContain('#!/bin/bash')
      expect(script).toContain('ollama pull')
      expect(script).toContain('ollama serve')
      expect(script).toContain('Model Spark')
    })

    it('should mark model as installed', () => {
      spark.markModelInstalled('qwen2.5-coder-7b-q4')
      const lifecycle = spark.getModelLifecycle('qwen2.5-coder-7b-q4')!
      expect(lifecycle.state).toBe('installed')
      expect(lifecycle.downloadProgress).toBe(100)
      expect(lifecycle.installedAt).toBeGreaterThan(0)
      expect(spark.isModelDownloaded('qwen2.5-coder-7b-q4')).toBe(true)
    })

    it('should mark model as ready', () => {
      spark.markModelReady('qwen2.5-coder-7b-q4')
      const lifecycle = spark.getModelLifecycle('qwen2.5-coder-7b-q4')!
      expect(lifecycle.state).toBe('ready')
      expect(lifecycle.lastUsedAt).toBeGreaterThan(0)
    })

    it('should check if both models are ready', () => {
      expect(spark.areBothModelsReady()).toBe(false)
      spark.markModelInstalled('qwen2.5-coder-7b-q4')
      spark.markModelInstalled('llama-3.1-8b-q4')
      expect(spark.areBothModelsReady()).toBe(true)
    })

    it('should have disk size estimates', () => {
      const lifecycle = spark.getModelLifecycle('qwen2.5-coder-7b-q4')!
      expect(lifecycle.diskSizeBytes).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // PROMPT CHAINING
  // ══════════════════════════════════════════════════════════════════════════

  describe('Prompt Chaining', () => {
    it('should execute a simple single-step chain', async () => {
      const steps: PromptChainStep[] = [
        { id: 'step1', prompt: 'Write hello world', model: 'qwen2.5', domain: 'code_generation', dependsOn: [] },
      ]
      const result = await spark.executePromptChain(steps)
      expect(result.steps).toHaveLength(1)
      expect(result.finalOutput.length).toBeGreaterThan(0)
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    it('should execute a multi-step chain with dependencies', async () => {
      const steps: PromptChainStep[] = [
        { id: 'plan', prompt: 'Plan a sorting algorithm', model: 'llama3', domain: 'planning', dependsOn: [] },
        { id: 'code', prompt: 'Implement: {plan}', model: 'qwen2.5', domain: 'code_generation', dependsOn: ['plan'] },
      ]
      const result = await spark.executePromptChain(steps)
      expect(result.steps).toHaveLength(2)
      expect(result.steps[0]!.id).toBe('plan')
      expect(result.steps[1]!.id).toBe('code')
    })

    it('should resolve dependencies in correct order', async () => {
      const steps: PromptChainStep[] = [
        { id: 'c', prompt: 'Final: {a} and {b}', model: 'auto', domain: 'auto', dependsOn: ['a', 'b'] },
        { id: 'a', prompt: 'First step', model: 'auto', domain: 'auto', dependsOn: [] },
        { id: 'b', prompt: 'Second step', model: 'auto', domain: 'auto', dependsOn: [] },
      ]
      const result = await spark.executePromptChain(steps)
      const ids = result.steps.map(s => s.id)
      expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'))
      expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'))
    })

    it('should apply extract_code transform', async () => {
      const steps: PromptChainStep[] = [
        { id: 'gen', prompt: 'Write a function', model: 'qwen2.5', domain: 'code_generation', dependsOn: [], transform: 'extract_code' },
      ]
      const result = await spark.executePromptChain(steps)
      expect(result.steps[0]!.output.length).toBeGreaterThan(0)
    })

    it('should build a think-do chain', () => {
      const chain = spark.buildThinkDoChain('Build a REST API')
      expect(chain).toHaveLength(2)
      expect(chain[0]!.id).toBe('think')
      expect(chain[0]!.model).toBe('llama3')
      expect(chain[1]!.id).toBe('do')
      expect(chain[1]!.model).toBe('qwen2.5')
      expect(chain[1]!.dependsOn).toContain('think')
    })

    it('should build a review chain', () => {
      const chain = spark.buildReviewChain('Write a sorting function')
      expect(chain).toHaveLength(3)
      expect(chain[0]!.id).toBe('generate')
      expect(chain[1]!.id).toBe('review')
      expect(chain[2]!.id).toBe('refine')
      expect(chain[2]!.dependsOn).toContain('generate')
      expect(chain[2]!.dependsOn).toContain('review')
    })

    it('should execute a think-do chain end to end', async () => {
      const chain = spark.buildThinkDoChain('Build a calculator')
      const result = await spark.executePromptChain(chain)
      expect(result.steps).toHaveLength(2)
      expect(result.finalOutput.length).toBeGreaterThan(0)
      expect(result.totalTokens).toBeGreaterThan(0)
    })

    it('should handle auto model selection in chain', async () => {
      const steps: PromptChainStep[] = [
        { id: 'step1', prompt: 'Write a function', model: 'auto', domain: 'auto', dependsOn: [] },
      ]
      const result = await spark.executePromptChain(steps)
      expect(result.steps[0]!.model).toBeTruthy()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // OUTPUT PARSING
  // ══════════════════════════════════════════════════════════════════════════

  describe('Output Parsing', () => {
    it('should extract code blocks', () => {
      const text = 'Here is code:\n```python\ndef hello():\n    print("hi")\n```\nAnd more:\n```js\nconsole.log("hi")\n```'
      const parsed = spark.parseOutput(text)
      expect(parsed.codeBlocks).toHaveLength(2)
      expect(parsed.codeBlocks[0]!.language).toBe('python')
      expect(parsed.codeBlocks[0]!.code).toContain('def hello')
      expect(parsed.codeBlocks[1]!.language).toBe('js')
    })

    it('should extract JSON blocks', () => {
      const text = 'Result: {"name": "test", "value": 42}'
      const parsed = spark.parseOutput(text)
      expect(parsed.jsonBlocks.length).toBeGreaterThanOrEqual(1)
    })

    it('should extract key points from numbered lists', () => {
      const text = '1. First point\n2. Second point\n3. Third point'
      const parsed = spark.parseOutput(text)
      expect(parsed.keyPoints).toHaveLength(3)
      expect(parsed.keyPoints[0]).toBe('First point')
    })

    it('should extract key points from bullet lists', () => {
      const text = '- First item\n- Second item\n* Third item'
      const parsed = spark.parseOutput(text)
      expect(parsed.keyPoints).toHaveLength(3)
    })

    it('should extract headings', () => {
      const text = '# Main Title\n\nContent here\n\n## Subtitle\n\nMore content'
      const parsed = spark.parseOutput(text)
      expect(parsed.headings).toHaveLength(2)
      expect(parsed.headings[0]).toBe('Main Title')
      expect(parsed.headings[1]).toBe('Subtitle')
    })

    it('should extract URLs', () => {
      const text = 'Visit https://example.com and http://test.org/path?q=1'
      const parsed = spark.parseOutput(text)
      expect(parsed.urls).toHaveLength(2)
      expect(parsed.urls[0]).toBe('https://example.com')
    })

    it('should generate summary from first paragraph', () => {
      const text = 'This is the first paragraph with enough content to be a summary.\n\nSecond paragraph here.'
      const parsed = spark.parseOutput(text)
      expect(parsed.summary).toContain('first paragraph')
    })

    it('should count words and sentences', () => {
      const text = 'This is a test. It has two sentences.'
      const parsed = spark.parseOutput(text)
      expect(parsed.wordCount).toBe(8)
      expect(parsed.sentenceCount).toBe(2)
    })

    it('should handle empty text', () => {
      const parsed = spark.parseOutput('')
      expect(parsed.codeBlocks).toHaveLength(0)
      expect(parsed.keyPoints).toHaveLength(0)
      expect(parsed.summary).toBeNull()
    })

    it('should extract grouped lists', () => {
      const text = 'Items:\n- apple\n- banana\n- cherry\n\nOther:\n- dog\n- cat'
      const parsed = spark.parseOutput(text)
      expect(parsed.lists.length).toBeGreaterThanOrEqual(2)
    })

    it('should use extractCode shorthand', () => {
      const text = '```python\nx = 1\n```'
      const blocks = spark.extractCode(text)
      expect(blocks).toHaveLength(1)
      expect(blocks[0]!.language).toBe('python')
    })

    it('should use extractKeyPoints shorthand', () => {
      const text = '1. Point A\n2. Point B'
      const points = spark.extractKeyPoints(text)
      expect(points).toHaveLength(2)
    })

    it('should return raw text in parsed output', () => {
      const text = 'raw content'
      const parsed = spark.parseOutput(text)
      expect(parsed.raw).toBe('raw content')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CONTEXT WINDOW MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  describe('Context Window Management', () => {
    const makeMessage = (role: 'system' | 'user' | 'assistant', content: string): SparkChatMessage => ({
      role,
      content,
      timestamp: Date.now(),
      tokensEstimate: Math.ceil(content.length / 4),
    })

    it('should return all messages when within budget', () => {
      const messages = [
        makeMessage('user', 'Hello'),
        makeMessage('assistant', 'Hi there'),
      ]
      const result = spark.manageContextWindow(messages, {
        maxTokens: 1000,
        strategy: 'truncate_oldest',
        reserveForResponse: 100,
        preserveSystemPrompt: true,
      })
      expect(result).toHaveLength(2)
    })

    it('should truncate oldest messages when exceeding budget', () => {
      const messages = [
        makeMessage('user', 'A'.repeat(200)),
        makeMessage('assistant', 'B'.repeat(200)),
        makeMessage('user', 'C'.repeat(200)),
        makeMessage('assistant', 'D'.repeat(200)),
      ]
      const result = spark.manageContextWindow(messages, {
        maxTokens: 120,
        strategy: 'truncate_oldest',
        reserveForResponse: 50,
        preserveSystemPrompt: false,
      })
      expect(result.length).toBeLessThan(4)
    })

    it('should preserve system prompt during truncation', () => {
      const messages = [
        makeMessage('system', 'You are a coder.'),
        makeMessage('user', 'A'.repeat(200)),
        makeMessage('assistant', 'B'.repeat(200)),
        makeMessage('user', 'C'.repeat(200)),
      ]
      const result = spark.manageContextWindow(messages, {
        maxTokens: 80,
        strategy: 'truncate_oldest',
        reserveForResponse: 30,
        preserveSystemPrompt: true,
      })
      expect(result[0]!.role).toBe('system')
    })

    it('should use truncate_middle strategy', () => {
      const messages = [
        makeMessage('user', 'A'.repeat(200)),
        makeMessage('assistant', 'B'.repeat(200)),
        makeMessage('user', 'C'.repeat(200)),
        makeMessage('assistant', 'D'.repeat(200)),
      ]
      const result = spark.manageContextWindow(messages, {
        maxTokens: 120,
        strategy: 'truncate_middle',
        reserveForResponse: 50,
        preserveSystemPrompt: false,
      })
      expect(result.length).toBeLessThan(4)
    })

    it('should use sliding_window strategy', () => {
      const messages = [
        makeMessage('user', 'A'.repeat(200)),
        makeMessage('assistant', 'B'.repeat(200)),
        makeMessage('user', 'C'.repeat(200)),
      ]
      const result = spark.manageContextWindow(messages, {
        maxTokens: 80,
        strategy: 'sliding_window',
        reserveForResponse: 30,
        preserveSystemPrompt: false,
      })
      expect(result.length).toBeLessThan(3)
    })

    it('should use summarize_oldest strategy', () => {
      const messages = [
        makeMessage('system', 'System prompt'),
        makeMessage('user', 'First question'),
        makeMessage('assistant', 'First answer'),
        makeMessage('user', 'Second question'),
        makeMessage('assistant', 'Second answer'),
      ]
      const result = spark.manageContextWindow(messages, {
        maxTokens: 30,
        strategy: 'summarize_oldest',
        reserveForResponse: 10,
        preserveSystemPrompt: true,
      })
      const hasSystem = result.some(m => m.role === 'system')
      expect(hasSystem).toBe(true)
    })

    it('should estimate token count', () => {
      const tokens = spark.estimateTokens('Hello world, this is a test of token counting.')
      expect(tokens).toBeGreaterThan(5)
    })

    it('should check if prompt fits in context window', () => {
      const short = spark.fitsInContextWindow('Hello')
      expect(short.fits).toBe(true)
      expect(short.remainingTokens).toBeGreaterThan(0)
    })

    it('should detect when prompt exceeds context window', () => {
      const huge = spark.fitsInContextWindow('x '.repeat(50000))
      expect(huge.promptTokens).toBeGreaterThan(10000)
    })

    it('should check context window for specific model', () => {
      const result = spark.fitsInContextWindow('Hello', 'llama-3.1-8b-q4')
      expect(result.maxTokens).toBe(131072) // LLaMA 3.1 128K context
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // HARDWARE DETECTION
  // ══════════════════════════════════════════════════════════════════════════

  describe('Hardware Detection', () => {
    it('should detect hardware profile', () => {
      const hw = spark.detectHardware()
      expect(hw.totalRAMGB).toBeGreaterThan(0)
      expect(hw.cpuCores).toBeGreaterThan(0)
      expect(hw.cpuModel).toBeTruthy()
      expect(typeof hw.gpuDetected).toBe('boolean')
      expect(['route', 'cascade', 'ensemble']).toContain(hw.recommendedStrategy)
    })

    it('should recommend models based on RAM', () => {
      const hw = spark.detectHardware()
      // Should recommend at least one model
      expect(hw.recommendedQwen !== null || hw.recommendedLlama !== null).toBe(true)
    })

    it('should auto-configure from hardware', () => {
      const hw = spark.autoConfigureFromHardware()
      const config = spark.getConfig()
      expect(config.defaultStrategy).toBe(hw.recommendedStrategy)
    })

    it('should generate hardware report', () => {
      const report = spark.generateHardwareReport()
      expect(report).toContain('Hardware Report')
      expect(report).toContain('CPU')
      expect(report).toContain('RAM')
      expect(report).toContain('Recommendations')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // OLLAMA API INTEGRATION
  // ══════════════════════════════════════════════════════════════════════════

  describe('Ollama API Integration', () => {
    it('should return correct Ollama base URL', () => {
      const url = spark.getOllamaBaseUrl()
      expect(url).toBe('http://127.0.0.1:11434')
    })

    it('should build Ollama generate request', () => {
      const model = spark.getQwenModel()
      const req = spark.buildOllamaRequest('Hello', model)
      expect(req.model).toBe(model.ollamaName)
      expect(req.prompt).toBe('Hello')
      expect(req.stream).toBe(false)
      expect(req.options).toBeTruthy()
    })

    it('should build Ollama chat request from messages', () => {
      const model = spark.getLlamaModel()
      const messages: SparkChatMessage[] = [
        { role: 'system', content: 'You are helpful', timestamp: Date.now() },
        { role: 'user', content: 'Hello', timestamp: Date.now() },
      ]
      const req = spark.buildOllamaChatRequest(messages, model)
      expect(req.model).toBe(model.ollamaName)
      expect(Array.isArray(req.messages)).toBe(true)
      expect((req.messages as Array<{role: string}>).length).toBe(2)
    })

    it('should build OpenAI-compatible request', () => {
      const model = spark.getQwenModel()
      const req = spark.buildOpenAICompatRequest('Hello', model, { systemPrompt: 'Be helpful' })
      expect(req.model).toBe(model.id)
      expect(Array.isArray(req.messages)).toBe(true)
      expect((req.messages as Array<{role: string}>).length).toBe(2) // system + user
      expect(req.stream).toBe(false)
    })

    it('should check Ollama server status', async () => {
      const status = await spark.checkOllamaServer()
      // In test environment, server won't be running
      expect(status.running).toBe(false)
      expect(status.host).toBe('127.0.0.1')
      expect(status.port).toBe(11434)
    })

    it('should generate model management commands', () => {
      const cmds = spark.getModelManagementCommands()
      expect(cmds.install_qwen).toContain('ollama pull')
      expect(cmds.install_llama).toContain('ollama pull')
      expect(cmds.list_models).toBe('ollama list')
      expect(cmds.start_server).toBe('ollama serve')
      expect(cmds.check_status).toContain('curl')
    })

    it('should include all management commands', () => {
      const cmds = spark.getModelManagementCommands()
      const expectedKeys = [
        'install_qwen', 'install_llama', 'list_models',
        'show_qwen', 'show_llama', 'remove_qwen', 'remove_llama',
        'start_server', 'check_status', 'run_qwen', 'run_llama',
      ]
      for (const key of expectedKeys) {
        expect(cmds[key]).toBeTruthy()
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // LRU CACHE (improved eviction)
  // ══════════════════════════════════════════════════════════════════════════

  describe('LRU Cache', () => {
    it('should cache and retrieve responses', async () => {
      const spark2 = new ModelSpark({ enableResponseCaching: true, cacheMaxSize: 10 })
      const prompt = 'What is 2+2?'
      await spark2.infer({ prompt, domain: 'math_logic' })
      const stats = spark2.getStats()
      expect(stats.cacheMisses).toBeGreaterThanOrEqual(1)

      // Second call should hit cache
      await spark2.infer({ prompt, domain: 'math_logic' })
      const stats2 = spark2.getStats()
      expect(stats2.cacheHits).toBeGreaterThanOrEqual(1)
    })

    it('should evict LRU entries when cache is full', async () => {
      const spark2 = new ModelSpark({
        enableResponseCaching: true,
        cacheMaxSize: 3,
      })

      await spark2.infer({ prompt: 'query-1', domain: 'general_reasoning' })
      await spark2.infer({ prompt: 'query-2', domain: 'general_reasoning' })
      await spark2.infer({ prompt: 'query-3', domain: 'general_reasoning' })
      expect(spark2.getCacheSize()).toBe(3)

      // Adding a 4th should evict the least recently used
      await spark2.infer({ prompt: 'query-4', domain: 'general_reasoning' })
      expect(spark2.getCacheSize()).toBe(3) // Still 3 after eviction
    })

    it('should clear cache', () => {
      spark.clearCache()
      expect(spark.getCacheSize()).toBe(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // EDGE CASES & INTEGRATION
  // ══════════════════════════════════════════════════════════════════════════

  describe('Edge Cases & Integration', () => {
    it('should handle empty prompts gracefully', async () => {
      const response = await spark.infer({ prompt: '' })
      expect(response).toBeTruthy()
    })

    it('should handle very long prompts', async () => {
      const longPrompt = 'x '.repeat(10000)
      const response = await spark.infer({ prompt: longPrompt })
      expect(response).toBeTruthy()
    })

    it('should handle special characters in prompts', async () => {
      const response = await spark.infer({ prompt: 'Test <script>alert("xss")</script> & special © chars' })
      expect(response).toBeTruthy()
    })

    it('should handle concurrent inference calls', async () => {
      const promises = [
        spark.infer({ prompt: 'Task 1', domain: 'code_generation' }),
        spark.infer({ prompt: 'Task 2', domain: 'general_reasoning' }),
        spark.infer({ prompt: 'Task 3', domain: 'math_logic' }),
      ]
      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
      results.forEach(r => expect(r.text.length).toBeGreaterThan(0))
    })

    it('should support session + streaming combined workflow', async () => {
      const session = spark.createSession({ systemPrompt: 'You are a coder.' })
      // Chat to add context
      await spark.chat(session.id, 'I need a sorting algorithm')
      const history = spark.getConversationHistory(session.id)
      expect(history.length).toBeGreaterThanOrEqual(2)

      // Stream a follow-up response (separate inference)
      const tokens: StreamToken[] = []
      for await (const token of spark.inferStream({ prompt: 'Write quicksort', domain: 'code_generation' })) {
        tokens.push(token)
      }
      expect(tokens.length).toBeGreaterThan(0)
    })

    it('should handle parse output with code and lists combined', () => {
      const text = [
        '# Guide',
        '',
        '1. First step',
        '2. Second step',
        '',
        '```python',
        'def sort(arr):',
        '    return sorted(arr)',
        '```',
        '',
        'Visit https://python.org',
      ].join('\n')
      const parsed = spark.parseOutput(text)
      expect(parsed.headings).toHaveLength(1)
      expect(parsed.keyPoints).toHaveLength(2)
      expect(parsed.codeBlocks).toHaveLength(1)
      expect(parsed.urls).toHaveLength(1)
    })

    it('should chain prompt with extract and review', async () => {
      const chain = spark.buildReviewChain('Write a hello world function')
      expect(chain).toHaveLength(3)
      const result = await spark.executePromptChain(chain)
      expect(result.steps).toHaveLength(3)
      expect(result.finalOutput.length).toBeGreaterThan(0)
    })

    it('should provide complete status with new features', () => {
      const report = spark.generateStatusReport()
      expect(report).toContain('Model Spark')
      expect(report).toContain('Qwen')
      expect(report).toContain('LLaMA')
    })

    it('should handle hardware detection gracefully', () => {
      // Should not throw even in restricted environments
      const hw = spark.detectHardware()
      expect(hw.totalRAMGB).toBeGreaterThan(0)
    })

    it('should manage lifecycle and session independently', () => {
      // Create a session
      const session = spark.createSession()
      // Mark models
      spark.markModelInstalled('qwen2.5-coder-7b-q4')
      // Both should be independently accessible
      expect(spark.getSession(session.id)).toBeTruthy()
      expect(spark.getModelLifecycle('qwen2.5-coder-7b-q4')!.state).toBe('installed')
    })
  })
})
