/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Generic Repository                                                          ║
 * ║                                                                              ║
 * ║  Type-safe CRUD operations using parameterized queries over any              ║
 * ║  DatabaseConnection backend.                                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { DatabaseConnection } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// FindAll options
// ══════════════════════════════════════════════════════════════════════════════

export interface FindAllOptions {
  where?: Record<string, unknown>
  orderBy?: string
  limit?: number
  offset?: number
}

// ══════════════════════════════════════════════════════════════════════════════
// Repository<T>
// ══════════════════════════════════════════════════════════════════════════════

export class Repository<T extends Record<string, unknown>> {
  private connection: DatabaseConnection
  private tableName: string
  private columns: string[]

  constructor(connection: DatabaseConnection, tableName: string, columns: string[]) {
    this.connection = connection
    this.tableName = tableName
    this.columns = columns
  }

  /**
   * Retrieve all rows, optionally filtered, sorted, and paginated.
   */
  async findAll(options?: FindAllOptions): Promise<T[]> {
    const { sql, params } = this.buildSelectQuery(options)
    const result = await this.connection.query<T>(sql, params)
    return result.rows
  }

  /**
   * Find a single row by its `id` column.
   */
  async findById(id: string | number): Promise<T | null> {
    const sql = `SELECT ${this.columnList()} FROM ${this.tableName} WHERE id = ?`
    const result = await this.connection.query<T>(sql, [id])
    return result.rows[0] ?? null
  }

  /**
   * Insert a new row and return it (re-queried by lastInsertId or matching data).
   */
  async create(data: Partial<T>): Promise<T> {
    const cols: string[] = []
    const placeholders: string[] = []
    const params: unknown[] = []

    for (const col of this.columns) {
      if (col in (data as Record<string, unknown>)) {
        cols.push(col)
        placeholders.push('?')
        params.push((data as Record<string, unknown>)[col])
      }
    }

    const sql = `INSERT INTO ${this.tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`
    const result = await this.connection.execute(sql, params)

    if (result.lastInsertId !== undefined) {
      const found = await this.findById(result.lastInsertId)
      if (found) return found
    }

    // Fallback: query by inserted data
    const whereClause = cols.map((c) => `${c} = ?`).join(' AND ')
    const selectSql = `SELECT ${this.columnList()} FROM ${this.tableName} WHERE ${whereClause}`
    const selectResult = await this.connection.query<T>(selectSql, params)
    return selectResult.rows[0]
  }

  /**
   * Update a row by id and return the updated row.
   */
  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    const setClauses: string[] = []
    const params: unknown[] = []

    for (const col of this.columns) {
      if (col in (data as Record<string, unknown>) && col !== 'id') {
        setClauses.push(`${col} = ?`)
        params.push((data as Record<string, unknown>)[col])
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id)
    }

    params.push(id)
    const sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE id = ?`
    await this.connection.execute(sql, params)

    return this.findById(id)
  }

  /**
   * Delete a row by id. Returns true if a row was removed.
   */
  async delete(id: string | number): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`
    const result = await this.connection.execute(sql, [id])
    return result.rowsAffected > 0
  }

  /**
   * Count rows, optionally filtered by a WHERE clause.
   */
  async count(where?: Record<string, unknown>): Promise<number> {
    let sql = `SELECT COUNT(*) FROM ${this.tableName}`
    const params: unknown[] = []

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((col) => {
        params.push(where[col])
        return `${col} = ?`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    const result = await this.connection.query<Record<string, unknown>>(sql, params)
    const row = result.rows[0]
    if (!row) return 0
    const val = row['count(*)']
    return typeof val === 'number' ? val : Number(val)
  }

  // ────────────────────────────────────────────────────────────────────────
  // Internal query builder
  // ────────────────────────────────────────────────────────────────────────

  private columnList(): string {
    return this.columns.join(', ')
  }

  private buildSelectQuery(options?: FindAllOptions): { sql: string; params: unknown[] } {
    let sql = `SELECT ${this.columnList()} FROM ${this.tableName}`
    const params: unknown[] = []

    if (options?.where && Object.keys(options.where).length > 0) {
      const conditions = Object.keys(options.where).map((col) => {
        params.push(options.where![col])
        return `${col} = ?`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`
    }

    if (options?.limit !== undefined) {
      sql += ` LIMIT ${Number(options.limit)}`
    }

    if (options?.offset !== undefined) {
      sql += ` OFFSET ${Number(options.offset)}`
    }

    return { sql, params }
  }
}
