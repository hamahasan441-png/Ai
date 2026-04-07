/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Error Recovery & State Checkpointing — Graceful Degradation                 ║
 * ║                                                                              ║
 * ║  Tracks service health and provides automatic fallback:                      ║
 * ║    • ServiceRegistry – register services with health checks                  ║
 * ║    • Status transitions: healthy → degraded → unavailable                    ║
 * ║    • withFallback() – execute with automatic fallback on failure             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { GracefulDegradation, ServiceStatus } from './types.js'

// ── Internal State ──

interface ServiceEntry {
  name: string
  healthCheck: () => Promise<boolean>
  fallback?: () => unknown | Promise<unknown>
  status: ServiceStatus
  consecutiveFailures: number
}

// ── Config ──

const DEGRADED_THRESHOLD = 2
const UNAVAILABLE_THRESHOLD = 5

// ── Service Registry ──

export class ServiceRegistry {
  private services = new Map<string, ServiceEntry>()

  register(
    name: string,
    healthCheck: () => Promise<boolean>,
    fallback?: () => unknown | Promise<unknown>,
  ): void {
    this.services.set(name, {
      name,
      healthCheck,
      fallback,
      status: 'healthy',
      consecutiveFailures: 0,
    })
  }

  async checkHealth(name: string): Promise<ServiceStatus> {
    const entry = this.services.get(name)
    if (!entry) throw new Error(`Service "${name}" not registered`)

    try {
      const ok = await entry.healthCheck()
      if (ok) {
        entry.consecutiveFailures = 0
        entry.status = 'healthy'
      } else {
        this.recordFailure(entry)
      }
    } catch {
      this.recordFailure(entry)
    }

    return entry.status
  }

  async checkAllHealth(): Promise<Map<string, ServiceStatus>> {
    const results = new Map<string, ServiceStatus>()
    const entries = [...this.services.keys()]
    await Promise.all(
      entries.map(async name => {
        const status = await this.checkHealth(name)
        results.set(name, status)
      }),
    )
    return results
  }

  getStatus(name: string): ServiceStatus {
    const entry = this.services.get(name)
    if (!entry) throw new Error(`Service "${name}" not registered`)
    return entry.status
  }

  getServiceMap(): Map<string, GracefulDegradation> {
    const map = new Map<string, GracefulDegradation>()
    for (const [name, entry] of this.services) {
      map.set(name, {
        serviceName: name,
        status: entry.status,
        fallbackBehavior: entry.fallback ? 'configured' : undefined,
      })
    }
    return map
  }

  async withFallback<T>(
    name: string,
    operation: () => T | Promise<T>,
  ): Promise<T> {
    const entry = this.services.get(name)
    if (!entry) throw new Error(`Service "${name}" not registered`)

    try {
      const result = await operation()
      entry.consecutiveFailures = 0
      entry.status = 'healthy'
      return result
    } catch (err) {
      this.recordFailure(entry)

      if (entry.fallback) {
        return entry.fallback() as T
      }
      throw err
    }
  }

  // ── Private ──

  private recordFailure(entry: ServiceEntry): void {
    entry.consecutiveFailures++
    if (entry.consecutiveFailures >= UNAVAILABLE_THRESHOLD) {
      entry.status = 'unavailable'
    } else if (entry.consecutiveFailures >= DEGRADED_THRESHOLD) {
      entry.status = 'degraded'
    }
  }
}
