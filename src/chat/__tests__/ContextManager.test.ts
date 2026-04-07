import { describe, it, expect, beforeEach } from 'vitest'
import {
  ContextManager,
  type ContextTurn,
} from '../ContextManager'

// ── Helpers ──

function makeTurn(
  role: 'user' | 'assistant',
  content: string,
  timestamp: number,
  overrides?: Partial<ContextTurn>,
): ContextTurn {
  return { role, content, timestamp, ...overrides }
}

// ── Constructor Tests ──

describe('ContextManager constructor', () => {
  it('creates an instance with default config', () => {
    const mgr = new ContextManager()
    const stats = mgr.getStats()
    expect(stats.windowSize).toBe(20)
    expect(stats.totalTurns).toBe(0)
  })

  it('accepts a partial custom config', () => {
    const mgr = new ContextManager({ windowSize: 5 })
    const stats = mgr.getStats()
    expect(stats.windowSize).toBe(5)
  })

  it('merges partial config with defaults', () => {
    const mgr = new ContextManager({ windowSize: 10, decayFactor: 0.2 })
    // windowSize is overridden, but the manager still works with default entityLifespan etc.
    const stats = mgr.getStats()
    expect(stats.windowSize).toBe(10)
  })
})

// ── addTurn & getStats Tests ──

describe('addTurn and getStats', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('increments totalTurns after adding a turn', () => {
    mgr.addTurn(makeTurn('user', 'hello', 1000))
    expect(mgr.getStats().totalTurns).toBe(1)
  })

  it('increments totalTurns for multiple turns', () => {
    mgr.addTurn(makeTurn('user', 'first', 1000))
    mgr.addTurn(makeTurn('assistant', 'second', 2000))
    mgr.addTurn(makeTurn('user', 'third', 3000))
    expect(mgr.getStats().totalTurns).toBe(3)
  })

  it('auto-detects topic when not provided', () => {
    mgr.addTurn(makeTurn('user', 'How do I fix this bug and debug the error?', 1000))
    const topic = mgr.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic!.name).toBeDefined()
  })

  it('preserves explicitly provided topic', () => {
    mgr.addTurn(makeTurn('user', 'some text', 1000, { topic: 'custom-topic' }))
    const topic = mgr.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic!.name).toBe('custom-topic')
  })

  it('auto-extracts entities when not provided', () => {
    mgr.addTurn(makeTurn('user', 'I am using React and TypeScript', 1000))
    const entities = mgr.getActiveEntities()
    const names = entities.map(e => e.name.toLowerCase())
    expect(names).toContain('react')
    expect(names).toContain('typescript')
  })

  it('preserves explicitly provided entities', () => {
    mgr.addTurn(makeTurn('user', 'some text', 1000, { entities: ['MyEntity'] }))
    const entities = mgr.getActiveEntities()
    const names = entities.map(e => e.name)
    expect(names).toContain('MyEntity')
  })
})

// ── getRelevantContext Tests ──

