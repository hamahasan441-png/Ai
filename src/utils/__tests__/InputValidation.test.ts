import { describe, it, expect } from 'vitest'
import {
  ValidationError,
  isNonEmptyString,
  maxLength,
  numberInRange,
  oneOf,
  matchesPattern,
  detectSqlInjection,
  detectCommandInjection,
  detectPathTraversal,
  compose,
  validateSchema,
  validateToolInput,
  type ObjectSchema,
} from '../../utils/inputValidation.js'

describe('InputValidation', () => {
  describe('ValidationError', () => {
    it('creates error with field and rule', () => {
      const err = new ValidationError('test error', 'required', 'username')
      expect(err.message).toBe('test error')
      expect(err.field).toBe('username')
      expect(err.rule).toBe('required')
      expect(err.name).toBe('ValidationError')
    })
  })

  describe('isNonEmptyString', () => {
    it('passes for non-empty strings', () => {
      expect(isNonEmptyString('hello').valid).toBe(true)
    })

    it('fails for empty string', () => {
      expect(isNonEmptyString('').valid).toBe(false)
    })

    it('fails for whitespace-only string', () => {
      expect(isNonEmptyString('   ').valid).toBe(false)
    })

    it('fails for non-string types', () => {
      expect(isNonEmptyString(123).valid).toBe(false)
      expect(isNonEmptyString(null).valid).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('passes for strings within limit', () => {
      expect(maxLength(10)('hello').valid).toBe(true)
    })

    it('fails for strings exceeding limit', () => {
      const result = maxLength(3)('toolong')
      expect(result.valid).toBe(false)
      expect(result.errors[0]?.rule).toBe('max_length')
    })
  })

  describe('numberInRange', () => {
    it('passes for numbers within range', () => {
      expect(numberInRange(0, 100)(50).valid).toBe(true)
    })

    it('passes for boundary values', () => {
      expect(numberInRange(0, 100)(0).valid).toBe(true)
      expect(numberInRange(0, 100)(100).valid).toBe(true)
    })

    it('fails for out-of-range numbers', () => {
      expect(numberInRange(0, 100)(-1).valid).toBe(false)
      expect(numberInRange(0, 100)(101).valid).toBe(false)
    })

    it('fails for NaN', () => {
      expect(numberInRange(0, 100)(NaN).valid).toBe(false)
    })
  })

  describe('oneOf', () => {
    it('passes for allowed values', () => {
      expect(oneOf(['a', 'b', 'c'])('b').valid).toBe(true)
    })

    it('fails for disallowed values', () => {
      expect(oneOf(['a', 'b', 'c'])('d').valid).toBe(false)
    })
  })

  describe('matchesPattern', () => {
    it('passes for matching strings', () => {
      expect(matchesPattern(/^[a-z]+$/, 'lowercase')('hello').valid).toBe(true)
    })

    it('fails for non-matching strings', () => {
      expect(matchesPattern(/^[a-z]+$/, 'lowercase')('Hello').valid).toBe(false)
    })
  })

  describe('detectSqlInjection', () => {
    it('passes safe SQL queries', () => {
      expect(detectSqlInjection('SELECT * FROM users WHERE id = 1').valid).toBe(true)
    })

    it('detects UNION-based injection', () => {
      expect(detectSqlInjection("' UNION SELECT * FROM passwords").valid).toBe(false)
    })

    it('detects DROP TABLE injection', () => {
      expect(detectSqlInjection('1; DROP TABLE users').valid).toBe(false)
    })

    it('detects comment-based bypass', () => {
      expect(detectSqlInjection("admin'-- ").valid).toBe(false)
    })

    it('detects tautology attack', () => {
      expect(detectSqlInjection("' OR '1'='1").valid).toBe(false)
    })

    it('detects WAITFOR DELAY (time-based)', () => {
      expect(detectSqlInjection("'; WAITFOR DELAY '0:0:5'").valid).toBe(false)
    })

    it('detects SLEEP injection', () => {
      expect(detectSqlInjection("' OR SLEEP(5)").valid).toBe(false)
    })

    it('detects BENCHMARK injection', () => {
      expect(detectSqlInjection("1 OR BENCHMARK(1000000,SHA1('test'))").valid).toBe(false)
    })
  })

  describe('detectCommandInjection', () => {
    it('passes safe commands', () => {
      expect(detectCommandInjection('ls -la /home/user').valid).toBe(true)
    })

    it('detects semicolon chaining', () => {
      expect(detectCommandInjection('ls; rm -rf /').valid).toBe(false)
    })

    it('detects pipe injection', () => {
      expect(detectCommandInjection('cat file | malicious').valid).toBe(false)
    })

    it('detects backtick execution', () => {
      expect(detectCommandInjection('echo `whoami`').valid).toBe(false)
    })

    it('detects command substitution', () => {
      expect(detectCommandInjection('echo $(whoami)').valid).toBe(false)
    })

    it('detects variable expansion', () => {
      expect(detectCommandInjection('echo ${PATH}').valid).toBe(false)
    })

    it('detects dangerous commands', () => {
      expect(detectCommandInjection('rm -rf /').valid).toBe(false)
    })
  })

  describe('detectPathTraversal', () => {
    it('passes safe paths', () => {
      expect(detectPathTraversal('/home/user/file.txt').valid).toBe(true)
    })

    it('detects ../ traversal', () => {
      expect(detectPathTraversal('../../../etc/passwd').valid).toBe(false)
    })

    it('detects null byte injection', () => {
      expect(detectPathTraversal('file.txt\0.jpg').valid).toBe(false)
    })

    it('detects /etc/ access', () => {
      expect(detectPathTraversal('/etc/shadow').valid).toBe(false)
    })

    it('detects /proc/ access', () => {
      expect(detectPathTraversal('/proc/self/environ').valid).toBe(false)
    })
  })

  describe('compose', () => {
    it('passes when all validators pass', () => {
      const validator = compose(isNonEmptyString, maxLength(100) as never)
      expect(validator('hello').valid).toBe(true)
    })

    it('collects errors from multiple validators', () => {
      const validator = compose(
        () => ({ valid: false, errors: [new ValidationError('err1', 'r1')] }),
        () => ({ valid: false, errors: [new ValidationError('err2', 'r2')] }),
      )
      const result = validator('test')
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
    })
  })

  describe('validateSchema', () => {
    it('validates required fields', () => {
      const schema: ObjectSchema = {
        name: { type: 'string', required: true },
      }
      const result = validateSchema({}, schema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]?.rule).toBe('required')
    })

    it('validates field types', () => {
      const schema: ObjectSchema = {
        count: { type: 'number', required: true },
      }
      const result = validateSchema({ count: 'not a number' }, schema)
      expect(result.valid).toBe(false)
      expect(result.errors[0]?.rule).toBe('type')
    })

    it('passes valid objects', () => {
      const schema: ObjectSchema = {
        name: { type: 'string', required: true },
        age: { type: 'number', required: false },
      }
      const result = validateSchema({ name: 'Alice', age: 30 }, schema)
      expect(result.valid).toBe(true)
    })

    it('skips optional missing fields', () => {
      const schema: ObjectSchema = {
        name: { type: 'string', required: true },
        bio: { type: 'string', required: false },
      }
      const result = validateSchema({ name: 'Alice' }, schema)
      expect(result.valid).toBe(true)
    })

    it('runs field validators', () => {
      const schema: ObjectSchema = {
        query: { type: 'string', required: true, validators: [detectSqlInjection] },
      }
      const result = validateSchema({ query: "'; DROP TABLE users" }, schema)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateToolInput', () => {
    it('returns valid for unknown tools (gradual adoption)', () => {
      const result = validateToolInput('unknown_tool', { foo: 'bar' })
      expect(result.valid).toBe(true)
    })

    it('validates database tool inputs', () => {
      const result = validateToolInput('database', {
        command: 'query',
        connection_string: 'sqlite:///test.db',
        sql: 'SELECT * FROM users',
      })
      expect(result.valid).toBe(true)
    })

    it('rejects invalid database commands', () => {
      const result = validateToolInput('database', {
        command: 'execute',
        connection_string: 'sqlite:///test.db',
      })
      expect(result.valid).toBe(false)
    })

    it('detects SQL injection in database tool', () => {
      const result = validateToolInput('database', {
        command: 'query',
        connection_string: 'sqlite:///test.db',
        sql: "'; DROP TABLE users; --",
      })
      expect(result.valid).toBe(false)
    })

    it('detects path traversal in file_read tool', () => {
      const result = validateToolInput('file_read', {
        path: '../../../etc/passwd',
      })
      expect(result.valid).toBe(false)
    })

    it('validates file_write inputs', () => {
      const result = validateToolInput('file_write', {
        path: '/home/user/file.txt',
        content: 'Hello world',
      })
      expect(result.valid).toBe(true)
    })
  })
})
