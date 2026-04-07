import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({ APIUserAbortError: class extends Error {} }))

import { generateOpenApiSpec, serveOpenApiSpec, serveSwaggerUi } from '../openapi.js'
import type { OpenApiSpec } from '../openapi.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSpec(baseUrl?: string): OpenApiSpec {
  return generateOpenApiSpec(baseUrl ? { baseUrl } : undefined)
}

function mockRes() {
  const headers: Record<string, string | number> = {}
  let statusCode = 0
  let body = ''
  let jsonData: unknown = undefined
  return {
    raw: {
      writeHead(code: number, hdrs?: Record<string, string | number>) {
        statusCode = code
        if (hdrs) Object.assign(headers, hdrs)
      },
      end(data?: string) {
        body = data ?? ''
      },
      writableEnded: false,
    },
    json(code: number, data: unknown) {
      statusCode = code
      jsonData = data
    },
    error(code: number, msg: string) {
      statusCode = code
      body = msg
    },
    noContent() {
      statusCode = 204
    },
    get _statusCode() {
      return statusCode
    },
    get _body() {
      return body
    },
    get _headers() {
      return headers
    },
    get _jsonData() {
      return jsonData
    },
  }
}

function mockReq() {
  return {
    params: {},
    query: {},
    body: undefined,
    headers: {},
    url: '/',
    method: 'GET',
  } as any
}

// ── Spec Structure ───────────────────────────────────────────────────────────

describe('OpenAPI Spec Structure', () => {
  const spec = getSpec()

  it('should have openapi version 3.0.3', () => {
    expect(spec.openapi).toBe('3.0.3')
  })

  it('should have info object with required fields', () => {
    expect(spec.info).toBeDefined()
    expect(spec.info.title).toBe('AI API')
    expect(spec.info.version).toBe('1.0.0')
    expect(spec.info.description).toBeTruthy()
  })

  it('should have contact info', () => {
    expect(spec.info.contact).toBeDefined()
    expect(spec.info.contact!.name).toBeTruthy()
  })

  it('should have license info', () => {
    expect(spec.info.license).toBeDefined()
    expect(spec.info.license!.name).toBe('MIT')
    expect(spec.info.license!.url).toBeTruthy()
  })

  it('should have servers array with default base URL', () => {
    expect(spec.servers).toBeInstanceOf(Array)
    expect(spec.servers.length).toBeGreaterThan(0)
    expect(spec.servers[0]!.url).toBe('http://localhost:3000')
  })

  it('should have paths object', () => {
    expect(spec.paths).toBeDefined()
    expect(typeof spec.paths).toBe('object')
  })

  it('should have components object', () => {
    expect(spec.components).toBeDefined()
  })

  it('should have components.schemas', () => {
    expect(spec.components.schemas).toBeDefined()
    expect(Object.keys(spec.components.schemas).length).toBeGreaterThan(0)
  })

  it('should have components.securitySchemes', () => {
    expect(spec.components.securitySchemes).toBeDefined()
  })

  it('should have components.responses', () => {
    expect(spec.components.responses).toBeDefined()
  })

  it('should have components.headers', () => {
    expect(spec.components.headers).toBeDefined()
  })

  it('should have global security requirements', () => {
    expect(spec.security).toBeInstanceOf(Array)
    expect(spec.security.length).toBeGreaterThan(0)
  })

  it('should have tags array', () => {
    expect(spec.tags).toBeInstanceOf(Array)
    expect(spec.tags.length).toBeGreaterThan(0)
  })

  it('should include expected tag names', () => {
    const tagNames = spec.tags.map((t) => t.name)
    expect(tagNames).toContain('chat')
    expect(tagNames).toContain('brain')
    expect(tagNames).toContain('knowledge')
    expect(tagNames).toContain('plugins')
    expect(tagNames).toContain('config')
    expect(tagNames).toContain('system')
  })
})

// ── Route Paths ──────────────────────────────────────────────────────────────

