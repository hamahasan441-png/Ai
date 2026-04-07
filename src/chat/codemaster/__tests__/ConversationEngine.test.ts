import { describe, it, expect, beforeEach } from 'vitest'
import { ConversationEngine } from '../ConversationEngine.js'
import type {
  ConversationMessage,
  ConversationState,
  ConversationSummary,
  FollowUpSuggestion,
  ConversationCheckpoint,
} from '../ConversationEngine.js'

describe('ConversationEngine', () => {
  let engine: ConversationEngine

  beforeEach(() => {
    engine = new ConversationEngine()
  })

  // ═══════════════════════════════════════════════════════════
  // Basic messaging
  // ═══════════════════════════════════════════════════════════

  describe('addUserMessage', () => {
    it('should add a user message', () => {
      const msg = engine.addUserMessage('Hello')
      expect(msg.role).toBe('user')
      expect(msg.content).toBe('Hello')
    })

    it('should auto-generate message ID', () => {
      const msg = engine.addUserMessage('Hello')
      expect(msg.id).toBeTruthy()
      expect(msg.id).toContain('msg_')
    })

    it('should set timestamp', () => {
      const msg = engine.addUserMessage('Hello')
      expect(msg.timestamp).toBeTruthy()
    })

    it('should not be summarized by default', () => {
      const msg = engine.addUserMessage('Hello')
      expect(msg.summarized).toBe(false)
    })

    it('should increment message count', () => {
      engine.addUserMessage('Hello')
      engine.addUserMessage('World')
      expect(engine.getMessageCount()).toBe(2)
    })

    it('should accept metadata', () => {
      const msg = engine.addUserMessage('Hello', { source: 'test' })
      expect(msg.metadata?.source).toBe('test')
    })
  })

  describe('addAssistantMessage', () => {
    it('should add an assistant message', () => {
      const msg = engine.addAssistantMessage('I can help with that')
      expect(msg.role).toBe('assistant')
      expect(msg.content).toBe('I can help with that')
    })

    it('should increment message count', () => {
      engine.addAssistantMessage('Response')
      expect(engine.getMessageCount()).toBe(1)
    })
  })

  describe('addSystemMessage', () => {
    it('should add a system message', () => {
      const msg = engine.addSystemMessage('System prompt')
      expect(msg.role).toBe('system')
      expect(msg.content).toBe('System prompt')
    })

    it('should have empty code refs', () => {
      const msg = engine.addSystemMessage('System prompt')
      expect(msg.codeRefs).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Intent detection
  // ═══════════════════════════════════════════════════════════

  describe('detectIntent', () => {
    it('should detect new-feature intent', () => {
      expect(engine.detectIntent('add a new button component')).toBe('new-feature')
    })

    it('should detect fix-bug intent', () => {
      expect(engine.detectIntent('fix the crash when clicking submit')).toBe('fix-bug')
    })

    it('should detect refactor intent', () => {
      expect(engine.detectIntent('refactor the auth module to be simpler')).toBe('refactor')
    })

    it('should detect optimize intent', () => {
      expect(engine.detectIntent('optimize the performance of the query')).toBe('optimize')
    })

    it('should detect add-tests intent', () => {
      expect(engine.detectIntent('add unit tests for the auth module')).toBe('add-tests')
    })

    it('should detect documentation intent', () => {
      expect(engine.detectIntent('document the API endpoints')).toBe('documentation')
    })

    it('should detect security intent', () => {
      expect(engine.detectIntent('fix the SQL injection vulnerability')).toBe('security')
    })

    it('should return null for ambiguous messages', () => {
      expect(engine.detectIntent('hello')).toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Code reference extraction
  // ═══════════════════════════════════════════════════════════

  describe('extractCodeReferences', () => {
    it('should extract TypeScript file paths', () => {
      const refs = engine.extractCodeReferences('Look at src/index.ts for the entry point')
      expect(refs.length).toBeGreaterThan(0)
      expect(refs[0].filePath).toBe('src/index.ts')
    })

    it('should extract Python file paths', () => {
      const refs = engine.extractCodeReferences('Check app/main.py for the issue')
      expect(refs.length).toBeGreaterThan(0)
      expect(refs[0].language).toBe('python')
    })

    it('should extract multiple file paths', () => {
      const refs = engine.extractCodeReferences('Change src/app.ts and src/utils.ts')
      expect(refs.length).toBe(2)
    })

    it('should not duplicate file paths', () => {
      const refs = engine.extractCodeReferences('src/app.ts and src/app.ts')
      expect(refs.length).toBe(1)
    })

    it('should extract line numbers', () => {
      const refs = engine.extractCodeReferences('Error at src/app.ts:42:10')
      expect(refs.length).toBeGreaterThan(0)
      expect(refs[0].startLine).toBe(42)
    })

    it('should handle paths with ./ prefix', () => {
      const refs = engine.extractCodeReferences('Look at ./src/index.ts')
      expect(refs.length).toBeGreaterThan(0)
    })

    it('should detect Go files', () => {
      const refs = engine.extractCodeReferences('Check main.go for details')
      expect(refs.some(r => r.language === 'go')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // State management
  // ═══════════════════════════════════════════════════════════

  describe('getState', () => {
    it('should return conversation state', () => {
      const state = engine.getState()
      expect(state.id).toBeTruthy()
      expect(state.messages).toHaveLength(0)
    })

    it('should track mentioned files', () => {
      engine.addUserMessage('Look at src/index.ts')
      const state = engine.getState()
      expect(state.mentionedFiles.has('src/index.ts')).toBe(true)
    })

    it('should track current intent', () => {
      engine.addUserMessage('Fix the bug in the login page')
      const state = engine.getState()
      expect(state.currentIntent).toBe('fix-bug')
    })

    it('should auto-generate title from first user message', () => {
      engine.addUserMessage('Add a new dashboard widget')
      const state = engine.getState()
      expect(state.title).toContain('Add a new dashboard')
    })

    it('should update token estimate', () => {
      engine.addUserMessage('Some message content')
      expect(engine.getTokenEstimate()).toBeGreaterThan(0)
    })
  })

  describe('getMessages and getRecentMessages', () => {
    it('should return all messages', () => {
      engine.addUserMessage('Hello')
      engine.addAssistantMessage('Hi')
      engine.addUserMessage('How?')
      expect(engine.getMessages()).toHaveLength(3)
    })

    it('should return recent messages', () => {
      engine.addUserMessage('1')
      engine.addUserMessage('2')
      engine.addUserMessage('3')
      const recent = engine.getRecentMessages(2)
      expect(recent).toHaveLength(2)
      expect(recent[0].content).toBe('2')
      expect(recent[1].content).toBe('3')
    })

    it('should return copy of messages', () => {
      engine.addUserMessage('Hello')
      const m1 = engine.getMessages()
      const m2 = engine.getMessages()
      expect(m1).not.toBe(m2)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Summarization
  // ═══════════════════════════════════════════════════════════

  describe('summarize', () => {
    it('should produce summary with message count', () => {
      engine.addUserMessage('Add a feature')
      engine.addAssistantMessage('Created the feature module')
      const summary = engine.summarize()
      expect(summary.messageCount).toBe(2)
    })

    it('should track key files', () => {
      engine.addUserMessage('Look at src/index.ts')
      const summary = engine.summarize()
      expect(summary.keyFiles).toContain('src/index.ts')
    })

    it('should report task state', () => {
      engine.addCompletedTask('Created component')
      const summary = engine.summarize()
      expect(summary.taskState).toContain('1 tasks completed')
    })

    it('should have text summary', () => {
      engine.addUserMessage('Hello')
      const summary = engine.summarize()
      expect(summary.text).toBeTruthy()
    })

    it('should extract key decisions from assistant messages', () => {
      engine.addAssistantMessage('Created the new auth module with JWT support')
      const summary = engine.summarize()
      expect(summary.keyDecisions.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Follow-up suggestions
  // ═══════════════════════════════════════════════════════════

  describe('suggestFollowUps', () => {
    it('should return empty for empty conversation', () => {
      const suggestions = engine.suggestFollowUps()
      expect(suggestions).toHaveLength(0)
    })

    it('should suggest tests after new feature', () => {
      engine.addUserMessage('Create a new user service')
      const suggestions = engine.suggestFollowUps()
      expect(suggestions.some(s => s.text.toLowerCase().includes('test'))).toBe(true)
    })

    it('should suggest regression test after bug fix', () => {
      engine.addUserMessage('Fix the crash in the login handler')
      const suggestions = engine.suggestFollowUps()
      expect(suggestions.some(s => s.text.toLowerCase().includes('test'))).toBe(true)
    })

    it('should prioritize pending tasks', () => {
      engine.addUserMessage('Hello')
      engine.addPendingTask('Add tests')
      const suggestions = engine.suggestFollowUps()
      expect(suggestions[0].text).toContain('Add tests')
    })

    it('should suggest code review when code refs exist', () => {
      engine.addUserMessage('I changed src/app.ts to fix the issue')
      const suggestions = engine.suggestFollowUps()
      expect(suggestions.some(s => s.category === 'review')).toBe(true)
    })

    it('should limit to 5 suggestions', () => {
      engine.addUserMessage('Create a complex feature')
      engine.addPendingTask('task 1')
      engine.addPendingTask('task 2')
      const suggestions = engine.suggestFollowUps()
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })

    it('should sort by relevance', () => {
      engine.addUserMessage('Add a new feature')
      const suggestions = engine.suggestFollowUps()
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].relevance).toBeLessThanOrEqual(suggestions[i - 1].relevance)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Checkpoints and branching
  // ═══════════════════════════════════════════════════════════

  describe('checkpoints', () => {
    it('should create a checkpoint', () => {
      engine.addUserMessage('Step 1')
      const ckpt = engine.createCheckpoint('before-change')
      expect(ckpt.id).toContain('ckpt_')
      expect(ckpt.label).toBe('before-change')
      expect(ckpt.messageIndex).toBe(1)
    })

    it('should list checkpoints', () => {
      engine.createCheckpoint('ckpt1')
      engine.addUserMessage('msg')
      engine.createCheckpoint('ckpt2')
      expect(engine.getCheckpoints()).toHaveLength(2)
    })

    it('should rollback to checkpoint', () => {
      engine.addUserMessage('Step 1')
      const ckpt = engine.createCheckpoint('before')
      engine.addUserMessage('Step 2')
      engine.addUserMessage('Step 3')
      expect(engine.getMessageCount()).toBe(3)

      const success = engine.rollbackToCheckpoint(ckpt.id)
      expect(success).toBe(true)
      expect(engine.getMessageCount()).toBe(1)
    })

    it('should return false for invalid checkpoint', () => {
      expect(engine.rollbackToCheckpoint('invalid')).toBe(false)
    })

    it('should restore state on rollback', () => {
      engine.addUserMessage('Create a feature')
      engine.addCompletedTask('Created module')
      const ckpt = engine.createCheckpoint('before-more')
      engine.addCompletedTask('Added tests')

      engine.rollbackToCheckpoint(ckpt.id)
      const state = engine.getState()
      expect(state.completedTasks).toHaveLength(1)
    })

    it('should remove later checkpoints on rollback', () => {
      engine.createCheckpoint('ckpt1')
      engine.addUserMessage('msg')
      engine.createCheckpoint('ckpt2')
      engine.addUserMessage('msg2')
      engine.createCheckpoint('ckpt3')

      engine.rollbackToCheckpoint(engine.getCheckpoints()[1].id)
      expect(engine.getCheckpoints()).toHaveLength(2) // ckpt1 + ckpt2
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Task tracking
  // ═══════════════════════════════════════════════════════════

  describe('task tracking', () => {
    it('should add completed tasks', () => {
      engine.addCompletedTask('Created component')
      const state = engine.getState()
      expect(state.completedTasks).toContain('Created component')
    })

    it('should add pending tasks', () => {
      engine.addPendingTask('Add tests')
      const state = engine.getState()
      expect(state.pendingTasks).toContain('Add tests')
    })

    it('should not duplicate pending tasks', () => {
      engine.addPendingTask('Add tests')
      engine.addPendingTask('Add tests')
      const state = engine.getState()
      expect(state.pendingTasks.filter(t => t === 'Add tests')).toHaveLength(1)
    })

    it('should move task from pending to completed', () => {
      engine.addPendingTask('Add tests')
      engine.addCompletedTask('Add tests')
      const state = engine.getState()
      expect(state.pendingTasks).not.toContain('Add tests')
      expect(state.completedTasks).toContain('Add tests')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Export and reset
  // ═══════════════════════════════════════════════════════════

  describe('export', () => {
    it('should export conversation data', () => {
      engine.addUserMessage('Hello')
      engine.addAssistantMessage('Hi')
      engine.addCompletedTask('Greeted user')
      const data = engine.export()
      expect(data.messages).toHaveLength(2)
      expect(data.completedTasks).toContain('Greeted user')
      expect(data.id).toBeTruthy()
      expect(data.title).toBeTruthy()
    })

    it('should include mentioned files', () => {
      engine.addUserMessage('Check src/index.ts')
      const data = engine.export()
      expect(data.mentionedFiles).toContain('src/index.ts')
    })
  })

  describe('reset', () => {
    it('should clear all state', () => {
      engine.addUserMessage('Hello')
      engine.addCompletedTask('Done')
      engine.createCheckpoint('ckpt')
      engine.reset()

      expect(engine.getMessageCount()).toBe(0)
      expect(engine.getState().completedTasks).toHaveLength(0)
      expect(engine.getCheckpoints()).toHaveLength(0)
    })
  })

  describe('setTitle and getId', () => {
    it('should set title', () => {
      engine.setTitle('My Conversation')
      expect(engine.getState().title).toBe('My Conversation')
    })

    it('should return conversation ID', () => {
      expect(engine.getId()).toContain('conv_')
    })
  })
})
