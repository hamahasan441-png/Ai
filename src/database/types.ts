/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Database Types                                                              ║
 * ║                                                                              ║
 * ║  Core interfaces and types for the database abstraction layer.               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ══════════════════════════════════════════════════════════════════════════════
// Driver enumeration
// ══════════════════════════════════════════════════════════════════════════════

export type DatabaseDriver = 'sqlite' | 'postgres' | 'mysql' | 'memory'

// ══════════════════════════════════════════════════════════════════════════════
// Connection configuration
// ══════════════════════════════════════════════════════════════════════════════

export interface ConnectionConfig {
  driver: DatabaseDriver
  connectionString?: string
  filename?: string
  pool?: {
    min?: number
    max?: number
    idleTimeoutMs?: number
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Query result
// ══════════════════════════════════════════════════════════════════════════════

export interface QueryResult<T> {
  rows: T[]
  rowCount: number
  duration: number
}

// ══════════════════════════════════════════════════════════════════════════════
// Database connection interface
// ══════════════════════════════════════════════════════════════════════════════

export interface DatabaseConnection {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
  execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number; lastInsertId?: number }>
  transaction<T>(fn: (conn: DatabaseConnection) => Promise<T>): Promise<T>
  close(): Promise<void>
  isConnected(): boolean
  getDriver(): DatabaseDriver
}

// ══════════════════════════════════════════════════════════════════════════════
// Migration types
// ══════════════════════════════════════════════════════════════════════════════

export interface Migration {
  version: number
  name: string
  up: string
  down: string
}

export interface MigrationRecord {
  version: number
  name: string
  appliedAt: string
}
