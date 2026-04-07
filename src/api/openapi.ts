/**
 * 📖 OpenAPI 3.1 Specification Generator — Builds typed OpenAPI specs for the AI system
 *
 * Features:
 * - Full OpenAPI 3.1 document structure with typed interfaces
 * - Fluent SchemaBuilder for composing JSON Schema objects
 * - OpenAPIBuilder for assembling complete specifications
 * - Pre-built AIOpenAPISpec with all AI system endpoints
 * - YAML serialization without external dependencies
 * - Reusable component schemas and security schemes
 *
 * Zero external dependencies.
 */

// ── Types ──

export type SchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null'
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
export type ParameterLocation = 'query' | 'path' | 'header' | 'cookie'
export type SecuritySchemeType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'

/** JSON Schema object following OpenAPI 3.1 / JSON Schema 2020-12 */
export interface SchemaObject {
  type?: SchemaType | SchemaType[]
  properties?: Record<string, SchemaObject>
  required?: string[]
  items?: SchemaObject
  enum?: unknown[]
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  format?: string
  description?: string
  example?: unknown
  default?: unknown
  nullable?: boolean
  oneOf?: SchemaObject[]
  anyOf?: SchemaObject[]
  allOf?: SchemaObject[]
  $ref?: string
  additionalProperties?: boolean | SchemaObject
}

/** Describes a single operation parameter */
export interface Parameter {
  name: string
  in: ParameterLocation
  description?: string
  required?: boolean
  schema?: SchemaObject
}

/** Describes a request body */
export interface RequestBody {
  description?: string
  required?: boolean
  content: Record<string, { schema: SchemaObject; example?: unknown }>
}

/** Describes a single API response */
export interface Response {
  description: string
  content?: Record<string, { schema: SchemaObject; example?: unknown }>
  headers?: Record<string, { description?: string; schema?: SchemaObject }>
}

/** Describes a single API operation */
export interface Operation {
  summary?: string
  description?: string
  operationId?: string
  tags?: string[]
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, Response>
  security?: Array<Record<string, string[]>>
}

/** Path item — maps HTTP methods to operations */
export interface PathItem {
  get?: Operation
  post?: Operation
  put?: Operation
  delete?: Operation
  patch?: Operation
  options?: Operation
  head?: Operation
  summary?: string
  description?: string
  parameters?: Parameter[]
}

/** Security scheme definition */
export interface SecurityScheme {
  type: SecuritySchemeType
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
}

/** Server object with optional variables */
export interface ServerObject {
  url: string
  description?: string
  variables?: Record<string, { default: string; description?: string; enum?: string[] }>
}

/** Tag metadata */
export interface TagObject {
  name: string
  description?: string
}

/** Endpoint configuration metadata */
export interface EndpointConfig {
  method: HttpMethod
  path: string
  handler?: string
  requestSchema?: SchemaObject
  responseSchema?: SchemaObject
  operation?: Partial<Operation>
}

/** Full OpenAPI 3.1 document */
export interface OpenAPISpec {
  openapi: '3.1.0'
  info: {
    title: string
    version: string
    description?: string
    contact?: { name?: string; url?: string; email?: string }
    license?: { name: string; url?: string }
  }
  servers?: ServerObject[]
  paths: Record<string, PathItem>
  components?: {
    schemas?: Record<string, SchemaObject>
    securitySchemes?: Record<string, SecurityScheme>
  }
  tags?: TagObject[]
  security?: Array<Record<string, string[]>>
}

// ── SchemaBuilder ──

/** Fluent builder for constructing JSON Schema objects */
export class SchemaBuilder {
  private schema: SchemaObject = {}
  string(): this { this.schema.type = 'string'; return this }
  number(): this { this.schema.type = 'number'; return this }
  integer(): this { this.schema.type = 'integer'; return this }
  boolean(): this { this.schema.type = 'boolean'; return this }
  /** Create an array schema with the given item schema */
  array(items: SchemaObject): this { this.schema.type = 'array'; this.schema.items = items; return this }
  /** Create an object schema with the given properties */
  object(properties: Record<string, SchemaObject>): this {
    this.schema.type = 'object'; this.schema.properties = properties; return this
  }
  /** Mark listed fields as required (for object schemas) */
  required(fields?: string[]): this { if (fields) this.schema.required = fields; return this }
  /** Mark as optional — no-op, clarifies intent in fluent chains */
  optional(): this { return this }
  nullable(): this { this.schema.nullable = true; return this }
  enum(values: unknown[]): this { this.schema.enum = values; return this }
  pattern(regex: string): this { this.schema.pattern = regex; return this }
  minLength(n: number): this { this.schema.minLength = n; return this }
  maxLength(n: number): this { this.schema.maxLength = n; return this }
  min(n: number): this { this.schema.minimum = n; return this }
  max(n: number): this { this.schema.maximum = n; return this }
  format(fmt: string): this { this.schema.format = fmt; return this }
  description(text: string): this { this.schema.description = text; return this }
  example(val: unknown): this { this.schema.example = val; return this }
  default(val: unknown): this { this.schema.default = val; return this }
  /** Build and return the schema object */
  build(): SchemaObject { return { ...this.schema } }
}

