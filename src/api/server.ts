/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Server                                                                  ║
 * ║                                                                              ║
 * ║  HTTP API server with health/ready/version endpoints, graceful shutdown,     ║
 * ║  and configurable middleware.                                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as http from 'node:http'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Router } from './router.js'
import { AiError, AiErrorCode } from '../utils/errors.js'

function getPackageVersion(): string {
  try {
    // Works in CommonJS (__dirname is available)
    // Also handles execution from dist/ directory
    const candidates = [
      path.resolve(__dirname, '../../package.json'),
      path.resolve(__dirname, '../package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ]
    for (const pkgPath of candidates) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        if (pkg.name === 'ai' && pkg.version) return pkg.version
      } catch {
        // try next candidate
      }
    }
    return '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export interface ApiServerConfig {
  port: number
  host: string
  corsOrigin?: string
  rateLimitPerMinute?: number
}

export class ApiServerError extends AiError {
  constructor(message: string, code: AiErrorCode = AiErrorCode.SERVICE_UNAVAILABLE, context?: Record<string, unknown>) {
    super(message, code, context)
    this.name = 'ApiServerError'
  }
}

export class ApiServer {
  private server: http.Server
  private router: Router
  private config: ApiServerConfig
  private startTime: number = Date.now()

  constructor(config: ApiServerConfig, router: Router) {
    this.config = config
    this.router = router

    // Register internal health routes
    this.registerHealthRoutes()

    this.server = http.createServer((req, res) => {
      this.router.handle(req, res).catch(() => {
        if (!res.writableEnded) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Internal Server Error', statusCode: 500 }))
        }
      })
    })
  }

  private registerHealthRoutes(): void {
    this.router.get('/health', async (_req, res) => {
      res.json(200, {
        status: 'ok',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        timestamp: new Date().toISOString(),
      })
    })

    this.router.get('/ready', async (_req, res) => {
      res.json(200, {
        status: 'ready',
        checks: {},
      })
    })

    this.router.get('/api/v1/version', async (_req, res) => {
      res.json(200, {
        version: getPackageVersion(),
        nodeVersion: process.version,
        platform: process.platform,
      })
    })
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.on('error', (err: NodeJS.ErrnoException) => {
        reject(new ApiServerError(`Failed to start server: ${err.message}`, AiErrorCode.SERVICE_UNAVAILABLE, { originalError: err.message }))
      })
      this.server.listen(this.config.port, this.config.host, () => {
        this.startTime = Date.now()
        resolve()
      })
    })
  }

  stop(timeoutMs: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.server.closeAllConnections?.()
        resolve()
      }, timeoutMs)

      this.server.close((err) => {
        clearTimeout(timeout)
        if (err) {
          reject(new ApiServerError(`Failed to stop server: ${err.message}`, AiErrorCode.SERVICE_UNAVAILABLE))
        } else {
          resolve()
        }
      })
    })
  }

  address(): { host: string; port: number } | null {
    const addr = this.server.address()
    if (addr && typeof addr === 'object') {
      return { host: addr.address, port: addr.port }
    }
    return null
  }
}
