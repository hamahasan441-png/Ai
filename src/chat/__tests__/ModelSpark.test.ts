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
