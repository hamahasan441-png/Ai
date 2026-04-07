/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Database Connection                                                         ║
 * ║                                                                              ║
 * ║  Connection factory and in-memory database driver for the abstraction layer. ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { AiError, AiErrorCode } from '../utils/errors.js'
import type { ConnectionConfig, DatabaseConnection, DatabaseDriver, QueryResult } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// DatabaseError
// ══════════════════════════════════════════════════════════════════════════════

export class DatabaseError extends AiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, AiErrorCode.DATABASE_ERROR, context)
    this.name = 'DatabaseError'
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Types for in-memory storage
// ══════════════════════════════════════════════════════════════════════════════

type Row = Record<string, unknown>
type Table = Row[]
type TableStore = Map<string, Table>

interface TableSchema {
  columns: string[]
  autoIncrement: Map<string, number>
}

// ══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase
// ══════════════════════════════════════════════════════════════════════════════

export class MemoryDatabase implements DatabaseConnection {
  private tables: TableStore = new Map()
  private schemas: Map<string, TableSchema> = new Map()
  private connected = true

  // ────────────────────────────────────────────────────────────────────────
  // DatabaseConnection interface
  // ────────────────────────────────────────────────────────────────────────

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    this.ensureConnected()
    const start = Date.now()
    const rows = this.executeSql(sql, params ?? []) as T[]
    return { rows, rowCount: rows.length, duration: Date.now() - start }
  }

  async execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number; lastInsertId?: number }> {
    this.ensureConnected()
    const result = this.executeSql(sql, params ?? [])
    if (typeof result === 'number') {
      return { rowsAffected: result }
    }
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const obj = result as { rowsAffected: number; lastInsertId?: number }
      return { rowsAffected: obj.rowsAffected ?? 0, lastInsertId: obj.lastInsertId }
    }
    return { rowsAffected: Array.isArray(result) ? result.length : 0 }
  }

  async transaction<T>(fn: (conn: DatabaseConnection) => Promise<T>): Promise<T> {
    this.ensureConnected()
    const snapshot = this.snapshot()
    try {
      const result = await fn(this)
      return result
    } catch (error) {
      this.restore(snapshot)
      throw error
    }
  }

  async close(): Promise<void> {
    this.connected = false
    this.tables.clear()
    this.schemas.clear()
  }

  isConnected(): boolean {
    return this.connected
  }

  getDriver(): DatabaseDriver {
    return 'memory'
  }

  // ────────────────────────────────────────────────────────────────────────
  // Snapshot / Restore for transactions
  // ────────────────────────────────────────────────────────────────────────

  private snapshot(): { tables: TableStore; schemas: Map<string, TableSchema> } {
    const tables: TableStore = new Map()
    for (const [name, rows] of this.tables) {
      tables.set(name, rows.map((r) => ({ ...r })))
    }
    const schemas = new Map<string, TableSchema>()
    for (const [name, schema] of this.schemas) {
      schemas.set(name, {
        columns: [...schema.columns],
        autoIncrement: new Map(schema.autoIncrement),
      })
    }
    return { tables, schemas }
  }

  private restore(snap: { tables: TableStore; schemas: Map<string, TableSchema> }): void {
    this.tables = snap.tables
    this.schemas = snap.schemas
  }

  // ────────────────────────────────────────────────────────────────────────
  // Ensure connection is open
  // ────────────────────────────────────────────────────────────────────────

  private ensureConnected(): void {
    if (!this.connected) {
      throw new DatabaseError('Connection is closed')
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // SQL execution dispatcher
  // ────────────────────────────────────────────────────────────────────────

  private executeSql(sql: string, params: unknown[]): unknown {
    const trimmed = sql.trim().replace(/\s+/g, ' ')
    const upper = trimmed.toUpperCase()

    if (upper.startsWith('CREATE TABLE')) return this.execCreateTable(trimmed)
    if (upper.startsWith('DROP TABLE')) return this.execDropTable(trimmed)
    if (upper.startsWith('INSERT')) return this.execInsert(trimmed, params)
    if (upper.startsWith('SELECT')) return this.execSelect(trimmed, params)
    if (upper.startsWith('UPDATE')) return this.execUpdate(trimmed, params)
    if (upper.startsWith('DELETE')) return this.execDelete(trimmed, params)

    throw new DatabaseError(`Unsupported SQL statement: ${trimmed.slice(0, 50)}`)
  }

  // ────────────────────────────────────────────────────────────────────────
  // CREATE TABLE
  // ────────────────────────────────────────────────────────────────────────

  private execCreateTable(sql: string): number {
    const ifNotExists = /IF NOT EXISTS/i.test(sql)
    const match = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\((.+)\)/is)
    if (!match) throw new DatabaseError(`Invalid CREATE TABLE: ${sql}`)

    const tableName = match[1].toLowerCase()
    if (this.tables.has(tableName)) {
      if (ifNotExists) return 0
      throw new DatabaseError(`Table '${tableName}' already exists`)
    }

    const columnDefs = this.parseColumnDefs(match[2])
    const schema: TableSchema = { columns: [], autoIncrement: new Map() }

    for (const col of columnDefs) {
      schema.columns.push(col.name)
      if (col.autoIncrement) {
        schema.autoIncrement.set(col.name, 0)
      }
    }

    this.schemas.set(tableName, schema)
    this.tables.set(tableName, [])
    return 0
  }

  private parseColumnDefs(defs: string): Array<{ name: string; autoIncrement: boolean }> {
    const columns: Array<{ name: string; autoIncrement: boolean }> = []
    // Split by comma, but respect parentheses (for constraints like PRIMARY KEY(col))
    const parts = this.splitColumns(defs)

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue
      // Skip constraints (PRIMARY KEY, UNIQUE, FOREIGN KEY, CHECK, CONSTRAINT)
      const upperPart = trimmed.toUpperCase()
      if (
        upperPart.startsWith('PRIMARY KEY') ||
        upperPart.startsWith('UNIQUE') ||
        upperPart.startsWith('FOREIGN KEY') ||
        upperPart.startsWith('CHECK') ||
        upperPart.startsWith('CONSTRAINT')
      ) {
        continue
      }

      const colMatch = trimmed.match(/^[`"']?(\w+)[`"']?\s+/i)
      if (colMatch) {
        const autoInc =
          /AUTOINCREMENT/i.test(trimmed) ||
          /AUTO_INCREMENT/i.test(trimmed) ||
          (/INTEGER/i.test(trimmed) && /PRIMARY\s+KEY/i.test(trimmed))
        columns.push({ name: colMatch[1].toLowerCase(), autoIncrement: autoInc })
      }
    }

    return columns
  }

  private splitColumns(defs: string): string[] {
    const parts: string[] = []
    let depth = 0
    let current = ''
    for (const ch of defs) {
      if (ch === '(') {
        depth++
        current += ch
      } else if (ch === ')') {
        depth--
        current += ch
      } else if (ch === ',' && depth === 0) {
        parts.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    if (current.trim()) parts.push(current)
    return parts
  }

  // ────────────────────────────────────────────────────────────────────────
  // DROP TABLE
  // ────────────────────────────────────────────────────────────────────────

  private execDropTable(sql: string): number {
    const ifExists = /IF EXISTS/i.test(sql)
    const match = sql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"']?(\w+)[`"']?/i)
    if (!match) throw new DatabaseError(`Invalid DROP TABLE: ${sql}`)

    const tableName = match[1].toLowerCase()
    if (!this.tables.has(tableName)) {
      if (ifExists) return 0
      throw new DatabaseError(`Table '${tableName}' does not exist`)
    }

    this.tables.delete(tableName)
    this.schemas.delete(tableName)
    return 0
  }

  // ────────────────────────────────────────────────────────────────────────
  // INSERT
  // ────────────────────────────────────────────────────────────────────────

  private execInsert(sql: string, params: unknown[]): { rowsAffected: number; lastInsertId?: number } {
    const match = sql.match(/INSERT\s+INTO\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)
    if (!match) throw new DatabaseError(`Invalid INSERT: ${sql}`)

    const tableName = match[1].toLowerCase()
    const table = this.getTable(tableName)
    const schema = this.schemas.get(tableName)!

    const columns = match[2].split(',').map((c) => c.trim().replace(/[`"']/g, '').toLowerCase())
    const valuePlaceholders = match[3].split(',').map((v) => v.trim())

    const row: Row = {}
    let paramIdx = 0

    // Handle auto-increment columns not in the insert
    for (const [col, current] of schema.autoIncrement) {
      if (!columns.includes(col)) {
        const nextId = current + 1
        schema.autoIncrement.set(col, nextId)
        row[col] = nextId
      }
    }

    for (let i = 0; i < columns.length; i++) {
      const placeholder = valuePlaceholders[i]
      if (placeholder === '?') {
        row[columns[i]] = params[paramIdx++]
      } else {
        // Literal value
        row[columns[i]] = this.parseLiteral(placeholder)
      }

      // Update auto-increment counter if this column has one
      if (schema.autoIncrement.has(columns[i]) && typeof row[columns[i]] === 'number') {
        const current = schema.autoIncrement.get(columns[i])!
        if ((row[columns[i]] as number) > current) {
          schema.autoIncrement.set(columns[i], row[columns[i]] as number)
        }
      }
    }

    table.push(row)
    const lastInsertId = row['id'] !== undefined ? (row['id'] as number) : undefined
    return { rowsAffected: 1, lastInsertId }
  }

  // ────────────────────────────────────────────────────────────────────────
  // SELECT
  // ────────────────────────────────────────────────────────────────────────

  private execSelect(sql: string, params: unknown[]): Row[] {
    // Parse: SELECT columns FROM table [WHERE ...] [ORDER BY ...] [LIMIT ...] [OFFSET ...]
    const match = sql.match(
      /SELECT\s+(.+?)\s+FROM\s+[`"']?(\w+)[`"']?(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?\s*$/i,
    )
    if (!match) throw new DatabaseError(`Invalid SELECT: ${sql}`)

    const columnsStr = match[1].trim()
    const tableName = match[2].toLowerCase()
    const whereClause = match[3]
    const orderByClause = match[4]
    const limit = match[5] ? parseInt(match[5], 10) : undefined
    const offset = match[6] ? parseInt(match[6], 10) : undefined

    const table = this.getTable(tableName)
    let rows = table.map((r) => ({ ...r }))

    // WHERE
    if (whereClause) {
      rows = this.applyWhere(rows, whereClause, params)
    }

    // ORDER BY
    if (orderByClause) {
      rows = this.applyOrderBy(rows, orderByClause)
    }

    // OFFSET
    if (offset !== undefined) {
      rows = rows.slice(offset)
    }

    // LIMIT
    if (limit !== undefined) {
      rows = rows.slice(0, limit)
    }

    // Column projection
    if (columnsStr !== '*') {
      const isCount = /^COUNT\s*\(\s*\*\s*\)$/i.test(columnsStr.trim())
      if (isCount) {
        return [{ 'count(*)': rows.length } as Row]
      }

      const selectCols = columnsStr.split(',').map((c) => c.trim().replace(/[`"']/g, '').toLowerCase())
      rows = rows.map((r) => {
        const projected: Row = {}
        for (const col of selectCols) {
          projected[col] = r[col]
        }
        return projected
      })
    }

    return rows
  }

  private applyWhere(rows: Row[], whereClause: string, params: unknown[]): Row[] {
    const conditions = whereClause.split(/\s+AND\s+/i)

    // Pre-resolve: parse each condition and bind parameter values once
    const resolved: Array<{ col: string; op: string; val: unknown }> = []
    let paramIdx = 0

    for (const cond of conditions) {
      const trimCond = cond.trim()

      const opMatch = trimCond.match(/^[`"']?(\w+)[`"']?\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i)
      if (!opMatch) throw new DatabaseError(`Unsupported WHERE condition: ${trimCond}`)

      const col = opMatch[1].toLowerCase()
      const op = opMatch[2] === '<>' ? '!=' : opMatch[2]
      const valExpr = opMatch[3].trim()
      const val = valExpr === '?' ? params[paramIdx++] : this.parseLiteral(valExpr)
      resolved.push({ col, op, val })
    }

    return rows.filter((row) =>
      resolved.every(({ col, op, val }) => {
        const rowVal = row[col]
        switch (op) {
          // eslint-disable-next-line eqeqeq
          case '=':  return rowVal == val
          // eslint-disable-next-line eqeqeq
          case '!=': return rowVal != val
          case '>':  return (rowVal as number) > (val as number)
          case '<':  return (rowVal as number) < (val as number)
          case '>=': return (rowVal as number) >= (val as number)
          case '<=': return (rowVal as number) <= (val as number)
          default:   return false
        }
      }),
    )
  }

  private applyOrderBy(rows: Row[], orderByClause: string): Row[] {
    const parts = orderByClause.split(',').map((p) => p.trim())
    const sortKeys = parts.map((part) => {
      const tokens = part.split(/\s+/)
      const col = tokens[0].replace(/[`"']/g, '').toLowerCase()
      const dir = tokens[1]?.toUpperCase() === 'DESC' ? -1 : 1
      return { col, dir }
    })

    return [...rows].sort((a, b) => {
      for (const { col, dir } of sortKeys) {
        const aVal = a[col]
        const bVal = b[col]
        if (aVal === bVal) continue
        if (aVal === null || aVal === undefined) return dir
        if (bVal === null || bVal === undefined) return -dir
        if (aVal < bVal) return -1 * dir
        if (aVal > bVal) return 1 * dir
      }
      return 0
    })
  }

  // ────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────────────────────────────

  private execUpdate(sql: string, params: unknown[]): { rowsAffected: number } {
    const match = sql.match(/UPDATE\s+[`"']?(\w+)[`"']?\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?\s*$/i)
    if (!match) throw new DatabaseError(`Invalid UPDATE: ${sql}`)

    const tableName = match[1].toLowerCase()
    const setClause = match[2]
    const whereClause = match[3]

    const table = this.getTable(tableName)

    // Parse SET clause
    const setParts = this.splitSetClause(setClause)
    const setColumns: Array<{ col: string; paramIndex: boolean }> = []
    for (const part of setParts) {
      const setMatch = part.trim().match(/^[`"']?(\w+)[`"']?\s*=\s*(.+)$/i)
      if (!setMatch) throw new DatabaseError(`Invalid SET clause: ${part}`)
      setColumns.push({ col: setMatch[1].toLowerCase(), paramIndex: setMatch[2].trim() === '?' })
    }

    // Count params used by SET
    const setParamCount = setColumns.filter((s) => s.paramIndex).length

    // Find rows to update
    let targetRows: Row[]
    if (whereClause) {
      const whereParams = params.slice(setParamCount)
      targetRows = this.applyWhere(table, whereClause, whereParams)
    } else {
      targetRows = [...table]
    }

    // Apply updates
    let paramIdx = 0
    for (const row of targetRows) {
      for (const setCol of setColumns) {
        if (setCol.paramIndex) {
          row[setCol.col] = params[paramIdx++]
        }
      }
    }

    return { rowsAffected: targetRows.length }
  }

  private splitSetClause(setClause: string): string[] {
    // Split by comma, but not inside quotes
    const parts: string[] = []
    let current = ''
    let inString = false
    let quoteChar = ''
    for (const ch of setClause) {
      if (!inString && (ch === "'" || ch === '"')) {
        inString = true
        quoteChar = ch
        current += ch
      } else if (inString && ch === quoteChar) {
        inString = false
        current += ch
      } else if (!inString && ch === ',') {
        parts.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    if (current.trim()) parts.push(current)
    return parts
  }

  // ────────────────────────────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────────────────────────────

  private execDelete(sql: string, params: unknown[]): { rowsAffected: number } {
    const match = sql.match(/DELETE\s+FROM\s+[`"']?(\w+)[`"']?(?:\s+WHERE\s+(.+))?\s*$/i)
    if (!match) throw new DatabaseError(`Invalid DELETE: ${sql}`)

    const tableName = match[1].toLowerCase()
    const whereClause = match[2]
    const table = this.getTable(tableName)

    if (!whereClause) {
      const count = table.length
      this.tables.set(tableName, [])
      return { rowsAffected: count }
    }

    const toRemove = new Set(this.applyWhere(table, whereClause, params))
    const remaining = table.filter((r) => !toRemove.has(r))
    this.tables.set(tableName, remaining)

    return { rowsAffected: toRemove.size }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────

  private getTable(name: string): Table {
    const table = this.tables.get(name.toLowerCase())
    if (!table) {
      throw new DatabaseError(`Table '${name}' does not exist`)
    }
    return table
  }

  private parseLiteral(value: string): unknown {
    if (value === 'NULL' || value === 'null') return null
    if (value === 'TRUE' || value === 'true') return true
    if (value === 'FALSE' || value === 'false') return false

    // String literals
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1)
    }

    // Numeric
    const num = Number(value)
    if (!isNaN(num)) return num

    return value
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Connection factory
// ══════════════════════════════════════════════════════════════════════════════

export async function createConnection(config: ConnectionConfig): Promise<DatabaseConnection> {
  switch (config.driver) {
    case 'memory':
      return new MemoryDatabase()

    case 'sqlite':
      try {
        await import('better-sqlite3')
      } catch {
        throw new DatabaseError('Driver not available - install better-sqlite3', { driver: 'sqlite' })
      }
      throw new DatabaseError('SQLite driver not implemented', { driver: 'sqlite' })

    case 'postgres':
      try {
        await import('pg')
      } catch {
        throw new DatabaseError('Driver not available - install pg', { driver: 'postgres' })
      }
      throw new DatabaseError('PostgreSQL driver not implemented', { driver: 'postgres' })

    case 'mysql':
      try {
        await import('mysql2')
      } catch {
        throw new DatabaseError('Driver not available - install mysql2', { driver: 'mysql' })
      }
      throw new DatabaseError('MySQL driver not implemented', { driver: 'mysql' })

    default:
      throw new DatabaseError(`Unknown database driver: ${config.driver as string}`)
  }
}
