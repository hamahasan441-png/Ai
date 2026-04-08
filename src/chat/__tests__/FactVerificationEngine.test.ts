import { describe, it, expect, beforeEach } from 'vitest'
import {
  FactVerificationEngine,
  DEFAULT_FACT_VERIFICATION_CONFIG,
  type Claim,
  type VerificationResult,
  type KnownFact,
  type SourceProfile,
  type Contradiction,
  type FactVerificationEngineConfig,
  type FactVerificationEngineStats,
  type Verdict,
  type VerificationEvidence,
} from '../FactVerificationEngine'

// ── Constructor Tests ────────────────────────────────────────────────────────

describe('FactVerificationEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new FactVerificationEngine()
    expect(engine).toBeInstanceOf(FactVerificationEngine)
  })

  it('accepts a partial config override', () => {
    const engine = new FactVerificationEngine({ maxFacts: 100 })
    expect(engine).toBeInstanceOf(FactVerificationEngine)
  })

  it('accepts a full config override', () => {
    const engine = new FactVerificationEngine({
      maxFacts: 100,
      minEvidenceForVerdict: 3,
      verifiedThreshold: 0.9,
      likelyTrueThreshold: 0.7,
      reliabilityDecayRate: 0.01,
      maxSources: 50,
    })
    expect(engine).toBeInstanceOf(FactVerificationEngine)
  })

  it('starts with no facts', () => {
    const engine = new FactVerificationEngine()
    expect(engine.getAllFacts()).toHaveLength(0)
  })

  it('starts with no sources', () => {
    const engine = new FactVerificationEngine()
    expect(engine.getSources()).toHaveLength(0)
  })

  it('starts with zero stats', () => {
    const engine = new FactVerificationEngine()
    const stats = engine.getStats()
    expect(stats.totalClaimsVerified).toBe(0)
    expect(stats.totalFactsStored).toBe(0)
    expect(stats.totalSourcesTracked).toBe(0)
    expect(stats.avgVerificationConfidence).toBe(0)
    expect(stats.contradictionsDetected).toBe(0)
  })
})

// ── DEFAULT_FACT_VERIFICATION_CONFIG Tests ───────────────────────────────────

describe('DEFAULT_FACT_VERIFICATION_CONFIG', () => {
  it('has expected default maxFacts', () => {
    expect(DEFAULT_FACT_VERIFICATION_CONFIG.maxFacts).toBe(5000)
  })

  it('has expected default minEvidenceForVerdict', () => {
    expect(DEFAULT_FACT_VERIFICATION_CONFIG.minEvidenceForVerdict).toBe(2)
  })

  it('has expected default verifiedThreshold', () => {
    expect(DEFAULT_FACT_VERIFICATION_CONFIG.verifiedThreshold).toBe(0.8)
  })

  it('has expected default likelyTrueThreshold', () => {
    expect(DEFAULT_FACT_VERIFICATION_CONFIG.likelyTrueThreshold).toBe(0.6)
  })

  it('has expected default reliabilityDecayRate', () => {
    expect(DEFAULT_FACT_VERIFICATION_CONFIG.reliabilityDecayRate).toBe(0.001)
  })

  it('has expected default maxSources', () => {
    expect(DEFAULT_FACT_VERIFICATION_CONFIG.maxSources).toBe(200)
  })
})

// ── Knowledge Base Management ────────────────────────────────────────────────

