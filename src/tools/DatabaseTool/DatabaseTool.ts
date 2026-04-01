/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DatabaseTool — Query, Inspect, and Manage Databases                         ║
 * ║                                                                              ║
 * ║  Supports SQLite (embedded), PostgreSQL, and MySQL.                           ║
 * ║  Default: read-only mode for safety.                                          ║
 * ║  Uses lazy-loaded drivers to avoid bloating startup.                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod/v4'
import { buildTool } from '../../Tool.js'
import { lazySchema } from '../../utils/lazySchema.js'
import { DATABASE_TOOL_NAME } from './prompt.js'

// ── Schema ──

const inputSchema = lazySchema(() =>
  z.strictObject({
    command: z
      .enum(['query', 'schema', 'tables', 'describe', 'explain'])
      .describe('The database operation to perform'),
    connection_string: z
      .string()
      .min(1)
      .describe('Database connection string (e.g., sqlite:///path/to/db, postgresql://...)'),
    sql: z
      .string()
      .optional()
      .describe('SQL query to execute (required for query/explain commands)'),
    table: z
      .string()
      .optional()
      .describe('Table name (required for describe command)'),
    max_rows: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .default(100)
      .optional()
      .describe('Maximum rows to return (default: 100, max: 10000)'),
    read_only: z
      .boolean()
      .default(true)
      .optional()
      .describe('Only allow read operations (default: true)'),
  }),
)

type InputSchema = ReturnType<typeof inputSchema>
type Input = z.infer<InputSchema>

