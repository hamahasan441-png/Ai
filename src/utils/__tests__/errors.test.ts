import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {
    constructor() {
      super('abort')
      this.name = 'APIUserAbortError'
    }
  },
}))

import {
  ClaudeError,
  MalformedCommandError,
  AbortError,
  isAbortError,
  ConfigParseError,
  ShellError,
  TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
  hasExactErrorMessage,
  toError,
  errorMessage,
  getErrnoCode,
  isENOENT,
  isFsInaccessible,
  shortErrorStack,
  classifyAxiosError,
  getErrnoPath,
} from '../errors.js'

import { APIUserAbortError } from '@anthropic-ai/sdk'

describe('error classes', () => {
  describe('ClaudeError', () => {
    it('sets name to constructor name', () => {
      const err = new ClaudeError('test')
      expect(err.name).toBe('ClaudeError')
      expect(err.message).toBe('test')
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('MalformedCommandError', () => {
    it('is an Error', () => {
      const err = new MalformedCommandError('bad')
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('bad')
    })
  })

  describe('AbortError', () => {
    it('has name AbortError', () => {
      const err = new AbortError('cancelled')
      expect(err.name).toBe('AbortError')
      expect(err.message).toBe('cancelled')
    })

    it('works without a message', () => {
      const err = new AbortError()
      expect(err.name).toBe('AbortError')
    })
  })

  describe('ConfigParseError', () => {
    it('stores filePath and defaultConfig', () => {
      const err = new ConfigParseError('parse fail', '/path/config.json', { key: 'val' })
      expect(err.name).toBe('ConfigParseError')
      expect(err.filePath).toBe('/path/config.json')
      expect(err.defaultConfig).toEqual({ key: 'val' })
      expect(err.message).toBe('parse fail')
    })
  })

  describe('ShellError', () => {
    it('stores stdout, stderr, code, interrupted', () => {
      const err = new ShellError('out', 'err', 1, false)
      expect(err.name).toBe('ShellError')
      expect(err.stdout).toBe('out')
      expect(err.stderr).toBe('err')
      expect(err.code).toBe(1)
      expect(err.interrupted).toBe(false)
    })
  })

  describe('TelemetrySafeError', () => {
    it('uses same message for both when single arg', () => {
      const err = new TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS('safe msg')
      expect(err.message).toBe('safe msg')
      expect(err.telemetryMessage).toBe('safe msg')
      expect(err.name).toBe('TelemetrySafeError')
    })

    it('uses separate messages when two args', () => {
      const err = new TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS('full msg', 'telemetry msg')
      expect(err.message).toBe('full msg')
      expect(err.telemetryMessage).toBe('telemetry msg')
    })
  })
})

describe('isAbortError', () => {
  it('returns true for AbortError', () => {
    expect(isAbortError(new AbortError())).toBe(true)
  })

  it('returns true for APIUserAbortError', () => {
    expect(isAbortError(new APIUserAbortError())).toBe(true)
  })

  it('returns true for Error with name AbortError', () => {
    const err = new Error('dom abort')
    err.name = 'AbortError'
    expect(isAbortError(err)).toBe(true)
  })

  it('returns false for regular errors', () => {
    expect(isAbortError(new Error('nope'))).toBe(false)
  })

  it('returns false for non-error values', () => {
    expect(isAbortError(null)).toBe(false)
    expect(isAbortError('AbortError')).toBe(false)
    expect(isAbortError(undefined)).toBe(false)
  })
})

describe('hasExactErrorMessage', () => {
  it('returns true for exact match', () => {
    expect(hasExactErrorMessage(new Error('exact'), 'exact')).toBe(true)
  })

  it('returns false for partial match', () => {
    expect(hasExactErrorMessage(new Error('exact match'), 'exact')).toBe(false)
  })

  it('returns false for non-Error', () => {
    expect(hasExactErrorMessage('string', 'string')).toBe(false)
  })
})

describe('toError', () => {
  it('returns Error instances as-is', () => {
    const err = new Error('test')
    expect(toError(err)).toBe(err)
  })

  it('wraps strings in an Error', () => {
    const result = toError('string error')
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('string error')
  })

  it('wraps numbers in an Error', () => {
    expect(toError(42).message).toBe('42')
  })
})

describe('errorMessage', () => {
  it('extracts message from Error', () => {
    expect(errorMessage(new Error('hello'))).toBe('hello')
  })

  it('converts non-Error values to string', () => {
    expect(errorMessage(42)).toBe('42')
    expect(errorMessage(null)).toBe('null')
    expect(errorMessage(undefined)).toBe('undefined')
  })
})

describe('getErrnoCode', () => {
  it('extracts code from ErrnoException-like object', () => {
    const e = Object.assign(new Error('fail'), { code: 'ENOENT' })
    expect(getErrnoCode(e)).toBe('ENOENT')
  })

  it('returns undefined for errors without code', () => {
    expect(getErrnoCode(new Error('no code'))).toBeUndefined()
  })

  it('returns undefined for non-objects', () => {
    expect(getErrnoCode(null)).toBeUndefined()
    expect(getErrnoCode('string')).toBeUndefined()
  })
})

describe('getErrnoPath', () => {
  it('extracts path from ErrnoException-like object', () => {
    const e = Object.assign(new Error('fail'), { path: '/some/path' })
    expect(getErrnoPath(e)).toBe('/some/path')
  })

  it('returns undefined when no path', () => {
    expect(getErrnoPath(new Error('no path'))).toBeUndefined()
  })
})

describe('isENOENT', () => {
  it('returns true for ENOENT errors', () => {
    const e = Object.assign(new Error(), { code: 'ENOENT' })
    expect(isENOENT(e)).toBe(true)
  })

  it('returns false for other errno codes', () => {
    const e = Object.assign(new Error(), { code: 'EACCES' })
    expect(isENOENT(e)).toBe(false)
  })

  it('returns false for non-errors', () => {
    expect(isENOENT(null)).toBe(false)
  })
})

describe('isFsInaccessible', () => {
  it.each(['ENOENT', 'EACCES', 'EPERM', 'ENOTDIR', 'ELOOP'])(
    'returns true for %s',
    (code) => {
      const e = Object.assign(new Error(), { code })
      expect(isFsInaccessible(e)).toBe(true)
    },
  )

  it('returns false for other codes', () => {
    const e = Object.assign(new Error(), { code: 'EMFILE' })
    expect(isFsInaccessible(e)).toBe(false)
  })

  it('returns false for errors without code', () => {
    expect(isFsInaccessible(new Error())).toBe(false)
  })
})

describe('shortErrorStack', () => {
  it('returns the string itself for non-Error values', () => {
    expect(shortErrorStack('just a string')).toBe('just a string')
  })

  it('returns message when no stack', () => {
    const err = new Error('msg')
    err.stack = undefined
    expect(shortErrorStack(err)).toBe('msg')
  })

  it('truncates stack to maxFrames', () => {
    const err = new Error('test')
    // Build a fake stack with many frames
    err.stack = [
      'Error: test',
      '    at frame1 (file.ts:1)',
      '    at frame2 (file.ts:2)',
      '    at frame3 (file.ts:3)',
      '    at frame4 (file.ts:4)',
      '    at frame5 (file.ts:5)',
      '    at frame6 (file.ts:6)',
      '    at frame7 (file.ts:7)',
    ].join('\n')

    const result = shortErrorStack(err, 3)
    const lines = result.split('\n')
    // header + 3 frames = 4 lines
    expect(lines).toHaveLength(4)
    expect(lines[0]).toBe('Error: test')
  })

  it('returns full stack when frames <= maxFrames', () => {
    const err = new Error('short')
    // Stack has few frames
    err.stack = 'Error: short\n    at one (a.ts:1)\n    at two (b.ts:2)'
    expect(shortErrorStack(err, 5)).toBe(err.stack)
  })
})

describe('classifyAxiosError', () => {
  it('returns "other" for non-axios errors', () => {
    const result = classifyAxiosError(new Error('generic'))
    expect(result.kind).toBe('other')
    expect(result.message).toBe('generic')
  })

  it('returns "other" for null', () => {
    expect(classifyAxiosError(null).kind).toBe('other')
  })

  it('returns "auth" for 401', () => {
    const e = { isAxiosError: true, message: 'Unauthorized', response: { status: 401 } }
    const result = classifyAxiosError(e)
    expect(result.kind).toBe('auth')
    expect(result.status).toBe(401)
  })

  it('returns "auth" for 403', () => {
    const e = { isAxiosError: true, message: 'Forbidden', response: { status: 403 } }
    expect(classifyAxiosError(e).kind).toBe('auth')
  })

  it('returns "timeout" for ECONNABORTED', () => {
    const e = { isAxiosError: true, message: 'timeout', code: 'ECONNABORTED' }
    const result = classifyAxiosError(e)
    expect(result.kind).toBe('timeout')
  })

  it('returns "network" for ECONNREFUSED', () => {
    const e = { isAxiosError: true, message: 'refused', code: 'ECONNREFUSED' }
    expect(classifyAxiosError(e).kind).toBe('network')
  })

  it('returns "network" for ENOTFOUND', () => {
    const e = { isAxiosError: true, message: 'not found', code: 'ENOTFOUND' }
    expect(classifyAxiosError(e).kind).toBe('network')
  })

  it('returns "http" for other axios errors with status', () => {
    const e = { isAxiosError: true, message: 'Server Error', response: { status: 500 } }
    const result = classifyAxiosError(e)
    expect(result.kind).toBe('http')
    expect(result.status).toBe(500)
  })

  it('returns "http" for axios error without status or code', () => {
    const e = { isAxiosError: true, message: 'unknown' }
    expect(classifyAxiosError(e).kind).toBe('http')
  })
})