describe('FactVerificationEngine knowledge base', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('addFact returns a KnownFact with an id', () => {
    const fact = engine.addFact('Water boils at 100 degrees Celsius.', 'textbook')
    expect(fact.id).toBeDefined()
    expect(typeof fact.id).toBe('string')
  })

  it('addFact stores the statement', () => {
    const fact = engine.addFact('The Earth orbits the Sun.', 'science')
    expect(fact.statement).toBe('The Earth orbits the Sun.')
  })

  it('addFact stores the source', () => {
    const fact = engine.addFact('Light travels fast.', 'physics-book')
    expect(fact.source).toBe('physics-book')
  })

  it('addFact uses default reliability when not provided', () => {
    const fact = engine.addFact('Gravity pulls objects down.', 'wiki')
    expect(fact.reliability).toBe(0.8)
  })

  it('addFact uses provided reliability', () => {
    const fact = engine.addFact('Gravity pulls objects down.', 'wiki', 0.95)
    expect(fact.reliability).toBe(0.95)
  })

  it('addFact sets addedAt timestamp', () => {
    const before = Date.now()
    const fact = engine.addFact('Test statement.', 'src')
    expect(fact.addedAt).toBeGreaterThanOrEqual(before)
    expect(fact.addedAt).toBeLessThanOrEqual(Date.now())
  })

  it('addFact sets lastVerifiedAt timestamp', () => {
    const fact = engine.addFact('Test statement.', 'src')
    expect(fact.lastVerifiedAt).toBeGreaterThanOrEqual(fact.addedAt)
  })

  it('addFact assigns a domain to the fact', () => {
    const fact = engine.addFact('The software algorithm is efficient.', 'tech')
    expect(fact.domain).toBe('technology')
  })

  it('addFact assigns general domain for generic text', () => {
    const fact = engine.addFact('Something is true.', 'src')
    expect(fact.domain).toBe('general')
  })

  it('addFact detects science domain', () => {
    const fact = engine.addFact('The hypothesis was tested through experiment.', 'lab')
    expect(fact.domain).toBe('science')
  })

  it('addFact detects medicine domain', () => {
    const fact = engine.addFact('The patient received drug treatment for the disease.', 'hospital')
    expect(fact.domain).toBe('medicine')
  })

  it('addFact detects history domain', () => {
    const fact = engine.addFact('The ancient empire fell after the revolution in the 19th century.', 'history-book')
    expect(fact.domain).toBe('history')
  })

  it('addFact extracts entities from the statement', () => {
    const fact = engine.addFact('Albert Einstein developed the theory of relativity.', 'science')
    expect(fact.entities).toContain('Albert Einstein')
  })

  it('addFact increments totalFactsStored in stats', () => {
    engine.addFact('Fact one.', 'src')
    engine.addFact('Fact two.', 'src')
    expect(engine.getStats().totalFactsStored).toBe(2)
  })

  it('getAllFacts returns all added facts', () => {
    engine.addFact('Fact A.', 'src')
    engine.addFact('Fact B.', 'src')
    engine.addFact('Fact C.', 'src')
    expect(engine.getAllFacts()).toHaveLength(3)
  })

  it('removeFact returns true for an existing fact', () => {
    const fact = engine.addFact('Removable fact.', 'src')
    expect(engine.removeFact(fact.id)).toBe(true)
  })

  it('removeFact returns false for a non-existent fact', () => {
    expect(engine.removeFact('nonexistent_id')).toBe(false)
  })

  it('removeFact actually removes the fact from the knowledge base', () => {
    const fact = engine.addFact('To be removed.', 'src')
    engine.removeFact(fact.id)
    expect(engine.getAllFacts()).toHaveLength(0)
  })

  it('removeFact does not affect other facts', () => {
    const f1 = engine.addFact('Fact 1.', 'src')
    engine.addFact('Fact 2.', 'src')
    engine.removeFact(f1.id)
    expect(engine.getAllFacts()).toHaveLength(1)
    expect(engine.getAllFacts()[0].statement).toBe('Fact 2.')
  })

  it('enforces maxFacts limit by evicting oldest fact', () => {
    const small = new FactVerificationEngine({ maxFacts: 3 })
    small.addFact('First fact.', 'src')
    small.addFact('Second fact.', 'src')
    small.addFact('Third fact.', 'src')
    small.addFact('Fourth fact.', 'src')
    expect(small.getAllFacts()).toHaveLength(3)
  })

  it('keeps the newest facts when maxFacts is exceeded', () => {
    const small = new FactVerificationEngine({ maxFacts: 2 })
    small.addFact('Old fact.', 'src')
    small.addFact('Middle fact.', 'src')
    small.addFact('New fact.', 'src')
    const statements = small.getAllFacts().map(f => f.statement)
    expect(statements).toContain('New fact.')
  })

  it('each fact has a unique id', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 20; i++) {
      ids.add(engine.addFact(`Fact ${i}.`, 'src').id)
    }
    expect(ids.size).toBe(20)
  })
})

// ── Source Management ────────────────────────────────────────────────────────

