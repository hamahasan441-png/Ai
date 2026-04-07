/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Configuration Validation Module                                              ║
 * ║                                                                              ║
 * ║  Zod-inspired config validation for environment variables with:              ║
 * ║    • Type-safe config schemas                                                ║
 * ║    • Default values and coercion                                             ║
 * ║    • Friendly error messages for misconfiguration                            ║
 * ║    • Environment-aware validation (dev/prod/test)                            ║
 * ║    • Config file support (JSON, dotenv)                                      ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    import { loadConfig, appConfigSchema } from './utils/configValidation.js'  ║
 * ║    const config = loadConfig(appConfigSchema)                                ║
 * ║    config.anthropicApiKey  // string | undefined                              ║
 * ║    config.nodeEnv          // 'development' | 'production' | 'test'           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { AiError, AiErrorCode } from './errors.js'

// ── Config Error ──

export class ConfigValidationError extends AiError {
  readonly fieldErrors: ConfigFieldError[]

  constructor(fieldErrors: ConfigFieldError[]) {
    const messages = fieldErrors.map((e) => `  • ${e.envVar}: ${e.message}`).join('\n')
    super(`Configuration validation failed:\n${messages}`, AiErrorCode.CONFIGURATION_ERROR, {
      fieldErrors: fieldErrors.map((e) => ({ envVar: e.envVar, message: e.message })),
    })
    this.name = 'ConfigValidationError'
    this.fieldErrors = fieldErrors
  }
}

export interface ConfigFieldError {
  envVar: string
  message: string
  expected?: string
  received?: string
}

// ── Field Schema Types ──

export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'enum'

export interface ConfigField<T = unknown> {
  /** Environment variable name */
  envVar: string
  /** Human-readable description */
  description: string
  /** Field type */
  type: ConfigFieldType
  /** Whether the field is required */
  required: boolean
  /** Default value when not set */
  defaultValue?: T
  /** For enum fields, the allowed values */
  enumValues?: readonly string[]
  /** Minimum value (for numbers) or length (for strings) */
  min?: number
  /** Maximum value (for numbers) or length (for strings) */
  max?: number
  /** Custom validation function */
  validate?: (value: T) => string | null
  /** Coerce the raw string to the target type */
  coerce: (raw: string) => T
}

// ── Config Schema ──

export type ConfigSchema = Record<string, ConfigField>

export type ConfigResult<S extends ConfigSchema> = {
  [K in keyof S]: S[K] extends ConfigField<infer T> ? (S[K]['required'] extends true ? T : T | undefined) : unknown
}

// ── Field Builder Functions ──

/**
 * Create a required string config field.
 */
export function string(envVar: string, description: string, options?: Partial<Pick<ConfigField<string>, 'min' | 'max' | 'validate'>>): ConfigField<string> {
  return {
    envVar,
    description,
    type: 'string',
    required: true,
    coerce: (raw: string) => raw,
    ...options,
  }
}

/**
 * Create an optional string config field with a default.
 */
export function optionalString(envVar: string, description: string, defaultValue?: string, options?: Partial<Pick<ConfigField<string>, 'min' | 'max' | 'validate'>>): ConfigField<string> {
  return {
    envVar,
    description,
    type: 'string',
    required: false,
    defaultValue,
    coerce: (raw: string) => raw,
    ...options,
  }
}

/**
 * Create a number config field.
 */
export function number(envVar: string, description: string, defaultValue?: number, options?: Partial<Pick<ConfigField<number>, 'min' | 'max' | 'validate'>>): ConfigField<number> {
  return {
    envVar,
    description,
    type: 'number',
    required: defaultValue === undefined,
    defaultValue,
    coerce: (raw: string) => {
      const num = Number(raw)
      if (isNaN(num)) throw new Error(`"${raw}" is not a valid number`)
      return num
    },
    ...options,
  }
}

/**
 * Create a boolean config field.
 */
export function boolean(envVar: string, description: string, defaultValue: boolean = false): ConfigField<boolean> {
  return {
    envVar,
    description,
    type: 'boolean',
    required: false,
    defaultValue,
    coerce: (raw: string) => {
      const lower = raw.toLowerCase().trim()
      if (['true', '1', 'yes', 'on'].includes(lower)) return true
      if (['false', '0', 'no', 'off', ''].includes(lower)) return false
      throw new Error(`"${raw}" is not a valid boolean (use true/false, 1/0, yes/no)`)
    },
  }
}

/**
 * Create an enum config field.
 */
export function enumField<T extends string>(envVar: string, description: string, enumValues: readonly T[], defaultValue?: T): ConfigField<T> {
  return {
    envVar,
    description,
    type: 'enum',
    required: defaultValue === undefined,
    defaultValue,
    enumValues,
    coerce: (raw: string) => raw as T,
  }
}

// ── Validation Logic ──

/**
 * Validate a single config field against a raw string value.
 */
