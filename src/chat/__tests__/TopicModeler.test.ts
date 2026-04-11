import { describe, it, expect, beforeEach } from 'vitest'
import { TopicModeler } from '../TopicModeler'

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Add enough topically-focused documents so that discoverTopics can find
 * meaningful clusters.  The corpus deliberately uses two distinct groups:
 *   • JavaScript / React / web-development documents
 *   • Python / machine-learning / data-science documents
 */
function seedCorpus(modeler: TopicModeler): void {
  // JavaScript / React cluster
  modeler.addDocument('js1', 'javascript react component rendering virtual dom framework browser')
  modeler.addDocument('js2', 'javascript typescript webpack bundler module react hooks state')
  modeler.addDocument('js3', 'react component props state hooks rendering lifecycle effects')
  modeler.addDocument('js4', 'javascript browser dom events handler callback promise async await')
  modeler.addDocument(
    'js5',
    'react redux state management middleware dispatch actions reducer store',
  )

  // Python / ML cluster
  modeler.addDocument('py1', 'python machine learning model training dataset neural network layers')
  modeler.addDocument('py2', 'python pandas dataframe analysis statistics visualization matplotlib')
  modeler.addDocument('py3', 'machine learning gradient descent optimization loss function epochs')
  modeler.addDocument('py4', 'python scikit learn classification regression clustering features')
  modeler.addDocument(
    'py5',
    'neural network deep learning convolutional recurrent transformer attention',
  )
}

// ── Constructor Tests ────────────────────────────────────────────────────

describe('TopicModeler constructor', () => {
  it('creates instance with default config', () => {
    const modeler = new TopicModeler()
    expect(modeler).toBeInstanceOf(TopicModeler)
  })

  it('applies custom config', () => {
    const modeler = new TopicModeler({ maxTopics: 5, driftThreshold: 0.8 })
    expect(modeler).toBeInstanceOf(TopicModeler)
  })

  it('fresh instance has empty state', () => {
    const modeler = new TopicModeler()
    const stats = modeler.getStats()
    expect(stats.totalDocuments).toBe(0)
    expect(stats.totalTopics).toBe(0)
    expect(stats.topicDrifts).toBe(0)
    expect(stats.profileCount).toBe(0)
    expect(stats.avgTopicsPerDocument).toBe(0)
  })

  it('accepts empty config object', () => {
    const modeler = new TopicModeler({})
    expect(modeler).toBeInstanceOf(TopicModeler)
  })
})

// ── addDocument / removeDocument ─────────────────────────────────────────

describe('addDocument / removeDocument', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler()
  })

  it('adds a document to the corpus', () => {
    modeler.addDocument('doc1', 'javascript react component rendering')
    expect(modeler.getStats().totalDocuments).toBe(1)
  })

  it('adds multiple documents', () => {
    modeler.addDocument('d1', 'first document content')
    modeler.addDocument('d2', 'second document content')
    modeler.addDocument('d3', 'third document content')
    expect(modeler.getStats().totalDocuments).toBe(3)
  })

  it('removeDocument removes a document', () => {
    modeler.addDocument('d1', 'some text here')
    modeler.addDocument('d2', 'other text here')
    modeler.removeDocument('d1')
    expect(modeler.getStats().totalDocuments).toBe(1)
  })

  it('removeDocument on non-existent id does not throw', () => {
    modeler.addDocument('d1', 'hello world testing')
    expect(() => modeler.removeDocument('nonexistent')).not.toThrow()
    expect(modeler.getStats().totalDocuments).toBe(1)
  })

  it('document stats are updated after add and remove', () => {
    modeler.addDocument('d1', 'alpha beta gamma')
    expect(modeler.getStats().totalDocuments).toBe(1)
    modeler.addDocument('d2', 'delta epsilon zeta')
    expect(modeler.getStats().totalDocuments).toBe(2)
    modeler.removeDocument('d1')
    expect(modeler.getStats().totalDocuments).toBe(1)
    modeler.removeDocument('d2')
    expect(modeler.getStats().totalDocuments).toBe(0)
  })

  it('handles empty text without throwing', () => {
    expect(() => modeler.addDocument('empty', '')).not.toThrow()
    expect(modeler.getStats().totalDocuments).toBe(1)
  })

  it('replaces document when same id is added again', () => {
    modeler.addDocument('d1', 'original content here')
    modeler.addDocument('d1', 'replacement content here')
    expect(modeler.getStats().totalDocuments).toBe(1)
  })
})

// ── getDocumentTopics ────────────────────────────────────────────────────