// ── OpenAPIBuilder ──

/** Builder for assembling a complete OpenAPI 3.1 specification */
export class OpenAPIBuilder {
  private spec: OpenAPISpec
  constructor(title: string, version: string, description?: string) {
    this.spec = { openapi: '3.1.0', info: { title, version, description }, paths: {} }
  }
  addServer(url: string, description?: string): this {
    if (!this.spec.servers) this.spec.servers = []
    this.spec.servers.push({ url, description }); return this
  }
  addTag(name: string, description?: string): this {
    if (!this.spec.tags) this.spec.tags = []
    this.spec.tags.push({ name, description }); return this
  }
  addSecurityScheme(name: string, scheme: SecurityScheme): this {
    if (!this.spec.components) this.spec.components = {}
    if (!this.spec.components.securitySchemes) this.spec.components.securitySchemes = {}
    this.spec.components.securitySchemes[name] = scheme; return this
  }
  addPath(path: string, method: HttpMethod, operation: Operation): this {
    if (!this.spec.paths[path]) this.spec.paths[path] = {}
    ;(this.spec.paths[path] as Record<string, Operation>)[method] = operation; return this
  }
  addSchema(name: string, schema: SchemaObject): this {
    if (!this.spec.components) this.spec.components = {}
    if (!this.spec.components.schemas) this.spec.components.schemas = {}
    this.spec.components.schemas[name] = schema; return this
  }
  setContact(contact: { name?: string; url?: string; email?: string }): this {
    this.spec.info.contact = contact; return this
  }
  setLicense(name: string, url?: string): this {
    this.spec.info.license = { name, url }; return this
  }
  /** Build the complete OpenAPI specification */
  build(): OpenAPISpec { return JSON.parse(JSON.stringify(this.spec)) }
  /** Serialize the specification to a JSON string */
  toJSON(): string { return JSON.stringify(this.build(), null, 2) }
  /** Serialize the specification to a YAML string (no external dependency) */
  toYAML(): string { return jsonToYaml(this.build()) }
}

// ── YAML serializer (zero-dependency) ──

function jsonToYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (value === null || value === undefined) return `${pad}null\n`
  if (typeof value === 'boolean' || typeof value === 'number') return `${pad}${value}\n`
  if (typeof value === 'string') {
    const q = value.includes('\n') || value.includes(':') || value.includes('#') || value.includes('"')
    return q ? `${pad}"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n` : `${pad}${value}\n`
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]\n`
    let out = ''
    for (const item of value) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item)
        if (entries.length === 0) { out += `${pad}- {}\n`; continue }
        out += `${pad}- ${entries[0][0]}: ${fmtInline(entries[0][1])}\n`
        for (let i = 1; i < entries.length; i++) out += `${pad}  ${entries[i][0]}: ${fmtInline(entries[i][1])}\n`
      } else { out += `${pad}- ${fmtInline(item)}\n` }
    }
    return out
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return `${pad}{}\n`
    let out = ''
    for (const [key, val] of entries) {
      out += typeof val === 'object' && val !== null
        ? `${pad}${key}:\n${jsonToYaml(val, indent + 1)}`
        : `${pad}${key}: ${fmtInline(val)}\n`
    }
    return out
  }
  return `${pad}${String(value)}\n`
}

function fmtInline(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const q = value.includes(':') || value.includes('#') || value.includes('"') || value === ''
    return q ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : value
  }
  return JSON.stringify(value)
}

// ── Schema helpers ──

const s = () => new SchemaBuilder()
const errRef: SchemaObject = { $ref: '#/components/schemas/Error' }
const errResp = (desc: string): Response => ({ description: desc, content: { 'application/json': { schema: errRef } } })
const jsonBody = (schema: SchemaObject): RequestBody => ({ required: true, content: { 'application/json': { schema } } })
const jsonResp = (desc: string, schema: SchemaObject): Response => ({ description: desc, content: { 'application/json': { schema } } })

function errorSchema(): SchemaObject {
  return s().object({
    error: s().string().description('Error type or code').build(),
    message: s().string().description('Human-readable error message').build(),
    details: s().object({}).nullable().description('Additional error context').build(),
  }).required(['error', 'message']).build()
}
function messageSchema(): SchemaObject {
  return s().object({
    role: s().string().enum(['system', 'user', 'assistant', 'tool']).build(),
    content: s().string().description('Message content').build(),
  }).required(['role', 'content']).build()
}

// ── AIOpenAPISpec ──

/** Pre-built OpenAPI specification for the AI system */
export class AIOpenAPISpec {
  private builder: OpenAPIBuilder
  constructor() {
    this.builder = new OpenAPIBuilder(
      'AI System API', '1.0.0',
      'Comprehensive AI system with chat, code analysis, embeddings, tools, and workflow management',
    )
  }
  /** Generate the complete OpenAPI specification with all AI endpoints */
  generateSpec(): OpenAPISpec {
    this.addMetadata(); this.addComponentSchemas()
    this.addChatEndpoints(); this.addEmbeddingsEndpoint()
    this.addCodeEndpoints(); this.addModelEndpoints()
    this.addSystemEndpoints(); this.addToolEndpoints()
    this.addSkillEndpoints(); this.addWorkflowEndpoints()
    return this.builder.build()
  }
  private addMetadata(): void {
    this.builder
      .addServer('http://localhost:3000', 'Local development server')
      .addServer('https://api.ai-system.example.com', 'Production server')
      .addTag('Chat', 'Chat completion and streaming endpoints')
      .addTag('Embeddings', 'Text embedding generation')
      .addTag('Code', 'Code analysis, review, fixing, and generation')
      .addTag('Models', 'Model listing and information')
      .addTag('System', 'Health checks and system statistics')
      .addTag('Tools', 'Tool discovery and execution')
      .addTag('Skills', 'Skill listing')
      .addTag('Workflow', 'Workflow orchestration')
      .setContact({ name: 'AI System Team', email: 'team@ai-system.example.com' })
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addSecurityScheme('bearerAuth', {
        type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
        description: 'JWT bearer token authentication',
      })
      .addSecurityScheme('apiKey', {
        type: 'apiKey', name: 'X-API-Key', in: 'header',
        description: 'API key passed via header',
      })
  }
  private addComponentSchemas(): void {
    this.builder
      .addSchema('Error', errorSchema())
      .addSchema('Message', messageSchema())
      .addSchema('ModelInfo', s().object({
        id: s().string().description('Model identifier').build(),
        name: s().string().description('Display name').build(),
        provider: s().string().description('Model provider').build(),
        capabilities: s().array(s().string().build()).description('Supported capabilities').build(),
      }).required(['id', 'name']).build())
  }
  private addChatEndpoints(): void {
    const chatReq = s().object({
      messages: s().array(messageSchema()).description('Conversation messages').build(),
      model: s().string().description('Model identifier').example('gpt-4').build(),
      temperature: s().number().min(0).max(2).default(0.7).description('Sampling temperature').build(),
      maxTokens: s().integer().min(1).max(128000).description('Maximum tokens to generate').build(),
    }).required(['messages']).build()
    const chatResp = s().object({
      id: s().string().build(), message: messageSchema(),
      usage: s().object({
        promptTokens: s().integer().build(), completionTokens: s().integer().build(), totalTokens: s().integer().build(),
      }).build(),
    }).build()
    const auth = [{ bearerAuth: [] }]
    this.builder.addPath('/api/chat', 'post', {
      summary: 'Chat completion', operationId: 'createChatCompletion',
      description: 'Generate a chat completion response from the given messages',
      tags: ['Chat'], security: auth, requestBody: jsonBody(chatReq),
      responses: {
        '200': jsonResp('Successful completion', chatResp),
        '400': errResp('Invalid request'), '401': errResp('Unauthorized'), '429': errResp('Rate limit exceeded'),
      },
    })
    this.builder.addPath('/api/chat/stream', 'post', {
      summary: 'Streaming chat completion', operationId: 'createChatCompletionStream',
      description: 'Generate a streaming chat completion using server-sent events',
      tags: ['Chat'], security: auth, requestBody: jsonBody(chatReq),
      responses: {
        '200': { description: 'Streaming response (SSE)', content: {
          'text/event-stream': { schema: s().string().description('Server-sent events stream of completion chunks').build() },
        } },
        '400': errResp('Invalid request'), '401': errResp('Unauthorized'),
      },
    })
  }
  private addEmbeddingsEndpoint(): void {
    this.builder.addPath('/api/embeddings', 'post', {
      summary: 'Generate text embeddings', operationId: 'createEmbeddings',
      description: 'Generate vector embeddings for the provided text input',
      tags: ['Embeddings'], security: [{ bearerAuth: [] }],
      requestBody: jsonBody(s().object({
        input: s().string().description('Text to embed (or array of texts)').build(),
        model: s().string().description('Embedding model identifier').build(),
      }).required(['input']).build()),
      responses: {
        '200': jsonResp('Embeddings generated', s().object({
          embeddings: s().array(s().object({
            index: s().integer().build(), vector: s().array(s().number().build()).build(),
          }).build()).build(),
          model: s().string().build(), usage: s().object({ totalTokens: s().integer().build() }).build(),
        }).build()),
        '400': errResp('Invalid request'),
      },
    })
  }
  private addCodeEndpoints(): void {
    const codeIn = s().object({
      code: s().string().description('Source code to process').build(),
      language: s().string().description('Programming language').example('typescript').build(),
      context: s().string().description('Additional context').build(),
    }).required(['code']).build()
    const codeOut = s().object({
      result: s().string().description('Processed output').build(),
      suggestions: s().array(s().object({
        line: s().integer().build(), message: s().string().build(),
        severity: s().string().enum(['info', 'warning', 'error']).build(),
      }).build()).build(),
      metadata: s().object({}).description('Additional processing metadata').build(),
    }).build()
    const eps = [
      ['/api/code/analyze', 'Analyze code', 'analyzeCode', 'Perform static analysis on the provided source code'],
      ['/api/code/review', 'Review code', 'reviewCode', 'Generate a code review with suggestions and issues'],
      ['/api/code/fix', 'Fix code', 'fixCode', 'Automatically fix issues in the provided source code'],
      ['/api/code/generate', 'Generate code', 'generateCode', 'Generate code from a natural language description'],
    ] as const
    for (const [p, sum, id, d] of eps) {
      this.builder.addPath(p, 'post', {
        summary: sum, description: d, operationId: id,
        tags: ['Code'], security: [{ bearerAuth: [] }], requestBody: jsonBody(codeIn),
        responses: { '200': jsonResp('Successful response', codeOut), '400': errResp('Invalid request'), '401': errResp('Unauthorized') },
      })
    }
  }
  private addModelEndpoints(): void {
    this.builder.addPath('/api/models', 'get', {
      summary: 'List available models', operationId: 'listModels',
      description: 'Retrieve the list of all available AI models and their capabilities',
      tags: ['Models'], security: [{ bearerAuth: [] }],
      responses: { '200': jsonResp('Model list', s().object({
        models: s().array({ $ref: '#/components/schemas/ModelInfo' }).description('Available models').build(),
      }).build()) },
    })
  }
  private addSystemEndpoints(): void {
    this.builder.addPath('/api/health', 'get', {
      summary: 'Health check', operationId: 'healthCheck',
      description: 'Returns the current health status of the AI system', tags: ['System'],
      responses: {
        '200': jsonResp('System is healthy', s().object({
          status: s().string().enum(['ok', 'degraded', 'down']).build(),
          uptime: s().number().description('Uptime in seconds').build(),
          version: s().string().description('API version').build(),
        }).required(['status']).build()),
        '503': errResp('Service unavailable'),
      },
    })
    this.builder.addPath('/api/stats', 'get', {
      summary: 'System statistics', operationId: 'getStats',
      description: 'Retrieve system usage statistics and performance metrics',
      tags: ['System'], security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResp('System statistics', s().object({
          totalRequests: s().integer().description('Total requests processed').build(),
          activeConnections: s().integer().description('Current active connections').build(),
          avgResponseTime: s().number().description('Average response time in ms').build(),
          modelsLoaded: s().integer().description('Number of loaded models').build(),
          memoryUsage: s().object({
            used: s().integer().description('Memory used in bytes').build(),
            total: s().integer().description('Total memory in bytes').build(),
          }).build(),
        }).build()),
        '401': errResp('Unauthorized'),
      },
    })
  }
  private addToolEndpoints(): void {
    this.builder.addPath('/api/tools/{toolName}/execute', 'post', {
      summary: 'Execute a tool', operationId: 'executeTool',
      description: 'Execute a named tool with the provided input parameters',
      tags: ['Tools'], security: [{ bearerAuth: [] }],
      parameters: [{ name: 'toolName', in: 'path', required: true, description: 'Tool identifier', schema: { type: 'string' } }],
      requestBody: jsonBody(s().object({
        input: s().object({}).description('Tool input parameters').build(),
        context: s().object({}).description('Execution context').build(),
      }).required(['input']).build()),
      responses: {
        '200': jsonResp('Tool execution result', s().object({
          output: s().object({}).description('Tool output').build(),
          executionTime: s().number().description('Execution time in ms').build(),
        }).build()),
        '400': errResp('Invalid input'), '404': errResp('Tool not found'),
      },
    })
    this.builder.addPath('/api/tools', 'get', {
      summary: 'List available tools', operationId: 'listTools',
      description: 'Retrieve the list of all registered tools and their descriptions',
      tags: ['Tools'], security: [{ bearerAuth: [] }],
      responses: { '200': jsonResp('Tool list', s().object({
        tools: s().array(s().object({
          name: s().string().build(), description: s().string().build(),
          inputSchema: s().object({}).description('Expected input JSON schema').build(),
        }).required(['name']).build()).build(),
      }).build()) },
    })
  }
  private addSkillEndpoints(): void {
    this.builder.addPath('/api/skills', 'get', {
      summary: 'List available skills', operationId: 'listSkills',
      description: 'Retrieve the list of all registered skills and their metadata',
      tags: ['Skills'], security: [{ bearerAuth: [] }],
      responses: { '200': jsonResp('Skill list', s().object({
        skills: s().array(s().object({
          name: s().string().build(), description: s().string().build(), version: s().string().build(),
        }).required(['name']).build()).build(),
      }).build()) },
    })
  }
  private addWorkflowEndpoints(): void {
    this.builder.addPath('/api/workflow/start', 'post', {
      summary: 'Start a workflow', operationId: 'startWorkflow',
      description: 'Initiate a new workflow execution with the given steps and configuration',
      tags: ['Workflow'], security: [{ bearerAuth: [] }],
      requestBody: jsonBody(s().object({
        name: s().string().description('Workflow name').build(),
        steps: s().array(s().object({
          action: s().string().description('Step action identifier').build(),
          params: s().object({}).description('Step parameters').build(),
        }).required(['action']).build()).description('Ordered workflow steps').build(),
        config: s().object({}).description('Workflow-level configuration').build(),
      }).required(['name', 'steps']).build()),
      responses: {
        '201': jsonResp('Workflow started', s().object({
          id: s().string().description('Workflow execution ID').build(),
          status: s().string().enum(['pending', 'running']).build(),
          createdAt: s().string().format('date-time').build(),
        }).required(['id', 'status']).build()),
        '400': errResp('Invalid workflow definition'),
      },
    })
    this.builder.addPath('/api/workflow/{id}/status', 'get', {
      summary: 'Get workflow status', operationId: 'getWorkflowStatus',
      description: 'Retrieve the current status and progress of a workflow execution',
      tags: ['Workflow'], security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, description: 'Workflow execution ID', schema: { type: 'string' } }],
      responses: {
        '200': jsonResp('Workflow status', s().object({
          id: s().string().build(),
          status: s().string().enum(['pending', 'running', 'completed', 'failed', 'cancelled']).build(),
          currentStep: s().integer().description('Index of the currently executing step').build(),
          totalSteps: s().integer().build(),
          startedAt: s().string().format('date-time').build(),
          completedAt: s().string().format('date-time').nullable().build(),
          error: s().string().nullable().description('Error message if failed').build(),
        }).required(['id', 'status']).build()),
        '404': errResp('Workflow not found'),
      },
    })
  }
}

/** Create a pre-built OpenAPI spec for the AI system */
export function createAIOpenAPISpec(): OpenAPISpec {
  return new AIOpenAPISpec().generateSpec()
}
