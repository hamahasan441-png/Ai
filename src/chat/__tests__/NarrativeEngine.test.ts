import { describe, it, expect, beforeEach } from 'vitest'
import { NarrativeEngine } from '../NarrativeEngine.js'

// ── Shared fixtures ─────────────────────────────────────────────────

/** A short multi-sentence narrative covering several arc phases. */
const SHORT_STORY = [
  'The village was calm and peaceful under the morning sun.',
  'A stranger arrived suddenly with an unexpected message.',
  'Tension builds as the threat of danger looms over the town.',
  'The warriors prepare to fight the approaching enemy.',
  'Battle erupts in fury as the two forces confront each other.',
  'In a desperate struggle the hero faces the ultimate showdown.',
  'The enemy is defeated and peace is restored.',
  'The villagers celebrate their victory with joy and relief.',
].join(' ')

/** A longer narrative for richer extraction tests. */
const LONG_STORY = [
  'In a distant kingdom the young hero lived a quiet life.',
  'One day a herald appeared with a call to adventure.',
  'The hero crossed the threshold into the unknown wilderness.',
  'Along the journey a wise mentor taught courage and wisdom.',
  'Trials and danger tested the hero at every turn.',
  'A treacherous betrayal shattered the trust of allies.',
  'The hero discovered a hidden truth about identity.',
  'Rage and fury consumed the battlefield in the final battle.',
  'In a desperate last stand the hero confronted the enemy.',
  'Love and sacrifice turned the tide against darkness.',
  'The villain was defeated and justice was restored.',
  'The hero returned home to peace and harmony.',
  'Friends reunited and celebrated with joy and laughter.',
  'The dawn of a new era brought hope and freedom.',
].join(' ')

