/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Structured Logging System                                                    ║
 * ║                                                                              ║
 * ║  Lightweight, Pino-inspired structured logger with:                          ║
 * ║    • Log levels (trace → fatal)                                              ║
 * ║    • JSON output for production, pretty-print for development                ║
 * ║    • Correlation IDs for request tracing                                     ║
 * ║    • Child loggers with inherited context                                    ║
 * ║    • Configurable transports (console, file, custom)                         ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    import { logger, createLogger } from './utils/logger.js'                  ║
 * ║    logger.info('Server started', { port: 3000 })                             ║
 * ║    const child = logger.child({ service: 'cache' })                          ║
 * ║    child.warn('Cache miss', { key: 'abc' })                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Log Levels ──

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
  SILENT = 100,
}

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.TRACE]: 'trace',
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARN]: 'warn',
  [LogLevel.ERROR]: 'error',
  [LogLevel.FATAL]: 'fatal',
  [LogLevel.SILENT]: 'silent',
}

const LEVEL_FROM_STRING: Record<string, LogLevel> = {
  trace: LogLevel.TRACE,
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  fatal: LogLevel.FATAL,
  silent: LogLevel.SILENT,
}

// ── Types ──

export interface LogEntry {
  level: number
  levelName: string
  msg: string
  timestamp: string
  correlationId?: string
  [key: string]: unknown
}

export type LogTransport = (entry: LogEntry) => void

export interface LoggerConfig {
  /** Minimum log level (default: 'info' in production, 'debug' in dev) */
  level?: LogLevel | string
  /** Context fields added to every log entry */
  context?: Record<string, unknown>
  /** Correlation ID for request tracing */
  correlationId?: string
  /** Custom transports (default: console) */
  transports?: LogTransport[]
  /** Enable JSON output (default: true in production, false in dev) */
  json?: boolean
  /** Name for this logger (added to all entries) */
  name?: string
  /** Enable timestamps (default: true) */
  timestamps?: boolean
}

// ── Transports ──

/**
 * Console transport — outputs JSON or pretty-printed logs.
 */
export function consoleTransport(json: boolean): LogTransport {
  return (entry: LogEntry) => {
    if (json) {
      // JSON output for production — machine-parseable
      const output = JSON.stringify(entry)
      if (entry.level >= LogLevel.ERROR) {
        process.stderr.write(output + '\n')
      } else {
        process.stdout.write(output + '\n')
      }
    } else {
      // Pretty print for development
      const time = entry.timestamp
      const level = entry.levelName.toUpperCase().padEnd(5)
      const ctx = { ...entry }
      delete ctx.level
      delete ctx.levelName
      delete ctx.msg
      delete ctx.timestamp
      const extra = Object.keys(ctx).length > 0 ? ' ' + JSON.stringify(ctx) : ''
      const line = `${time} ${level} ${entry.msg}${extra}`

      if (entry.level >= LogLevel.ERROR) {
        process.stderr.write(line + '\n')
      } else {
        process.stdout.write(line + '\n')
      }
    }
  }
}

/**
 * File transport — appends JSON logs to a file (one line per entry).
 */
export function fileTransport(filePath: string): LogTransport {
  // Lazy import to avoid loading fs at module level
  let appendFile: ((path: string, data: string) => void) | null = null

  return (entry: LogEntry) => {
    if (!appendFile) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs')
      appendFile = (p: string, data: string) => fs.appendFileSync(p, data)
    }
    appendFile(filePath, JSON.stringify(entry) + '\n')
  }
}

/**
 * In-memory buffer transport — stores entries for testing/inspection.
 */
export function bufferTransport(buffer: LogEntry[]): LogTransport {
  return (entry: LogEntry) => {
    buffer.push(entry)
  }
}

// ── Logger Class ──

/**
 * Structured logger with log levels, context, and correlation IDs.
 *
 * @example
 * ```ts
 * const log = createLogger({ name: 'MyService', level: 'debug' })
 * log.info('Processing request', { userId: 123 })
 * log.error('Failed', { error: err.message })
 *
 * // Child logger inherits context
 * const child = log.child({ requestId: 'abc123' })
 * child.debug('Step 1 complete')
 * ```
 */
