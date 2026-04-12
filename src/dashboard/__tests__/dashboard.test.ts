/**
 * Dashboard Tests — comprehensive tests for the AI Dashboard server
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as http from 'http'
import {
  DashboardServer,
  DASHBOARD_MODELS,
  generateId,
  getSystemStats,
  parseQuery,
  sendJson,
  sendHtml,
  renderDashboardPage,
  renderChatPage,
  renderModelsPage,
  renderModulesPage,
  renderSettingsPage,
  startDashboard,
} from '../server.js'

import type {
  DashboardConfig,
  DashboardChatMessage,
  ChatSession,
  DashboardModelInfo,
  SystemStats,
  UploadedFile,
} from '../server.js'

// ─── Helper ──────────────────────────────────────────────────────────────────

function fetch(url: string, options?: { method?: string; body?: string; headers?: Record<string, string> }): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options?.method ?? 'GET',
        headers: options?.headers,
        timeout: 5000,
      },
      res => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          })
        })
      },
    )
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    if (options?.body) req.write(options.body)
    req.end()
  })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AI Dashboard', () => {
  let server: DashboardServer
  let port: number
  let baseUrl: string

  beforeEach(async () => {
    // Use a random port to avoid conflicts
    port = 30000 + Math.floor(Math.random() * 10000)
    server = new DashboardServer({ port, host: '127.0.0.1' })
    await server.start()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterEach(async () => {
    await server.stop()
  })

  // ── Server lifecycle ──

  describe('Server Lifecycle', () => {
    it('should start and be running', () => {
      expect(server.isRunning()).toBe(true)
    })

    it('should stop cleanly', async () => {
      await server.stop()
      expect(server.isRunning()).toBe(false)
    })

    it('should stop even when not running', async () => {
      await server.stop()
      await server.stop() // double stop should not throw
      expect(server.isRunning()).toBe(false)
    })

    it('should have correct config', () => {
      const config = server.getConfig()
      expect(config.port).toBe(port)
      expect(config.host).toBe('127.0.0.1')
      expect(config.defaultModel).toBe('local-brain')
    })
  })

  // ── Dashboard page ──

  describe('Dashboard Page', () => {
    it('GET / returns HTML dashboard page', async () => {
      const res = await fetch(`${baseUrl}/`)
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/html')
      expect(res.body).toContain('AI Dashboard')
      expect(res.body).toContain('Dashboard Overview')
    })

    it('dashboard page shows system stats', async () => {
      const res = await fetch(`${baseUrl}/`)
      expect(res.body).toContain('Memory')
      expect(res.body).toContain('Models')
      expect(res.body).toContain('Chat Sessions')
    })

    it('dashboard page has quick action links', async () => {
      const res = await fetch(`${baseUrl}/`)
      expect(res.body).toContain('Start Chat')
      expect(res.body).toContain('/chat')
      expect(res.body).toContain('/models')
    })
  })

  // ── Chat page ──

  describe('Chat Page', () => {
    it('GET /chat returns chat UI', async () => {
      const res = await fetch(`${baseUrl}/chat`)
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/html')
      expect(res.body).toContain('model-select')
      expect(res.body).toContain('chat-input')
      expect(res.body).toContain('send-btn')
    })

    it('chat page lists all models in dropdown', async () => {
      const res = await fetch(`${baseUrl}/chat`)
      for (const model of DASHBOARD_MODELS) {
        expect(res.body).toContain(model.name)
      }
    })

    it('chat page supports model query param', async () => {
      const res = await fetch(`${baseUrl}/chat?model=llama3.1:8b`)
      expect(res.body).toContain('llama3.1:8b')
    })

    it('chat page has temperature control', async () => {
      const res = await fetch(`${baseUrl}/chat`)
      expect(res.body).toContain('temp-input')
      expect(res.body).toContain('0.7')
    })

    it('chat page has clear button', async () => {
      const res = await fetch(`${baseUrl}/chat`)
      expect(res.body).toContain('Clear')
      expect(res.body).toContain('clearChat')
    })
  })

  // ── Models page ──

  describe('Models Page', () => {
    it('GET /models returns models page', async () => {
      const res = await fetch(`${baseUrl}/models`)
      expect(res.status).toBe(200)
      expect(res.body).toContain('All Models')
    })

    it('models page lists all registered models', async () => {
      const res = await fetch(`${baseUrl}/models`)
      for (const model of DASHBOARD_MODELS) {
        expect(res.body).toContain(model.name)
      }
    })

    it('model cards show strengths', async () => {
      const res = await fetch(`${baseUrl}/models`)
      expect(res.body).toContain('Code Generation')
      expect(res.body).toContain('Reasoning')
    })

    it('model cards link to chat', async () => {
      const res = await fetch(`${baseUrl}/models`)
      expect(res.body).toContain('/chat?model=')
    })
  })

  // ── Modules page ──

  describe('Modules Page', () => {
    it('GET /modules returns modules page', async () => {
      const res = await fetch(`${baseUrl}/modules`)
      expect(res.status).toBe(200)
      expect(res.body).toContain('AI Modules')
    })

    it('modules page lists key modules', async () => {
      const res = await fetch(`${baseUrl}/modules`)
      expect(res.body).toContain('LocalBrain')
      expect(res.body).toContain('ModelSpark')
      expect(res.body).toContain('QwenLocalLLM')
      expect(res.body).toContain('ReasoningEngine')
      expect(res.body).toContain('ExploitSearchEngine')
    })

    it('modules page shows offline badge', async () => {
      const res = await fetch(`${baseUrl}/modules`)
      expect(res.body).toContain('100% offline')
    })
  })

  // ── Settings page ──

  describe('Settings Page', () => {
    it('GET /settings returns settings page', async () => {
      const res = await fetch(`${baseUrl}/settings`)
      expect(res.status).toBe(200)
      expect(res.body).toContain('Settings')
    })

    it('settings page has form fields', async () => {
      const res = await fetch(`${baseUrl}/settings`)
      expect(res.body).toContain('defaultModel')
      expect(res.body).toContain('ollamaHost')
      expect(res.body).toContain('ollamaPort')
      expect(res.body).toContain('defaultTemperature')
    })

    it('settings page shows current config values', async () => {
      const res = await fetch(`${baseUrl}/settings`)
      expect(res.body).toContain('localhost')
      expect(res.body).toContain('11434')
      expect(res.body).toContain('0.7')
    })
  })

  // ── API: Chat ──

  describe('API: Chat', () => {
    it('POST /api/chat with no body returns 400', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      })
      expect(res.status).toBe(400)
      const data = JSON.parse(res.body)
      expect(data.error).toBeTruthy()
    })

    it('POST /api/chat with empty messages returns 400', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', messages: [] }),
      })
      expect(res.status).toBe(400)
      const data = JSON.parse(res.body)
      expect(data.error).toContain('No messages')
    })

    it('POST /api/chat with unreachable ollama returns 503', async () => {
      // Use a port that nothing is listening on
      const badServer = new DashboardServer({ port: port + 1, host: '127.0.0.1', ollamaPort: 59999 })
      await badServer.start()
      try {
        const res = await fetch(`http://127.0.0.1:${port + 1}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'test', messages: [{ role: 'user', content: 'hi' }] }),
        })
        expect(res.status).toBe(503)
        const data = JSON.parse(res.body)
        expect(data.error).toContain('Failed')
      } finally {
        await badServer.stop()
      }
    })
  })

  // ── API: Models ──

  describe('API: Models', () => {
    it('GET /api/models returns model list', async () => {
      const res = await fetch(`${baseUrl}/api/models`)
      expect(res.status).toBe(200)
      const data = JSON.parse(res.body)
      expect(data.models).toBeInstanceOf(Array)
      expect(data.models.length).toBe(DASHBOARD_MODELS.length)
    })

    it('models have required fields', async () => {
      const res = await fetch(`${baseUrl}/api/models`)
      const data = JSON.parse(res.body)
      for (const m of data.models) {
        expect(m.id).toBeTruthy()
        expect(m.name).toBeTruthy()
        expect(m.family).toBeTruthy()
        expect(m.description).toBeTruthy()
      }
    })
  })

  // ── API: Stats ──

  describe('API: Stats', () => {
    it('GET /api/stats returns system stats', async () => {
      const res = await fetch(`${baseUrl}/api/stats`)
      expect(res.status).toBe(200)
      const data = JSON.parse(res.body)
      expect(data.platform).toBeTruthy()
      expect(data.cpus).toBeGreaterThan(0)
      expect(data.totalMemoryGB).toBeGreaterThan(0)
      expect(typeof data.nodeVersion).toBe('string')
    })
  })

  // ── API: Sessions ──

  describe('API: Sessions', () => {
    it('GET /api/sessions returns empty initially', async () => {
      const res = await fetch(`${baseUrl}/api/sessions`)
      expect(res.status).toBe(200)
      const data = JSON.parse(res.body)
      expect(data.sessions).toBeInstanceOf(Array)
      expect(data.sessions.length).toBe(0)
    })
  })

  // ── API: Settings ──

  describe('API: Settings', () => {
    it('GET /api/settings returns config', async () => {
      const res = await fetch(`${baseUrl}/api/settings`)
      expect(res.status).toBe(200)
      const data = JSON.parse(res.body)
      expect(data.defaultModel).toBe('local-brain')
      expect(data.ollamaHost).toBe('localhost')
    })

    it('POST /api/settings updates config', async () => {
      const res = await fetch(`${baseUrl}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultModel: 'llama3.1:8b', defaultTemperature: '0.9' }),
      })
      expect(res.status).toBe(200)
      const data = JSON.parse(res.body)
      expect(data.ok).toBe(true)
      expect(data.config.defaultModel).toBe('llama3.1:8b')
      expect(data.config.defaultTemperature).toBe(0.9)
    })

    it('POST /api/settings with invalid JSON returns 400', async () => {
      const res = await fetch(`${baseUrl}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      })
      expect(res.status).toBe(400)
    })
  })

  // ── CORS ──

  describe('CORS', () => {
    it('OPTIONS returns CORS headers', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, { method: 'OPTIONS' })
      expect(res.status).toBe(204)
    })
  })

  // ── 404 ──

  describe('404 Handling', () => {
    it('unknown path returns 404', async () => {
      const res = await fetch(`${baseUrl}/nonexistent`)
      expect(res.status).toBe(404)
      expect(res.body).toContain('Not Found')
    })
  })
})

// ─── Unit tests for utility functions ────────────────────────────────────────

describe('Dashboard Utilities', () => {
  it('generateId returns unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('parseQuery parses query string', () => {
    expect(parseQuery('/chat?model=llama3&temp=0.5')).toEqual({ model: 'llama3', temp: '0.5' })
    expect(parseQuery('/chat')).toEqual({})
    expect(parseQuery('/chat?key=value')).toEqual({ key: 'value' })
  })

  it('getSystemStats returns valid stats', () => {
    const stats = getSystemStats([])
    expect(stats.platform).toBeTruthy()
    expect(stats.cpus).toBeGreaterThan(0)
    expect(stats.totalMemoryGB).toBeGreaterThan(0)
    expect(stats.totalChats).toBe(0)
  })
})

// ─── Unit tests for render functions ─────────────────────────────────────────

describe('Dashboard Renderers', () => {
  const mockStats: SystemStats = {
    platform: 'linux',
    arch: 'x64',
    cpus: 4,
    totalMemoryGB: 16,
    freeMemoryGB: 8,
    uptime: 3600,
    nodeVersion: 'v20.0.0',
    ollamaAvailable: true,
    llamaCppAvailable: false,
    modelsLoaded: 3,
    totalChats: 5,
  }

  it('renderDashboardPage produces valid HTML', () => {
    const html = renderDashboardPage(mockStats, DASHBOARD_MODELS)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Dashboard Overview')
    expect(html).toContain('Ollama Online')
    expect(html).toContain('16')
    expect(html).toContain('linux')
  })

  it('renderChatPage includes all models', () => {
    const html = renderChatPage(DASHBOARD_MODELS, 'qwen2.5-coder:7b')
    expect(html).toContain('model-select')
    for (const m of DASHBOARD_MODELS) {
      expect(html).toContain(m.name)
    }
  })

  it('renderModelsPage shows model count', () => {
    const html = renderModelsPage(DASHBOARD_MODELS)
    expect(html).toContain(`${DASHBOARD_MODELS.length} models`)
  })

  it('renderModulesPage lists modules', () => {
    const html = renderModulesPage()
    expect(html).toContain('LocalBrain')
    expect(html).toContain('ModelSpark')
    expect(html).toContain('PythonBlackHat')
  })

  it('renderSettingsPage shows form', () => {
    const config: DashboardConfig = {
      port: 3210,
      host: '0.0.0.0',
      ollamaHost: 'localhost',
      ollamaPort: 11434,
      llamaCppHost: 'localhost',
      llamaCppPort: 8080,
      title: 'AI Dashboard',
      maxChatHistory: 1000,
      defaultModel: 'qwen2.5-coder:7b',
      defaultTemperature: 0.7,
      defaultMaxTokens: 2048,
    }
    const html = renderSettingsPage(config)
    expect(html).toContain('Settings')
    expect(html).toContain('Save Settings')
    expect(html).toContain('localhost')
  })
})

// ─── Model registry ──────────────────────────────────────────────────────────

describe('DASHBOARD_MODELS', () => {
  it('has at least 10 models', () => {
    expect(DASHBOARD_MODELS.length).toBeGreaterThanOrEqual(10)
  })

  it('all models have unique IDs', () => {
    const ids = DASHBOARD_MODELS.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes Qwen models', () => {
    const qwen = DASHBOARD_MODELS.filter(m => m.family === 'qwen2.5')
    expect(qwen.length).toBeGreaterThanOrEqual(2)
  })

  it('includes LLaMA models', () => {
    const llama = DASHBOARD_MODELS.filter(m => m.family === 'llama3')
    expect(llama.length).toBeGreaterThanOrEqual(2)
  })

  it('includes Mistral', () => {
    expect(DASHBOARD_MODELS.some(m => m.family === 'mistral')).toBe(true)
  })

  it('includes CodeLlama', () => {
    expect(DASHBOARD_MODELS.some(m => m.family === 'codellama')).toBe(true)
  })

  it('includes DeepSeek Coder', () => {
    expect(DASHBOARD_MODELS.some(m => m.family === 'deepseek')).toBe(true)
  })

  it('includes Phi-3', () => {
    expect(DASHBOARD_MODELS.some(m => m.family === 'phi')).toBe(true)
  })

  it('includes Gemma 2', () => {
    expect(DASHBOARD_MODELS.some(m => m.family === 'gemma')).toBe(true)
  })

  it('includes StarCoder2', () => {
    expect(DASHBOARD_MODELS.some(m => m.family === 'starcoder')).toBe(true)
  })

  it('all models have descriptions and strengths', () => {
    for (const m of DASHBOARD_MODELS) {
      expect(m.description.length).toBeGreaterThan(10)
      expect(m.strengths.length).toBeGreaterThan(0)
    }
  })
})

// ─── Backward-compatible API tests (from main branch) ────────────────────────

describe('Backward-Compatible APIs', () => {
  let server: DashboardServer
  let port: number
  let baseUrl: string

  beforeEach(async () => {
    port = 30000 + Math.floor(Math.random() * 10000)
    server = new DashboardServer({ port, host: '127.0.0.1' })
    await server.start()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterEach(async () => {
    await server.stop()
  })

  it('should export startDashboard function', () => {
    expect(typeof startDashboard).toBe('function')
  })

  it('GET /api/status returns system info with ok field', async () => {
    const res = await fetch(`${baseUrl}/api/status`)
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.ok).toBe(true)
    expect(data).toHaveProperty('nodeVersion')
    expect(data).toHaveProperty('platform')
    expect(data).toHaveProperty('memoryMB')
    expect(data).toHaveProperty('pid')
  })

  it('GET /api/modules returns module list with ok field', async () => {
    const res = await fetch(`${baseUrl}/api/modules`)
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.ok).toBe(true)
    expect(Array.isArray(data.modules)).toBe(true)
    expect(data.modules.length).toBeGreaterThan(20)
  })

  it('GET /api/config returns configuration with ok field', async () => {
    const res = await fetch(`${baseUrl}/api/config`)
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.ok).toBe(true)
    expect(data.config).toHaveProperty('ollamaUrl')
    expect(data.config).toHaveProperty('defaultModel')
    expect(data.config).toHaveProperty('version')
    expect(data.config.ollamaUrl).toContain('localhost')
    expect(data.config.llamaCppUrl).toContain('localhost')
  })

  it('dashboard HTML contains no Anthropic references', async () => {
    const res = await fetch(`${baseUrl}/`)
    expect(res.body.toLowerCase()).not.toContain('anthropic')
    expect(res.body.toLowerCase()).not.toContain('claude')
  })
})

// ─── Local Brain Chat Tests ──────────────────────────────────────────────────

describe('Local Brain Chat', () => {
  let server: DashboardServer
  let port: number
  let baseUrl: string

  beforeEach(async () => {
    port = 30000 + Math.floor(Math.random() * 10000)
    server = new DashboardServer({ port, host: '127.0.0.1' })
    await server.start()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterEach(async () => {
    await server.stop()
  })

  it('POST /api/chat with local-brain returns response without Ollama', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-brain',
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
      }),
    })
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.text).toBeTruthy()
    expect(data.model).toBe('local-brain')
    expect(typeof data.durationMs).toBe('number')
    expect(typeof data.tokensUsed).toBe('number')
    expect(data.error).toBeUndefined()
  })

  it('local-brain chat handles code questions', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-brain',
        messages: [{ role: 'user', content: 'How do I sort an array in JavaScript?' }],
      }),
    })
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.text).toBeTruthy()
    expect(data.text.length).toBeGreaterThan(10)
  })

  it('local-brain chat creates a session', async () => {
    await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-brain',
        messages: [{ role: 'user', content: 'test message' }],
      }),
    })
    const sessRes = await fetch(`${baseUrl}/api/sessions`)
    const sessData = JSON.parse(sessRes.body)
    expect(sessData.sessions.length).toBe(1)
    expect(sessData.sessions[0].model).toBe('local-brain')
  })

  it('local-brain handles multi-turn conversation', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-brain',
        messages: [
          { role: 'user', content: 'What is binary search?' },
          { role: 'assistant', content: 'Binary search is an algorithm.' },
          { role: 'user', content: 'Can you explain more?' },
        ],
      }),
    })
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.text).toBeTruthy()
  })

  it('DASHBOARD_MODELS includes local-brain as first entry', () => {
    expect(DASHBOARD_MODELS[0]!.id).toBe('local-brain')
    expect(DASHBOARD_MODELS[0]!.status).toBe('available')
    expect(DASHBOARD_MODELS[0]!.family).toBe('local')
  })

  it('dashboard page shows Local Brain Ready badge', async () => {
    const res = await fetch(`${baseUrl}/`)
    expect(res.body).toContain('Local Brain Ready')
  })

  it('chat page shows Local Brain as default selected model', async () => {
    const res = await fetch(`${baseUrl}/chat`)
    expect(res.body).toContain('local-brain')
    expect(res.body).toContain('Local Brain (DevBrain)')
    expect(res.body).toContain('No Ollama')
  })

  it('server has DevBrain instance', () => {
    const brain = server.getDevBrain()
    expect(brain).toBeTruthy()
    expect(typeof brain.chat).toBe('function')
  })
})

// ─── File Upload Tests ───────────────────────────────────────────────────────

describe('File Upload', () => {
  let server: DashboardServer
  let port: number
  let baseUrl: string

  beforeEach(async () => {
    port = 30000 + Math.floor(Math.random() * 10000)
    server = new DashboardServer({ port, host: '127.0.0.1' })
    await server.start()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterEach(async () => {
    await server.stop()
  })

  it('POST /api/upload stores a file', async () => {
    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test.txt',
        type: 'text/plain',
        content: 'Hello World',
        size: 11,
      }),
    })
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.ok).toBe(true)
    expect(data.file.name).toBe('test.txt')
    expect(data.file.type).toBe('text/plain')
    expect(data.file.id).toBeTruthy()
  })

  it('POST /api/upload rejects missing content', async () => {
    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test.txt' }),
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/upload rejects invalid JSON', async () => {
    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    expect(res.status).toBe(400)
  })

  it('GET /api/uploads returns uploaded files', async () => {
    await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'a.txt', type: 'text/plain', content: 'aaa', size: 3 }),
    })
    await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'b.js', type: 'text/javascript', content: 'bbb', size: 3 }),
    })
    const res = await fetch(`${baseUrl}/api/uploads`)
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.files.length).toBe(2)
  })

  it('chat with local-brain and file attachment works', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-brain',
        messages: [{ role: 'user', content: 'Analyze this file' }],
        attachments: [{
          id: 'test-file-1',
          name: 'example.py',
          type: 'text/x-python',
          size: 42,
          content: 'def hello():\n    print("Hello World")\n\nhello()',
        }],
      }),
    })
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.text).toBeTruthy()
    expect(data.model).toBe('local-brain')
  })

  it('chat with local-brain and image attachment works', async () => {
    // Use a minimal valid base64 "image" (1x1 PNG pixel)
    const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-brain',
        messages: [{ role: 'user', content: 'What is in this image?' }],
        attachments: [{
          id: 'test-img-1',
          name: 'photo.png',
          type: 'image/png',
          size: 100,
          content: minimalPng,
        }],
      }),
    })
    expect(res.status).toBe(200)
    const data = JSON.parse(res.body)
    expect(data.text).toBeTruthy()
    expect(data.model).toBe('local-brain')
  })

  it('chat page has file upload button', async () => {
    const res = await fetch(`${baseUrl}/chat`)
    expect(res.body).toContain('file-input')
    expect(res.body).toContain('📎')
  })

  it('chat page has image upload button', async () => {
    const res = await fetch(`${baseUrl}/chat`)
    expect(res.body).toContain('image-input')
    expect(res.body).toContain('🖼️')
  })

  it('chat page has attachment bar container', async () => {
    const res = await fetch(`${baseUrl}/chat`)
    expect(res.body).toContain('attachment-bar')
  })
})
