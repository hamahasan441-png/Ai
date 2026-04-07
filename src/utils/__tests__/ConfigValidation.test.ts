import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import {
  string,
  optionalString,
  number,
  boolean,
  enumField,
  validateField,
  loadConfig,
  validateConfig,
  ConfigValidationError,
  appConfigSchema,
  type ConfigSchema,
} from '../../utils/configValidation.js'

describe('ConfigValidation', () => {
  // ── Field Builders ──

  describe('string()', () => {
    it('creates a required string field', () => {
      const field = string('MY_VAR', 'A required variable')
      expect(field.required).toBe(true)
      expect(field.type).toBe('string')
      expect(field.envVar).toBe('MY_VAR')
    })

    it('validates min/max length', () => {
      const field = string('MY_VAR', 'test', { min: 3, max: 10 })
      expect(validateField(field, 'ab').error).not.toBeNull()
      expect(validateField(field, 'abc').error).toBeNull()
      expect(validateField(field, 'abcdefghijk').error).not.toBeNull()
      expect(validateField(field, 'abcdefghij').error).toBeNull()
    })
  })

  describe('optionalString()', () => {
    it('creates an optional string field with default', () => {
      const field = optionalString('MY_VAR', 'test', 'default_val')
      expect(field.required).toBe(false)
      expect(field.defaultValue).toBe('default_val')
    })

    it('returns default when env var is missing', () => {
      const field = optionalString('MY_VAR', 'test', 'fallback')
      const result = validateField(field, undefined)
      expect(result.value).toBe('fallback')
      expect(result.error).toBeNull()
    })

    it('returns undefined when no default and missing', () => {
      const field = optionalString('MY_VAR', 'test')
      const result = validateField(field, undefined)
      expect(result.value).toBeUndefined()
      expect(result.error).toBeNull()
    })
  })

  describe('number()', () => {
    it('coerces string to number', () => {
      const field = number('PORT', 'Server port', 3000)
      const result = validateField(field, '8080')
      expect(result.value).toBe(8080)
      expect(result.error).toBeNull()
    })

    it('returns default when missing', () => {
      const field = number('PORT', 'Server port', 3000)
      const result = validateField(field, undefined)
      expect(result.value).toBe(3000)
    })

    it('rejects non-numeric strings', () => {
      const field = number('PORT', 'Server port', 3000)
      const result = validateField(field, 'abc')
      expect(result.error).not.toBeNull()
      expect(result.error!.envVar).toBe('PORT')
    })

    it('validates min/max range', () => {
      const field = number('PORT', 'Server port', 3000, { min: 1, max: 65535 })
      expect(validateField(field, '0').error).not.toBeNull()
      expect(validateField(field, '1').error).toBeNull()
      expect(validateField(field, '65535').error).toBeNull()
      expect(validateField(field, '65536').error).not.toBeNull()
    })

    it('creates required number field when no default', () => {
      const field = number('COUNT', 'Item count')
      expect(field.required).toBe(true)
      const result = validateField(field, undefined)
      expect(result.error).not.toBeNull()
    })
  })

  describe('boolean()', () => {
    it('coerces truthy strings', () => {
      const field = boolean('ENABLED', 'Feature flag')
      for (const val of ['true', 'True', 'TRUE', '1', 'yes', 'YES', 'on', 'ON']) {
        expect(validateField(field, val).value).toBe(true)
      }
    })

    it('coerces falsy strings', () => {
      const field = boolean('ENABLED', 'Feature flag')
      for (const val of ['false', 'False', 'FALSE', '0', 'no', 'NO', 'off', 'OFF', '']) {
        expect(validateField(field, val).value).toBe(false)
      }
    })

    it('returns default when missing', () => {
      expect(validateField(boolean('X', 'test', true), undefined).value).toBe(true)
      expect(validateField(boolean('X', 'test', false), undefined).value).toBe(false)
      expect(validateField(boolean('X', 'test'), undefined).value).toBe(false)
    })

    it('rejects invalid boolean strings', () => {
      const field = boolean('ENABLED', 'Feature flag')
      const result = validateField(field, 'maybe')
      expect(result.error).not.toBeNull()
    })
  })

  describe('enumField()', () => {
    it('accepts valid enum values', () => {
      const field = enumField('ENV', 'Environment', ['development', 'production', 'test'] as const, 'development')
      expect(validateField(field, 'production').value).toBe('production')
      expect(validateField(field, 'production').error).toBeNull()
    })

    it('rejects invalid enum values', () => {
      const field = enumField('ENV', 'Environment', ['development', 'production', 'test'] as const, 'development')
      const result = validateField(field, 'staging')
      expect(result.error).not.toBeNull()
      expect(result.error!.message).toContain('Must be one of')
    })

    it('returns default when missing', () => {
      const field = enumField('ENV', 'Environment', ['dev', 'prod'] as const, 'dev')
      expect(validateField(field, undefined).value).toBe('dev')
    })

    it('creates required enum when no default', () => {
      const field = enumField('ENV', 'Environment', ['dev', 'prod'] as const)
      expect(field.required).toBe(true)
      expect(validateField(field, undefined).error).not.toBeNull()
    })
  })

  // ── Custom Validation ──

  describe('custom validate', () => {
    it('runs custom validation function', () => {
      const field = string('URL', 'Database URL', {
        validate: (v: string) => (v.startsWith('http://') ? 'Must use https' : null),
      })
      expect(validateField(field, 'http://example.com').error!.message).toBe('Must use https')
      expect(validateField(field, 'https://example.com').error).toBeNull()
    })
  })

  // ── loadConfig ──

  describe('loadConfig()', () => {
    it('loads valid config from env', () => {
      const schema = {
        host: optionalString('HOST', 'Server host', 'localhost'),
        port: number('PORT', 'Server port', 8080),
        debug: boolean('DEBUG_MODE', 'Debug mode'),
      } as const satisfies ConfigSchema

      const config = loadConfig(schema, {
        HOST: 'myhost',
        PORT: '3000',
        DEBUG_MODE: 'true',
      })

      expect(config.host).toBe('myhost')
      expect(config.port).toBe(3000)
      expect(config.debug).toBe(true)
    })

    it('uses defaults for missing optional fields', () => {
      const schema = {
        host: optionalString('HOST', 'Server host', 'localhost'),
        port: number('PORT', 'Server port', 8080),
        debug: boolean('DEBUG_MODE', 'Debug mode', false),
      } as const satisfies ConfigSchema

      const config = loadConfig(schema, {})
      expect(config.host).toBe('localhost')
      expect(config.port).toBe(8080)
      expect(config.debug).toBe(false)
    })

    it('throws ConfigValidationError for missing required fields', () => {
      const schema = {
        apiKey: string('API_KEY', 'Required key'),
        secret: string('SECRET', 'Required secret'),
      } as const satisfies ConfigSchema

      expect(() => loadConfig(schema, {})).toThrow(ConfigValidationError)
      try {
        loadConfig(schema, {})
      } catch (e) {
        const err = e as ConfigValidationError
        expect(err.fieldErrors).toHaveLength(2)
        expect(err.fieldErrors[0].envVar).toBe('API_KEY')
        expect(err.fieldErrors[1].envVar).toBe('SECRET')
      }
    })

    it('collects all errors before throwing', () => {
      const schema = {
        port: number('PORT', 'Port'),
        env: enumField('ENV', 'Environment', ['dev', 'prod'] as const),
      } as const satisfies ConfigSchema

      try {
        loadConfig(schema, { PORT: 'abc', ENV: 'staging' })
      } catch (e) {
        const err = e as ConfigValidationError
        expect(err.fieldErrors).toHaveLength(2)
      }
    })
  })

  // ── validateConfig (non-throwing) ──

  describe('validateConfig()', () => {
    it('returns valid=true for valid config', () => {
      const schema = {
        name: optionalString('NAME', 'App name', 'ai'),
      } as const satisfies ConfigSchema

      const result = validateConfig(schema, {})
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.config.name).toBe('ai')
    })

    it('returns valid=false with errors for invalid config', () => {
      const schema = {
        key: string('KEY', 'Required key'),
      } as const satisfies ConfigSchema

      const result = validateConfig(schema, {})
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  // ── ConfigValidationError ──

  describe('ConfigValidationError', () => {
    it('formats error message with all field errors', () => {
      const err = new ConfigValidationError([
        { envVar: 'API_KEY', message: 'Missing required variable' },
        { envVar: 'PORT', message: 'Invalid number' },
      ])
      expect(err.message).toContain('API_KEY')
      expect(err.message).toContain('PORT')
      expect(err.name).toBe('ConfigValidationError')
      expect(err.fieldErrors).toHaveLength(2)
    })

    it('is an instance of AiError', () => {
      const err = new ConfigValidationError([{ envVar: 'X', message: 'test' }])
      expect(err.code).toBeDefined()
      expect(err.timestamp).toBeDefined()
    })
  })

  // ── Application Config Schema ──

  describe('appConfigSchema', () => {
    it('validates minimal config (all defaults)', () => {
      const result = validateConfig(appConfigSchema, {
        NODE_ENV: 'test',
        LOG_LEVEL: 'debug',
      })
      expect(result.valid).toBe(true)
    })

    it('validates full config', () => {
      const result = validateConfig(appConfigSchema, {
        ANTHROPIC_API_KEY: 'sk-ant-test-key',
        CLAUDE_CODE_USE_BEDROCK: 'false',
        CLAUDE_CODE_USE_VERTEX: 'false',
        OPENAI_API_KEY: 'sk-test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        MYSQL_URL: 'mysql://user:pass@localhost:3306/db',
        AI_CACHE_DISK: 'true',
        AI_CACHE_DIR: '/tmp/cache',
        AI_DATA_DIR: '/tmp/data',
        NODE_ENV: 'production',
        LOG_LEVEL: 'warn',
        AI_SERVER_PORT: '8080',
        AI_SERVER_HOST: '127.0.0.1',
        AI_CORS_ORIGIN: 'https://example.com',
      })
      expect(result.valid).toBe(true)
    })

    it('rejects invalid DATABASE_URL', () => {
      const result = validateConfig(appConfigSchema, {
        DATABASE_URL: 'mysql://wrong-protocol',
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.envVar === 'DATABASE_URL')).toBe(true)
    })

    it('rejects invalid MYSQL_URL', () => {
      const result = validateConfig(appConfigSchema, {
        MYSQL_URL: 'postgresql://wrong-protocol',
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.envVar === 'MYSQL_URL')).toBe(true)
    })

    it('rejects invalid NODE_ENV', () => {
      const result = validateConfig(appConfigSchema, {
        NODE_ENV: 'staging',
      })
      expect(result.valid).toBe(false)
    })

    it('rejects invalid server port', () => {
      const result = validateConfig(appConfigSchema, {
        AI_SERVER_PORT: '99999',
      })
      expect(result.valid).toBe(false)
    })
  })
})
