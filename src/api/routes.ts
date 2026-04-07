/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Routes                                                                  ║
 * ║                                                                              ║
 * ║  Application route definitions for the REST API, including chat, brain,      ║
 * ║  knowledge, plugin, and config endpoints.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Router } from './router.js'

export function createApiRoutes(): Router {
  const router = new Router()

  router.get('/api/v1/chat', async (_req, res) => {
    res.json(200, {
      message: 'Chat endpoint ready',
      timestamp: new Date().toISOString(),
    })
  })

  router.post('/api/v1/chat', async (req, res) => {
    const body = req.body as { message?: string } | undefined
    const message = body?.message ?? ''
    res.json(200, {
      response: `Echo: ${message}`,
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/api/v1/brain/status', async (_req, res) => {
    res.json(200, {
      status: 'active',
      modules: ['memory', 'reasoning', 'learning'],
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/api/v1/knowledge/search', async (req, res) => {
    const query = req.query.q ?? ''
    res.json(200, {
      query,
      results: [],
      total: 0,
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/api/v1/plugins', async (_req, res) => {
    res.json(200, {
      plugins: [],
      total: 0,
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/api/v1/config', async (_req, res) => {
    res.json(200, {
      environment: process.env.NODE_ENV ?? 'development',
      features: {},
      timestamp: new Date().toISOString(),
    })
  })

  return router
}