describe('getRelevantContext', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('returns empty array when no turns exist', () => {
    expect(mgr.getRelevantContext('anything')).toEqual([])
  })

  it('returns relevant turns matching the query', () => {
    mgr.addTurn(makeTurn('user', 'How to sort an array in JavaScript', 1000))
    mgr.addTurn(makeTurn('assistant', 'You can use Array.prototype.sort()', 2000))
    mgr.addTurn(makeTurn('user', 'Tell me about cooking pasta', 3000))

    const results = mgr.getRelevantContext('sort array')
    expect(results.length).toBeGreaterThan(0)
    const contents = results.map(r => r.content)
    expect(contents.some(c => c.includes('sort'))).toBe(true)
  })

  it('respects maxTurns limit', () => {
    for (let i = 0; i < 15; i++) {
      mgr.addTurn(makeTurn('user', `testing topic number ${i}`, 1000 + i * 100))
    }
    const results = mgr.getRelevantContext('testing topic', 3)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('returns only turns with positive score', () => {
    // Use timestamps far apart so the freshness bonus doesn't apply to old turns
    mgr.addTurn(makeTurn('user', 'apple banana cherry', 1000))
    mgr.addTurn(makeTurn('user', 'completely unrelated xyz', 1000 + 120_000))

    const results = mgr.getRelevantContext('apple banana')
    // The matching turn should be returned
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.content.includes('apple'))).toBe(true)
  })

  it('ranks more recent relevant turns higher', () => {
    mgr.addTurn(makeTurn('user', 'sort an array in python', 1000))
    mgr.addTurn(makeTurn('user', 'unrelated stuff here', 2000))
    mgr.addTurn(makeTurn('user', 'sort an array in python', 3000))

    const results = mgr.getRelevantContext('sort array python')
    expect(results.length).toBeGreaterThanOrEqual(2)
    // The more recent identical turn should appear first due to recency decay
    expect(results[0].timestamp).toBe(3000)
  })

  it('default maxTurns is 10', () => {
    for (let i = 0; i < 20; i++) {
      mgr.addTurn(makeTurn('user', 'test code function method', 1000 + i * 100))
    }
    const results = mgr.getRelevantContext('test code function')
    expect(results.length).toBeLessThanOrEqual(10)
  })
})

// ── getCurrentTopic Tests ──

describe('getCurrentTopic', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('returns null when no turns have been added', () => {
    expect(mgr.getCurrentTopic()).toBeNull()
  })

  it('detects programming topic from code-related keywords', () => {
    mgr.addTurn(makeTurn('user', 'implement a function that returns the class method', 1000))
    const topic = mgr.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic!.name).toBe('programming')
  })

  it('detects debugging topic from error-related keywords', () => {
    mgr.addTurn(makeTurn('user', 'I have a bug and the error causes a crash with an exception', 1000))
    const topic = mgr.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic!.name).toBe('debugging')
  })

  it('detects testing topic from test-related keywords', () => {
    mgr.addTurn(makeTurn('user', 'write a test spec with describe expect assert mock', 1000))
    const topic = mgr.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic!.name).toBe('testing')
  })

  it('returns a TopicInfo with expected shape', () => {
    mgr.addTurn(makeTurn('user', 'code function variable class method', 1000))
    const topic = mgr.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic).toHaveProperty('name')
    expect(topic).toHaveProperty('confidence')
    expect(topic).toHaveProperty('turnCount')
    expect(topic).toHaveProperty('firstSeen')
    expect(topic).toHaveProperty('lastSeen')
  })
})

// ── getTopicHistory Tests ──

describe('getTopicHistory', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('returns empty array when no topics detected', () => {
    expect(mgr.getTopicHistory()).toEqual([])
  })

  it('tracks multiple distinct topics', () => {
    mgr.addTurn(makeTurn('user', 'implement a function variable class method algorithm', 1000))
    mgr.addTurn(makeTurn('user', 'fix the bug error crash exception debug', 2000))

    const history = mgr.getTopicHistory()
    const topicNames = history.map(t => t.name)
    expect(topicNames.length).toBeGreaterThanOrEqual(2)
  })

  it('orders topics by firstSeen timestamp', () => {
    mgr.addTurn(makeTurn('user', 'function variable class method code algorithm', 1000))
    mgr.addTurn(makeTurn('user', 'bug error crash exception debug fix', 2000))
    mgr.addTurn(makeTurn('user', 'deploy build ci cd pipeline docker', 3000))

    const history = mgr.getTopicHistory()
    for (let i = 1; i < history.length; i++) {
      expect(history[i].firstSeen).toBeGreaterThanOrEqual(history[i - 1].firstSeen)
    }
  })

  it('increments turnCount when topic is revisited', () => {
    mgr.addTurn(makeTurn('user', 'code function variable class method implement', 1000))
    mgr.addTurn(makeTurn('user', 'implement algorithm loop array object return', 2000))

    const history = mgr.getTopicHistory()
    const programming = history.find(t => t.name === 'programming')
    expect(programming).toBeDefined()
    expect(programming!.turnCount).toBeGreaterThanOrEqual(2)
  })
})

// ── getActiveEntities Tests ──