const outputSchema = lazySchema(() =>
  z.object({
    command: z.string(),
    database_type: z.string(),
    columns: z.array(z.string()).optional(),
    rows: z.array(z.record(z.unknown())).optional(),
    row_count: z.number().optional(),
    tables: z.array(z.string()).optional(),
    schema_info: z.string().optional(),
    execution_time_ms: z.number(),
    message: z.string().optional(),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>
type Output = z.infer<OutputSchema>

// ── SQL Safety ──

/** SQL keywords that indicate write operations. */
const WRITE_KEYWORDS = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|MERGE)\b/i

/** Check if a SQL statement is a write operation. */
function isWriteOperation(sql: string): boolean {
  return WRITE_KEYWORDS.test(sql.trim())
}

/** Basic SQL validation — reject dangerous patterns. */
function validateSql(sql: string): { valid: boolean; reason?: string } {
  const trimmed = sql.trim()

  if (trimmed.length === 0) {
    return { valid: false, reason: 'SQL query is empty' }
  }

  // Block multiple statements (basic ; splitting, doesn't handle strings perfectly)
  const statementCount = trimmed.split(';').filter(s => s.trim().length > 0).length
  if (statementCount > 1) {
    return { valid: false, reason: 'Multiple SQL statements are not allowed. Execute one statement at a time.' }
  }

  return { valid: true }
}

// ── Database Type Detection ──

type DatabaseType = 'sqlite' | 'postgresql' | 'mysql'

function detectDatabaseType(connectionString: string): DatabaseType {
  const lower = connectionString.toLowerCase()
  if (lower.startsWith('postgresql://') || lower.startsWith('postgres://')) return 'postgresql'
  if (lower.startsWith('mysql://')) return 'mysql'
  if (lower.startsWith('sqlite://') || lower.endsWith('.db') || lower.endsWith('.sqlite') || lower.endsWith('.sqlite3')) return 'sqlite'
  // Default to SQLite for file paths
  return 'sqlite'
}

/** Extract file path from SQLite connection string. */
function getSqlitePath(connectionString: string): string {
  if (connectionString.startsWith('sqlite:///')) {
    return connectionString.slice('sqlite:///'.length)
  }
  if (connectionString.startsWith('sqlite://')) {
    return connectionString.slice('sqlite://'.length)
  }
  return connectionString
}

// ── SQLite Executor (embedded, no external deps needed) ──

interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
}

/**
 * Execute SQLite queries using the built-in better-sqlite3 or child_process fallback.
 * Tries to use better-sqlite3 first, falls back to sqlite3 CLI.
 */
async function executeSqlite(
  connectionString: string,
  command: string,
  sql?: string,
  table?: string,
  maxRows = 100,
  readOnly = true,
): Promise<Output> {
  const dbPath = getSqlitePath(connectionString)
  const start = Date.now()

  // Try to use better-sqlite3 (if available)
  try {
    // Dynamic import to avoid build-time dependency
    const Database = await loadBetterSqlite3()

    if (Database) {
      const db = new Database(dbPath, { readonly: readOnly })

      try {
        switch (command) {
          case 'tables': {
            const rows = db.prepare(
              "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            ).all() as Array<{ name: string }>
            return {
              command,
              database_type: 'sqlite',
              tables: rows.map(r => r.name),
              row_count: rows.length,
              execution_time_ms: Date.now() - start,
            }
          }

          case 'schema': {
            const rows = db.prepare(
              "SELECT sql FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name"
            ).all() as Array<{ sql: string }>
            return {
              command,
              database_type: 'sqlite',
              schema_info: rows.map(r => r.sql).join('\n\n'),
              execution_time_ms: Date.now() - start,
            }
          }

          case 'describe': {
            if (!table) throw new Error('Table name is required for describe command')
            const rows = db.prepare(`PRAGMA table_info("${table.replace(/"/g, '""')}")`).all() as Array<{
              name: string; type: string; notnull: number; dflt_value: unknown; pk: number
            }>
            return {
              command,
              database_type: 'sqlite',
              columns: ['name', 'type', 'notnull', 'default', 'pk'],
              rows: rows.map(r => ({
                name: r.name, type: r.type,
                notnull: r.notnull === 1, default: r.dflt_value, pk: r.pk === 1,
              })),
              row_count: rows.length,
              execution_time_ms: Date.now() - start,
            }
          }

          case 'explain': {
            if (!sql) throw new Error('SQL query is required for explain command')
            const rows = db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all()
            return {
              command,
              database_type: 'sqlite',
              rows: rows as Record<string, unknown>[],
              row_count: (rows as unknown[]).length,
              execution_time_ms: Date.now() - start,
            }
          }

          case 'query': {
            if (!sql) throw new Error('SQL query is required for query command')
            if (readOnly && isWriteOperation(sql)) {
              throw new Error('Write operations are not allowed in read-only mode. Set read_only: false to allow writes.')
            }

            const validation = validateSql(sql)
            if (!validation.valid) throw new Error(validation.reason)

            if (isWriteOperation(sql)) {
              const result = db.prepare(sql).run()
              return {
                command,
                database_type: 'sqlite',
                message: `Query executed. Rows affected: ${result.changes}`,
                row_count: result.changes,
                execution_time_ms: Date.now() - start,
              }
            }

            const stmt = db.prepare(sql)
            const rows = stmt.all() as Record<string, unknown>[]
            const limited = rows.slice(0, maxRows)
            const columns = limited.length > 0 ? Object.keys(limited[0]!) : []

            return {
              command,
              database_type: 'sqlite',
              columns,
              rows: limited,
              row_count: limited.length,
              execution_time_ms: Date.now() - start,
              ...(rows.length > maxRows ? { message: `Showing ${maxRows} of ${rows.length} rows` } : {}),
            }
          }

          default:
            throw new Error(`Unknown command: ${command}`)
        }
      } finally {
        db.close()
      }
    }
  } catch (err) {
    // If better-sqlite3 is not available, fall through to CLI fallback
    if ((err as Error).message?.includes('Cannot find module')) {
      // Fall through to CLI fallback
    } else {
      throw err
    }
  }

  // Fallback: use sqlite3 CLI
  return executeSqliteCli(dbPath, command, sql, table, maxRows, readOnly, start)
}

/** Fallback: execute SQLite queries using the sqlite3 CLI. */
async function executeSqliteCli(
  dbPath: string,
  command: string,
  sql: string | undefined,
  table: string | undefined,
  maxRows: number,
  readOnly: boolean,
  start: number,
): Promise<Output> {
  const { execSync } = await import('child_process')

  function runSqlite(query: string): string {
    return execSync(
      `sqlite3 -json "${dbPath.replace(/"/g, '\\"')}" "${query.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: 30000 },
    ).trim()
  }

  switch (command) {
    case 'tables': {
      const output = runSqlite("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      const rows = output ? JSON.parse(output) as Array<{ name: string }> : []
      return {
        command, database_type: 'sqlite',
        tables: rows.map(r => r.name), row_count: rows.length,
        execution_time_ms: Date.now() - start,
      }
    }

    case 'schema': {
      const output = runSqlite("SELECT sql FROM sqlite_master WHERE type IN ('table','view') ORDER BY name")
      const rows = output ? JSON.parse(output) as Array<{ sql: string }> : []
      return {
        command, database_type: 'sqlite',
        schema_info: rows.map(r => r.sql).join('\n\n'),
        execution_time_ms: Date.now() - start,
      }
    }

    case 'describe': {
      if (!table) throw new Error('Table name required')
      const output = runSqlite(`PRAGMA table_info("${table.replace(/"/g, '""')}")`)
      const rows = output ? JSON.parse(output) as Record<string, unknown>[] : []
      return {
        command, database_type: 'sqlite',
        columns: ['name', 'type', 'notnull', 'dflt_value', 'pk'],
        rows, row_count: rows.length,
        execution_time_ms: Date.now() - start,
      }
    }

    case 'query': {
      if (!sql) throw new Error('SQL required')
      if (readOnly && isWriteOperation(sql)) {
        throw new Error('Write operations not allowed in read-only mode')
      }
      const validation = validateSql(sql)
      if (!validation.valid) throw new Error(validation.reason)

      const output = runSqlite(`${sql} LIMIT ${maxRows}`)
      const rows = output ? JSON.parse(output) as Record<string, unknown>[] : []
      const columns = rows.length > 0 ? Object.keys(rows[0]!) : []
      return {
        command, database_type: 'sqlite',
        columns, rows, row_count: rows.length,
        execution_time_ms: Date.now() - start,
      }
    }

    default:
      throw new Error(`Unsupported command with CLI fallback: ${command}`)
  }
}

/** Lazy-load better-sqlite3 — returns null if not installed. */
async function loadBetterSqlite3(): Promise<any | null> {
  try {
    const mod = await import('better-sqlite3')
    return mod.default ?? mod
  } catch {
    return null
  }
}

/** Execute PostgreSQL queries using pg driver. */
async function executePostgresql(
  connectionString: string,
  command: string,
  sql?: string,
  table?: string,
  maxRows = 100,
  readOnly = true,
): Promise<Output> {
  const start = Date.now()

  let pg: any
  try {
    pg = await import('pg')
  } catch {
    throw new Error(
      'PostgreSQL driver (pg) is not installed. Run: npm install pg'
    )
  }

  const Client = pg.default?.Client ?? pg.Client
  const client = new Client({ connectionString })
  await client.connect()

  try {
    if (readOnly) {
      await client.query('SET default_transaction_read_only = ON')
    }

    switch (command) {
      case 'tables': {
        const result = await client.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        )
        return {
          command, database_type: 'postgresql',
          tables: result.rows.map((r: any) => r.table_name),
          row_count: result.rowCount,
          execution_time_ms: Date.now() - start,
        }
      }

      case 'schema': {
        const result = await client.query(
          `SELECT table_name, column_name, data_type, is_nullable, column_default
           FROM information_schema.columns WHERE table_schema = 'public'
           ORDER BY table_name, ordinal_position`
        )
        const schemaLines = result.rows.map((r: any) =>
          `${r.table_name}.${r.column_name}: ${r.data_type} ${r.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'} ${r.column_default ? `DEFAULT ${r.column_default}` : ''}`
        )
        return {
          command, database_type: 'postgresql',
          schema_info: schemaLines.join('\n'),
          execution_time_ms: Date.now() - start,
        }
      }

      case 'describe': {
        if (!table) throw new Error('Table name required')
        const result = await client.query(
          `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns WHERE table_name = $1
           ORDER BY ordinal_position`,
          [table]
        )
        return {
          command, database_type: 'postgresql',
          columns: ['column_name', 'data_type', 'is_nullable', 'column_default'],
          rows: result.rows,
          row_count: result.rowCount,
          execution_time_ms: Date.now() - start,
        }
      }

      case 'explain': {
        if (!sql) throw new Error('SQL required')
        const result = await client.query(`EXPLAIN ${sql}`)
        return {
          command, database_type: 'postgresql',
          rows: result.rows,
          row_count: result.rowCount,
          execution_time_ms: Date.now() - start,
        }
      }

      case 'query': {
        if (!sql) throw new Error('SQL required')
        if (readOnly && isWriteOperation(sql)) {
          throw new Error('Write operations not allowed in read-only mode')
        }
        const validation = validateSql(sql)
        if (!validation.valid) throw new Error(validation.reason)

        const result = await client.query(`${sql} LIMIT ${maxRows}`)
        const columns = result.fields?.map((f: any) => f.name) ?? []
        return {
          command, database_type: 'postgresql',
          columns, rows: result.rows, row_count: result.rowCount,
          execution_time_ms: Date.now() - start,
        }
      }

      default:
        throw new Error(`Unknown command: ${command}`)
    }
  } finally {
    await client.end()
  }
}

