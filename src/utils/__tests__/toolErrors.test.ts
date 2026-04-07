import { describe, it, expect, vi } from 'vitest'

vi.mock('../messages.js', () => ({
  INTERRUPT_MESSAGE_FOR_TOOL_USE: 'Tool use was interrupted',
}))

// Mock the SDK dependency that errors.ts imports
vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import { AbortError, ShellError } from '../errors.js'
import { formatError, getErrorParts } from '../toolErrors.js'

describe('formatError', () => {
  describe('with AbortError', () => {
    it('returns the error message when present', () => {
      const err = new AbortError('User cancelled')
      expect(formatError(err)).toBe('User cancelled')
    })

    it('returns interrupt message when AbortError has no message', () => {
      const err = new AbortError()
      expect(formatError(err)).toBe('Tool use was interrupted')
    })
  })

  describe('with ShellError', () => {
    it('includes exit code, stderr, and stdout', () => {
      const err = new ShellError('out text', 'err text', 1, false)
      const result = formatError(err)
      expect(result).toContain('Exit code 1')
      expect(result).toContain('err text')
      expect(result).toContain('out text')
    })

    it('includes interrupt message when interrupted', () => {
      const err = new ShellError('', 'signal', 137, true)
      const result = formatError(err)
      expect(result).toContain('Exit code 137')
      expect(result).toContain('Tool use was interrupted')
    })
  })

  describe('with regular Error', () => {
    it('returns the error message', () => {
      const err = new Error('Something went wrong')
      expect(formatError(err)).toBe('Something went wrong')
    })
  })

  describe('with non-Error values', () => {
    it('returns String(value) for a string', () => {
      expect(formatError('raw string')).toBe('raw string')
    })

    it('returns String(value) for a number', () => {
      expect(formatError(42)).toBe('42')
    })

    it('returns String(value) for null', () => {
      expect(formatError(null)).toBe('null')
    })
  })

  describe('truncation', () => {
    it('truncates messages longer than 10000 characters', () => {
      const longMessage = 'x'.repeat(20000)
      const err = new Error(longMessage)
      const result = formatError(err)
      expect(result.length).toBeLessThan(20000)
      expect(result).toContain('characters truncated')
    })

    it('does not truncate messages at or below 10000 characters', () => {
      const message = 'y'.repeat(10000)
      const err = new Error(message)
      const result = formatError(err)
      expect(result).toBe(message)
      expect(result).not.toContain('truncated')
    })
  })
})

describe('getErrorParts', () => {
  it('returns ShellError parts with exit code, stderr, stdout', () => {
    const err = new ShellError('stdout here', 'stderr here', 2, false)
    const parts = getErrorParts(err)
    expect(parts).toContain('Exit code 2')
    expect(parts).toContain('stderr here')
    expect(parts).toContain('stdout here')
  })

  it('includes interrupt message for interrupted ShellError', () => {
    const err = new ShellError('', '', 130, true)
    const parts = getErrorParts(err)
    expect(parts).toContain('Tool use was interrupted')
  })

  it('returns empty string for non-interrupted ShellError interrupt field', () => {
    const err = new ShellError('out', 'err', 1, false)
    const parts = getErrorParts(err)
    expect(parts[1]).toBe('')
  })

  it('returns message for regular Error', () => {
    const err = new Error('basic error')
    const parts = getErrorParts(err)
    expect(parts).toEqual(['basic error'])
  })

  it('includes stderr and stdout from Error with extra properties', () => {
    const err = new Error('cmd failed') as Error & {
      stderr: string
      stdout: string
    }
    err.stderr = 'error output'
    err.stdout = 'standard output'
    const parts = getErrorParts(err)
    expect(parts).toContain('cmd failed')
    expect(parts).toContain('error output')
    expect(parts).toContain('standard output')
  })
})
