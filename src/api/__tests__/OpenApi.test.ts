import { describe, it, expect, beforeEach } from 'vitest'
import { SchemaBuilder, OpenAPIBuilder, AIOpenAPISpec, createAIOpenAPISpec } from '../openapi.js'
import type { OpenAPISpec, SchemaObject } from '../openapi.js'

// ── SchemaBuilder ──

describe('SchemaBuilder', () => {
  let sb: SchemaBuilder

  beforeEach(() => {
    sb = new SchemaBuilder()
  })

  it('string() creates string schema', () => {
    expect(sb.string().build()).toEqual({ type: 'string' })
  })

  it('number() creates number schema', () => {
    expect(sb.number().build()).toEqual({ type: 'number' })
  })

  it('integer() creates integer schema', () => {
    expect(sb.integer().build()).toEqual({ type: 'integer' })
  })

  it('boolean() creates boolean schema', () => {
    expect(sb.boolean().build()).toEqual({ type: 'boolean' })
  })

  it('array(items) creates array schema with item type', () => {
    const items: SchemaObject = { type: 'string' }
    const result = sb.array(items).build()
    expect(result.type).toBe('array')
    expect(result.items).toEqual({ type: 'string' })
  })

  it('object(properties) creates object schema with properties', () => {
    const props = { name: { type: 'string' as const }, age: { type: 'integer' as const } }
    const result = sb.object(props).build()
    expect(result.type).toBe('object')
    expect(result.properties).toEqual(props)
  })

  it('required() marks fields as required', () => {
    const result = sb
      .object({ a: { type: 'string' } })
      .required(['a'])
      .build()
    expect(result.required).toEqual(['a'])
  })

  it('required() without arguments does not set required', () => {
    const result = sb
      .object({ a: { type: 'string' } })
      .required()
      .build()
    expect(result.required).toBeUndefined()
  })

  it('optional() is a no-op and returns this', () => {
    const result = sb.string().optional().build()
    expect(result).toEqual({ type: 'string' })
  })

  it('nullable() sets nullable to true', () => {
    expect(sb.string().nullable().build().nullable).toBe(true)
  })

  it('enum(values) sets enum values', () => {
    const result = sb.string().enum(['a', 'b', 'c']).build()
    expect(result.enum).toEqual(['a', 'b', 'c'])
  })

  it('pattern(regex) sets a regex pattern', () => {
    const result = sb.string().pattern('^[a-z]+$').build()
    expect(result.pattern).toBe('^[a-z]+$')
  })

  it('minLength(n) sets minLength', () => {
    expect(sb.string().minLength(3).build().minLength).toBe(3)
  })

  it('maxLength(n) sets maxLength', () => {
    expect(sb.string().maxLength(50).build().maxLength).toBe(50)
  })

  it('min(n) sets minimum', () => {
    expect(sb.number().min(0).build().minimum).toBe(0)
  })

  it('max(n) sets maximum', () => {
    expect(sb.number().max(100).build().maximum).toBe(100)
  })

  it('format() sets format', () => {
    expect(sb.string().format('date-time').build().format).toBe('date-time')
  })

  it('description() sets description', () => {
    expect(sb.string().description('A test field').build().description).toBe('A test field')
  })

  it('example() sets example value', () => {
    expect(sb.string().example('hello').build().example).toBe('hello')
  })

  it('default() sets default value', () => {
    expect(sb.number().default(42).build().default).toBe(42)
  })

  it('build() returns a plain object (not the internal reference)', () => {
    const built = sb.string().build()
    expect(typeof built).toBe('object')
    // Mutating the build result should not affect a second build
    built.description = 'mutated'
    expect(sb.build().description).toBeUndefined()
  })

  it('supports chaining multiple methods', () => {
    const result = sb
      .string()
      .minLength(1)
      .maxLength(255)
      .pattern('^\\w+$')
      .format('custom')
      .description('chained')
      .example('foo')
      .default('bar')
      .nullable()
      .build()

    expect(result).toEqual({
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '^\\w+$',
      format: 'custom',
      description: 'chained',
      example: 'foo',
      default: 'bar',
      nullable: true,
    })
  })

  it('min and max work together for range', () => {
    const result = sb.integer().min(1).max(100).build()
    expect(result.minimum).toBe(1)
    expect(result.maximum).toBe(100)
  })
})

