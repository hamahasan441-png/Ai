/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Migration Runner                                                            ║
 * ║                                                                              ║
 * ║  Schema migration management with version tracking, up/down execution,       ║
 * ║  and rollback support.                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { DatabaseError } from './connection.js'
import type { DatabaseConnection, Migration, MigrationRecord } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// MigrationRunner
// ══════════════════════════════════════════════════════════════════════════════

export class MigrationRunner {
  private connection: DatabaseConnection
  private initialized = false

  constructor(connection: DatabaseConnection) {
    this.connection = connection
  }

  /**
   * Create the _migrations tracking table if it does not exist.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    await this.connection.execute(
      `CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )`,
    )
    this.initialized = true
  }

  /**
   * Return all previously applied migrations, ordered by version ascending.
   */
  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    await this.ensureInitialized()
    const result = await this.connection.query<Record<string, unknown>>(
      'SELECT version, name, applied_at FROM _migrations ORDER BY version',
    )
    return result.rows.map((r) => ({
      version: Number(r.version),
      name: String(r.name),
      appliedAt: r.applied_at != null ? String(r.applied_at) : '',
    }))
  }

  /**
   * Return the highest applied migration version, or 0 if none.
   */
  async getLatestVersion(): Promise<number> {
    const applied = await this.getAppliedMigrations()
    if (applied.length === 0) return 0
    return Math.max(...applied.map((m) => m.version))
  }

  /**
   * Run all pending up-migrations in version order inside a transaction.
   */
  async migrate(migrations: Migration[]): Promise<void> {
    await this.ensureInitialized()
    const applied = await this.getAppliedMigrations()
    const appliedVersions = new Set(applied.map((m) => m.version))

    const pending = migrations.filter((m) => !appliedVersions.has(m.version)).sort((a, b) => a.version - b.version)

    if (pending.length === 0) return

    await this.connection.transaction(async (conn) => {
      for (const migration of pending) {
        await conn.execute(migration.up)
        await conn.execute(
          `INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)`,
          [migration.version, migration.name, new Date().toISOString()],
        )
      }
    })
  }

  /**
   * Roll back applied migrations down to (but not including) `targetVersion`.
   * Runs down-migrations in reverse version order inside a transaction.
   */
  async rollback(migrations: Migration[], targetVersion: number = 0): Promise<void> {
    await this.ensureInitialized()
    const applied = await this.getAppliedMigrations()
    const appliedVersions = new Set(applied.map((m) => m.version))

    const toRollback = migrations
      .filter((m) => appliedVersions.has(m.version) && m.version > targetVersion)
      .sort((a, b) => b.version - a.version) // Reverse order

    if (toRollback.length === 0) return

    await this.connection.transaction(async (conn) => {
      for (const migration of toRollback) {
        await conn.execute(migration.down)
        await conn.execute('DELETE FROM _migrations WHERE version = ?', [migration.version])
      }
    })
  }

  /**
   * Return the current migration status: which are pending and which applied.
   */
  async getMigrationStatus(
    migrations: Migration[],
  ): Promise<{ pending: Migration[]; applied: MigrationRecord[] }> {
    await this.ensureInitialized()
    const applied = await this.getAppliedMigrations()
    const appliedVersions = new Set(applied.map((m) => m.version))

    const pending = migrations.filter((m) => !appliedVersions.has(m.version)).sort((a, b) => a.version - b.version)

    return { pending, applied }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Internal
  // ────────────────────────────────────────────────────────────────────────

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      throw new DatabaseError('MigrationRunner not initialized — call initialize() first')
    }
  }
}