export class Logger {
  private _level: LogLevel
  private _context: Record<string, unknown>
  private _correlationId?: string
  private _transports: LogTransport[]
  private _timestamps: boolean

  constructor(config?: LoggerConfig) {
    const isProduction = process.env.NODE_ENV === 'production'

    this._level = resolveLevel(config?.level) ?? (isProduction ? LogLevel.INFO : LogLevel.DEBUG)
    this._context = config?.context ?? {}
    this._correlationId = config?.correlationId
    this._timestamps = config?.timestamps !== false
    this._transports = config?.transports ?? [
      consoleTransport(config?.json ?? isProduction),
    ]

    if (config?.name) {
      this._context.name = config.name
    }
  }

  /** Current log level */
  get level(): LogLevel {
    return this._level
  }

  /** Update log level dynamically */
  setLevel(level: LogLevel | string): void {
    this._level = resolveLevel(level) ?? LogLevel.INFO
  }

  /** Set correlation ID for request tracing */
  setCorrelationId(id: string): void {
    this._correlationId = id
  }

  /** Get correlation ID */
  getCorrelationId(): string | undefined {
    return this._correlationId
  }

  /**
   * Create a child logger that inherits this logger's configuration
   * but adds additional context fields.
   */
  child(context: Record<string, unknown>): Logger {
    const child = new Logger({
      level: this._level,
      context: { ...this._context, ...context },
      correlationId: this._correlationId,
      transports: this._transports,
      timestamps: this._timestamps,
    })
    return child
  }

  /** Check if a level is enabled */
  isLevelEnabled(level: LogLevel): boolean {
    return level >= this._level
  }

  // ── Level Methods ──

  trace(msg: string, data?: Record<string, unknown>): void {
    this._log(LogLevel.TRACE, msg, data)
  }

  debug(msg: string, data?: Record<string, unknown>): void {
    this._log(LogLevel.DEBUG, msg, data)
  }

  info(msg: string, data?: Record<string, unknown>): void {
    this._log(LogLevel.INFO, msg, data)
  }

  warn(msg: string, data?: Record<string, unknown>): void {
    this._log(LogLevel.WARN, msg, data)
  }

  error(msg: string, data?: Record<string, unknown>): void {
    this._log(LogLevel.ERROR, msg, data)
  }

  fatal(msg: string, data?: Record<string, unknown>): void {
    this._log(LogLevel.FATAL, msg, data)
  }

  // ── Internal ──

  private _log(level: LogLevel, msg: string, data?: Record<string, unknown>): void {
    if (level < this._level) return

    const entry: LogEntry = {
      level,
      levelName: LEVEL_NAMES[level] ?? 'unknown',
      msg,
      timestamp: this._timestamps ? new Date().toISOString() : '',
      ...this._context,
      ...data,
    }

    if (this._correlationId) {
      entry.correlationId = this._correlationId
    }

    for (const transport of this._transports) {
      try {
        transport(entry)
      } catch {
        // Swallow transport errors to prevent logging from crashing the app
      }
    }
  }
}

// ── Helper Functions ──

function resolveLevel(level?: LogLevel | string): LogLevel | undefined {
  if (level === undefined) return undefined
  if (typeof level === 'number') return level
  return LEVEL_FROM_STRING[level.toLowerCase()]
}

/**
 * Generate a correlation ID for request tracing.
 * Uses a combination of timestamp and random hex.
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `${timestamp}-${random}`
}

// ── Factory ──

/**
 * Create a new logger instance.
 *
 * @example
 * ```ts
 * const log = createLogger({ name: 'CacheService', level: 'debug' })
 * ```
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config)
}

// ── Default Instance ──

/**
 * Default application logger.
 * Configure at startup with `logger.setLevel()` or create child loggers.
 *
 * @example
 * ```ts
 * import { logger } from './utils/logger.js'
 * logger.info('Application started')
 * ```
 */
export const logger = createLogger({
  name: 'ai',
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  json: process.env.NODE_ENV === 'production',
})
