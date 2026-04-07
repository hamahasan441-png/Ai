import { describe, it, expect, vi } from 'vitest'

// Mock the transitive dep that pulls in unavailable packages
vi.mock('../../../utils/shell/prefix.js', () => ({}))
vi.mock('../../../utils/bash/commands.js', () => ({
  splitCommand_DEPRECATED: (cmd: string) => {
    // Simple pipe/semicolon/&& splitting for test purposes
    return cmd.split(/\s*[|;&]+\s*/).filter(Boolean)
  },
}))

import { interpretCommandResult } from '../commandSemantics.js'

describe('interpretCommandResult', () => {
  describe('default semantics', () => {
    it('treats exit code 0 as success', () => {
      const result = interpretCommandResult('echo hello', 0, 'hello', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBeUndefined()
    })

    it('treats non-zero exit code as error', () => {
      const result = interpretCommandResult('echo hello', 1, '', 'fail')
      expect(result.isError).toBe(true)
      expect(result.message).toBe('Command failed with exit code 1')
    })

    it('treats exit code 127 as error', () => {
      const result = interpretCommandResult('nonexistent', 127, '', 'not found')
      expect(result.isError).toBe(true)
      expect(result.message).toBe('Command failed with exit code 127')
    })
  })

  describe('grep semantics', () => {
    it('treats exit code 0 as matches found', () => {
      const result = interpretCommandResult('grep pattern file', 0, 'match', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBeUndefined()
    })

    it('treats exit code 1 as no matches (not an error)', () => {
      const result = interpretCommandResult('grep pattern file', 1, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('No matches found')
    })

    it('treats exit code 2 as error', () => {
      const result = interpretCommandResult('grep pattern file', 2, '', 'error')
      expect(result.isError).toBe(true)
    })

    it('treats exit code 3 as error', () => {
      const result = interpretCommandResult('grep -r pattern .', 3, '', '')
      expect(result.isError).toBe(true)
    })
  })

  describe('rg (ripgrep) semantics', () => {
    it('treats exit code 0 as matches found', () => {
      const result = interpretCommandResult('rg pattern', 0, 'match', '')
      expect(result.isError).toBe(false)
    })

    it('treats exit code 1 as no matches (not an error)', () => {
      const result = interpretCommandResult('rg pattern', 1, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('No matches found')
    })

    it('treats exit code 2 as error', () => {
      const result = interpretCommandResult('rg pattern', 2, '', 'error')
      expect(result.isError).toBe(true)
    })
  })

  describe('find semantics', () => {
    it('treats exit code 0 as success', () => {
      const result = interpretCommandResult('find . -name "*.ts"', 0, 'file.ts', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBeUndefined()
    })

    it('treats exit code 1 as partial success (not an error)', () => {
      const result = interpretCommandResult('find / -name "*.ts"', 1, '', 'permission denied')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('Some directories were inaccessible')
    })

    it('treats exit code 2 as error', () => {
      const result = interpretCommandResult('find --bad-flag', 2, '', 'error')
      expect(result.isError).toBe(true)
    })
  })

  describe('diff semantics', () => {
    it('treats exit code 0 as no differences', () => {
      const result = interpretCommandResult('diff a.txt b.txt', 0, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBeUndefined()
    })

    it('treats exit code 1 as files differ (not an error)', () => {
      const result = interpretCommandResult('diff a.txt b.txt', 1, '< line', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('Files differ')
    })

    it('treats exit code 2 as error', () => {
      const result = interpretCommandResult('diff a.txt b.txt', 2, '', 'No such file')
      expect(result.isError).toBe(true)
    })
  })

  describe('test/[ semantics', () => {
    it('treats exit code 0 as condition true', () => {
      const result = interpretCommandResult('test -f file.txt', 0, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBeUndefined()
    })

    it('treats exit code 1 as condition false (not an error)', () => {
      const result = interpretCommandResult('test -f missing.txt', 1, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('Condition is false')
    })

    it('treats exit code 2 as error', () => {
      const result = interpretCommandResult('test', 2, '', 'error')
      expect(result.isError).toBe(true)
    })

    it('handles [ command with exit code 0', () => {
      const result = interpretCommandResult('[ -f file.txt ]', 0, '', '')
      expect(result.isError).toBe(false)
    })

    it('handles [ command with exit code 1 as condition false', () => {
      const result = interpretCommandResult('[ -f missing.txt ]', 1, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('Condition is false')
    })

    it('handles [ command with exit code 2 as error', () => {
      const result = interpretCommandResult('[ -f ]', 2, '', 'error')
      expect(result.isError).toBe(true)
    })
  })

  describe('piped commands', () => {
    it('uses the last command in a pipeline for semantics', () => {
      // cat | grep — exit code comes from grep
      const result = interpretCommandResult('cat file.txt | grep pattern', 1, '', '')
      expect(result.isError).toBe(false)
      expect(result.message).toBe('No matches found')
    })

    it('uses default semantics for unknown last command in pipe', () => {
      const result = interpretCommandResult('grep pattern | wc -l', 1, '', '')
      expect(result.isError).toBe(true)
    })
  })
})
