/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  OpenAPI Specification Generator                                             ║
 * ║  Auto-generates OpenAPI 3.0.3 spec from route definitions                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { RouteHandler } from './router.js'

// ── OpenAPI 3.0.3 Type Definitions ──────────────────────────────────────────

export interface OpenApiInfo {
  title: string
  description: string
  version: string
  contact?: { name?: string; url?: string; email?: string }
  license?: { name: string; url?: string }
}

export interface OpenApiServer {
  url: string
  description?: string
}

export interface OpenApiSchema {
  type?: string
  format?: string
  description?: string
  properties?: Record<string, OpenApiSchema>
  items?: OpenApiSchema
  required?: string[]
  enum?: string[]
  example?: unknown
  additionalProperties?: boolean | OpenApiSchema
  nullable?: boolean
  oneOf?: OpenApiSchema[]
  allOf?: OpenApiSchema[]
  $ref?: string
}

export interface OpenApiParameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  schema: OpenApiSchema
}

export interface OpenApiHeader {
  description: string
  schema: OpenApiSchema
}

export interface OpenApiMediaType {
  schema: OpenApiSchema
}

export interface OpenApiRequestBody {
  description?: string
  required?: boolean
  content: Record<string, OpenApiMediaType>
}

export interface OpenApiResponseObject {
  description: string
  headers?: Record<string, OpenApiHeader>
  content?: Record<string, OpenApiMediaType>
}

export interface OpenApiOperation {
  operationId: string
  summary: string
  description?: string
  tags?: string[]
  parameters?: OpenApiParameter[]
  requestBody?: OpenApiRequestBody
  responses: Record<string, OpenApiResponseObject>
  security?: Record<string, string[]>[]
}

export interface OpenApiPathItem {
  get?: OpenApiOperation
  post?: OpenApiOperation
  put?: OpenApiOperation
  delete?: OpenApiOperation
  patch?: OpenApiOperation
}

export interface OpenApiSecurityScheme {
  type: string
  name?: string
  in?: string
  scheme?: string
  bearerFormat?: string
  description?: string
}

export interface OpenApiComponents {
  schemas: Record<string, OpenApiSchema>
  securitySchemes: Record<string, OpenApiSecurityScheme>
  responses: Record<string, OpenApiResponseObject>
  headers: Record<string, OpenApiHeader>
}

export interface OpenApiSpec {
  openapi: string
  info: OpenApiInfo
  servers: OpenApiServer[]
  paths: Record<string, OpenApiPathItem>
  components: OpenApiComponents
  security: Record<string, string[]>[]
  tags: { name: string; description: string }[]
}

// ── Shared Schema Definitions ───────────────────────────────────────────────

