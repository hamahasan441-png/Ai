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

  // ── Advanced Grammar ────────────────────────────────────────────────────

  describe('Advanced Grammar', () => {
    it('knows about Sorani passive voice', async () => {
      const r = await brain.chat('How does the passive voice work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/passive|sorani|kurdish|verb/)
    })

    it('knows about Sorani causative verbs', async () => {
      const r = await brain.chat('What are causative verbs in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/causative|sorani|kurdish|verb/)
    })

    it('knows about Sorani relative clauses', async () => {
      const r = await brain.chat('How do relative clauses work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/relative|clause|sorani|kurdish/)
    })

    it('knows about Sorani conditional sentences', async () => {
      const r = await brain.chat('How do conditionals work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/conditional|if|sorani|kurdish/)
    })

    it('knows about Sorani modal verbs', async () => {
      const r = await brain.chat('What are the modal verbs in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/modal|can|must|sorani|kurdish/)
    })

    it('knows about Sorani adverbs', async () => {
      const r = await brain.chat('What are adverbs in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/adverb|sorani|kurdish/)
    })

    it('knows about Sorani conjunctions', async () => {
      const r = await brain.chat('What are conjunctions in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/conjunction|sorani|kurdish|and|but|or/)
    })

    it('knows about Sorani negation', async () => {
      const r = await brain.chat('How does negation work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/negat|sorani|kurdish|not|don/)
    })

    it('knows about Sorani verb aspect', async () => {
      const r = await brain.chat('What is the aspect system in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/aspect|habitual|progressive|sorani|kurdish/)
    })

    it('knows about Sorani clitics', async () => {
      const r = await brain.chat('What are clitic pronouns in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/clitic|pronoun|sorani|kurdish|bound/)
    })

    it('knows about Sorani word order variations', async () => {
      const r = await brain.chat('How does word order vary in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/word\s*order|topic|focus|sorani|kurdish|sov/)
    })

    it('knows about Sorani verb particles', async () => {
      const r = await brain.chat('What are verb particles in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/verb|particle|compound|sorani|kurdish/)
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

  // ── Advanced Vocabulary Domains ─────────────────────────────────────────

  describe('Advanced Vocabulary', () => {
    it('knows Kurdish profession words', async () => {
      const r = await brain.chat('What are profession words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/profession|job|doctor|teacher|sorani|kurdish/)
    })

    it('knows Kurdish animal names', async () => {
      const r = await brain.chat('What are animal names in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/animal|sorani|kurdish|dog|cat|horse/)
    })

    it('knows Kurdish weather words', async () => {
      const r = await brain.chat('What are weather words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/weather|rain|snow|sorani|kurdish/)
    })

    it('knows Kurdish travel vocabulary', async () => {
      const r = await brain.chat('What are travel words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/travel|airplane|car|bus|sorani|kurdish/)
    })

    it('knows Kurdish health vocabulary', async () => {
      const r = await brain.chat('What are health words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/health|sick|doctor|hospital|sorani|kurdish/)
    })

    it('knows Kurdish technology words', async () => {
      const r = await brain.chat('What are technology words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/technolog|computer|internet|sorani|kurdish/)
    })

    it('knows Kurdish sports vocabulary', async () => {
      const r = await brain.chat('What are sports words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sport|football|sorani|kurdish/)
    })

    it('knows Kurdish music vocabulary', async () => {
      const r = await brain.chat('What are music words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/music|song|instrument|sorani|kurdish/)
    })

    it('knows Kurdish clothing words', async () => {
      const r = await brain.chat('What are clothing words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/cloth|dress|shirt|sorani|kurdish/)
    })

    it('knows Kurdish home and furniture words', async () => {
      const r = await brain.chat('What are home and furniture words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/home|house|room|sorani|kurdish|furniture/)
    })

    it('knows Kurdish shopping vocabulary', async () => {
      const r = await brain.chat('What are shopping words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/shop|bazaar|buy|sell|price|sorani|kurdish/)
    })

    it('knows Kurdish direction words', async () => {
      const r = await brain.chat('What are direction words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/direction|right|left|north|sorani|kurdish/)
    })

    it('knows Kurdish city vocabulary', async () => {
      const r = await brain.chat('What are city words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/city|street|mosque|school|sorani|kurdish/)
    })

    it('knows Kurdish religion vocabulary', async () => {
      const r = await brain.chat('What are religion words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/religion|pray|mosque|sorani|kurdish/)
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

  // ── Deep Semantics & Linguistics ───────────────────────────────────────

  describe('Deep Semantics & Linguistics', () => {
    it('knows about Kurdish morphology', async () => {
      const r = await brain.chat('What is the morphology of Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/morpholog|sorani|kurdish|root|suffix|prefix/)
    })

    it('knows about Kurdish word derivation', async () => {
      const r = await brain.chat('How does word derivation work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/deriv|prefix|suffix|sorani|kurdish/)
    })

    it('knows about Kurdish loanwords', async () => {
      const r = await brain.chat('What are loanwords in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/loanword|borrow|arabic|persian|sorani|kurdish/)
    })

    it('knows about Kurdish pragmatics', async () => {
      const r = await brain.chat('What are pragmatic features of Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/pragmatic|speech|indirect|sorani|kurdish/)
    })

    it('knows about Kurdish discourse markers', async () => {
      const r = await brain.chat('What are discourse markers in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/discourse|marker|sorani|kurdish/)
    })

    it('knows about Kurdish evidentiality', async () => {
      const r = await brain.chat('How does evidentiality work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/evidential|report|witness|sorani|kurdish/)
    })

    it('knows about Kurdish proverbs', async () => {
      const r = await brain.chat('What are proverbs in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/proverb|wisdom|sorani|kurdish/)
    })

    it('knows about Kurdish poetry', async () => {
      const r = await brain.chat('Tell me about Sorani Kurdish poetry')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/poetry|poet|sorani|kurdish|verse/)
    })

    it('knows about Kurdish metaphorical language', async () => {
      const r = await brain.chat('How are metaphors used in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/metaphor|heart|sorani|kurdish/)
    })

    it('knows about Kurdish synonyms and antonyms', async () => {
      const r = await brain.chat('What are synonyms and antonyms in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/synonym|antonym|sorani|kurdish/)
    })

    it('knows about Kurdish semantic fields', async () => {
      const r = await brain.chat('What are semantic fields in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/semantic|field|mountain|water|sorani|kurdish/)
    })

    it('knows about Kurdish onomatopoeia', async () => {
      const r = await brain.chat('What are onomatopoeia words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/onomatop|sound|sorani|kurdish/)
    })

    it('knows about Kurdish social registers', async () => {
      const r = await brain.chat('What are the language registers in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/register|formal|informal|sorani|kurdish/)
    })

    it('knows about Kurdish reduplication', async () => {
      const r = await brain.chat('How does reduplication work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/reduplicat|repeat|sorani|kurdish/)
    })

    it('knows about Kurdish kinship system', async () => {
      const r = await brain.chat('How does the Kurdish kinship system work in Sorani?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kinship|uncle|aunt|tribal|sorani|kurdish|family/)
    })

    it('knows about Kurdish advanced politeness', async () => {
      const r = await brain.chat('What are politeness strategies in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/polite|face|indirect|sorani|kurdish|respect/)
    })

    it('knows about Sorani dialectal variation', async () => {
      const r = await brain.chat('How do Sorani dialects vary by region?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dialect|sulaymaniyah|erbil|sorani|kurdish|region/)
    })

    it('knows about Sorani orthography history', async () => {
      const r = await brain.chat('What is the history of Sorani Kurdish writing?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/writ|script|orthograph|sorani|kurdish/)
    })

    it('knows about Kurdish spatial terms', async () => {
      const r = await brain.chat('What are spatial terms in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/spatial|location|here|there|sorani|kurdish/)
    })

    it('knows about Kurdish advanced numbers', async () => {
      const r = await brain.chat('What are fractions and advanced numbers in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/number|fraction|half|sorani|kurdish/)
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

    it('finds Kurdish passive voice via search', () => {
      const results = brain.searchKnowledge('sorani passive voice')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish morphology via search', () => {
      const results = brain.searchKnowledge('sorani morphology derivation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish pragmatics via search', () => {
      const results = brain.searchKnowledge('sorani pragmatics discourse')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish poetry via search', () => {
      const results = brain.searchKnowledge('sorani poetry proverbs')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish professions via search', () => {
      const results = brain.searchKnowledge('sorani professions jobs')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish animals via search', () => {
      const results = brain.searchKnowledge('sorani animals')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────

  describe('Semantic Memory Concepts', () => {
    let memory: SemanticMemory

    beforeEach(() => {
      memory = createProgrammingKnowledgeGraph()
    })

    // ── Original 12 concepts ──────────────────────────────────────────────

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

    // ── New 21 expanded concepts ──────────────────────────────────────────

    it('has Sorani Passive Voice concept', () => {
      const concept = memory.findConceptByName('Sorani Passive Voice')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Causative concept', () => {
      const concept = memory.findConceptByName('Sorani Causative')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Conditional concept', () => {
      const concept = memory.findConceptByName('Sorani Conditional')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Modal Verbs concept', () => {
      const concept = memory.findConceptByName('Sorani Modal Verbs')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Clitics concept', () => {
      const concept = memory.findConceptByName('Sorani Clitics')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Negation concept', () => {
      const concept = memory.findConceptByName('Sorani Negation')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Aspect System concept', () => {
      const concept = memory.findConceptByName('Sorani Aspect System')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Word Order concept', () => {
      const concept = memory.findConceptByName('Sorani Word Order')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Morphology concept', () => {
      const concept = memory.findConceptByName('Sorani Morphology')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Derivation concept', () => {
      const concept = memory.findConceptByName('Sorani Derivation')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Loanwords concept', () => {
      const concept = memory.findConceptByName('Sorani Loanwords')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Pragmatics concept', () => {
      const concept = memory.findConceptByName('Sorani Pragmatics')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Discourse Markers concept', () => {
      const concept = memory.findConceptByName('Sorani Discourse Markers')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Evidentiality concept', () => {
      const concept = memory.findConceptByName('Sorani Evidentiality')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Metaphor System concept', () => {
      const concept = memory.findConceptByName('Sorani Metaphor System')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Proverbs concept', () => {
      const concept = memory.findConceptByName('Sorani Proverbs')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Poetry concept', () => {
      const concept = memory.findConceptByName('Sorani Poetry')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Kinship System concept', () => {
      const concept = memory.findConceptByName('Sorani Kinship System')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Registers concept', () => {
      const concept = memory.findConceptByName('Sorani Registers')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Reduplication concept', () => {
      const concept = memory.findConceptByName('Sorani Reduplication')
      expect(concept).not.toBeNull()
    })

    it('has Sorani Dialectal Variation concept', () => {
      const concept = memory.findConceptByName('Sorani Dialectal Variation')
      expect(concept).not.toBeNull()
    })

    // ── Relationship tests ──────────────────────────────────────────────

    it('Kurdish Sorani relates to Kurmanji', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const kurm = memory.findConceptByName('Kurmanji')
      expect(sorani).not.toBeNull()
      expect(kurm).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasKurmanji = related.some(n => n.id === kurm!.id)
      expect(hasKurmanji).toBe(true)
    })

    it('Sorani Alphabet is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const alphabet = memory.findConceptByName('Sorani Alphabet')
      expect(sorani).not.toBeNull()
      expect(alphabet).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasAlphabet = related.some(n => n.id === alphabet!.id)
      expect(hasAlphabet).toBe(true)
    })

    it('Sorani Grammar is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const grammar = memory.findConceptByName('Sorani Grammar')
      expect(sorani).not.toBeNull()
      expect(grammar).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasGrammar = related.some(n => n.id === grammar!.id)
      expect(hasGrammar).toBe(true)
    })

    it('Ezafe is part of Sorani Grammar', () => {
      const grammar = memory.findConceptByName('Sorani Grammar')
      const ezafe = memory.findConceptByName('Ezafe Construction')
      expect(grammar).not.toBeNull()
      expect(ezafe).not.toBeNull()

      const related = memory.findRelated(grammar!.id, undefined, 30)
      const hasEzafe = related.some(n => n.id === ezafe!.id)
      expect(hasEzafe).toBe(true)
    })

    it('Compound Words is part of Sorani Semantics', () => {
      const semantics = memory.findConceptByName('Sorani Semantics')
      const compounds = memory.findConceptByName('Sorani Compound Words')
      expect(semantics).not.toBeNull()
      expect(compounds).not.toBeNull()

      const related = memory.findRelated(semantics!.id, undefined, 30)
      const hasCompounds = related.some(n => n.id === compounds!.id)
      expect(hasCompounds).toBe(true)
    })

    it('Passive Voice relates to Verb System', () => {
      const verbs = memory.findConceptByName('Sorani Verb System')
      const passive = memory.findConceptByName('Sorani Passive Voice')
      expect(verbs).not.toBeNull()
      expect(passive).not.toBeNull()

      const related = memory.findRelated(verbs!.id, undefined, 30)
      const hasPassive = related.some(n => n.id === passive!.id)
      expect(hasPassive).toBe(true)
    })

    it('Morphology is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const morph = memory.findConceptByName('Sorani Morphology')
      expect(sorani).not.toBeNull()
      expect(morph).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasMorph = related.some(n => n.id === morph!.id)
      expect(hasMorph).toBe(true)
    })

    it('Derivation is part of Morphology', () => {
      const morph = memory.findConceptByName('Sorani Morphology')
      const deriv = memory.findConceptByName('Sorani Derivation')
      expect(morph).not.toBeNull()
      expect(deriv).not.toBeNull()

      const related = memory.findRelated(morph!.id, undefined, 30)
      const hasDeriv = related.some(n => n.id === deriv!.id)
      expect(hasDeriv).toBe(true)
    })

    it('Pragmatics relates to Semantics', () => {
      const semantics = memory.findConceptByName('Sorani Semantics')
      const prag = memory.findConceptByName('Sorani Pragmatics')
      expect(semantics).not.toBeNull()
      expect(prag).not.toBeNull()

      const related = memory.findRelated(semantics!.id, undefined, 30)
      const hasPrag = related.some(n => n.id === prag!.id)
      expect(hasPrag).toBe(true)
    })

    it('Metaphor System is part of Semantics', () => {
      const semantics = memory.findConceptByName('Sorani Semantics')
      const meta = memory.findConceptByName('Sorani Metaphor System')
      expect(semantics).not.toBeNull()
      expect(meta).not.toBeNull()

      const related = memory.findRelated(semantics!.id, undefined, 30)
      const hasMeta = related.some(n => n.id === meta!.id)
      expect(hasMeta).toBe(true)
    })

    it('Poetry relates to Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const poetry = memory.findConceptByName('Sorani Poetry')
      expect(sorani).not.toBeNull()
      expect(poetry).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasPoetry = related.some(n => n.id === poetry!.id)
      expect(hasPoetry).toBe(true)
    })

    it('Clitics relate to Ergativity', () => {
      const erga = memory.findConceptByName('Split Ergativity')
      const clitics = memory.findConceptByName('Sorani Clitics')
      expect(erga).not.toBeNull()
      expect(clitics).not.toBeNull()

      const related = memory.findRelated(erga!.id, undefined, 30)
      const hasClit = related.some(n => n.id === clitics!.id)
      expect(hasClit).toBe(true)
    })

    it('Dialectal Variation is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const dials = memory.findConceptByName('Sorani Dialectal Variation')
      expect(sorani).not.toBeNull()
      expect(dials).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasDials = related.some(n => n.id === dials!.id)
      expect(hasDials).toBe(true)
    })

    it('Reduplication is part of Morphology', () => {
      const morph = memory.findConceptByName('Sorani Morphology')
      const redup = memory.findConceptByName('Sorani Reduplication')
      expect(morph).not.toBeNull()
      expect(redup).not.toBeNull()

      const related = memory.findRelated(morph!.id, undefined, 30)
      const hasRedup = related.some(n => n.id === redup!.id)
      expect(hasRedup).toBe(true)
    })
  })
})
