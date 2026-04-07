import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LocalBrain } from '../LocalBrain.js'
import { ConversationSummarizer } from '../ConversationSummarizer.js'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// ══════════════════════════════════════════════════════════════════════════════
// Chat Enhancement Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('Chat Input Validation', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
  })

  it('should handle empty message gracefully', async () => {
    const result = await brain.chat('')
    expect(result.text).toContain('empty message')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('should handle whitespace-only message', async () => {
    const result = await brain.chat('   \n\t  ')
    expect(result.text).toContain('empty message')
  })

  it('should reject messages over 100,000 characters', async () => {
    const longMsg = 'a'.repeat(100_001)
    const result = await brain.chat(longMsg)
    expect(result.text).toContain('too long')
  })

  it('should accept messages under 100,000 characters', async () => {
    const result = await brain.chat('Hello, how are you?')
    expect(result.text).toBeTruthy()
    expect(result.text).not.toContain('too long')
    expect(result.text).not.toContain('empty message')
  })
})

describe('Chat Module Failure Tracking', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true, learningEnabled: false })
  })

  it('should return moduleFailures array when modules fail', async () => {
    // Normal chat should have no module failures (or the field is absent)
    const result = await brain.chat('What is JavaScript?')
    expect(result.text).toBeTruthy()
    // moduleFailures is only present when there are failures
    if (result.moduleFailures) {
      expect(Array.isArray(result.moduleFailures)).toBe(true)
    }
  })

  it('should include durationMs in response', async () => {
    const result = await brain.chat('hello')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(typeof result.durationMs).toBe('number')
  })

  it('should include usage stats in response', async () => {
    const result = await brain.chat('test message')
    expect(result.usage).toBeDefined()
    expect(result.usage.inputTokens).toBeGreaterThan(0)
    expect(result.usage.outputTokens).toBeGreaterThan(0)
  })
})

