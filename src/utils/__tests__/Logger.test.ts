import { describe, it, expect, beforeEach } from 'vitest'
import {
  Logger,
  LogLevel,
  createLogger,
  generateCorrelationId,
  bufferTransport,
  type LogEntry,
} from '../../utils/logger.js'

describe('Logger', () => {
  let buffer: LogEntry[]
  let log: Logger

  beforeEach(() => {
    buffer = []
    log = createLogger({
      name: 'test',
      level: LogLevel.TRACE,
      transports: [bufferTransport(buffer)],
      json: false,
      timestamps: false,
    })
  })

  describe('log levels', () => {
    it('logs trace messages at trace level', () => {
      log.trace('trace message')
      expect(buffer).toHaveLength(1)
      expect(buffer[0]?.msg).toBe('trace message')
      expect(buffer[0]?.levelName).toBe('trace')
    })

    it('logs debug messages', () => {
      log.debug('debug message')
      expect(buffer).toHaveLength(1)
      expect(buffer[0]?.levelName).toBe('debug')
    })

    it('logs info messages', () => {
      log.info('info message')
      expect(buffer).toHaveLength(1)
      expect(buffer[0]?.levelName).toBe('info')
    })

    it('logs warn messages', () => {
      log.warn('warn message')
      expect(buffer).toHaveLength(1)
      expect(buffer[0]?.levelName).toBe('warn')
    })

    it('logs error messages', () => {
      log.error('error message')
      expect(buffer).toHaveLength(1)
      expect(buffer[0]?.levelName).toBe('error')
    })

    it('logs fatal messages', () => {
      log.fatal('fatal message')
      expect(buffer).toHaveLength(1)
      expect(buffer[0]?.levelName).toBe('fatal')
    })
  })

  describe('level filtering', () => {
    it('filters messages below the configured level', () => {
      const warnLog = createLogger({
        level: LogLevel.WARN,
        transports: [bufferTransport(buffer)],
      })
      warnLog.trace('should not appear')
      warnLog.debug('should not appear')
      warnLog.info('should not appear')
      warnLog.warn('should appear')
      warnLog.error('should appear')
      expect(buffer).toHaveLength(2)
    })

    it('silent level suppresses all messages', () => {
      const silentLog = createLogger({
        level: LogLevel.SILENT,
        transports: [bufferTransport(buffer)],
      })
      silentLog.fatal('should not appear')
      expect(buffer).toHaveLength(0)
    })
  })

  describe('dynamic level change', () => {
    it('changes level at runtime', () => {
      log.setLevel(LogLevel.ERROR)
      log.info('filtered out')
      expect(buffer).toHaveLength(0)
      log.error('passes through')
      expect(buffer).toHaveLength(1)
    })

    it('accepts string level', () => {
      log.setLevel('warn')
      log.debug('filtered')
      log.warn('passes')
      expect(buffer).toHaveLength(1)
    })
  })

  describe('context', () => {
    it('includes context in every log entry', () => {
      const ctxLog = createLogger({
        context: { service: 'cache', version: '1.0' },
        level: LogLevel.TRACE,
        transports: [bufferTransport(buffer)],
      })
      ctxLog.info('test')
      expect(buffer[0]?.service).toBe('cache')
      expect(buffer[0]?.version).toBe('1.0')
    })

    it('includes additional data in log entries', () => {
      log.info('request', { userId: 123, action: 'login' })
      expect(buffer[0]?.userId).toBe(123)
      expect(buffer[0]?.action).toBe('login')
    })
  })

  describe('correlation ID', () => {
    it('includes correlation ID when set', () => {
      log.setCorrelationId('req-123')
      log.info('request processed')
      expect(buffer[0]?.correlationId).toBe('req-123')
    })

    it('returns correlation ID', () => {
      log.setCorrelationId('req-456')
      expect(log.getCorrelationId()).toBe('req-456')
    })
  })

  describe('child logger', () => {
    it('inherits parent context', () => {
      const parent = createLogger({
        context: { service: 'api' },
        level: LogLevel.TRACE,
        transports: [bufferTransport(buffer)],
      })
      const child = parent.child({ module: 'auth' })
      child.info('child log')
      expect(buffer[0]?.service).toBe('api')
      expect(buffer[0]?.module).toBe('auth')
    })

    it('inherits correlation ID', () => {
      log.setCorrelationId('parent-id')
      const child = log.child({ extra: true })
      child.info('test')
      expect(buffer[0]?.correlationId).toBe('parent-id')
    })

    it('child can override parent context', () => {
      const parent = createLogger({
        context: { service: 'api' },
        level: LogLevel.TRACE,
        transports: [bufferTransport(buffer)],
      })
      const child = parent.child({ service: 'cache' })
      child.info('overridden')
      expect(buffer[0]?.service).toBe('cache')
    })
  })

  describe('isLevelEnabled', () => {
    it('returns true for enabled levels', () => {
      const infoLog = createLogger({ level: LogLevel.INFO, transports: [] })
      expect(infoLog.isLevelEnabled(LogLevel.INFO)).toBe(true)
      expect(infoLog.isLevelEnabled(LogLevel.ERROR)).toBe(true)
    })

    it('returns false for disabled levels', () => {
      const infoLog = createLogger({ level: LogLevel.INFO, transports: [] })
      expect(infoLog.isLevelEnabled(LogLevel.DEBUG)).toBe(false)
      expect(infoLog.isLevelEnabled(LogLevel.TRACE)).toBe(false)
    })
  })

  describe('generateCorrelationId', () => {
    it('generates unique IDs', () => {
      const id1 = generateCorrelationId()
      const id2 = generateCorrelationId()
      expect(id1).not.toBe(id2)
    })

    it('generates non-empty strings', () => {
      const id = generateCorrelationId()
      expect(id.length).toBeGreaterThan(0)
      expect(id).toContain('-')
    })
  })

  describe('transport error handling', () => {
    it('does not throw when transport errors', () => {
      const failLog = createLogger({
        level: LogLevel.TRACE,
        transports: [
          () => {
            throw new Error('transport failure')
          },
        ],
      })
      // Should not throw
      expect(() => failLog.info('test')).not.toThrow()
    })
  })
})
