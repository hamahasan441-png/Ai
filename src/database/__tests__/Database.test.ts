import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import {
  createConnection,
  MemoryDatabase,
  DatabaseError,
  MigrationRunner,
  Repository,
} from '../index.js'
import type {
  DatabaseConnection,
  Migration,
  ConnectionConfig,
} from '../index.js'

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const createUsersTable = async (conn: DatabaseConnection) => {
  await conn.execute(
    `CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      age INTEGER
    )`,
  )
}

const insertUser = async (
  conn: DatabaseConnection,
  name: string,
  email: string,
  age: number,
) => {
  return conn.execute(
    'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
    [name, email, age],
  )
}

interface User {
  id: number
  name: string
  email: string
  age: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// Connection Factory
// ═══════════════════════════════════════════════════════════════════════════════

describe('createConnection', () => {
  it('should create a memory connection', async () => {
    const conn = await createConnection({ driver: 'memory' })
    expect(conn).toBeInstanceOf(MemoryDatabase)
    expect(conn.isConnected()).toBe(true)
    expect(conn.getDriver()).toBe('memory')
    await conn.close()
  })

  it('should throw for sqlite driver', async () => {
    await expect(
      createConnection({ driver: 'sqlite', filename: ':memory:' }),
    ).rejects.toThrow(/Driver not available|not implemented/i)
  })

  it('should throw for postgres driver (not installed in test)', async () => {
    await expect(
      createConnection({ driver: 'postgres', connectionString: 'postgres://localhost' }),
    ).rejects.toThrow(/not available|not implemented/i)
  })

  it('should throw for mysql driver (not installed in test)', async () => {
    await expect(
      createConnection({ driver: 'mysql', connectionString: 'mysql://localhost' }),
    ).rejects.toThrow(/not available|not implemented/i)
  })

  it('should throw for unknown driver', async () => {
    await expect(
      createConnection({ driver: 'oracle' as ConnectionConfig['driver'] }),
    ).rejects.toThrow('Unknown database driver')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// DatabaseError
// ═══════════════════════════════════════════════════════════════════════════════

describe('DatabaseError', () => {
  it('should be an instance of Error', () => {
    const err = new DatabaseError('fail')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('DatabaseError')
    expect(err.message).toBe('fail')
  })

  it('should have DATABASE_ERROR code (4003)', () => {
    const err = new DatabaseError('oops')
    expect(err.code).toBe(4003)
  })

  it('should accept context', () => {
    const err = new DatabaseError('ctx', { driver: 'sqlite' })
    expect(err.context).toEqual({ driver: 'sqlite' })
  })

  it('should serialize to JSON', () => {
    const err = new DatabaseError('json-test')
    const json = err.toJSON()
    expect(json.name).toBe('DatabaseError')
    expect(json.code).toBe(4003)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — Connection lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — Connection', () => {
  let db: MemoryDatabase

  beforeEach(() => {
    db = new MemoryDatabase()
  })

  it('should report connected after creation', () => {
    expect(db.isConnected()).toBe(true)
  })

  it('should return memory driver', () => {
    expect(db.getDriver()).toBe('memory')
  })

  it('should disconnect on close', async () => {
    await db.close()
    expect(db.isConnected()).toBe(false)
  })

  it('should reject queries after close', async () => {
    await db.close()
    await expect(db.query('SELECT * FROM foo')).rejects.toThrow('Connection is closed')
  })

  it('should reject execute after close', async () => {
    await db.close()
    await expect(db.execute('CREATE TABLE foo (id INTEGER)')).rejects.toThrow(
      'Connection is closed',
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — CREATE TABLE
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — CREATE TABLE', () => {
  let db: MemoryDatabase

  beforeEach(() => {
    db = new MemoryDatabase()
  })

  it('should create a table', async () => {
    await db.execute('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)')
    const result = await db.query('SELECT * FROM test')
    expect(result.rows).toEqual([])
  })

  it('should support IF NOT EXISTS', async () => {
    await db.execute('CREATE TABLE test (id INTEGER PRIMARY KEY)')
    await expect(
      db.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)'),
    ).resolves.not.toThrow()
  })

  it('should throw when table already exists without IF NOT EXISTS', async () => {
    await db.execute('CREATE TABLE dup (id INTEGER)')
    await expect(db.execute('CREATE TABLE dup (id INTEGER)')).rejects.toThrow(
      "already exists",
    )
  })

  it('should parse column definitions with constraints', async () => {
    await db.execute(
      `CREATE TABLE complex (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        CONSTRAINT pk PRIMARY KEY (id)
      )`,
    )
    const result = await db.query('SELECT * FROM complex')
    expect(result.rowCount).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — INSERT
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — INSERT', () => {
  let db: MemoryDatabase

  beforeEach(async () => {
    db = new MemoryDatabase()
    await createUsersTable(db)
  })

  it('should insert a row with params', async () => {
    const result = await insertUser(db, 'Alice', 'alice@test.com', 30)
    expect(result.rowsAffected).toBe(1)
  })

  it('should auto-increment id', async () => {
    await insertUser(db, 'Alice', 'alice@test.com', 30)
    await insertUser(db, 'Bob', 'bob@test.com', 25)
    const result = await db.query<User>('SELECT * FROM users')
    expect(result.rows[0].id).toBe(1)
    expect(result.rows[1].id).toBe(2)
  })

  it('should store correct values', async () => {
    await insertUser(db, 'Charlie', 'charlie@test.com', 40)
    const result = await db.query<User>('SELECT * FROM users')
    expect(result.rows[0].name).toBe('Charlie')
    expect(result.rows[0].email).toBe('charlie@test.com')
    expect(result.rows[0].age).toBe(40)
  })

  it('should throw for non-existent table', async () => {
    await expect(
      db.execute("INSERT INTO ghosts (id) VALUES (?)", [1]),
    ).rejects.toThrow("does not exist")
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — SELECT
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — SELECT', () => {
  let db: MemoryDatabase

  beforeEach(async () => {
    db = new MemoryDatabase()
    await createUsersTable(db)
    await insertUser(db, 'Alice', 'alice@test.com', 30)
    await insertUser(db, 'Bob', 'bob@test.com', 25)
    await insertUser(db, 'Charlie', 'charlie@test.com', 40)
  })

  it('should select all rows with *', async () => {
    const result = await db.query<User>('SELECT * FROM users')
    expect(result.rowCount).toBe(3)
    expect(result.rows).toHaveLength(3)
  })

  it('should select specific columns', async () => {
    const result = await db.query<{ name: string }>('SELECT name FROM users')
    expect(result.rows[0]).toHaveProperty('name')
    expect(result.rows[0]).not.toHaveProperty('email')
  })

  it('should filter with WHERE =', async () => {
    const result = await db.query<User>('SELECT * FROM users WHERE name = ?', ['Alice'])
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('should filter with WHERE and multiple AND conditions', async () => {
    const result = await db.query<User>(
      'SELECT * FROM users WHERE name = ? AND age = ?',
      ['Alice', 30],
    )
    expect(result.rowCount).toBe(1)
  })

  it('should support ORDER BY ASC', async () => {
    const result = await db.query<User>('SELECT * FROM users ORDER BY age')
    expect(result.rows[0].name).toBe('Bob')
    expect(result.rows[2].name).toBe('Charlie')
  })

  it('should support ORDER BY DESC', async () => {
    const result = await db.query<User>('SELECT * FROM users ORDER BY age DESC')
    expect(result.rows[0].name).toBe('Charlie')
    expect(result.rows[2].name).toBe('Bob')
  })

  it('should support LIMIT', async () => {
    const result = await db.query<User>('SELECT * FROM users LIMIT 2')
    expect(result.rowCount).toBe(2)
  })

  it('should support OFFSET', async () => {
    const result = await db.query<User>('SELECT * FROM users ORDER BY id LIMIT 2 OFFSET 1')
    expect(result.rows[0].name).toBe('Bob')
    expect(result.rowCount).toBe(2)
  })

  it('should support COUNT(*)', async () => {
    const result = await db.query<{ 'count(*)': number }>('SELECT COUNT(*) FROM users')
    expect(result.rows[0]['count(*)']).toBe(3)
  })

  it('should support COUNT(*) with WHERE', async () => {
    const result = await db.query<{ 'count(*)': number }>(
      'SELECT COUNT(*) FROM users WHERE age > ?',
      [28],
    )
    expect(result.rows[0]['count(*)']).toBe(2)
  })

  it('should include duration in result', async () => {
    const result = await db.query('SELECT * FROM users')
    expect(typeof result.duration).toBe('number')
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('should throw for non-existent table', async () => {
    await expect(db.query('SELECT * FROM ghosts')).rejects.toThrow('does not exist')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — UPDATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — UPDATE', () => {
  let db: MemoryDatabase

  beforeEach(async () => {
    db = new MemoryDatabase()
    await createUsersTable(db)
    await insertUser(db, 'Alice', 'alice@test.com', 30)
    await insertUser(db, 'Bob', 'bob@test.com', 25)
  })

  it('should update matching rows', async () => {
    const result = await db.execute('UPDATE users SET age = ? WHERE name = ?', [31, 'Alice'])
    expect(result.rowsAffected).toBe(1)

    const q = await db.query<User>('SELECT * FROM users WHERE name = ?', ['Alice'])
    expect(q.rows[0].age).toBe(31)
  })

  it('should update multiple columns', async () => {
    await db.execute('UPDATE users SET name = ?, age = ? WHERE id = ?', ['Alicia', 32, 1])
    const q = await db.query<User>('SELECT * FROM users WHERE id = ?', [1])
    expect(q.rows[0].name).toBe('Alicia')
    expect(q.rows[0].age).toBe(32)
  })

  it('should return 0 affected rows when no match', async () => {
    const result = await db.execute('UPDATE users SET age = ? WHERE name = ?', [99, 'Nobody'])
    expect(result.rowsAffected).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — DELETE
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — DELETE', () => {
  let db: MemoryDatabase

  beforeEach(async () => {
    db = new MemoryDatabase()
    await createUsersTable(db)
    await insertUser(db, 'Alice', 'alice@test.com', 30)
    await insertUser(db, 'Bob', 'bob@test.com', 25)
  })

  it('should delete matching rows', async () => {
    const result = await db.execute('DELETE FROM users WHERE name = ?', ['Alice'])
    expect(result.rowsAffected).toBe(1)

    const q = await db.query<User>('SELECT * FROM users')
    expect(q.rowCount).toBe(1)
  })

  it('should delete all rows without WHERE', async () => {
    const result = await db.execute('DELETE FROM users')
    expect(result.rowsAffected).toBe(2)
  })

  it('should return 0 when nothing matches', async () => {
    const result = await db.execute('DELETE FROM users WHERE name = ?', ['Nobody'])
    expect(result.rowsAffected).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — DROP TABLE
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — DROP TABLE', () => {
  let db: MemoryDatabase

  beforeEach(async () => {
    db = new MemoryDatabase()
    await db.execute('CREATE TABLE temp (id INTEGER)')
  })

  it('should drop an existing table', async () => {
    await db.execute('DROP TABLE temp')
    await expect(db.query('SELECT * FROM temp')).rejects.toThrow('does not exist')
  })

  it('should support IF EXISTS on missing table', async () => {
    await expect(db.execute('DROP TABLE IF EXISTS nonexistent')).resolves.not.toThrow()
  })

  it('should throw when dropping non-existent table without IF EXISTS', async () => {
    await expect(db.execute('DROP TABLE nonexistent')).rejects.toThrow('does not exist')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — Transactions
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — Transactions', () => {
  let db: MemoryDatabase

  beforeEach(async () => {
    db = new MemoryDatabase()
    await createUsersTable(db)
  })

  it('should commit on success', async () => {
    await db.transaction(async (conn) => {
      await insertUser(conn, 'Alice', 'alice@test.com', 30)
      await insertUser(conn, 'Bob', 'bob@test.com', 25)
    })

    const result = await db.query('SELECT * FROM users')
    expect(result.rowCount).toBe(2)
  })

  it('should rollback on error', async () => {
    await expect(
      db.transaction(async (conn) => {
        await insertUser(conn, 'Alice', 'alice@test.com', 30)
        throw new Error('Intentional failure')
      }),
    ).rejects.toThrow('Intentional failure')

    const result = await db.query('SELECT * FROM users')
    expect(result.rowCount).toBe(0)
  })

  it('should return the value from the transaction function', async () => {
    const value = await db.transaction(async (conn) => {
      await insertUser(conn, 'Alice', 'alice@test.com', 30)
      return 'done'
    })
    expect(value).toBe('done')
  })

  it('should rollback table changes on error', async () => {
    await insertUser(db, 'Existing', 'existing@test.com', 50)

    await expect(
      db.transaction(async (conn) => {
        await conn.execute('DELETE FROM users WHERE name = ?', ['Existing'])
        throw new Error('Abort')
      }),
    ).rejects.toThrow('Abort')

    const result = await db.query<User>('SELECT * FROM users')
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].name).toBe('Existing')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MemoryDatabase — Unsupported SQL
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryDatabase — Unsupported SQL', () => {
  it('should throw for unsupported statements', async () => {
    const db = new MemoryDatabase()
    await expect(db.execute('ALTER TABLE users ADD COLUMN foo TEXT')).rejects.toThrow(
      'Unsupported SQL',
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// MigrationRunner
// ═══════════════════════════════════════════════════════════════════════════════

const testMigrations: Migration[] = [
  {
    version: 1,
    name: 'create_users',
    up: `CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    )`,
    down: 'DROP TABLE users',
  },
  {
    version: 2,
    name: 'create_posts',
    up: `CREATE TABLE posts (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      userId INTEGER NOT NULL
    )`,
    down: 'DROP TABLE posts',
  },
  {
    version: 3,
    name: 'create_comments',
    up: `CREATE TABLE comments (
      id INTEGER PRIMARY KEY,
      body TEXT NOT NULL,
      postId INTEGER NOT NULL
    )`,
    down: 'DROP TABLE comments',
  },
]

describe('MigrationRunner', () => {
  let db: MemoryDatabase
  let runner: MigrationRunner

  beforeEach(async () => {
    db = new MemoryDatabase()
    runner = new MigrationRunner(db)
  })

  it('should throw if not initialized', async () => {
    await expect(runner.getAppliedMigrations()).rejects.toThrow('not initialized')
  })

  it('should initialize the _migrations table', async () => {
    await runner.initialize()
    const result = await db.query('SELECT * FROM _migrations')
    expect(result.rows).toEqual([])
  })

  it('should be idempotent on double initialize', async () => {
    await runner.initialize()
    await expect(runner.initialize()).resolves.not.toThrow()
  })

  it('should report latest version as 0 with no migrations', async () => {
    await runner.initialize()
    const version = await runner.getLatestVersion()
    expect(version).toBe(0)
  })

  it('should run pending migrations in order', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)

    const applied = await runner.getAppliedMigrations()
    expect(applied).toHaveLength(3)
    expect(applied[0].version).toBe(1)
    expect(applied[1].version).toBe(2)
    expect(applied[2].version).toBe(3)
  })

  it('should skip already-applied migrations', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    await expect(runner.migrate(testMigrations)).resolves.not.toThrow()

    const applied = await runner.getAppliedMigrations()
    expect(applied).toHaveLength(3)
  })

  it('should track latest version after migration', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    expect(await runner.getLatestVersion()).toBe(3)
  })

  it('should rollback all migrations to version 0', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    await runner.rollback(testMigrations, 0)

    const applied = await runner.getAppliedMigrations()
    expect(applied).toHaveLength(0)
  })

  it('should rollback to a specific version', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    await runner.rollback(testMigrations, 1)

    const applied = await runner.getAppliedMigrations()
    expect(applied).toHaveLength(1)
    expect(applied[0].version).toBe(1)
  })

  it('should do nothing if rollback target is current version', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    await runner.rollback(testMigrations, 3)

    const applied = await runner.getAppliedMigrations()
    expect(applied).toHaveLength(3)
  })

  it('should report migration status correctly', async () => {
    await runner.initialize()
    await runner.migrate([testMigrations[0]])

    const status = await runner.getMigrationStatus(testMigrations)
    expect(status.applied).toHaveLength(1)
    expect(status.pending).toHaveLength(2)
    expect(status.pending[0].version).toBe(2)
    expect(status.pending[1].version).toBe(3)
  })

  it('should report all pending when nothing applied', async () => {
    await runner.initialize()
    const status = await runner.getMigrationStatus(testMigrations)
    expect(status.applied).toHaveLength(0)
    expect(status.pending).toHaveLength(3)
  })

  it('should report none pending when all applied', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    const status = await runner.getMigrationStatus(testMigrations)
    expect(status.pending).toHaveLength(0)
    expect(status.applied).toHaveLength(3)
  })

  it('should record appliedAt timestamps', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    const applied = await runner.getAppliedMigrations()
    for (const record of applied) {
      expect(record.appliedAt).toBeTruthy()
      expect(typeof record.appliedAt).toBe('string')
    }
  })

  it('should allow re-migration after rollback', async () => {
    await runner.initialize()
    await runner.migrate(testMigrations)
    await runner.rollback(testMigrations, 0)
    await runner.migrate(testMigrations)

    const applied = await runner.getAppliedMigrations()
    expect(applied).toHaveLength(3)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('Repository', () => {
  let db: MemoryDatabase
  let repo: Repository<User>

  beforeEach(async () => {
    db = new MemoryDatabase()
    await createUsersTable(db)
    repo = new Repository<User>(db, 'users', ['id', 'name', 'email', 'age'])
  })

  // ─── create ──────────────────────────────────────────────────────────

  it('should create a record and return it', async () => {
    const user = await repo.create({ name: 'Alice', email: 'alice@test.com', age: 30 })
    expect(user.name).toBe('Alice')
    expect(user.email).toBe('alice@test.com')
    expect(user.id).toBe(1)
  })

  it('should auto-increment ids on multiple creates', async () => {
    const u1 = await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    const u2 = await repo.create({ name: 'B', email: 'b@t.com', age: 21 })
    expect(u1.id).toBe(1)
    expect(u2.id).toBe(2)
  })

  // ─── findById ────────────────────────────────────────────────────────

  it('should find a record by id', async () => {
    await repo.create({ name: 'Alice', email: 'alice@test.com', age: 30 })
    const found = await repo.findById(1)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Alice')
  })

  it('should return null for non-existent id', async () => {
    const found = await repo.findById(999)
    expect(found).toBeNull()
  })

  // ─── findAll ─────────────────────────────────────────────────────────

  it('should find all records', async () => {
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })
    await repo.create({ name: 'C', email: 'c@t.com', age: 30 })

    const all = await repo.findAll()
    expect(all).toHaveLength(3)
  })

  it('should filter with where clause', async () => {
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })

    const filtered = await repo.findAll({ where: { name: 'A' } })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('A')
  })

  it('should sort with orderBy', async () => {
    await repo.create({ name: 'C', email: 'c@t.com', age: 30 })
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })

    const sorted = await repo.findAll({ orderBy: 'age' })
    expect(sorted[0].name).toBe('A')
    expect(sorted[1].name).toBe('B')
    expect(sorted[2].name).toBe('C')
  })

  it('should support limit', async () => {
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })
    await repo.create({ name: 'C', email: 'c@t.com', age: 30 })

    const limited = await repo.findAll({ limit: 2 })
    expect(limited).toHaveLength(2)
  })

  it('should support offset', async () => {
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })
    await repo.create({ name: 'C', email: 'c@t.com', age: 30 })

    const page = await repo.findAll({ orderBy: 'id', limit: 2, offset: 1 })
    expect(page).toHaveLength(2)
    expect(page[0].name).toBe('B')
  })

  // ─── update ──────────────────────────────────────────────────────────

  it('should update a record', async () => {
    await repo.create({ name: 'Alice', email: 'alice@test.com', age: 30 })
    const updated = await repo.update(1, { age: 31 })
    expect(updated).not.toBeNull()
    expect(updated!.age).toBe(31)
    expect(updated!.name).toBe('Alice')
  })

  it('should return null when updating non-existent id', async () => {
    const updated = await repo.update(999, { age: 31 })
    expect(updated).toBeNull()
  })

  it('should update multiple fields', async () => {
    await repo.create({ name: 'Alice', email: 'alice@test.com', age: 30 })
    const updated = await repo.update(1, { name: 'Alicia', email: 'alicia@test.com' })
    expect(updated!.name).toBe('Alicia')
    expect(updated!.email).toBe('alicia@test.com')
  })

  it('should return unchanged record when no data to update', async () => {
    await repo.create({ name: 'Alice', email: 'alice@test.com', age: 30 })
    const result = await repo.update(1, {})
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Alice')
  })

  // ─── delete ──────────────────────────────────────────────────────────

  it('should delete a record', async () => {
    await repo.create({ name: 'Alice', email: 'alice@test.com', age: 30 })
    const deleted = await repo.delete(1)
    expect(deleted).toBe(true)

    const found = await repo.findById(1)
    expect(found).toBeNull()
  })

  it('should return false when deleting non-existent id', async () => {
    const deleted = await repo.delete(999)
    expect(deleted).toBe(false)
  })

  // ─── count ───────────────────────────────────────────────────────────

  it('should count all records', async () => {
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })

    const total = await repo.count()
    expect(total).toBe(2)
  })

  it('should count with filter', async () => {
    await repo.create({ name: 'A', email: 'a@t.com', age: 20 })
    await repo.create({ name: 'B', email: 'b@t.com', age: 25 })
    await repo.create({ name: 'A', email: 'a2@t.com', age: 22 })

    const count = await repo.count({ name: 'A' })
    expect(count).toBe(2)
  })

  it('should return 0 when no records exist', async () => {
    const count = await repo.count()
    expect(count).toBe(0)
  })
})