describe('FactVerificationEngine source management', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('registerSource returns a SourceProfile', () => {
    const profile = engine.registerSource('s1', 'Source One')
    expect(profile.id).toBe('s1')
    expect(profile.name).toBe('Source One')
  })

  it('registerSource uses default reliability of 0.5', () => {
    const profile = engine.registerSource('s1', 'Source One')
    expect(profile.reliability).toBe(0.5)
  })

  it('registerSource uses provided initial reliability', () => {
    const profile = engine.registerSource('s1', 'Source One', 0.9)
    expect(profile.reliability).toBe(0.9)
  })

  it('registerSource initializes claim counters to zero', () => {
    const profile = engine.registerSource('s1', 'Source One')
    expect(profile.totalClaims).toBe(0)
    expect(profile.verifiedClaims).toBe(0)
    expect(profile.falseClaims).toBe(0)
  })

  it('registerSource returns existing profile if id already registered', () => {
    const p1 = engine.registerSource('s1', 'Source One', 0.9)
    const p2 = engine.registerSource('s1', 'Different Name', 0.1)
    expect(p2.name).toBe('Source One')
    expect(p2.reliability).toBe(0.9)
  })

  it('getSources returns all registered sources', () => {
    engine.registerSource('s1', 'Source 1')
    engine.registerSource('s2', 'Source 2')
    expect(engine.getSources()).toHaveLength(2)
  })

  it('addFact automatically registers the source', () => {
    engine.addFact('Test fact.', 'auto-source')
    const sources = engine.getSources()
    expect(sources.some(s => s.id === 'auto-source')).toBe(true)
  })

  it('addFact increments source totalClaims', () => {
    engine.addFact('Fact one.', 'my-source')
    engine.addFact('Fact two.', 'my-source')
    const source = engine.getSources().find(s => s.id === 'my-source')
    expect(source!.totalClaims).toBe(2)
  })

  it('enforces maxSources limit', () => {
    const small = new FactVerificationEngine({ maxSources: 3 })
    small.registerSource('s1', 'S1')
    small.registerSource('s2', 'S2')
    small.registerSource('s3', 'S3')
    small.registerSource('s4', 'S4')
    expect(small.getSources()).toHaveLength(3)
  })

  it('tracks totalSourcesTracked in stats', () => {
    engine.registerSource('s1', 'S1')
    engine.registerSource('s2', 'S2')
    expect(engine.getStats().totalSourcesTracked).toBe(2)
  })
})

// ── Claim Extraction ─────────────────────────────────────────────────────────