/** Execute MySQL queries using mysql2 driver. */
async function executeMysql(
  connectionString: string,
  command: string,
  sql?: string,
  table?: string,
  maxRows = 100,
  readOnly = true,
): Promise<Output> {
  const start = Date.now()

  let mysql2: any
  try {
    mysql2 = await import('mysql2/promise')
  } catch {
    throw new Error(
      'MySQL driver (mysql2) is not installed. Run: npm install mysql2'
    )
  }

  const connection = await (mysql2.default?.createConnection ?? mysql2.createConnection)(connectionString)

  try {
    if (readOnly) {
      await connection.execute('SET SESSION TRANSACTION READ ONLY')
    }

    switch (command) {
      case 'tables': {
        const [rows] = await connection.execute('SHOW TABLES')
        const tables = (rows as any[]).map((r: any) => Object.values(r)[0] as string)
        return {
          command, database_type: 'mysql',
          tables, row_count: tables.length,
          execution_time_ms: Date.now() - start,
        }
      }

      case 'schema': {
        const [rows] = await connection.execute(
          `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
           FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
           ORDER BY TABLE_NAME, ORDINAL_POSITION`
        )
        const schemaLines = (rows as any[]).map((r: any) =>
          `${r.TABLE_NAME}.${r.COLUMN_NAME}: ${r.DATA_TYPE} ${r.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULLABLE'}`
        )
        return {
          command, database_type: 'mysql',
          schema_info: schemaLines.join('\n'),
          execution_time_ms: Date.now() - start,
        }
      }

      case 'describe': {
        if (!table) throw new Error('Table name required')
        const [rows] = await connection.execute(`DESCRIBE \`${table.replace(/`/g, '``')}\``)
        return {
          command, database_type: 'mysql',
          columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
          rows: rows as Record<string, unknown>[],
          row_count: (rows as any[]).length,
          execution_time_ms: Date.now() - start,
        }
      }

      case 'explain': {
        if (!sql) throw new Error('SQL required')
        const [rows] = await connection.execute(`EXPLAIN ${sql}`)
        return {
          command, database_type: 'mysql',
          rows: rows as Record<string, unknown>[],
          row_count: (rows as any[]).length,
          execution_time_ms: Date.now() - start,
        }
      }

      case 'query': {
        if (!sql) throw new Error('SQL required')
        if (readOnly && isWriteOperation(sql)) {
          throw new Error('Write operations not allowed in read-only mode')
        }
        const validation = validateSql(sql)
        if (!validation.valid) throw new Error(validation.reason)

        const [rows, fields] = await connection.execute(`${sql} LIMIT ${maxRows}`)
        const columns = (fields as any[])?.map((f: any) => f.name) ?? []
        return {
          command, database_type: 'mysql',
          columns, rows: rows as Record<string, unknown>[],
          row_count: (rows as any[]).length,
          execution_time_ms: Date.now() - start,
        }
      }

      default:
        throw new Error(`Unknown command: ${command}`)
    }
  } finally {
    await connection.end()
  }
}