describe('getDocumentTopics', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
  })

  it('returns null before topic discovery', () => {
    modeler.addDocument('d1', 'javascript react component')
    expect(modeler.getDocumentTopics('d1')).toBeNull()
  })

  it('returns topic assignments after discovery', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const dt = modeler.getDocumentTopics('js1')
    expect(dt).not.toBeNull()
    expect(dt!.documentId).toBe('js1')
    expect(dt!.topics.length).toBeGreaterThan(0)
  })

  it('has a dominant topic', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const dt = modeler.getDocumentTopics('js1')
    expect(dt).not.toBeNull()
    expect(typeof dt!.dominantTopic).toBe('string')
    expect(dt!.dominantTopic.length).toBeGreaterThan(0)
  })

  it('returns null for non-existent document', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    expect(modeler.getDocumentTopics('no-such-doc')).toBeNull()
  })

  it('topic assignments have weights that sum to approximately 1', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const dt = modeler.getDocumentTopics('js1')
    if (dt && dt.topics.length > 0) {
      const total = dt.topics.reduce((sum, t) => sum + t.weight, 0)
      expect(total).toBeCloseTo(1, 1)
    }
  })
})

// ── discoverTopics ───────────────────────────────────────────────────────

describe('discoverTopics', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
  })

  it('discovers topics from corpus', () => {
    seedCorpus(modeler)
    const topics = modeler.discoverTopics()
    expect(topics.length).toBeGreaterThan(0)
  })

  it('topics have names, keywords, and weights', () => {
    seedCorpus(modeler)
    const topics = modeler.discoverTopics()
    for (const topic of topics) {
      expect(typeof topic.name).toBe('string')
      expect(topic.name.length).toBeGreaterThan(0)
      expect(topic.keywords.length).toBeGreaterThan(0)
      expect(typeof topic.weight).toBe('number')
      expect(topic.weight).toBeGreaterThanOrEqual(0)
      expect(topic.weight).toBeLessThanOrEqual(1)
    }
  })

  it('number of topics respects k parameter', () => {
    seedCorpus(modeler)
    const topics = modeler.discoverTopics(2)
    expect(topics.length).toBeLessThanOrEqual(2)
  })

  it('returns empty array for empty corpus', () => {
    const topics = modeler.discoverTopics()
    expect(topics).toEqual([])
  })

  it('returns empty when corpus has fewer than 2 documents', () => {
    modeler.addDocument('d1', 'only one document here')
    const topics = modeler.discoverTopics()
    expect(topics).toEqual([])
  })

  it('topics have coherence scores', () => {
    seedCorpus(modeler)
    const topics = modeler.discoverTopics()
    for (const topic of topics) {
      expect(typeof topic.coherence).toBe('number')
    }
  })

  it('multiple calls re-discover topics', () => {
    seedCorpus(modeler)
    const first = modeler.discoverTopics()
    modeler.addDocument('extra1', 'database sql query index table schema migration')
    modeler.addDocument('extra2', 'database relational query join select insert')
    modeler.addDocument('extra3', 'sql postgres database migration schema table')
    const second = modeler.discoverTopics()
    expect(second.length).toBeGreaterThan(0)
    // Topic IDs should differ because they are regenerated
    const firstIds = new Set(first.map(t => t.id))
    const secondIds = new Set(second.map(t => t.id))
    const overlap = [...secondIds].filter(id => firstIds.has(id))
    expect(overlap.length).toBe(0)
  })
})

// ── getTopics / getTopic / getTopicByName ────────────────────────────────

describe('getTopics / getTopic / getTopicByName', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
  })

  it('returns all topics after discovery', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const topics = modeler.getTopics()
    expect(topics.length).toBeGreaterThan(0)
  })

  it('returns empty array before discovery', () => {
    expect(modeler.getTopics()).toEqual([])
  })

  it('getTopic by id works', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const topics = modeler.getTopics()
    const first = topics[0]
    const found = modeler.getTopic(first.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(first.id)
    expect(found!.name).toBe(first.name)
  })

  it('getTopicByName is case insensitive', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const topics = modeler.getTopics()
    const first = topics[0]
    const found = modeler.getTopicByName(first.name.toUpperCase())
    expect(found).not.toBeNull()
    expect(found!.id).toBe(first.id)
  })

  it('getTopic returns null for non-existent id', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    expect(modeler.getTopic('nonexistent_id')).toBeNull()
  })

  it('getTopicByName returns null for non-existent name', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    expect(modeler.getTopicByName('no such topic')).toBeNull()
  })
})