describe('getActiveEntities', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('returns empty array when no entities exist', () => {
    expect(mgr.getActiveEntities()).toEqual([])
  })

  it('detects programming language names', () => {
    mgr.addTurn(makeTurn('user', 'I love using python and javascript', 1000))
    const names = mgr.getActiveEntities().map(e => e.name.toLowerCase())
    expect(names).toContain('python')
    expect(names).toContain('javascript')
  })

  it('detects framework names', () => {
    mgr.addTurn(makeTurn('user', 'Building an app with react and express', 1000))
    const names = mgr.getActiveEntities().map(e => e.name.toLowerCase())
    expect(names).toContain('react')
    expect(names).toContain('express')
  })

  it('detects camelCase identifiers', () => {
    mgr.addTurn(makeTurn('user', 'The myFunction and getUserData are broken', 1000))
    const names = mgr.getActiveEntities().map(e => e.name)
    expect(names).toContain('myFunction')
    expect(names).toContain('getUserData')
  })

  it('detects backtick code spans as entities', () => {
    mgr.addTurn(makeTurn('user', 'Check the `processItems` method', 1000))
    const names = mgr.getActiveEntities().map(e => e.name)
    expect(names).toContain('processItems')
  })

  it('tracks entity mention counts', () => {
    mgr.addTurn(makeTurn('user', 'I use react for the frontend', 1000))
    mgr.addTurn(makeTurn('user', 'react is great for building UIs', 2000))
    const reactEntity = mgr.getActiveEntities().find(e => e.name.toLowerCase() === 'react')
    expect(reactEntity).toBeDefined()
    expect(reactEntity!.mentions).toBeGreaterThanOrEqual(2)
  })

  it('returns entities sorted by decayedRelevance descending', () => {
    mgr.addTurn(makeTurn('user', 'Working with python and typescript and react', 1000))
    const entities = mgr.getActiveEntities()
    for (let i = 1; i < entities.length; i++) {
      expect(entities[i - 1].decayedRelevance).toBeGreaterThanOrEqual(entities[i].decayedRelevance)
    }
  })

  it('each entity has the expected shape', () => {
    mgr.addTurn(makeTurn('user', 'Using typescript', 1000))
    const entities = mgr.getActiveEntities()
    expect(entities.length).toBeGreaterThan(0)
    const entity = entities[0]
    expect(entity).toHaveProperty('name')
    expect(entity).toHaveProperty('type')
    expect(entity).toHaveProperty('mentions')
    expect(entity).toHaveProperty('lastMentioned')
    expect(entity).toHaveProperty('decayedRelevance')
  })
})

// ── resolveReference Tests ──

describe('resolveReference', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('returns text unchanged when no pronoun trigger is found', () => {
    expect(mgr.resolveReference('How does sorting work?')).toBe('How does sorting work?')
  })

  it('returns text unchanged when no context is available', () => {
    expect(mgr.resolveReference('What does it do?')).toBe('What does it do?')
  })

  it('resolves "it" to the most recent entity', () => {
    mgr.addTurn(makeTurn('user', 'Tell me about the `processData` function', 1000))
    mgr.addTurn(makeTurn('assistant', 'processData takes an array and filters items', 2000))

    const resolved = mgr.resolveReference('Can you refactor it?')
    expect(resolved).not.toBe('Can you refactor it?')
    expect(resolved.toLowerCase()).toContain('processdata')
  })

  it('resolves "that" based on recent context', () => {
    mgr.addTurn(makeTurn('user', 'The `handleClick` handler is not working', 1000))

    const resolved = mgr.resolveReference('Can you fix that?')
    expect(resolved).not.toBe('Can you fix that?')
  })

  it('resolves "the function" trigger', () => {
    mgr.addTurn(makeTurn('user', 'I wrote a fetchUsers function using react', 1000))

    const resolved = mgr.resolveReference('Can you optimize the function?')
    // Should replace "the function" with a referent from context
    expect(resolved).not.toBe('Can you optimize the function?')
  })
})

// ── summarize Tests ──

