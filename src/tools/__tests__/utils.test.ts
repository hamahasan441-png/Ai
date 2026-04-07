import { describe, it, expect } from 'vitest'
import {
  tagMessagesWithToolUseID,
  getToolUseIDFromParentMessage,
} from '../utils.js'
import type { AssistantMessage, UserMessage, SystemMessage } from '../../types/message.js'

describe('tagMessagesWithToolUseID', () => {
  const userMessage: UserMessage = {
    type: 'user',
    message: { role: 'user', content: 'hello' },
  }

  const systemMessage: SystemMessage = {
    type: 'system',
    message: { role: 'user', content: 'system context' },
  }

  it('returns messages unchanged when toolUseID is undefined', () => {
    const messages = [userMessage, systemMessage]
    const result = tagMessagesWithToolUseID(messages, undefined)
    expect(result).toBe(messages)
  })

  it('tags user messages with sourceToolUseID', () => {
    const messages = [userMessage]
    const result = tagMessagesWithToolUseID(messages, 'tool-123')
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('sourceToolUseID', 'tool-123')
    expect(result[0]!.type).toBe('user')
  })

  it('does not tag system messages', () => {
    const messages = [systemMessage]
    const result = tagMessagesWithToolUseID(messages, 'tool-123')
    expect(result).toHaveLength(1)
    expect(result[0]).not.toHaveProperty('sourceToolUseID')
  })

  it('tags only user messages in a mixed array', () => {
    const messages = [userMessage, systemMessage, userMessage]
    const result = tagMessagesWithToolUseID(messages, 'tool-456')
    expect(result).toHaveLength(3)
    expect(result[0]).toHaveProperty('sourceToolUseID', 'tool-456')
    expect(result[1]).not.toHaveProperty('sourceToolUseID')
    expect(result[2]).toHaveProperty('sourceToolUseID', 'tool-456')
  })

  it('does not mutate original messages', () => {
    const messages = [userMessage]
    tagMessagesWithToolUseID(messages, 'tool-789')
    expect(userMessage).not.toHaveProperty('sourceToolUseID')
  })

  it('handles empty messages array', () => {
    const result = tagMessagesWithToolUseID([], 'tool-123')
    expect(result).toEqual([])
  })
})

describe('getToolUseIDFromParentMessage', () => {
  it('returns tool use ID when matching block exists', () => {
    const parentMessage = {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [
          { type: 'tool_use', id: 'toolu_abc123', name: 'bash', input: {} },
        ],
      },
    } as AssistantMessage

    expect(getToolUseIDFromParentMessage(parentMessage, 'bash')).toBe(
      'toolu_abc123',
    )
  })

  it('returns undefined when no matching tool name', () => {
    const parentMessage = {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [
          { type: 'tool_use', id: 'toolu_abc123', name: 'bash', input: {} },
        ],
      },
    } as AssistantMessage

    expect(
      getToolUseIDFromParentMessage(parentMessage, 'editor'),
    ).toBeUndefined()
  })

  it('returns undefined when content has no tool_use blocks', () => {
    const parentMessage = {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: 'hello' }],
      },
    } as AssistantMessage

    expect(
      getToolUseIDFromParentMessage(parentMessage, 'bash'),
    ).toBeUndefined()
  })

  it('finds the correct tool among multiple tool_use blocks', () => {
    const parentMessage = {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [
          { type: 'tool_use', id: 'toolu_111', name: 'bash', input: {} },
          { type: 'tool_use', id: 'toolu_222', name: 'editor', input: {} },
        ],
      },
    } as AssistantMessage

    expect(getToolUseIDFromParentMessage(parentMessage, 'editor')).toBe(
      'toolu_222',
    )
  })

  it('returns undefined for empty content array', () => {
    const parentMessage = {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [],
      },
    } as AssistantMessage

    expect(
      getToolUseIDFromParentMessage(parentMessage, 'bash'),
    ).toBeUndefined()
  })
})