describe('OpenAPI Route Paths', () => {
  const spec = getSpec()
  const paths = Object.keys(spec.paths)

  it('should include /health path', () => {
    expect(paths).toContain('/health')
  })

  it('should include /ready path', () => {
    expect(paths).toContain('/ready')
  })

  it('should include /api/v1/version path', () => {
    expect(paths).toContain('/api/v1/version')
  })

  it('should include /api/v1/chat path', () => {
    expect(paths).toContain('/api/v1/chat')
  })

  it('should include /api/v1/brain/status path', () => {
    expect(paths).toContain('/api/v1/brain/status')
  })

  it('should include /api/v1/knowledge/search path', () => {
    expect(paths).toContain('/api/v1/knowledge/search')
  })

  it('should include /api/v1/plugins path', () => {
    expect(paths).toContain('/api/v1/plugins')
  })

  it('should include /api/v1/config path', () => {
    expect(paths).toContain('/api/v1/config')
  })

  it('should define GET method on /health', () => {
    expect(spec.paths['/health']!.get).toBeDefined()
  })

  it('should define GET and POST methods on /api/v1/chat', () => {
    expect(spec.paths['/api/v1/chat']!.get).toBeDefined()
    expect(spec.paths['/api/v1/chat']!.post).toBeDefined()
  })
})

// ── Request / Response Schemas ───────────────────────────────────────────────

describe('Request and Response Schemas', () => {
  const spec = getSpec()

  it('should have ChatRequest schema with message property', () => {
    const schema = spec.components.schemas['ChatRequest']
    expect(schema).toBeDefined()
    expect(schema!.properties).toBeDefined()
    expect(schema!.properties!['message']).toBeDefined()
    expect(schema!.properties!['message']!.type).toBe('string')
  })

  it('should have ChatResponse schema with response and timestamp', () => {
    const schema = spec.components.schemas['ChatResponse']
    expect(schema).toBeDefined()
    expect(schema!.required).toContain('response')
    expect(schema!.required).toContain('timestamp')
  })

  it('should have ChatStatusResponse schema', () => {
    const schema = spec.components.schemas['ChatStatusResponse']
    expect(schema).toBeDefined()
    expect(schema!.properties!['message']).toBeDefined()
    expect(schema!.properties!['timestamp']).toBeDefined()
  })

  it('should have HealthResponse schema with status, uptime, timestamp', () => {
    const schema = spec.components.schemas['HealthResponse']
    expect(schema).toBeDefined()
    expect(schema!.required).toContain('status')
    expect(schema!.required).toContain('uptime')
    expect(schema!.required).toContain('timestamp')
  })

  it('should have ReadyResponse schema with status and checks', () => {
    const schema = spec.components.schemas['ReadyResponse']
    expect(schema).toBeDefined()
    expect(schema!.required).toContain('status')
    expect(schema!.required).toContain('checks')
  })

  it('should have VersionResponse schema with version, nodeVersion, platform', () => {
    const schema = spec.components.schemas['VersionResponse']
    expect(schema).toBeDefined()
    expect(schema!.required).toContain('version')
    expect(schema!.required).toContain('nodeVersion')
    expect(schema!.required).toContain('platform')
  })

  it('should have BrainStatusResponse schema with modules array', () => {
    const schema = spec.components.schemas['BrainStatusResponse']
    expect(schema).toBeDefined()
    expect(schema!.properties!['modules']!.type).toBe('array')
    expect(schema!.properties!['modules']!.items).toBeDefined()
  })

  it('should have KnowledgeSearchResponse schema with query, results, total', () => {
    const schema = spec.components.schemas['KnowledgeSearchResponse']
    expect(schema).toBeDefined()
    expect(schema!.required).toContain('query')
    expect(schema!.required).toContain('results')
    expect(schema!.required).toContain('total')
  })

  it('should have PluginsResponse schema with plugins array', () => {
    const schema = spec.components.schemas['PluginsResponse']
    expect(schema).toBeDefined()
    expect(schema!.properties!['plugins']!.type).toBe('array')
  })

  it('should have ConfigResponse schema with environment and features', () => {
    const schema = spec.components.schemas['ConfigResponse']
    expect(schema).toBeDefined()
    expect(schema!.required).toContain('environment')
    expect(schema!.required).toContain('features')
  })

  it('should define requestBody on POST /api/v1/chat', () => {
    const op = spec.paths['/api/v1/chat']!.post!
    expect(op.requestBody).toBeDefined()
    expect(op.requestBody!.required).toBe(true)
    expect(op.requestBody!.content['application/json']).toBeDefined()
  })

  it('should reference ChatRequest schema in POST /api/v1/chat requestBody', () => {
    const content = spec.paths['/api/v1/chat']!.post!.requestBody!.content['application/json']!
    expect(content.schema.$ref).toBe('#/components/schemas/ChatRequest')
  })

  it('should define query parameter on knowledge search', () => {
    const op = spec.paths['/api/v1/knowledge/search']!.get!
    expect(op.parameters).toBeDefined()
    expect(op.parameters!.length).toBeGreaterThan(0)
    const qParam = op.parameters!.find((p) => p.name === 'q')
    expect(qParam).toBeDefined()
    expect(qParam!.in).toBe('query')
  })
})

