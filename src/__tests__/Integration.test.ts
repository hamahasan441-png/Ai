/**
 * Integration Tests — Cache + Brain + Validation Pipeline
 *
 * Tests that verify multiple system components working together:
 *   • Cache service with real MemoryCache + DiskCache
 *   • Input validation before tool execution
 *   • Logging with correlation IDs across operations
 *   • Metrics collection during operations
 *   • API retry behavior
 *   • Plugin SDK lifecycle
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import { CacheService } from '../services/cache/CacheService.js'
import {
  validateToolInput,
  detectSqlInjection,
  detectPathTraversal,
  validateSchema,
} from '../utils/inputValidation.js'
import {
  Logger,
  LogLevel,
  bufferTransport,
  generateCorrelationId,
  type LogEntry,
} from '../utils/logger.js'
import { MetricsRegistry } from '../services/metrics.js'
import { RetryPolicy, CircuitBreaker } from '../services/apiRetry.js'
import { PluginSDK, definePlugin } from '../plugins/PluginSDK.js'

// ── Cache Integration ──

let tmpDir: string

// Mock the disk cache path module
vi.mock('../utils/paths.js', () => ({
  getDiskCachePath: () => tmpDir,
  ensureDir: (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  },
}))

describe('Integration: Cache + Validation + Logging Pipeline', () => {
  let cache: CacheService
  let logBuffer: LogEntry[]
  let log: Logger
  let metricsRegistry: MetricsRegistry

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-test-'))
    cache = new CacheService({ enableDisk: true })
    logBuffer = []
    log = new Logger({
      level: LogLevel.DEBUG,
      transports: [bufferTransport(logBuffer)],
      name: 'integration-test',
      timestamps: false,
    })
    metricsRegistry = new MetricsRegistry({ prefix: 'test' })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('full cache-through flow with logging and metrics', async () => {
    const cacheHits = metricsRegistry.counter('cache_hits', 'Cache hits')
    const cacheMisses = metricsRegistry.counter('cache_misses', 'Cache misses')
    const correlationId = generateCorrelationId()
    log.setCorrelationId(correlationId)

    // First call — cache miss, compute and store
    log.info('Starting cache-through operation')
    const result1 = await cache.withCache('test:key', async () => {
      cacheMisses.inc({ tier: 'memory' })
      log.debug('Cache miss — computing value')
      return { data: 'computed result', timestamp: Date.now() }
    })

    expect(result1.data).toBe('computed result')
    expect(cacheMisses.get({ tier: 'memory' })).toBe(1)

    // Second call — cache hit
    const result2 = await cache.withCache('test:key', async () => {
      cacheMisses.inc({ tier: 'memory' })
      return { data: 'should not compute', timestamp: 0 }
    })

    expect(result2.data).toBe('computed result')
    expect(cacheMisses.get({ tier: 'memory' })).toBe(1) // No additional miss

    // Verify logging
    expect(logBuffer.length).toBeGreaterThanOrEqual(2)
    expect(logBuffer.every(entry => entry.correlationId === correlationId)).toBe(true)
    log.info('Cache-through complete', { hits: cacheHits.get(), misses: cacheMisses.get() })
  })

  it('validates input then caches result', async () => {
    // Validate input first
    const validation = validateToolInput('database', {
      command: 'query',
      connection_string: 'sqlite:///test.db',
      sql: 'SELECT * FROM users WHERE id = 1',
    })
    expect(validation.valid).toBe(true)

    // If valid, cache the result
    const result = await cache.withCache('db:query:users', async () => {
      log.info('Executing validated query')
      return [{ id: 1, name: 'Alice' }]
    })

    expect(result).toEqual([{ id: 1, name: 'Alice' }])

    // Retrieve from cache on repeat
    const cached = await cache.get('db:query:users')
    expect(cached).toEqual([{ id: 1, name: 'Alice' }])
  })

  it('rejects dangerous input before it reaches the cache', () => {
    // SQL injection attempt
    const sqlResult = validateToolInput('database', {
      command: 'query',
      connection_string: 'sqlite:///test.db',
      sql: "'; DROP TABLE users; --",
    })
    expect(sqlResult.valid).toBe(false)
    expect(sqlResult.errors[0]?.rule).toBe('sql_injection')

    // Path traversal attempt
    const pathResult = validateToolInput('file_read', {
      path: '../../../etc/passwd',
    })
    expect(pathResult.valid).toBe(false)
    expect(pathResult.errors[0]?.rule).toBe('path_traversal')
  })

  it('cache invalidation with pattern matching', async () => {
    // Store multiple entries
    await cache.set('user:1:profile', { name: 'Alice' })
    await cache.set('user:2:profile', { name: 'Bob' })
    await cache.set('user:1:settings', { theme: 'dark' })

    // Invalidate all user:1 entries
    const count = await cache.invalidate('user:1:*')
    expect(count).toBe(2)

    // user:2 should still exist
    const bob = await cache.get('user:2:profile')
    expect(bob).toEqual({ name: 'Bob' })
  })

  it('cache stats integration with metrics', async () => {
    await cache.set('key1', 'value1')
    await cache.get('key1') // hit
    await cache.get('missing') // miss

    const stats = cache.getStats()
    expect(stats.totalHits).toBeGreaterThanOrEqual(1)
    expect(stats.totalMisses).toBeGreaterThanOrEqual(1)

    // Record stats in metrics
    metricsRegistry.gauge('cache_entries').set(stats.memory.entries)
    metricsRegistry.gauge('cache_hit_rate').set(stats.memory.hitRate)

    const snapshot = metricsRegistry.snapshot()
    expect(snapshot.length).toBe(2)
  })
})

describe('Integration: Retry + CircuitBreaker + Metrics', () => {
  let metricsRegistry: MetricsRegistry

  beforeEach(() => {
    metricsRegistry = new MetricsRegistry({ prefix: 'api' })
  })

  it('retry policy with metrics tracking', async () => {
    const retryCounter = metricsRegistry.counter('retries', 'API retry count')
    const latencyHistogram = metricsRegistry.histogram('latency_ms', 'API latency')

    let attempts = 0
    const retry = new RetryPolicy({
      maxRetries: 3,
      baseDelayMs: 1,
      isRetryable: () => true,
      onRetry: attempt => {
        retryCounter.inc({ attempt: String(attempt) })
      },
    })

    const start = Date.now()
    const result = await retry.execute(async () => {
      attempts++
      if (attempts < 3) throw new Error('temporary failure')
      return 'success'
    })
    latencyHistogram.observe(Date.now() - start)

    expect(result.data).toBe('success')
    expect(retryCounter.get({ attempt: '1' })).toBe(1)
    expect(retryCounter.get({ attempt: '2' })).toBe(1)
  })

  it('circuit breaker integrates with retry and metrics', async () => {
    const circuitOpenCounter = metricsRegistry.counter('circuit_open', 'Circuit opens')

    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 50,
      onStateChange: (_from, to) => {
        if (to === 'open') circuitOpenCounter.inc()
      },
    })

    // Trip the breaker
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('service down')
        })
      } catch {
        // Expected
      }
    }

    expect(breaker.state).toBe('open')
    expect(circuitOpenCounter.get()).toBe(1)

    // Wait for reset
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should recover
    const result = await breaker.execute(async () => 'recovered')
    expect(result).toBe('recovered')
  })
})

describe('Integration: Plugin SDK with Knowledge and Tools', () => {
  let sdk: PluginSDK
  let logBuffer: LogEntry[]
  let log: Logger

  beforeEach(() => {
    sdk = new PluginSDK({ autoGrantPermissions: true })
    logBuffer = []
    log = new Logger({
      level: LogLevel.DEBUG,
      transports: [bufferTransport(logBuffer)],
      name: 'plugin-integration',
      timestamps: false,
    })
  })

  it('full plugin lifecycle: register → activate → use tools → deactivate → uninstall', async () => {
    // Register plugin with tools and knowledge
    const lifecycleLog: string[] = []

    sdk.register(
      definePlugin({
        manifest: {
          id: 'math-helper',
          name: 'Math Helper',
          version: '1.0.0',
          description: 'Provides math tools',
          permissions: ['tools:execute', 'knowledge:write'],
        },
        lifecycle: {
          onInstall: () => lifecycleLog.push('installed'),
          onActivate: () => lifecycleLog.push('activated'),
          onDeactivate: () => lifecycleLog.push('deactivated'),
          onUninstall: () => lifecycleLog.push('uninstalled'),
        },
        tools: [
          {
            name: 'calculate',
            description: 'Evaluate a math expression',
            execute: async input => {
              const expr = String(input.expression)
              // Simple evaluator for test
              if (expr === '2+2') return { result: 4 }
              return { result: null, error: 'unsupported' }
            },
          },
        ],
        knowledge: [
          {
            category: 'math_basics',
            keywords: 'math arithmetic addition subtraction multiplication division',
            content: 'Basic arithmetic operations: +, -, *, /',
          },
        ],
      }),
    )

    log.info('Registered math-helper plugin')

    // Activate
    await sdk.activate('math-helper')
    expect(lifecycleLog).toEqual(['installed', 'activated'])
    log.info('Activated math-helper plugin')

    // Use tool
    const tools = sdk.getActiveTools()
    expect(tools).toHaveLength(1)
    const calcTool = tools[0]!
    const toolResult = await calcTool.execute(
      { expression: '2+2' },
      {
        manifest: sdk.getPlugin('math-helper')!.manifest,
        grantedPermissions: ['tools:execute'],
        storage: {
          get: () => undefined,
          set: () => {},
          delete: () => false,
          clear: () => {},
          keys: () => [],
        },
        log: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      },
    )
    expect(toolResult).toEqual({ result: 4 })

    // Use knowledge
    const knowledge = sdk.getActiveKnowledge()
    expect(knowledge).toHaveLength(1)
    expect(knowledge[0]?.keywords).toContain('arithmetic')

    // Deactivate and uninstall
    await sdk.uninstall('math-helper')
    expect(lifecycleLog).toEqual(['installed', 'activated', 'deactivated', 'uninstalled'])
    expect(sdk.getPlugin('math-helper')).toBeUndefined()

    log.info('Plugin lifecycle complete', { steps: lifecycleLog.length })
  })
})

describe('Integration: Validation + Schema for complex inputs', () => {
  it('validates complex nested tool inputs', () => {
    // Validate SQL safely
    const safeResult = detectSqlInjection('SELECT name, email FROM users WHERE active = true')
    expect(safeResult.valid).toBe(true)

    // Reject injection with multiple techniques
    const attacks = [
      '1; DROP TABLE users; --',
      "' OR 1=1 --",
      "admin'/*",
      '1 UNION SELECT * FROM passwords',
      "'; WAITFOR DELAY '0:0:10'--",
    ]

    for (const attack of attacks) {
      expect(detectSqlInjection(attack).valid).toBe(false)
    }
  })

  it('validates file paths safely', () => {
    // Safe paths
    expect(detectPathTraversal('/home/user/project/file.ts').valid).toBe(true)
    expect(detectPathTraversal('/var/data/output.json').valid).toBe(true)

    // Dangerous paths
    expect(detectPathTraversal('../../../etc/shadow').valid).toBe(false)
    expect(detectPathTraversal('/proc/self/environ').valid).toBe(false)
    expect(detectPathTraversal('/sys/class/net').valid).toBe(false)
  })

  it('validates schema with multiple field types', () => {
    const result = validateSchema(
      {
        name: 'Test',
        count: 5,
        enabled: true,
        tags: ['a', 'b'],
      },
      {
        name: { type: 'string', required: true },
        count: { type: 'number', required: true },
        enabled: { type: 'boolean', required: false },
        tags: { type: 'array', required: false },
      },
    )
    expect(result.valid).toBe(true)
  })
})
