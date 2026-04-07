/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Input Validation Framework                                                   ║
 * ║                                                                              ║
 * ║  Unified validation layer for tool inputs, API parameters, and user data.    ║
 * ║  Prevents injection attacks (SQL, command, path traversal) and enforces      ║
 * ║  type safety at runtime boundaries.                                          ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║    • Schema-based validation (type-safe, composable)                         ║
 * ║    • SQL injection detection and prevention                                  ║
 * ║    • Command injection detection and prevention                              ║
 * ║    • Path traversal prevention                                               ║
 * ║    • Size/length limits                                                      ║
 * ║    • Middleware pattern for tool execution pipeline                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { AiError, AiErrorCode } from './errors.js'

// ── Validation Error ──

export class ValidationError extends AiError {
  readonly field?: string
  readonly rule: string

  constructor(message: string, rule: string, field?: string, context?: Record<string, unknown>) {
    super(message, AiErrorCode.INVALID_INPUT, { ...context, field, rule })
    this.name = 'ValidationError'
    this.field = field
    this.rule = rule
  }
}

// ── Validation Result ──

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// ── Validator Types ──

export type ValidatorFn<T = unknown> = (value: T, field?: string) => ValidationResult

// ── Core Validators ──

/**
 * Validate that a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown, field?: string): ValidationResult {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return {
      valid: false,
      errors: [new ValidationError(`${field ?? 'Value'} must be a non-empty string`, 'non_empty_string', field)],
    }
  }
  return { valid: true, errors: [] }
}

/**
 * Validate that a string does not exceed a maximum length.
 */
export function maxLength(max: number): ValidatorFn<string> {
  return (value: string, field?: string): ValidationResult => {
    if (value.length > max) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} exceeds maximum length of ${max} (got ${value.length})`,
            'max_length',
            field,
            { max, actual: value.length },
          ),
        ],
      }
    }
    return { valid: true, errors: [] }
  }
}

/**
 * Validate that a number is within a range.
 */
export function numberInRange(min: number, max: number): ValidatorFn<number> {
  return (value: number, field?: string): ValidationResult => {
    if (typeof value !== 'number' || isNaN(value) || value < min || value > max) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} must be a number between ${min} and ${max}`,
            'number_range',
            field,
            { min, max, actual: value },
          ),
        ],
      }
    }
    return { valid: true, errors: [] }
  }
}

/**
 * Validate that a value is one of allowed options.
 */
export function oneOf<T>(allowed: T[]): ValidatorFn<T> {
  return (value: T, field?: string): ValidationResult => {
    if (!allowed.includes(value)) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} must be one of: ${allowed.join(', ')}`,
            'one_of',
            field,
            { allowed, actual: value },
          ),
        ],
      }
    }
    return { valid: true, errors: [] }
  }
}

/**
 * Validate that a string matches a regex pattern.
 */
export function matchesPattern(pattern: RegExp, description: string): ValidatorFn<string> {
  return (value: string, field?: string): ValidationResult => {
    if (!pattern.test(value)) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} must match pattern: ${description}`,
            'pattern',
            field,
            { pattern: pattern.source, description },
          ),
        ],
      }
    }
    return { valid: true, errors: [] }
  }
}

// ── Security Validators ──

/**
 * SQL injection detection patterns.
 * Detects common SQL injection techniques including:
 * - UNION-based injection
 * - Boolean-based blind injection
 * - Stacked queries (semicolons)
 * - Comment-based bypass
 * - Tautology attacks (1=1, 'a'='a')
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(UNION|union)\b\s+(ALL\s+)?SELECT)/i,
  /(\b(DROP|ALTER|CREATE|TRUNCATE|DELETE|INSERT|UPDATE)\b\s+\b(TABLE|DATABASE|INDEX)\b)/i,
  /(\b(OR|AND)\b\s+['"]\w*['"]\s*=\s*['"]\w*['"])/i,
  /(;\s*(DROP|ALTER|CREATE|TRUNCATE|DELETE|INSERT|UPDATE)\b)/i,
  /(--\s|#\s|\/\*)/,
  /(\bEXEC\b\s*\(|\bEXECUTE\b\s+)/i,
  /(\bxp_\w+)/i,
  /('\s*(OR|AND)\s+('|1\s*=\s*1|true))/i,
  /(CHAR\(\d+\))/i,
  /(\bWAITFOR\b\s+\bDELAY\b)/i,
  /(\bBENCHMARK\b\s*\()/i,
  /(\bSLEEP\b\s*\()/i,
  /(\bLOAD_FILE\b\s*\()/i,
  /(\bINTO\s+(OUT|DUMP)FILE\b)/i,
]

/**
 * Detect potential SQL injection in a string.
 */
export function detectSqlInjection(value: string, field?: string): ValidationResult {
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(value)) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} contains potential SQL injection pattern`,
            'sql_injection',
            field,
          ),
        ],
      }
    }
  }
  return { valid: true, errors: [] }
}

/**
 * Command injection detection patterns.
 * Detects common shell injection techniques including:
 * - Command chaining (&&, ||, ;, |)
 * - Backtick execution
 * - Command substitution $()
 * - Redirect operators (>, >>)
 * - Common dangerous commands
 */
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`]/, // Command chaining and backticks
  /\$\(/, // Command substitution
  /\$\{[^}]*\}/, // Variable expansion
  />\s*\//, // Redirect to absolute path
  /\b(rm\s+-rf|chmod\s+777|curl\s+.*\|\s*sh|wget\s+.*\|\s*sh)\b/i,
  /\b(eval|exec)\s*\(/i,
]

