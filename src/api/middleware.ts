/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Middleware                                                               ║
 * ║                                                                              ║
 * ║  Middleware stack for the HTTP API: CORS, security headers, request ID,      ║
 * ║  rate limiting, and request logging.                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as crypto from 'node:crypto'
import type { Middleware, ApiRequest, ApiResponse } from './router.js'

export type { Middleware }

export interface CorsOptions {
  origin?: string
  methods?: string[]
  headers?: string[]
  maxAge?: number
}

export function corsMiddleware(options?: CorsOptions): Middleware {
  const origin = options?.origin ?? '*'
  const methods = options?.methods ?? ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  const headers = options?.headers ?? ['Content-Type', 'Authorization', 'X-Request-Id']
  const maxAge = options?.maxAge ?? 86400

  return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>): Promise<void> => {
    res.raw.setHeader('Access-Control-Allow-Origin', origin)
    res.raw.setHeader('Access-Control-Allow-Methods', methods.join(', '))
    res.raw.setHeader('Access-Control-Allow-Headers', headers.join(', '))
    res.raw.setHeader('Access-Control-Max-Age', String(maxAge))

    if (req.method === 'OPTIONS') {
      res.noContent()
      return
    }

    await next()
  }
}

export function securityHeadersMiddleware(): Middleware {
  return async (_req: ApiRequest, res: ApiResponse, next: () => Promise<void>): Promise<void> => {
    res.raw.setHeader('X-Content-Type-Options', 'nosniff')
    res.raw.setHeader('X-Frame-Options', 'DENY')
    res.raw.setHeader('X-XSS-Protection', '1; mode=block')
    res.raw.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.raw.setHeader('Content-Security-Policy', "default-src 'none'")
    await next()
  }
}

export function requestIdMiddleware(): Middleware {
  return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>): Promise<void> => {
    const requestId = (req.headers['x-request-id'] as string) ?? crypto.randomUUID()
    res.raw.setHeader('X-Request-Id', requestId)
    await next()
  }
}

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  /** Trust X-Forwarded-For header for client IP. Only enable behind a trusted reverse proxy. Default: false */
  trustProxy?: boolean
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

export function rateLimitMiddleware(options: RateLimitOptions): Middleware {
  const buckets = new Map<string, TokenBucket>()

  // Only use X-Forwarded-For when trustProxy is explicitly enabled.
  // Without a trusted proxy, clients can spoof this header to bypass rate limits.
  function getClientIp(req: ApiRequest): string {
    if (options.trustProxy) {
      const forwarded = req.headers['x-forwarded-for']
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0]!.trim()
      }
    }
    return req.socket?.remoteAddress ?? 'unknown'
  }

  return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>): Promise<void> => {
    const ip = getClientIp(req)
    const now = Date.now()

    let bucket = buckets.get(ip)
    if (!bucket) {
      bucket = { tokens: options.maxRequests, lastRefill: now }
      buckets.set(ip, bucket)
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill
    const refillRate = options.maxRequests / options.windowMs
    const tokensToAdd = elapsed * refillRate
    bucket.tokens = Math.min(options.maxRequests, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now

    if (bucket.tokens < 1) {
      res.raw.setHeader('Retry-After', String(Math.ceil(options.windowMs / 1000)))
      res.error(429, 'Too Many Requests')
      return
    }

    bucket.tokens -= 1
    res.raw.setHeader('X-RateLimit-Limit', String(options.maxRequests))
    res.raw.setHeader('X-RateLimit-Remaining', String(Math.floor(bucket.tokens)))
    await next()
  }
}

export function logMiddleware(): Middleware {
  return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>): Promise<void> => {
    const start = Date.now()
    await next()
    const duration = Date.now() - start
    const status = res.raw.statusCode
    console.log(`${req.method} ${req.url} ${status} ${duration}ms`)
  }
}