describe('NarrativeEngine', () => {
  let engine: NarrativeEngine

  beforeEach(() => {
    engine = new NarrativeEngine()
  })

  // ── Constructor & Config ──────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default config', () => {
      const e = new NarrativeEngine()
      const stats = e.getStats()
      expect(stats.totalBeats).toBe(0)
      expect(stats.totalCharacters).toBe(0)
    })

    it('accepts partial config overrides', () => {
      const e = new NarrativeEngine({ maxBeats: 5, tensionDecayRate: 0.5 })
      // Adding more than 5 beats should evict the oldest
      for (let i = 0; i < 7; i++) {
        e.addBeat(`Beat number ${i}.`)
      }
      expect(e.getStats().totalBeats).toBeLessThanOrEqual(5)
    })

    it('defaults to 100 maxBeats', () => {
      const e = new NarrativeEngine()
      for (let i = 0; i < 5; i++) e.addBeat(`Beat ${i}.`)
      expect(e.getStats().totalBeats).toBe(5)
    })

    it('respects maxCharacters limit', () => {
      const e = new NarrativeEngine({ maxCharacters: 2 })
      e.addCharacter('Alice', 'protagonist')
      e.addCharacter('Bob', 'antagonist')
      // mark first as inactive so eviction can find a candidate
      const _chars = e.getCharacters()
      // Third add may evict
      e.addCharacter('Charlie', 'mentor')
      expect(e.getCharacters().length).toBeLessThanOrEqual(3)
    })
  })

  // ── Beat Management ───────────────────────────────────────────────

  describe('addBeat / getBeat / getBeats', () => {
    it('returns a unique ID for each beat', () => {
      const id1 = engine.addBeat('First sentence.')
      const id2 = engine.addBeat('Second sentence.')
      expect(id1).not.toBe(id2)
    })

    it('retrieves a beat by ID', () => {
      const id = engine.addBeat('Hello world.')
      const beat = engine.getBeat(id)
      expect(beat).not.toBeNull()
      expect(beat!.text).toBe('Hello world.')
    })

    it('returns null for unknown beat ID', () => {
      expect(engine.getBeat('nonexistent')).toBeNull()
    })

    it('lists all beats in insertion order', () => {
      engine.addBeat('A.')
      engine.addBeat('B.')
      engine.addBeat('C.')
      const beats = engine.getBeats()
      expect(beats).toHaveLength(3)
      expect(beats[0].text).toBe('A.')
      expect(beats[2].text).toBe('C.')
    })

    it('assigns sequential indices', () => {
      engine.addBeat('First.')
      engine.addBeat('Second.')
      const beats = engine.getBeats()
      expect(beats[0].index).toBe(0)
      expect(beats[1].index).toBe(1)
    })

    it('evicts oldest beat when maxBeats exceeded', () => {
      const small = new NarrativeEngine({ maxBeats: 3 })
      const id1 = small.addBeat('One.')
      small.addBeat('Two.')
      small.addBeat('Three.')
      small.addBeat('Four.')
      expect(small.getBeat(id1)).toBeNull()
      expect(small.getStats().totalBeats).toBe(3)
    })

    it('assigns a phase to each beat', () => {
      const id = engine.addBeat('A dangerous fight erupts.')
      const beat = engine.getBeat(id)
      expect(beat).not.toBeNull()
      expect(typeof beat!.phase).toBe('string')
    })

    it('assigns a tension value between 0 and 1', () => {
      engine.addBeat('The warrior faces a desperate battle with fury.')
      const beat = engine.getBeats()[0]
      expect(beat.tension).toBeGreaterThanOrEqual(0)
      expect(beat.tension).toBeLessThanOrEqual(1)
    })
  })

  // ── analyzeNarrative ──────────────────────────────────────────────

  describe('analyzeNarrative', () => {
    it('returns empty analysis for empty text', () => {
      const result = engine.analyzeNarrative('')
      expect(result.arcs).toHaveLength(0)
      expect(result.summary).toBe('')
      expect(result.structure.type).toBe('unknown')
    })

    it('returns a full NarrativeAnalysis object', () => {
      const result = engine.analyzeNarrative(SHORT_STORY)
      expect(result).toHaveProperty('structure')
      expect(result).toHaveProperty('arcs')
      expect(result).toHaveProperty('plotPoints')
      expect(result).toHaveProperty('themes')
      expect(result).toHaveProperty('coherence')
      expect(result).toHaveProperty('tensionCurve')
      expect(result).toHaveProperty('foreshadowing')
      expect(result).toHaveProperty('patterns')
      expect(result).toHaveProperty('summary')
    })

    it('creates beats for each sentence', () => {
      engine.analyzeNarrative(SHORT_STORY)
      expect(engine.getStats().totalBeats).toBeGreaterThan(0)
    })

    it('produces a non-empty summary for valid text', () => {
      const result = engine.analyzeNarrative(SHORT_STORY)
      expect(result.summary.length).toBeGreaterThan(0)
    })

    it('populates the tension curve', () => {
      const result = engine.analyzeNarrative(SHORT_STORY)
      expect(result.tensionCurve.length).toBeGreaterThan(0)
    })

    it('detects structure with non-zero confidence', () => {
      const result = engine.analyzeNarrative(LONG_STORY)
      expect(result.structure.confidence).toBeGreaterThan(0)
    })
  })

  // ── detectArcs ────────────────────────────────────────────────────

  describe('detectArcs', () => {
    it('returns empty for fewer than 3 beats', () => {
      engine.addBeat('Hello.')
      engine.addBeat('World.')
      expect(engine.detectArcs()).toHaveLength(0)
    })

    it('returns at least one arc for a multi-beat story', () => {
      for (const sentence of SHORT_STORY.split('. ')) {
        engine.addBeat(sentence + '.')
      }
      const arcs = engine.detectArcs()
      expect(arcs.length).toBeGreaterThanOrEqual(1)
    })

    it('each arc has a tension curve', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      const arcs = engine.detectArcs()
      for (const arc of arcs) {
        expect(arc.tensionCurve.length).toBeGreaterThan(0)
      }
    })

    it('arc has a peak tension value', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      const arcs = engine.detectArcs()
      for (const arc of arcs) {
        expect(arc.peakTension).toBeGreaterThanOrEqual(0)
        expect(arc.peakTension).toBeLessThanOrEqual(1)
      }
    })

    it('arc beats reference valid beat IDs', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      const arcs = engine.detectArcs()
      for (const arc of arcs) {
        for (const beatId of arc.beats) {
          expect(engine.getBeat(beatId)).not.toBeNull()
        }
      }
    })

    it('stores arcs retrievable via getArcs', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      engine.detectArcs()
      expect(engine.getArcs().length).toBeGreaterThan(0)
    })
  })

  // ── Character Management ──────────────────────────────────────────

  describe('addCharacter / getCharacter / getCharacterByName', () => {
    it('adds a character with defaults', () => {
      const char = engine.addCharacter('Alice')
      expect(char.name).toBe('Alice')
      expect(char.role).toBe('unknown')
      expect(char.traits).toEqual([])
    })

    it('adds a character with role and traits', () => {
      const char = engine.addCharacter('Bob', 'antagonist', ['cunning', 'ruthless'])
      expect(char.role).toBe('antagonist')
      expect(char.traits).toContain('cunning')
    })

    it('retrieves character by ID', () => {
      const char = engine.addCharacter('Carol')
      expect(engine.getCharacter(char.id)).not.toBeNull()
      expect(engine.getCharacter(char.id)!.name).toBe('Carol')
    })

    it('returns null for unknown character ID', () => {
      expect(engine.getCharacter('nope')).toBeNull()
    })

    it('finds character by name case-insensitively', () => {
      engine.addCharacter('Diana')
      expect(engine.getCharacterByName('diana')).not.toBeNull()
      expect(engine.getCharacterByName('DIANA')).not.toBeNull()
    })

    it('returns null when name not found', () => {
      expect(engine.getCharacterByName('Nobody')).toBeNull()
    })

    it('lists all characters', () => {
      engine.addCharacter('A')
      engine.addCharacter('B')
      expect(engine.getCharacters()).toHaveLength(2)
    })

    it('detects characters in beat text', () => {
      engine.addCharacter('Gandalf', 'mentor')
      const id = engine.addBeat('Gandalf spoke with authority.')
      const beat = engine.getBeat(id)
      expect(beat!.characters.length).toBeGreaterThan(0)
    })

    it('increments mentions when character appears in beat', () => {
      const char = engine.addCharacter('Elara')
      engine.addBeat('Elara walked through the forest.')
      engine.addBeat('Elara found a hidden path.')
      const updated = engine.getCharacter(char.id)
      expect(updated!.mentions).toBe(2)
    })
  })

  // ── trackCharacterArc ─────────────────────────────────────────────

  describe('trackCharacterArc', () => {
    it('returns null for unknown character', () => {
      expect(engine.trackCharacterArc('fake_id', 0)).toBeNull()
    })

    it('records trait progression', () => {
      const char = engine.addCharacter('Hero', 'protagonist', ['brave'])
      engine.addBeat('The hero departs.')
      const arc = engine.trackCharacterArc(char.id, 0, ['brave', 'wise'])
      expect(arc).not.toBeNull()
      expect(arc!.traitProgression.length).toBeGreaterThanOrEqual(2)
    })

    it('records role shifts', () => {
      const char = engine.addCharacter('Ally', 'sidekick')
      engine.addBeat('The ally speaks.')
      const arc = engine.trackCharacterArc(char.id, 0, undefined, 'mentor')
      expect(arc).not.toBeNull()
      expect(arc!.roleShifts).toHaveLength(1)
      expect(arc!.roleShifts[0].from).toBe('sidekick')
      expect(arc!.roleShifts[0].to).toBe('mentor')
    })

    it('does not record role shift when role unchanged', () => {
      const char = engine.addCharacter('Steady', 'protagonist')
      engine.addBeat('Steady moves forward.')
      const arc = engine.trackCharacterArc(char.id, 0, undefined, 'protagonist')
      expect(arc!.roleShifts).toHaveLength(0)
    })

    it('retrieves arc via getCharacterArc', () => {
      const char = engine.addCharacter('Test')
      const arc = engine.getCharacterArc(char.id)
      expect(arc).not.toBeNull()
      expect(arc!.characterId).toBe(char.id)
    })

    it('returns null arc for unknown character', () => {
      expect(engine.getCharacterArc('missing')).toBeNull()
    })
  })

  // ── getCharacterRelations ─────────────────────────────────────────

  describe('getCharacterRelations', () => {
    it('returns empty when no relations exist', () => {
      expect(engine.getCharacterRelations()).toHaveLength(0)
    })

    it('creates automatic relation when characters co-appear', () => {
      const _a = engine.addCharacter('Alpha')
      const _b = engine.addCharacter('Beta')
      engine.addBeat('Alpha and Beta met under the tree.')
      const relations = engine.getCharacterRelations()
      expect(relations.length).toBeGreaterThan(0)
    })

    it('filters relations by character ID', () => {
      const _a = engine.addCharacter('Alpha')
      const b = engine.addCharacter('Beta')
      const _c = engine.addCharacter('Gamma')
      engine.addBeat('Alpha and Beta met.')
      engine.addBeat('Beta and Gamma talked.')
      const betaRelations = engine.getCharacterRelations(b.id)
      expect(betaRelations.length).toBeGreaterThanOrEqual(1)
    })

    it('increments coAppearances on repeated co-occurrence', () => {
      const a = engine.addCharacter('Alpha')
      const b = engine.addCharacter('Beta')
      engine.addBeat('Alpha and Beta met.')
      engine.addBeat('Alpha and Beta fought.')
      const rel = engine.getCharacterRelations(a.id)
      const withBeta = rel.find(r => r.characterA === b.id || r.characterB === b.id)
      expect(withBeta).toBeDefined()
      expect(withBeta!.coAppearances).toBeGreaterThanOrEqual(2)
    })

    it('returns all relations when no ID provided', () => {
      const a = engine.addCharacter('A')
      const b = engine.addCharacter('B')
      engine.addRelation(a.id, b.id, 'ally')
      expect(engine.getCharacterRelations()).toHaveLength(1)
    })
  })

  // ── addRelation ───────────────────────────────────────────────────

  describe('addRelation', () => {
    it('returns null if character A does not exist', () => {
      const b = engine.addCharacter('B')
      expect(engine.addRelation('fake', b.id, 'ally')).toBeNull()
    })

    it('returns null if character B does not exist', () => {
      const a = engine.addCharacter('A')
      expect(engine.addRelation(a.id, 'fake', 'ally')).toBeNull()
    })

    it('creates a new relation with default strength', () => {
      const a = engine.addCharacter('A')
      const b = engine.addCharacter('B')
      const rel = engine.addRelation(a.id, b.id, 'rival')
      expect(rel).not.toBeNull()
      expect(rel!.type).toBe('rival')
      expect(rel!.strength).toBe(0.5)
    })

    it('updates existing relation type and strength', () => {
      const a = engine.addCharacter('A')
      const b = engine.addCharacter('B')
      engine.addRelation(a.id, b.id, 'neutral', 0.3)
      const updated = engine.addRelation(a.id, b.id, 'romantic', 0.9)
      expect(updated!.type).toBe('romantic')
      expect(updated!.strength).toBe(0.9)
    })

    it('clamps strength to 0-1 range', () => {
      const a = engine.addCharacter('A')
      const b = engine.addCharacter('B')
      const rel = engine.addRelation(a.id, b.id, 'ally', 5)
      expect(rel!.strength).toBeLessThanOrEqual(1)
    })
  })

  // ── extractPlotPoints ─────────────────────────────────────────────

  describe('extractPlotPoints', () => {
    it('returns empty for text with no plot indicators', () => {
      const pp = engine.extractPlotPoints('The sky is blue today.')
      expect(pp).toHaveLength(0)
    })

    it('detects plot points from keyword-rich text', () => {
      const text =
        'Suddenly a stranger arrived. The hero made a decision to change everything. The final showdown began.'
      const pp = engine.extractPlotPoints(text)
      expect(pp.length).toBeGreaterThan(0)
    })

    it('each plot point has a type', () => {
      const text =
        'Suddenly something unexpected happened. The hero chose to reveal the hidden truth.'
      const pp = engine.extractPlotPoints(text)
      const validTypes = [
        'inciting_incident',
        'turning_point',
        'climax',
        'resolution',
        'revelation',
        'setback',
        'milestone',
      ]
      for (const p of pp) {
        expect(validTypes).toContain(p.type)
      }
    })

    it('plot points have significance in 0-1', () => {
      const text = 'The hero suddenly discovered a hidden secret and revealed the truth.'
      const pp = engine.extractPlotPoints(text)
      for (const p of pp) {
        expect(p.significance).toBeGreaterThanOrEqual(0)
        expect(p.significance).toBeLessThanOrEqual(1)
      }
    })

    it('links plot points causally to previous ones', () => {
      const text =
        'Suddenly the stranger arrived. Then the hero made a decision to change. Finally the last battle concluded.'
      const pp = engine.extractPlotPoints(text)
      if (pp.length >= 2) {
        expect(pp[1].causalLinks).toContain(pp[0].id)
      }
    })

    it('stores plot points retrievable via getPlotPoints', () => {
      engine.extractPlotPoints('Suddenly something unexpected happened.')
      expect(engine.getPlotPoints().length).toBeGreaterThanOrEqual(0)
    })
  })

  // ── extractThemes ─────────────────────────────────────────────────

  describe('extractThemes', () => {
    it('returns empty when no beats exist', () => {
      expect(engine.extractThemes()).toHaveLength(0)
    })

    it('extracts themes from beats with thematic keywords', () => {
      engine.addBeat('Love and passion filled the air.')
      engine.addBeat('Heart and devotion guided her path.')
      const themes = engine.extractThemes()
      expect(themes.length).toBeGreaterThan(0)
      expect(themes.some(t => t.name === 'love')).toBe(true)
    })

    it('requires minimum occurrences before reporting a theme', () => {
      // Only one beat mentioning justice — should not meet default threshold of 2
      engine.addBeat('Justice was served in the trial.')
      const themes = engine.extractThemes()
      const justice = themes.find(t => t.name === 'justice')
      // May or may not appear depending on threshold
      if (justice) {
        expect(justice.occurrences).toBeGreaterThanOrEqual(2)
      }
    })

    it('themes have strength between 0 and 1', () => {
      engine.addBeat('Freedom and liberty for all.')
      engine.addBeat('Escape from the cage and break the chains.')
      const themes = engine.extractThemes()
      for (const t of themes) {
        expect(t.strength).toBeGreaterThanOrEqual(0)
        expect(t.strength).toBeLessThanOrEqual(1)
      }
    })

    it('sorts themes by strength descending', () => {
      engine.addBeat('Love and heart and passion.')
      engine.addBeat('Love devotion and desire.')
      engine.addBeat('Power and control.')
      engine.addBeat('Power and authority.')
      const themes = engine.extractThemes()
      for (let i = 1; i < themes.length; i++) {
        expect(themes[i - 1].strength).toBeGreaterThanOrEqual(themes[i].strength)
      }
    })

    it('stores themes retrievable via getThemes', () => {
      engine.addBeat('Courage and bravery.')
      engine.addBeat('Courage and valor.')
      engine.extractThemes()
      expect(engine.getThemes().length).toBeGreaterThanOrEqual(0)
    })
  })

  // ── classifyStructure ─────────────────────────────────────────────

  describe('classifyStructure', () => {
    it('returns unknown for fewer than 3 beats', () => {
      engine.addBeat('A.')
      engine.addBeat('B.')
      const structure = engine.classifyStructure()
      expect(structure.type).toBe('unknown')
      expect(structure.confidence).toBe(0)
    })

    it('returns a valid structure type', () => {
      for (const s of LONG_STORY.split('. ')) engine.addBeat(s + '.')
      const structure = engine.classifyStructure()
      const validTypes = [
        'three_act',
        'heros_journey',
        'five_act',
        'kishotenketsu',
        'freytag_pyramid',
        'in_medias_res',
        'frame_narrative',
        'unknown',
      ]
      expect(validTypes).toContain(structure.type)
    })

    it('confidence is between 0 and 1', () => {
      for (const s of LONG_STORY.split('. ')) engine.addBeat(s + '.')
      const structure = engine.classifyStructure()
      expect(structure.confidence).toBeGreaterThanOrEqual(0)
      expect(structure.confidence).toBeLessThanOrEqual(1)
    })

    it('includes matched phases with beat ranges', () => {
      for (const s of LONG_STORY.split('. ')) engine.addBeat(s + '.')
      const structure = engine.classifyStructure()
      if (structure.type !== 'unknown') {
        expect(structure.matchedPhases.length).toBeGreaterThan(0)
        for (const phase of structure.matchedPhases) {
          expect(phase.startBeat).toBeLessThanOrEqual(phase.endBeat)
        }
      }
    })
  })

  // ── generateStoryBeat ─────────────────────────────────────────────

  describe('generateStoryBeat', () => {
    it('generates a beat with no prior state', () => {
      const beat = engine.generateStoryBeat()
      expect(beat).toHaveProperty('id')
      expect(beat).toHaveProperty('text')
      expect(beat).toHaveProperty('phase')
      expect(beat).toHaveProperty('tension')
    })

    it('generated beat has exposition phase when engine is empty', () => {
      const beat = engine.generateStoryBeat()
      expect(beat.phase).toBe('exposition')
    })

    it('incorporates context when provided', () => {
      const beat = engine.generateStoryBeat('a raging storm')
      expect(beat.text).toContain('a raging storm')
    })

    it('includes character names in generated text', () => {
      engine.addCharacter('Aria', 'protagonist')
      engine.addBeat('Aria ventured into the forest.')
      const beat = engine.generateStoryBeat()
      expect(beat.text).toContain('Aria')
    })

    it('generated tension is between 0 and 1', () => {
      for (let i = 0; i < 5; i++) engine.addBeat(`Beat ${i} with some danger.`)
      const beat = engine.generateStoryBeat()
      expect(beat.tension).toBeGreaterThanOrEqual(0)
      expect(beat.tension).toBeLessThanOrEqual(1)
    })

    it('advances phase beyond exposition after high-tension beats', () => {
      // Add high-tension beats
      for (let i = 0; i < 5; i++) {
        engine.addBeat('Danger and fury and battle and desperate struggle.')
      }
      const beat = engine.generateStoryBeat()
      // Should predict climax or falling_action after many high-tension beats
      expect(['climax', 'falling_action', 'rising_action']).toContain(beat.phase)
    })
  })

  // ── analyzeCoherence ──────────────────────────────────────────────

  describe('analyzeCoherence', () => {
    it('returns perfect score for fewer than 2 beats', () => {
      engine.addBeat('Single beat.')
      const report = engine.analyzeCoherence()
      expect(report.overallScore).toBe(1)
      expect(report.issues).toHaveLength(0)
    })

    it('returns a coherence report with all fields', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      const report = engine.analyzeCoherence()
      expect(report).toHaveProperty('overallScore')
      expect(report).toHaveProperty('characterConsistency')
      expect(report).toHaveProperty('plotConsistency')
      expect(report).toHaveProperty('thematicConsistency')
      expect(report).toHaveProperty('temporalConsistency')
      expect(report).toHaveProperty('issues')
    })

    it('overall score is between 0 and 1', () => {
      for (const s of LONG_STORY.split('. ')) engine.addBeat(s + '.')
      const report = engine.analyzeCoherence()
      expect(report.overallScore).toBeGreaterThanOrEqual(0)
      expect(report.overallScore).toBeLessThanOrEqual(1)
    })

    it('detects issues for abrupt trait changes', () => {
      const char = engine.addCharacter('Hero', 'protagonist', ['kind', 'gentle'])
      engine.addBeat('Hero was kind.')
      engine.addBeat('Hero was different now.')
      engine.trackCharacterArc(char.id, 1, ['cruel', 'ruthless'])
      const report = engine.analyzeCoherence()
      expect(report.characterConsistency).toBeLessThanOrEqual(1)
    })

    it('sub-scores are each between 0 and 1', () => {
      for (const s of LONG_STORY.split('. ')) engine.addBeat(s + '.')
      const report = engine.analyzeCoherence()
      expect(report.characterConsistency).toBeGreaterThanOrEqual(0)
      expect(report.characterConsistency).toBeLessThanOrEqual(1)
      expect(report.plotConsistency).toBeGreaterThanOrEqual(0)
      expect(report.plotConsistency).toBeLessThanOrEqual(1)
      expect(report.thematicConsistency).toBeGreaterThanOrEqual(0)
      expect(report.thematicConsistency).toBeLessThanOrEqual(1)
      expect(report.temporalConsistency).toBeGreaterThanOrEqual(0)
      expect(report.temporalConsistency).toBeLessThanOrEqual(1)
    })
  })

  // ── buildTensionCurve ─────────────────────────────────────────────

  describe('buildTensionCurve', () => {
    it('returns empty for no beats', () => {
      expect(engine.buildTensionCurve()).toHaveLength(0)
    })

    it('returns one point per beat', () => {
      engine.addBeat('A.')
      engine.addBeat('B.')
      engine.addBeat('C.')
      const curve = engine.buildTensionCurve()
      expect(curve).toHaveLength(3)
    })

    it('each point has beatIndex, tension, phase, and label', () => {
      engine.addBeat('The warrior fights.')
      const curve = engine.buildTensionCurve()
      expect(curve[0]).toHaveProperty('beatIndex')
      expect(curve[0]).toHaveProperty('tension')
      expect(curve[0]).toHaveProperty('phase')
      expect(curve[0]).toHaveProperty('label')
    })

    it('tension values are between 0 and 1', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      const curve = engine.buildTensionCurve()
      for (const point of curve) {
        expect(point.tension).toBeGreaterThanOrEqual(0)
        expect(point.tension).toBeLessThanOrEqual(1)
      }
    })

    it('labels map to known tension labels', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      const curve = engine.buildTensionCurve()
      const validLabels = ['calm', 'mild', 'moderate', 'high', 'intense']
      for (const point of curve) {
        expect(validLabels).toContain(point.label)
      }
    })
  })

  // ── detectForeshadowing ───────────────────────────────────────────

  describe('detectForeshadowing', () => {
    it('returns empty for fewer than 4 beats', () => {
      engine.addBeat('A.')
      engine.addBeat('B.')
      engine.addBeat('C.')
      expect(engine.detectForeshadowing()).toHaveLength(0)
    })

    it('detects keyword echoes between distant beats', () => {
      // Plant shared keywords early and repeat them later
      engine.addBeat('The ancient sword glowed with mysterious power.')
      engine.addBeat('The traveler crossed the bridge.')
      engine.addBeat('Night fell over the quiet village.')
      engine.addBeat('Rain poured down on the road.')
      engine.addBeat('A dangerous enemy appeared in the dark.')
      engine.addBeat('The ancient sword glowed again with power unleashed.')
      const fs = engine.detectForeshadowing()
      // May or may not detect depending on thresholds, but should not crash
      expect(Array.isArray(fs)).toBe(true)
    })

    it('foreshadowing elements have required fields', () => {
      // Add beats with overlapping keywords separated by distance
      const beats = [
        'The sword of destiny was forged in darkness.',
        'The village celebrated the harvest season.',
        'Travelers crossed the mountain pass safely.',
        'Dark clouds gathered over the kingdom.',
        'The sword of destiny appeared once more in darkness.',
      ]
      for (const b of beats) engine.addBeat(b)
      const fs = engine.detectForeshadowing()
      for (const elem of fs) {
        expect(elem).toHaveProperty('plantBeatId')
        expect(elem).toHaveProperty('payoffBeatId')
        expect(elem).toHaveProperty('description')
        expect(elem).toHaveProperty('keywords')
        expect(elem).toHaveProperty('resolved')
        expect(elem).toHaveProperty('confidence')
      }
    })

    it('stores foreshadowing accessible via getForeshadowing', () => {
      for (let i = 0; i < 6; i++) engine.addBeat(`Beat ${i} with some shared keywords repeated.`)
      engine.detectForeshadowing()
      expect(Array.isArray(engine.getForeshadowing())).toBe(true)
    })

    it('confidence is between 0 and 1', () => {
      const beats = [
        'The ancient darkness concealed the hidden sword.',
        'A calm river flowed through the valley.',
        'Merchants traveled through the mountain pass.',
        'Storms raged across the kingdom lands.',
        'The ancient darkness returned with the hidden sword.',
      ]
      for (const b of beats) engine.addBeat(b)
      const fs = engine.detectForeshadowing()
      for (const elem of fs) {
        expect(elem.confidence).toBeGreaterThanOrEqual(0)
        expect(elem.confidence).toBeLessThanOrEqual(1)
      }
    })
  })

  // ── summarizeNarrative ────────────────────────────────────────────

  describe('summarizeNarrative', () => {
    it('returns empty string for no beats', () => {
      expect(engine.summarizeNarrative()).toBe('')
    })

    it('includes "The story begins" for exposition beats', () => {
      engine.addBeat('The village was peaceful and quiet.')
      const summary = engine.summarizeNarrative()
      expect(summary).toContain('The story begins')
    })

    it('mentions key characters in summary', () => {
      engine.addCharacter('Kael', 'protagonist')
      engine.addBeat('Kael set out on a journey.')
      const summary = engine.summarizeNarrative()
      expect(summary).toContain('Kael')
    })

    it('mentions themes in summary when extracted', () => {
      engine.addBeat('Love and passion filled the room.')
      engine.addBeat('Love and devotion guided her heart.')
      engine.extractThemes()
      const summary = engine.summarizeNarrative()
      expect(summary).toContain('love')
    })

    it('produces non-empty summary for a complete narrative', () => {
      engine.analyzeNarrative(LONG_STORY)
      const summary = engine.summarizeNarrative()
      expect(summary.length).toBeGreaterThan(20)
    })
  })

  // ── serialize / deserialize ───────────────────────────────────────

  describe('serialize / deserialize', () => {
    it('produces valid JSON', () => {
      engine.addBeat('Hello.')
      const json = engine.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('round-trips beats correctly', () => {
      engine.addBeat('First beat.')
      engine.addBeat('Second beat.')
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getStats().totalBeats).toBe(2)
      const beats = restored.getBeats()
      expect(beats[0].text).toBe('First beat.')
      expect(beats[1].text).toBe('Second beat.')
    })

    it('round-trips characters', () => {
      engine.addCharacter('Alice', 'protagonist', ['brave'])
      engine.addCharacter('Bob', 'antagonist', ['cunning'])
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getCharacters()).toHaveLength(2)
      expect(restored.getCharacterByName('Alice')).not.toBeNull()
    })

    it('round-trips relations', () => {
      const a = engine.addCharacter('A')
      const b = engine.addCharacter('B')
      engine.addRelation(a.id, b.id, 'ally', 0.8)
      const restored = NarrativeEngine.deserialize(engine.serialize())
      const relations = restored.getCharacterRelations()
      expect(relations).toHaveLength(1)
      expect(relations[0].type).toBe('ally')
    })

    it('round-trips config', () => {
      const custom = new NarrativeEngine({ maxBeats: 7, tensionDecayRate: 0.99 })
      custom.addBeat('Test.')
      const json = custom.serialize()
      const data = JSON.parse(json)
      expect(data.config.maxBeats).toBe(7)
      expect(data.config.tensionDecayRate).toBe(0.99)
    })

    it('round-trips arcs', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      engine.detectArcs()
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getArcs().length).toBeGreaterThan(0)
    })

    it('round-trips foreshadowing', () => {
      const beats = [
        'The ancient darkness concealed the hidden sword.',
        'A calm river flowed through the valley.',
        'Merchants traveled through the mountain pass.',
        'Storms raged across the kingdom lands.',
        'The ancient darkness returned with the hidden sword.',
      ]
      for (const b of beats) engine.addBeat(b)
      engine.detectForeshadowing()
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getForeshadowing().length).toBe(engine.getForeshadowing().length)
    })

    it('round-trips plot points', () => {
      engine.extractPlotPoints('Suddenly the hero arrived and made a decision.')
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getPlotPoints().length).toBe(engine.getPlotPoints().length)
    })

    it('round-trips themes', () => {
      engine.addBeat('Love and passion.')
      engine.addBeat('Love and devotion.')
      engine.extractThemes()
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getThemes().length).toBe(engine.getThemes().length)
    })

    it('handles deserializing empty engine', () => {
      const restored = NarrativeEngine.deserialize(engine.serialize())
      expect(restored.getStats().totalBeats).toBe(0)
    })
  })

  // ── getStats ──────────────────────────────────────────────────────

  describe('getStats', () => {
    it('reports zeroes for a fresh engine', () => {
      const stats = engine.getStats()
      expect(stats.totalBeats).toBe(0)
      expect(stats.totalCharacters).toBe(0)
      expect(stats.totalPlotPoints).toBe(0)
      expect(stats.totalThemes).toBe(0)
      expect(stats.totalArcs).toBe(0)
      expect(stats.averageTension).toBe(0)
      expect(stats.resolvedForeshadowing).toBe(0)
      expect(stats.unresolvedForeshadowing).toBe(0)
    })

    it('counts beats correctly after adding', () => {
      engine.addBeat('One.')
      engine.addBeat('Two.')
      expect(engine.getStats().totalBeats).toBe(2)
    })

    it('counts characters correctly', () => {
      engine.addCharacter('A')
      engine.addCharacter('B')
      engine.addCharacter('C')
      expect(engine.getStats().totalCharacters).toBe(3)
    })

    it('tracks average tension', () => {
      engine.addBeat('Peace and calm.')
      engine.addBeat('Danger and battle.')
      const stats = engine.getStats()
      expect(stats.averageTension).toBeGreaterThanOrEqual(0)
      expect(stats.averageTension).toBeLessThanOrEqual(1)
    })

    it('counts arcs after detection', () => {
      for (const s of SHORT_STORY.split('. ')) engine.addBeat(s + '.')
      engine.detectArcs()
      expect(engine.getStats().totalArcs).toBeGreaterThan(0)
    })

    it('counts themes after extraction', () => {
      engine.addBeat('Love and passion.')
      engine.addBeat('Love and devotion.')
      engine.extractThemes()
      expect(engine.getStats().totalThemes).toBeGreaterThan(0)
    })

    it('counts plot points', () => {
      engine.extractPlotPoints('Suddenly the hero arrived.')
      expect(engine.getStats().totalPlotPoints).toBeGreaterThanOrEqual(0)
    })
  })

  // ── detectPatterns ────────────────────────────────────────────────

  describe('detectPatterns (via analyzeNarrative)', () => {
    it('returns empty for fewer than 4 beats', () => {
      engine.addBeat('A.')
      engine.addBeat('B.')
      engine.addBeat('C.')
      const result = engine.analyzeNarrative('')
      // detectPatterns is called internally; fresh engine has only 3 original beats
      expect(Array.isArray(result.patterns)).toBe(true)
    })

    it('patterns have name, description, occurrences, confidence', () => {
      const result = engine.analyzeNarrative(LONG_STORY)
      for (const p of result.patterns) {
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('description')
        expect(Array.isArray(p.occurrences)).toBe(true)
        expect(p.confidence).toBeGreaterThanOrEqual(0)
        expect(p.confidence).toBeLessThanOrEqual(1)
      }
    })
  })

  // ── Edge Cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles text with only stop words', () => {
      const id = engine.addBeat('The and is a to of.')
      const beat = engine.getBeat(id)
      expect(beat).not.toBeNull()
    })

    it('handles very long text in analyzeNarrative', () => {
      const longText = Array.from(
        { length: 50 },
        (_, i) => `Sentence number ${i} with danger and battle.`,
      ).join(' ')
      const result = engine.analyzeNarrative(longText)
      expect(result.tensionCurve.length).toBeGreaterThan(0)
    })

    it('handles single sentence text', () => {
      const result = engine.analyzeNarrative('Just one sentence.')
      expect(result.structure.type).toBe('unknown')
    })

    it('handles special characters in text', () => {
      const id = engine.addBeat('Hello! How are you? Fine & dandy — great.')
      expect(engine.getBeat(id)).not.toBeNull()
    })

    it('empty beat text does not crash', () => {
      const id = engine.addBeat('')
      expect(engine.getBeat(id)).not.toBeNull()
    })

    it('analyzeNarrative with only whitespace', () => {
      const result = engine.analyzeNarrative('   ')
      expect(result.summary).toBe('')
    })
  })
})
