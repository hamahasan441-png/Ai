import { describe, it, expect, beforeEach } from 'vitest'
import { DialogueManager } from '../DialogueManager.js'

describe('DialogueManager', () => {
  let dm: DialogueManager

  beforeEach(() => {
    dm = new DialogueManager()
  })

  // ── Constructor & Config ─────────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default config', () => {
      const m = new DialogueManager()
      expect(m.getStats().totalTurns).toBe(0)
    })

    it('accepts partial config overrides', () => {
      const m = new DialogueManager({ maxTurns: 10, maxGoals: 5 })
      const stats = m.getStats()
      expect(stats.totalTurns).toBe(0)
      expect(stats.totalGoals).toBe(0)
    })

    it('starts with empty turns, goals, slots, and flows', () => {
      const stats = dm.getStats()
      expect(stats.totalTurns).toBe(0)
      expect(stats.totalGoals).toBe(0)
      expect(stats.filledSlotCount).toBe(0)
      expect(stats.totalSlotCount).toBe(0)
      expect(stats.flowCount).toBe(0)
    })
  })

  // ── Turn Management ──────────────────────────────────────────────────

  describe('addTurn / getTurns / getLatestTurn', () => {
    it('adds a user turn and returns it', () => {
      const turn = dm.addTurn('user', 'Hello there')
      expect(turn.role).toBe('user')
      expect(turn.text).toBe('Hello there')
      expect(turn.id).toMatch(/^turn_/)
      expect(turn.timestamp).toBeGreaterThan(0)
    })

    it('adds a system turn', () => {
      const turn = dm.addTurn('system', 'Hi! How can I help?')
      expect(turn.role).toBe('system')
    })

    it('stores metadata on a turn', () => {
      const turn = dm.addTurn('user', 'hi', { source: 'web' })
      expect(turn.metadata).toEqual({ source: 'web' })
    })

    it('auto-classifies the dialogue act on add', () => {
      const turn = dm.addTurn('user', 'Hello')
      expect(turn.act.type).toBe('greet')
    })

    it('getTurns returns all turns in order', () => {
      dm.addTurn('user', 'Hi')
      dm.addTurn('system', 'Hello')
      dm.addTurn('user', 'Thanks')
      expect(dm.getTurns()).toHaveLength(3)
      expect(dm.getTurns()[0].role).toBe('user')
      expect(dm.getTurns()[2].role).toBe('user')
    })

    it('getTurns returns a copy (not mutable reference)', () => {
      dm.addTurn('user', 'Hi')
      const turns = dm.getTurns()
      turns.pop()
      expect(dm.getTurns()).toHaveLength(1)
    })

    it('getLatestTurn returns null when empty', () => {
      expect(dm.getLatestTurn()).toBeNull()
    })

    it('getLatestTurn returns the most recent turn', () => {
      dm.addTurn('user', 'First')
      dm.addTurn('system', 'Second')
      expect(dm.getLatestTurn()!.text).toBe('Second')
    })

    it('enforces maxTurns limit', () => {
      const m = new DialogueManager({ maxTurns: 3 })
      m.addTurn('user', 'A')
      m.addTurn('system', 'B')
      m.addTurn('user', 'C')
      m.addTurn('system', 'D')
      expect(m.getTurns()).toHaveLength(3)
      expect(m.getTurns()[0].text).toBe('B')
    })
  })

  describe('getTurnsByRole', () => {
    it('filters turns by user role', () => {
      dm.addTurn('user', 'Hi')
      dm.addTurn('system', 'Hello')
      dm.addTurn('user', 'Thanks')
      expect(dm.getTurnsByRole('user')).toHaveLength(2)
    })

    it('filters turns by system role', () => {
      dm.addTurn('user', 'Hi')
      dm.addTurn('system', 'Hello')
      expect(dm.getTurnsByRole('system')).toHaveLength(1)
    })

    it('returns empty array when no turns match', () => {
      dm.addTurn('user', 'Hi')
      expect(dm.getTurnsByRole('system')).toHaveLength(0)
    })
  })

  describe('getRecentTurns', () => {
    it('returns last N turns', () => {
      dm.addTurn('user', 'A')
      dm.addTurn('system', 'B')
      dm.addTurn('user', 'C')
      const recent = dm.getRecentTurns(2)
      expect(recent).toHaveLength(2)
      expect(recent[0].text).toBe('B')
      expect(recent[1].text).toBe('C')
    })

    it('returns all turns when count exceeds total', () => {
      dm.addTurn('user', 'A')
      expect(dm.getRecentTurns(10)).toHaveLength(1)
    })

    it('returns all turns for 0 count (slice(-0) returns full array)', () => {
      dm.addTurn('user', 'A')
      // slice(-0) === slice(0) in JS, returns full array
      expect(dm.getRecentTurns(0)).toHaveLength(1)
    })
  })

  describe('getTurnById', () => {
    it('retrieves a turn by its ID', () => {
      const turn = dm.addTurn('user', 'Hello')
      expect(dm.getTurnById(turn.id)!.text).toBe('Hello')
    })

    it('returns null for unknown ID', () => {
      expect(dm.getTurnById('nonexistent')).toBeNull()
    })
  })

  // ── Dialogue State Tracking ──────────────────────────────────────────

  describe('getState / updateState / resetState', () => {
    it('returns initial state with zero turns', () => {
      const state = dm.getState()
      expect(state.turnCount).toBe(0)
      expect(state.currentAct).toBe('unknown')
      expect(state.activeGoals).toHaveLength(0)
      expect(state.currentFlowNode).toBeNull()
    })

    it('reflects turn count after adding turns', () => {
      dm.addTurn('user', 'Hello')
      dm.addTurn('system', 'Hi')
      expect(dm.getState().turnCount).toBe(2)
    })

    it('reflects the current act from the latest turn', () => {
      dm.addTurn('user', 'Hello there')
      expect(dm.getState().currentAct).toBe('greet')
    })

    it('updateState merges metadata into the latest turn', () => {
      dm.addTurn('user', 'Hi')
      const state = dm.updateState({ mood: 'happy' })
      expect(state.turnCount).toBe(1)
      expect(dm.getLatestTurn()!.metadata).toHaveProperty('mood', 'happy')
    })

    it('resetState clears turns', () => {
      dm.addTurn('user', 'Hello')
      dm.addTurn('system', 'Hi')
      dm.resetState()
      expect(dm.getTurns()).toHaveLength(0)
      expect(dm.getLatestTurn()).toBeNull()
    })

    it('resetState clears slot values but keeps slot definitions', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'Which city?' }])
      dm.setSlot('city', 'Paris')
      dm.resetState()
      expect(dm.getFilledSlots()).toHaveLength(0)
      expect(dm.getSlot('city')).not.toBeNull()
      expect(dm.getSlot('city')!.value).toBeNull()
    })

    it('resetState marks active goals as failed', () => {
      const goal = dm.addGoal('Test', 'desc')
      dm.resetState()
      const goals = dm.getGoals()
      const found = goals.find(g => g.id === goal.id)
      expect(found!.status).toBe('failed')
    })

    it('resetState clears topic segments', () => {
      dm.addTurn('user', 'I want to book a flight to Paris')
      dm.addTurn('user', 'Actually tell me about quantum physics')
      dm.resetState()
      expect(dm.getTopicSegments()).toHaveLength(0)
    })
  })

  // ── Dialogue Act Classification ──────────────────────────────────────

  describe('classifyAct', () => {
    it('classifies greetings', () => {
      expect(dm.classifyAct('Hello!').type).toBe('greet')
      expect(dm.classifyAct('Hey there').type).toBe('greet')
      expect(dm.classifyAct('Good morning').type).toBe('greet')
    })

    it('classifies farewells', () => {
      expect(dm.classifyAct('Goodbye').type).toBe('bye')
      expect(dm.classifyAct('See you later').type).toBe('bye')
    })

    it('classifies thanks', () => {
      expect(dm.classifyAct('Thank you very much').type).toBe('thank')
      expect(dm.classifyAct('Thanks!').type).toBe('thank')
    })

    it('classifies apologies', () => {
      expect(dm.classifyAct('Sorry about that').type).toBe('apologize')
    })

    it('classifies confirmations', () => {
      expect(dm.classifyAct('Yes').type).toBe('confirm')
      expect(dm.classifyAct('Absolutely').type).toBe('confirm')
    })

    it('classifies denials', () => {
      expect(dm.classifyAct('No').type).toBe('deny')
      expect(dm.classifyAct('Nope').type).toBe('deny')
    })

    it('classifies requests', () => {
      expect(dm.classifyAct('Can you help me?').type).toBe('request')
      expect(dm.classifyAct('What is the weather?').type).toBe('request')
    })

    it('classifies clarification requests', () => {
      // "What do you mean" also matches request patterns; use a purer input
      expect(dm.classifyAct('Could you be more specific about that').type).toBe('clarify')
    })

    it('classifies repeat requests', () => {
      expect(dm.classifyAct('Pardon?').type).toBe('repeat')
    })

    it('classifies corrections', () => {
      expect(dm.classifyAct('Actually, I meant something else').type).toBe('correct')
    })

    it('classifies acknowledgements', () => {
      expect(dm.classifyAct('Okay, got it').type).toBe('acknowledge')
    })

    it('returns unknown for unrecognizable text', () => {
      const act = dm.classifyAct('xyzzy foobar baz')
      expect(act.type).toBe('unknown')
      expect(act.confidence).toBeLessThan(0.5)
    })

    it('returns confidence between 0 and 1', () => {
      const act = dm.classifyAct('Hello')
      expect(act.confidence).toBeGreaterThan(0)
      expect(act.confidence).toBeLessThanOrEqual(1)
    })

    it('extracts entities from "my X is Y" pattern', () => {
      const act = dm.classifyAct('My name is Alice')
      expect(act.entities).toHaveProperty('name', 'alice')
    })

    it('extracts email entities', () => {
      const act = dm.classifyAct('Contact me at user@example.com')
      expect(act.entities).toHaveProperty('email', 'user@example.com')
    })

    it('preserves raw text in the act', () => {
      const act = dm.classifyAct('Hello world')
      expect(act.raw).toBe('Hello world')
    })
  })

  // ── Slot Filling ─────────────────────────────────────────────────────

  describe('defineSlots / fillSlots / getMissingSlots / getFilledSlots', () => {
    beforeEach(() => {
      dm.defineSlots([
        { name: 'city', type: 'string', required: true, prompt: 'Which city?' },
        { name: 'date', type: 'date', required: true, prompt: 'What date?' },
        { name: 'guests', type: 'number', required: false, prompt: 'How many guests?' },
      ])
    })

    it('defineSlots registers slots with null values', () => {
      expect(dm.getSlot('city')).not.toBeNull()
      expect(dm.getSlot('city')!.value).toBeNull()
    })

    it('getMissingSlots returns only required unfilled slots', () => {
      const missing = dm.getMissingSlots()
      expect(missing).toHaveLength(2) // city and date are required
      expect(missing.map(s => s.name)).toContain('city')
      expect(missing.map(s => s.name)).toContain('date')
    })

    it('getFilledSlots returns empty when nothing is filled', () => {
      expect(dm.getFilledSlots()).toHaveLength(0)
    })

    it('fillSlots fills a string slot from entity pattern', () => {
      const result = dm.fillSlots('My city is Paris')
      expect(result.filled).toContain('city')
    })

    it('fillSlots fills a date slot', () => {
      const result = dm.fillSlots('The date is 2025-03-15')
      expect(result.filled).toContain('date')
    })

    it('fillSlots marks complete when all slots are filled', () => {
      dm.fillSlots('My city is Paris')
      dm.fillSlots('The date is 2025-03-15')
      const result = dm.fillSlots('guests 5')
      expect(result.complete).toBe(true)
    })

    it('fillSlots reports missing slots', () => {
      const result = dm.fillSlots('random text with no useful info')
      expect(result.missing.length).toBeGreaterThan(0)
    })

    it('setSlot manually fills a slot', () => {
      dm.setSlot('city', 'London', 0.95)
      const slot = dm.getSlot('city')!
      expect(slot.value).toBe('London')
      expect(slot.confidence).toBe(0.95)
    })

    it('setSlot clamps confidence to [0, 1]', () => {
      dm.setSlot('city', 'Berlin', 1.5)
      expect(dm.getSlot('city')!.confidence).toBe(1)
      dm.setSlot('city', 'Berlin', -0.5)
      expect(dm.getSlot('city')!.confidence).toBe(0)
    })

    it('setSlot is a no-op for unknown slot names', () => {
      dm.setSlot('unknown_slot', 'value')
      expect(dm.getSlot('unknown_slot')).toBeNull()
    })

    it('clearSlot resets a slot to null', () => {
      dm.setSlot('city', 'Paris')
      dm.clearSlot('city')
      const slot = dm.getSlot('city')!
      expect(slot.value).toBeNull()
      expect(slot.confidence).toBe(0)
    })

    it('clearSlot is a no-op for unknown slot names', () => {
      dm.clearSlot('nonexistent')
      // Should not throw
    })

    it('fillSlots handles enum slots', () => {
      dm.defineSlots([
        {
          name: 'color',
          type: 'enum',
          required: true,
          prompt: 'Pick a color',
          enumValues: ['red', 'green', 'blue'],
        },
      ])
      const result = dm.fillSlots('I prefer blue')
      expect(result.filled).toContain('color')
    })

    it('fillSlots handles boolean slots', () => {
      dm.defineSlots([{ name: 'vip', type: 'boolean', required: true, prompt: 'VIP?' }])
      const result = dm.fillSlots('yes')
      expect(result.filled).toContain('vip')
    })

    it('fillSlots fills number slot from entity', () => {
      const result = dm.fillSlots('I need 4 guests')
      expect(result.filled).toContain('guests')
    })

    it('fillSlots detects relative dates (today/tomorrow)', () => {
      const result = dm.fillSlots('I need it for tomorrow')
      expect(result.filled).toContain('date')
    })

    it('auto-fills slots when adding a user turn', () => {
      dm.addTurn('user', 'My city is Tokyo')
      expect(dm.getSlot('city')!.value).not.toBeNull()
    })
  })

  // ── Goal Tracking ────────────────────────────────────────────────────

  describe('addGoal / getGoals / isGoalComplete / getActiveGoals', () => {
    it('adds a goal and returns it', () => {
      const goal = dm.addGoal('Book flight', 'Book a flight for the user')
      expect(goal.name).toBe('Book flight')
      expect(goal.status).toBe('active')
      expect(goal.id).toMatch(/^goal_/)
    })

    it('getGoals returns all goals', () => {
      dm.addGoal('G1', 'Desc1')
      dm.addGoal('G2', 'Desc2')
      expect(dm.getGoals()).toHaveLength(2)
    })

    it('getActiveGoals filters to active goals only', () => {
      const g = dm.addGoal('G1', 'Desc1')
      dm.addGoal('G2', 'Desc2')
      dm.completeGoal(g.id)
      expect(dm.getActiveGoals()).toHaveLength(1)
    })

    it('isGoalComplete returns false for active goals', () => {
      const goal = dm.addGoal('G1', 'Desc')
      expect(dm.isGoalComplete(goal.id)).toBe(false)
    })

    it('isGoalComplete returns true after manual completion', () => {
      const goal = dm.addGoal('G1', 'Desc')
      dm.completeGoal(goal.id)
      expect(dm.isGoalComplete(goal.id)).toBe(true)
    })

    it('isGoalComplete returns false for unknown goal ID', () => {
      expect(dm.isGoalComplete('nonexistent')).toBe(false)
    })

    it('goal auto-completes when all required slots are filled', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      const goal = dm.addGoal('Book', 'Desc', ['city'])
      dm.setSlot('city', 'Paris')
      expect(dm.isGoalComplete(goal.id)).toBe(true)
    })

    it('goal progress updates based on filled slots', () => {
      dm.defineSlots([
        { name: 'a', type: 'string', required: true, prompt: 'A?' },
        { name: 'b', type: 'string', required: true, prompt: 'B?' },
      ])
      const goal = dm.addGoal('G', 'D', ['a', 'b'])
      dm.setSlot('a', 'val')
      // Check progress after calling isGoalComplete (which triggers update)
      dm.isGoalComplete(goal.id)
      const updated = dm.getGoals().find(g => g.id === goal.id)!
      expect(updated.progress).toBe(0.5)
    })

    it('clamps priority to [0, 1]', () => {
      const g1 = dm.addGoal('G1', 'D', [], 1.5)
      const g2 = dm.addGoal('G2', 'D', [], -0.5)
      expect(g1.priority).toBe(1)
      expect(g2.priority).toBe(0)
    })

    it('suspendGoal changes status to suspended', () => {
      const goal = dm.addGoal('G', 'D')
      dm.suspendGoal(goal.id)
      expect(dm.getGoals().find(g => g.id === goal.id)!.status).toBe('suspended')
    })

    it('resumeGoal reactivates a suspended goal', () => {
      const goal = dm.addGoal('G', 'D')
      dm.suspendGoal(goal.id)
      dm.resumeGoal(goal.id)
      expect(dm.getGoals().find(g => g.id === goal.id)!.status).toBe('active')
    })

    it('resumeGoal is a no-op if the goal is not suspended', () => {
      const goal = dm.addGoal('G', 'D')
      dm.resumeGoal(goal.id) // active, not suspended
      expect(dm.getGoals().find(g => g.id === goal.id)!.status).toBe('active')
    })

    it('evicts lowest-priority completed goal when maxGoals is reached', () => {
      const m = new DialogueManager({ maxGoals: 2 })
      const g1 = m.addGoal('G1', 'D', [], 0.1)
      m.addGoal('G2', 'D', [], 0.5)
      m.completeGoal(g1.id)
      m.addGoal('G3', 'D', [], 0.8) // should evict g1
      expect(m.getGoals().find(g => g.id === g1.id)).toBeUndefined()
      expect(m.getGoals()).toHaveLength(2)
    })
  })

  // ── Conversation Flow ────────────────────────────────────────────────

  describe('defineFlow / advanceFlow / getCurrentFlowNode', () => {
    const nodes = ['start', 'ask_city', 'ask_date', 'confirm', 'done']
    const transitions = [
      { from: 'start', to: 'ask_city', condition: 'begin', priority: 1 },
      { from: 'ask_city', to: 'ask_date', condition: 'city_filled', priority: 1 },
      { from: 'ask_date', to: 'confirm', condition: 'date_filled', priority: 1 },
      { from: 'confirm', to: 'done', condition: 'confirmed', priority: 1 },
    ]

    it('defines a flow and returns it', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      expect(flow.name).toBe('booking')
      expect(flow.currentNode).toBe('start')
      expect(flow.id).toContain('booking')
    })

    it('throws if start node is not in nodes', () => {
      expect(() => dm.defineFlow('f', nodes, [], 'missing', ['done'])).toThrow(/Start node/)
    })

    it('throws if end node is not in nodes', () => {
      expect(() => dm.defineFlow('f', nodes, [], 'start', ['missing'])).toThrow(/End node/)
    })

    it('throws for empty nodes list', () => {
      expect(() => dm.defineFlow('f', [], [], 'start', [])).toThrow()
    })

    it('advanceFlow moves to the next node', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      const next = dm.advanceFlow(flow.id, 'begin')
      expect(next).toBe('ask_city')
      expect(dm.getCurrentFlowNode(flow.id)).toBe('ask_city')
    })

    it('advanceFlow returns null for no matching condition', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      expect(dm.advanceFlow(flow.id, 'no_match')).toBeNull()
    })

    it('advanceFlow returns null when already at an end node', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      dm.advanceFlow(flow.id, 'begin')
      dm.advanceFlow(flow.id, 'city_filled')
      dm.advanceFlow(flow.id, 'date_filled')
      dm.advanceFlow(flow.id, 'confirmed')
      expect(dm.getCurrentFlowNode(flow.id)).toBe('done')
      expect(dm.advanceFlow(flow.id, 'anything')).toBeNull()
    })

    it('advanceFlow returns null for unknown flow ID', () => {
      expect(dm.advanceFlow('nonexistent', 'begin')).toBeNull()
    })

    it('getCurrentFlowNode returns null for unknown flow ID', () => {
      expect(dm.getCurrentFlowNode('nonexistent')).toBeNull()
    })

    it('getFlow returns a flow by ID', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      expect(dm.getFlow(flow.id)!.name).toBe('booking')
    })

    it('getFlow returns null for unknown ID', () => {
      expect(dm.getFlow('nonexistent')).toBeNull()
    })

    it('isFlowComplete returns true when at an end node', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      dm.advanceFlow(flow.id, 'begin')
      dm.advanceFlow(flow.id, 'city_filled')
      dm.advanceFlow(flow.id, 'date_filled')
      dm.advanceFlow(flow.id, 'confirmed')
      expect(dm.isFlowComplete(flow.id)).toBe(true)
    })

    it('isFlowComplete returns false when not at an end node', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      expect(dm.isFlowComplete(flow.id)).toBe(false)
    })

    it('isFlowComplete returns false for unknown flow ID', () => {
      expect(dm.isFlowComplete('nonexistent')).toBe(false)
    })

    it('resetFlow resets to start node', () => {
      const flow = dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      dm.advanceFlow(flow.id, 'begin')
      dm.resetFlow(flow.id)
      expect(dm.getCurrentFlowNode(flow.id)).toBe('start')
    })

    it('getActiveFlow returns the first non-ended flow', () => {
      dm.defineFlow('booking', nodes, transitions, 'start', ['done'])
      expect(dm.getActiveFlow()).not.toBeNull()
      expect(dm.getActiveFlow()!.name).toBe('booking')
    })

    it('getActiveFlow returns null when all flows are complete', () => {
      const flow = dm.defineFlow(
        'f',
        ['a', 'b'],
        [{ from: 'a', to: 'b', condition: 'go', priority: 1 }],
        'a',
        ['b'],
      )
      dm.advanceFlow(flow.id, 'go')
      expect(dm.getActiveFlow()).toBeNull()
    })

    it('advanceFlow picks highest-priority transition on tie', () => {
      const flow = dm.defineFlow(
        'f',
        ['a', 'b', 'c'],
        [
          { from: 'a', to: 'b', condition: 'go', priority: 1 },
          { from: 'a', to: 'c', condition: 'go', priority: 2 },
        ],
        'a',
        ['b', 'c'],
      )
      const next = dm.advanceFlow(flow.id, 'go')
      expect(next).toBe('c')
    })

    it('defineFlow accepts metadata', () => {
      const flow = dm.defineFlow('f', ['a'], [], 'a', ['a'], { version: 2 })
      expect(dm.getFlow(flow.id)!.metadata).toEqual({ version: 2 })
    })
  })

  // ── Context Management ───────────────────────────────────────────────

  describe('getDialogueContext / summarizeDialogue', () => {
    it('getDialogueContext returns an object with expected keys', () => {
      dm.addTurn('user', 'Hello')
      const ctx = dm.getDialogueContext()
      expect(ctx).toHaveProperty('recentUtterances')
      expect(ctx).toHaveProperty('slots')
      expect(ctx).toHaveProperty('activeGoals')
      expect(ctx).toHaveProperty('engagement')
      expect(ctx).toHaveProperty('repairAttempts')
    })

    it('getDialogueContext includes slot values', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setSlot('city', 'Paris')
      const ctx = dm.getDialogueContext()
      expect((ctx['slots'] as Record<string, unknown>)['city']).toBe('Paris')
    })

    it('getDialogueContext includes active flow info', () => {
      dm.defineFlow('f', ['a', 'b'], [], 'a', ['b'])
      dm.addTurn('user', 'hi')
      const ctx = dm.getDialogueContext()
      expect(ctx).toHaveProperty('currentFlow')
    })

    it('summarizeDialogue returns default message when empty', () => {
      expect(dm.summarizeDialogue()).toBe('No dialogue has occurred.')
    })

    it('summarizeDialogue includes turn count', () => {
      dm.addTurn('user', 'Hi')
      dm.addTurn('system', 'Hello')
      const summary = dm.summarizeDialogue()
      expect(summary).toContain('2 turns')
      expect(summary).toContain('1 user')
      expect(summary).toContain('1 system')
    })

    it('summarizeDialogue mentions top acts', () => {
      dm.addTurn('user', 'Hello')
      dm.addTurn('system', 'Hi there')
      const summary = dm.summarizeDialogue()
      expect(summary).toContain('Top acts')
    })

    it('summarizeDialogue mentions slot status when slots exist', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setSlot('city', 'Paris')
      dm.addTurn('user', 'Some text')
      const summary = dm.summarizeDialogue()
      expect(summary).toContain('Slots')
    })

    it('summarizeDialogue mentions goals when present', () => {
      dm.addGoal('Book', 'Book a flight')
      dm.addTurn('user', 'Hello')
      const summary = dm.summarizeDialogue()
      expect(summary).toContain('Goals')
    })
  })

  // ── Policy Management ────────────────────────────────────────────────

  describe('setPolicy / applyPolicy', () => {
    it('setPolicy registers a policy and returns it', () => {
      const policy = dm.setPolicy('greet_policy', [
        { condition: 'act == greet', action: 'greet_back', response: 'Hello!' },
      ])
      expect(policy.name).toBe('greet_policy')
      expect(policy.id).toContain('greet_policy')
    })

    it('applyPolicy returns null when no policies are set', () => {
      expect(dm.applyPolicy()).toBeNull()
    })

    it('applyPolicy matches act == condition', () => {
      dm.setPolicy('p', [{ condition: 'act == greet', action: 'greet_back', response: 'Hello!' }])
      dm.addTurn('user', 'Hello')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('greet_back')
      expect(result!.response).toBe('Hello!')
    })

    it('applyPolicy matches "always" condition', () => {
      dm.setPolicy('fallback', [
        { condition: 'always', action: 'fallback', response: 'I am here.' },
      ])
      dm.addTurn('user', 'xyzzy')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('fallback')
    })

    it('applyPolicy matches slot filled condition', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setSlot('city', 'Paris')
      dm.setPolicy('p', [
        { condition: 'slot.city == filled', action: 'proceed', response: 'Great!' },
      ])
      dm.addTurn('user', 'ok')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('proceed')
    })

    it('applyPolicy matches slot missing condition', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setPolicy('p', [
        { condition: 'slot.city == missing', action: 'ask', response: 'Which city?' },
      ])
      dm.addTurn('user', 'ok')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('ask')
    })

    it('applyPolicy matches turns > N condition', () => {
      dm.setPolicy('p', [{ condition: 'turns > 2', action: 'check', response: 'Many turns!' }])
      dm.addTurn('user', 'a')
      dm.addTurn('system', 'b')
      dm.addTurn('user', 'c')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('check')
    })

    it('applyPolicy matches all_slots_filled condition', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setSlot('city', 'Paris')
      dm.setPolicy('p', [{ condition: 'all_slots_filled', action: 'done', response: 'All set!' }])
      dm.addTurn('user', 'ok')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('done')
    })

    it('applyPolicy matches has_missing_slots condition', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setPolicy('p', [{ condition: 'has_missing_slots', action: 'ask', response: 'Need info' }])
      dm.addTurn('user', 'ok')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('ask')
    })

    it('applyPolicy falls back to asking missing slot when no rule matches', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'Which city?' }])
      dm.setPolicy('p', [{ condition: 'act == bye', action: 'end', response: 'Goodbye' }])
      dm.addTurn('user', 'Hello')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('ask_slot')
      expect(result!.response).toBe('Which city?')
    })

    it('higher-priority policies are evaluated first', () => {
      dm.setPolicy('low', [{ condition: 'always', action: 'low_action', response: 'Low' }], 0.1)
      dm.setPolicy('high', [{ condition: 'always', action: 'high_action', response: 'High' }], 0.9)
      dm.addTurn('user', 'hi')
      const result = dm.applyPolicy()
      expect(result!.action).toBe('high_action')
    })

    it('applyPolicy matches flow == node condition', () => {
      dm.defineFlow(
        'f',
        ['start', 'end'],
        [{ from: 'start', to: 'end', condition: 'go', priority: 1 }],
        'start',
        ['end'],
      )
      dm.setPolicy('p', [
        { condition: 'flow == start', action: 'flow_start', response: 'At start' },
      ])
      dm.addTurn('user', 'hi')
      const result = dm.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('flow_start')
    })
  })

  // ── Repair Strategies ────────────────────────────────────────────────

  describe('detectMisunderstanding / suggestRepair', () => {
    it('returns false with fewer than 2 turns', () => {
      dm.addTurn('user', 'Hello')
      expect(dm.detectMisunderstanding()).toBe(false)
    })

    it('detects user correction after system turn', () => {
      dm.addTurn('system', 'Your city is London')
      dm.addTurn('user', 'Actually, I meant Paris')
      expect(dm.detectMisunderstanding()).toBe(true)
    })

    it('detects user clarify request as misunderstanding', () => {
      dm.addTurn('system', 'I booked your flight.')
      dm.addTurn('user', 'Clarify what you just said')
      expect(dm.detectMisunderstanding()).toBe(true)
    })

    it('detects user denial as misunderstanding', () => {
      dm.addTurn('system', 'So you want to go to Berlin?')
      dm.addTurn('user', 'No, that is wrong')
      expect(dm.detectMisunderstanding()).toBe(true)
    })

    it('detects consecutive unknown acts as misunderstanding', () => {
      dm.addTurn('user', 'xyzzy foobaz')
      dm.addTurn('system', 'qwerty asdf')
      // Both should classify as unknown
      expect(dm.detectMisunderstanding()).toBe(true)
    })

    it('returns false for normal exchanges', () => {
      dm.addTurn('user', 'Hello')
      dm.addTurn('system', 'Hi, how can I help?')
      expect(dm.detectMisunderstanding()).toBe(false)
    })

    it('suggestRepair returns rephrase by default with no turns', () => {
      const repair = dm.suggestRepair()
      expect(repair.type).toBe('rephrase')
    })

    it('suggestRepair returns confirm for correction act', () => {
      dm.addTurn('user', 'Actually, I meant Paris')
      const repair = dm.suggestRepair()
      expect(repair.type).toBe('confirm')
    })

    it('suggestRepair returns rephrase for clarify/repeat acts with prior system turn', () => {
      dm.addTurn('system', 'The booking is confirmed.')
      dm.addTurn('user', 'Could you repeat that?')
      const repair = dm.suggestRepair()
      expect(repair.type).toBe('rephrase')
      expect(repair.message).toContain('rephrase')
    })

    it('suggestRepair returns disambiguate when missing slots exist', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'Which city?' }])
      dm.addTurn('user', 'Hello')
      const repair = dm.suggestRepair()
      expect(repair.type).toBe('disambiguate')
      expect(repair.message).toBe('Which city?')
    })

    it('suggestRepair escalates after max repair attempts', () => {
      const m = new DialogueManager({ repairMaxAttempts: 2 })
      m.addTurn('system', 'A')
      m.addTurn('user', 'No, wrong')
      m.detectMisunderstanding()
      m.addTurn('system', 'B')
      m.addTurn('user', 'No, incorrect')
      m.detectMisunderstanding()
      const repair = m.suggestRepair()
      expect(repair.type).toBe('escalate')
    })

    it('resetRepairAttempts resets the counter', () => {
      dm.addTurn('system', 'X')
      dm.addTurn('user', 'No, wrong')
      dm.detectMisunderstanding()
      dm.resetRepairAttempts()
      // After reset, suggestRepair should not escalate
      const repair = dm.suggestRepair()
      expect(repair.type).not.toBe('escalate')
    })
  })

  // ── Topic Segmentation ───────────────────────────────────────────────

  describe('detectTopicChange / getTopicSegments', () => {
    it('detectTopicChange returns false with fewer than 2 user turns', () => {
      dm.addTurn('user', 'Hello')
      expect(dm.detectTopicChange()).toBe(false)
    })

    it('detectTopicChange returns false for similar consecutive messages', () => {
      dm.addTurn('user', 'I want to book a flight to Paris')
      dm.addTurn('user', 'I want to book a flight to London')
      expect(dm.detectTopicChange()).toBe(false)
    })

    it('detectTopicChange returns true for very different topics', () => {
      dm.addTurn('user', 'I want to book a flight to Paris tomorrow morning')
      dm.addTurn('user', 'Tell me about quantum physics and black holes')
      expect(dm.detectTopicChange()).toBe(true)
    })

    it('getTopicSegments returns segments after topic changes via addTurn', () => {
      dm.addTurn('user', 'I want to book a flight to Paris tomorrow morning')
      dm.addTurn('user', 'Tell me about deep sea marine biology research')
      const segments = dm.getTopicSegments()
      expect(segments.length).toBeGreaterThanOrEqual(1)
    })

    it('getTopicSegments returns a copy', () => {
      dm.addTurn('user', 'Hello there my friend')
      const seg1 = dm.getTopicSegments()
      seg1.pop()
      expect(dm.getTopicSegments().length).toBeGreaterThanOrEqual(1)
    })

    it('first user turn creates an initial topic segment', () => {
      dm.addTurn('user', 'I want pizza delivery')
      expect(dm.getTopicSegments()).toHaveLength(1)
      expect(dm.getTopicSegments()[0].keywords.length).toBeGreaterThan(0)
    })
  })

  // ── Engagement Metrics ───────────────────────────────────────────────

  describe('getEngagementScore / getDialogueCohesion', () => {
    it('engagement score is 0 with no turns', () => {
      expect(dm.getEngagementScore()).toBe(0)
    })

    it('engagement score is 0 with only system turns', () => {
      dm.addTurn('system', 'Hello')
      expect(dm.getEngagementScore()).toBe(0)
    })

    it('engagement score is between 0 and 1 with user turns', () => {
      dm.addTurn('user', 'Hello there, I need help with booking a flight')
      dm.addTurn('user', 'Can you show me available flights?')
      const score = dm.getEngagementScore()
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    it('engagement increases with longer user messages', () => {
      const m1 = new DialogueManager()
      m1.addTurn('user', 'Hi')

      const m2 = new DialogueManager()
      m2.addTurn(
        'user',
        'Hello, I would like to book a very nice flight from New York to Paris for my family vacation next summer',
      )

      expect(m2.getEngagementScore()).toBeGreaterThanOrEqual(m1.getEngagementScore())
    })

    it('cohesion is 1 with fewer than 2 turns', () => {
      expect(dm.getDialogueCohesion()).toBe(1)
      dm.addTurn('user', 'Hello')
      expect(dm.getDialogueCohesion()).toBe(1)
    })

    it('cohesion is higher for on-topic conversations', () => {
      const m1 = new DialogueManager()
      m1.addTurn('user', 'I want to book a flight to Paris')
      m1.addTurn('system', 'Sure, booking a flight to Paris')
      m1.addTurn('user', 'The flight to Paris should be first class')

      const m2 = new DialogueManager()
      m2.addTurn('user', 'I want to book a flight to Paris')
      m2.addTurn('system', 'Sure thing')
      m2.addTurn('user', 'Tell me about quantum mechanics and string theory')

      expect(m1.getDialogueCohesion()).toBeGreaterThan(m2.getDialogueCohesion())
    })

    it('cohesion returns a value between 0 and 1', () => {
      dm.addTurn('user', 'Hello world')
      dm.addTurn('system', 'Greetings earth')
      const c = dm.getDialogueCohesion()
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(1)
    })
  })

  // ── Serialization / Deserialization ──────────────────────────────────

  describe('serialize / deserialize', () => {
    it('serializes to a valid JSON string', () => {
      dm.addTurn('user', 'Hello')
      const json = dm.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserializes back to a working DialogueManager', () => {
      dm.addTurn('user', 'Hello')
      dm.addTurn('system', 'Hi there')
      const json = dm.serialize()
      const restored = DialogueManager.deserialize(json)
      expect(restored.getTurns()).toHaveLength(2)
      expect(restored.getLatestTurn()!.text).toBe('Hi there')
    })

    it('preserves slots through serialization', () => {
      dm.defineSlots([{ name: 'city', type: 'string', required: true, prompt: 'City?' }])
      dm.setSlot('city', 'Tokyo')
      const restored = DialogueManager.deserialize(dm.serialize())
      expect(restored.getFilledSlots()).toHaveLength(1)
      expect(restored.getSlot('city')!.value).toBe('Tokyo')
    })

    it('preserves goals through serialization', () => {
      dm.addGoal('G1', 'Desc')
      const restored = DialogueManager.deserialize(dm.serialize())
      expect(restored.getGoals()).toHaveLength(1)
      expect(restored.getGoals()[0].name).toBe('G1')
    })

    it('preserves flows through serialization', () => {
      dm.defineFlow('f', ['a', 'b'], [{ from: 'a', to: 'b', condition: 'go', priority: 1 }], 'a', [
        'b',
      ])
      const restored = DialogueManager.deserialize(dm.serialize())
      expect(restored.getStats().flowCount).toBe(1)
    })

    it('preserves policies through serialization', () => {
      dm.setPolicy('p', [{ condition: 'always', action: 'a', response: 'r' }])
      dm.addTurn('user', 'hi')
      const restored = DialogueManager.deserialize(dm.serialize())
      const result = restored.applyPolicy()
      expect(result).not.toBeNull()
      expect(result!.action).toBe('a')
    })

    it('preserves config through serialization', () => {
      const m = new DialogueManager({ maxTurns: 5 })
      m.addTurn('user', 'a')
      m.addTurn('user', 'b')
      m.addTurn('user', 'c')
      m.addTurn('user', 'd')
      m.addTurn('user', 'e')
      const restored = DialogueManager.deserialize(m.serialize())
      restored.addTurn('user', 'f') // should evict oldest
      expect(restored.getTurns()).toHaveLength(5)
    })

    it('preserves topic segments through serialization', () => {
      dm.addTurn('user', 'I want to book a flight to Paris')
      const restored = DialogueManager.deserialize(dm.serialize())
      expect(restored.getTopicSegments().length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Statistics ───────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns all expected stat fields', () => {
      const stats = dm.getStats()
      expect(stats).toHaveProperty('totalTurns')
      expect(stats).toHaveProperty('userTurns')
      expect(stats).toHaveProperty('systemTurns')
      expect(stats).toHaveProperty('avgTurnLength')
      expect(stats).toHaveProperty('totalGoals')
      expect(stats).toHaveProperty('completedGoals')
      expect(stats).toHaveProperty('activeGoals')
      expect(stats).toHaveProperty('filledSlotCount')
      expect(stats).toHaveProperty('totalSlotCount')
      expect(stats).toHaveProperty('topicChanges')
      expect(stats).toHaveProperty('engagementScore')
      expect(stats).toHaveProperty('flowCount')
    })

    it('counts user and system turns correctly', () => {
      dm.addTurn('user', 'Hello')
      dm.addTurn('system', 'Hi')
      dm.addTurn('user', 'Thanks')
      const stats = dm.getStats()
      expect(stats.totalTurns).toBe(3)
      expect(stats.userTurns).toBe(2)
      expect(stats.systemTurns).toBe(1)
    })

    it('computes average turn length', () => {
      dm.addTurn('user', 'Hello') // 5 chars
      dm.addTurn('system', 'Hi there') // 8 chars
      const stats = dm.getStats()
      expect(stats.avgTurnLength).toBe(Math.round((5 + 8) / 2))
    })

    it('avgTurnLength is 0 when no turns', () => {
      expect(dm.getStats().avgTurnLength).toBe(0)
    })

    it('counts goals correctly', () => {
      const g1 = dm.addGoal('G1', 'D')
      dm.addGoal('G2', 'D')
      dm.completeGoal(g1.id)
      const stats = dm.getStats()
      expect(stats.totalGoals).toBe(2)
      expect(stats.completedGoals).toBe(1)
      expect(stats.activeGoals).toBe(1)
    })

    it('counts slots correctly', () => {
      dm.defineSlots([
        { name: 'a', type: 'string', required: true, prompt: 'A?' },
        { name: 'b', type: 'string', required: true, prompt: 'B?' },
      ])
      dm.setSlot('a', 'val')
      const stats = dm.getStats()
      expect(stats.totalSlotCount).toBe(2)
      expect(stats.filledSlotCount).toBe(1)
    })

    it('counts flows', () => {
      dm.defineFlow('f1', ['a'], [], 'a', ['a'])
      dm.defineFlow('f2', ['b'], [], 'b', ['b'])
      expect(dm.getStats().flowCount).toBe(2)
    })
  })
})