describe('summarize', () => {
  let mgr: ContextManager

  beforeEach(() => {
    mgr = new ContextManager()
  })

  it('returns a ContextSummary with unknown topic when empty', () => {
    const summary = mgr.summarize()
    expect(summary.currentTopic).toBe('unknown')
    expect(summary.turnCount).toBe(0)
    expect(summary.activeEntities).toEqual([])
    expect(summary.recentActions).toEqual([])
  })

  it('returns the correct turnCount', () => {
    mgr.addTurn(makeTurn('user', 'hello', 1000))
    mgr.addTurn(makeTurn('assistant', 'hi there', 2000))
    const summary = mgr.summarize()
    expect(summary.turnCount).toBe(2)
  })

  it('includes only user turns in recentActions', () => {
    mgr.addTurn(makeTurn('user', 'Help me write a function', 1000))
    mgr.addTurn(makeTurn('assistant', 'Sure, here is a function', 2000))
    mgr.addTurn(makeTurn('user', 'Now add error handling', 3000))

    const summary = mgr.summarize()
    expect(summary.recentActions.length).toBe(2)
  })

  it('limits recentActions to at most 5', () => {
    for (let i = 0; i < 10; i++) {
      mgr.addTurn(makeTurn('user', `User message number ${i}`, 1000 + i * 100))
    }
    const summary = mgr.summarize()
    expect(summary.recentActions.length).toBeLessThanOrEqual(5)
  })

  it('has the expected ContextSummary shape', () => {
    mgr.addTurn(makeTurn('user', 'Code a function in typescript', 1000))
    const summary = mgr.summarize()
    expect(summary).toHaveProperty('currentTopic')
    expect(summary).toHaveProperty('activeEntities')
    expect(summary).toHaveProperty('recentActions')
    expect(summary).toHaveProperty('turnCount')
  })

  it('truncates long turn content in recentActions', () => {
    const longContent = 'a'.repeat(200)
    mgr.addTurn(makeTurn('user', longContent, 1000))
    const summary = mgr.summarize()
    expect(summary.recentActions[0].length).toBeLessThanOrEqual(80)
  })
})

// ── serialize / deserialize Tests ──

describe('serialize and deserialize', () => {
  it('produces a valid JSON string', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'hello world', 1000))
    const json = mgr.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('round-trips turns correctly', () => {
    const mgr = new ContextManager({ windowSize: 15 })
    mgr.addTurn(makeTurn('user', 'implement a function in typescript', 1000))
    mgr.addTurn(makeTurn('assistant', 'Here is the implementation using react', 2000))

    const json = mgr.serialize()
    const restored = ContextManager.deserialize(json)

    expect(restored.getStats().totalTurns).toBe(2)
  })

  it('preserves config through serialization', () => {
    const mgr = new ContextManager({ windowSize: 7, decayFactor: 0.5 })
    mgr.addTurn(makeTurn('user', 'test', 1000))

    const restored = ContextManager.deserialize(mgr.serialize())
    expect(restored.getStats().windowSize).toBe(7)
  })

  it('preserves topic state through serialization', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'function variable class method code algorithm', 1000))

    const restored = ContextManager.deserialize(mgr.serialize())
    const topic = restored.getCurrentTopic()
    expect(topic).not.toBeNull()
    expect(topic!.name).toBe(mgr.getCurrentTopic()!.name)
  })

  it('preserves entity state through serialization', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'I use react and typescript daily', 1000))

    const originalEntities = mgr.getActiveEntities().map(e => e.name).sort()
    const restored = ContextManager.deserialize(mgr.serialize())
    const restoredEntities = restored.getActiveEntities().map(e => e.name).sort()
    expect(restoredEntities).toEqual(originalEntities)
  })

  it('restored manager continues to work (addTurn after deserialize)', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'hello', 1000))

    const restored = ContextManager.deserialize(mgr.serialize())
    restored.addTurn(makeTurn('user', 'world', 2000))
    expect(restored.getStats().totalTurns).toBe(2)
  })
})

// ── reset Tests ──