function timestampSchema(): OpenApiSchema {
  return { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp' }
}

function errorResponseSchema(): OpenApiSchema {
  return {
    type: 'object',
    required: ['error', 'statusCode'],
    properties: {
      error: { type: 'string', description: 'Error message' },
      statusCode: { type: 'integer', description: 'HTTP status code' },
      details: { description: 'Additional error details' },
    },
  }
}

function rateLimitHeaders(): Record<string, OpenApiHeader> {
  return {
    'X-RateLimit-Limit': {
      description: 'Maximum number of requests allowed per window',
      schema: { type: 'integer', example: 60 },
    },
    'X-RateLimit-Remaining': {
      description: 'Number of requests remaining in the current window',
      schema: { type: 'integer', example: 55 },
    },
    'X-RateLimit-Reset': {
      description: 'Unix timestamp when the rate limit window resets',
      schema: { type: 'integer', example: 1700000000 },
    },
  }
}

function errorResponses(): Record<string, OpenApiResponseObject> {
  return {
    '400': {
      description: 'Bad Request — invalid input or malformed JSON',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    '401': {
      description: 'Unauthorized — missing or invalid authentication',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    '403': {
      description: 'Forbidden — insufficient permissions',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    '404': {
      description: 'Not Found — resource does not exist',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    '429': {
      description: 'Too Many Requests — rate limit exceeded',
      headers: rateLimitHeaders(),
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    '500': {
      description: 'Internal Server Error',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  }
}

// ── Spec Generator ──────────────────────────────────────────────────────────

export interface GenerateOpenApiOptions {
  baseUrl?: string
}

export function generateOpenApiSpec(options?: GenerateOpenApiOptions): OpenApiSpec {
  const baseUrl = options?.baseUrl ?? 'http://localhost:3000'

  const spec: OpenApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'AI API',
      description:
        'REST API for the AI platform — chat, brain, knowledge, plugins, and configuration management.',
      version: '1.0.0',
      contact: { name: 'AI Team' },
      license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    },
    servers: [{ url: baseUrl, description: 'API Server' }],
    tags: [
      { name: 'chat', description: 'Chat and conversation endpoints' },
      { name: 'brain', description: 'Brain module status and control' },
      { name: 'knowledge', description: 'Knowledge base search' },
      { name: 'plugins', description: 'Plugin management' },
      { name: 'config', description: 'Configuration management' },
      { name: 'system', description: 'Health, readiness, and version checks' },
    ],
    paths: {},
    components: {
      schemas: buildComponentSchemas(),
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API key passed via X-API-Key header',
        },
        SessionToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Session token for authenticated users',
        },
      },
      responses: errorResponses(),
      headers: rateLimitHeaders(),
    },
    security: [{ ApiKeyAuth: [] }, { SessionToken: [] }],
  }

  // Health endpoints (from server.ts)
  spec.paths['/health'] = {
    get: {
      operationId: 'getHealth',
      summary: 'Health check',
      description: 'Returns service health status and uptime.',
      tags: ['system'],
      responses: {
        '200': {
          description: 'Service is healthy',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['500']),
      },
      security: [],
    },
  }

  spec.paths['/ready'] = {
    get: {
      operationId: 'getReady',
      summary: 'Readiness check',
      description: 'Returns whether the service is ready to accept requests.',
      tags: ['system'],
      responses: {
        '200': {
          description: 'Service is ready',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReadyResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['500']),
      },
      security: [],
    },
  }

  spec.paths['/api/v1/version'] = {
    get: {
      operationId: 'getVersion',
      summary: 'Get API version',
      description: 'Returns version information for the API, Node.js runtime, and platform.',
      tags: ['system'],
      responses: {
        '200': {
          description: 'Version information',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VersionResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['500']),
      },
      security: [],
    },
  }

  // Chat endpoints (from routes.ts)
  spec.paths['/api/v1/chat'] = {
    get: {
      operationId: 'getChatStatus',
      summary: 'Chat endpoint status',
      description: 'Returns a readiness message for the chat endpoint.',
      tags: ['chat'],
      responses: {
        '200': {
          description: 'Chat endpoint is ready',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatStatusResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['401', '429', '500']),
      },
    },
    post: {
      operationId: 'sendChatMessage',
      summary: 'Send a chat message',
      description: 'Sends a message and receives an echo response.',
      tags: ['chat'],
      requestBody: {
        required: true,
        description: 'Chat message payload',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ChatRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Chat response',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['400', '401', '429', '500']),
      },
    },
  }

  // Brain status endpoint
  spec.paths['/api/v1/brain/status'] = {
    get: {
      operationId: 'getBrainStatus',
      summary: 'Get brain module status',
      description: 'Returns the current status and loaded modules of the brain.',
      tags: ['brain'],
      responses: {
        '200': {
          description: 'Brain status',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BrainStatusResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['401', '429', '500']),
      },
    },
  }

  // Knowledge search endpoint
  spec.paths['/api/v1/knowledge/search'] = {
    get: {
      operationId: 'searchKnowledge',
      summary: 'Search the knowledge base',
      description: 'Performs a search query against the knowledge base.',
      tags: ['knowledge'],
      parameters: [
        {
          name: 'q',
          in: 'query',
          description: 'Search query string',
          required: false,
          schema: { type: 'string', example: 'machine learning' },
        },
      ],
      responses: {
        '200': {
          description: 'Search results',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/KnowledgeSearchResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['401', '429', '500']),
      },
    },
  }

  // Plugins endpoint
  spec.paths['/api/v1/plugins'] = {
    get: {
      operationId: 'listPlugins',
      summary: 'List installed plugins',
      description: 'Returns all installed plugins.',
      tags: ['plugins'],
      responses: {
        '200': {
          description: 'Plugin list',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PluginsResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['401', '429', '500']),
      },
    },
  }

  // Config endpoint
  spec.paths['/api/v1/config'] = {
    get: {
      operationId: 'getConfig',
      summary: 'Get configuration',
      description: 'Returns the current environment configuration and feature flags.',
      tags: ['config'],
      responses: {
        '200': {
          description: 'Configuration',
          headers: rateLimitHeaders(),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConfigResponse' },
            },
          },
        },
        ...pick(errorResponses(), ['401', '403', '429', '500']),
      },
    },
  }

  return spec
}