// ── Authentication Security Schemes ──────────────────────────────────────────

describe('Authentication Security Schemes', () => {
  const spec = getSpec()

  it('should define ApiKeyAuth security scheme', () => {
    const scheme = spec.components.securitySchemes['ApiKeyAuth']
    expect(scheme).toBeDefined()
    expect(scheme!.type).toBe('apiKey')
    expect(scheme!.name).toBe('X-API-Key')
    expect(scheme!.in).toBe('header')
  })

  it('should define SessionToken security scheme', () => {
    const scheme = spec.components.securitySchemes['SessionToken']
    expect(scheme).toBeDefined()
    expect(scheme!.type).toBe('http')
    expect(scheme!.scheme).toBe('bearer')
    expect(scheme!.bearerFormat).toBe('JWT')
  })

  it('should have global security that includes ApiKeyAuth', () => {
    const hasApiKey = spec.security.some((s) => 'ApiKeyAuth' in s)
    expect(hasApiKey).toBe(true)
  })

  it('should have global security that includes SessionToken', () => {
    const hasSession = spec.security.some((s) => 'SessionToken' in s)
    expect(hasSession).toBe(true)
  })

  it('should override security to empty on health endpoint', () => {
    const op = spec.paths['/health']!.get!
    expect(op.security).toEqual([])
  })

  it('should override security to empty on ready endpoint', () => {
    const op = spec.paths['/ready']!.get!
    expect(op.security).toEqual([])
  })

  it('should override security to empty on version endpoint', () => {
    const op = spec.paths['/api/v1/version']!.get!
    expect(op.security).toEqual([])
  })
})

// ── Error Response Schemas ───────────────────────────────────────────────────

