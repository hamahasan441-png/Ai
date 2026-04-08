import { describe, it, expect, beforeEach } from 'vitest'
import {
  QwenLocalLLM,
  type QwenLLMConfig,
  type InferenceRequest,
  type ModelInfo,
  type QuantizationLevel,
} from '../QwenLocalLLM.js'

describe('QwenLocalLLM', () => {
  let llm: QwenLocalLLM

  beforeEach(() => {
    llm = new QwenLocalLLM()
  })

  // ── Model Registry ─────────────────────────────────────────────────────

  describe('Model Registry', () => {
    it('should have at least 5 models available', () => {
      const models = llm.getAvailableModels()
      expect(models.length).toBeGreaterThanOrEqual(5)
    })

    it('should have Qwen2.5-Coder-7B as default model', () => {
      const model = llm.getDefaultModel()
      expect(model.name).toContain('Qwen2.5-Coder-7B')
      expect(model.family).toBe('qwen2.5-coder')
      expect(model.parameterCount).toBe('7B')
    })

    it('should get model by ID', () => {
      const model = llm.getModel('qwen2.5-coder-7b-instruct-q4_k_m')
      expect(model).not.toBeNull()
      expect(model!.quantization).toBe('Q4_K_M')
    })

    it('should return null for unknown model ID', () => {
      expect(llm.getModel('nonexistent-model')).toBeNull()
    })

    it('should filter models by quantization', () => {
      const q4Models = llm.getModelsByQuantization('Q4_K_M')
      expect(q4Models.length).toBeGreaterThanOrEqual(1)
      expect(q4Models.every(m => m.quantization === 'Q4_K_M')).toBe(true)
    })

    it('should filter models for available RAM', () => {
      const models8GB = llm.getModelsForRAM(8)
      expect(models8GB.length).toBeGreaterThanOrEqual(3)
      expect(models8GB.every(m => m.minRAMGB <= 8)).toBe(true)
    })

    it('should filter models for low RAM (4GB)', () => {
      const models4GB = llm.getModelsForRAM(4)
      expect(models4GB.length).toBeGreaterThanOrEqual(2)
    })

    it('should have download URLs for all models', () => {
      const models = llm.getAvailableModels()
      for (const model of models) {
        expect(model.downloadUrl).toContain('huggingface.co')
        expect(model.downloadUrl).toContain('gguf')
      }
    })

    it('should have capabilities for all models', () => {
      const models = llm.getAvailableModels()
      for (const model of models) {
        expect(model.capabilities.length).toBeGreaterThanOrEqual(3)
        expect(model.capabilities).toContain('code_generation')
      }
    })

    it('should have realistic file sizes', () => {
      const models = llm.getAvailableModels()
      for (const model of models) {
        expect(model.fileSizeGB).toBeGreaterThan(0)
        expect(model.fileSizeGB).toBeLessThan(20)
      }
    })

    it('should have context window of 32768 for all models', () => {
      const models = llm.getAvailableModels()
      for (const model of models) {
        expect(model.contextWindow).toBe(32768)
      }
    })
  })

  // ── Model Management ───────────────────────────────────────────────────

  describe('Model Management', () => {
    it('should track downloaded models', () => {
      expect(llm.isModelDownloaded('qwen2.5-coder-7b-instruct-q4_k_m')).toBe(false)
      llm.markModelDownloaded('qwen2.5-coder-7b-instruct-q4_k_m')
      expect(llm.isModelDownloaded('qwen2.5-coder-7b-instruct-q4_k_m')).toBe(true)
    })

    it('should list downloaded models', () => {
      llm.markModelDownloaded('qwen2.5-coder-7b-instruct-q4_k_m')
      llm.markModelDownloaded('qwen2.5-coder-7b-instruct-q5_k_m')
      const downloaded = llm.getDownloadedModels()
      expect(downloaded).toHaveLength(2)
      expect(downloaded).toContain('qwen2.5-coder-7b-instruct-q4_k_m')
    })

    it('should simulate model download', () => {
      const progress = llm.simulateDownload()
      expect(progress.status).toBe('complete')
      expect(progress.percentComplete).toBe(100)
      expect(progress.bytesDownloaded).toBe(progress.totalBytes)
      expect(llm.isModelDownloaded(progress.modelId)).toBe(true)
    })

    it('should return error for unknown model download', () => {
      const progress = llm.simulateDownload('nonexistent')
      expect(progress.status).toBe('error')
      expect(progress.error).toContain('not found')
    })

    it('should generate download instructions', () => {
      const instructions = llm.getDownloadInstructions()
      expect(instructions).toContain('Qwen2.5-Coder')
      expect(instructions).toContain('ollama pull')
      expect(instructions).toContain('wget')
      expect(instructions).toContain('llama.cpp')
    })

    it('should generate download instructions for specific model', () => {
      const instructions = llm.getDownloadInstructions('qwen2.5-coder-7b-instruct-q8_0')
      expect(instructions).toContain('Q8')
      expect(instructions).toContain('7.7 GB')
    })
  })

  // ── Inference ──────────────────────────────────────────────────────────

  describe('Inference', () => {
    it('should generate a response (fallback mode)', async () => {
      const result = await llm.generate({ prompt: 'Write a Python function' })
      expect(result.text).toBeTruthy()
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.tokensGenerated).toBeGreaterThan(0)
      expect(result.modelId).toContain('qwen2.5-coder')
      expect(result.finishReason).toBe('stop')
    })

    it('should handle vulnerability prompts in fallback mode', async () => {
      const result = await llm.generate({ prompt: 'Search for CVE vulnerability in Apache' })
      expect(result.text).toContain('ExploitSearchEngine')
    })

    it('should handle overflow prompts in fallback mode', async () => {
      const result = await llm.generate({ prompt: 'Debug this buffer overflow crash' })
      expect(result.text).toContain('BufferOverflowDebugger')
    })

    it('should handle code prompts in fallback mode', async () => {
      const result = await llm.generate({ prompt: 'Write a function to sort code' })
      expect(result.text).toContain('code')
    })

    it('should track inference statistics', async () => {
      await llm.generate({ prompt: 'Hello world' })
      await llm.generate({ prompt: 'Another prompt' })
      const stats = llm.getStats()
      expect(stats.totalInferences).toBe(2)
      expect(stats.totalTokensGenerated).toBeGreaterThan(0)
    })

    it('should use system prompt', async () => {
      const result = await llm.generate({
        prompt: 'Hello',
        systemPrompt: 'You are a helpful assistant',
      })
      expect(result.text).toBeTruthy()
    })

    it('should chat with message history', async () => {
      const result = await llm.chat([
        { role: 'system', content: 'You are a code assistant' },
        { role: 'user', content: 'Write a hello world function' },
      ])
      expect(result.text).toBeTruthy()
      expect(result.tokensGenerated).toBeGreaterThan(0)
    })

    it('should generate code with template', async () => {
      const result = await llm.generateCode('fibonacci function', 'Python')
      expect(result.text).toBeTruthy()
    })

    it('should review code with template', async () => {
      const result = await llm.reviewCode('function add(a, b) { return a + b }', 'JavaScript')
      expect(result.text).toBeTruthy()
    })

    it('should debug code with template', async () => {
      const result = await llm.debugCode('for i in range(10): print(i', 'SyntaxError', 'Python')
      expect(result.text).toBeTruthy()
    })

    it('should analyze exploits with template', async () => {
      const result = await llm.analyzeExploit('Apache 2.4.49', 'Path traversal vulnerability')
      expect(result.text).toBeTruthy()
    })

    it('should search vulnerabilities with template', async () => {
      const result = await llm.searchVulnerabilities('Log4j remote code execution')
      expect(result.text).toBeTruthy()
    })

    it('should debug overflow with template', async () => {
      const result = await llm.debugOverflow(
        'SIGSEGV at 0x41414141',
        'NX enabled, ASLR enabled, Canary disabled',
      )
      expect(result.text).toBeTruthy()
    })
  })

  // ── Server Management ──────────────────────────────────────────────────

  describe('Server Management', () => {
    it('should report server status', () => {
      const status = llm.getServerStatus()
      expect(status.running).toBe(false)
      expect(status.backend).toBe('ollama')
      expect(status.modelLoaded).toBeNull()
    })

    it('should start and stop server', () => {
      expect(llm.startServer()).toBe(true)
      const status = llm.getServerStatus()
      expect(status.running).toBe(true)
      expect(status.modelLoaded).toContain('qwen2.5-coder')

      expect(llm.stopServer()).toBe(true)
      expect(llm.getServerStatus().running).toBe(false)
    })

    it('should generate server start command for ollama', () => {
      const cmd = llm.getServerStartCommand()
      expect(cmd).toContain('ollama')
      expect(cmd).toContain('qwen2.5-coder')
    })

    it('should generate server start command for llama.cpp', () => {
      const llmCpp = new QwenLocalLLM({ backend: 'llama_cpp', port: 8080 })
      const cmd = llmCpp.getServerStartCommand()
      expect(cmd).toContain('llama-server')
      expect(cmd).toContain('8080')
    })

    it('should generate Ollama Modelfile', () => {
      const modelfile = llm.generateModelfile()
      expect(modelfile).toContain('FROM qwen2.5-coder')
      expect(modelfile).toContain('PARAMETER temperature')
      expect(modelfile).toContain('SYSTEM')
      expect(modelfile).toContain('TEMPLATE')
    })

    it('should get API endpoint for ollama', () => {
      expect(llm.getAPIEndpoint()).toContain('/api/generate')
    })

    it('should get API endpoint for llama.cpp', () => {
      const llmCpp = new QwenLocalLLM({ backend: 'llama_cpp' })
      expect(llmCpp.getAPIEndpoint()).toContain('/v1/chat/completions')
    })
  })

  // ── Prompt Templates ───────────────────────────────────────────────────

  describe('Prompt Templates', () => {
    it('should have all standard templates', () => {
      const templates = llm.getPromptTemplates()
      expect(Object.keys(templates)).toContain('code_generation')
      expect(Object.keys(templates)).toContain('code_review')
      expect(Object.keys(templates)).toContain('debugging')
      expect(Object.keys(templates)).toContain('exploit_analysis')
      expect(Object.keys(templates)).toContain('vulnerability_search')
      expect(Object.keys(templates)).toContain('overflow_debug')
      expect(Object.keys(templates)).toContain('general')
    })

    it('should get specific template', () => {
      const template = llm.getPromptTemplate('code_generation')
      expect(template).toContain('Qwen2.5-Coder')
      expect(template).toContain('{task}')
      expect(template).toContain('{language}')
    })

    it('should return null for unknown template', () => {
      expect(llm.getPromptTemplate('nonexistent')).toBeNull()
    })

    it('should fill template with values', () => {
      const filled = llm.fillTemplate('code_generation', {
        task: 'sort an array',
        language: 'Python',
      })
      expect(filled).toContain('sort an array')
      expect(filled).toContain('Python')
      expect(filled).not.toContain('{task}')
    })
  })

  // ── Configuration ──────────────────────────────────────────────────────

  describe('Configuration', () => {
    it('should have sensible defaults', () => {
      const config = llm.getConfig()
      expect(config.defaultModel).toContain('q4_k_m')
      expect(config.backend).toBe('ollama')
      expect(config.host).toBe('127.0.0.1')
      expect(config.port).toBe(11434)
      expect(config.contextWindow).toBe(32768)
      expect(config.temperature).toBe(0.7)
      expect(config.autoDownload).toBe(true)
    })

    it('should accept custom configuration', () => {
      const custom = new QwenLocalLLM({
        backend: 'llama_cpp',
        port: 8080,
        temperature: 0.5,
        gpuLayers: 20,
      })
      const config = custom.getConfig()
      expect(config.backend).toBe('llama_cpp')
      expect(config.port).toBe(8080)
      expect(config.temperature).toBe(0.5)
      expect(config.gpuLayers).toBe(20)
    })

    it('should update configuration', () => {
      llm.updateConfig({ temperature: 0.3, maxTokens: 8192 })
      const config = llm.getConfig()
      expect(config.temperature).toBe(0.3)
      expect(config.maxTokens).toBe(8192)
    })

    it('should reset statistics', () => {
      llm.markModelDownloaded('qwen2.5-coder-7b-instruct-q4_k_m')
      llm.resetStats()
      const stats = llm.getStats()
      expect(stats.totalInferences).toBe(0)
      expect(stats.modelsDownloaded).toBe(1) // Downloaded models preserved
    })

    it('should generate setup report', () => {
      const report = llm.generateSetupReport()
      expect(report).toContain('Qwen2.5-Coder')
      expect(report).toContain('Status')
      expect(report).toContain('Model')
    })

    it('should hash content consistently', () => {
      const h1 = llm.hashContent('test input')
      const h2 = llm.hashContent('test input')
      const h3 = llm.hashContent('different input')
      expect(h1).toBe(h2)
      expect(h1).not.toBe(h3)
      expect(h1.length).toBe(16)
    })
  })
})