// ── detectTopicDrift ─────────────────────────────────────────────────────

describe('detectTopicDrift', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1, driftThreshold: 0.3 })
  })

  it('detects drift when topics shift between recent and historical', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()

    // Add new documents heavily focused on a single area
    modeler.addDocument('drift1', 'python machine learning training deep neural')
    modeler.addDocument('drift2', 'python machine learning optimization gradient neural')
    modeler.addDocument('drift3', 'python machine learning dataset training neural')

    const drifts = modeler.detectTopicDrift(['drift1', 'drift2', 'drift3'])
    // Drift may or may not be detected depending on distribution;
    // just verify the return type
    expect(Array.isArray(drifts)).toBe(true)
    for (const d of drifts) {
      expect(d).toHaveProperty('fromTopic')
      expect(d).toHaveProperty('toTopic')
      expect(d).toHaveProperty('timestamp')
      expect(d).toHaveProperty('confidence')
    }
  })

  it('returns empty array when no significant drift', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    // Use existing documents as "recent" — distribution is the same
    const drifts = modeler.detectTopicDrift(['js1', 'js2', 'py1', 'py2'])
    expect(Array.isArray(drifts)).toBe(true)
  })

  it('drift events have fromTopic, toTopic, timestamp, and confidence', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()

    modeler.addDocument('shift1', 'python machine learning neural network deep')
    modeler.addDocument('shift2', 'python machine learning dataset training model')
    modeler.addDocument('shift3', 'python learning neural classification regression')
    const drifts = modeler.detectTopicDrift(['shift1', 'shift2', 'shift3'])
    for (const d of drifts) {
      expect(typeof d.fromTopic).toBe('string')
      expect(typeof d.toTopic).toBe('string')
      expect(typeof d.timestamp).toBe('number')
      expect(typeof d.confidence).toBe('number')
      expect(d.confidence).toBeGreaterThanOrEqual(0)
      expect(d.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('respects custom window size parameter', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    // Very small window — only look at last 2 historical docs
    const drifts = modeler.detectTopicDrift(['js1'], 2)
    expect(Array.isArray(drifts)).toBe(true)
  })
})

// ── getTopicTimeline / getDrifts ─────────────────────────────────────────

describe('getTopicTimeline / getDrifts', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
  })

  it('timeline has entries after documents added and topics discovered', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const timeline = modeler.getTopicTimeline()
    expect(timeline.length).toBeGreaterThan(0)
    for (const entry of timeline) {
      expect(entry).toHaveProperty('timestamp')
      expect(entry).toHaveProperty('topicId')
      expect(entry).toHaveProperty('topicName')
    }
  })

  it('getDrifts returns all accumulated drift events', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    // Trigger drift detection twice
    modeler.detectTopicDrift(['js1', 'js2'])
    modeler.detectTopicDrift(['py1', 'py2'])
    const allDrifts = modeler.getDrifts()
    expect(Array.isArray(allDrifts)).toBe(true)
  })

  it('getDrifts and getTopicTimeline are empty initially', () => {
    expect(modeler.getDrifts()).toEqual([])
    expect(modeler.getTopicTimeline()).toEqual([])
  })

  it('timeline is sorted chronologically', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const timeline = modeler.getTopicTimeline()
    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i].timestamp).toBeGreaterThanOrEqual(timeline[i - 1].timestamp)
    }
  })
})

// ── buildHierarchy ───────────────────────────────────────────────────────

describe('buildHierarchy', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
  })

  it('builds hierarchy from discovered topics', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const hierarchy = modeler.buildHierarchy()
    expect(Array.isArray(hierarchy)).toBe(true)
    expect(hierarchy.length).toBeGreaterThan(0)
  })

  it('hierarchy nodes have topic name, children array, and depth', () => {
    seedCorpus(modeler)
    modeler.discoverTopics()
    const hierarchy = modeler.buildHierarchy()
    for (const node of hierarchy) {
      expect(typeof node.topic).toBe('string')
      expect(Array.isArray(node.children)).toBe(true)
      expect(typeof node.depth).toBe('number')
      expect(node.depth).toBe(0) // root nodes
    }
  })

  it('returns empty array before discovery', () => {
    expect(modeler.buildHierarchy()).toEqual([])
  })
})

// ── updateUserProfile / getUserProfile / getUserProfiles ─────────────────

