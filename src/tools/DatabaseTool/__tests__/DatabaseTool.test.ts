import { describe, it, expect, vi } from 'vitest'

// Mock heavy transitive dependencies that aren't available in test env
vi.mock('zod/v4', () => {
  const createChainable = (): any => {
    const chain: any = () => chain
    chain.describe = () => chain
    chain.min = () => chain
    chain.max = () => chain
    chain.int = () => chain
    chain.default = () => chain
    chain.optional = () => chain
    return chain
  }
  return {
    z: {
      string: createChainable,
      number: createChainable,
      boolean: createChainable,
      enum: createChainable,
      array: createChainable,
      record: createChainable,
      unknown: createChainable,
      object: () => createChainable(),
      strictObject: () => createChainable(),
    },
  }
})

vi.mock('../../../Tool.js', () => ({
  buildTool: (def: any) => ({
    isEnabled: () => true,
    isConcurrencySafe: () => false,
    isReadOnly: () => false,
    isDestructive: () => false,
    checkPermissions: (input: any) =>
      Promise.resolve({ behavior: 'allow', updatedInput: input }),
    userFacingName: () => def.name,
    ...def,
  }),
}))

vi.mock('../../../utils/lazySchema.js', () => ({
  lazySchema: (fn: () => any) => fn(),
}))

import { DATABASE_TOOL_NAME, getDatabasePrompt } from '../prompt.js'
import { DatabaseTool } from '../DatabaseTool.js'

describe('DATABASE_TOOL_NAME', () => {
  it('equals "database"', () => {
    expect(DATABASE_TOOL_NAME).toBe('database')
  })
})

describe('getDatabasePrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = getDatabasePrompt()
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('mentions supported databases', () => {
    const prompt = getDatabasePrompt()
    expect(prompt).toContain('SQLite')
    expect(prompt).toContain('PostgreSQL')
    expect(prompt).toContain('MySQL')
  })

  it('mentions available commands', () => {
    const prompt = getDatabasePrompt()
    expect(prompt).toContain('query')
    expect(prompt).toContain('schema')
    expect(prompt).toContain('tables')
    expect(prompt).toContain('describe')
    expect(prompt).toContain('explain')
  })

  it('mentions safety rules', () => {
    const prompt = getDatabasePrompt()
    expect(prompt).toContain('read_only')
    expect(prompt).toContain('max_rows')
  })

  it('mentions connection string formats', () => {
    const prompt = getDatabasePrompt()
    expect(prompt).toContain('sqlite:///')
    expect(prompt).toContain('postgresql://')
    expect(prompt).toContain('mysql://')
  })
})

describe('DatabaseTool', () => {
  it('is defined and has a name', () => {
    expect(DatabaseTool).toBeDefined()
    expect(DatabaseTool.name).toBe('database')
  })

  describe('isReadOnly', () => {
    it('returns true when read_only is true', () => {
      const result = DatabaseTool.isReadOnly({
        command: 'query',
        connection_string: 'test.db',
        sql: 'SELECT * FROM users',
        read_only: true,
      })
      expect(result).toBe(true)
    })

    it('returns true when read_only is not specified', () => {
      const result = DatabaseTool.isReadOnly({
        command: 'query',
        connection_string: 'test.db',
        sql: 'SELECT * FROM users',
      })
      expect(result).toBe(true)
    })

    it('returns false for write operations when read_only is false', () => {
      const result = DatabaseTool.isReadOnly({
        command: 'query',
        connection_string: 'test.db',
        sql: 'INSERT INTO users VALUES (1, "test")',
        read_only: false,
      })
      expect(result).toBe(false)
    })

    it('returns true for SELECT even when read_only is false', () => {
      const result = DatabaseTool.isReadOnly({
        command: 'query',
        connection_string: 'test.db',
        sql: 'SELECT * FROM users',
        read_only: false,
      })
      expect(result).toBe(true)
    })
  })

  describe('isDestructive', () => {
    it('returns true for DROP statement', () => {
      const result = DatabaseTool.isDestructive({
        command: 'query',
        connection_string: 'test.db',
        sql: 'DROP TABLE users',
        read_only: false,
      })
      expect(result).toBe(true)
    })

    it('returns true for TRUNCATE statement', () => {
      const result = DatabaseTool.isDestructive({
        command: 'query',
        connection_string: 'test.db',
        sql: 'TRUNCATE TABLE logs',
        read_only: false,
      })
      expect(result).toBe(true)
    })

    it('returns true for DELETE FROM statement', () => {
      const result = DatabaseTool.isDestructive({
        command: 'query',
        connection_string: 'test.db',
        sql: 'DELETE FROM users',
        read_only: false,
      })
      expect(result).toBe(true)
    })

    it('returns false for SELECT statement', () => {
      const result = DatabaseTool.isDestructive({
        command: 'query',
        connection_string: 'test.db',
        sql: 'SELECT * FROM users',
      })
      expect(result).toBe(false)
    })

    it('returns false for INSERT statement', () => {
      const result = DatabaseTool.isDestructive({
        command: 'query',
        connection_string: 'test.db',
        sql: 'INSERT INTO users VALUES (1)',
        read_only: false,
      })
      expect(result).toBe(false)
    })

    it('returns false when sql is undefined', () => {
      const result = DatabaseTool.isDestructive({
        command: 'tables',
        connection_string: 'test.db',
      })
      expect(result).toBe(false)
    })
  })

  describe('isConcurrencySafe', () => {
    it('returns true', () => {
      expect(DatabaseTool.isConcurrencySafe()).toBe(true)
    })
  })

  describe('isEnabled', () => {
    it('returns true', () => {
      expect(DatabaseTool.isEnabled()).toBe(true)
    })
  })

  describe('checkPermissions', () => {
    it('denies write operations when read_only is true', async () => {
      const result = await DatabaseTool.checkPermissions({
        command: 'query',
        connection_string: 'test.db',
        sql: 'INSERT INTO users VALUES (1)',
        read_only: true,
      })
      expect(result.behavior).toBe('deny')
    })

    it('allows read operations', async () => {
      const result = await DatabaseTool.checkPermissions({
        command: 'query',
        connection_string: 'test.db',
        sql: 'SELECT * FROM users',
        read_only: true,
      })
      expect(result.behavior).toBe('allow')
    })

    it('allows write operations when read_only is false', async () => {
      const result = await DatabaseTool.checkPermissions({
        command: 'query',
        connection_string: 'test.db',
        sql: 'INSERT INTO users VALUES (1)',
        read_only: false,
      })
      expect(result.behavior).toBe('allow')
    })
  })

  describe('userFacingName', () => {
    it('returns "Database" when no input', () => {
      expect(DatabaseTool.userFacingName()).toBe('Database')
    })

    it('returns "Database (sqlite)" for SQLite connection', () => {
      expect(
        DatabaseTool.userFacingName({
          command: 'tables',
          connection_string: 'test.db',
        }),
      ).toBe('Database (sqlite)')
    })

    it('returns "Database (postgresql)" for PostgreSQL connection', () => {
      expect(
        DatabaseTool.userFacingName({
          command: 'tables',
          connection_string: 'postgresql://localhost:5432/mydb',
        }),
      ).toBe('Database (postgresql)')
    })

    it('returns "Database (mysql)" for MySQL connection', () => {
      expect(
        DatabaseTool.userFacingName({
          command: 'tables',
          connection_string: 'mysql://localhost:3306/mydb',
        }),
      ).toBe('Database (mysql)')
    })
  })
})