/**
 * Detect potential command injection in a string.
 */
export function detectCommandInjection(value: string, field?: string): ValidationResult {
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(value)) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} contains potential command injection pattern`,
            'command_injection',
            field,
          ),
        ],
      }
    }
  }
  return { valid: true, errors: [] }
}

/**
 * Path traversal detection.
 * Prevents accessing files outside allowed directories.
 */
export function detectPathTraversal(value: string, field?: string): ValidationResult {
  const dangerous = [
    /\.\.\//,        // Relative path traversal
    /\.\.\\/,        // Windows path traversal
    /~\//,           // Home directory expansion
    /^\/etc\//,      // System config directory
    /^\/proc\//,     // Process info
    /^\/sys\//,      // System directory
    /\0/,            // Null byte injection
  ]

  for (const pattern of dangerous) {
    if (pattern.test(value)) {
      return {
        valid: false,
        errors: [
          new ValidationError(
            `${field ?? 'Value'} contains potential path traversal`,
            'path_traversal',
            field,
          ),
        ],
      }
    }
  }
  return { valid: true, errors: [] }
}

// ── Composition ──

/**
 * Compose multiple validators into a single validator.
 * Returns combined errors from all failing validators.
 *
 * @example
 * ```ts
 * const validateQuery = compose(
 *   isNonEmptyString,
 *   maxLength(10000),
 *   detectSqlInjection,
 * )
 * const result = validateQuery(userInput, 'sql_query')
 * ```
 */
export function compose(...validators: ValidatorFn[]): ValidatorFn {
  return (value: unknown, field?: string): ValidationResult => {
    const errors: ValidationError[] = []
    for (const validator of validators) {
      const result = validator(value, field)
      if (!result.valid) {
        errors.push(...result.errors)
      }
    }
    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// ── Schema-Based Validation ──

export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array'

export interface FieldSchema {
  type: FieldType
  required?: boolean
  validators?: ValidatorFn[]
}

export type ObjectSchema = Record<string, FieldSchema>

/**
 * Validate an object against a schema definition.
 *
 * @example
 * ```ts
 * const schema: ObjectSchema = {
 *   command: { type: 'string', required: true, validators: [maxLength(1000)] },
 *   timeout: { type: 'number', required: false, validators: [numberInRange(0, 300000)] },
 * }
 * const result = validateSchema({ command: 'ls', timeout: 5000 }, schema)
 * ```
 */
export function validateSchema(data: Record<string, unknown>, schema: ObjectSchema): ValidationResult {
  const errors: ValidationError[] = []

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = data[fieldName]

    // Check required
    if (fieldSchema.required && (value === undefined || value === null)) {
      errors.push(
        new ValidationError(`${fieldName} is required`, 'required', fieldName),
      )
      continue
    }

    // Skip optional missing values
    if (value === undefined || value === null) continue

    // Type check
    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== fieldSchema.type) {
      errors.push(
        new ValidationError(
          `${fieldName} must be of type ${fieldSchema.type} (got ${actualType})`,
          'type',
          fieldName,
          { expected: fieldSchema.type, actual: actualType },
        ),
      )
      continue
    }

    // Run field validators
    if (fieldSchema.validators) {
      for (const validator of fieldSchema.validators) {
        const result = validator(value, fieldName)
        if (!result.valid) {
          errors.push(...result.errors)
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ── Tool Input Validation Middleware ──

/**
 * Tool input validation schemas for high-risk tools.
 * These schemas are applied before tool execution to prevent
 * injection attacks and enforce input constraints.
 */
export const TOOL_SCHEMAS: Record<string, ObjectSchema> = {
  database: {
    command: {
      type: 'string',
      required: true,
      validators: [oneOf(['query', 'tables', 'schema', 'describe']) as ValidatorFn],
    },
    connection_string: {
      type: 'string',
      required: true,
      validators: [maxLength(1000) as ValidatorFn],
    },
    sql: {
      type: 'string',
      required: false,
      validators: [maxLength(50000) as ValidatorFn, detectSqlInjection],
    },
  },
  file_write: {
    path: {
      type: 'string',
      required: true,
      validators: [maxLength(4096) as ValidatorFn, detectPathTraversal],
    },
    content: {
      type: 'string',
      required: true,
      validators: [maxLength(10_000_000) as ValidatorFn], // 10MB max
    },
  },
  file_read: {
    path: {
      type: 'string',
      required: true,
      validators: [maxLength(4096) as ValidatorFn, detectPathTraversal],
    },
  },
}

/**
 * Validate tool input against its schema.
 * Returns validation result with any errors found.
 *
 * @example
 * ```ts
 * const result = validateToolInput('database', { command: 'query', sql: userInput })
 * if (!result.valid) {
 *   throw result.errors[0]
 * }
 * ```
 */
export function validateToolInput(toolName: string, input: Record<string, unknown>): ValidationResult {
  const schema = TOOL_SCHEMAS[toolName]
  if (!schema) {
    // No schema defined = pass through (gradual adoption)
    return { valid: true, errors: [] }
  }
  return validateSchema(input, schema)
}