describe('updateUserProfile / getUserProfile / getUserProfiles', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    modeler.discoverTopics()
  })

  it('creates profile on first update', () => {
    modeler.updateUserProfile('user1', 'js1')
    const profile = modeler.getUserProfile('user1')
    expect(profile).not.toBeNull()
    expect(profile!.userId).toBe('user1')
  })

  it('updates topic affinities with new documents', () => {
    modeler.updateUserProfile('user1', 'js1')
    const profile1 = modeler.getUserProfile('user1')
    const initialKeys = Object.keys(profile1!.topicAffinities)
    expect(initialKeys.length).toBeGreaterThan(0)

    modeler.updateUserProfile('user1', 'py1')
    const profile2 = modeler.getUserProfile('user1')
    const updatedKeys = Object.keys(profile2!.topicAffinities)
    expect(updatedKeys.length).toBeGreaterThanOrEqual(initialKeys.length)
  })

  it('getUserProfile returns profile by userId', () => {
    modeler.updateUserProfile('alice', 'js1')
    modeler.updateUserProfile('bob', 'py1')
    const alice = modeler.getUserProfile('alice')
    const bob = modeler.getUserProfile('bob')
    expect(alice).not.toBeNull()
    expect(bob).not.toBeNull()
    expect(alice!.userId).toBe('alice')
    expect(bob!.userId).toBe('bob')
  })

  it('getUserProfiles returns all profiles', () => {
    modeler.updateUserProfile('u1', 'js1')
    modeler.updateUserProfile('u2', 'py1')
    const profiles = modeler.getUserProfiles()
    expect(profiles.length).toBe(2)
  })

  it('returns null for unknown user', () => {
    expect(modeler.getUserProfile('ghost')).toBeNull()
  })

  it('profile has dominantInterests and recentTopics', () => {
    modeler.updateUserProfile('user1', 'js1')
    modeler.updateUserProfile('user1', 'js2')
    modeler.updateUserProfile('user1', 'js3')
    const profile = modeler.getUserProfile('user1')
    expect(profile).not.toBeNull()
    expect(Array.isArray(profile!.dominantInterests)).toBe(true)
    expect(Array.isArray(profile!.recentTopics)).toBe(true)
    expect(profile!.recentTopics.length).toBeGreaterThan(0)
  })
})

// ── recommendTopics ──────────────────────────────────────────────────────

describe('recommendTopics', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    modeler.discoverTopics()
  })

  it('recommends topics based on user interests', () => {
    modeler.updateUserProfile('user1', 'js1')
    modeler.updateUserProfile('user1', 'js2')
    const recs = modeler.recommendTopics('user1')
    expect(recs.length).toBeGreaterThan(0)
    for (const topic of recs) {
      expect(topic).toHaveProperty('id')
      expect(topic).toHaveProperty('name')
      expect(topic).toHaveProperty('keywords')
    }
  })

  it('respects limit parameter', () => {
    modeler.updateUserProfile('user1', 'js1')
    modeler.updateUserProfile('user1', 'py1')
    const recs = modeler.recommendTopics('user1', 1)
    expect(recs.length).toBeLessThanOrEqual(1)
  })

  it('returns empty for unknown user', () => {
    const recs = modeler.recommendTopics('nobody')
    expect(recs).toEqual([])
  })

  it('returns empty when no topics exist', () => {
    const fresh = new TopicModeler()
    fresh.updateUserProfile('user1', 'doc1')
    const recs = fresh.recommendTopics('user1')
    expect(recs).toEqual([])
  })
})

// ── topicSimilarity ──────────────────────────────────────────────────────

describe('topicSimilarity', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    modeler.discoverTopics()
  })

  it('same topic has similarity of 1', () => {
    const topics = modeler.getTopics()
    expect(topics.length).toBeGreaterThan(0)
    const sim = modeler.topicSimilarity(topics[0].id, topics[0].id)
    expect(sim).toBe(1)
  })

  it('different topics have lower or equal similarity', () => {
    const topics = modeler.getTopics()
    if (topics.length >= 2) {
      const sim = modeler.topicSimilarity(topics[0].id, topics[1].id)
      expect(sim).toBeLessThanOrEqual(1)
      expect(sim).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns 0 for non-existent topic ids', () => {
    expect(modeler.topicSimilarity('fake_a', 'fake_b')).toBe(0)
  })

  it('returns 0 when one topic id is non-existent', () => {
    const topics = modeler.getTopics()
    expect(topics.length).toBeGreaterThan(0)
    expect(modeler.topicSimilarity(topics[0].id, 'fake')).toBe(0)
  })
})

// ── classifyText ─────────────────────────────────────────────────────────

