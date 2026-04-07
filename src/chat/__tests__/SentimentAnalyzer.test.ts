import { describe, it, expect, beforeEach } from 'vitest'
import {
  SentimentAnalyzer,
} from '../SentimentAnalyzer'

// ── Constructor Tests ──

describe('SentimentAnalyzer constructor', () => {
  it('creates an instance with default config', () => {
    const analyzer = new SentimentAnalyzer()
    expect(analyzer).toBeInstanceOf(SentimentAnalyzer)
  })

  it('accepts a partial custom config', () => {
    const analyzer = new SentimentAnalyzer({ lexiconSize: 'small' })
    expect(analyzer).toBeInstanceOf(SentimentAnalyzer)
  })

  it('accepts a full custom config', () => {
    const analyzer = new SentimentAnalyzer({
      enableAspectAnalysis: false,
      enableEmotionDetection: false,
      enableSubjectivity: false,
      enableSarcasmDetection: false,
      lexiconSize: 'medium',
      customLexicon: { awesome: 0.95 },
      negationWindow: 5,
    })
    expect(analyzer).toBeInstanceOf(SentimentAnalyzer)
  })

  it('initializes with a custom lexicon from config', () => {
    const analyzer = new SentimentAnalyzer({ customLexicon: { coolbeans: 0.8 } })
    const lexicon = analyzer.getCustomLexicon()
    expect(lexicon['coolbeans']).toBe(0.8)
  })
})

// ── analyze Tests ──

describe('SentimentAnalyzer analyze', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns a SentimentAnalysisResult with all required fields', () => {
    const result = analyzer.analyze('This product is absolutely wonderful and amazing.')
    expect(typeof result.analysisId).toBe('string')
    expect(result.analysisId.length).toBeGreaterThan(0)
    expect(typeof result.timestamp).toBe('number')
    expect(typeof result.duration).toBe('number')
    expect(result.text).toBe('This product is absolutely wonderful and amazing.')
    expect(result.overall).toBeDefined()
    expect(Array.isArray(result.sentences)).toBe(true)
    expect(Array.isArray(result.aspects)).toBe(true)
    expect(Array.isArray(result.emotions)).toBe(true)
    expect(result.subjectivity).toBeDefined()
    expect(Array.isArray(result.opinions)).toBe(true)
    expect(result.summary).toBeDefined()
  })

  it('detects positive sentiment for positive text', () => {
    const result = analyzer.analyze('I love this excellent and fantastic experience.')
    expect(result.overall.score).toBeGreaterThan(0)
    expect(['positive', 'very_positive']).toContain(result.overall.label)
  })

  it('detects negative sentiment for negative text', () => {
    const result = analyzer.analyze('This is terrible, awful, and absolutely horrible.')
    expect(result.overall.score).toBeLessThan(0)
    expect(['negative', 'very_negative']).toContain(result.overall.label)
  })

  it('generates unique analysis IDs across calls', () => {
    const r1 = analyzer.analyze('Good morning.')
    const r2 = analyzer.analyze('Good evening.')
    expect(r1.analysisId).not.toBe(r2.analysisId)
  })

  it('increments stats after each analysis', () => {
    analyzer.analyze('Hello world.')
    analyzer.analyze('Great product.')
    const stats = analyzer.getStats()
    expect(stats.totalAnalyses).toBe(2)
    expect(stats.totalWordsProcessed).toBeGreaterThan(0)
  })

  it('returns a summary with dominantSentiment and sentenceCount', () => {
    const result = analyzer.analyze('The food was great. The service was terrible.')
    expect(result.summary.dominantSentiment).toBeDefined()
    expect(result.summary.sentenceCount).toBeGreaterThanOrEqual(2)
  })
})

// ── analyzeSentence Tests ──

describe('SentimentAnalyzer analyzeSentence', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns a SentenceSentiment with required fields', () => {
    const result = analyzer.analyzeSentence('This is a wonderful day.')
    expect(result.text).toBe('This is a wonderful day.')
    expect(result.sentiment).toBeDefined()
    expect(typeof result.sentiment.score).toBe('number')
    expect(typeof result.sentiment.label).toBe('string')
    expect(Array.isArray(result.emotions)).toBe(true)
    expect(result.subjectivity).toBeDefined()
  })

  it('handles negation to flip sentiment', () => {
    const positive = analyzer.analyzeSentence('This is good.')
    const negated = analyzer.analyzeSentence('This is not good.')
    expect(negated.sentiment.score).toBeLessThan(positive.sentiment.score)
  })
})

// ── getOverallSentiment Tests ──