// ── OpenAPIBuilder ──

describe('OpenAPIBuilder', () => {
  let builder: OpenAPIBuilder

  beforeEach(() => {
    builder = new OpenAPIBuilder('Test API', '1.0.0', 'A test API')
  })

  it('creates base spec with correct info', () => {
    const spec = builder.build()
    expect(spec.info.title).toBe('Test API')
    expect(spec.info.version).toBe('1.0.0')
    expect(spec.info.description).toBe('A test API')
  })

  it('has openapi version 3.1.0', () => {
    expect(builder.build().openapi).toBe('3.1.0')
  })

  it('starts with empty paths', () => {
    expect(builder.build().paths).toEqual({})
  })

  it('addServer adds a server entry', () => {
    builder.addServer('http://localhost:3000', 'Dev server')
    const spec = builder.build()
    expect(spec.servers).toHaveLength(1)
    expect(spec.servers![0].url).toBe('http://localhost:3000')
    expect(spec.servers![0].description).toBe('Dev server')
  })

  it('addServer can add multiple servers', () => {
    builder.addServer('http://localhost:3000').addServer('https://prod.example.com')
    expect(builder.build().servers).toHaveLength(2)
  })

  it('addTag adds a tag', () => {
    builder.addTag('Users', 'User operations')
    const spec = builder.build()
    expect(spec.tags).toHaveLength(1)
    expect(spec.tags![0]).toEqual({ name: 'Users', description: 'User operations' })
  })

  it('addTag can add multiple tags', () => {
    builder.addTag('A').addTag('B').addTag('C')
    expect(builder.build().tags).toHaveLength(3)
  })

  it('addSecurityScheme adds a security scheme', () => {
    builder.addSecurityScheme('bearer', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    const spec = builder.build()
    expect(spec.components?.securitySchemes?.bearer).toBeDefined()
    expect(spec.components!.securitySchemes!.bearer.type).toBe('http')
  })

  it('addPath adds a path with an operation', () => {
    builder.addPath('/users', 'get', {
      summary: 'List users',
      responses: { '200': { description: 'OK' } },
    })
    const spec = builder.build()
    expect(spec.paths['/users']).toBeDefined()
    expect(spec.paths['/users'].get).toBeDefined()
    expect(spec.paths['/users'].get!.summary).toBe('List users')
  })

  it('addPath supports multiple methods on the same path', () => {
    builder
      .addPath('/items', 'get', { summary: 'List', responses: { '200': { description: 'OK' } } })
      .addPath('/items', 'post', {
        summary: 'Create',
        responses: { '201': { description: 'Created' } },
      })
    const spec = builder.build()
    expect(spec.paths['/items'].get).toBeDefined()
    expect(spec.paths['/items'].post).toBeDefined()
  })

  it('addSchema adds a reusable component schema', () => {
    const schema = new SchemaBuilder().object({ id: { type: 'string' } }).build()
    builder.addSchema('User', schema)
    const spec = builder.build()
    expect(spec.components?.schemas?.User).toBeDefined()
    expect(spec.components!.schemas!.User.type).toBe('object')
  })

  it('setContact sets contact info', () => {
    builder.setContact({ name: 'Support', email: 'help@test.com' })
    const spec = builder.build()
    expect(spec.info.contact).toEqual({ name: 'Support', email: 'help@test.com' })
  })

  it('setLicense sets license info', () => {
    builder.setLicense('MIT', 'https://opensource.org/licenses/MIT')
    const spec = builder.build()
    expect(spec.info.license).toEqual({ name: 'MIT', url: 'https://opensource.org/licenses/MIT' })
  })

  it('setLicense works without URL', () => {
    builder.setLicense('Apache-2.0')
    expect(builder.build().info.license).toEqual({ name: 'Apache-2.0', url: undefined })
  })

  it('build() returns a deep copy', () => {
    builder.addPath('/x', 'get', { responses: { '200': { description: 'OK' } } })
    const spec1 = builder.build()
    const spec2 = builder.build()
    spec1.paths['/x'] = {}
    expect(spec2.paths['/x'].get).toBeDefined()
  })

  it('toJSON() returns a valid JSON string', () => {
    builder.addServer('http://localhost')
    const json = builder.toJSON()
    const parsed = JSON.parse(json)
    expect(parsed.openapi).toBe('3.1.0')
    expect(parsed.info.title).toBe('Test API')
  })

  it('toYAML() returns a string containing YAML-like content', () => {
    builder.addServer('http://localhost')
    const yaml = builder.toYAML()
    expect(yaml).toContain('openapi:')
    expect(yaml).toContain('3.1.0')
    expect(yaml).toContain('info:')
    expect(yaml).toContain('Test API')
  })

  it('toYAML() contains proper indentation', () => {
    builder.addTag('Foo', 'Bar')
    const yaml = builder.toYAML()
    expect(yaml).toContain('tags:')
    expect(yaml).toContain('name: Foo')
  })

  it('toJSON() output can be deserialized back to equivalent spec', () => {
    builder.addServer('http://localhost').addTag('T')
    const json = builder.toJSON()
    const spec = builder.build()
    expect(JSON.parse(json)).toEqual(spec)
  })

  it('supports fluent chaining of all builder methods', () => {
    const spec = builder
      .addServer('http://localhost')
      .addTag('Test')
      .setContact({ name: 'Dev' })
      .setLicense('MIT')
      .addSecurityScheme('key', { type: 'apiKey', name: 'key', in: 'header' })
      .addSchema('Obj', { type: 'object' })
      .addPath('/p', 'get', { responses: { '200': { description: 'OK' } } })
      .build()

    expect(spec.servers).toHaveLength(1)
    expect(spec.tags).toHaveLength(1)
    expect(spec.info.contact).toBeDefined()
    expect(spec.info.license).toBeDefined()
    expect(spec.components?.securitySchemes?.key).toBeDefined()
    expect(spec.components?.schemas?.Obj).toBeDefined()
    expect(spec.paths['/p']).toBeDefined()
  })
})

// ── AIOpenAPISpec ──

describe('AIOpenAPISpec', () => {
  let spec: OpenAPISpec

  beforeEach(() => {
    spec = new AIOpenAPISpec().generateSpec()
  })

  it('generateSpec returns a valid OpenAPI document', () => {
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.info).toBeDefined()
    expect(spec.paths).toBeDefined()
  })

  it('has correct API title', () => {
    expect(spec.info.title).toBe('AI System API')
  })

  it('has correct API version', () => {
    expect(spec.info.version).toBe('1.0.0')
  })

  it('has a description', () => {
    expect(spec.info.description).toBeDefined()
    expect(spec.info.description!.length).toBeGreaterThan(0)
  })

  it('has contact information', () => {
    expect(spec.info.contact).toBeDefined()
    expect(spec.info.contact!.name).toBe('AI System Team')
    expect(spec.info.contact!.email).toBe('team@ai-system.example.com')
  })

  it('has license information', () => {
    expect(spec.info.license).toBeDefined()
    expect(spec.info.license!.name).toBe('MIT')
  })

  it('defines server URLs', () => {
    expect(spec.servers).toBeDefined()
    expect(spec.servers!.length).toBeGreaterThanOrEqual(2)
    expect(spec.servers![0].url).toBe('http://localhost:3000')
  })

  // ── Security ──

  it('defines bearerAuth security scheme', () => {
    expect(spec.components?.securitySchemes?.bearerAuth).toBeDefined()
    expect(spec.components!.securitySchemes!.bearerAuth.type).toBe('http')
    expect(spec.components!.securitySchemes!.bearerAuth.scheme).toBe('bearer')
  })

  it('defines apiKey security scheme', () => {
    expect(spec.components?.securitySchemes?.apiKey).toBeDefined()
    expect(spec.components!.securitySchemes!.apiKey.type).toBe('apiKey')
    expect(spec.components!.securitySchemes!.apiKey.in).toBe('header')
  })

  // ── Tags ──

  it('defines expected tags', () => {
    const tagNames = spec.tags!.map(t => t.name)
    expect(tagNames).toContain('Chat')
    expect(tagNames).toContain('Embeddings')
    expect(tagNames).toContain('Code')
    expect(tagNames).toContain('Models')
    expect(tagNames).toContain('System')
    expect(tagNames).toContain('Tools')
    expect(tagNames).toContain('Skills')
    expect(tagNames).toContain('Workflow')
  })

  // ── Component schemas ──

  it('defines Error component schema', () => {
    expect(spec.components?.schemas?.Error).toBeDefined()
    expect(spec.components!.schemas!.Error.type).toBe('object')
    expect(spec.components!.schemas!.Error.required).toContain('error')
    expect(spec.components!.schemas!.Error.required).toContain('message')
  })

  it('defines Message component schema', () => {
    expect(spec.components?.schemas?.Message).toBeDefined()
    expect(spec.components!.schemas!.Message.properties?.role).toBeDefined()
    expect(spec.components!.schemas!.Message.properties?.content).toBeDefined()
  })

  it('defines ModelInfo component schema', () => {
    expect(spec.components?.schemas?.ModelInfo).toBeDefined()
    expect(spec.components!.schemas!.ModelInfo.required).toContain('id')
    expect(spec.components!.schemas!.ModelInfo.required).toContain('name')
  })

  // ── Endpoint existence ──

  const allPaths = [
    '/api/chat',
    '/api/chat/stream',
    '/api/embeddings',
    '/api/code/analyze',
    '/api/code/review',
    '/api/code/fix',
    '/api/code/generate',
    '/api/models',
    '/api/health',
    '/api/stats',
    '/api/tools/{toolName}/execute',
    '/api/tools',
    '/api/skills',
    '/api/workflow/start',
    '/api/workflow/{id}/status',
  ]

  it('has all 15 API paths', () => {
    for (const path of allPaths) {
      expect(spec.paths[path]).toBeDefined()
    }
  })

  it('POST /api/chat endpoint exists with proper schema', () => {
    const op = spec.paths['/api/chat'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('createChatCompletion')
    expect(op!.requestBody).toBeDefined()
    expect(op!.responses['200']).toBeDefined()
  })

  it('POST /api/chat/stream endpoint exists', () => {
    const op = spec.paths['/api/chat/stream'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('createChatCompletionStream')
    expect(op!.responses['200'].content?.['text/event-stream']).toBeDefined()
  })

  it('POST /api/embeddings endpoint exists', () => {
    const op = spec.paths['/api/embeddings'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('createEmbeddings')
    expect(op!.tags).toContain('Embeddings')
  })

  it('POST /api/code/analyze endpoint exists', () => {
    const op = spec.paths['/api/code/analyze'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('analyzeCode')
    expect(op!.tags).toContain('Code')
  })

  it('POST /api/code/review endpoint exists', () => {
    const op = spec.paths['/api/code/review'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('reviewCode')
  })

  it('POST /api/code/fix endpoint exists', () => {
    const op = spec.paths['/api/code/fix'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('fixCode')
  })

  it('POST /api/code/generate endpoint exists', () => {
    const op = spec.paths['/api/code/generate'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('generateCode')
  })

  it('GET /api/models endpoint exists', () => {
    const op = spec.paths['/api/models'].get
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('listModels')
    expect(op!.tags).toContain('Models')
  })

  it('GET /api/health endpoint exists', () => {
    const op = spec.paths['/api/health'].get
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('healthCheck')
    expect(op!.tags).toContain('System')
  })

  it('GET /api/stats endpoint exists', () => {
    const op = spec.paths['/api/stats'].get
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('getStats')
  })

  it('POST /api/tools/{toolName}/execute endpoint exists', () => {
    const op = spec.paths['/api/tools/{toolName}/execute'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('executeTool')
    expect(op!.parameters).toBeDefined()
    expect(op!.parameters![0].name).toBe('toolName')
    expect(op!.parameters![0].in).toBe('path')
  })

  it('GET /api/tools endpoint exists', () => {
    const op = spec.paths['/api/tools'].get
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('listTools')
  })

  it('GET /api/skills endpoint exists', () => {
    const op = spec.paths['/api/skills'].get
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('listSkills')
    expect(op!.tags).toContain('Skills')
  })

  it('POST /api/workflow/start endpoint exists', () => {
    const op = spec.paths['/api/workflow/start'].post
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('startWorkflow')
    expect(op!.tags).toContain('Workflow')
  })

  it('GET /api/workflow/{id}/status endpoint exists', () => {
    const op = spec.paths['/api/workflow/{id}/status'].get
    expect(op).toBeDefined()
    expect(op!.operationId).toBe('getWorkflowStatus')
    expect(op!.parameters).toBeDefined()
    expect(op!.parameters![0].name).toBe('id')
  })

  // ── Request / Response structure ──

  it('all POST endpoints have a requestBody', () => {
    const postPaths = [
      '/api/chat',
      '/api/chat/stream',
      '/api/embeddings',
      '/api/code/analyze',
      '/api/code/review',
      '/api/code/fix',
      '/api/code/generate',
      '/api/tools/{toolName}/execute',
      '/api/workflow/start',
    ]
    for (const path of postPaths) {
      expect(spec.paths[path].post!.requestBody).toBeDefined()
    }
  })

  it('all endpoints have responses defined', () => {
    for (const path of allPaths) {
      const pathItem = spec.paths[path]
      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const
      for (const m of methods) {
        const op = pathItem[m]
        if (op) {
          expect(Object.keys(op.responses).length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('error responses reference the Error schema', () => {
    const chatOp = spec.paths['/api/chat'].post!
    const err400 = chatOp.responses['400']
    expect(err400).toBeDefined()
    const schema = err400.content?.['application/json']?.schema
    expect(schema?.$ref).toBe('#/components/schemas/Error')
  })

  it('POST /api/chat requestBody requires messages', () => {
    const body = spec.paths['/api/chat'].post!.requestBody!
    const schema = body.content['application/json'].schema
    expect(schema.required).toContain('messages')
  })

  it('code endpoints share the same tag', () => {
    const codePaths = [
      '/api/code/analyze',
      '/api/code/review',
      '/api/code/fix',
      '/api/code/generate',
    ]
    for (const p of codePaths) {
      expect(spec.paths[p].post!.tags).toContain('Code')
    }
  })

  it('code endpoints have 400 and 401 error responses', () => {
    const codePaths = [
      '/api/code/analyze',
      '/api/code/review',
      '/api/code/fix',
      '/api/code/generate',
    ]
    for (const p of codePaths) {
      const responses = spec.paths[p].post!.responses
      expect(responses['400']).toBeDefined()
      expect(responses['401']).toBeDefined()
    }
  })

  it('health endpoint does not require security', () => {
    const op = spec.paths['/api/health'].get!
    expect(op.security).toBeUndefined()
  })

  it('stats endpoint requires security', () => {
    const op = spec.paths['/api/stats'].get!
    expect(op.security).toBeDefined()
    expect(op.security!.length).toBeGreaterThan(0)
  })

  it('workflow start returns 201 on success', () => {
    const responses = spec.paths['/api/workflow/start'].post!.responses
    expect(responses['201']).toBeDefined()
  })

  it('workflow status returns 404 for not found', () => {
    const responses = spec.paths['/api/workflow/{id}/status'].get!.responses
    expect(responses['404']).toBeDefined()
  })

  it('tool execute returns 404 for tool not found', () => {
    const responses = spec.paths['/api/tools/{toolName}/execute'].post!.responses
    expect(responses['404']).toBeDefined()
  })
})

// ── createAIOpenAPISpec helper ──

describe('createAIOpenAPISpec', () => {
  it('returns a valid spec equivalent to AIOpenAPISpec().generateSpec()', () => {
    const spec = createAIOpenAPISpec()
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.info.title).toBe('AI System API')
    expect(Object.keys(spec.paths).length).toBeGreaterThanOrEqual(15)
  })
})
