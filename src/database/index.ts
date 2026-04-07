/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Database Abstraction Layer                                                  ║
 * ║                                                                              ║
 * ║  Unified interface over multiple database backends with connection pooling,  ║
 * ║  migrations, and generic repository pattern.                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ══════════════════════════════════════════════════════════════════════════════
// TYPES — Core interfaces and type definitions (src/database/types.ts)
// ══════════════════════════════════════════════════════════════════════════════

export type { DatabaseDriver, ConnectionConfig, QueryResult, DatabaseConnection, Migration, MigrationRecord } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// CONNECTION — Factory and in-memory driver (src/database/connection.ts)
// ══════════════════════════════════════════════════════════════════════════════

export { DatabaseError, MemoryDatabase, createConnection } from './connection.js'

// ══════════════════════════════════════════════════════════════════════════════
// MIGRATIONS — Schema migration runner (src/database/migrations.ts)
// ══════════════════════════════════════════════════════════════════════════════

export { MigrationRunner } from './migrations.js'

// ══════════════════════════════════════════════════════════════════════════════
// REPOSITORY — Generic CRUD repository (src/database/repository.ts)
// ══════════════════════════════════════════════════════════════════════════════

export { Repository } from './repository.js'
export type { FindAllOptions } from './repository.js'
