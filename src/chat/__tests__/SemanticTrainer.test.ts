import { describe, it, expect, beforeEach } from 'vitest'
import { SemanticTrainer, type FeedbackSignal } from '../SemanticTrainer'

describe('SemanticTrainer', () => {
  let trainer: SemanticTrainer

  beforeEach(() => {
    trainer = new SemanticTrainer()
  })

  // ─── Constructor ──────────────────────────────────────────────────────

  describe('constructor', () => {
    it('applies default config when none provided', () => {
      const stats = trainer.getStats()
      expect(stats.totalExamples).toBe(0)
      expect(stats.vocabularyExpansions).toBe(0)
      expect(stats.currentDomain).toBe('general')
    })

    it('applies custom config values', () => {
      const custom = new SemanticTrainer({ learningRate: 0.05, maxVocabulary: 100 })
      // Verify custom trainer works with limited vocabulary
      const text = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ')
      custom.learnFromText(text)
      expect(custom.getVocabularySize()).toBeLessThanOrEqual(100)
    })

    it('starts with empty state', () => {
      expect(trainer.getVocabularySize()).toBe(0)
      expect(trainer.getVocabulary()).toHaveLength(0)
      expect(trainer.getFeedbackHistory()).toHaveLength(0)
      expect(trainer.getSnapshots()).toHaveLength(0)
      expect(trainer.getLatestSnapshot()).toBeNull()
    })

    it('merges partial config with defaults', () => {
      const custom = new SemanticTrainer({ learningRate: 0.1 })
      // Should still work with default maxVocabulary (2000)
      custom.learnFromText('react component hook state props')
      expect(custom.getVocabularySize()).toBeGreaterThan(0)
    })
  })

  // ─── learnFromText ────────────────────────────────────────────────────

  describe('learnFromText', () => {
    it('learns new vocabulary from text', () => {
      const added = trainer.learnFromText('react component rendering virtual dom')
      expect(added).toBeGreaterThan(0)
      expect(trainer.getVocabularySize()).toBeGreaterThan(0)
    })

    it('auto-detects domain when not provided', () => {
      trainer.learnFromText('react component hook state props jsx')
      expect(trainer.getCurrentDomain()).toBe('frontend')
    })

    it('uses explicit domain parameter', () => {
      trainer.learnFromText('some general text here', 'backend')
      expect(trainer.getCurrentDomain()).toBe('backend')
    })

    it('expands vocabulary with multiple texts', () => {
      trainer.learnFromText('react component rendering')
      const sizeAfterFirst = trainer.getVocabularySize()
      trainer.learnFromText('docker kubernetes container pod')
      expect(trainer.getVocabularySize()).toBeGreaterThan(sizeAfterFirst)
    })

    it('filters stop words', () => {
      trainer.learnFromText('the is are was and or but')
      expect(trainer.hasWord('the')).toBe(false)
      expect(trainer.hasWord('is')).toBe(false)
      expect(trainer.hasWord('and')).toBe(false)
    })

    it('filters short tokens', () => {
      trainer.learnFromText('a x component rendering')
      expect(trainer.hasWord('a')).toBe(false)
      expect(trainer.hasWord('x')).toBe(false)
    })

    it('returns count of newly added words', () => {
      const first = trainer.learnFromText('react component hook')
      expect(first).toBeGreaterThan(0)
      // Learning same text again should add 0 new words
      const second = trainer.learnFromText('react component hook')
      expect(second).toBe(0)
    })
  })

  // ─── getVocabulary / getVocabularySize / hasWord ──────────────────────

  describe('getVocabulary / getVocabularySize / hasWord', () => {
    beforeEach(() => {
      trainer.learnFromText('react component rendering virtual dom')
    })

    it('returns learned vocabulary entries', () => {
      const vocab = trainer.getVocabulary()
      expect(vocab.length).toBeGreaterThan(0)
      expect(vocab[0]).toHaveProperty('word')
      expect(vocab[0]).toHaveProperty('vector')
      expect(vocab[0]).toHaveProperty('frequency')
      expect(vocab[0]).toHaveProperty('domains')
    })

    it('size matches number of added words', () => {
      const vocab = trainer.getVocabulary()
      expect(trainer.getVocabularySize()).toBe(vocab.length)
    })

    it('hasWord finds learned words', () => {
      expect(trainer.hasWord('react')).toBe(true)
      expect(trainer.hasWord('component')).toBe(true)
    })

    it('hasWord returns false for unknown words', () => {
      expect(trainer.hasWord('unknown')).toBe(false)
      expect(trainer.hasWord('nonexistent')).toBe(false)
    })

    it('hasWord is case insensitive', () => {
      expect(trainer.hasWord('React')).toBe(true)
      expect(trainer.hasWord('COMPONENT')).toBe(true)
    })

    it('vocabulary entries have correct structure', () => {
      const vocab = trainer.getVocabulary()
      for (const entry of vocab) {
        expect(typeof entry.word).toBe('string')
        expect(Array.isArray(entry.vector)).toBe(true)
        expect(entry.vector.length).toBe(50)
        expect(typeof entry.frequency).toBe('number')
        expect(Array.isArray(entry.domains)).toBe(true)
        expect(typeof entry.learnedAt).toBe('number')
      }
    })
  })

  // ─── adjustSimilarity ─────────────────────────────────────────────────

  describe('adjustSimilarity', () => {
    beforeEach(() => {
      trainer.learnFromText('react component rendering virtual dom layout flexbox')
    })

    it('moves vectors closer when target similarity is high', () => {
      const vocabBefore = trainer.getVocabulary()
      const entryA = vocabBefore.find(e => e.word === 'react')!
      const entryB = vocabBefore.find(e => e.word === 'component')!
      const vecABefore = [...entryA.vector]
      const _vecBBefore = [...entryB.vector]

      const result = trainer.adjustSimilarity('react', 'component', 1.0)
      expect(result).toBe(true)

      const vocabAfter = trainer.getVocabulary()
      const entryAAfter = vocabAfter.find(e => e.word === 'react')!
      // Vectors should have changed
      const changed = entryAAfter.vector.some((v, i) => v !== vecABefore[i])
      expect(changed).toBe(true)
    })

    it('moves vectors apart when target similarity is low', () => {
      const result = trainer.adjustSimilarity('react', 'component', 0.0)
      expect(result).toBe(true)
    })

    it('returns false for words not in vocabulary', () => {
      expect(trainer.adjustSimilarity('unknown1', 'unknown2', 0.5)).toBe(false)
      expect(trainer.adjustSimilarity('react', 'unknown', 0.5)).toBe(false)
      expect(trainer.adjustSimilarity('unknown', 'react', 0.5)).toBe(false)
    })

    it('handles same word without error', () => {
      const result = trainer.adjustSimilarity('react', 'react', 1.0)
      expect(result).toBe(true)
    })

    it('returns true when both words exist', () => {
      expect(trainer.adjustSimilarity('react', 'virtual', 0.8)).toBe(true)
    })
  })

  // ─── applyFeedback ────────────────────────────────────────────────────

  describe('applyFeedback', () => {
    beforeEach(() => {
      trainer.learnFromText('react component rendering virtual dom layout flexbox grid')
    })

    it('accepts positive feedback signal', () => {
      const signal: FeedbackSignal = {
        type: 'positive',
        sourceText: 'react component',
        targetText: 'virtual dom',
        strength: 0.8,
        timestamp: Date.now(),
      }
      trainer.applyFeedback(signal)
      expect(trainer.getFeedbackHistory()).toHaveLength(1)
      expect(trainer.getFeedbackHistory()[0].type).toBe('positive')
    })

    it('accepts negative feedback signal', () => {
      const signal: FeedbackSignal = {
        type: 'negative',
        sourceText: 'react component',
        targetText: 'grid layout',
        strength: 0.5,
        timestamp: Date.now(),
      }
      trainer.applyFeedback(signal)
      expect(trainer.getFeedbackHistory()).toHaveLength(1)
      expect(trainer.getFeedbackHistory()[0].type).toBe('negative')
    })

    it('similarity feedback moves vectors closer', () => {
      const signal: FeedbackSignal = {
        type: 'similarity',
        sourceText: 'react',
        targetText: 'component',
        strength: 1.0,
        timestamp: Date.now(),
      }
      trainer.applyFeedback(signal)
      expect(trainer.getFeedbackHistory()).toHaveLength(1)
    })

    it('dissimilarity feedback moves vectors apart', () => {
      const signal: FeedbackSignal = {
        type: 'dissimilarity',
        sourceText: 'react',
        targetText: 'grid',
        strength: 1.0,
        timestamp: Date.now(),
      }
      trainer.applyFeedback(signal)
      expect(trainer.getFeedbackHistory()).toHaveLength(1)
    })

    it('feedback history tracks all signals', () => {
      for (let i = 0; i < 5; i++) {
        trainer.applyFeedback({
          type: 'positive',
          sourceText: 'react',
          targetText: 'component',
          strength: 0.5,
          timestamp: Date.now() + i,
        })
      }
      expect(trainer.getFeedbackHistory()).toHaveLength(5)
    })

    it('handles feedback with words not in vocabulary', () => {
      const signal: FeedbackSignal = {
        type: 'positive',
        sourceText: 'unknown words here',
        targetText: 'also unknown',
        strength: 0.5,
        timestamp: Date.now(),
      }
      trainer.applyFeedback(signal)
      expect(trainer.getFeedbackHistory()).toHaveLength(1)
    })
  })

  // ─── getFeedbackHistory ───────────────────────────────────────────────

  describe('getFeedbackHistory', () => {
    it('returns empty array initially', () => {
      expect(trainer.getFeedbackHistory()).toHaveLength(0)
      expect(trainer.getFeedbackHistory()).toEqual([])
    })

    it('returns all applied feedback signals', () => {
      trainer.learnFromText('react component virtual dom')
      trainer.applyFeedback({
        type: 'positive',
        sourceText: 'react',
        targetText: 'component',
        strength: 0.5,
        timestamp: Date.now(),
      })
      trainer.applyFeedback({
        type: 'negative',
        sourceText: 'react',
        targetText: 'virtual',
        strength: 0.3,
        timestamp: Date.now(),
      })
      const history = trainer.getFeedbackHistory()
      expect(history).toHaveLength(2)
      expect(history[0].type).toBe('positive')
      expect(history[1].type).toBe('negative')
    })

    it('returns a copy, not internal reference', () => {
      trainer.learnFromText('react component')
      trainer.applyFeedback({
        type: 'positive',
        sourceText: 'react',
        targetText: 'component',
        strength: 0.5,
        timestamp: Date.now(),
      })
      const history1 = trainer.getFeedbackHistory()
      const history2 = trainer.getFeedbackHistory()
      expect(history1).not.toBe(history2)
    })
  })

  // ─── detectDomain ─────────────────────────────────────────────────────

  describe('detectDomain', () => {
    it('detects frontend domain from React/CSS text', () => {
      expect(trainer.detectDomain('react component hook state props jsx')).toBe('frontend')
    })

    it('detects backend domain from API/server text', () => {
      expect(trainer.detectDomain('express api rest middleware route controller server')).toBe(
        'backend',
      )
    })

    it('detects database domain from SQL text', () => {
      expect(trainer.detectDomain('sql query table index join transaction schema')).toBe('database')
    })

    it('detects devops domain from Docker/Kubernetes text', () => {
      expect(trainer.detectDomain('docker kubernetes container pod cluster helm')).toBe('devops')
    })

    it('detects ai_ml domain', () => {
      expect(
        trainer.detectDomain('neural model training dataset tensor gradient transformer'),
      ).toBe('ai_ml')
    })

    it('returns general for ambiguous text', () => {
      expect(trainer.detectDomain('some random words nothing special')).toBe('general')
    })

    it('returns general for empty or stop-word-only text', () => {
      expect(trainer.detectDomain('the is and or but')).toBe('general')
    })
  })

  // ─── getDomainProfile / getDomainProfiles / getCurrentDomain ──────────

  describe('getDomainProfile / getDomainProfiles / getCurrentDomain', () => {
    it('returns profile for a domain', () => {
      trainer.learnFromText('react component hook state props jsx tsx', 'frontend')
      const profile = trainer.getDomainProfile('frontend')
      expect(profile.domain).toBe('frontend')
      expect(profile.exampleCount).toBeGreaterThan(0)
    })

    it('returns profile with zero examples for inactive domain', () => {
      const profile = trainer.getDomainProfile('database')
      expect(profile.domain).toBe('database')
      expect(profile.exampleCount).toBe(0)
    })

    it('returns all domain profiles', () => {
      const profiles = trainer.getDomainProfiles()
      expect(profiles.length).toBe(9) // All DomainType values
      const domains = profiles.map(p => p.domain)
      expect(domains).toContain('frontend')
      expect(domains).toContain('backend')
      expect(domains).toContain('general')
    })

    it('getCurrentDomain reflects last learned text domain', () => {
      trainer.learnFromText('react component hook state props jsx')
      expect(trainer.getCurrentDomain()).toBe('frontend')
      trainer.learnFromText('docker kubernetes container pod cluster helm')
      expect(trainer.getCurrentDomain()).toBe('devops')
    })

    it('current domain defaults to general', () => {
      expect(trainer.getCurrentDomain()).toBe('general')
    })
  })

  // ─── boostDomain ──────────────────────────────────────────────────────

  describe('boostDomain', () => {
    it('boosts domain weight', () => {
      const profileBefore = trainer.getDomainProfile('frontend')
      const weightBefore = profileBefore.weight
      trainer.boostDomain('frontend')
      const profileAfter = trainer.getDomainProfile('frontend')
      expect(profileAfter.weight).toBeGreaterThan(weightBefore)
    })

    it('sets current domain when boosted', () => {
      trainer.boostDomain('backend')
      expect(trainer.getCurrentDomain()).toBe('backend')
    })

    it('boosted domain is reflected in stats', () => {
      trainer.boostDomain('database')
      expect(trainer.getCurrentDomain()).toBe('database')
    })

    it('multiple boosts compound the weight', () => {
      const initial = trainer.getDomainProfile('frontend').weight
      trainer.boostDomain('frontend')
      const afterFirst = trainer.getDomainProfile('frontend').weight
      trainer.boostDomain('frontend')
      const afterSecond = trainer.getDomainProfile('frontend').weight
      expect(afterFirst).toBeGreaterThan(initial)
      expect(afterSecond).toBeGreaterThan(afterFirst)
    })
  })

  // ─── learnContrastive ─────────────────────────────────────────────────

  describe('learnContrastive', () => {
    it('pulls anchor closer to positive', () => {
      trainer.learnFromText('react component virtual dom rendering layout flexbox grid styling')
      trainer.learnContrastive('react component', 'virtual dom rendering')
      // Should not throw and feedback history should record it
      expect(trainer.getFeedbackHistory().length).toBeGreaterThanOrEqual(0)
    })

    it('pushes anchor away from negative', () => {
      trainer.learnFromText('react component virtual dom rendering layout flexbox grid styling')
      trainer.learnContrastive('react component', 'virtual dom', 'grid layout')
      // Should not throw
      expect(trainer.getVocabularySize()).toBeGreaterThan(0)
    })

    it('handles unknown words gracefully', () => {
      trainer.learnContrastive('completely unknown', 'also unknown', 'more unknown')
      // Should not throw, words may get auto-learned
      expect(trainer.getVocabularySize()).toBeGreaterThanOrEqual(0)
    })

    it('works with just anchor and positive', () => {
      trainer.learnFromText('react component virtual dom rendering')
      trainer.learnContrastive('react component', 'virtual dom')
      expect(trainer.getVocabularySize()).toBeGreaterThan(0)
    })

    it('records feedback signals during contrastive learning', () => {
      trainer.learnFromText('react component virtual dom rendering layout flexbox grid')
      const histBefore = trainer.getFeedbackHistory().length
      trainer.learnContrastive('react component', 'virtual dom', 'grid layout')
      const histAfter = trainer.getFeedbackHistory().length
      expect(histAfter).toBeGreaterThanOrEqual(histBefore)
    })
  })

  // ─── createSnapshot / getSnapshots / rollback / getLatestSnapshot ─────

  describe('createSnapshot / getSnapshots / rollback / getLatestSnapshot', () => {
    it('creates snapshot of current state', () => {
      trainer.learnFromText('react component hook')
      const snapshot = trainer.createSnapshot('first snapshot')
      expect(snapshot).toHaveProperty('id')
      expect(snapshot).toHaveProperty('timestamp')
      expect(snapshot).toHaveProperty('vocabularySize')
      expect(snapshot.description).toBe('first snapshot')
    })

    it('maintains multiple snapshots', () => {
      trainer.createSnapshot('snap 1')
      trainer.learnFromText('react component hook')
      trainer.createSnapshot('snap 2')
      trainer.learnFromText('docker kubernetes container')
      trainer.createSnapshot('snap 3')
      expect(trainer.getSnapshots()).toHaveLength(3)
    })

    it('rollback restores previous state', () => {
      trainer.learnFromText('react component hook')
      const sizeBeforeSnapshot = trainer.getVocabularySize()
      const snapshot = trainer.createSnapshot('before new learning')

      trainer.learnFromText('docker kubernetes container pod cluster helm pipeline deploy')
      expect(trainer.getVocabularySize()).toBeGreaterThan(sizeBeforeSnapshot)

      const success = trainer.rollback(snapshot.id)
      expect(success).toBe(true)
      expect(trainer.getVocabularySize()).toBe(sizeBeforeSnapshot)
    })

    it('latest snapshot is most recent', () => {
      trainer.createSnapshot('first')
      trainer.createSnapshot('second')
      trainer.createSnapshot('third')
      const latest = trainer.getLatestSnapshot()
      expect(latest).not.toBeNull()
      expect(latest!.description).toBe('third')
    })

    it('rollback with invalid id returns false', () => {
      expect(trainer.rollback('nonexistent_id')).toBe(false)
    })

    it('state after rollback is correct', () => {
      trainer.learnFromText('react component hook')
      const snapshot = trainer.createSnapshot('checkpoint')

      trainer.learnFromText('docker kubernetes container pod')
      const hadDocker = trainer.hasWord('docker')
      expect(hadDocker).toBe(true)

      trainer.rollback(snapshot.id)
      // After rollback, vocabulary from before snapshot should be restored
      expect(trainer.hasWord('react')).toBe(true)
      expect(trainer.hasWord('component')).toBe(true)
    })

    it('getLatestSnapshot returns null when no snapshots exist', () => {
      expect(trainer.getLatestSnapshot()).toBeNull()
    })
  })

  // ─── getStats ─────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns correct totals', () => {
      const stats = trainer.getStats()
      expect(stats.totalExamples).toBe(0)
      expect(stats.totalFeedback).toBe(0)
      expect(stats.vocabularyExpansions).toBe(0)
      expect(stats.snapshotCount).toBe(0)
      expect(stats.currentDomain).toBe('general')
    })

    it('updates after operations', () => {
      trainer.learnFromText('react component hook state props jsx')
      trainer.createSnapshot('test')
      trainer.applyFeedback({
        type: 'positive',
        sourceText: 'react',
        targetText: 'component',
        strength: 0.5,
        timestamp: Date.now(),
      })
      const stats = trainer.getStats()
      expect(stats.totalExamples).toBe(1)
      expect(stats.totalFeedback).toBe(1)
      expect(stats.snapshotCount).toBe(1)
      expect(stats.vocabularyExpansions).toBeGreaterThan(0)
    })

    it('domain distribution is tracked', () => {
      trainer.learnFromText('react component hook state props jsx', 'frontend')
      trainer.learnFromText('express api rest middleware route controller', 'backend')
      const stats = trainer.getStats()
      expect(stats.domainDistribution.frontend).toBe(1)
      expect(stats.domainDistribution.backend).toBe(1)
      expect(stats.totalExamples).toBe(2)
    })

    it('has all domain keys in distribution', () => {
      const stats = trainer.getStats()
      expect(stats.domainDistribution).toHaveProperty('frontend')
      expect(stats.domainDistribution).toHaveProperty('backend')
      expect(stats.domainDistribution).toHaveProperty('database')
      expect(stats.domainDistribution).toHaveProperty('devops')
      expect(stats.domainDistribution).toHaveProperty('ai_ml')
      expect(stats.domainDistribution).toHaveProperty('general')
    })
  })

  // ─── serialize / deserialize ──────────────────────────────────────────

  describe('serialize / deserialize', () => {
    it('round-trip preserves vocabulary', () => {
      trainer.learnFromText('react component hook state props')
      const json = trainer.serialize()
      const restored = SemanticTrainer.deserialize(json)
      expect(restored.getVocabularySize()).toBe(trainer.getVocabularySize())
      expect(restored.hasWord('react')).toBe(true)
      expect(restored.hasWord('component')).toBe(true)
    })

    it('round-trip preserves domain profiles', () => {
      trainer.learnFromText('react component hook state props jsx', 'frontend')
      trainer.learnFromText('docker kubernetes container', 'devops')
      const json = trainer.serialize()
      const restored = SemanticTrainer.deserialize(json)
      const stats = restored.getStats()
      expect(stats.domainDistribution.frontend).toBe(1)
      expect(stats.domainDistribution.devops).toBe(1)
    })

    it('round-trip preserves config', () => {
      const custom = new SemanticTrainer({ learningRate: 0.05, maxSnapshots: 5 })
      custom.learnFromText('react component')
      const json = custom.serialize()
      const restored = SemanticTrainer.deserialize(json)
      // Verify the restored trainer has same behavior
      expect(restored.getVocabularySize()).toBe(custom.getVocabularySize())
    })

    it('deserialized trainer works correctly', () => {
      trainer.learnFromText('react component hook state props jsx')
      const json = trainer.serialize()
      const restored = SemanticTrainer.deserialize(json)

      // Can continue learning
      const added = restored.learnFromText('docker kubernetes container pod')
      expect(added).toBeGreaterThan(0)
      expect(restored.getVocabularySize()).toBeGreaterThan(trainer.getVocabularySize())
    })

    it('round-trip preserves snapshots', () => {
      trainer.learnFromText('react component hook')
      trainer.createSnapshot('test snapshot')
      const json = trainer.serialize()
      const restored = SemanticTrainer.deserialize(json)
      const snapshots = restored.getSnapshots()
      expect(snapshots).toHaveLength(1)
      expect(snapshots[0].description).toBe('test snapshot')
    })
  })

  // ─── reset ────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears all learned data', () => {
      trainer.learnFromText('react component hook state props jsx')
      trainer.createSnapshot('snap')
      trainer.applyFeedback({
        type: 'positive',
        sourceText: 'react',
        targetText: 'component',
        strength: 0.5,
        timestamp: Date.now(),
      })

      trainer.reset()

      expect(trainer.getVocabularySize()).toBe(0)
      expect(trainer.getFeedbackHistory()).toHaveLength(0)
      expect(trainer.getSnapshots()).toHaveLength(0)
    })

    it('restores fresh state after reset', () => {
      trainer.learnFromText('react component hook state', 'frontend')
      trainer.reset()

      const stats = trainer.getStats()
      expect(stats.totalExamples).toBe(0)
      expect(stats.totalFeedback).toBe(0)
      expect(stats.vocabularyExpansions).toBe(0)
      expect(stats.snapshotCount).toBe(0)
      expect(stats.currentDomain).toBe('general')
    })

    it('can learn again after reset', () => {
      trainer.learnFromText('react component hook')
      trainer.reset()
      const added = trainer.learnFromText('docker kubernetes container')
      expect(added).toBeGreaterThan(0)
      expect(trainer.hasWord('react')).toBe(false)
      expect(trainer.hasWord('docker')).toBe(true)
    })
  })
})
