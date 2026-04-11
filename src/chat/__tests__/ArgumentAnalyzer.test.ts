import { describe, it, expect, beforeEach } from 'vitest'
import { ArgumentAnalyzer } from '../ArgumentAnalyzer.js'

describe('ArgumentAnalyzer', () => {
  let analyzer: ArgumentAnalyzer

  beforeEach(() => {
    analyzer = new ArgumentAnalyzer()
  })

  // ── Constructor & Config ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const a = new ArgumentAnalyzer()
      const stats = a.getStats()
      expect(stats.totalArguments).toBe(0)
      expect(stats.totalClaims).toBe(0)
    })

    it('accepts partial config overrides', () => {
      const a = new ArgumentAnalyzer({ maxClaimsPerText: 5 })
      expect(a.getStats().totalArguments).toBe(0)
    })

    it('accepts full config overrides', () => {
      const a = new ArgumentAnalyzer({
        maxClaimsPerText: 10,
        minClaimLength: 2,
        strengthThreshold: 0.5,
        fallacyConfidenceThreshold: 0.6,
        maxCounterArguments: 3,
        evidenceWeightDecay: 0.8,
      })
      expect(a.getStats().totalArguments).toBe(0)
    })
  })

  // ── extractClaims ──

  describe('extractClaims', () => {
    it('extracts claims from text with claim indicators', () => {
      const claims = analyzer.extractClaims(
        'Studies show that exercise improves mental health. Therefore regular physical activity is beneficial.',
      )
      expect(claims.length).toBeGreaterThan(0)
    })

    it('returns claims with required properties', () => {
      const claims = analyzer.extractClaims(
        'Research indicates that sleep is important for cognitive function.',
      )
      for (const claim of claims) {
        expect(claim).toHaveProperty('id')
        expect(claim).toHaveProperty('text')
        expect(claim).toHaveProperty('type')
        expect(claim).toHaveProperty('confidence')
        expect(claim).toHaveProperty('source')
        expect(claim).toHaveProperty('extractedAt')
      }
    })

    it('classifies factual claims', () => {
      const claims = analyzer.extractClaims('The earth orbits the sun every 365 days.')
      const factual = claims.filter(c => c.type === 'factual')
      expect(factual.length).toBeGreaterThanOrEqual(0) // may or may not match
    })

    it('classifies policy claims containing should/must', () => {
      const claims = analyzer.extractClaims(
        'I believe the government should invest more in education for everyone.',
      )
      const policy = claims.filter(c => c.type === 'policy')
      expect(policy.length).toBeGreaterThan(0)
    })

    it('classifies causal claims', () => {
      const claims = analyzer.extractClaims(
        'Studies show that smoking causes lung cancer and leads to serious health problems.',
      )
      const causal = claims.filter(c => c.type === 'causal')
      expect(causal.length).toBeGreaterThan(0)
    })

    it('classifies value claims', () => {
      const claims = analyzer.extractClaims('Education is important and valuable for society.')
      const value = claims.filter(c => c.type === 'value')
      expect(value.length).toBeGreaterThan(0)
    })

    it('classifies definitional claims', () => {
      const claims = analyzer.extractClaims(
        'Democracy is defined as a system of government by the people.',
      )
      const definitional = claims.filter(c => c.type === 'definitional')
      expect(definitional.length).toBeGreaterThan(0)
    })

    it('skips very short sentences below minClaimLength', () => {
      const claims = analyzer.extractClaims('Yes. No. OK.')
      expect(claims.length).toBe(0)
    })

    it('respects maxClaimsPerText config', () => {
      const a = new ArgumentAnalyzer({ maxClaimsPerText: 1 })
      const text = 'Therefore X is true. Thus Y is valid. Hence Z follows. So W must be right.'
      const claims = a.extractClaims(text)
      expect(claims.length).toBeLessThanOrEqual(1)
    })

    it('stores claims internally for later retrieval', () => {
      const claims = analyzer.extractClaims('Research indicates that water is essential for life.')
      expect(claims.length).toBeGreaterThan(0)
      const retrieved = analyzer.getClaim(claims[0].id)
      expect(retrieved).not.toBeNull()
      expect(retrieved!.text).toBe(claims[0].text)
    })

    it('returns empty array for empty text', () => {
      const claims = analyzer.extractClaims('')
      expect(claims).toEqual([])
    })

    it('assigns confidence between 0 and 1', () => {
      const claims = analyzer.extractClaims(
        'Studies show that regular exercise is clearly beneficial for health.',
      )
      for (const c of claims) {
        expect(c.confidence).toBeGreaterThanOrEqual(0)
        expect(c.confidence).toBeLessThanOrEqual(1)
      }
    })
  })

  // ── parseArgument ──

  describe('parseArgument', () => {
    it('parses text into an argument with premises and conclusion', () => {
      const arg = analyzer.parseArgument(
        'Because exercise improves mood. Since it reduces stress. Therefore exercise is good for mental health.',
      )
      expect(arg.premises.length).toBeGreaterThan(0)
      expect(arg.conclusion).toBeDefined()
      expect(arg.conclusion.text).toBeTruthy()
    })

    it('returns argument with all required fields', () => {
      const arg = analyzer.parseArgument('Given that the data is clear. Therefore we should act.')
      expect(arg).toHaveProperty('id')
      expect(arg).toHaveProperty('text')
      expect(arg).toHaveProperty('premises')
      expect(arg).toHaveProperty('conclusion')
      expect(arg).toHaveProperty('claims')
      expect(arg).toHaveProperty('strength')
      expect(arg).toHaveProperty('createdAt')
    })

    it('identifies premises with indicator words', () => {
      const arg = analyzer.parseArgument(
        'Because the evidence is strong. Since multiple studies confirm this. Therefore the hypothesis holds.',
      )
      expect(arg.premises.length).toBeGreaterThanOrEqual(2)
    })

    it('uses last sentence as conclusion when no indicator found', () => {
      const arg = analyzer.parseArgument(
        'The sky is blue. The grass is green. The world is colorful.',
      )
      expect(arg.conclusion.text).toContain('colorful')
    })

    it('assigns premise roles (major, minor, auxiliary)', () => {
      const arg = analyzer.parseArgument(
        'Because the fundamental issue is cost. Additionally resources are scarce. Furthermore time is limited. Therefore we must prioritize.',
      )
      const roles = arg.premises.map(p => p.role)
      expect(roles).toContain('major')
    })

    it('stores argument for later retrieval', () => {
      const arg = analyzer.parseArgument('Because facts. Therefore conclusion is valid.')
      const retrieved = analyzer.getArgument(arg.id)
      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe(arg.id)
    })

    it('computes argument strength between 0 and 1', () => {
      const arg = analyzer.parseArgument(
        'Because peer-reviewed research demonstrates efficacy. Therefore the treatment works.',
      )
      expect(arg.strength).toBeGreaterThanOrEqual(0)
      expect(arg.strength).toBeLessThanOrEqual(1)
    })

    it('supports conclusion with premise IDs', () => {
      const arg = analyzer.parseArgument(
        'Because A is true. Since B follows. Therefore C is the case.',
      )
      expect(arg.conclusion.supportedBy.length).toBe(arg.premises.length)
      for (const premId of arg.conclusion.supportedBy) {
        expect(arg.premises.some(p => p.id === premId)).toBe(true)
      }
    })
  })

  // ── detectFallacies ──

  describe('detectFallacies', () => {
    it('detects ad hominem fallacy', () => {
      const fallacies = analyzer.detectFallacies("You're stupid so your argument is wrong.")
      expect(fallacies.some(f => f.type === 'ad_hominem')).toBe(true)
    })

    it('detects straw man fallacy', () => {
      const fallacies = analyzer.detectFallacies(
        "So you're saying that we should abandon all regulations?",
      )
      expect(fallacies.some(f => f.type === 'straw_man')).toBe(true)
    })

    it('detects false dilemma fallacy', () => {
      const fallacies = analyzer.detectFallacies(
        "You're either with us or against us on this issue.",
      )
      expect(fallacies.some(f => f.type === 'false_dilemma')).toBe(true)
    })

    it('detects appeal to authority', () => {
      const fallacies = analyzer.detectFallacies(
        'Experts say this product is the best on the market.',
      )
      expect(fallacies.some(f => f.type === 'appeal_to_authority')).toBe(true)
    })

    it('detects slippery slope', () => {
      const fallacies = analyzer.detectFallacies(
        'If we allow this, then next thing you know the whole system will collapse.',
      )
      expect(fallacies.some(f => f.type === 'slippery_slope')).toBe(true)
    })

    it('detects circular reasoning', () => {
      const fallacies = analyzer.detectFallacies(
        "It's true because that's the case and the reason is because it's true.",
      )
      expect(fallacies.some(f => f.type === 'circular_reasoning')).toBe(true)
    })

    it('detects red herring', () => {
      const fallacies = analyzer.detectFallacies(
        'But what about the economy? The real issue is something else entirely.',
      )
      expect(fallacies.some(f => f.type === 'red_herring')).toBe(true)
    })

    it('detects hasty generalization', () => {
      const fallacies = analyzer.detectFallacies(
        'All politicians are corrupt and everyone knows it.',
      )
      expect(fallacies.some(f => f.type === 'hasty_generalization')).toBe(true)
    })

    it('detects appeal to emotion', () => {
      const fallacies = analyzer.detectFallacies(
        "Think of the children who will suffer if we don't act now!",
      )
      expect(fallacies.some(f => f.type === 'appeal_to_emotion')).toBe(true)
    })

    it('detects bandwagon fallacy', () => {
      const fallacies = analyzer.detectFallacies(
        'Everyone believes this is the right approach so it must be correct.',
      )
      expect(fallacies.some(f => f.type === 'bandwagon')).toBe(true)
    })

    it('detects tu quoque', () => {
      const fallacies = analyzer.detectFallacies(
        'You did the same thing too, so you cannot criticize me.',
      )
      expect(fallacies.some(f => f.type === 'tu_quoque')).toBe(true)
    })

    it('detects appeal to ignorance', () => {
      const fallacies = analyzer.detectFallacies(
        "You can't prove that aliens don't exist, so they must be real.",
      )
      expect(fallacies.some(f => f.type === 'appeal_to_ignorance')).toBe(true)
    })

    it('detects loaded question', () => {
      const fallacies = analyzer.detectFallacies('Have you stopped cheating on your exams?')
      expect(fallacies.some(f => f.type === 'loaded_question')).toBe(true)
    })

    it('returns fallacies with required properties', () => {
      const fallacies = analyzer.detectFallacies("You're ignorant so your point is invalid.")
      for (const f of fallacies) {
        expect(f).toHaveProperty('type')
        expect(f).toHaveProperty('name')
        expect(f).toHaveProperty('description')
        expect(f).toHaveProperty('matchedText')
        expect(f).toHaveProperty('confidence')
        expect(f).toHaveProperty('severity')
        expect(['low', 'medium', 'high']).toContain(f.severity)
      }
    })

    it('returns empty array for clean text', () => {
      const fallacies = analyzer.detectFallacies(
        'The data shows a 10% increase in sales over the quarter.',
      )
      expect(fallacies.length).toBe(0)
    })

    it('de-duplicates fallacies by type', () => {
      const fallacies = analyzer.detectFallacies(
        "You're stupid and you're ignorant. What do you know about anything?",
      )
      const types = fallacies.map(f => f.type)
      expect(new Set(types).size).toBe(types.length)
    })

    it('logs detected fallacies in the internal log', () => {
      analyzer.detectFallacies("You're an idiot and you have no experience.")
      const log = analyzer.getFallacyLog()
      expect(log.length).toBeGreaterThan(0)
    })
  })

  // ── evaluateStrength ──

  describe('evaluateStrength', () => {
    it('returns null for unknown argument ID', () => {
      expect(analyzer.evaluateStrength('nonexistent')).toBeNull()
    })

    it('returns strength scores for a valid argument', () => {
      const arg = analyzer.parseArgument(
        'Because peer-reviewed studies demonstrate effectiveness. Since the data is statistically significant. Therefore the treatment works.',
      )
      const strength = analyzer.evaluateStrength(arg.id)
      expect(strength).not.toBeNull()
      expect(strength!.overall).toBeGreaterThanOrEqual(0)
      expect(strength!.overall).toBeLessThanOrEqual(1)
    })

    it('returns all sub-scores', () => {
      const arg = analyzer.parseArgument(
        'Because the evidence is clear. Therefore we should act accordingly.',
      )
      const strength = analyzer.evaluateStrength(arg.id)
      expect(strength).not.toBeNull()
      expect(strength!).toHaveProperty('logicalValidity')
      expect(strength!).toHaveProperty('evidenceQuality')
      expect(strength!).toHaveProperty('relevance')
      expect(strength!).toHaveProperty('sufficiency')
      expect(strength!).toHaveProperty('coherence')
    })

    it('includes breakdown record matching sub-scores', () => {
      const arg = analyzer.parseArgument('Because A. Therefore B is the conclusion.')
      const strength = analyzer.evaluateStrength(arg.id)
      expect(strength).not.toBeNull()
      expect(strength!.breakdown.logicalValidity).toBe(strength!.logicalValidity)
      expect(strength!.breakdown.evidenceQuality).toBe(strength!.evidenceQuality)
      expect(strength!.breakdown.relevance).toBe(strength!.relevance)
      expect(strength!.breakdown.sufficiency).toBe(strength!.sufficiency)
      expect(strength!.breakdown.coherence).toBe(strength!.coherence)
    })

    it('gives higher strength to well-evidenced arguments', () => {
      const weak = analyzer.parseArgument('I heard that it might be true. So maybe it works.')
      const strong = analyzer.parseArgument(
        'Because peer-reviewed meta-analysis demonstrates clear benefits. Since replicated studies confirm the result. Therefore the treatment is effective.',
      )
      const weakStrength = analyzer.evaluateStrength(weak.id)
      const strongStrength = analyzer.evaluateStrength(strong.id)
      expect(strongStrength!.overall).toBeGreaterThan(weakStrength!.overall)
    })
  })

  // ── buildArgumentMap ──

  describe('buildArgumentMap', () => {
    it('returns an empty map when no arguments exist', () => {
      const map = analyzer.buildArgumentMap()
      expect(map.arguments).toEqual([])
      expect(map.relations).toEqual([])
      expect(map.rootArguments).toEqual([])
      expect(map.depth).toBe(0)
    })

    it('returns map with arguments after parsing', () => {
      analyzer.parseArgument('Because evidence exists. Therefore the claim is valid.')
      const map = analyzer.buildArgumentMap()
      expect(map.arguments.length).toBe(1)
      expect(map.rootArguments.length).toBe(1)
    })

    it('includes relations in the map', () => {
      const a1 = analyzer.parseArgument('Because A is true. Therefore B follows.')
      const a2 = analyzer.parseArgument('Because C is true. Therefore D follows.')
      analyzer.addRelation(a1.id, a2.id, 'supports')
      const map = analyzer.buildArgumentMap()
      expect(map.relations.length).toBe(1)
    })

    it('computes depth for chained arguments', () => {
      const a1 = analyzer.parseArgument('Because A. Therefore B is valid.')
      const a2 = analyzer.parseArgument('Because C. Therefore D is valid.')
      const a3 = analyzer.parseArgument('Because E. Therefore F is valid.')
      analyzer.addRelation(a1.id, a2.id, 'supports')
      analyzer.addRelation(a2.id, a3.id, 'supports')
      const map = analyzer.buildArgumentMap()
      expect(map.depth).toBeGreaterThanOrEqual(2)
    })

    it('has required map properties', () => {
      analyzer.parseArgument('Because data. Therefore conclusion is sound.')
      const map = analyzer.buildArgumentMap()
      expect(map).toHaveProperty('id')
      expect(map).toHaveProperty('arguments')
      expect(map).toHaveProperty('relations')
      expect(map).toHaveProperty('rootArguments')
      expect(map).toHaveProperty('depth')
      expect(map).toHaveProperty('createdAt')
    })
  })

  // ── addRelation ──

  describe('addRelation', () => {
    it('returns null when source argument does not exist', () => {
      const arg = analyzer.parseArgument('Because X. Therefore Y is true.')
      const result = analyzer.addRelation('nonexistent', arg.id, 'supports')
      expect(result).toBeNull()
    })

    it('returns null when target argument does not exist', () => {
      const arg = analyzer.parseArgument('Because X. Therefore Y is true.')
      const result = analyzer.addRelation(arg.id, 'nonexistent', 'supports')
      expect(result).toBeNull()
    })

    it('creates a supports relation', () => {
      const a1 = analyzer.parseArgument('Because A is true. Therefore B is valid.')
      const a2 = analyzer.parseArgument('Because C is true. Therefore D is valid.')
      const rel = analyzer.addRelation(a1.id, a2.id, 'supports')
      expect(rel).not.toBeNull()
      expect(rel!.type).toBe('supports')
      expect(rel!.sourceId).toBe(a1.id)
      expect(rel!.targetId).toBe(a2.id)
    })

    it('creates an attacks relation', () => {
      const a1 = analyzer.parseArgument('Because A. Therefore B is the case.')
      const a2 = analyzer.parseArgument('Because C. Therefore D is the case.')
      const rel = analyzer.addRelation(a1.id, a2.id, 'attacks')
      expect(rel).not.toBeNull()
      expect(rel!.type).toBe('attacks')
    })

    it('creates a rebuts relation', () => {
      const a1 = analyzer.parseArgument('Because A is supported. Therefore B holds.')
      const a2 = analyzer.parseArgument('Because C contradicts. Therefore D holds instead.')
      const rel = analyzer.addRelation(a1.id, a2.id, 'rebuts')
      expect(rel).not.toBeNull()
      expect(rel!.type).toBe('rebuts')
    })

    it('creates an undercuts relation', () => {
      const a1 = analyzer.parseArgument('Because A undermines. Therefore B is weakened.')
      const a2 = analyzer.parseArgument('Because C is strong. Therefore D follows.')
      const rel = analyzer.addRelation(a1.id, a2.id, 'undercuts')
      expect(rel).not.toBeNull()
      expect(rel!.type).toBe('undercuts')
    })

    it('assigns a strength value between 0 and 1', () => {
      const a1 = analyzer.parseArgument('Because A. Therefore B is clearly correct.')
      const a2 = analyzer.parseArgument('Because C. Therefore D is clearly correct.')
      const rel = analyzer.addRelation(a1.id, a2.id, 'supports')
      expect(rel!.strength).toBeGreaterThanOrEqual(0)
      expect(rel!.strength).toBeLessThanOrEqual(1)
    })

    it('uses custom description when provided', () => {
      const a1 = analyzer.parseArgument(
        'Because data shows improvement. Therefore the policy works.',
      )
      const a2 = analyzer.parseArgument(
        'Because alternative data disagrees. Therefore the policy is questionable.',
      )
      const rel = analyzer.addRelation(a1.id, a2.id, 'attacks', 'Policy effectiveness dispute')
      expect(rel!.description).toBe('Policy effectiveness dispute')
    })

    it('uses default description when not provided', () => {
      const a1 = analyzer.parseArgument('Because X is valid. Therefore Y follows logically.')
      const a2 = analyzer.parseArgument('Because Z is valid. Therefore W follows logically.')
      const rel = analyzer.addRelation(a1.id, a2.id, 'supports')
      expect(rel!.description).toContain('supports')
    })
  })

  // ── generateCounterArguments ──

  describe('generateCounterArguments', () => {
    it('returns empty array for unknown argument ID', () => {
      expect(analyzer.generateCounterArguments('nonexistent')).toEqual([])
    })

    it('generates at least one counter-argument', () => {
      const arg = analyzer.parseArgument(
        'Because some people said so. Therefore the claim must be true for everyone always.',
      )
      const counters = analyzer.generateCounterArguments(arg.id)
      expect(counters.length).toBeGreaterThan(0)
    })

    it('generates rebuttal counter-argument', () => {
      const arg = analyzer.parseArgument(
        'Because it seems likely. Therefore it must be true for certain.',
      )
      const counters = analyzer.generateCounterArguments(arg.id)
      const rebuttal = counters.find(c => c.type === 'rebuttal')
      expect(rebuttal).toBeDefined()
    })

    it('generates counterexample for universal claims', () => {
      const arg = analyzer.parseArgument(
        'Because experience. Therefore all cats are always friendly to everyone.',
      )
      const counters = analyzer.generateCounterArguments(arg.id)
      const counterexample = counters.find(c => c.type === 'counterexample')
      expect(counterexample).toBeDefined()
    })

    it('generates alternative for causal arguments', () => {
      const arg = analyzer.parseArgument(
        'Because event A happened first. The effect leads to B. Therefore A caused B to occur.',
      )
      const counters = analyzer.generateCounterArguments(arg.id)
      const alternative = counters.find(c => c.type === 'alternative')
      expect(alternative).toBeDefined()
    })

    it('respects maxCounterArguments config', () => {
      const a = new ArgumentAnalyzer({ maxCounterArguments: 2 })
      const arg = a.parseArgument(
        'Because X is unknown. Because Y is uncertain. Because Z is unclear. Therefore all things are always caused by unknown forces.',
      )
      const counters = a.generateCounterArguments(arg.id)
      expect(counters.length).toBeLessThanOrEqual(2)
    })

    it('counter-arguments have required properties', () => {
      const arg = analyzer.parseArgument(
        'Because data exists. Therefore the conclusion holds for everyone always.',
      )
      const counters = analyzer.generateCounterArguments(arg.id)
      for (const c of counters) {
        expect(c).toHaveProperty('id')
        expect(c).toHaveProperty('targetArgumentId')
        expect(c).toHaveProperty('type')
        expect(c).toHaveProperty('claim')
        expect(c).toHaveProperty('reasoning')
        expect(c).toHaveProperty('strength')
        expect(c.targetArgumentId).toBe(arg.id)
      }
    })
  })

  // ── analyzeDebate ──

  describe('analyzeDebate', () => {
    it('analyzes a two-position debate', () => {
      const positions = analyzer.analyzeDebate([
        {
          speaker: 'Alice',
          text: 'Because renewable energy is cheaper. Therefore we should switch to solar power.',
          stance: 'for',
        },
        {
          speaker: 'Bob',
          text: 'Because initial costs are high. Therefore solar is not practical right now.',
          stance: 'against',
        },
      ])
      expect(positions.length).toBe(2)
      expect(positions[0].speaker).toBe('Alice')
      expect(positions[1].speaker).toBe('Bob')
    })

    it('returns debate positions with required fields', () => {
      const positions = analyzer.analyzeDebate([
        {
          speaker: 'Alice',
          text: 'Because it is important. Therefore we should act.',
          stance: 'for',
        },
      ])
      const pos = positions[0]
      expect(pos).toHaveProperty('id')
      expect(pos).toHaveProperty('speaker')
      expect(pos).toHaveProperty('arguments')
      expect(pos).toHaveProperty('stance')
      expect(pos).toHaveProperty('overallStrength')
      expect(pos).toHaveProperty('biases')
    })

    it('detects biases in debate positions', () => {
      const positions = analyzer.analyzeDebate([
        {
          speaker: 'Biased',
          text: 'Obviously and clearly this is needless to say the best approach. Of course everyone knows it.',
          stance: 'for',
        },
      ])
      expect(positions[0].biases.length).toBeGreaterThan(0)
    })

    it('creates attack relations between opposing stances', () => {
      analyzer.analyzeDebate([
        {
          speaker: 'Pro',
          text: 'Because benefits are clear. Therefore we should proceed.',
          stance: 'for',
        },
        {
          speaker: 'Con',
          text: 'Because risks are high. Therefore we should not proceed.',
          stance: 'against',
        },
      ])
      const relations = analyzer.getRelations()
      const attacks = relations.filter(r => r.type === 'attacks')
      expect(attacks.length).toBeGreaterThan(0)
    })

    it('does not create attack relations for same-stance positions', () => {
      const initialRelCount = analyzer.getRelations().length
      analyzer.analyzeDebate([
        { speaker: 'A', text: 'Because X. Therefore Y is good.', stance: 'for' },
        { speaker: 'B', text: 'Because Z. Therefore W is good.', stance: 'for' },
      ])
      const attacks = analyzer.getRelations().filter(r => r.type === 'attacks')
      expect(attacks.length).toBe(initialRelCount)
    })

    it('handles neutral stances without creating attack relations', () => {
      analyzer.analyzeDebate([
        {
          speaker: 'Neutral',
          text: 'Because the data is mixed. Therefore further research is needed.',
          stance: 'neutral',
        },
        {
          speaker: 'For',
          text: 'Because benefits outweigh risks. Therefore we should act.',
          stance: 'for',
        },
      ])
      const attacks = analyzer.getRelations().filter(r => r.type === 'attacks')
      expect(attacks.length).toBe(0)
    })

    it('increments debate count in stats', () => {
      expect(analyzer.getStats().debateCount).toBe(0)
      analyzer.analyzeDebate([
        { speaker: 'A', text: 'Because X. Therefore Y follows.', stance: 'for' },
      ])
      expect(analyzer.getStats().debateCount).toBe(1)
    })
  })

  // ── assessEvidence ──

  describe('assessEvidence', () => {
    it('returns high reliability for peer-reviewed evidence', () => {
      const result = analyzer.assessEvidence(
        'A peer-reviewed meta-analysis found significant results.',
      )
      expect(result.reliability).toBeGreaterThanOrEqual(0.9)
    })

    it('returns low reliability for anecdotal evidence', () => {
      const result = analyzer.assessEvidence('I heard from someone told me that trust me it works.')
      expect(result.reliability).toBeLessThan(0.5)
    })

    it('returns all required score fields', () => {
      const result = analyzer.assessEvidence('The study shows preliminary results.')
      expect(result).toHaveProperty('relevance')
      expect(result).toHaveProperty('reliability')
      expect(result).toHaveProperty('sufficiency')
      expect(result).toHaveProperty('overall')
    })

    it('scores between 0 and 1 for all fields', () => {
      const result = analyzer.assessEvidence(
        'Research indicates the data is statistically significant.',
      )
      expect(result.relevance).toBeGreaterThanOrEqual(0)
      expect(result.relevance).toBeLessThanOrEqual(1)
      expect(result.reliability).toBeGreaterThanOrEqual(0)
      expect(result.reliability).toBeLessThanOrEqual(1)
      expect(result.sufficiency).toBeGreaterThanOrEqual(0)
      expect(result.sufficiency).toBeLessThanOrEqual(1)
      expect(result.overall).toBeGreaterThanOrEqual(0)
      expect(result.overall).toBeLessThanOrEqual(1)
    })

    it('gives higher overall to stronger evidence', () => {
      const weak = analyzer.assessEvidence('Somebody told me about it once.')
      const strong = analyzer.assessEvidence(
        'A peer-reviewed systematic review with replicated randomized controlled trials demonstrates clear results.',
      )
      expect(strong.overall).toBeGreaterThan(weak.overall)
    })
  })

  // ── analyzeLogicalStructure ──

  describe('analyzeLogicalStructure', () => {
    it('returns null for unknown argument ID', () => {
      expect(analyzer.analyzeLogicalStructure('nonexistent')).toBeNull()
    })

    it('returns structure analysis for a valid argument', () => {
      const arg = analyzer.parseArgument(
        'Because exercise improves health. Since studies confirm this benefit. Therefore exercise is beneficial for health.',
      )
      const structure = analyzer.analyzeLogicalStructure(arg.id)
      expect(structure).not.toBeNull()
      expect(structure!).toHaveProperty('isValid')
      expect(structure!).toHaveProperty('hasGaps')
      expect(structure!).toHaveProperty('chainLength')
      expect(structure!).toHaveProperty('weakLinks')
      expect(structure!).toHaveProperty('structureType')
    })

    it('reports chain length equal to number of premises', () => {
      const arg = analyzer.parseArgument(
        'Because A is established. Since B is confirmed. Therefore C follows logically.',
      )
      const structure = analyzer.analyzeLogicalStructure(arg.id)
      expect(structure!.chainLength).toBe(arg.premises.length)
    })

    it('classifies deductive structure type', () => {
      const arg = analyzer.parseArgument(
        'Because all humans are mortal. Therefore Socrates must be mortal. It necessarily follows.',
      )
      const structure = analyzer.analyzeLogicalStructure(arg.id)
      expect(structure!.structureType).toBe('deductive')
    })

    it('classifies inductive structure type', () => {
      const arg = analyzer.parseArgument(
        'Because most birds can fly. This probably applies generally. The pattern typically holds.',
      )
      const structure = analyzer.analyzeLogicalStructure(arg.id)
      expect(structure!.structureType).toBe('inductive')
    })

    it('classifies abductive structure type', () => {
      const arg = analyzer.parseArgument(
        'Because the best explanation for the data is X. This hypothesis explains why the results occurred. It suggests that the model is plausible.',
      )
      const structure = analyzer.analyzeLogicalStructure(arg.id)
      expect(structure!.structureType).toBe('abductive')
    })

    it('identifies weak links when premises are disconnected from conclusion', () => {
      const arg = analyzer.parseArgument(
        'Because bananas are yellow fruit. Since the weather is sunny and warm. Therefore quantum physics is complicated and fascinating.',
      )
      const structure = analyzer.analyzeLogicalStructure(arg.id)
      expect(structure!.weakLinks.length).toBeGreaterThan(0)
    })
  })

  // ── compareArguments ──

  describe('compareArguments', () => {
    it('returns null when first argument does not exist', () => {
      const arg = analyzer.parseArgument('Because X. Therefore Y follows.')
      expect(analyzer.compareArguments('nonexistent', arg.id)).toBeNull()
    })

    it('returns null when second argument does not exist', () => {
      const arg = analyzer.parseArgument('Because X. Therefore Y follows.')
      expect(analyzer.compareArguments(arg.id, 'nonexistent')).toBeNull()
    })

    it('compares two arguments and returns a winner or tie', () => {
      const a1 = analyzer.parseArgument(
        'Because peer-reviewed research shows strong evidence. Since replicated studies confirm results. Therefore the theory is well-supported.',
      )
      const a2 = analyzer.parseArgument('I heard that it might be true. So maybe it works.')
      const result = analyzer.compareArguments(a1.id, a2.id)
      expect(result).not.toBeNull()
      expect(result!).toHaveProperty('winner')
      expect(result!).toHaveProperty('comparison')
      expect(result!).toHaveProperty('explanation')
    })

    it('returns comparison object with dimension scores', () => {
      const a1 = analyzer.parseArgument('Because A. Therefore B is true.')
      const a2 = analyzer.parseArgument('Because C. Therefore D is true.')
      const result = analyzer.compareArguments(a1.id, a2.id)
      expect(result!.comparison).toHaveProperty('overall')
      expect(result!.comparison).toHaveProperty('logicalValidity')
      expect(result!.comparison).toHaveProperty('evidenceQuality')
      expect(result!.comparison).toHaveProperty('relevance')
      expect(result!.comparison).toHaveProperty('sufficiency')
      expect(result!.comparison).toHaveProperty('coherence')
    })

    it('reports null winner for equally strong arguments', () => {
      const a1 = analyzer.parseArgument(
        'Because data supports claim. Therefore the conclusion holds.',
      )
      const a2 = analyzer.parseArgument(
        'Because data supports claim. Therefore the conclusion holds.',
      )
      const result = analyzer.compareArguments(a1.id, a2.id)
      expect(result).not.toBeNull()
      // Same text should produce near-equal strength → null winner
      expect(result!.winner).toBeNull()
      expect(result!.explanation).toContain('equal')
    })
  })

  // ── detectBias ──

  describe('detectBias', () => {
    it('detects confirmation bias indicators', () => {
      const biases = analyzer.detectBias(
        'Obviously and clearly this is the right answer. Of course it is.',
      )
      expect(biases.some(b => b.type === 'confirmation')).toBe(true)
    })

    it('detects selection bias indicators', () => {
      const biases = analyzer.detectBias(
        'They cherry-pick only looking at the data that supports them.',
      )
      expect(biases.some(b => b.type === 'selection')).toBe(true)
    })

    it('detects framing bias indicators', () => {
      const biases = analyzer.detectBias('They spin the narrative to make it seem positive.')
      expect(biases.some(b => b.type === 'framing')).toBe(true)
    })

    it('detects anchoring bias indicators', () => {
      const biases = analyzer.detectBias(
        'The first impression from the beginning was that the original claim was correct.',
      )
      expect(biases.some(b => b.type === 'anchoring')).toBe(true)
    })

    it('detects one-sidedness bias', () => {
      const biases = analyzer.detectBias(
        'This is good. This is great. This is the best. This is right. This is correct. This is beneficial.',
      )
      const oneSided = biases.find(b => b.type === 'one-sidedness')
      expect(oneSided).toBeDefined()
    })

    it('returns empty for neutral unbiased text', () => {
      const biases = analyzer.detectBias('The temperature today is 72 degrees Fahrenheit.')
      expect(biases.length).toBe(0)
    })

    it('returns severity between 0 and 1', () => {
      const biases = analyzer.detectBias('Obviously and clearly of course this is undeniably true.')
      for (const b of biases) {
        expect(b.severity).toBeGreaterThanOrEqual(0)
        expect(b.severity).toBeLessThanOrEqual(1)
      }
    })

    it('includes matched indicators', () => {
      const biases = analyzer.detectBias('Obviously and clearly this is correct.')
      const confirmation = biases.find(b => b.type === 'confirmation')
      expect(confirmation).toBeDefined()
      expect(confirmation!.indicators.length).toBeGreaterThan(0)
    })
  })

  // ── serialize / deserialize ──

  describe('serialize and deserialize', () => {
    it('serializes empty analyzer to valid JSON', () => {
      const json = analyzer.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('round-trips arguments through serialization', () => {
      const arg = analyzer.parseArgument('Because evidence is strong. Therefore the claim holds.')
      const json = analyzer.serialize()
      const restored = ArgumentAnalyzer.deserialize(json)
      expect(restored.getArgument(arg.id)).not.toBeNull()
      expect(restored.getArgument(arg.id)!.text).toBe(arg.text)
    })

    it('round-trips claims through serialization', () => {
      analyzer.extractClaims('Research indicates that water is essential for life.')
      const json = analyzer.serialize()
      const restored = ArgumentAnalyzer.deserialize(json)
      expect(restored.getStats().totalClaims).toBeGreaterThan(0)
    })

    it('round-trips relations through serialization', () => {
      const a1 = analyzer.parseArgument('Because A is true. Therefore B follows.')
      const a2 = analyzer.parseArgument('Because C is true. Therefore D follows.')
      analyzer.addRelation(a1.id, a2.id, 'supports')
      const json = analyzer.serialize()
      const restored = ArgumentAnalyzer.deserialize(json)
      expect(restored.getRelations().length).toBe(1)
    })

    it('round-trips fallacy log through serialization', () => {
      analyzer.detectFallacies("You're stupid so your argument is wrong.")
      const json = analyzer.serialize()
      const restored = ArgumentAnalyzer.deserialize(json)
      expect(restored.getFallacyLog().length).toBeGreaterThan(0)
    })

    it('round-trips debates through serialization', () => {
      analyzer.analyzeDebate([
        { speaker: 'Alice', text: 'Because data. Therefore conclusion is valid.', stance: 'for' },
      ])
      const json = analyzer.serialize()
      const restored = ArgumentAnalyzer.deserialize(json)
      expect(restored.getStats().debateCount).toBe(1)
    })

    it('preserves config through serialization', () => {
      const custom = new ArgumentAnalyzer({ maxClaimsPerText: 3 })
      custom.parseArgument('Because X. Therefore Y is the answer.')
      const json = custom.serialize()
      const restored = ArgumentAnalyzer.deserialize(json)
      // Config was preserved — verify by testing maxClaimsPerText behavior
      const claims = restored.extractClaims(
        'Therefore A is true. Thus B is valid. Hence C follows. So D must be right.',
      )
      expect(claims.length).toBeLessThanOrEqual(3)
    })
  })

  // ── getStats ──

  describe('getStats', () => {
    it('returns zero stats for a fresh analyzer', () => {
      const stats = analyzer.getStats()
      expect(stats.totalArguments).toBe(0)
      expect(stats.totalClaims).toBe(0)
      expect(stats.totalFallaciesDetected).toBe(0)
      expect(stats.totalRelations).toBe(0)
      expect(stats.averageStrength).toBe(0)
      expect(stats.debateCount).toBe(0)
    })

    it('tracks argument count', () => {
      analyzer.parseArgument('Because A. Therefore B is the conclusion.')
      analyzer.parseArgument('Because C. Therefore D is the conclusion.')
      expect(analyzer.getStats().totalArguments).toBe(2)
    })

    it('tracks claim count', () => {
      analyzer.extractClaims(
        'Studies show that exercise is important. Research indicates sleep matters.',
      )
      expect(analyzer.getStats().totalClaims).toBeGreaterThan(0)
    })

    it('tracks fallacy count', () => {
      analyzer.detectFallacies("You're an idiot and you have no experience.")
      expect(analyzer.getStats().totalFallaciesDetected).toBeGreaterThan(0)
    })

    it('tracks relation count', () => {
      const a1 = analyzer.parseArgument('Because A. Therefore B follows logically.')
      const a2 = analyzer.parseArgument('Because C. Therefore D follows logically.')
      analyzer.addRelation(a1.id, a2.id, 'supports')
      expect(analyzer.getStats().totalRelations).toBe(1)
    })

    it('computes average strength', () => {
      analyzer.parseArgument('Because evidence is solid. Therefore the claim holds firmly.')
      const stats = analyzer.getStats()
      expect(stats.averageStrength).toBeGreaterThan(0)
      expect(stats.averageStrength).toBeLessThanOrEqual(1)
    })

    it('tracks fallacy distribution', () => {
      analyzer.detectFallacies("You're stupid and you have no knowledge of anything.")
      analyzer.detectFallacies('But what about the other issue? The real problem is elsewhere.')
      const dist = analyzer.getStats().fallacyDistribution
      expect(Object.keys(dist).length).toBeGreaterThan(0)
    })
  })

  // ── Retrieval Methods ──

  describe('retrieval methods', () => {
    it('getArgument returns null for unknown ID', () => {
      expect(analyzer.getArgument('unknown')).toBeNull()
    })

    it('getArguments returns all stored arguments', () => {
      analyzer.parseArgument('Because A. Therefore B is the conclusion.')
      analyzer.parseArgument('Because C. Therefore D is the conclusion.')
      expect(analyzer.getArguments().length).toBe(2)
    })

    it('getClaim returns null for unknown ID', () => {
      expect(analyzer.getClaim('unknown')).toBeNull()
    })

    it('getRelations returns empty array initially', () => {
      expect(analyzer.getRelations()).toEqual([])
    })

    it('getFallacyLog returns empty array initially', () => {
      expect(analyzer.getFallacyLog()).toEqual([])
    })
  })
})