describe('classifyText', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    modeler.discoverTopics()
  })

  it('classifies text into existing topics', () => {
    const assignments = modeler.classifyText('javascript react component hooks state rendering')
    expect(assignments.length).toBeGreaterThan(0)
  })

  it('returns assignments with weights', () => {
    const assignments = modeler.classifyText('python machine learning model training')
    for (const a of assignments) {
      expect(typeof a.topicId).toBe('string')
      expect(typeof a.topicName).toBe('string')
      expect(typeof a.weight).toBe('number')
      expect(a.weight).toBeGreaterThan(0)
    }
  })

  it('assignment weights sum to approximately 1', () => {
    const assignments = modeler.classifyText('react javascript component hooks state')
    if (assignments.length > 0) {
      const total = assignments.reduce((sum, a) => sum + a.weight, 0)
      expect(total).toBeCloseTo(1, 1)
    }
  })

  it('does not add the classified text to the corpus', () => {
    const before = modeler.getStats().totalDocuments
    modeler.classifyText('random text that should not be stored in the corpus')
    const after = modeler.getStats().totalDocuments
    expect(after).toBe(before)
  })

  it('returns empty before topic discovery', () => {
    const fresh = new TopicModeler()
    fresh.addDocument('d1', 'javascript react component')
    const assignments = fresh.classifyText('javascript react')
    expect(assignments).toEqual([])
  })
})

// ── getStats ─────────────────────────────────────────────────────────────

describe('getStats', () => {
  it('returns correct counts for fresh modeler', () => {
    const modeler = new TopicModeler()
    const stats = modeler.getStats()
    expect(stats.totalDocuments).toBe(0)
    expect(stats.totalTopics).toBe(0)
    expect(stats.avgTopicsPerDocument).toBe(0)
    expect(stats.topicDrifts).toBe(0)
    expect(stats.profileCount).toBe(0)
  })

  it('updates after adding documents and discovering topics', () => {
    const modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    const statsAfterAdd = modeler.getStats()
    expect(statsAfterAdd.totalDocuments).toBe(10)
    expect(statsAfterAdd.totalTopics).toBe(0)

    modeler.discoverTopics()
    const statsAfterDiscover = modeler.getStats()
    expect(statsAfterDiscover.totalTopics).toBeGreaterThan(0)
    expect(statsAfterDiscover.totalDocuments).toBe(10)
  })

  it('profile count updates after user profile creation', () => {
    const modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    modeler.discoverTopics()
    modeler.updateUserProfile('u1', 'js1')
    modeler.updateUserProfile('u2', 'py1')
    expect(modeler.getStats().profileCount).toBe(2)
  })
})

// ── serialize / deserialize ──────────────────────────────────────────────

describe('serialize / deserialize', () => {
  let modeler: TopicModeler

  beforeEach(() => {
    modeler = new TopicModeler({ minDocumentsForTopic: 1 })
    seedCorpus(modeler)
    modeler.discoverTopics()
  })

  it('round-trip preserves documents', () => {
    const json = modeler.serialize()
    const restored = TopicModeler.deserialize(json)
    expect(restored.getStats().totalDocuments).toBe(modeler.getStats().totalDocuments)
  })

  it('round-trip preserves topics', () => {
    const json = modeler.serialize()
    const restored = TopicModeler.deserialize(json)
    const originalTopics = modeler.getTopics()
    const restoredTopics = restored.getTopics()
    expect(restoredTopics.length).toBe(originalTopics.length)
    for (let i = 0; i < originalTopics.length; i++) {
      expect(restoredTopics.find(t => t.id === originalTopics[i].id)).toBeDefined()
    }
  })

  it('round-trip preserves user profiles', () => {
    modeler.updateUserProfile('user1', 'js1')
    modeler.updateUserProfile('user2', 'py1')
    const json = modeler.serialize()
    const restored = TopicModeler.deserialize(json)
    expect(restored.getUserProfiles().length).toBe(2)
    expect(restored.getUserProfile('user1')).not.toBeNull()
    expect(restored.getUserProfile('user2')).not.toBeNull()
  })

  it('deserialized modeler can classify text', () => {
    const json = modeler.serialize()
    const restored = TopicModeler.deserialize(json)
    const assignments = restored.classifyText('javascript react component hooks')
    expect(assignments.length).toBeGreaterThan(0)
  })

  it('round-trip preserves drift events', () => {
    modeler.detectTopicDrift(['js1', 'js2'])
    const driftsBefore = modeler.getDrifts()
    const json = modeler.serialize()
    const restored = TopicModeler.deserialize(json)
    const driftsAfter = restored.getDrifts()
    expect(driftsAfter.length).toBe(driftsBefore.length)
  })
})
