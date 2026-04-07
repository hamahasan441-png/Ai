import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HealthMonitor, createHealthMonitor } from '../index.js'

describe('HealthMonitor', () => {
  let monitor: HealthMonitor

  beforeEach(() => {
    monitor = new HealthMonitor({ version: '1.0.0', checkInterval: 100 })
  })

  afterEach(() => {
    monitor.clear()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const m = new HealthMonitor()
      expect(m).toBeDefined()
      m.clear()
    })

    it('should create with custom options', () => {
      const m = new HealthMonitor({
        version: '2.0.0',
        checkInterval: 5000,
        maxHistory: 50,
        memoryWarningPercent: 70,
      })
      expect(m).toBeDefined()
      m.clear()
    })
  })

  describe('registerCheck', () => {
    it('should register a health check', () => {
      monitor.registerCheck('db', async () => ({
        name: 'db',
        status: 'healthy',
        lastCheck: Date.now(),
      }))

      expect(monitor.getRegisteredChecks()).toContain('db')
    })

    it('should register multiple checks', () => {
      monitor.registerCheck('db', async () => ({
        name: 'db',
        status: 'healthy',
        lastCheck: Date.now(),
      }))
      monitor.registerCheck('cache', async () => ({
        name: 'cache',
        status: 'healthy',
        lastCheck: Date.now(),
      }))

      expect(monitor.getRegisteredChecks().length).toBe(2)
    })
  })

  describe('registerPingCheck', () => {
    it('should register a ping check that succeeds', async () => {
      monitor.registerPingCheck('service', async () => true)
      const report = await monitor.runAllChecks()
      expect(report.checks[0].status).toBe('healthy')
    })

    it('should register a ping check that fails', async () => {
      monitor.registerPingCheck('service', async () => false)
      const report = await monitor.runAllChecks()
      expect(report.checks[0].status).toBe('unhealthy')
    })

    it('should handle ping check errors', async () => {
      monitor.registerPingCheck('service', async () => {
        throw new Error('connection refused')
      })
      const report = await monitor.runAllChecks()
      expect(report.checks[0].status).toBe('unhealthy')
      expect(report.checks[0].message).toContain('connection refused')
    })
  })

  describe('registerTimeoutCheck', () => {
    it('should pass when check completes in time', async () => {
      monitor.registerTimeoutCheck(
        'fast-check',
        async () => { /* instant */ },
        1000,
      )
      const report = await monitor.runAllChecks()
      expect(report.checks[0].status).toBe('healthy')
    })

    it('should fail when check times out', async () => {
      monitor.registerTimeoutCheck(
        'slow-check',
        async () => { await new Promise(r => setTimeout(r, 5000)) },
        50,
      )
      const report = await monitor.runAllChecks()
      expect(report.checks[0].status).toBe('unhealthy')
      expect(report.checks[0].message).toContain('timeout')
    })
  })

  describe('unregisterCheck', () => {
    it('should remove a check', () => {
      monitor.registerCheck('db', async () => ({
        name: 'db',
        status: 'healthy',
        lastCheck: Date.now(),
      }))

      expect(monitor.unregisterCheck('db')).toBe(true)
      expect(monitor.getRegisteredChecks().length).toBe(0)
    })

    it('should return false for unknown check', () => {
      expect(monitor.unregisterCheck('unknown')).toBe(false)
    })
  })

  describe('runAllChecks', () => {
    it('should run all registered checks', async () => {
      monitor.registerCheck('check1', () => ({
        name: 'check1',
        status: 'healthy',
        lastCheck: Date.now(),
      }))
      monitor.registerCheck('check2', () => ({
        name: 'check2',
        status: 'degraded',
        lastCheck: Date.now(),
      }))

      const report = await monitor.runAllChecks()
      expect(report.checks.length).toBe(2)
      expect(report.status).toBe('degraded')
    })

    it('should handle check errors gracefully', async () => {
      monitor.registerCheck('broken', async () => {
        throw new Error('check failed')
      })

      const report = await monitor.runAllChecks()
      expect(report.checks[0].status).toBe('unhealthy')
      expect(report.status).toBe('unhealthy')
    })

    it('should aggregate status correctly — healthy', async () => {
      monitor.registerCheck('a', () => ({
        name: 'a',
        status: 'healthy',
        lastCheck: Date.now(),
      }))

      const report = await monitor.runAllChecks()
      expect(report.status).toBe('healthy')
    })

    it('should aggregate status — unhealthy wins', async () => {
      monitor.registerCheck('a', () => ({
        name: 'a',
        status: 'healthy',
        lastCheck: Date.now(),
      }))
      monitor.registerCheck('b', () => ({
        name: 'b',
        status: 'unhealthy',
        lastCheck: Date.now(),
      }))

      const report = await monitor.runAllChecks()
      expect(report.status).toBe('unhealthy')
    })

    it('should include resource information', async () => {
      const report = await monitor.runAllChecks()
      expect(report.resources).toBeDefined()
      expect(report.resources.memoryUsageMB).toBeGreaterThan(0)
      expect(report.resources.uptimeSeconds).toBeGreaterThan(0)
    })

    it('should include version', async () => {
      const report = await monitor.runAllChecks()
      expect(report.version).toBe('1.0.0')
    })

    it('should track degraded components', async () => {
      monitor.registerCheck('slow', () => ({
        name: 'slow',
        status: 'degraded',
        lastCheck: Date.now(),
      }))

      const report = await monitor.runAllChecks()
      expect(report.degradedComponents).toContain('slow')
    })

    it('should track unhealthy components', async () => {
      monitor.registerCheck('dead', () => ({
        name: 'dead',
        status: 'unhealthy',
        lastCheck: Date.now(),
      }))

      const report = await monitor.runAllChecks()
      expect(report.unhealthyComponents).toContain('dead')
    })
  })

  describe('getLastReport', () => {
    it('should return a report without running checks', () => {
      const report = monitor.getLastReport()
      expect(report).toBeDefined()
      expect(report.status).toBe('healthy')
    })
  })

  describe('isLive', () => {
    it('should always return true', () => {
      expect(monitor.isLive()).toBe(true)
    })
  })

  describe('isReadyToServe', () => {
    it('should return false before initial check', () => {
      expect(monitor.isReadyToServe()).toBe(false)
    })

    it('should return true after setReady', () => {
      monitor.setReady(true)
      expect(monitor.isReadyToServe()).toBe(true)
    })

    it('should return false when unhealthy component exists', async () => {
      monitor.setReady(true)
      monitor.registerCheck('dead', () => ({
        name: 'dead',
        status: 'unhealthy',
        lastCheck: Date.now(),
      }))
      await monitor.runAllChecks()
      expect(monitor.isReadyToServe()).toBe(false)
    })
  })

  describe('getHistory', () => {
    it('should store check history', async () => {
      await monitor.runAllChecks()
      await monitor.runAllChecks()
      expect(monitor.getHistory().length).toBe(2)
    })

    it('should respect max history', async () => {
      const m = new HealthMonitor({ maxHistory: 2 })
      await m.runAllChecks()
      await m.runAllChecks()
      await m.runAllChecks()
      expect(m.getHistory().length).toBe(2)
      m.clear()
    })
  })

  describe('alerts', () => {
    it('should trigger alert when threshold exceeded', async () => {
      const alertCallback = vi.fn()
      monitor.onAlert(alertCallback)
      monitor.addThreshold({
        metric: 'heapPercent',
        operator: '>',
        value: 0, // Always triggers (heap is always > 0%)
        message: 'Heap too high',
        severity: 'warning',
      })

      await monitor.runAllChecks()
      expect(alertCallback).toHaveBeenCalled()
      expect(monitor.getActiveAlerts().length).toBe(1)
    })

    it('should resolve alert when condition clears', async () => {
      monitor.addThreshold({
        metric: 'uptimeSeconds',
        operator: '<',
        value: 0, // Never triggers (uptime is always >= 0)
        message: 'Uptime too low',
        severity: 'warning',
      })

      await monitor.runAllChecks()
      expect(monitor.getActiveAlerts().length).toBe(0)
    })

    it('should get all alerts', async () => {
      monitor.addThreshold({
        metric: 'heapPercent',
        operator: '>=',
        value: 0,
        message: 'test',
        severity: 'critical',
      })

      await monitor.runAllChecks()
      expect(monitor.getAllAlerts().length).toBeGreaterThan(0)
    })

    it('should handle unknown metric gracefully', async () => {
      monitor.addThreshold({
        metric: 'unknownMetric',
        operator: '>',
        value: 0,
        message: 'test',
        severity: 'warning',
      })

      await monitor.runAllChecks()
      expect(monitor.getActiveAlerts().length).toBe(0)
    })

    it('should handle callback errors gracefully', async () => {
      monitor.onAlert(() => { throw new Error('callback error') })
      monitor.addThreshold({
        metric: 'heapPercent',
        operator: '>',
        value: 0,
        message: 'test',
        severity: 'warning',
      })

      // Should not throw
      await monitor.runAllChecks()
    })
  })

  describe('getSystemResources', () => {
    it('should return resource metrics', () => {
      const resources = monitor.getSystemResources()
      expect(resources.memoryUsageMB).toBeGreaterThan(0)
      expect(resources.heapUsedMB).toBeGreaterThan(0)
      expect(resources.heapTotalMB).toBeGreaterThan(0)
      expect(resources.uptimeSeconds).toBeGreaterThan(0)
    })

    it('should have valid percentages', () => {
      const resources = monitor.getSystemResources()
      expect(resources.heapPercent).toBeGreaterThan(0)
      expect(resources.heapPercent).toBeLessThanOrEqual(100)
    })
  })

  describe('getTrend', () => {
    it('should return unknown with no history', () => {
      expect(monitor.getTrend('memoryPercent')).toBe('unknown')
    })

    it('should analyze trends from history', async () => {
      // Run checks to build history
      for (let i = 0; i < 5; i++) {
        await monitor.runAllChecks()
      }
      const trend = monitor.getTrend('heapPercent')
      expect(['rising', 'stable', 'falling', 'unknown']).toContain(trend)
    })
  })

  describe('getComponentStatus', () => {
    it('should return status for registered component', async () => {
      monitor.registerCheck('db', () => ({
        name: 'db',
        status: 'healthy',
        lastCheck: Date.now(),
      }))
      await monitor.runAllChecks()

      const status = monitor.getComponentStatus('db')
      expect(status).toBeDefined()
      expect(status!.status).toBe('healthy')
    })

    it('should return undefined for unknown component', () => {
      expect(monitor.getComponentStatus('unknown')).toBeUndefined()
    })
  })

  describe('start/stop', () => {
    it('should start and stop monitoring', async () => {
      monitor.registerCheck('test', () => ({
        name: 'test',
        status: 'healthy',
        lastCheck: Date.now(),
      }))

      monitor.start()
      await new Promise(r => setTimeout(r, 250))
      monitor.stop()

      expect(monitor.getHistory().length).toBeGreaterThan(0)
    })

    it('should be idempotent', () => {
      monitor.start()
      monitor.start() // Should not throw
      monitor.stop()
      monitor.stop() // Should not throw
    })
  })

  describe('clear', () => {
    it('should reset all state', async () => {
      monitor.registerCheck('test', () => ({
        name: 'test',
        status: 'healthy',
        lastCheck: Date.now(),
      }))
      await monitor.runAllChecks()
      monitor.clear()

      expect(monitor.getRegisteredChecks().length).toBe(0)
      expect(monitor.getHistory().length).toBe(0)
      expect(monitor.getAllAlerts().length).toBe(0)
    })
  })

  describe('operator evaluation', () => {
    it('should evaluate > operator', async () => {
      const alerts: unknown[] = []
      monitor.onAlert(a => alerts.push(a))
      monitor.addThreshold({ metric: 'heapPercent', operator: '>', value: 0, message: 't', severity: 'warning' })
      await monitor.runAllChecks()
      expect(alerts.length).toBe(1)
    })

    it('should evaluate <= operator', async () => {
      const alerts: unknown[] = []
      monitor.onAlert(a => alerts.push(a))
      monitor.addThreshold({ metric: 'heapPercent', operator: '<=', value: 100, message: 't', severity: 'warning' })
      await monitor.runAllChecks()
      expect(alerts.length).toBe(1)
    })

    it('should evaluate == operator', async () => {
      const alerts: unknown[] = []
      monitor.onAlert(a => alerts.push(a))
      monitor.addThreshold({ metric: 'heapPercent', operator: '==', value: -1, message: 't', severity: 'warning' })
      await monitor.runAllChecks()
      expect(alerts.length).toBe(0) // heapPercent is never -1
    })
  })

  describe('createHealthMonitor', () => {
    it('should create a HealthMonitor instance', () => {
      const m = createHealthMonitor({ version: '2.0.0' })
      expect(m).toBeInstanceOf(HealthMonitor)
      m.clear()
    })
  })
})