describe('Error Response Schemas', () => {
  const spec = getSpec()

  it('should have ErrorResponse schema', () => {
    const schema = spec.components.schemas['ErrorResponse']
    expect(schema).toBeDefined()
    expect(schema!.type).toBe('object')
  })

  it('should have error and statusCode as required in ErrorResponse', () => {
    const schema = spec.components.schemas['ErrorResponse']!
    expect(schema.required).toContain('error')
    expect(schema.required).toContain('statusCode')
  })

  it('should define 400 error response in components', () => {
    expect(spec.components.responses['400']).toBeDefined()
    expect(spec.components.responses['400']!.description).toContain('Bad Request')
  })

  it('should define 401 error response in components', () => {
    expect(spec.components.responses['401']).toBeDefined()
    expect(spec.components.responses['401']!.description).toContain('Unauthorized')
  })

  it('should define 403 error response in components', () => {
    expect(spec.components.responses['403']).toBeDefined()
    expect(spec.components.responses['403']!.description).toContain('Forbidden')
  })

  it('should define 404 error response in components', () => {
    expect(spec.components.responses['404']).toBeDefined()
    expect(spec.components.responses['404']!.description).toContain('Not Found')
  })

  it('should define 429 error response in components with rate limit headers', () => {
    const resp = spec.components.responses['429']!
    expect(resp).toBeDefined()
    expect(resp.description).toContain('Too Many Requests')
    expect(resp.headers).toBeDefined()
    expect(resp.headers!['X-RateLimit-Limit']).toBeDefined()
    expect(resp.headers!['X-RateLimit-Remaining']).toBeDefined()
    expect(resp.headers!['X-RateLimit-Reset']).toBeDefined()
  })

  it('should define 500 error response in components', () => {
    expect(spec.components.responses['500']).toBeDefined()
    expect(spec.components.responses['500']!.description).toContain('Internal Server Error')
  })

  it('should reference ErrorResponse schema in error content', () => {
    const content = spec.components.responses['400']!.content!['application/json']!
    expect(content.schema.$ref).toBe('#/components/schemas/ErrorResponse')
  })

  it('should include error responses on POST /api/v1/chat', () => {
    const responses = spec.paths['/api/v1/chat']!.post!.responses
    expect(responses['400']).toBeDefined()
    expect(responses['401']).toBeDefined()
    expect(responses['500']).toBeDefined()
  })

  it('should include 429 error on GET /api/v1/chat', () => {
    const responses = spec.paths['/api/v1/chat']!.get!.responses
    expect(responses['429']).toBeDefined()
  })

  it('should include 403 error on GET /api/v1/config', () => {
    const responses = spec.paths['/api/v1/config']!.get!.responses
    expect(responses['403']).toBeDefined()
  })
})

// ── Rate Limit Headers ───────────────────────────────────────────────────────

describe('Rate Limit Headers', () => {
  const spec = getSpec()

  it('should define X-RateLimit-Limit in component headers', () => {
    expect(spec.components.headers['X-RateLimit-Limit']).toBeDefined()
    expect(spec.components.headers['X-RateLimit-Limit']!.schema.type).toBe('integer')
  })

  it('should define X-RateLimit-Remaining in component headers', () => {
    expect(spec.components.headers['X-RateLimit-Remaining']).toBeDefined()
  })

  it('should define X-RateLimit-Reset in component headers', () => {
    expect(spec.components.headers['X-RateLimit-Reset']).toBeDefined()
  })

  it('should include rate limit headers on 200 responses', () => {
    const op = spec.paths['/api/v1/chat']!.get!
    const resp200 = op.responses['200']!
    expect(resp200.headers).toBeDefined()
    expect(resp200.headers!['X-RateLimit-Limit']).toBeDefined()
    expect(resp200.headers!['X-RateLimit-Remaining']).toBeDefined()
    expect(resp200.headers!['X-RateLimit-Reset']).toBeDefined()
  })
})

// ── Operation Details ────────────────────────────────────────────────────────

