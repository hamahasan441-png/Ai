import { describe, expect, it } from 'vitest'
import {
  ENV_SCHEMA,
  getEnvSnapshot,
  maskSensitiveValue,
  validateStartupEnv,
  type EnvVarSchema,
  type StartupEnvResult,
} from '../startupEnvValidator.js'

// ── Helper ──

function makeEnv(overrides: Record<string, string> = {}): Record<string, string | undefined> {
  return { ...overrides }
}

// ── validateStartupEnv ──

describe('validateStartupEnv', () => {
  describe('with empty env (no variables set)', () => {
    it('returns valid=true (no required vars in default schema)', () => {
      const result = validateStartupEnv({})
      expect(result.valid).toBe(true)
    })

    it('returns warnings for missing features', () => {
      const result = validateStartupEnv({})
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('warns about missing AI provider', () => {
      const result = validateStartupEnv({})
      const providerWarning = result.warnings.find(w =>
        w.message.includes('No AI provider configured'),
      )
      expect(providerWarning).toBeDefined()
    })

    it('includes a summary string', () => {
      const result = validateStartupEnv({})
      expect(result.summary).toBeTruthy()
      expect(typeof result.summary).toBe('string')
    })
  })

  describe('with ANTHROPIC_API_KEY set', () => {
    it('does not warn about missing AI provider', () => {
      const result = validateStartupEnv(makeEnv({ ANTHROPIC_API_KEY: 'sk-test-key' }))
      const providerWarning = result.warnings.find(w =>
        w.message.includes('No AI provider configured'),
      )
      expect(providerWarning).toBeUndefined()
    })
  })

  describe('with CLAUDE_CODE_USE_BEDROCK=1', () => {
    it('does not warn about missing AI provider', () => {
      const result = validateStartupEnv(makeEnv({ CLAUDE_CODE_USE_BEDROCK: '1' }))
      const providerWarning = result.warnings.find(w =>
        w.message.includes('No AI provider configured'),
      )
      expect(providerWarning).toBeUndefined()
    })
  })

  describe('with CLAUDE_CODE_USE_VERTEX=true', () => {
    it('does not warn about missing AI provider', () => {
      const result = validateStartupEnv(makeEnv({ CLAUDE_CODE_USE_VERTEX: 'true' }))
      const providerWarning = result.warnings.find(w =>
        w.message.includes('No AI provider configured'),
      )
      expect(providerWarning).toBeUndefined()
    })
  })

  // ── Type validation: boolean ──

  describe('boolean type validation', () => {
    it('accepts "true"', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: 'true' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeUndefined()
    })

    it('accepts "false"', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: 'false' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeUndefined()
    })

    it('accepts "1"', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: '1' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeUndefined()
    })

    it('accepts "0"', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: '0' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeUndefined()
    })

    it('accepts "yes"', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: 'yes' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeUndefined()
    })

    it('accepts "no"', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: 'no' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeUndefined()
    })

    it('rejects "maybe" as invalid boolean', () => {
      const result = validateStartupEnv(makeEnv({ AI_CACHE_DISK: 'maybe' }))
      const err = result.errors.find(e => e.variable === 'AI_CACHE_DISK')
      expect(err).toBeDefined()
      expect(err!.message).toContain('invalid boolean')
    })
  })

  // ── Type validation: url ──

  describe('url type validation', () => {
    it('accepts postgresql:// URL', () => {
      const result = validateStartupEnv(
        makeEnv({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' }),
      )
      const err = result.errors.find(e => e.variable === 'DATABASE_URL')
      expect(err).toBeUndefined()
    })

    it('accepts postgres:// URL', () => {
      const result = validateStartupEnv(
        makeEnv({ DATABASE_URL: 'postgres://user:pass@localhost:5432/db' }),
      )
      const err = result.errors.find(e => e.variable === 'DATABASE_URL')
      expect(err).toBeUndefined()
    })

    it('accepts mysql:// URL', () => {
      const result = validateStartupEnv(
        makeEnv({ MYSQL_URL: 'mysql://user:pass@localhost:3306/db' }),
      )
      const err = result.errors.find(e => e.variable === 'MYSQL_URL')
      expect(err).toBeUndefined()
    })

    it('accepts http:// URL', () => {
      const result = validateStartupEnv(makeEnv({ DATABASE_URL: 'http://localhost:5432/db' }))
      const err = result.errors.find(e => e.variable === 'DATABASE_URL')
      expect(err).toBeUndefined()
    })

    it('accepts sqlite:/// URL', () => {
      const result = validateStartupEnv(makeEnv({ DATABASE_URL: 'sqlite:///path/to/db' }))
      const err = result.errors.find(e => e.variable === 'DATABASE_URL')
      expect(err).toBeUndefined()
    })

    it('rejects invalid URL format', () => {
      const result = validateStartupEnv(makeEnv({ DATABASE_URL: 'not-a-url' }))
      const err = result.errors.find(e => e.variable === 'DATABASE_URL')
      expect(err).toBeDefined()
      expect(err!.message).toContain('invalid URL format')
    })
  })

  // ── Type validation: enum ──

  describe('enum type validation', () => {
    it('accepts valid NODE_ENV values', () => {
      for (const val of ['development', 'production', 'test']) {
        const result = validateStartupEnv(makeEnv({ NODE_ENV: val }))
        const warn = result.warnings.find(
          w => w.variable === 'NODE_ENV' && w.message.includes('invalid value'),
        )
        expect(warn).toBeUndefined()
      }
    })

    it('warns about invalid NODE_ENV value', () => {
      const result = validateStartupEnv(makeEnv({ NODE_ENV: 'staging' }))
      const warn = result.warnings.find(
        w => w.variable === 'NODE_ENV' && w.message.includes('invalid value'),
      )
      expect(warn).toBeDefined()
    })

    it('accepts valid LOG_LEVEL values', () => {
      for (const val of ['trace', 'debug', 'info', 'warn', 'error', 'fatal']) {
        const result = validateStartupEnv(makeEnv({ LOG_LEVEL: val }))
        const warn = result.warnings.find(
          w => w.variable === 'LOG_LEVEL' && w.message.includes('invalid value'),
        )
        expect(warn).toBeUndefined()
      }
    })

    it('warns about invalid LOG_LEVEL value', () => {
      const result = validateStartupEnv(makeEnv({ LOG_LEVEL: 'verbose' }))
      const warn = result.warnings.find(
        w => w.variable === 'LOG_LEVEL' && w.message.includes('invalid value'),
      )
      expect(warn).toBeDefined()
      expect(warn!.message).toContain('Expected one of:')
    })
  })

  // ── Custom schema (required vars) ──

  describe('custom schema with required vars', () => {
    const requiredSchema: EnvVarSchema[] = [
      {
        name: 'MY_REQUIRED_VAR',
        required: true,
        type: 'string',
        description: 'A required variable',
      },
    ]

    it('returns valid=false when required var is missing', () => {
      const result = validateStartupEnv({}, requiredSchema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(1)
      expect(result.errors[0]!.variable).toBe('MY_REQUIRED_VAR')
    })

    it('returns valid=false when required var is empty string', () => {
      const result = validateStartupEnv({ MY_REQUIRED_VAR: '' }, requiredSchema)
      expect(result.valid).toBe(false)
    })

    it('returns valid=true when required var is present', () => {
      const result = validateStartupEnv({ MY_REQUIRED_VAR: 'hello' }, requiredSchema)
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })

  // ── Custom schema: number type ──

  describe('number type validation', () => {
    const numSchema: EnvVarSchema[] = [
      { name: 'MY_PORT', required: false, type: 'number', description: 'Port number' },
    ]

    it('accepts valid number', () => {
      const result = validateStartupEnv({ MY_PORT: '3000' }, numSchema)
      const err = result.errors.find(e => e.variable === 'MY_PORT')
      expect(err).toBeUndefined()
    })

    it('accepts negative number', () => {
      const result = validateStartupEnv({ MY_PORT: '-1' }, numSchema)
      const err = result.errors.find(e => e.variable === 'MY_PORT')
      expect(err).toBeUndefined()
    })

    it('accepts floating point', () => {
      const result = validateStartupEnv({ MY_PORT: '3.14' }, numSchema)
      const err = result.errors.find(e => e.variable === 'MY_PORT')
      expect(err).toBeUndefined()
    })

    it('rejects non-numeric string', () => {
      const result = validateStartupEnv({ MY_PORT: 'abc' }, numSchema)
      const err = result.errors.find(e => e.variable === 'MY_PORT')
      expect(err).toBeDefined()
      expect(err!.message).toContain('invalid number')
    })

    it('rejects Infinity', () => {
      const result = validateStartupEnv({ MY_PORT: 'Infinity' }, numSchema)
      const err = result.errors.find(e => e.variable === 'MY_PORT')
      expect(err).toBeDefined()
    })
  })

  // ── Summary ──

  describe('summary formatting', () => {
    it('produces clean summary when all is valid', () => {
      const schema: EnvVarSchema[] = [
        { name: 'X', required: false, type: 'string', description: 'test' },
      ]
      // Pass env with an AI provider to suppress cross-field warning
      const result = validateStartupEnv({ X: 'val', ANTHROPIC_API_KEY: 'sk-test' }, schema)
      expect(result.summary).toContain('passed')
    })

    it('lists errors in summary', () => {
      const schema: EnvVarSchema[] = [
        { name: 'REQ', required: true, type: 'string', description: 'required var' },
      ]
      const result = validateStartupEnv({}, schema)
      expect(result.summary).toContain('error(s)')
      expect(result.summary).toContain('REQ')
    })

    it('lists warnings in summary', () => {
      const result = validateStartupEnv(makeEnv({ NODE_ENV: 'banana' }))
      expect(result.summary).toContain('warning(s)')
    })
  })
})

// ── maskSensitiveValue ──

describe('maskSensitiveValue', () => {
  it('masks long values showing first 4 chars', () => {
    expect(maskSensitiveValue('sk-ant-api03-secret-key')).toBe('sk-a****')
  })

  it('fully masks short values', () => {
    expect(maskSensitiveValue('abc')).toBe('****')
  })

  it('fully masks values equal to visible chars', () => {
    expect(maskSensitiveValue('abcd')).toBe('****')
  })

  it('respects custom visible chars', () => {
    expect(maskSensitiveValue('secret-password', 6)).toBe('secret****')
  })

  it('fully masks empty string', () => {
    expect(maskSensitiveValue('')).toBe('****')
  })
})

// ── getEnvSnapshot ──

describe('getEnvSnapshot', () => {
  it('masks sensitive values', () => {
    const snapshot = getEnvSnapshot({ ANTHROPIC_API_KEY: 'sk-ant-api03-longkey' }, ENV_SCHEMA)
    expect(snapshot['ANTHROPIC_API_KEY']).toBe('sk-a****')
    expect(snapshot['ANTHROPIC_API_KEY']).not.toContain('longkey')
  })

  it('shows non-sensitive values in plain text', () => {
    const snapshot = getEnvSnapshot({ NODE_ENV: 'production' }, ENV_SCHEMA)
    expect(snapshot['NODE_ENV']).toBe('production')
  })

  it('shows default values for unset vars', () => {
    const snapshot = getEnvSnapshot({}, ENV_SCHEMA)
    expect(snapshot['AI_CACHE_DISK']).toBe('(default: true)')
  })

  it('shows "(not set)" for unset vars without defaults', () => {
    const snapshot = getEnvSnapshot({}, ENV_SCHEMA)
    expect(snapshot['ANTHROPIC_API_KEY']).toBe('(not set)')
  })

  it('does not leak sensitive values', () => {
    const env = {
      ANTHROPIC_API_KEY: 'sk-secret-very-long-key-12345',
      DATABASE_URL: 'postgresql://user:password@host:5432/db',
    }
    const snapshot = getEnvSnapshot(env, ENV_SCHEMA)
    expect(snapshot['ANTHROPIC_API_KEY']).not.toContain('secret')
    expect(snapshot['DATABASE_URL']).not.toContain('password')
  })
})

// ── ENV_SCHEMA ──

describe('ENV_SCHEMA', () => {
  it('has at least 10 variable definitions', () => {
    expect(ENV_SCHEMA.length).toBeGreaterThanOrEqual(10)
  })

  it('all entries have required fields', () => {
    for (const entry of ENV_SCHEMA) {
      expect(entry.name).toBeTruthy()
      expect(typeof entry.required).toBe('boolean')
      expect(entry.type).toBeTruthy()
      expect(entry.description).toBeTruthy()
    }
  })

  it('enum entries have enumValues', () => {
    const enums = ENV_SCHEMA.filter(s => s.type === 'enum')
    for (const entry of enums) {
      expect(entry.enumValues).toBeDefined()
      expect(entry.enumValues!.length).toBeGreaterThan(0)
    }
  })

  it('sensitive entries are marked', () => {
    const sensitiveVars = ENV_SCHEMA.filter(s => s.sensitive)
    expect(sensitiveVars.length).toBeGreaterThanOrEqual(3) // API keys + DB URLs
  })

  it('no duplicate variable names', () => {
    const names = ENV_SCHEMA.map(s => s.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })
})

// ── Edge cases ──

describe('edge cases', () => {
  it('handles undefined env values gracefully', () => {
    const env: Record<string, string | undefined> = { ANTHROPIC_API_KEY: undefined }
    const result = validateStartupEnv(env)
    expect(result.valid).toBe(true) // No required vars fail
  })

  it('empty schema produces valid result with only cross-field warnings', () => {
    const result = validateStartupEnv({}, [])
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
    // Cross-field validation still warns about missing AI provider
    expect(result.warnings.length).toBe(1)
    expect(result.warnings[0]!.message).toContain('No AI provider')
  })

  it('result types are correct', () => {
    const result: StartupEnvResult = validateStartupEnv({})
    expect(typeof result.valid).toBe('boolean')
    expect(Array.isArray(result.errors)).toBe(true)
    expect(Array.isArray(result.warnings)).toBe(true)
    expect(typeof result.summary).toBe('string')
  })
})
