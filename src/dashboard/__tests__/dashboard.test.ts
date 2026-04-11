import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { createServer } from 'http'

// We test the dashboard API handlers by importing the module and checking its exports
describe('Dashboard Server', () => {
  it('should export startDashboard function', async () => {
    // Dynamic import to avoid side effects
    const mod = await import('../server.js')
    expect(typeof mod.startDashboard).toBe('function')
  })

  describe('API endpoints', () => {
    let server: ReturnType<typeof createServer>
    let port: number

    beforeAll(async () => {
      // Use a random high port to avoid conflicts
      port = 40000 + Math.floor(Math.random() * 10000)
      process.env.AI_DASHBOARD_PORT = String(port)
      const mod = await import('../server.js')
      server = mod.startDashboard(port)
      // Wait for server to be ready
      await new Promise(resolve => setTimeout(resolve, 500))
    })

    afterAll(() => {
      if (server) server.close()
    })

    it('GET /api/status returns system info', async () => {
      const resp = await fetch(`http://localhost:${port}/api/status`)
      expect(resp.status).toBe(200)
      const data = await resp.json()
      expect(data.ok).toBe(true)
      expect(data).toHaveProperty('nodeVersion')
      expect(data).toHaveProperty('platform')
      expect(data).toHaveProperty('memoryMB')
      expect(data).toHaveProperty('pid')
    })

    it('GET /api/models returns model list', async () => {
      const resp = await fetch(`http://localhost:${port}/api/models`)
      expect(resp.status).toBe(200)
      const data = await resp.json()
      expect(data.ok).toBe(true)
      expect(Array.isArray(data.models)).toBe(true)
    })

    it('GET /api/modules returns module list', async () => {
      const resp = await fetch(`http://localhost:${port}/api/modules`)
      expect(resp.status).toBe(200)
      const data = await resp.json()
      expect(data.ok).toBe(true)
      expect(Array.isArray(data.modules)).toBe(true)
    })

    it('GET /api/config returns configuration', async () => {
      const resp = await fetch(`http://localhost:${port}/api/config`)
      expect(resp.status).toBe(200)
      const data = await resp.json()
      expect(data.ok).toBe(true)
      expect(data.config).toHaveProperty('ollamaUrl')
      expect(data.config).toHaveProperty('defaultModel')
      expect(data.config).toHaveProperty('version')
    })

    it('GET /api/unknown returns 404', async () => {
      const resp = await fetch(`http://localhost:${port}/api/unknown`)
      expect(resp.status).toBe(404)
      const data = await resp.json()
      expect(data.ok).toBe(false)
    })

    it('GET / returns dashboard HTML', async () => {
      const resp = await fetch(`http://localhost:${port}/`)
      expect(resp.status).toBe(200)
      const html = await resp.text()
      expect(html).toContain('AI Dashboard')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('dashboard HTML contains no Anthropic references', async () => {
      const resp = await fetch(`http://localhost:${port}/`)
      const html = await resp.text()
      expect(html.toLowerCase()).not.toContain('anthropic')
      expect(html.toLowerCase()).not.toContain('claude')
    })

    it('config shows local-only settings', async () => {
      const resp = await fetch(`http://localhost:${port}/api/config`)
      const data = await resp.json()
      expect(data.config.ollamaUrl).toContain('localhost')
      expect(data.config.llamaCppUrl).toContain('localhost')
    })
  })
})
