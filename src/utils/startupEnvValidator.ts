/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Startup Environment Validator                                                ║
 * ║                                                                              ║
 * ║  Validates environment variables at startup to catch configuration errors    ║
 * ║  early with clear, actionable error messages.                                ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║    • Required vs optional variable validation                                ║
 * ║    • Type coercion and format validation (URL, number, boolean, enum)        ║
 * ║    • Grouped validation with all errors reported at once                     ║
 * ║    • Feature availability warnings for missing optional vars                 ║
 * ║    • Sensitive value masking in logs                                         ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    import { validateStartupEnv, ENV_SCHEMA } from './utils/startupEnvValidator.js'
 * ║    const result = validateStartupEnv()                                       ║
 * ║    if (!result.valid) process.exit(1)                                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ──

export type EnvVarType = 'string' | 'number' | 'boolean' | 'url' | 'enum'

export interface EnvVarSchema {
  /** Environment variable name */
  name: string
  /** Whether the variable is required for the app to function */
  required: boolean
  /** Expected type for validation */
  type: EnvVarType
  /** Human-readable description */
  description: string
  /** Default value if not set */
  defaultValue?: string
  /** Allowed values for enum type */
  enumValues?: string[]
  /** Feature that becomes unavailable without this var */
  featureIfMissing?: string
  /** Whether the value is sensitive (masked in logs) */
  sensitive?: boolean
}

export interface StartupEnvError {
  variable: string
  message: string
  severity: 'error' | 'warning'
}

export interface StartupEnvResult {
  valid: boolean
  errors: StartupEnvError[]
  warnings: StartupEnvError[]
  summary: string
}

// ── Schema ──

export const ENV_SCHEMA: EnvVarSchema[] = [
  // Authentication (at least one AI provider should be configured)
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    type: 'string',
    description: 'Anthropic API key for Claude',
    featureIfMissing: 'Cloud AI (Claude API calls)',
    sensitive: true,
  },
  {
    name: 'CLAUDE_CODE_USE_BEDROCK',
    required: false,
    type: 'boolean',
    description: 'Use AWS Bedrock instead of direct Anthropic API',
    featureIfMissing: 'AWS Bedrock provider',
  },
  {
    name: 'CLAUDE_CODE_USE_VERTEX',
    required: false,
    type: 'boolean',
    description: 'Use Google Vertex AI instead of direct Anthropic API',
    featureIfMissing: 'Google Vertex AI provider',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    type: 'string',
    description: 'OpenAI API key for hybrid mode',
    featureIfMissing: 'DevBrain hybrid mode (OpenAI)',
    sensitive: true,
  },

  // Database connections
  {
    name: 'DATABASE_URL',
    required: false,
    type: 'url',
    description: 'PostgreSQL connection string for DatabaseTool',
    featureIfMissing: 'PostgreSQL database queries',
    sensitive: true,
  },
  {
    name: 'MYSQL_URL',
    required: false,
    type: 'url',
    description: 'MySQL connection string for DatabaseTool',
    featureIfMissing: 'MySQL database queries',
    sensitive: true,
  },

  // Feature flags
  {
    name: 'AI_CACHE_DISK',
    required: false,
    type: 'boolean',
    description: 'Enable disk caching for AI responses',
    defaultValue: 'true',
  },
  {
    name: 'AI_CACHE_DIR',
    required: false,
    type: 'string',
    description: 'Cache directory path',
    defaultValue: '~/.cache/ai',
  },
  {
    name: 'AI_DATA_DIR',
    required: false,
    type: 'string',
    description: 'Brain state directory path',
    defaultValue: '~/.local/share/ai',
  },

  // Development
  {
    name: 'NODE_ENV',
    required: false,
    type: 'enum',
    description: 'Node environment',
    enumValues: ['development', 'production', 'test'],
    defaultValue: 'development',
  },
  {
    name: 'LOG_LEVEL',
    required: false,
    type: 'enum',
    description: 'Logging verbosity',
    enumValues: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    defaultValue: 'info',
  },
]

// ── Validators ──

/** Checks if value looks like a valid connection URL */
function isValidUrl(value: string): boolean {
  const protocols = [
    'http://',
    'https://',
    'postgresql://',
    'postgres://',
    'mysql://',
    'sqlite:///',
  ]
  return protocols.some((p) => value.startsWith(p))
}

/** Checks if value is a valid boolean string */
function isValidBoolean(value: string): boolean {
  return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())
}

/** Checks if value is a valid number */
function isValidNumber(value: string): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num)
}

