/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Module                                                                  ║
 * ║                                                                              ║
 * ║  Barrel re-export of all API module exports.                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

export { Router, createApiResponse } from './router.js'
export type { ApiRequest, ApiResponse, RouteHandler, Route, Middleware } from './router.js'

export {
  corsMiddleware,
  securityHeadersMiddleware,
  requestIdMiddleware,
  rateLimitMiddleware,
  logMiddleware,
} from './middleware.js'
export type { CorsOptions, RateLimitOptions } from './middleware.js'

export { ApiServer, ApiServerError } from './server.js'
export type { ApiServerConfig } from './server.js'

export { createApiRoutes } from './routes.js'

export { generateOpenApiSpec, serveOpenApiSpec, serveSwaggerUi } from './openapi.js'
export type {
  OpenApiSpec,
  OpenApiInfo,
  OpenApiSchema,
  OpenApiOperation,
  OpenApiPathItem,
  OpenApiComponents,
  GenerateOpenApiOptions,
} from './openapi.js'