// ── Component Schemas ───────────────────────────────────────────────────────

function buildComponentSchemas(): Record<string, OpenApiSchema> {
  return {
    ErrorResponse: errorResponseSchema(),

    HealthResponse: {
      type: 'object',
      required: ['status', 'uptime', 'timestamp'],
      properties: {
        status: { type: 'string', enum: ['ok'], description: 'Health status' },
        uptime: { type: 'integer', description: 'Uptime in seconds' },
        timestamp: timestampSchema(),
      },
    },

    ReadyResponse: {
      type: 'object',
      required: ['status', 'checks'],
      properties: {
        status: { type: 'string', enum: ['ready'], description: 'Readiness status' },
        checks: {
          type: 'object',
          description: 'Individual readiness check results',
          additionalProperties: true,
        },
      },
    },

    VersionResponse: {
      type: 'object',
      required: ['version', 'nodeVersion', 'platform'],
      properties: {
        version: { type: 'string', description: 'API version', example: '2.3.0' },
        nodeVersion: { type: 'string', description: 'Node.js version', example: 'v20.0.0' },
        platform: { type: 'string', description: 'OS platform', example: 'linux' },
      },
    },

    ChatStatusResponse: {
      type: 'object',
      required: ['message', 'timestamp'],
      properties: {
        message: { type: 'string', description: 'Status message', example: 'Chat endpoint ready' },
        timestamp: timestampSchema(),
      },
    },

    ChatRequest: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The chat message to send', example: 'Hello AI!' },
      },
    },

    ChatResponse: {
      type: 'object',
      required: ['response', 'timestamp'],
      properties: {
        response: { type: 'string', description: 'Echo response', example: 'Echo: Hello AI!' },
        timestamp: timestampSchema(),
      },
    },

    BrainStatusResponse: {
      type: 'object',
      required: ['status', 'modules', 'timestamp'],
      properties: {
        status: { type: 'string', description: 'Brain status', example: 'active' },
        modules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Loaded brain modules',
          example: ['memory', 'reasoning', 'learning'],
        },
        timestamp: timestampSchema(),
      },
    },

    KnowledgeSearchResponse: {
      type: 'object',
      required: ['query', 'results', 'total', 'timestamp'],
      properties: {
        query: { type: 'string', description: 'Original search query' },
        results: {
          type: 'array',
          items: { type: 'object', additionalProperties: true },
          description: 'Search result items',
        },
        total: { type: 'integer', description: 'Total number of results' },
        timestamp: timestampSchema(),
      },
    },

    PluginsResponse: {
      type: 'object',
      required: ['plugins', 'total', 'timestamp'],
      properties: {
        plugins: {
          type: 'array',
          items: { type: 'object', additionalProperties: true },
          description: 'Installed plugins',
        },
        total: { type: 'integer', description: 'Total number of plugins' },
        timestamp: timestampSchema(),
      },
    },

    ConfigResponse: {
      type: 'object',
      required: ['environment', 'features', 'timestamp'],
      properties: {
        environment: { type: 'string', description: 'Current environment', example: 'development' },
        features: {
          type: 'object',
          description: 'Feature flags',
          additionalProperties: true,
        },
        timestamp: timestampSchema(),
      },
    },
  }
}

// ── Route Handlers for Serving Spec and Docs ────────────────────────────────

export function serveOpenApiSpec(options?: GenerateOpenApiOptions): RouteHandler {
  const spec = generateOpenApiSpec(options)

  return async (_req, res) => {
    res.json(200, spec)
  }
}

export function serveSwaggerUi(options?: { specUrl?: string }): RouteHandler {
  const specUrl = options?.specUrl ?? '/api/v1/openapi.json'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true,
    });
  </script>
</body>
</html>`

  return async (_req, res) => {
    const body = html
    res.raw.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
    })
    res.raw.end(body)
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(obj: Record<string, T>, keys: string[]): Record<string, T> {
  const result: Record<string, T> = {}
  for (const key of keys) {
    if (key in obj) result[key] = obj[key]!
  }
  return result
}
