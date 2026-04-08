import { describe, it, expect, beforeEach } from 'vitest'
import {
  CollaborationEngine,
  DEFAULT_COLLABORATION_CONFIG,
} from '../CollaborationEngine'
import type {
  AgentDescriptor,
  AgentResponse,
} from '../CollaborationEngine'

describe('CollaborationEngine', () => {
  let engine: CollaborationEngine

  const makeAgent = (overrides: Partial<AgentDescriptor> = {}): AgentDescriptor => ({
    id: `agent_${Math.random().toString(36).slice(2, 6)}`,
    name: 'Test Agent',
    role: 'analyzer',
    capabilities: ['code_analysis', 'security'],
    reliability: 0.9,
    responseTimeMs: 100,
    priority: 5,
    ...overrides,
  })

  beforeEach(() => {
    engine = new CollaborationEngine()
  })

  // ══════════════════════════════════════════════════════════════════════
  // §1 — Construction & Configuration
  // ══════════════════════════════════════════════════════════════════════

  describe('construction', () => {
    it('creates with default config', () => {
      expect(engine).toBeInstanceOf(CollaborationEngine)
    })

    it('creates with custom config', () => {
      const custom = new CollaborationEngine({ maxAgents: 10 })
      expect(custom).toBeInstanceOf(CollaborationEngine)
    })

    it('exports DEFAULT_COLLABORATION_CONFIG', () => {
      expect(DEFAULT_COLLABORATION_CONFIG).toBeDefined()
      expect(DEFAULT_COLLABORATION_CONFIG.consensusThreshold).toBe(0.6)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §2 — Agent Registry
  // ══════════════════════════════════════════════════════════════════════

  describe('agent registry', () => {
    it('registers an agent', () => {
      const agent = makeAgent({ name: 'CodeAnalyzer' })
      engine.registerAgent(agent)
      expect(engine.getAgents().length).toBe(1)
    })

    it('unregisters an agent', () => {
      const agent = makeAgent()
      engine.registerAgent(agent)
      expect(engine.unregisterAgent(agent.id)).toBe(true)
      expect(engine.getAgents().length).toBe(0)
    })

    it('returns false for unregistering non-existent agent', () => {
      expect(engine.unregisterAgent('nonexistent')).toBe(false)
    })

    it('finds agents by capability', () => {
      engine.registerAgent(makeAgent({ capabilities: ['code_analysis', 'review'] }))
      engine.registerAgent(makeAgent({ capabilities: ['security', 'pentest'] }))
      const found = engine.findAgentsByCapability('security')
      expect(found.length).toBe(1)
    })

    it('returns all agents', () => {
      engine.registerAgent(makeAgent({ id: 'a1' }))
      engine.registerAgent(makeAgent({ id: 'a2' }))
      expect(engine.getAgents().length).toBe(2)
    })

    it('enforces max agents limit', () => {
      const small = new CollaborationEngine({ maxAgents: 2 })
      small.registerAgent(makeAgent({ id: 'a1', priority: 1 }))
      small.registerAgent(makeAgent({ id: 'a2', priority: 5 }))
      small.registerAgent(makeAgent({ id: 'a3', priority: 10 }))
      expect(small.getAgents().length).toBeLessThanOrEqual(2)
    })

    it('supports all agent roles', () => {
      const roles = ['analyzer', 'generator', 'critic', 'verifier', 'synthesizer', 'specialist'] as const
      for (const role of roles) {
        engine.registerAgent(makeAgent({ id: `r_${role}`, role }))
      }
      expect(engine.getAgents().length).toBe(6)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §3 — Task Management
  // ══════════════════════════════════════════════════════════════════════

  describe('task management', () => {
    it('creates a collaboration task', () => {
      const task = engine.createTask('Analyze code for vulnerabilities', ['security', 'code_analysis'])
      expect(task.id).toBeTruthy()
      expect(task.status).toBe('pending')
    })

    it('creates task with options', () => {
      const task = engine.createTask('Task', ['cap'], { maxAgents: 3, consensusRequired: false })
      expect(task.maxAgents).toBe(3)
      expect(task.consensusRequired).toBe(false)
    })

    it('gets a task by ID', () => {
      const task = engine.createTask('Test', ['cap'])
      expect(engine.getTask(task.id)).not.toBeNull()
    })

    it('returns null for non-existent task', () => {
      expect(engine.getTask('bad')).toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §4 — Delegation
  // ══════════════════════════════════════════════════════════════════════

  describe('delegation', () => {
    it('delegates a task to matching agents', () => {
      engine.registerAgent(makeAgent({ id: 'a1', capabilities: ['security'] }))
      engine.registerAgent(makeAgent({ id: 'a2', capabilities: ['code_analysis'] }))
      const task = engine.createTask('Security review', ['security'])
      const plan = engine.delegate(task.id)
      expect(plan).not.toBeNull()
      expect(plan!.assignments.length).toBeGreaterThan(0)
    })

    it('returns null for non-existent task', () => {
      expect(engine.delegate('bad')).toBeNull()
    })

    it('marks task as in_progress after delegation', () => {
      engine.registerAgent(makeAgent({ capabilities: ['analysis'] }))
      const task = engine.createTask('Analyze', ['analysis'])
      engine.delegate(task.id)
      expect(engine.getTask(task.id)!.status).toBe('in_progress')
    })

    it('provides delegation reasoning', () => {
      engine.registerAgent(makeAgent({ capabilities: ['code'] }))
      const task = engine.createTask('Review code', ['code'])
      const plan = engine.delegate(task.id)
      expect(plan!.reasoning).toBeTruthy()
    })

    it('limits assignments to maxAgents', () => {
      for (let i = 0; i < 10; i++) {
        engine.registerAgent(makeAgent({ id: `a${i}`, capabilities: ['analysis'] }))
      }
      const task = engine.createTask('Analyze', ['analysis'], { maxAgents: 3 })
      const plan = engine.delegate(task.id)
      expect(plan!.assignments.length).toBeLessThanOrEqual(3)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §5 — Response Collection & Synthesis
  // ══════════════════════════════════════════════════════════════════════

  describe('response collection', () => {
    it('submits agent responses', () => {
      const task = engine.createTask('Test', ['cap'])
      engine.submitResponse({
        agentId: 'a1',
        taskId: task.id,
        content: 'Analysis result',
        confidence: 0.9,
        reasoning: 'Based on patterns',
        timestamp: Date.now(),
        metadata: {},
      })
      expect(engine.getResponses(task.id).length).toBe(1)
    })

    it('returns empty for task with no responses', () => {
      const task = engine.createTask('Test', ['cap'])
      expect(engine.getResponses(task.id).length).toBe(0)
    })
  })

  describe('synthesis', () => {
    it('synthesizes results from multiple responses', () => {
      const task = engine.createTask('Analyze', ['analysis'])

      engine.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'Found SQL injection vulnerability',
        confidence: 0.9, reasoning: 'Pattern match', timestamp: Date.now(), metadata: {},
      })
      engine.submitResponse({
        agentId: 'a2', taskId: task.id, content: 'Found SQL injection vulnerability in the code',
        confidence: 0.85, reasoning: 'Code review', timestamp: Date.now(), metadata: {},
      })

      const result = engine.synthesize(task.id)
      expect(result).not.toBeNull()
      expect(result!.content).toBeTruthy()
      expect(result!.contributingAgents.length).toBe(2)
    })

    it('returns null for non-existent task', () => {
      expect(engine.synthesize('bad')).toBeNull()
    })

    it('returns null for task with no responses', () => {
      const task = engine.createTask('Empty', ['cap'])
      expect(engine.synthesize(task.id)).toBeNull()
    })

    it('marks task as completed after synthesis', () => {
      const task = engine.createTask('Test', ['cap'])
      engine.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'Result',
        confidence: 0.9, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      engine.synthesize(task.id)
      expect(engine.getTask(task.id)!.status).toBe('completed')
    })

    it('uses best confidence for single response', () => {
      const task = engine.createTask('Test', ['cap'], { consensusRequired: false })
      engine.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'Solo result',
        confidence: 0.95, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      const result = engine.synthesize(task.id)
      expect(result!.confidence).toBe(0.95)
    })

    it('detects conflicts in contradicting responses', () => {
      engine.registerAgent(makeAgent({ id: 'a1', reliability: 0.9 }))
      engine.registerAgent(makeAgent({ id: 'a2', reliability: 0.8 }))
      const task = engine.createTask('Check code quality', ['analysis'])

      engine.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'The code quality is excellent and meets all standards',
        confidence: 0.9, reasoning: 'R1', timestamp: Date.now(), metadata: {},
      })
      engine.submitResponse({
        agentId: 'a2', taskId: task.id, content: 'The code quality is not excellent and fails all standards',
        confidence: 0.7, reasoning: 'R2', timestamp: Date.now(), metadata: {},
      })

      const result = engine.synthesize(task.id)
      expect(result).not.toBeNull()
    })

    it('computes consensus level', () => {
      const task = engine.createTask('Check', ['cap'])
      engine.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'Same result',
        confidence: 0.9, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      engine.submitResponse({
        agentId: 'a2', taskId: task.id, content: 'Same result',
        confidence: 0.85, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      const result = engine.synthesize(task.id)
      expect(result!.consensusLevel).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §6 — Ensemble Decision
  // ══════════════════════════════════════════════════════════════════════

  describe('ensemble decision', () => {
    it('makes an ensemble decision', () => {
      const decision = engine.ensembleDecide('Is this code secure?', [
        { agentId: 'a1', answer: 'Yes', confidence: 0.9 },
        { agentId: 'a2', answer: 'Yes', confidence: 0.8 },
        { agentId: 'a3', answer: 'No', confidence: 0.6 },
      ])
      expect(decision.winner).toBe('yes')
      expect(decision.method).toBe('majority')
    })

    it('detects unanimous decisions', () => {
      const decision = engine.ensembleDecide('Is 2+2=4?', [
        { agentId: 'a1', answer: 'Yes', confidence: 1.0 },
        { agentId: 'a2', answer: 'Yes', confidence: 0.95 },
      ])
      expect(decision.method).toBe('unanimous')
    })

    it('handles empty votes', () => {
      const decision = engine.ensembleDecide('Question?', [])
      expect(decision.winner).toBe('')
    })

    it('computes consensus level', () => {
      const decision = engine.ensembleDecide('Q?', [
        { agentId: 'a1', answer: 'A', confidence: 0.9 },
        { agentId: 'a2', answer: 'A', confidence: 0.8 },
        { agentId: 'a3', answer: 'B', confidence: 0.5 },
      ])
      expect(decision.consensusLevel).toBeGreaterThan(0.5)
    })

    it('uses weighted method for split votes', () => {
      const decision = engine.ensembleDecide('Q?', [
        { agentId: 'a1', answer: 'A', confidence: 0.3 },
        { agentId: 'a2', answer: 'B', confidence: 0.3 },
        { agentId: 'a3', answer: 'C', confidence: 0.3 },
        { agentId: 'a4', answer: 'D', confidence: 0.3 },
      ])
      expect(decision.method).toBe('weighted')
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §7 — Messaging
  // ══════════════════════════════════════════════════════════════════════

  describe('messaging', () => {
    it('sends a message between agents', () => {
      const msg = engine.sendMessage('a1', 'a2', 'request', 'Analyze this code')
      expect(msg.id).toBeTruthy()
      expect(msg.fromAgentId).toBe('a1')
      expect(msg.toAgentId).toBe('a2')
    })

    it('sends a broadcast message', () => {
      const msg = engine.sendMessage('a1', 'broadcast', 'inform', 'New data available')
      expect(msg.toAgentId).toBe('broadcast')
    })

    it('supports all message types', () => {
      const types = ['request', 'response', 'inform', 'query', 'critique', 'acknowledge'] as const
      for (const type of types) {
        const msg = engine.sendMessage('a1', 'a2', type, 'Content')
        expect(msg.type).toBe(type)
      }
    })

    it('gets messages for an agent', () => {
      engine.sendMessage('a1', 'a2', 'request', 'Task for a2')
      engine.sendMessage('a1', 'a3', 'request', 'Task for a3')
      expect(engine.getMessagesForAgent('a2').length).toBe(1)
    })

    it('broadcast messages appear for all agents', () => {
      engine.sendMessage('a1', 'broadcast', 'inform', 'Broadcast')
      expect(engine.getMessagesForAgent('a2').length).toBe(1)
      expect(engine.getMessagesForAgent('a3').length).toBe(1)
    })

    it('supports reply chains', () => {
      const msg1 = engine.sendMessage('a1', 'a2', 'request', 'Question')
      const msg2 = engine.sendMessage('a2', 'a1', 'response', 'Answer', msg1.id)
      expect(msg2.replyToId).toBe(msg1.id)
    })

    it('gets all messages', () => {
      engine.sendMessage('a1', 'a2', 'request', 'M1')
      engine.sendMessage('a2', 'a1', 'response', 'M2')
      expect(engine.getAllMessages().length).toBe(2)
    })

    it('enforces max messages limit', () => {
      const small = new CollaborationEngine({ maxMessages: 3 })
      for (let i = 0; i < 5; i++) {
        small.sendMessage('a1', 'a2', 'inform', `Message ${i}`)
      }
      expect(small.getAllMessages().length).toBeLessThanOrEqual(3)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §8 — Conflict Resolution Strategies
  // ══════════════════════════════════════════════════════════════════════

  describe('conflict resolution strategies', () => {
    it('resolves by confidence', () => {
      const byConfidence = new CollaborationEngine({ conflictResolutionStrategy: 'confidence' })
      byConfidence.registerAgent(makeAgent({ id: 'a1', reliability: 0.95 }))
      byConfidence.registerAgent(makeAgent({ id: 'a2', reliability: 0.6 }))

      const task = byConfidence.createTask('Check', ['cap'])
      byConfidence.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'The system is working correctly and passes all checks',
        confidence: 0.9, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      byConfidence.submitResponse({
        agentId: 'a2', taskId: task.id, content: 'The system is not working correctly and fails all checks',
        confidence: 0.5, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })

      const result = byConfidence.synthesize(task.id)
      expect(result).not.toBeNull()
    })

    it('resolves by authority', () => {
      const byAuth = new CollaborationEngine({ conflictResolutionStrategy: 'authority' })
      byAuth.registerAgent(makeAgent({ id: 'a1', role: 'verifier' }))
      byAuth.registerAgent(makeAgent({ id: 'a2', role: 'generator' }))

      const task = byAuth.createTask('Check', ['cap'])
      byAuth.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'Verified: the code works fine and has no bugs',
        confidence: 0.8, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      byAuth.submitResponse({
        agentId: 'a2', taskId: task.id, content: 'Generated: the code does not work fine and has many bugs',
        confidence: 0.9, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })

      const result = byAuth.synthesize(task.id)
      expect(result).not.toBeNull()
    })

    it('resolves by voting', () => {
      const byVote = new CollaborationEngine({ conflictResolutionStrategy: 'voting' })
      const task = byVote.createTask('Check', ['cap'])
      byVote.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'The approach is correct and efficient',
        confidence: 0.8, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      byVote.submitResponse({
        agentId: 'a2', taskId: task.id, content: 'The approach is not correct and inefficient',
        confidence: 0.7, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })

      const result = byVote.synthesize(task.id)
      expect(result).not.toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §9 — Stats
  // ══════════════════════════════════════════════════════════════════════

  describe('stats', () => {
    it('tracks total agents', () => {
      engine.registerAgent(makeAgent({ id: 'a1' }))
      expect(engine.getStats().totalAgents).toBe(1)
    })

    it('tracks total tasks', () => {
      engine.createTask('T', ['c'])
      expect(engine.getStats().totalTasks).toBe(1)
    })

    it('tracks completed tasks', () => {
      const task = engine.createTask('T', ['c'], { consensusRequired: false })
      engine.submitResponse({
        agentId: 'a1', taskId: task.id, content: 'Done',
        confidence: 0.9, reasoning: 'R', timestamp: Date.now(), metadata: {},
      })
      engine.synthesize(task.id)
      expect(engine.getStats().totalTasksCompleted).toBe(1)
    })

    it('tracks messages sent', () => {
      engine.sendMessage('a1', 'a2', 'inform', 'Hi')
      expect(engine.getStats().totalMessagesSent).toBe(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §10 — Serialization
  // ══════════════════════════════════════════════════════════════════════

  describe('serialization', () => {
    it('serializes to JSON', () => {
      engine.registerAgent(makeAgent())
      engine.createTask('Test', ['cap'])
      const json = engine.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserializes from JSON', () => {
      engine.registerAgent(makeAgent({ id: 'persistent' }))
      const json = engine.serialize()
      const restored = CollaborationEngine.deserialize(json)
      expect(restored.getAgents().length).toBe(1)
    })

    it('handles invalid JSON gracefully', () => {
      const restored = CollaborationEngine.deserialize('bad json')
      expect(restored).toBeInstanceOf(CollaborationEngine)
    })

    it('preserves messages on serialization', () => {
      engine.sendMessage('a1', 'a2', 'inform', 'Test')
      const json = engine.serialize()
      const restored = CollaborationEngine.deserialize(json)
      expect(restored.getAllMessages().length).toBe(1)
    })
  })
})
