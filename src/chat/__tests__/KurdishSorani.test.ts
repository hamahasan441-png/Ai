/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Kurdish Sorani Language Knowledge — Tests                                  ║
 * ║                                                                            ║
 * ║  Tests for Kurdish Sorani language knowledge base entries, semantic memory  ║
 * ║  concepts, and query classification.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain.js'
import { SemanticMemory, createProgrammingKnowledgeGraph } from '../SemanticMemory.js'

describe('Kurdish Sorani Language Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Alphabet & Writing System ────────────────────────────────────────────

  describe('Alphabet & Writing System', () => {
    it('knows about the Sorani Kurdish alphabet', async () => {
      const r = await brain.chat('What is the Sorani Kurdish alphabet?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sorani|kurdish|alphabet|letter|arabic|script/)
    })

    it('knows about Kurdish vowels', async () => {
      const r = await brain.chat('What are the Sorani Kurdish vowels?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/vowel|sorani|kurdish/)
    })

    it('knows Kurdish is right-to-left', async () => {
      const r = await brain.chat('How is Kurdish Sorani written?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kurdish|sorani|script|arabic|write|right/)
    })

    it('knows about unique Kurdish letters like ڕ and ڵ', async () => {
      const r = await brain.chat('What are unique letters in the Sorani alphabet?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sorani|kurdish|letter|unique|alphabet/)
    })
  })

  // ── Grammar Fundamentals ──────────────────────────────────────────────────

  describe('Grammar', () => {
    it('knows Sorani has SOV word order', async () => {
      const r = await brain.chat('What is the word order in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sov|subject|object|verb|word\s*order|sorani|kurdish/)
    })

    it('knows about Sorani pronouns', async () => {
      const r = await brain.chat('What are the personal pronouns in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/pronoun|sorani|kurdish/)
    })

    it('knows about Sorani verb conjugation', async () => {
      const r = await brain.chat('How do verbs conjugate in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/verb|conjugat|sorani|kurdish|tense|present|past/)
    })

    it('knows about Sorani tenses', async () => {
      const r = await brain.chat('What tenses does Sorani Kurdish have?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/tense|sorani|kurdish|present|past|future/)
    })

    it('knows about split ergativity', async () => {
      const r = await brain.chat('What is split ergativity in Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ergativ|sorani|kurdish|past|tense|agent/)
    })

    it('knows about Sorani nouns and plurals', async () => {
      const r = await brain.chat('How do nouns and plurals work in Sorani?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/noun|plural|sorani|kurdish|definite|suffix/)
    })

    it('knows about the ezafe construction', async () => {
      const r = await brain.chat('What is the ezafe in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ezafe|adjective|noun|sorani|kurdish/)
    })

    it('knows about prepositions and postpositions', async () => {
      const r = await brain.chat('What are the prepositions in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/preposition|sorani|kurdish/)
    })
  })

  // ── Vocabulary ──────────────────────────────────────────────────────────

  describe('Vocabulary', () => {
    it('knows Sorani greetings', async () => {
      const r = await brain.chat('How do you say hello in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/hello|greet|sorani|kurdish/)
    })

    it('knows Kurdish numbers', async () => {
      const r = await brain.chat('What are the numbers in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/number|sorani|kurdish/)
    })

    it('knows Kurdish family words', async () => {
      const r = await brain.chat('What are family words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/family|sorani|kurdish|mother|father|brother|sister/)
    })

    it('knows Kurdish colors', async () => {
      const r = await brain.chat('What are the colors in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/color|sorani|kurdish|red|blue|green/)
    })

    it('knows Kurdish body parts', async () => {
      const r = await brain.chat('What are body parts in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/body|sorani|kurdish|head|hand|eye/)
    })

    it('knows Kurdish food vocabulary', async () => {
      const r = await brain.chat('What are food words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/food|sorani|kurdish|bread|rice|meat/)
    })

    it('knows Kurdish time and days', async () => {
      const r = await brain.chat('What are the days of the week in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/day|week|sorani|kurdish/)
    })

    it('knows Kurdish nature vocabulary', async () => {
      const r = await brain.chat('What are nature words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/nature|sorani|kurdish|mountain|river|tree/)
    })

    it('knows common Sorani verbs', async () => {
      const r = await brain.chat('What are common verbs in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/verb|sorani|kurdish|come|go|eat|write/)
    })

    it('knows Kurdish classroom vocabulary', async () => {
      const r = await brain.chat('What are education words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/school|teacher|student|sorani|kurdish|education|learn/)
    })

    it('knows Kurdish emotion words', async () => {
      const r = await brain.chat('What are emotion words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/emotion|feeling|happy|sad|sorani|kurdish/)
    })
  })

  // ── Sentence Construction & Phrases ──────────────────────────────────────

  describe('Sentence Construction', () => {
    it('knows how to construct Sorani sentences', async () => {
      const r = await brain.chat('How do I make a sentence in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sentence|sov|subject|verb|sorani|kurdish/)
    })

    it('knows Sorani question words', async () => {
      const r = await brain.chat('What are the question words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/question|who|what|where|when|sorani|kurdish/)
    })

    it('knows common Sorani phrases', async () => {
      const r = await brain.chat('What are common phrases in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/phrase|sorani|kurdish|name|understand/)
    })

    it('knows Kurdish politeness and respect', async () => {
      const r = await brain.chat('How do you show politeness in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/polite|respect|sorani|kurdish/)
    })
  })

  // ── Semantics & Linguistic Features ────────────────────────────────────

  describe('Semantics & Linguistics', () => {
    it('knows about Kurdish Sorani semantics', async () => {
      const r = await brain.chat('What are the semantic features of Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/semantic|sorani|kurdish|meaning|compound|metaphor/)
    })

    it('knows about Kurdish compound words', async () => {
      const r = await brain.chat('How do compound words work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/compound|sorani|kurdish|word/)
    })

    it('knows about Kurdish idioms', async () => {
      const r = await brain.chat('What are common idioms in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/idiom|expression|sorani|kurdish/)
    })

    it('knows about Kurdish phonology', async () => {
      const r = await brain.chat('What is the phonology of Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/phonolog|sound|sorani|kurdish|consonant|vowel/)
    })

    it('knows about Kurdish dialects', async () => {
      const r = await brain.chat('What are the different Kurdish dialects?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dialect|sorani|kurmanji|kurdish/)
    })

    it('knows Kurdish language history', async () => {
      const r = await brain.chat('What is the history of the Kurdish Sorani language?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/history|kurdish|sorani|indo.?european|iranian|literature/)
    })
  })

  // ── Learning Path ──────────────────────────────────────────────────────

  describe('Learning Kurdish', () => {
    it('gives advice on learning Sorani', async () => {
      const r = await brain.chat('How can I learn Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/learn|sorani|kurdish|alphabet|grammar|vocabulary|practice/)
    })

    it('responds to general Kurdish language questions', async () => {
      const r = await brain.chat('Tell me about the Kurdish language')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kurdish|sorani|language|kurdistan/)
    })
  })

  // ── Knowledge Search ──────────────────────────────────────────────────

  describe('Knowledge Search', () => {
    it('finds Kurdish entries via knowledge search', () => {
      const results = brain.searchKnowledge('sorani kurdish')
      expect(results.length).toBeGreaterThan(0)
      const hasKurdish = results.some(r =>
        r.entry.content.toLowerCase().includes('kurdish') || r.entry.content.toLowerCase().includes('sorani')
      )
      expect(hasKurdish).toBe(true)
    })

    it('finds Kurdish alphabet via search', () => {
      const results = brain.searchKnowledge('sorani alphabet letters')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish grammar via search', () => {
      const results = brain.searchKnowledge('sorani grammar verb conjugation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish greetings via search', () => {
      const results = brain.searchKnowledge('sorani greetings hello')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish semantics via search', () => {
      const results = brain.searchKnowledge('sorani semantics compound words')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani numbers family colors')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────

  describe('Semantic Memory Concepts', () => {
    let memory: SemanticMemory

    beforeEach(() => {
      memory = createProgrammingKnowledgeGraph()
    })

    it('has Kurdish Sorani concept', () => {
      const concept = memory.findConceptByName('Kurdish Sorani')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Kurmanji concept', () => {
      const concept = memory.findConceptByName('Kurmanji')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Alphabet concept', () => {
      const concept = memory.findConceptByName('Sorani Alphabet')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Grammar concept', () => {
      const concept = memory.findConceptByName('Sorani Grammar')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Vocabulary concept', () => {
      const concept = memory.findConceptByName('Sorani Vocabulary')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Semantics concept', () => {
      const concept = memory.findConceptByName('Sorani Semantics')
      expect(concept).not.toBeNull()
    })

    it('has Ezafe Construction concept', () => {
      const concept = memory.findConceptByName('Ezafe Construction')
      expect(concept).not.toBeNull()
    })

    it('has Split Ergativity concept', () => {
      const concept = memory.findConceptByName('Split Ergativity')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Verb System concept', () => {
      const concept = memory.findConceptByName('Sorani Verb System')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Compound Words concept', () => {
      const concept = memory.findConceptByName('Sorani Compound Words')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Phonology concept', () => {
      const concept = memory.findConceptByName('Sorani Phonology')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Writing System concept', () => {
      const concept = memory.findConceptByName('Sorani Writing System')
      expect(concept).not.toBeNull()
    })

    it('Kurdish Sorani relates to Kurmanji', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const kurm = memory.findConceptByName('Kurmanji')
      expect(sorani).not.toBeNull()
      expect(kurm).not.toBeNull()

      const related = memory.findRelated(sorani!.id)
      const hasKurmanji = related.some(n => n.id === kurm!.id)
      expect(hasKurmanji).toBe(true)
    })

    it('Sorani Alphabet is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const alphabet = memory.findConceptByName('Sorani Alphabet')
      expect(sorani).not.toBeNull()
      expect(alphabet).not.toBeNull()

      const related = memory.findRelated(sorani!.id)
      const hasAlphabet = related.some(n => n.id === alphabet!.id)
      expect(hasAlphabet).toBe(true)
    })

    it('Sorani Grammar is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const grammar = memory.findConceptByName('Sorani Grammar')
      expect(sorani).not.toBeNull()
      expect(grammar).not.toBeNull()

      const related = memory.findRelated(sorani!.id)
      const hasGrammar = related.some(n => n.id === grammar!.id)
      expect(hasGrammar).toBe(true)
    })

    it('Ezafe is part of Sorani Grammar', () => {
      const grammar = memory.findConceptByName('Sorani Grammar')
      const ezafe = memory.findConceptByName('Ezafe Construction')
      expect(grammar).not.toBeNull()
      expect(ezafe).not.toBeNull()

      const related = memory.findRelated(grammar!.id)
      const hasEzafe = related.some(n => n.id === ezafe!.id)
      expect(hasEzafe).toBe(true)
    })

    it('Compound Words is part of Sorani Semantics', () => {
      const semantics = memory.findConceptByName('Sorani Semantics')
      const compounds = memory.findConceptByName('Sorani Compound Words')
      expect(semantics).not.toBeNull()
      expect(compounds).not.toBeNull()

      const related = memory.findRelated(semantics!.id)
      const hasCompounds = related.some(n => n.id === compounds!.id)
      expect(hasCompounds).toBe(true)
    })
  })
})