describe('SentimentAnalyzer getOverallSentiment', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns a SentimentScore with score, magnitude, label, and confidence', () => {
    const score = analyzer.getOverallSentiment('Everything is fine.')
    expect(typeof score.score).toBe('number')
    expect(typeof score.magnitude).toBe('number')
    expect(typeof score.label).toBe('string')
    expect(typeof score.confidence).toBe('number')
  })

  it('scores a neutral statement near zero', () => {
    const score = analyzer.getOverallSentiment('The meeting is at three.')
    expect(score.score).toBeGreaterThanOrEqual(-0.3)
    expect(score.score).toBeLessThanOrEqual(0.3)
  })

  it('scores a very positive statement above 0.5', () => {
    const score = analyzer.getOverallSentiment('This is an amazing, excellent, outstanding achievement.')
    expect(score.score).toBeGreaterThan(0.5)
  })
})

// ── detectEmotions Tests ──

describe('SentimentAnalyzer detectEmotions', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns an array of EmotionScore objects', () => {
    const emotions = analyzer.detectEmotions('I am so happy and joyful today.')
    expect(Array.isArray(emotions)).toBe(true)
    for (const e of emotions) {
      expect(typeof e.emotion).toBe('string')
      expect(typeof e.intensity).toBe('number')
      expect(Array.isArray(e.triggers)).toBe(true)
    }
  })

  it('detects joy from happy words', () => {
    const emotions = analyzer.detectEmotions('I feel happy, cheerful, and delighted.')
    const joy = emotions.find(e => e.emotion === 'joy')
    expect(joy).toBeDefined()
    expect(joy!.intensity).toBeGreaterThan(0)
    expect(joy!.triggers.length).toBeGreaterThan(0)
  })

  it('detects sadness from sad words', () => {
    const emotions = analyzer.detectEmotions('I feel sad, depressed, and sorrowful.')
    const sadness = emotions.find(e => e.emotion === 'sadness')
    expect(sadness).toBeDefined()
    expect(sadness!.intensity).toBeGreaterThan(0)
  })

  it('returns emotions sorted by intensity descending', () => {
    const emotions = analyzer.detectEmotions('I am very happy but also a little angry and fearful.')
    for (let i = 1; i < emotions.length; i++) {
      expect(emotions[i - 1].intensity).toBeGreaterThanOrEqual(emotions[i].intensity)
    }
  })
})

// ── extractAspects Tests ──

describe('SentimentAnalyzer extractAspects', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns an array of AspectSentiment objects', () => {
    const aspects = analyzer.extractAspects('The design is beautiful but the performance is poor.')
    expect(Array.isArray(aspects)).toBe(true)
    for (const a of aspects) {
      expect(typeof a.aspect).toBe('string')
      expect(a.sentiment).toBeDefined()
      expect(typeof a.mentions).toBe('number')
      expect(Array.isArray(a.keywords)).toBe(true)
    }
  })

  it('returns empty array when aspect analysis is disabled', () => {
    const noAspects = new SentimentAnalyzer({ enableAspectAnalysis: false })
    const result = noAspects.analyze('The design is beautiful.')
    expect(result.aspects).toEqual([])
  })
})

// ── measureSubjectivity Tests ──

describe('SentimentAnalyzer measureSubjectivity', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns a SubjectivityScore with score, label, and opinionPhrases', () => {
    const sub = analyzer.measureSubjectivity('I think this is absolutely beautiful.')
    expect(typeof sub.score).toBe('number')
    expect(['objective', 'subjective', 'mixed']).toContain(sub.label)
    expect(Array.isArray(sub.opinionPhrases)).toBe(true)
  })

  it('scores opinionated text as subjective or mixed', () => {
    const sub = analyzer.measureSubjectivity('I believe this is the best thing ever created.')
    expect(sub.score).toBeGreaterThan(0.3)
  })
})

// ── extractOpinions Tests ──

describe('SentimentAnalyzer extractOpinions', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns an array of OpinionInfo objects', () => {
    const opinions = analyzer.extractOpinions('I think the design is beautiful.')
    expect(Array.isArray(opinions)).toBe(true)
    for (const o of opinions) {
      expect(typeof o.target).toBe('string')
      expect(typeof o.polarity).toBe('string')
      expect(typeof o.expression).toBe('string')
      expect(typeof o.confidence).toBe('number')
    }
  })

  it('deduplicates opinions with the same target and expression', () => {
    const opinions = analyzer.extractOpinions(
      'The food is amazing. The food is amazing.',
    )
    const keys = opinions.map(o => `${o.target}:${o.expression}`)
    const unique = new Set(keys)
    expect(keys.length).toBe(unique.size)
  })
})

// ── compareSentiment Tests ──

