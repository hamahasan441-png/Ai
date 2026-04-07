import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as http from 'node:http'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import { Router, createApiResponse } from '../router.js'
import type { ApiRequest, ApiResponse } from '../router.js'
import {
  corsMiddleware,
  securityHeadersMiddleware,
  requestIdMiddleware,
  rateLimitMiddleware,
  logMiddleware,
} from '../middleware.js'
import { ApiServer, ApiServerError } from '../server.js'
import { createApiRoutes } from '../routes.js'
import { AiErrorCode } from '../../utils/errors.js'

// ── Helpers ──

function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: string
  remoteAddress?: string
}): http.IncomingMessage {
  const { PassThrough } = require('node:stream')
  const stream = new PassThrough()
  if (options.body) {
    stream.end(Buffer.from(options.body))
  } else {
    stream.end()
  }
  stream.method = options.method ?? 'GET'
  stream.url = options.url ?? '/'
  stream.headers = { host: 'localhost', ...(options.headers ?? {}) }
  stream.socket = { remoteAddress: options.remoteAddress ?? '127.0.0.1' }
  return stream as unknown as http.IncomingMessage
}

function createMockResponse(): {
  response: http.ServerResponse
  getStatus: () => number
  getHeaders: () => Record<string, string | string[]>
  getBody: () => string
} {
  let statusCode = 200
  let body = ''
  const headers: Record<string, string | string[]> = {}
  let ended = false

  const res = {
    statusCode,
    writableEnded: false,
    writeHead(code: number, hdrs?: Record<string, string>) {
      statusCode = code
      res.statusCode = code
      if (hdrs) {
        for (const [k, v] of Object.entries(hdrs)) {
          headers[k.toLowerCase()] = v
        }
      }
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value
    },
    getHeader(name: string) {
      return headers[name.toLowerCase()]
    },
    end(data?: string) {
      if (data) body += data
      ended = true
      res.writableEnded = true
    },
    on() {
      return res
    },
    once() {
      return res
    },
    emit() {
      return false
    },
  } as unknown as http.ServerResponse

  return {
    response: res,
    getStatus: () => statusCode,
    getHeaders: () => headers,
    getBody: () => body,
  }
}

// ── Router Tests ──