describe('Conversation Search', () => {
  let brain: LocalBrain

  beforeEach(async () => {
    brain = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    // Build up conversation history
    await brain.chat('What is TypeScript?')
    await brain.chat('How do React hooks work?')
    await brain.chat('Explain Python decorators')
  })

  it('should search conversation history', () => {
    const results = brain.searchConversation('TypeScript')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.score).toBeGreaterThan(0)
  })

  it('should filter by role', () => {
    const userResults = brain.searchConversation('TypeScript', { role: 'user' })
    for (const r of userResults) {
      expect(r.role).toBe('user')
    }
  })

  it('should limit results with maxResults', () => {
    const results = brain.searchConversation('the', { maxResults: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('should return empty for no matches', () => {
    const results = brain.searchConversation('xyznonexistent12345')
    expect(results.length).toBe(0)
  })

  it('should include preview in results', () => {
    const results = brain.searchConversation('TypeScript')
    if (results.length > 0) {
      expect(typeof results[0]!.preview).toBe('string')
      expect(results[0]!.preview.length).toBeGreaterThan(0)
    }
  })
})

describe('Conversation Export', () => {
  let brain: LocalBrain

  beforeEach(async () => {
    brain = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    await brain.chat('Hello')
    await brain.chat('How are you?')
  })

  it('should export as markdown', () => {
    const md = brain.exportConversation('markdown')
    expect(md).toContain('# Conversation Export')
    expect(md).toContain('Messages')
  })

  it('should export as JSON', () => {
    const json = brain.exportConversation('json')
    const parsed = JSON.parse(json)
    expect(parsed.messages).toBeDefined()
    expect(Array.isArray(parsed.messages)).toBe(true)
    expect(parsed.messageCount).toBeGreaterThan(0)
  })

  it('should export as text', () => {
    const text = brain.exportConversation('text')
    expect(text).toContain('[You]')
    expect(text).toContain('[AI]')
  })

  it('should default to markdown', () => {
    const result = brain.exportConversation()
    expect(result).toContain('# Conversation Export')
  })
})

describe('Conversation Persistence', () => {
  let brain: LocalBrain
  let tmpDir: string

  beforeEach(async () => {
    brain = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-test-'))
    await brain.chat('Hello world')
    await brain.chat('What is JavaScript?')
  })

  afterEach(() => {
    // Cleanup temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore cleanup errors
    }
  })

  it('should save conversation to file', () => {
    const filePath = path.join(tmpDir, 'conversation.json')
    brain.saveConversation(filePath)
    expect(fs.existsSync(filePath)).toBe(true)

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    expect(data.version).toBe(1)
    expect(data.history.length).toBeGreaterThan(0)
    expect(data.savedAt).toBeDefined()
  })

  it('should load conversation from file', async () => {
    const filePath = path.join(tmpDir, 'conversation.json')
    brain.saveConversation(filePath)

    // Create new brain and load
    const brain2 = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    const result = brain2.loadConversation(filePath)
    expect(result.restored).toBeGreaterThan(0)
  })

  it('should load with replace option', async () => {
    const filePath = path.join(tmpDir, 'conversation.json')
    brain.saveConversation(filePath)

    const brain2 = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    await brain2.chat('pre-existing message')
    brain2.loadConversation(filePath, { replace: true })

    const stats = brain2.getConversationStats()
    // Should only have the loaded messages, not the pre-existing one
    expect(stats.totalMessages).toBe(brain.getConversationStats().totalMessages)
  })

  it('should throw on invalid file', () => {
    expect(() => brain.loadConversation('/nonexistent/path.json')).toThrow()
  })

  it('should create directories when saving', () => {
    const filePath = path.join(tmpDir, 'nested', 'dir', 'conversation.json')
    brain.saveConversation(filePath)
    expect(fs.existsSync(filePath)).toBe(true)
  })
})

describe('Conversation Stats', () => {
  let brain: LocalBrain

  beforeEach(async () => {
    brain = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    await brain.chat('Hello')
    await brain.chat('What is Docker?')
  })

  it('should return conversation statistics', () => {
    const stats = brain.getConversationStats()
    expect(stats.totalMessages).toBeGreaterThan(0)
    expect(stats.userMessages).toBeGreaterThan(0)
    expect(stats.assistantMessages).toBeGreaterThan(0)
    expect(stats.averageResponseLength).toBeGreaterThan(0)
  })

  it('should track user and assistant message counts', () => {
    const stats = brain.getConversationStats()
    expect(stats.userMessages + stats.assistantMessages).toBe(stats.totalMessages)
  })
})

describe('Clear Conversation', () => {
  let brain: LocalBrain

  beforeEach(async () => {
    brain = new LocalBrain({ enableIntelligence: false, learningEnabled: false })
    await brain.chat('Message 1')
    await brain.chat('Message 2')
    await brain.chat('Message 3')
  })

  it('should clear all messages', () => {
    const result = brain.clearConversation()
    expect(result.cleared).toBeGreaterThan(0)
    expect(brain.getConversationStats().totalMessages).toBe(0)
  })

  it('should keep last N messages', () => {
    const _before = brain.getConversationStats().totalMessages
    brain.clearConversation(2)
    expect(brain.getConversationStats().totalMessages).toBe(2)
  })
})

describe('ConversationSummarizer Q&A Tracking Fix', () => {
  let summarizer: ConversationSummarizer

  beforeEach(() => {
    summarizer = new ConversationSummarizer()
  })

  it('should match answers to the correct question using keyword overlap', () => {
    // Ask two different questions
    summarizer.addTurn('user', 'How do I deploy to production?')
    summarizer.addTurn('user', 'What is the difference between staging and production?')

    // Answer about staging vs production (should mark Q2 answered, not Q1)
    summarizer.addTurn('assistant', 'The difference between staging and production is that staging is a testing environment while production serves real users.')

    const summary = summarizer.getSummary()
    // Q1 (deploy) should still be open, Q2 (difference staging/production) should be answered
    expect(summary.openQuestions.length).toBe(1)
    expect(summary.openQuestions[0]).toContain('deploy')
  })

  it('should handle multiple questions answered in order', () => {
    summarizer.addTurn('user', 'What is Docker?')
    summarizer.addTurn('assistant', 'Docker is a containerization platform that packages applications.')
    summarizer.addTurn('user', 'What is Kubernetes?')
    summarizer.addTurn('assistant', 'Kubernetes is a container orchestration platform.')

    const summary = summarizer.getSummary()
    expect(summary.openQuestions.length).toBe(0)
  })

  it('should keep unrelated questions open', () => {
    summarizer.addTurn('user', 'How do I set up authentication?')
    summarizer.addTurn('user', 'What database should I use?')
    summarizer.addTurn('assistant', 'For authentication, you can use JWT tokens or OAuth.')

    const summary = summarizer.getSummary()
    // The auth answer should match Q1 (authentication), leaving Q2 (database) open
    expect(summary.openQuestions.length).toBe(1)
    expect(summary.openQuestions.some(q => q.toLowerCase().includes('database'))).toBe(true)
  })

  it('should fall back to popping last question when no keyword overlap', () => {
    summarizer.addTurn('user', 'Tell me something interesting?')
    summarizer.addTurn('assistant', 'Here is a completely unrelated fun fact about cats and dogs.')

    const summary = summarizer.getSummary()
    // Should still mark the question as answered (fallback behavior)
    expect(summary.openQuestions.length).toBe(0)
  })
})