// ── Tool Definition ──

export const DatabaseTool = buildTool({
  name: DATABASE_TOOL_NAME,
  searchHint: 'database sql query schema tables sqlite postgresql mysql',

  inputSchema,
  outputSchema,
  maxResultSizeChars: 50000,

  async call(input: Input) {
    const dbType = detectDatabaseType(input.connection_string)
    const readOnly = input.read_only !== false
    const maxRows = input.max_rows ?? 100

    try {
      let result: Output

      switch (dbType) {
        case 'sqlite':
          result = await executeSqlite(
            input.connection_string, input.command,
            input.sql, input.table, maxRows, readOnly,
          )
          break
        case 'postgresql':
          result = await executePostgresql(
            input.connection_string, input.command,
            input.sql, input.table, maxRows, readOnly,
          )
          break
        case 'mysql':
          result = await executeMysql(
            input.connection_string, input.command,
            input.sql, input.table, maxRows, readOnly,
          )
          break
        default:
          throw new Error(`Unsupported database type: ${dbType}`)
      }

      return { type: 'tool_result' as const, data: result }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        type: 'tool_result' as const,
        data: {
          command: input.command,
          database_type: dbType,
          execution_time_ms: 0,
          message: `Error: ${message}`,
        },
      }
    }
  },

  async description(input: Input) {
    const dbType = detectDatabaseType(input.connection_string)
    switch (input.command) {
      case 'query': return `Execute SQL query on ${dbType} database`
      case 'schema': return `Show ${dbType} database schema`
      case 'tables': return `List tables in ${dbType} database`
      case 'describe': return `Describe table '${input.table}' in ${dbType} database`
      case 'explain': return `Explain query plan on ${dbType} database`
      default: return `Database operation on ${dbType}`
    }
  },

  isReadOnly(input: Input) {
    if (input.read_only !== false) return true
    if (input.sql && isWriteOperation(input.sql)) return false
    return true
  },

  isDestructive(input: Input) {
    if (!input.sql) return false
    return /^\s*(DROP|TRUNCATE|DELETE\s+FROM)\b/i.test(input.sql.trim())
  },

  isConcurrencySafe() {
    return true  // Database queries can run concurrently
  },

  isEnabled() {
    return true
  },

  async checkPermissions(input: Input) {
    // Write operations require explicit approval
    if (input.sql && isWriteOperation(input.sql) && input.read_only !== false) {
      return {
        behavior: 'deny' as const,
        message: 'Write operations require read_only: false',
      }
    }
    return { behavior: 'allow' as const, updatedInput: input }
  },

  userFacingName(input?: Input) {
    if (!input) return 'Database'
    const dbType = detectDatabaseType(input.connection_string)
    return `Database (${dbType})`
  },
})
