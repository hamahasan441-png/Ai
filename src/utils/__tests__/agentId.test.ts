import { describe, it, expect, vi } from 'vitest'
import { formatAgentId, parseAgentId, generateRequestId, parseRequestId } from '../../utils/agentId'

describe('formatAgentId', () => {
  it('formats agent name and team name with @ separator', () => {
    expect(formatAgentId('researcher', 'my-project')).toBe('researcher@my-project')
  })

  it('handles empty agent name', () => {
    expect(formatAgentId('', 'team')).toBe('@team')
  })

  it('handles empty team name', () => {
    expect(formatAgentId('agent', '')).toBe('agent@')
  })

  it('handles both empty', () => {
    expect(formatAgentId('', '')).toBe('@')
  })

  it('preserves special characters in names', () => {
    expect(formatAgentId('team-lead', 'my-project')).toBe('team-lead@my-project')
  })
})

describe('parseAgentId', () => {
  it('parses valid agent ID', () => {
    expect(parseAgentId('researcher@my-project')).toEqual({
      agentName: 'researcher',
      teamName: 'my-project',
    })
  })

  it('returns null when no @ separator', () => {
    expect(parseAgentId('no-separator')).toBeNull()
  })

  it('uses first @ as separator when multiple @ exist', () => {
    const result = parseAgentId('agent@team@extra')
    expect(result).toEqual({
      agentName: 'agent',
      teamName: 'team@extra',
    })
  })

  it('handles @ at start', () => {
    expect(parseAgentId('@team')).toEqual({
      agentName: '',
      teamName: 'team',
    })
  })

  it('handles @ at end', () => {
    expect(parseAgentId('agent@')).toEqual({
      agentName: 'agent',
      teamName: '',
    })
  })

  it('round-trips with formatAgentId', () => {
    const id = formatAgentId('tester', 'suite')
    const parsed = parseAgentId(id)
    expect(parsed).toEqual({ agentName: 'tester', teamName: 'suite' })
  })
})

describe('generateRequestId', () => {
  it('matches expected format pattern', () => {
    const id = generateRequestId('shutdown', 'agent@team')
    expect(id).toMatch(/^shutdown-\d+@agent@team$/)
  })

  it('includes a timestamp', () => {
    const before = Date.now()
    const id = generateRequestId('plan', 'a@t')
    const after = Date.now()

    const parsed = parseRequestId(id)
    expect(parsed).not.toBeNull()
    expect(parsed!.timestamp).toBeGreaterThanOrEqual(before)
    expect(parsed!.timestamp).toBeLessThanOrEqual(after)
  })

  it('generates unique IDs over time', () => {
    const id1 = generateRequestId('type', 'a@b')
    // Small delay to ensure different timestamp
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 1)
    const id2 = generateRequestId('type', 'a@b')
    vi.useRealTimers()
    expect(id1).not.toBe(id2)
  })

  it('preserves request type and agent ID', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1702500000000)
    const id = generateRequestId('shutdown', 'researcher@my-project')
    expect(id).toBe('shutdown-1702500000000@researcher@my-project')
    vi.useRealTimers()
  })
})

describe('parseRequestId', () => {
  it('parses a valid request ID', () => {
    const result = parseRequestId('shutdown-1702500000000@researcher@my-project')
    expect(result).toEqual({
      requestType: 'shutdown',
      timestamp: 1702500000000,
      agentId: 'researcher@my-project',
    })
  })

  it('returns null when missing @', () => {
    expect(parseRequestId('no-at-sign')).toBeNull()
  })

  it('returns null when missing dash in prefix', () => {
    expect(parseRequestId('nodash@agent@team')).toBeNull()
  })

  it('returns null when timestamp is not a number', () => {
    expect(parseRequestId('type-abc@agent@team')).toBeNull()
  })

  it('handles request type with dashes', () => {
    const result = parseRequestId('plan-approval-1702500000000@agent@team')
    expect(result).toEqual({
      requestType: 'plan-approval',
      timestamp: 1702500000000,
      agentId: 'agent@team',
    })
  })

  it('round-trips with generateRequestId', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1700000000000)
    const id = generateRequestId('test', 'agent@team')
    vi.useRealTimers()

    const parsed = parseRequestId(id)
    expect(parsed).toEqual({
      requestType: 'test',
      timestamp: 1700000000000,
      agentId: 'agent@team',
    })
  })
})