describe('reset', () => {
  it('clears all turns', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'some text', 1000))
    mgr.addTurn(makeTurn('assistant', 'reply', 2000))
    mgr.reset()
    expect(mgr.getStats().totalTurns).toBe(0)
  })

  it('clears topic state', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'function variable class method code', 1000))
    expect(mgr.getCurrentTopic()).not.toBeNull()

    mgr.reset()
    expect(mgr.getCurrentTopic()).toBeNull()
  })

  it('clears entity state', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'Using react and typescript', 1000))
    expect(mgr.getActiveEntities().length).toBeGreaterThan(0)

    mgr.reset()
    expect(mgr.getActiveEntities()).toEqual([])
  })

  it('clears topic history', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'code function variable class method', 1000))
    mgr.addTurn(makeTurn('user', 'bug error crash debug fix', 2000))
    expect(mgr.getTopicHistory().length).toBeGreaterThan(0)

    mgr.reset()
    expect(mgr.getTopicHistory()).toEqual([])
  })

  it('allows adding new turns after reset', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'first', 1000))
    mgr.reset()
    mgr.addTurn(makeTurn('user', 'second', 2000))
    expect(mgr.getStats().totalTurns).toBe(1)
  })
})

// ── Window Size Limits ──

describe('window size limits', () => {
  it('evicts oldest turns when window size is exceeded', () => {
    const mgr = new ContextManager({ windowSize: 3 })
    mgr.addTurn(makeTurn('user', 'alpha unique term', 1000))
    mgr.addTurn(makeTurn('user', 'beta another phrase', 2000))
    mgr.addTurn(makeTurn('user', 'gamma different words', 3000))
    mgr.addTurn(makeTurn('user', 'delta fresh content', 4000))

    expect(mgr.getStats().totalTurns).toBe(3)
    // The oldest turn ("alpha") should be evicted
    const results = mgr.getRelevantContext('alpha beta gamma delta')
    const contents = results.map(r => r.content)
    expect(contents).not.toContain('alpha unique term')
    expect(contents).toContain('delta fresh content')
  })

  it('does not evict when within window size', () => {
    const mgr = new ContextManager({ windowSize: 5 })
    mgr.addTurn(makeTurn('user', 'alpha', 1000))
    mgr.addTurn(makeTurn('user', 'beta', 2000))
    mgr.addTurn(makeTurn('user', 'gamma', 3000))

    expect(mgr.getStats().totalTurns).toBe(3)
  })

  it('maintains exactly windowSize turns after many additions', () => {
    const windowSize = 5
    const mgr = new ContextManager({ windowSize })

    for (let i = 0; i < 50; i++) {
      mgr.addTurn(makeTurn('user', `turn ${i}`, 1000 + i * 100))
    }

    expect(mgr.getStats().totalTurns).toBe(windowSize)
  })
})

// ── Edge Cases ──

describe('edge cases', () => {
  it('handles empty content gracefully', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', '', 1000))
    expect(mgr.getStats().totalTurns).toBe(1)
  })

  it('getRelevantContext handles empty query', () => {
    const mgr = new ContextManager()
    // Use distant timestamps so freshness bonus doesn't apply
    mgr.addTurn(makeTurn('user', 'some content', 1000))
    mgr.addTurn(makeTurn('user', 'other content', 1000 + 120_000))
    const results = mgr.getRelevantContext('')
    // Even without keyword overlap, recent turns may still appear due to freshness bonus
    // Just ensure no error is thrown and it returns an array
    expect(Array.isArray(results)).toBe(true)
  })

  it('getStats returns correct uniqueTopics count', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'code function variable class method implement', 1000))
    mgr.addTurn(makeTurn('user', 'bug error crash exception debug fix', 2000))

    const stats = mgr.getStats()
    expect(stats.uniqueTopics).toBeGreaterThanOrEqual(2)
  })

  it('detects function call pattern entities', () => {
    const mgr = new ContextManager()
    mgr.addTurn(makeTurn('user', 'call getData() and processItems() in the loop', 1000))
    const names = mgr.getActiveEntities().map(e => e.name.toLowerCase())
    expect(names).toContain('getdata')
    expect(names).toContain('processitems')
  })
})
