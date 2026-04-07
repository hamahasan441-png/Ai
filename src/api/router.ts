/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Router                                                                  ║
 * ║                                                                              ║
 * ║  Lightweight HTTP request router with pattern matching, parameter            ║
 * ║  extraction, query string parsing, and JSON body parsing.                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { IncomingMessage, ServerResponse } from 'node:http'
import { URL } from 'node:url'

export interface ApiRequest extends IncomingMessage {
  params: Record<string, string>
  query: Record<string, string>
  body: unknown
  sessionId?: string
}

export interface ApiResponse {
  raw: ServerResponse
  json(statusCode: number, data: unknown): void
  error(statusCode: number, message: string, details?: unknown): void
  noContent(): void
}

export type RouteHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>

export interface Route {
  method: string
  pattern: string
  handler: RouteHandler
}

export type Middleware = (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => Promise<void>

function createApiResponse(raw: ServerResponse): ApiResponse {
  return {
    raw,
    json(statusCode: number, data: unknown): void {
      if (raw.writableEnded) return
      const body = JSON.stringify(data)
      raw.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      })
      raw.end(body)
    },
    error(statusCode: number, message: string, details?: unknown): void {
      if (raw.writableEnded) return
      const payload: Record<string, unknown> = { error: message, statusCode }
      if (details !== undefined) payload.details = details
      const body = JSON.stringify(payload)
      raw.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      })
      raw.end(body)
    },
    noContent(): void {
      if (raw.writableEnded) return
      raw.writeHead(204)
      raw.end()
    },
  }
}

interface CompiledRoute {
  method: string
  regex: RegExp
  paramNames: string[]
  handler: RouteHandler
}

function compilePattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = []
  const regexStr = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1))
        return '([^/]+)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { regex: new RegExp(`^${regexStr}$`), paramNames }
}

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8')
      if (!raw) {
        resolve(undefined)
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

export class Router {
  private routes: CompiledRoute[] = []
  private middlewares: Middleware[] = []

  get(pattern: string, handler: RouteHandler): void {
    this.addRoute('GET', pattern, handler)
  }

  post(pattern: string, handler: RouteHandler): void {
    this.addRoute('POST', pattern, handler)
  }

  put(pattern: string, handler: RouteHandler): void {
    this.addRoute('PUT', pattern, handler)
  }

  delete(pattern: string, handler: RouteHandler): void {
    this.addRoute('DELETE', pattern, handler)
  }

  use(middleware: Middleware): void {
    this.middlewares.push(middleware)
  }

  private addRoute(method: string, pattern: string, handler: RouteHandler): void {
    const { regex, paramNames } = compilePattern(pattern)
    this.routes.push({ method, regex, paramNames, handler })
  }

  async handle(incoming: IncomingMessage, outgoing: ServerResponse): Promise<void> {
    const apiRes = createApiResponse(outgoing)
    const apiReq = incoming as ApiRequest
    apiReq.params = {}
    apiReq.query = {}
    apiReq.body = undefined

    const urlStr = incoming.url ?? '/'
    const baseUrl = `http://${incoming.headers.host ?? 'localhost'}`
    let parsed: URL
    try {
      parsed = new URL(urlStr, baseUrl)
    } catch {
      apiRes.error(400, 'Invalid URL')
      return
    }

    const pathname = parsed.pathname
    parsed.searchParams.forEach((value, key) => {
      apiReq.query[key] = value
    })

    const method = (incoming.method ?? 'GET').toUpperCase()

    // Parse body for POST/PUT
    if (method === 'POST' || method === 'PUT') {
      try {
        apiReq.body = await parseBody(incoming)
      } catch {
        apiRes.error(400, 'Invalid JSON body')
        return
      }
    }

    // Find matching route
    let matchedRoute: CompiledRoute | undefined
    let params: Record<string, string> = {}

    for (const route of this.routes) {
      if (route.method !== method) continue
      const match = route.regex.exec(pathname)
      if (match) {
        matchedRoute = route
        params = {}
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]!)
        })
        break
      }
    }

    if (!matchedRoute) {
      // Check if path matches but method doesn't (405 vs 404)
      const pathExists = this.routes.some((r) => r.regex.test(pathname))
      if (pathExists) {
        const allowed = this.routes.filter((r) => r.regex.test(pathname)).map((r) => r.method)
        outgoing.setHeader('Allow', [...new Set(allowed)].join(', '))
        apiRes.error(405, 'Method Not Allowed')
      } else {
        apiRes.error(404, 'Not Found')
      }
      return
    }

    apiReq.params = params

    // Execute middleware chain then handler
    const handler = matchedRoute.handler
    let idx = 0
    const middlewareList = this.middlewares

    const executeNext = async (): Promise<void> => {
      if (idx < middlewareList.length) {
        const mw = middlewareList[idx]!
        idx++
        await mw(apiReq, apiRes, executeNext)
      } else {
        await handler(apiReq, apiRes)
      }
    }

    try {
      await executeNext()
    } catch (err) {
      if (!outgoing.writableEnded) {
        const message = err instanceof Error ? err.message : 'Internal Server Error'
        apiRes.error(500, message)
      }
    }
  }
}

export { createApiResponse }
