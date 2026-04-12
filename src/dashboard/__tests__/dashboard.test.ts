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
} from '../server.js'

import type {
  DashboardConfig,
  DashboardChatMessage,
  ChatSession,
  DashboardModelInfo,
  SystemStats,
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
      expect(config.defaultModel).toBe('qwen2.5-coder:7b')
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
      expect(data.defaultModel).toBe('qwen2.5-coder:7b')
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