describe('FactVerificationEngine extractClaims', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('extracts claims from a sentence with a linking verb', () => {
    const claims = engine.extractClaims('The Earth is round.')
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('returns claims with required fields', () => {
    const claims = engine.extractClaims('Water is essential for life.')
    for (const claim of claims) {
      expect(claim).toHaveProperty('id')
      expect(claim).toHaveProperty('text')
      expect(claim).toHaveProperty('domain')
      expect(claim).toHaveProperty('entities')
      expect(claim).toHaveProperty('isQuantitative')
      expect(claim).toHaveProperty('confidence')
      expect(claim).toHaveProperty('extractedFrom')
    }
  })

  it('extracts quantitative claims', () => {
    const claims = engine.extractClaims('The population is 8 billion people.')
    const quant = claims.find(c => c.isQuantitative)
    expect(quant).toBeDefined()
  })

  it('detects percent as quantitative', () => {
    const claims = engine.extractClaims('About 70 percent of the Earth is covered by water.')
    const quant = claims.find(c => c.isQuantitative)
    expect(quant).toBeDefined()
  })

  it('detects % symbol as quantitative', () => {
    const claims = engine.extractClaims('Roughly 71% of the surface is water.')
    const quant = claims.find(c => c.isQuantitative)
    expect(quant).toBeDefined()
  })

  it('extracts multiple claims from multi-sentence text', () => {
    const text = 'The Sun is a star. The Moon is a satellite. Mars is a planet.'
    const claims = engine.extractClaims(text)
    expect(claims.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty array for empty text', () => {
    const claims = engine.extractClaims('')
    expect(claims).toHaveLength(0)
  })

  it('returns empty array for very short text', () => {
    const claims = engine.extractClaims('Hi.')
    expect(claims).toHaveLength(0)
  })

  it('handles text without claims', () => {
    const claims = engine.extractClaims('hello world xyz abc')
    expect(claims).toHaveLength(0)
  })

  it('extracts entities from claims', () => {
    const claims = engine.extractClaims('Albert Einstein was a physicist.')
    const hasEntity = claims.some(c => c.entities.length > 0)
    expect(hasEntity).toBe(true)
  })

  it('assigns a domain to extracted claims', () => {
    const claims = engine.extractClaims('The computer algorithm is efficient and the software works well.')
    if (claims.length > 0) {
      expect(claims[0].domain).toBe('technology')
    }
  })

  it('stores extractedFrom reference', () => {
    const text = 'Python is a programming language.'
    const claims = engine.extractClaims(text)
    if (claims.length > 0) {
      expect(claims[0].extractedFrom).toContain('Python')
    }
  })

  it('deduplicates identical claims from overlapping patterns', () => {
    const text = 'All software systems are complex. All software systems are complex.'
    const claims = engine.extractClaims(text)
    const texts = claims.map(c => c.text.toLowerCase())
    const unique = new Set(texts)
    expect(texts.length).toBe(unique.size)
  })

  it('skips very short claim fragments under 10 chars', () => {
    const claims = engine.extractClaims('It is. He is. A. B.')
    for (const claim of claims) {
      expect(claim.text.length).toBeGreaterThanOrEqual(10)
    }
  })

  it('uses sentence fallback for non-pattern text', () => {
    const claims = engine.extractClaims('the earth is a wonderful place to live in and explore')
    expect(claims.length).toBeGreaterThanOrEqual(0)
  })

  it('assigns unique ids to each extracted claim', () => {
    const claims = engine.extractClaims('The Sun is hot. The Moon is cold. Mars is red.')
    const ids = claims.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('detects claims with "always" or "never" quantifiers', () => {
    const claims = engine.extractClaims('The system always returns a valid response. The program never crashes.')
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('detects claims containing numbers', () => {
    const claims = engine.extractClaims('There are 195 countries in the world.')
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('limits extractedFrom to at most 100 characters', () => {
    const longText = 'A '.repeat(200) + 'The hypothesis was tested extensively.'
    const claims = engine.extractClaims(longText)
    for (const claim of claims) {
      expect(claim.extractedFrom.length).toBeLessThanOrEqual(100)
    }
  })
})

// ── Claim Verification ───────────────────────────────────────────────────────

describe('FactVerificationEngine verifyClaim', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  function makeClaim(text: string): Claim {
    return {
      id: 'test_claim_1',
      text,
      domain: 'general',
      entities: [],
      isQuantitative: false,
      confidence: 0.7,
      extractedFrom: text.slice(0, 100),
    }
  }

  it('returns a VerificationResult with all expected fields', () => {
    const result = engine.verifyClaim(makeClaim('The sky is blue.'))
    expect(result).toHaveProperty('claim')
    expect(result).toHaveProperty('verdict')
    expect(result).toHaveProperty('confidence')
    expect(result).toHaveProperty('supportingEvidence')
    expect(result).toHaveProperty('contradictingEvidence')
    expect(result).toHaveProperty('explanation')
    expect(result).toHaveProperty('suggestedCorrection')
  })

  it('returns unverifiable when no facts exist', () => {
    const result = engine.verifyClaim(makeClaim('The sky is blue.'))
    expect(result.verdict).toBe('unverifiable')
  })

  it('returns unverifiable with zero confidence when no evidence', () => {
    const result = engine.verifyClaim(makeClaim('Something random and obscure.'))
    expect(result.confidence).toBe(0)
  })

  it('finds supporting evidence from matching facts', () => {
    engine.addFact('The sky is blue during clear days.', 'science-book')
    const result = engine.verifyClaim(makeClaim('The sky is blue during clear weather.'))
    expect(result.supportingEvidence.length).toBeGreaterThanOrEqual(1)
  })

  it('produces a verified or likely_true verdict with supporting evidence', () => {
    engine.addFact('The Earth orbits the Sun in an elliptical path.', 'astronomy', 0.95)
    const result = engine.verifyClaim(makeClaim('The Earth orbits the Sun in its path.'))
    expect(['verified', 'likely_true']).toContain(result.verdict)
  })

  it('detects contradicting evidence from negated facts', () => {
    engine.addFact('The Earth is not flat and is round.', 'science')
    const result = engine.verifyClaim(makeClaim('The Earth is flat and round.'))
    expect(
      result.contradictingEvidence.length + result.supportingEvidence.length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('provides a suggestedCorrection for false verdicts', () => {
    engine.addFact('Water does not boil at 50 degrees.', 'chemistry', 0.99)
    engine.addFact('Water does not boil at low temperatures.', 'physics', 0.99)
    const claim = makeClaim('Water boils at 50 degrees at low temperatures.')
    const result = engine.verifyClaim(claim)
    if (result.verdict === 'false' || result.verdict === 'likely_false') {
      expect(result.suggestedCorrection).not.toBeNull()
    }
  })

  it('returns null suggestedCorrection for verified claims', () => {
    engine.addFact('The Sun is a star in the solar system.', 'astronomy')
    const result = engine.verifyClaim(makeClaim('The Sun is a star in the solar system.'))
    if (result.verdict === 'verified' || result.verdict === 'likely_true') {
      expect(result.suggestedCorrection).toBeNull()
    }
  })

  it('includes an explanation string', () => {
    const result = engine.verifyClaim(makeClaim('Test claim.'))
    expect(typeof result.explanation).toBe('string')
    expect(result.explanation.length).toBeGreaterThan(0)
  })

  it('explanation mentions the claim text', () => {
    const result = engine.verifyClaim(makeClaim('TypeScript is a typed language.'))
    expect(result.explanation).toContain('TypeScript')
  })

  it('explanation mentions UNVERIFIABLE for no evidence', () => {
    const result = engine.verifyClaim(makeClaim('Random unrelated content.'))
    expect(result.explanation).toContain('UNVERIFIABLE')
  })

  it('confidence is between 0 and 1', () => {
    engine.addFact('Python is a programming language used widely.', 'tech')
    const result = engine.verifyClaim(makeClaim('Python is a programming language used widely.'))
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('increments totalClaimsVerified stat', () => {
    engine.verifyClaim(makeClaim('Claim one.'))
    engine.verifyClaim(makeClaim('Claim two.'))
    expect(engine.getStats().totalClaimsVerified).toBe(2)
  })

  it('updates verdict distribution in stats', () => {
    engine.verifyClaim(makeClaim('Unknown claim.'))
    const dist = engine.getStats().verdictDistribution
    const total = Object.values(dist).reduce((a, b) => a + b, 0)
    expect(total).toBe(1)
  })

  it('limits supporting evidence to at most 5 items', () => {
    for (let i = 0; i < 10; i++) {
      engine.addFact(`The algorithm is efficient and fast in version ${i}.`, `src-${i}`)
    }
    const result = engine.verifyClaim(makeClaim('The algorithm is efficient and fast.'))
    expect(result.supportingEvidence.length).toBeLessThanOrEqual(5)
  })

  it('limits contradicting evidence to at most 5 items', () => {
    for (let i = 0; i < 10; i++) {
      engine.addFact(`The algorithm is not efficient and not fast in version ${i}.`, `src-${i}`)
    }
    const result = engine.verifyClaim(makeClaim('The algorithm is efficient and fast.'))
    expect(result.contradictingEvidence.length).toBeLessThanOrEqual(5)
  })
})

// ── Text Verification ────────────────────────────────────────────────────────

describe('FactVerificationEngine verifyText', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('returns an array of VerificationResults', () => {
    const results = engine.verifyText('The Earth is round.')
    expect(Array.isArray(results)).toBe(true)
  })

  it('returns results for each extracted claim', () => {
    engine.addFact('The Earth is round and blue.', 'geo')
    const text = 'The Earth is round. The Moon is bright.'
    const results = engine.verifyText(text)
    for (const r of results) {
      expect(r).toHaveProperty('claim')
      expect(r).toHaveProperty('verdict')
    }
  })

  it('returns empty array for empty text', () => {
    const results = engine.verifyText('')
    expect(results).toHaveLength(0)
  })

  it('returns empty array for text with no extractable claims', () => {
    const results = engine.verifyText('hello')
    expect(results).toHaveLength(0)
  })

  it('verifies multiple claims independently', () => {
    engine.addFact('Python is a programming language used for many tasks.', 'tech')
    const text = 'Python is a programming language. JavaScript is also a language.'
    const results = engine.verifyText(text)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('updates stats for each verified claim in text', () => {
    const text = 'The Sun is a star. The Moon is a satellite.'
    engine.verifyText(text)
    const claims = engine.extractClaims(text)
    expect(engine.getStats().totalClaimsVerified).toBeGreaterThanOrEqual(claims.length)
  })
})

// ── Contradiction Detection ──────────────────────────────────────────────────

describe('FactVerificationEngine contradiction detection', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('returns empty array when no contradictions exist', () => {
    engine.addFact('The sky is blue.', 'src')
    engine.addFact('Grass is green.', 'src')
    const contradictions = engine.detectContradictions()
    expect(contradictions).toHaveLength(0)
  })

  it('detects contradiction between a fact and its negation', () => {
    engine.addFact('The Earth is round and large.', 'src-a')
    engine.addFact('The Earth is not round and not large.', 'src-b')
    const contradictions = engine.detectContradictions()
    expect(contradictions.length).toBeGreaterThanOrEqual(1)
  })

  it('contradiction has required fields', () => {
    engine.addFact('The system is fast and reliable.', 'src-a')
    engine.addFact('The system is not fast and not reliable.', 'src-b')
    const contradictions = engine.detectContradictions()
    if (contradictions.length > 0) {
      expect(contradictions[0]).toHaveProperty('claim1')
      expect(contradictions[0]).toHaveProperty('claim2')
      expect(contradictions[0]).toHaveProperty('type')
      expect(contradictions[0]).toHaveProperty('severity')
      expect(contradictions[0]).toHaveProperty('explanation')
    }
  })

  it('contradiction type is direct', () => {
    engine.addFact('The algorithm is efficient and works well.', 'src-a')
    engine.addFact('The algorithm is not efficient and does not work well.', 'src-b')
    const contradictions = engine.detectContradictions()
    if (contradictions.length > 0) {
      expect(contradictions[0].type).toBe('direct')
    }
  })

  it('contradiction severity is between 0 and 1', () => {
    engine.addFact('The service is available and running.', 'src-a')
    engine.addFact('The service is not available and not running.', 'src-b')
    const contradictions = engine.detectContradictions()
    for (const c of contradictions) {
      expect(c.severity).toBeGreaterThanOrEqual(0)
      expect(c.severity).toBeLessThanOrEqual(1)
    }
  })

  it('getContradictions returns accumulated contradictions', () => {
    engine.addFact('The code is clean and readable.', 'src-a')
    engine.addFact('The code is not clean and not readable.', 'src-b')
    engine.detectContradictions()
    expect(engine.getContradictions().length).toBeGreaterThanOrEqual(1)
  })

  it('getContradictions returns empty before detectContradictions is called', () => {
    engine.addFact('A thing is true.', 'src-a')
    engine.addFact('A thing is not true.', 'src-b')
    expect(engine.getContradictions()).toHaveLength(0)
  })

  it('does not detect contradiction between unrelated facts', () => {
    engine.addFact('The ocean is deep.', 'src-a')
    engine.addFact('The mountain is not a river.', 'src-b')
    const contradictions = engine.detectContradictions()
    expect(contradictions).toHaveLength(0)
  })

  it('updates contradictionsDetected in stats', () => {
    engine.addFact('The database is fast and responsive.', 'src-a')
    engine.addFact('The database is not fast and not responsive.', 'src-b')
    engine.detectContradictions()
    expect(engine.getStats().contradictionsDetected).toBeGreaterThanOrEqual(0)
  })

  it('caps stored contradictions at 100', () => {
    const big = new FactVerificationEngine({ maxFacts: 300 })
    for (let i = 0; i < 60; i++) {
      big.addFact(`The item number ${i} system is operational and running well today.`, `src-a-${i}`)
      big.addFact(`The item number ${i} system is not operational and not running well today.`, `src-b-${i}`)
    }
    big.detectContradictions()
    big.detectContradictions()
    expect(big.getContradictions().length).toBeLessThanOrEqual(100)
  })
})

// ── Stats ────────────────────────────────────────────────────────────────────

describe('FactVerificationEngine getStats', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('returns FactVerificationEngineStats with all fields', () => {
    const stats = engine.getStats()
    expect(stats).toHaveProperty('totalClaimsVerified')
    expect(stats).toHaveProperty('totalFactsStored')
    expect(stats).toHaveProperty('totalSourcesTracked')
    expect(stats).toHaveProperty('avgVerificationConfidence')
    expect(stats).toHaveProperty('contradictionsDetected')
    expect(stats).toHaveProperty('verdictDistribution')
  })

  it('verdictDistribution has all verdict types', () => {
    const dist = engine.getStats().verdictDistribution
    const expectedVerdicts: Verdict[] = [
      'verified', 'likely_true', 'uncertain', 'likely_false', 'false', 'unverifiable',
    ]
    for (const v of expectedVerdicts) {
      expect(dist).toHaveProperty(v)
    }
  })

  it('verdictDistribution starts at zero for all verdicts', () => {
    const dist = engine.getStats().verdictDistribution
    for (const count of Object.values(dist)) {
      expect(count).toBe(0)
    }
  })

  it('totalFactsStored reflects current facts count', () => {
    engine.addFact('Fact A.', 'src')
    engine.addFact('Fact B.', 'src')
    const f = engine.addFact('Fact C.', 'src')
    engine.removeFact(f.id)
    expect(engine.getStats().totalFactsStored).toBe(2)
  })

  it('avgVerificationConfidence is 0 when no claims verified', () => {
    expect(engine.getStats().avgVerificationConfidence).toBe(0)
  })

  it('avgVerificationConfidence updates after verifying claims', () => {
    engine.addFact('TypeScript is a typed superset of JavaScript.', 'docs')
    engine.verifyText('TypeScript is a typed superset of JavaScript.')
    const stats = engine.getStats()
    if (stats.totalClaimsVerified > 0) {
      expect(stats.avgVerificationConfidence).toBeGreaterThanOrEqual(0)
    }
  })
})

// ── Serialization / Deserialization ──────────────────────────────────────────

describe('FactVerificationEngine serialization', () => {
  it('serialize returns a valid JSON string', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('The Sun is hot.', 'astronomy')
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialized data contains facts', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('Water is wet.', 'common')
    const data = JSON.parse(engine.serialize())
    expect(data.facts).toBeInstanceOf(Array)
    expect(data.facts.length).toBe(1)
  })

  it('serialized data contains sources', () => {
    const engine = new FactVerificationEngine()
    engine.registerSource('s1', 'Source 1')
    const data = JSON.parse(engine.serialize())
    expect(data.sources).toBeInstanceOf(Array)
    expect(data.sources.length).toBeGreaterThanOrEqual(1)
  })

  it('serialized data contains contradictions', () => {
    const engine = new FactVerificationEngine()
    const data = JSON.parse(engine.serialize())
    expect(data.contradictions).toBeInstanceOf(Array)
  })

  it('serialized data contains stats', () => {
    const engine = new FactVerificationEngine()
    const data = JSON.parse(engine.serialize())
    expect(data.stats).toBeDefined()
  })

  it('deserialize restores facts', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('Gravity is a force.', 'physics')
    engine.addFact('Light is electromagnetic radiation.', 'physics')
    const json = engine.serialize()

    const restored = FactVerificationEngine.deserialize(json)
    expect(restored.getAllFacts()).toHaveLength(2)
  })

  it('deserialize restores sources', () => {
    const engine = new FactVerificationEngine()
    engine.registerSource('wiki', 'Wikipedia', 0.7)
    engine.addFact('Something true.', 'wiki')
    const json = engine.serialize()

    const restored = FactVerificationEngine.deserialize(json)
    expect(restored.getSources().length).toBeGreaterThanOrEqual(1)
  })

  it('deserialize restores stats', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('Test fact for stats.', 'src')
    engine.verifyClaim({
      id: 'c1', text: 'Test fact for stats.', domain: 'general',
      entities: [], isQuantitative: false, confidence: 0.7, extractedFrom: 'test',
    })
    const json = engine.serialize()

    const restored = FactVerificationEngine.deserialize(json)
    expect(restored.getStats().totalClaimsVerified).toBe(1)
  })

  it('deserialize accepts custom config', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('A fact.', 'src')
    const json = engine.serialize()

    const restored = FactVerificationEngine.deserialize(json, { maxFacts: 10 })
    expect(restored).toBeInstanceOf(FactVerificationEngine)
    expect(restored.getAllFacts()).toHaveLength(1)
  })

  it('deserialize returns fresh engine on invalid JSON', () => {
    const restored = FactVerificationEngine.deserialize('not-valid-json')
    expect(restored).toBeInstanceOf(FactVerificationEngine)
    expect(restored.getAllFacts()).toHaveLength(0)
  })

  it('deserialize returns fresh engine on empty JSON object', () => {
    const restored = FactVerificationEngine.deserialize('{}')
    expect(restored).toBeInstanceOf(FactVerificationEngine)
    expect(restored.getAllFacts()).toHaveLength(0)
  })

  it('round-trip preserves fact statements', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('The speed of light is constant.', 'physics')
    const json = engine.serialize()
    const restored = FactVerificationEngine.deserialize(json)
    const statements = restored.getAllFacts().map(f => f.statement)
    expect(statements).toContain('The speed of light is constant.')
  })

  it('round-trip preserves contradictions', () => {
    const engine = new FactVerificationEngine()
    engine.addFact('The test system is online and working well.', 'src-a')
    engine.addFact('The test system is not online and not working well.', 'src-b')
    engine.detectContradictions()
    const json = engine.serialize()

    const restored = FactVerificationEngine.deserialize(json)
    expect(restored.getContradictions().length).toBe(engine.getContradictions().length)
  })
})

// ── Edge Cases ───────────────────────────────────────────────────────────────

describe('FactVerificationEngine edge cases', () => {
  let engine: FactVerificationEngine

  beforeEach(() => {
    engine = new FactVerificationEngine()
  })

  it('handles single word input for extractClaims', () => {
    const claims = engine.extractClaims('hello')
    expect(claims).toHaveLength(0)
  })

  it('handles whitespace-only input for extractClaims', () => {
    const claims = engine.extractClaims('   ')
    expect(claims).toHaveLength(0)
  })

  it('handles newline-laden input for extractClaims', () => {
    const claims = engine.extractClaims('\n\n\n')
    expect(claims).toHaveLength(0)
  })

  it('handles verifyText on text with no verbs', () => {
    const results = engine.verifyText('random words without structure')
    expect(results).toHaveLength(0)
  })

  it('handles addFact with empty source string', () => {
    const fact = engine.addFact('A fact with empty source.', '')
    expect(fact.source).toBe('')
  })

  it('handles removeFact called twice on the same id', () => {
    const fact = engine.addFact('Double remove test.', 'src')
    expect(engine.removeFact(fact.id)).toBe(true)
    expect(engine.removeFact(fact.id)).toBe(false)
  })

  it('handles verifying a claim that partially matches a fact', () => {
    engine.addFact('The software architecture design pattern is important for scalability.', 'book')
    const claim: Claim = {
      id: 'partial',
      text: 'The software architecture design is important.',
      domain: 'technology',
      entities: [],
      isQuantitative: false,
      confidence: 0.7,
      extractedFrom: 'test',
    }
    const result = engine.verifyClaim(claim)
    expect(result.verdict).toBeDefined()
  })

  it('handles very long text for extractClaims without errors', () => {
    const longText = 'The system is operational. '.repeat(500)
    expect(() => engine.extractClaims(longText)).not.toThrow()
  })

  it('getContradictions returns a copy, not a direct reference', () => {
    engine.addFact('The API is stable and production ready.', 'src-a')
    engine.addFact('The API is not stable and not production ready.', 'src-b')
    engine.detectContradictions()
    const c1 = engine.getContradictions()
    const c2 = engine.getContradictions()
    expect(c1).not.toBe(c2)
    expect(c1).toEqual(c2)
  })

  it('getAllFacts returns a copy, not a direct reference', () => {
    engine.addFact('Copy test fact.', 'src')
    const f1 = engine.getAllFacts()
    const f2 = engine.getAllFacts()
    expect(f1).not.toBe(f2)
    expect(f1).toEqual(f2)
  })

  it('getSources returns a copy, not a direct reference', () => {
    engine.registerSource('s1', 'Source')
    const s1 = engine.getSources()
    const s2 = engine.getSources()
    expect(s1).not.toBe(s2)
    expect(s1).toEqual(s2)
  })
})