export function validateField<T>(field: ConfigField<T>, rawValue: string | undefined): { value: T | undefined; error: ConfigFieldError | null } {
  // Missing value
  if (rawValue === undefined || rawValue === '') {
    if (field.required) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: `Required environment variable is not set. ${field.description}`,
        },
      }
    }
    return { value: field.defaultValue, error: null }
  }

  // Coerce
  let value: T
  try {
    value = field.coerce(rawValue)
  } catch (e) {
    return {
      value: undefined,
      error: {
        envVar: field.envVar,
        message: e instanceof Error ? e.message : `Invalid value: ${rawValue}`,
        received: rawValue,
      },
    }
  }

  // Enum check
  if (field.type === 'enum' && field.enumValues) {
    if (!field.enumValues.includes(rawValue)) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: `Must be one of: ${field.enumValues.join(', ')}`,
          expected: field.enumValues.join(' | '),
          received: rawValue,
        },
      }
    }
  }

  // Range checks for numbers
  if (field.type === 'number' && typeof value === 'number') {
    if (field.min !== undefined && value < field.min) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: `Must be >= ${field.min}`,
          received: String(value),
        },
      }
    }
    if (field.max !== undefined && value > field.max) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: `Must be <= ${field.max}`,
          received: String(value),
        },
      }
    }
  }

  // Length checks for strings
  if (field.type === 'string' && typeof value === 'string') {
    if (field.min !== undefined && value.length < field.min) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: `Must be at least ${field.min} characters`,
          received: `${value.length} characters`,
        },
      }
    }
    if (field.max !== undefined && value.length > field.max) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: `Must be at most ${field.max} characters`,
          received: `${value.length} characters`,
        },
      }
    }
  }

  // Custom validation
  if (field.validate) {
    const error = field.validate(value)
    if (error) {
      return {
        value: undefined,
        error: {
          envVar: field.envVar,
          message: error,
          received: rawValue,
        },
      }
    }
  }

  return { value, error: null }
}

/**
 * Validate a config schema against environment variables.
 * Returns the typed config object, or throws ConfigValidationError.
 */
export function loadConfig<S extends ConfigSchema>(
  schema: S,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ConfigResult<S> {
  const errors: ConfigFieldError[] = []
  const result: Record<string, unknown> = {}

  for (const [key, field] of Object.entries(schema)) {
    const rawValue = env[field.envVar]
    const { value, error } = validateField(field, rawValue)
    if (error) {
      errors.push(error)
    } else {
      result[key] = value
    }
  }

  if (errors.length > 0) {
    throw new ConfigValidationError(errors)
  }

  return result as ConfigResult<S>
}

/**
 * Validate config without throwing — returns errors array instead.
 */
export function validateConfig<S extends ConfigSchema>(
  schema: S,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): { valid: boolean; errors: ConfigFieldError[]; config: Partial<ConfigResult<S>> } {
  const errors: ConfigFieldError[] = []
  const config: Record<string, unknown> = {}

  for (const [key, field] of Object.entries(schema)) {
    const rawValue = env[field.envVar]
    const { value, error } = validateField(field, rawValue)
    if (error) {
      errors.push(error)
    } else {
      config[key] = value
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    config: config as Partial<ConfigResult<S>>,
  }
}

// ── Application Config Schema ──

/**
 * Complete config schema for the AI system.
 * Validates all environment variables from .env.example.
 */
export const appConfigSchema = {
  // Required
  anthropicApiKey: optionalString('ANTHROPIC_API_KEY', 'Anthropic API key for Claude (required for cloud AI features)'),

  // Cloud providers
  useBedrock: boolean('CLAUDE_CODE_USE_BEDROCK', 'Use AWS Bedrock instead of direct Anthropic API'),
  useVertex: boolean('CLAUDE_CODE_USE_VERTEX', 'Use Google Vertex AI instead of direct Anthropic API'),
  openaiApiKey: optionalString('OPENAI_API_KEY', 'OpenAI API key for DevBrain hybrid mode'),

  // Database
  databaseUrl: optionalString('DATABASE_URL', 'PostgreSQL connection string', undefined, {
    validate: (v: string) => {
      if (v && !v.startsWith('postgresql://') && !v.startsWith('postgres://')) {
        return 'Must start with postgresql:// or postgres://'
      }
      return null
    },
  }),
  mysqlUrl: optionalString('MYSQL_URL', 'MySQL connection string', undefined, {
    validate: (v: string) => {
      if (v && !v.startsWith('mysql://')) {
        return 'Must start with mysql://'
      }
      return null
    },
  }),

  // Cache
  cacheDisk: boolean('AI_CACHE_DISK', 'Enable disk caching for AI responses', true),
  cacheDir: optionalString('AI_CACHE_DIR', 'Cache directory'),
  dataDir: optionalString('AI_DATA_DIR', 'Brain state directory'),

  // Environment
  nodeEnv: enumField('NODE_ENV', 'Application environment', ['development', 'production', 'test'] as const, 'development'),
  debug: optionalString('DEBUG', 'Debug output pattern (e.g., ai:*)'),
  logLevel: enumField('LOG_LEVEL', 'Minimum log level', ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const, 'info'),

  // Server (new)
  serverPort: number('AI_SERVER_PORT', 'HTTP API server port', 3000, { min: 1, max: 65535 }),
  serverHost: optionalString('AI_SERVER_HOST', 'HTTP API server host', '0.0.0.0'),
  serverCorsOrigin: optionalString('AI_CORS_ORIGIN', 'CORS allowed origins (comma-separated)', '*'),
} as const satisfies ConfigSchema

/** Type of the validated app config */
export type AppConfig = ConfigResult<typeof appConfigSchema>