describe('Operation Details', () => {
  const spec = getSpec()

  it('should have unique operationIds for all operations', () => {
    const ids: string[] = []
    for (const pathItem of Object.values(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const op = pathItem![method]
        if (op) ids.push(op.operationId)
      }
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have summaries for all operations', () => {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const op = pathItem![method]
        if (op) {
          expect(op.summary, `${method.toUpperCase()} ${path} missing summary`).toBeTruthy()
        }
      }
    }
  })

  it('should have tags for all operations', () => {
    for (const pathItem of Object.values(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const op = pathItem![method]
        if (op) {
          expect(op.tags).toBeDefined()
          expect(op.tags!.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('should tag system endpoints with "system"', () => {
    expect(spec.paths['/health']!.get!.tags).toContain('system')
    expect(spec.paths['/ready']!.get!.tags).toContain('system')
    expect(spec.paths['/api/v1/version']!.get!.tags).toContain('system')
  })

  it('should tag chat endpoints with "chat"', () => {
    expect(spec.paths['/api/v1/chat']!.get!.tags).toContain('chat')
    expect(spec.paths['/api/v1/chat']!.post!.tags).toContain('chat')
  })
})

// ── Custom Base URL ──────────────────────────────────────────────────────────

describe('Custom Base URL', () => {
  it('should use custom baseUrl when provided', () => {
    const spec = getSpec('https://api.example.com')
    expect(spec.servers[0]!.url).toBe('https://api.example.com')
  })

  it('should default to localhost:3000 when no baseUrl provided', () => {
    const spec = getSpec()
    expect(spec.servers[0]!.url).toBe('http://localhost:3000')
  })
})

// ── JSON Serialization ───────────────────────────────────────────────────────

describe('JSON Serialization', () => {
  it('should serialize to valid JSON', () => {
    const spec = getSpec()
    const json = JSON.stringify(spec)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should round-trip through JSON without data loss', () => {
    const spec = getSpec()
    const parsed = JSON.parse(JSON.stringify(spec))
    expect(parsed.openapi).toBe(spec.openapi)
    expect(parsed.info.title).toBe(spec.info.title)
    expect(Object.keys(parsed.paths)).toEqual(Object.keys(spec.paths))
  })

  it('should produce deterministic output', () => {
    const json1 = JSON.stringify(getSpec())
    const json2 = JSON.stringify(getSpec())
    expect(json1).toBe(json2)
  })
})

// ── serveOpenApiSpec Handler ─────────────────────────────────────────────────

describe('serveOpenApiSpec', () => {
  it('should return a function', () => {
    const handler = serveOpenApiSpec()
    expect(typeof handler).toBe('function')
  })

  it('should serve the spec as JSON with status 200', async () => {
    const handler = serveOpenApiSpec()
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._statusCode).toBe(200)
    expect(res._jsonData).toBeDefined()
    expect((res._jsonData as any).openapi).toBe('3.0.3')
  })

  it('should accept custom baseUrl option', async () => {
    const handler = serveOpenApiSpec({ baseUrl: 'https://prod.example.com' })
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect((res._jsonData as any).servers[0].url).toBe('https://prod.example.com')
  })
})

// ── serveSwaggerUi Handler ───────────────────────────────────────────────────

describe('serveSwaggerUi', () => {
  it('should return a function', () => {
    const handler = serveSwaggerUi()
    expect(typeof handler).toBe('function')
  })

  it('should serve HTML with status 200', async () => {
    const handler = serveSwaggerUi()
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._statusCode).toBe(200)
    expect(res._headers['Content-Type']).toBe('text/html; charset=utf-8')
  })

  it('should include swagger-ui-dist CDN reference', async () => {
    const handler = serveSwaggerUi()
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._body).toContain('swagger-ui-dist')
    expect(res._body).toContain('cdn.jsdelivr.net')
  })

  it('should reference default spec URL', async () => {
    const handler = serveSwaggerUi()
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._body).toContain('/api/v1/openapi.json')
  })

  it('should use custom specUrl when provided', async () => {
    const handler = serveSwaggerUi({ specUrl: '/custom/spec.json' })
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._body).toContain('/custom/spec.json')
  })

  it('should include proper HTML structure', async () => {
    const handler = serveSwaggerUi()
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._body).toContain('<!DOCTYPE html>')
    expect(res._body).toContain('<div id="swagger-ui"></div>')
    expect(res._body).toContain('SwaggerUIBundle')
  })

  it('should set Content-Length header', async () => {
    const handler = serveSwaggerUi()
    const req = mockReq()
    const res = mockRes()
    await handler(req, res as any)
    expect(res._headers['Content-Length']).toBeGreaterThan(0)
  })
})