/** Validates a single env var against its schema */
function validateSingleVar(
  schema: EnvVarSchema,
  value: string | undefined,
): StartupEnvError | null {
  if (schema.required && (value === undefined || value === '')) {
    return {
      variable: schema.name,
      message: `Required variable ${schema.name} is not set. ${schema.description}.`,
      severity: 'error',
    }
  }

  if (value === undefined || value === '') {
    return null
  }

  switch (schema.type) {
    case 'url':
      if (!isValidUrl(value)) {
        return {
          variable: schema.name,
          message: `${schema.name} has invalid URL format. Expected a valid connection string (http://, https://, postgresql://, mysql://, sqlite:///).`,
          severity: 'error',
        }
      }
      break

    case 'boolean':
      if (!isValidBoolean(value)) {
        return {
          variable: schema.name,
          message: `${schema.name} has invalid boolean value "${value}". Expected: true, false, 1, 0, yes, no.`,
          severity: 'error',
        }
      }
      break

    case 'number':
      if (!isValidNumber(value)) {
        return {
          variable: schema.name,
          message: `${schema.name} has invalid number value "${value}". Expected a valid number.`,
          severity: 'error',
        }
      }
      break

    case 'enum':
      if (schema.enumValues && !schema.enumValues.includes(value)) {
        return {
          variable: schema.name,
          message: `${schema.name} has invalid value "${value}". Expected one of: ${schema.enumValues.join(', ')}.`,
          severity: 'warning',
        }
      }
      break

    case 'string':
      break
  }

  return null
}

// ── Main Validation ──

/**
 * Validates all environment variables against the schema.
 * Returns a result with errors, warnings, and a human-readable summary.
 *
 * @param env - Environment variables to validate (defaults to process.env)
 * @param schema - Schema to validate against (defaults to ENV_SCHEMA)
 */
export function validateStartupEnv(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
  schema: EnvVarSchema[] = ENV_SCHEMA,
): StartupEnvResult {
  const errors: StartupEnvError[] = []
  const warnings: StartupEnvError[] = []

  for (const varSchema of schema) {
    const value = env[varSchema.name]
    const error = validateSingleVar(varSchema, value)

    if (error) {
      if (error.severity === 'error') {
        errors.push(error)
      } else {
        warnings.push(error)
      }
    } else if (!value && varSchema.featureIfMissing) {
      warnings.push({
        variable: varSchema.name,
        message: `${varSchema.name} is not set. Feature unavailable: ${varSchema.featureIfMissing}.`,
        severity: 'warning',
      })
    }
  }

  // Cross-field validation: at least one AI provider should be configured
  const hasAnthropicKey = !!env['ANTHROPIC_API_KEY']
  const hasBedrock =
    env['CLAUDE_CODE_USE_BEDROCK'] === '1' || env['CLAUDE_CODE_USE_BEDROCK'] === 'true'
  const hasVertex =
    env['CLAUDE_CODE_USE_VERTEX'] === '1' || env['CLAUDE_CODE_USE_VERTEX'] === 'true'

  if (!hasAnthropicKey && !hasBedrock && !hasVertex) {
    warnings.push({
      variable: 'ANTHROPIC_API_KEY',
      message:
        'No AI provider configured. Set ANTHROPIC_API_KEY, CLAUDE_CODE_USE_BEDROCK=1, or CLAUDE_CODE_USE_VERTEX=1 for cloud AI features.',
      severity: 'warning',
    })
  }

  const valid = errors.length === 0
  const summary = buildSummary(errors, warnings)

  return { valid, errors, warnings, summary }
}

/** Builds a human-readable summary of validation results */
function buildSummary(errors: StartupEnvError[], warnings: StartupEnvError[]): string {
  const lines: string[] = []

  if (errors.length === 0 && warnings.length === 0) {
    lines.push('Environment validation passed. All variables are correctly configured.')
    return lines.join('\n')
  }

  if (errors.length > 0) {
    lines.push(`${errors.length} environment error(s):`)
    for (const err of errors) {
      lines.push(`  - ${err.message}`)
    }
  }

  if (warnings.length > 0) {
    lines.push(`${warnings.length} environment warning(s):`)
    for (const warn of warnings) {
      lines.push(`  - ${warn.message}`)
    }
  }

  return lines.join('\n')
}

/**
 * Masks sensitive values for safe logging.
 *
 * @param value - The value to mask
 * @param visibleChars - Number of characters to show at start (default: 4)
 */
export function maskSensitiveValue(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return '****'
  }
  return value.substring(0, visibleChars) + '****'
}

/**
 * Returns a safe-to-log snapshot of current environment configuration.
 * Sensitive values are masked.
 */
export function getEnvSnapshot(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
  schema: EnvVarSchema[] = ENV_SCHEMA,
): Record<string, string> {
  const snapshot: Record<string, string> = {}

  for (const varSchema of schema) {
    const value = env[varSchema.name]
    if (value !== undefined && value !== '') {
      snapshot[varSchema.name] = varSchema.sensitive ? maskSensitiveValue(value) : value
    } else if (varSchema.defaultValue) {
      snapshot[varSchema.name] = `(default: ${varSchema.defaultValue})`
    } else {
      snapshot[varSchema.name] = '(not set)'
    }
  }

  return snapshot
}