describe('SentimentAnalyzer compareSentiment', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('returns textA, textB scores and a numeric difference', () => {
    const cmp = analyzer.compareSentiment(
      'I love this amazing product.',
      'I hate this terrible product.',
    )
    expect(cmp.textA).toBeDefined()
    expect(cmp.textB).toBeDefined()
    expect(typeof cmp.difference).toBe('number')
  })

  it('difference is positive when textA is more positive than textB', () => {
    const cmp = analyzer.compareSentiment(
      'This is wonderful and excellent.',
      'This is awful and terrible.',
    )
    expect(cmp.difference).toBeGreaterThan(0)
  })
})

// ── Custom Lexicon Tests ──

describe('SentimentAnalyzer custom lexicon', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('addCustomWord stores a word with its score', () => {
    analyzer.addCustomWord('fantabulous', 0.9)
    const lexicon = analyzer.getCustomLexicon()
    expect(lexicon['fantabulous']).toBe(0.9)
  })

  it('addCustomWord clamps scores to [-1, 1]', () => {
    analyzer.addCustomWord('overmax', 5.0)
    analyzer.addCustomWord('undermin', -3.0)
    const lexicon = analyzer.getCustomLexicon()
    expect(lexicon['overmax']).toBe(1)
    expect(lexicon['undermin']).toBe(-1)
  })

  it('removeCustomWord removes an existing word and returns true', () => {
    analyzer.addCustomWord('tempword', 0.5)
    const removed = analyzer.removeCustomWord('tempword')
    expect(removed).toBe(true)
    expect(analyzer.getCustomLexicon()['tempword']).toBeUndefined()
  })

  it('removeCustomWord returns false for a non-existent word', () => {
    const removed = analyzer.removeCustomWord('nonexistent')
    expect(removed).toBe(false)
  })

  it('getCustomLexicon returns a copy, not a reference', () => {
    analyzer.addCustomWord('testword', 0.5)
    const lexicon = analyzer.getCustomLexicon()
    lexicon['testword'] = 0.0
    expect(analyzer.getCustomLexicon()['testword']).toBe(0.5)
  })
})

// ── provideFeedback Tests ──

describe('SentimentAnalyzer provideFeedback', () => {
  let analyzer: SentimentAnalyzer

  beforeEach(() => {
    analyzer = new SentimentAnalyzer()
  })

  it('increments feedbackCount in stats', () => {
    const result = analyzer.analyze('This is okay.')
    analyzer.provideFeedback(result.analysisId, 'positive')
    expect(analyzer.getStats().feedbackCount).toBe(1)
  })

  it('does not throw for an unknown analysisId', () => {
    expect(() => analyzer.provideFeedback('unknown-id', 'negative')).not.toThrow()
  })
})

// ── getStats Tests ──

describe('SentimentAnalyzer getStats', () => {
  it('returns zeroed stats on a fresh instance', () => {
    const analyzer = new SentimentAnalyzer()
    const stats = analyzer.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.totalWordsProcessed).toBe(0)
    expect(stats.feedbackCount).toBe(0)
    expect(stats.positiveCount).toBe(0)
    expect(stats.negativeCount).toBe(0)
    expect(stats.neutralCount).toBe(0)
    expect(stats.avgAnalysisTime).toBe(0)
  })

  it('tracks positive and negative counts accurately', () => {
    const analyzer = new SentimentAnalyzer()
    analyzer.analyze('This is absolutely wonderful, amazing, and excellent.')
    analyzer.analyze('This is terrible, horrible, and awful.')
    const stats = analyzer.getStats()
    expect(stats.positiveCount + stats.negativeCount + stats.neutralCount).toBe(2)
  })
})

// ── serialize / deserialize Tests ──

describe('SentimentAnalyzer serialize and deserialize', () => {
  it('serializes to a valid JSON string', () => {
    const analyzer = new SentimentAnalyzer()
    analyzer.analyze('The weather is nice.')
    const json = analyzer.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('deserializes back to a functional SentimentAnalyzer', () => {
    const original = new SentimentAnalyzer({ lexiconSize: 'small' })
    original.addCustomWord('myword', 0.75)
    original.analyze('Something good happened.')
    const json = original.serialize()
    const restored = SentimentAnalyzer.deserialize(json)
    expect(restored).toBeInstanceOf(SentimentAnalyzer)
    expect(restored.getCustomLexicon()['myword']).toBe(0.75)
    expect(restored.getStats().totalAnalyses).toBe(1)
  })

  it('preserves feedback log through serialization round-trip', () => {
    const original = new SentimentAnalyzer()
    const result = original.analyze('It is fine.')
    original.provideFeedback(result.analysisId, 'positive')
    const json = original.serialize()
    const restored = SentimentAnalyzer.deserialize(json)
    expect(restored.getStats().feedbackCount).toBe(1)
  })
})