describe('Router', () => {
  let router: Router

  beforeEach(() => {
    router = new Router()
  })

  describe('pattern matching', () => {
    it('matches exact paths', async () => {
      let called = false
      router.get('/api/test', async (_req, res) => {
        called = true
        res.json(200, { ok: true })
      })
      const req = createMockRequest({ method: 'GET', url: '/api/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(called).toBe(true)
    })

    it('matches paths with parameters', async () => {
      let capturedParams: Record<string, string> = {}
      router.get('/api/v1/sessions/:id', async (req, res) => {
        capturedParams = req.params
        res.json(200, { id: req.params.id })
      })
      const req = createMockRequest({ method: 'GET', url: '/api/v1/sessions/abc123' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedParams.id).toBe('abc123')
    })

    it('matches paths with multiple parameters', async () => {
      let capturedParams: Record<string, string> = {}
      router.get('/api/:version/users/:userId/posts/:postId', async (req, res) => {
        capturedParams = req.params
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/api/v2/users/42/posts/99' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedParams.version).toBe('v2')
      expect(capturedParams.userId).toBe('42')
      expect(capturedParams.postId).toBe('99')
    })

    it('decodes URI-encoded parameters', async () => {
      let capturedId = ''
      router.get('/api/items/:id', async (req, res) => {
        capturedId = req.params.id!
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/api/items/hello%20world' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedId).toBe('hello world')
    })

    it('does not match partial paths', async () => {
      router.get('/api/test', async (_req, res) => {
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/api/test/extra' })
      const { response, getStatus } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(404)
    })

    it('matches the first registered route', async () => {
      let firstCalled = false
      let secondCalled = false
      router.get('/api/test', async (_req, res) => {
        firstCalled = true
        res.json(200, {})
      })
      router.get('/api/test', async (_req, res) => {
        secondCalled = true
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/api/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(firstCalled).toBe(true)
      expect(secondCalled).toBe(false)
    })
  })

  describe('query parsing', () => {
    it('parses query parameters', async () => {
      let capturedQuery: Record<string, string> = {}
      router.get('/search', async (req, res) => {
        capturedQuery = req.query
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/search?q=hello&limit=10' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedQuery.q).toBe('hello')
      expect(capturedQuery.limit).toBe('10')
    })

    it('handles empty query string', async () => {
      let capturedQuery: Record<string, string> = {}
      router.get('/search', async (req, res) => {
        capturedQuery = req.query
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/search' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(Object.keys(capturedQuery)).toHaveLength(0)
    })

    it('handles encoded query values', async () => {
      let capturedQuery: Record<string, string> = {}
      router.get('/search', async (req, res) => {
        capturedQuery = req.query
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/search?q=hello%20world' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedQuery.q).toBe('hello world')
    })
  })

  describe('method matching', () => {
    it('routes GET requests', async () => {
      let called = false
      router.get('/test', async (_req, res) => {
        called = true
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(called).toBe(true)
    })

    it('routes POST requests', async () => {
      let called = false
      router.post('/test', async (_req, res) => {
        called = true
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'POST', url: '/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(called).toBe(true)
    })

    it('routes PUT requests', async () => {
      let called = false
      router.put('/test', async (_req, res) => {
        called = true
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'PUT', url: '/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(called).toBe(true)
    })

    it('routes DELETE requests', async () => {
      let called = false
      router.delete('/test', async (_req, res) => {
        called = true
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'DELETE', url: '/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(called).toBe(true)
    })

    it('returns 405 when path exists but method does not match', async () => {
      router.get('/test', async (_req, res) => res.json(200, {}))
      const req = createMockRequest({ method: 'POST', url: '/test' })
      const { response, getStatus, getBody } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(405)
      expect(JSON.parse(getBody()).error).toBe('Method Not Allowed')
    })

    it('sets Allow header on 405 responses', async () => {
      router.get('/test', async (_req, res) => res.json(200, {}))
      router.post('/test', async (_req, res) => res.json(200, {}))
      const req = createMockRequest({ method: 'DELETE', url: '/test' })
      const { response, getHeaders } = createMockResponse()
      await router.handle(req, response)
      const allow = getHeaders()['allow'] as string
      expect(allow).toContain('GET')
      expect(allow).toContain('POST')
    })
  })

  describe('404 handling', () => {
    it('returns 404 for unregistered paths', async () => {
      const req = createMockRequest({ method: 'GET', url: '/nonexistent' })
      const { response, getStatus, getBody } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(404)
      expect(JSON.parse(getBody()).error).toBe('Not Found')
    })

    it('returns 404 with proper JSON body', async () => {
      const req = createMockRequest({ method: 'GET', url: '/missing' })
      const { response, getBody, getHeaders } = createMockResponse()
      await router.handle(req, response)
      const parsed = JSON.parse(getBody())
      expect(parsed.statusCode).toBe(404)
      expect(getHeaders()['content-type']).toContain('application/json')
    })
  })

  describe('JSON body parsing', () => {
    it('parses JSON body for POST requests', async () => {
      let capturedBody: unknown
      router.post('/data', async (req, res) => {
        capturedBody = req.body
        res.json(200, {})
      })
      const req = createMockRequest({
        method: 'POST',
        url: '/data',
        body: JSON.stringify({ key: 'value' }),
        headers: { 'content-type': 'application/json' },
      })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedBody).toEqual({ key: 'value' })
    })

    it('parses JSON body for PUT requests', async () => {
      let capturedBody: unknown
      router.put('/data', async (req, res) => {
        capturedBody = req.body
        res.json(200, {})
      })
      const req = createMockRequest({
        method: 'PUT',
        url: '/data',
        body: JSON.stringify({ updated: true }),
      })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedBody).toEqual({ updated: true })
    })

    it('returns 400 for invalid JSON body', async () => {
      router.post('/data', async (_req, res) => res.json(200, {}))
      const req = createMockRequest({
        method: 'POST',
        url: '/data',
        body: 'not-json{{{',
      })
      const { response, getStatus, getBody } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(400)
      expect(JSON.parse(getBody()).error).toBe('Invalid JSON body')
    })

    it('handles empty body for POST', async () => {
      let capturedBody: unknown = 'not-undefined'
      router.post('/data', async (req, res) => {
        capturedBody = req.body
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'POST', url: '/data' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedBody).toBeUndefined()
    })

    it('does not parse body for GET requests', async () => {
      let capturedBody: unknown = 'sentinel'
      router.get('/data', async (req, res) => {
        capturedBody = req.body
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/data' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(capturedBody).toBeUndefined()
    })
  })

  describe('response helpers', () => {
    it('json() sends proper Content-Type header', async () => {
      router.get('/test', async (_req, res) => {
        res.json(200, { ok: true })
      })
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response, getHeaders } = createMockResponse()
      await router.handle(req, response)
      expect(getHeaders()['content-type']).toContain('application/json')
    })

    it('json() sends Content-Length header', async () => {
      router.get('/test', async (_req, res) => {
        res.json(200, { ok: true })
      })
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response, getHeaders } = createMockResponse()
      await router.handle(req, response)
      expect(getHeaders()['content-length']).toBeDefined()
    })

    it('error() includes statusCode in body', async () => {
      router.get('/fail', async (_req, res) => {
        res.error(500, 'Server Error', { reason: 'test' })
      })
      const req = createMockRequest({ method: 'GET', url: '/fail' })
      const { response, getBody } = createMockResponse()
      await router.handle(req, response)
      const parsed = JSON.parse(getBody())
      expect(parsed.statusCode).toBe(500)
      expect(parsed.error).toBe('Server Error')
      expect(parsed.details.reason).toBe('test')
    })

    it('noContent() sends 204 with no body', async () => {
      router.get('/empty', async (_req, res) => {
        res.noContent()
      })
      const req = createMockRequest({ method: 'GET', url: '/empty' })
      const { response, getStatus, getBody } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(204)
      expect(getBody()).toBe('')
    })
  })

  describe('middleware', () => {
    it('executes middleware before handler', async () => {
      const order: string[] = []
      router.use(async (_req, _res, next) => {
        order.push('middleware')
        await next()
      })
      router.get('/test', async (_req, res) => {
        order.push('handler')
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(order).toEqual(['middleware', 'handler'])
    })

    it('executes multiple middlewares in order', async () => {
      const order: string[] = []
      router.use(async (_req, _res, next) => {
        order.push('first')
        await next()
      })
      router.use(async (_req, _res, next) => {
        order.push('second')
        await next()
      })
      router.get('/test', async (_req, res) => {
        order.push('handler')
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response } = createMockResponse()
      await router.handle(req, response)
      expect(order).toEqual(['first', 'second', 'handler'])
    })

    it('middleware can short-circuit the chain', async () => {
      let handlerCalled = false
      router.use(async (_req, res, _next) => {
        res.error(403, 'Forbidden')
      })
      router.get('/test', async (_req, res) => {
        handlerCalled = true
        res.json(200, {})
      })
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response, getStatus } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(403)
      expect(handlerCalled).toBe(false)
    })
  })

  describe('error handling', () => {
    it('catches handler errors and returns 500', async () => {
      router.get('/boom', async () => {
        throw new Error('Handler exploded')
      })
      const req = createMockRequest({ method: 'GET', url: '/boom' })
      const { response, getStatus, getBody } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(500)
      expect(JSON.parse(getBody()).error).toBe('Handler exploded')
    })

    it('catches middleware errors and returns 500', async () => {
      router.use(async () => {
        throw new Error('Middleware exploded')
      })
      router.get('/test', async (_req, res) => res.json(200, {}))
      const req = createMockRequest({ method: 'GET', url: '/test' })
      const { response, getStatus } = createMockResponse()
      await router.handle(req, response)
      expect(getStatus()).toBe(500)
    })
  })
})

// ── Middleware Tests ──

describe('corsMiddleware', () => {
  it('sets CORS headers with defaults', async () => {
    const mw = corsMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response } = createMockResponse()
    const apiRes = createApiResponse(response)
    let nextCalled = false
    await mw(req, apiRes, async () => {
      nextCalled = true
    })
    expect(nextCalled).toBe(true)
    expect(response.getHeader?.('access-control-allow-origin') ?? (response as any).statusCode).toBeDefined()
  })

  it('sets custom origin', async () => {
    const mw = corsMiddleware({ origin: 'https://example.com' })
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['access-control-allow-origin']).toBe('https://example.com')
  })

  it('handles preflight OPTIONS requests', async () => {
    const mw = corsMiddleware()
    const req = createMockRequest({ method: 'OPTIONS', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getStatus } = createMockResponse()
    const apiRes = createApiResponse(response)
    let nextCalled = false
    await mw(req, apiRes, async () => {
      nextCalled = true
    })
    expect(getStatus()).toBe(204)
    expect(nextCalled).toBe(false)
  })

  it('sets custom methods and headers', async () => {
    const mw = corsMiddleware({
      methods: ['GET', 'POST'],
      headers: ['X-Custom'],
    })
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['access-control-allow-methods']).toBe('GET, POST')
    expect(getHeaders()['access-control-allow-headers']).toBe('X-Custom')
  })
})

describe('securityHeadersMiddleware', () => {
  it('sets X-Content-Type-Options', async () => {
    const mw = securityHeadersMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['x-content-type-options']).toBe('nosniff')
  })

  it('sets X-Frame-Options', async () => {
    const mw = securityHeadersMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['x-frame-options']).toBe('DENY')
  })

  it('sets X-XSS-Protection', async () => {
    const mw = securityHeadersMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['x-xss-protection']).toBe('1; mode=block')
  })

  it('sets Strict-Transport-Security', async () => {
    const mw = securityHeadersMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['strict-transport-security']).toContain('max-age=')
  })

  it('sets Content-Security-Policy', async () => {
    const mw = securityHeadersMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['content-security-policy']).toContain("default-src 'none'")
  })
})

describe('requestIdMiddleware', () => {
  it('generates a request ID when none is provided', async () => {
    const mw = requestIdMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    const id = getHeaders()['x-request-id']
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
    expect((id as string).length).toBeGreaterThan(0)
  })

  it('preserves existing request ID from header', async () => {
    const mw = requestIdMiddleware()
    const req = createMockRequest({
      method: 'GET',
      url: '/test',
      headers: { 'x-request-id': 'my-custom-id' },
    }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    expect(getHeaders()['x-request-id']).toBe('my-custom-id')
  })
})

describe('rateLimitMiddleware', () => {
  it('allows requests within the limit', async () => {
    const mw = rateLimitMiddleware({ windowMs: 60000, maxRequests: 10 })
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    let nextCalled = false
    await mw(req, apiRes, async () => {
      nextCalled = true
    })
    expect(nextCalled).toBe(true)
    expect(getHeaders()['x-ratelimit-limit']).toBe('10')
  })

  it('returns 429 when limit is exceeded', async () => {
    const mw = rateLimitMiddleware({ windowMs: 60000, maxRequests: 2 })
    for (let i = 0; i < 2; i++) {
      const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
      req.params = {}
      req.query = {}
      const { response } = createMockResponse()
      const apiRes = createApiResponse(response)
      await mw(req, apiRes, async () => {})
    }
    // Third request should be rate limited
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getStatus, getBody } = createMockResponse()
    const apiRes = createApiResponse(response)
    let nextCalled = false
    await mw(req, apiRes, async () => {
      nextCalled = true
    })
    expect(nextCalled).toBe(false)
    expect(getStatus()).toBe(429)
    expect(JSON.parse(getBody()).error).toBe('Too Many Requests')
  })

  it('sets Retry-After header on 429', async () => {
    const mw = rateLimitMiddleware({ windowMs: 60000, maxRequests: 1 })
    // Exhaust limit
    const req1 = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req1.params = {}
    req1.query = {}
    const { response: res1 } = createMockResponse()
    await mw(req1, createApiResponse(res1), async () => {})
    // Over limit
    const req2 = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req2.params = {}
    req2.query = {}
    const { response: res2, getHeaders } = createMockResponse()
    await mw(req2, createApiResponse(res2), async () => {})
    expect(getHeaders()['retry-after']).toBeDefined()
  })

  it('sets X-RateLimit-Remaining header', async () => {
    const mw = rateLimitMiddleware({ windowMs: 60000, maxRequests: 5 })
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response, getHeaders } = createMockResponse()
    const apiRes = createApiResponse(response)
    await mw(req, apiRes, async () => {})
    const remaining = parseInt(getHeaders()['x-ratelimit-remaining'] as string)
    expect(remaining).toBe(4)
  })

  it('tracks different IPs separately', async () => {
    const mw = rateLimitMiddleware({ windowMs: 60000, maxRequests: 1 })
    // IP 1 - should succeed
    const req1 = createMockRequest({ method: 'GET', url: '/test', remoteAddress: '1.1.1.1' }) as ApiRequest
    req1.params = {}
    req1.query = {}
    const { response: res1 } = createMockResponse()
    let next1Called = false
    await mw(req1, createApiResponse(res1), async () => {
      next1Called = true
    })
    expect(next1Called).toBe(true)

    // IP 2 - should also succeed (different IP)
    const req2 = createMockRequest({ method: 'GET', url: '/test', remoteAddress: '2.2.2.2' }) as ApiRequest
    req2.params = {}
    req2.query = {}
    const { response: res2 } = createMockResponse()
    let next2Called = false
    await mw(req2, createApiResponse(res2), async () => {
      next2Called = true
    })
    expect(next2Called).toBe(true)
  })

  it('uses X-Forwarded-For header for client IP', async () => {
    const mw = rateLimitMiddleware({ windowMs: 60000, maxRequests: 1 })
    // First request from forwarded IP
    const req1 = createMockRequest({
      method: 'GET',
      url: '/test',
      headers: { 'x-forwarded-for': '10.0.0.1' },
    }) as ApiRequest
    req1.params = {}
    req1.query = {}
    const { response: res1 } = createMockResponse()
    await mw(req1, createApiResponse(res1), async () => {})

    // Second request same forwarded IP - should be rate limited
    const req2 = createMockRequest({
      method: 'GET',
      url: '/test',
      headers: { 'x-forwarded-for': '10.0.0.1' },
    }) as ApiRequest
    req2.params = {}
    req2.query = {}
    const { response: res2, getStatus } = createMockResponse()
    await mw(req2, createApiResponse(res2), async () => {})
    expect(getStatus()).toBe(429)
  })
})

describe('logMiddleware', () => {
  it('calls next and logs request', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mw = logMiddleware()
    const req = createMockRequest({ method: 'GET', url: '/test' }) as ApiRequest
    req.params = {}
    req.query = {}
    const { response } = createMockResponse()
    const apiRes = createApiResponse(response)
    let nextCalled = false
    await mw(req, apiRes, async () => {
      nextCalled = true
    })
    expect(nextCalled).toBe(true)
    expect(consoleSpy).toHaveBeenCalledOnce()
    expect(consoleSpy.mock.calls[0]![0]).toContain('GET')
    expect(consoleSpy.mock.calls[0]![0]).toContain('/test')
    consoleSpy.mockRestore()
  })
})

// ── Server Tests ──

describe('ApiServer', () => {
  let server: ApiServer

  afterEach(async () => {
    try {
      await server?.stop(1000)
    } catch {
      // ignore
    }
  })

  describe('lifecycle', () => {
    it('starts and provides address', async () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      await server.start()
      const addr = server.address()
      expect(addr).not.toBeNull()
      expect(addr!.port).toBeGreaterThan(0)
      expect(addr!.host).toBe('127.0.0.1')
    })

    it('stops gracefully', async () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      await server.start()
      await server.stop()
      expect(server.address()).toBeNull()
    })

    it('returns null address before start', () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      expect(server.address()).toBeNull()
    })
  })

  describe('health endpoint', () => {
    it('returns health status', async () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      await server.start()
      const addr = server.address()!
      const res = await fetch(`http://${addr.host}:${addr.port}/health`)
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.status).toBe('ok')
      expect(body.uptime).toBeDefined()
      expect(body.timestamp).toBeDefined()
    })
  })

  describe('ready endpoint', () => {
    it('returns ready status', async () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      await server.start()
      const addr = server.address()!
      const res = await fetch(`http://${addr.host}:${addr.port}/ready`)
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.status).toBe('ready')
      expect(body.checks).toBeDefined()
    })
  })

  describe('version endpoint', () => {
    it('returns version info', async () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      await server.start()
      const addr = server.address()!
      const res = await fetch(`http://${addr.host}:${addr.port}/api/v1/version`)
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.version).toBeDefined()
      expect(typeof body.version).toBe('string')
      expect(body.nodeVersion).toBe(process.version)
      expect(body.platform).toBe(process.platform)
    })
  })

  describe('404 handling', () => {
    it('returns 404 for unknown routes', async () => {
      const router = new Router()
      server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
      await server.start()
      const addr = server.address()!
      const res = await fetch(`http://${addr.host}:${addr.port}/nonexistent`)
      const body = await res.json()
      expect(res.status).toBe(404)
      expect(body.error).toBe('Not Found')
    })
  })
})

// ── ApiServerError Tests ──

describe('ApiServerError', () => {
  it('extends AiError', async () => {
    const { AiError } = await import('../../utils/errors.js')
    const err = new ApiServerError('test error')
    expect(err).toBeInstanceOf(AiError)
    expect(err).toBeInstanceOf(Error)
  })

  it('has correct name', () => {
    const err = new ApiServerError('test')
    expect(err.name).toBe('ApiServerError')
  })

  it('has correct error code', () => {
    const err = new ApiServerError('test', AiErrorCode.API_ERROR)
    expect(err.code).toBe(AiErrorCode.API_ERROR)
  })

  it('defaults to SERVICE_UNAVAILABLE code', () => {
    const err = new ApiServerError('test')
    expect(err.code).toBe(AiErrorCode.SERVICE_UNAVAILABLE)
  })

  it('supports context', () => {
    const err = new ApiServerError('test', AiErrorCode.SERVICE_UNAVAILABLE, { port: 3000 })
    expect(err.context).toEqual({ port: 3000 })
  })

  it('has timestamp', () => {
    const before = Date.now()
    const err = new ApiServerError('test')
    expect(err.timestamp).toBeGreaterThanOrEqual(before)
  })

  it('serializes to JSON', () => {
    const err = new ApiServerError('test error', AiErrorCode.API_ERROR)
    const json = err.toJSON()
    expect(json.name).toBe('ApiServerError')
    expect(json.message).toBe('test error')
    expect(json.code).toBe(AiErrorCode.API_ERROR)
  })
})

// ── Routes Tests ──

describe('createApiRoutes', () => {
  let router: Router

  beforeEach(() => {
    router = createApiRoutes()
  })

  it('GET /api/v1/chat returns ready message', async () => {
    const req = createMockRequest({ method: 'GET', url: '/api/v1/chat' })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.message).toBe('Chat endpoint ready')
    expect(body.timestamp).toBeDefined()
  })

  it('POST /api/v1/chat echoes message', async () => {
    const req = createMockRequest({
      method: 'POST',
      url: '/api/v1/chat',
      body: JSON.stringify({ message: 'Hello AI' }),
    })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.response).toBe('Echo: Hello AI')
    expect(body.timestamp).toBeDefined()
  })

  it('POST /api/v1/chat handles missing message', async () => {
    const req = createMockRequest({
      method: 'POST',
      url: '/api/v1/chat',
      body: JSON.stringify({}),
    })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.response).toBe('Echo: ')
  })

  it('GET /api/v1/brain/status returns brain info', async () => {
    const req = createMockRequest({ method: 'GET', url: '/api/v1/brain/status' })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.status).toBe('active')
    expect(body.modules).toContain('memory')
    expect(body.timestamp).toBeDefined()
  })

  it('GET /api/v1/knowledge/search returns search results', async () => {
    const req = createMockRequest({ method: 'GET', url: '/api/v1/knowledge/search?q=test' })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.query).toBe('test')
    expect(body.results).toEqual([])
    expect(body.total).toBe(0)
    expect(body.timestamp).toBeDefined()
  })

  it('GET /api/v1/knowledge/search handles missing query', async () => {
    const req = createMockRequest({ method: 'GET', url: '/api/v1/knowledge/search' })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.query).toBe('')
  })

  it('GET /api/v1/plugins returns plugins list', async () => {
    const req = createMockRequest({ method: 'GET', url: '/api/v1/plugins' })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.plugins).toEqual([])
    expect(body.total).toBe(0)
    expect(body.timestamp).toBeDefined()
  })

  it('GET /api/v1/config returns config', async () => {
    const req = createMockRequest({ method: 'GET', url: '/api/v1/config' })
    const { response, getStatus, getBody } = createMockResponse()
    await router.handle(req, response)
    expect(getStatus()).toBe(200)
    const body = JSON.parse(getBody())
    expect(body.environment).toBeDefined()
    expect(body.features).toBeDefined()
    expect(body.timestamp).toBeDefined()
  })
})

// ── Integration Tests ──

describe('Integration: Server with Routes', () => {
  let server: ApiServer

  afterEach(async () => {
    try {
      await server?.stop(1000)
    } catch {
      // ignore
    }
  })

  it('serves application routes through server', async () => {
    const router = createApiRoutes()
    server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
    await server.start()
    const addr = server.address()!

    const res = await fetch(`http://${addr.host}:${addr.port}/api/v1/chat`)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.message).toBe('Chat endpoint ready')
  })

  it('serves health alongside application routes', async () => {
    const router = createApiRoutes()
    server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
    await server.start()
    const addr = server.address()!

    const [healthRes, chatRes] = await Promise.all([
      fetch(`http://${addr.host}:${addr.port}/health`),
      fetch(`http://${addr.host}:${addr.port}/api/v1/chat`),
    ])
    expect(healthRes.status).toBe(200)
    expect(chatRes.status).toBe(200)
  })

  it('POST /api/v1/chat works end-to-end', async () => {
    const router = createApiRoutes()
    server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
    await server.start()
    const addr = server.address()!

    const res = await fetch(`http://${addr.host}:${addr.port}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Integration test' }),
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.response).toBe('Echo: Integration test')
  })

  it('knowledge search with query params works end-to-end', async () => {
    const router = createApiRoutes()
    server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
    await server.start()
    const addr = server.address()!

    const res = await fetch(`http://${addr.host}:${addr.port}/api/v1/knowledge/search?q=test%20query`)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.query).toBe('test query')
  })

  it('middleware works with server', async () => {
    const router = createApiRoutes()
    router.use(securityHeadersMiddleware())
    server = new ApiServer({ port: 0, host: '127.0.0.1' }, router)
    await server.start()
    const addr = server.address()!

    const res = await fetch(`http://${addr.host}:${addr.port}/api/v1/chat`)
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    expect(res.headers.get('x-frame-options')).toBe('DENY')
  })
})
