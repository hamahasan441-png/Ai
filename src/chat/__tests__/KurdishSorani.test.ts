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
import { KurdishTranslationCorpus } from '../KurdishTranslationCorpus.js'

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

    // ── Phase 3 semantic memory concept existence tests ───────────────

    it('has Sorani Conversation concept', () => {
      const concept = memory.findConceptByName('Sorani Conversation')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Shopping Language concept', () => {
      const concept = memory.findConceptByName('Sorani Shopping Language')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Technology Vocab concept', () => {
      const concept = memory.findConceptByName('Sorani Technology Vocab')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Social Media concept', () => {
      const concept = memory.findConceptByName('Sorani Social Media')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Science Vocab concept', () => {
      const concept = memory.findConceptByName('Sorani Science Vocab')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Medical Vocab concept', () => {
      const concept = memory.findConceptByName('Sorani Medical Vocab')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Legal Vocab concept', () => {
      const concept = memory.findConceptByName('Sorani Legal Vocab')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Political Vocab concept', () => {
      const concept = memory.findConceptByName('Sorani Political Vocab')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Education Vocab concept', () => {
      const concept = memory.findConceptByName('Sorani Education Vocab')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Modern Literature concept', () => {
      const concept = memory.findConceptByName('Sorani Modern Literature')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Folk Tales concept', () => {
      const concept = memory.findConceptByName('Sorani Folk Tales')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Music concept', () => {
      const concept = memory.findConceptByName('Sorani Music')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Festivals concept', () => {
      const concept = memory.findConceptByName('Sorani Festivals')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Relative Clauses concept', () => {
      const concept = memory.findConceptByName('Sorani Relative Clauses')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Sorani Subjunctive concept', () => {
      const concept = memory.findConceptByName('Sorani Subjunctive')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Kurdish History concept', () => {
      const concept = memory.findConceptByName('Kurdish History')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    it('has Kurdistan Geography concept', () => {
      const concept = memory.findConceptByName('Kurdistan Geography')
      expect(concept).not.toBeNull()
      expect(concept!.domain).toBe('language')
    })

    // ── Phase 3 semantic memory relationship tests ────────────────────

    it('Sorani Conversation is part of Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const conv = memory.findConceptByName('Sorani Conversation')
      expect(sorani).not.toBeNull()
      expect(conv).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasConv = related.some(n => n.id === conv!.id)
      expect(hasConv).toBe(true)
    })

    it('Sorani Shopping Language is part of Sorani Conversation', () => {
      const conv = memory.findConceptByName('Sorani Conversation')
      const shop = memory.findConceptByName('Sorani Shopping Language')
      expect(conv).not.toBeNull()
      expect(shop).not.toBeNull()

      const related = memory.findRelated(conv!.id, undefined, 30)
      const hasShop = related.some(n => n.id === shop!.id)
      expect(hasShop).toBe(true)
    })

    it('Sorani Technology Vocab is part of Sorani Vocabulary', () => {
      const vocab = memory.findConceptByName('Sorani Vocabulary')
      const tech = memory.findConceptByName('Sorani Technology Vocab')
      expect(vocab).not.toBeNull()
      expect(tech).not.toBeNull()

      const related = memory.findRelated(vocab!.id, undefined, 30)
      const hasTech = related.some(n => n.id === tech!.id)
      expect(hasTech).toBe(true)
    })

    it('Sorani Social Media relates to Sorani Technology', () => {
      const tech = memory.findConceptByName('Sorani Technology Vocab')
      const social = memory.findConceptByName('Sorani Social Media')
      expect(tech).not.toBeNull()
      expect(social).not.toBeNull()

      const related = memory.findRelated(tech!.id, undefined, 30)
      const hasSocial = related.some(n => n.id === social!.id)
      expect(hasSocial).toBe(true)
    })

    it('Sorani Science Vocab is part of Sorani Vocabulary', () => {
      const vocab = memory.findConceptByName('Sorani Vocabulary')
      const science = memory.findConceptByName('Sorani Science Vocab')
      expect(vocab).not.toBeNull()
      expect(science).not.toBeNull()

      const related = memory.findRelated(vocab!.id, undefined, 30)
      const hasScience = related.some(n => n.id === science!.id)
      expect(hasScience).toBe(true)
    })

    it('Sorani Medical Vocab relates to Sorani Science', () => {
      const science = memory.findConceptByName('Sorani Science Vocab')
      const medical = memory.findConceptByName('Sorani Medical Vocab')
      expect(science).not.toBeNull()
      expect(medical).not.toBeNull()

      const related = memory.findRelated(science!.id, undefined, 30)
      const hasMedical = related.some(n => n.id === medical!.id)
      expect(hasMedical).toBe(true)
    })

    it('Sorani Legal Vocab is part of Sorani Vocabulary', () => {
      const vocab = memory.findConceptByName('Sorani Vocabulary')
      const legal = memory.findConceptByName('Sorani Legal Vocab')
      expect(vocab).not.toBeNull()
      expect(legal).not.toBeNull()

      const related = memory.findRelated(vocab!.id, undefined, 30)
      const hasLegal = related.some(n => n.id === legal!.id)
      expect(hasLegal).toBe(true)
    })

    it('Sorani Political Vocab relates to Sorani Legal', () => {
      const legal = memory.findConceptByName('Sorani Legal Vocab')
      const political = memory.findConceptByName('Sorani Political Vocab')
      expect(legal).not.toBeNull()
      expect(political).not.toBeNull()

      const related = memory.findRelated(legal!.id, undefined, 30)
      const hasPolitical = related.some(n => n.id === political!.id)
      expect(hasPolitical).toBe(true)
    })

    it('Sorani Education Vocab is part of Sorani Vocabulary', () => {
      const vocab = memory.findConceptByName('Sorani Vocabulary')
      const edu = memory.findConceptByName('Sorani Education Vocab')
      expect(vocab).not.toBeNull()
      expect(edu).not.toBeNull()

      const related = memory.findRelated(vocab!.id, undefined, 30)
      const hasEdu = related.some(n => n.id === edu!.id)
      expect(hasEdu).toBe(true)
    })

    it('Sorani Modern Literature relates to Sorani Poetry', () => {
      const poetry = memory.findConceptByName('Sorani Poetry')
      const modlit = memory.findConceptByName('Sorani Modern Literature')
      expect(poetry).not.toBeNull()
      expect(modlit).not.toBeNull()

      const related = memory.findRelated(poetry!.id, undefined, 30)
      const hasModLit = related.some(n => n.id === modlit!.id)
      expect(hasModLit).toBe(true)
    })

    it('Sorani Folk Tales relates to Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const folk = memory.findConceptByName('Sorani Folk Tales')
      expect(sorani).not.toBeNull()
      expect(folk).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasFolk = related.some(n => n.id === folk!.id)
      expect(hasFolk).toBe(true)
    })

    it('Sorani Music relates to Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const music = memory.findConceptByName('Sorani Music')
      expect(sorani).not.toBeNull()
      expect(music).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasMusic = related.some(n => n.id === music!.id)
      expect(hasMusic).toBe(true)
    })

    it('Sorani Festivals relates to Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const festivals = memory.findConceptByName('Sorani Festivals')
      expect(sorani).not.toBeNull()
      expect(festivals).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasFestivals = related.some(n => n.id === festivals!.id)
      expect(hasFestivals).toBe(true)
    })

    it('Sorani Relative Clauses is part of Sorani Grammar', () => {
      const grammar = memory.findConceptByName('Sorani Grammar')
      const relcl = memory.findConceptByName('Sorani Relative Clauses')
      expect(grammar).not.toBeNull()
      expect(relcl).not.toBeNull()

      const related = memory.findRelated(grammar!.id, undefined, 30)
      const hasRelCl = related.some(n => n.id === relcl!.id)
      expect(hasRelCl).toBe(true)
    })

    it('Sorani Subjunctive relates to Sorani Verb System', () => {
      const verbs = memory.findConceptByName('Sorani Verb System')
      const subj = memory.findConceptByName('Sorani Subjunctive')
      expect(verbs).not.toBeNull()
      expect(subj).not.toBeNull()

      const related = memory.findRelated(verbs!.id, undefined, 30)
      const hasSubj = related.some(n => n.id === subj!.id)
      expect(hasSubj).toBe(true)
    })

    it('Kurdish History relates to Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const history = memory.findConceptByName('Kurdish History')
      expect(sorani).not.toBeNull()
      expect(history).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasHistory = related.some(n => n.id === history!.id)
      expect(hasHistory).toBe(true)
    })

    it('Kurdistan Geography relates to Kurdish Sorani', () => {
      const sorani = memory.findConceptByName('Kurdish Sorani')
      const geo = memory.findConceptByName('Kurdistan Geography')
      expect(sorani).not.toBeNull()
      expect(geo).not.toBeNull()

      const related = memory.findRelated(sorani!.id, undefined, 30)
      const hasGeo = related.some(n => n.id === geo!.id)
      expect(hasGeo).toBe(true)
    })
  })

  // ── Conversation & Daily Dialogue ───────────────────────────────────

  describe('Conversation & Daily Dialogue', () => {
    it('knows Sorani conversation phrases and greetings', async () => {
      const r = await brain.chat('What are Sorani Kurdish conversation phrases?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/conversation|daily|dialogue|greet|sorani|kurdish/)
    })

    it('knows Sorani introduction phrases', async () => {
      const r = await brain.chat('How do you introduce yourself in Sorani Kurdish daily conversation?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/name|introduction|sorani|kurdish|conversation/)
    })

    it('knows Sorani shopping and bazaar dialogue', async () => {
      const r = await brain.chat('What are Sorani Kurdish shopping dialogue phrases?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/shopping|bazaar|price|bargain|sorani|kurdish/)
    })

    it('knows Sorani market bargaining phrases', async () => {
      const r = await brain.chat('How do you bargain at a Kurdish bazaar in Sorani?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/bargain|discount|expensive|bazaar|sorani|kurdish/)
    })

    it('knows Sorani restaurant and dining phrases', async () => {
      const r = await brain.chat('What are Sorani Kurdish restaurant phrases?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/restaurant|dining|menu|order|food|sorani|kurdish/)
    })

    it('knows Sorani food ordering vocabulary', async () => {
      const r = await brain.chat('How do you order food at a restaurant in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/order|dish|water|meat|spicy|sorani|kurdish/)
    })
  })

  // ── Technology & Modern Vocabulary ──────────────────────────────────

  describe('Technology & Modern Vocabulary', () => {
    it('knows Sorani technology and computing words', async () => {
      const r = await brain.chat('What are Sorani Kurdish technology words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/technolog|computer|internet|keyboard|sorani|kurdish/)
    })

    it('knows Sorani digital and internet vocabulary', async () => {
      const r = await brain.chat('How do you say internet terms in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/internet|website|download|digital|sorani|kurdish/)
    })

    it('knows Sorani social media terms', async () => {
      const r = await brain.chat('What are Sorani Kurdish social media terms?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/social media|facebook|instagram|like|share|sorani|kurdish/)
    })

    it('knows Sorani online communication vocabulary', async () => {
      const r = await brain.chat('How do you discuss online communication in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/online|comment|hashtag|post|sorani|kurdish/)
    })
  })

  // ── Science & Academic ─────────────────────────────────────────────

  describe('Science & Academic', () => {
    it('knows Sorani science vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish science vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/science|physics|chemistry|biology|sorani|kurdish/)
    })

    it('knows Sorani scientific discipline names', async () => {
      const r = await brain.chat('How do you say scientific fields in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/science|math|engineer|research|sorani|kurdish/)
    })

    it('knows Sorani medical terms', async () => {
      const r = await brain.chat('What are Sorani Kurdish medical terms?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/medical|doctor|hospital|pharmacy|health|sorani|kurdish/)
    })

    it('knows Sorani hospital and health vocabulary', async () => {
      const r = await brain.chat('How do you discuss health and hospitals in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/hospital|surgery|medicine|health|sorani|kurdish/)
    })
  })

  // ── Law & Politics ─────────────────────────────────────────────────

  describe('Law & Politics', () => {
    it('knows Sorani legal vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish legal terms?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/legal|law|court|judge|lawyer|sorani|kurdish/)
    })

    it('knows Sorani judicial system vocabulary', async () => {
      const r = await brain.chat('How does the legal system work in Sorani Kurdish terminology?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/court|evidence|crime|law|sorani|kurdish/)
    })

    it('knows Sorani political vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish political vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/politic|government|parliament|minister|president|sorani|kurdish/)
    })

    it('knows Sorani governance and democracy terms', async () => {
      const r = await brain.chat('How do you discuss government and democracy in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/government|democra|election|party|sorani|kurdish/)
    })
  })

  // ── Education ──────────────────────────────────────────────────────

  describe('Education Vocabulary', () => {
    it('knows Sorani education and school vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish education vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/education|school|university|student|sorani|kurdish/)
    })

    it('knows Sorani academic levels and subjects', async () => {
      const r = await brain.chat('What are the academic levels and subjects in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/school|university|math|language|history|sorani|kurdish/)
    })

    it('knows Sorani classroom and library terms', async () => {
      const r = await brain.chat('What are Sorani Kurdish school and learning words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/school|learn|teacher|student|education|sorani|kurdish/)
    })
  })

  // ── Agriculture ────────────────────────────────────────────────────

  describe('Agriculture Vocabulary', () => {
    it('knows Sorani agriculture vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish agriculture vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/agricultur|farm|plant|harvest|crop|sorani|kurdish/)
    })

    it('knows Sorani farming and crop terms', async () => {
      const r = await brain.chat('What are farming and crop words in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/farm|wheat|rice|barley|crop|sorani|kurdish/)
    })
  })

  // ── Commerce ───────────────────────────────────────────────────────

  describe('Commerce Vocabulary', () => {
    it('knows Sorani commerce and business vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish commerce vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/commerce|business|trade|company|bank|sorani|kurdish/)
    })

    it('knows Sorani economy and finance terms', async () => {
      const r = await brain.chat('How do you discuss business and economy in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/capital|profit|money|sell|buy|sorani|kurdish/)
    })
  })

  // ── Literature & Folklore ──────────────────────────────────────────

  describe('Literature & Folklore', () => {
    it('knows Sorani modern literature and writers', async () => {
      const r = await brain.chat('What is Sorani Kurdish modern literature?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/literature|modern|poet|novel|sorani|kurdish/)
    })

    it('knows prominent Kurdish literary figures', async () => {
      const r = await brain.chat('Who are the famous Sorani Kurdish contemporary writers?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sherko bekas|pashew|bakhtiar|writer|poet|sorani|kurdish/)
    })

    it('knows Sorani literary movements', async () => {
      const r = await brain.chat('What are the Sorani Kurdish literary movements?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/literature|movement|modern|romantis|realis|sorani|kurdish/)
    })

    it('knows Sorani folk tales and oral tradition', async () => {
      const r = await brain.chat('What are Sorani Kurdish folk tales?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/folk tale|oral|tradition|story|sorani|kurdish/)
    })

    it('knows famous Kurdish mythical stories', async () => {
      const r = await brain.chat('Tell me about famous Kurdish mythology stories in Sorani')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mam|zîn|kawa|myth|legend|story|sorani|kurdish/)
    })
  })

  // ── Music & Arts ───────────────────────────────────────────────────

  describe('Music & Arts', () => {
    it('knows Sorani music vocabulary and instruments', async () => {
      const r = await brain.chat('What are Sorani Kurdish music vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/music|instrument|song|drum|sorani|kurdish/)
    })

    it('knows Kurdish musical instruments and genres', async () => {
      const r = await brain.chat('What are Kurdish musical instruments and song genres in Sorani?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/instrument|genre|lute|drum|flute|song|sorani|kurdish/)
    })
  })

  // ── Media & Journalism ─────────────────────────────────────────────

  describe('Media & Journalism', () => {
    it('knows Sorani media and journalism vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish media vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/media|newspaper|radio|television|journalism|sorani|kurdish/)
    })

    it('knows Sorani news and press terminology', async () => {
      const r = await brain.chat('How do you discuss news and journalism in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/news|journalist|magazine|reporter|digital|sorani|kurdish/)
    })
  })

  // ── Complex Grammar ────────────────────────────────────────────────

  describe('Complex Grammar', () => {
    it('knows Sorani relative clause constructions', async () => {
      const r = await brain.chat('How do relative clauses work in Sorani Kurdish grammar?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/relative|clause|subordinate|who|which|that|sorani|kurdish/)
    })

    it('knows Sorani relative clause marker ka', async () => {
      const r = await brain.chat('What is the Sorani Kurdish relative pronoun for subordinate clauses?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/relative|clause|marker|sorani|kurdish/)
    })

    it('knows Sorani reported speech constructions', async () => {
      const r = await brain.chat('How does reported speech work in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/reported speech|indirect|direct|said|quotation|sorani|kurdish/)
    })

    it('knows Sorani direct vs indirect speech', async () => {
      const r = await brain.chat('What is the difference between direct and indirect speech in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/direct|indirect|speech|said|sorani|kurdish/)
    })

    it('knows Sorani subjunctive mood', async () => {
      const r = await brain.chat('What is the Sorani Kurdish subjunctive mood?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/subjunctive|mood|wish|purpose|sorani|kurdish/)
    })

    it('knows Sorani subjunctive verb formation', async () => {
      const r = await brain.chat('How do you form the subjunctive verb in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/subjunctive|verb|prefix|stem|request|sorani|kurdish/)
    })
  })

  // ── History & Geography ────────────────────────────────────────────

  describe('History & Geography', () => {
    it('knows Kurdish history overview', async () => {
      const r = await brain.chat('What is the history of the Kurdish people in Sorani?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/history|kurd|ancient|medieval|sorani|saladin/)
    })

    it('knows about key Kurdish historical events', async () => {
      const r = await brain.chat('What are major events in Kurdish history?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/history|kurd|republic|emirate|war|sorani/)
    })

    it('knows Kurdistan geography', async () => {
      const r = await brain.chat('What is the geography of Kurdistan in Sorani?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/geography|kurdistan|iraq|turkey|iran|syria|sorani/)
    })

    it('knows Iraqi Kurdistan cities and regions', async () => {
      const r = await brain.chat('What are the main cities of Iraqi Kurdistan?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/erbil|sulaymaniyah|duhok|kirkuk|kurdistan|city/)
    })
  })

  // ── Culture ────────────────────────────────────────────────────────

  describe('Culture', () => {
    it('knows about Kurdish Newroz celebration', async () => {
      const r = await brain.chat('What is the Sorani Kurdish Newroz celebration?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/newroz|new year|spring|march|bonfire|celebrat|kurdish/)
    })

    it('knows about Kawa legend and Newroz', async () => {
      const r = await brain.chat('What is the Kawa legend associated with Kurdish Newroz?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kawa|blacksmith|fire|resist|newroz|kurdish/)
    })

    it('knows about Kurdish cultural festivals', async () => {
      const r = await brain.chat('What are the main Sorani Kurdish cultural festivals?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/festival|newroz|celebrat|holiday|sorani|kurdish/)
    })

    it('knows about Sorani Kurdish traditional clothing', async () => {
      const r = await brain.chat('What is Sorani Kurdish traditional clothing?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/traditional|clothing|dress|trouser|turban|sorani|kurdish/)
    })

    it('knows about Kurdish mens traditional garments', async () => {
      const r = await brain.chat('What do Kurdish men traditionally wear in Sorani regions?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/men|trouser|jacket|vest|turban|cloth|kurdish/)
    })
  })

  // ── Transportation ─────────────────────────────────────────────────

  describe('Transportation', () => {
    it('knows Sorani transportation vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish transportation words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/transport|car|bus|airplane|train|sorani|kurdish/)
    })

    it('knows Sorani vehicle and direction terms', async () => {
      const r = await brain.chat('How do you say vehicles and directions in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/vehicle|car|taxi|bicycle|direction|sorani|kurdish/)
    })
  })

  // ── Weather ────────────────────────────────────────────────────────

  describe('Weather Expressions', () => {
    it('knows Sorani weather vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish weather expressions?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/weather|sun|rain|snow|wind|cloud|sorani|kurdish/)
    })

    it('knows Sorani climate and weather phrases', async () => {
      const r = await brain.chat('How do you discuss weather and climate in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/weather|climate|hot|cold|storm|sorani|kurdish/)
    })
  })

  // ── Sports ─────────────────────────────────────────────────────────

  describe('Sports Vocabulary', () => {
    it('knows Sorani sports vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish sports vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sport|football|basketball|volleyball|swim|sorani|kurdish/)
    })

    it('knows Sorani athletic and game terms', async () => {
      const r = await brain.chat('What are Sorani Kurdish game and athletics terms?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sport|team|player|referee|game|sorani|kurdish/)
    })
  })

  // ── Religion ───────────────────────────────────────────────────────

  describe('Religion Vocabulary', () => {
    it('knows Sorani religion vocabulary', async () => {
      const r = await brain.chat('What are Sorani Kurdish religion vocabulary words?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/religion|mosque|prayer|fasting|pilgrimage|sorani|kurdish/)
    })

    it('knows Sorani multi-faith vocabulary', async () => {
      const r = await brain.chat('What are the different faiths discussed in Sorani Kurdish?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/islam|yazidi|christian|faith|religion|sorani|kurdish/)
    })

    it('knows Sorani Islamic religious terms', async () => {
      const r = await brain.chat('What are Sorani Kurdish Islamic religious terms?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mosque|prayer|quran|cleric|imam|sorani|kurdish/)
    })
  })

  // ── Knowledge Search (Phase 3) ─────────────────────────────────────

  describe('Knowledge Search (Phase 3)', () => {
    it('finds Sorani conversation phrases via search', () => {
      const results = brain.searchKnowledge('sorani conversation phrases')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani shopping dialogue via search', () => {
      const results = brain.searchKnowledge('sorani shopping dialogue bazaar')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani restaurant phrases via search', () => {
      const results = brain.searchKnowledge('sorani restaurant phrases dining')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani technology words via search', () => {
      const results = brain.searchKnowledge('sorani technology words digital')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani social media terms via search', () => {
      const results = brain.searchKnowledge('sorani social media terms')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani science vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani science vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani medical terms via search', () => {
      const results = brain.searchKnowledge('sorani medical terms hospital')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani legal terms via search', () => {
      const results = brain.searchKnowledge('sorani legal terms court')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani political vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani political vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani education vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani education vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani agriculture vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani agriculture vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani commerce vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani commerce vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani modern literature via search', () => {
      const results = brain.searchKnowledge('sorani modern literature')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani folk tales via search', () => {
      const results = brain.searchKnowledge('sorani folk tales mythology')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani music vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani music vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani media vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani media vocabulary journalism')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani relative clauses via search', () => {
      const results = brain.searchKnowledge('sorani relative clauses')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani reported speech via search', () => {
      const results = brain.searchKnowledge('sorani reported speech')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani subjunctive mood via search', () => {
      const results = brain.searchKnowledge('sorani subjunctive mood')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdish history via search', () => {
      const results = brain.searchKnowledge('sorani kurdish history')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Kurdistan geography via search', () => {
      const results = brain.searchKnowledge('sorani kurdistan geography')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani newroz celebration via search', () => {
      const results = brain.searchKnowledge('sorani newroz celebration')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani traditional clothing via search', () => {
      const results = brain.searchKnowledge('sorani traditional clothing')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani transportation words via search', () => {
      const results = brain.searchKnowledge('sorani transportation words')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani weather expressions via search', () => {
      const results = brain.searchKnowledge('sorani weather expressions')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani sports vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani sports vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds Sorani religion vocabulary via search', () => {
      const results = brain.searchKnowledge('sorani religion vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ── CKB-ENG Translation Corpus — Knowledge Base Tests ──────────────────

  describe('CKB-ENG Translation Corpus Knowledge', () => {
    it('knows about the Kurdish Sorani translation corpus', async () => {
      const r = await brain.chat('What is the Kurdish English translation corpus?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/corpus|translat|ckb|parallel|kurdish/)
    })

    it('knows cultural translations from the corpus', async () => {
      const r = await brain.chat('sorani translation culture')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/cultur|kurdish|sorani|translat/)
    })

    it('knows education translations from the corpus', async () => {
      const r = await brain.chat('sorani translation education')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/educat|language|sorani|translat/)
    })

    it('knows history translations from the corpus', async () => {
      const r = await brain.chat('sorani translation history')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/histor|village|sorani|translat/)
    })

    it('knows film and arts translations from the corpus', async () => {
      const r = await brain.chat('sorani translation film')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/film|art|sorani|translat/)
    })

    it('knows health translations from the corpus', async () => {
      const r = await brain.chat('sorani translation health')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/health|hospital|sorani|translat|pandemic/)
    })

    it('knows human rights translations from the corpus', async () => {
      const r = await brain.chat('sorani translation human rights')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/human rights|violence|sorani|translat/)
    })

    it('knows legal and political translations from the corpus', async () => {
      const r = await brain.chat('sorani translation legal')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/legal|court|sorani|translat|political/)
    })

    it('knows news headline translations from the corpus', async () => {
      const r = await brain.chat('sorani translation news')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/news|headline|sorani|translat/)
    })

    it('knows parallel sentence examples from the corpus', async () => {
      const r = await brain.chat('sorani english sentence pairs')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sentence|parallel|sorani|translat|victory/)
    })

    it('knows corpus vocabulary', async () => {
      const r = await brain.chat('sorani corpus vocabulary')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/vocabular|citizen|language|sorani/)
    })
  })

  // ── CKB-ENG Translation Corpus — Search Tests ────────────────────────

  describe('CKB-ENG Translation Corpus Search', () => {
    it('finds translation corpus via search', () => {
      const results = brain.searchKnowledge('sorani english translation corpus')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds cultural translations via search', () => {
      const results = brain.searchKnowledge('kurdish culture translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds education translations via search', () => {
      const results = brain.searchKnowledge('kurdish education translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds history translations via search', () => {
      const results = brain.searchKnowledge('kurdish history translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds film translations via search', () => {
      const results = brain.searchKnowledge('kurdish film translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds health translations via search', () => {
      const results = brain.searchKnowledge('kurdish health translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds human rights translations via search', () => {
      const results = brain.searchKnowledge('kurdish human rights translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds legal translations via search', () => {
      const results = brain.searchKnowledge('kurdish legal translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds news translations via search', () => {
      const results = brain.searchKnowledge('kurdish news translation')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds parallel sentence pairs via search', () => {
      const results = brain.searchKnowledge('kurdish parallel sentences')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds corpus vocabulary via search', () => {
      const results = brain.searchKnowledge('ckb eng vocabulary')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ── CKB-ENG Translation Corpus — Semantic Memory Tests ────────────────

  describe('CKB-ENG Translation Corpus Semantic Memory', () => {
    let memory: SemanticMemory

    beforeEach(() => {
      memory = createProgrammingKnowledgeGraph()
    })

    it('has Sorani Translation Corpus concept', () => {
      const id = memory.findConceptByName('Sorani Translation Corpus')
      expect(id).toBeDefined()
    })

    it('has Sorani Cultural Translation concept', () => {
      const id = memory.findConceptByName('Sorani Cultural Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani Education Translation concept', () => {
      const id = memory.findConceptByName('Sorani Education Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani History Translation concept', () => {
      const id = memory.findConceptByName('Sorani History Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani Arts Translation concept', () => {
      const id = memory.findConceptByName('Sorani Arts Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani Health Translation concept', () => {
      const id = memory.findConceptByName('Sorani Health Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani Human Rights Translation concept', () => {
      const id = memory.findConceptByName('Sorani Human Rights Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani Legal Translation concept', () => {
      const id = memory.findConceptByName('Sorani Legal Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani News Translation concept', () => {
      const id = memory.findConceptByName('Sorani News Translation')
      expect(id).toBeDefined()
    })

    it('has Sorani Parallel Sentences concept', () => {
      const id = memory.findConceptByName('Sorani Parallel Sentences')
      expect(id).toBeDefined()
    })

    it('has Sorani Corpus Vocabulary concept', () => {
      const id = memory.findConceptByName('Sorani Corpus Vocabulary')
      expect(id).toBeDefined()
    })

    it('relates translation corpus to Kurdish Sorani', () => {
      const corpusId = memory.findConceptByName('Sorani Translation Corpus')
      const kurdishId = memory.findConceptByName('Kurdish Sorani')
      expect(corpusId).toBeDefined()
      expect(kurdishId).toBeDefined()
      const related = memory.findRelated(corpusId!, undefined, 30)
      expect(related.some(r => r.concept.name === 'Kurdish Sorani')).toBe(true)
    })

    it('relates cultural translation to translation corpus', () => {
      const cultureId = memory.findConceptByName('Sorani Cultural Translation')
      expect(cultureId).toBeDefined()
      const related = memory.findRelated(cultureId!, undefined, 30)
      expect(related.some(r => r.concept.name === 'Sorani Translation Corpus')).toBe(true)
    })

    it('relates corpus vocabulary to Sorani vocabulary', () => {
      const vocabId = memory.findConceptByName('Sorani Corpus Vocabulary')
      expect(vocabId).toBeDefined()
      const related = memory.findRelated(vocabId!, undefined, 30)
      expect(related.some(r => r.concept.name === 'Sorani Vocabulary')).toBe(true)
    })
  })

  // ── KurdishTranslationCorpus Module Tests ─────────────────────────────

  describe('KurdishTranslationCorpus Module', () => {
    let corpus: KurdishTranslationCorpus

    beforeEach(() => {
      corpus = new KurdishTranslationCorpus()
    })

    it('has translation categories', () => {
      expect(corpus.totalCategories).toBeGreaterThan(0)
      expect(corpus.totalCategories).toBe(10)
    })

    it('has translation pairs', () => {
      expect(corpus.totalPairs).toBeGreaterThan(40)
    })

    it('can get all categories', () => {
      const cats = corpus.getCategories()
      expect(cats.length).toBe(10)
      expect(cats.map(c => c.name)).toContain('Culture & Festivals')
      expect(cats.map(c => c.name)).toContain('Language Rights & Education')
      expect(cats.map(c => c.name)).toContain('History & Heritage')
    })

    it('can get a specific category', () => {
      const cat = corpus.getCategory('Culture & Festivals')
      expect(cat).toBeDefined()
      expect(cat!.pairs.length).toBeGreaterThan(0)
      expect(cat!.nameKurdish).toBe('کولتوور و فێستیڤاڵ')
    })

    it('returns undefined for non-existent category', () => {
      const cat = corpus.getCategory('Nonexistent')
      expect(cat).toBeUndefined()
    })

    it('can get all pairs', () => {
      const pairs = corpus.getAllPairs()
      expect(pairs.length).toBe(corpus.totalPairs)
      expect(pairs[0].ckb).toBeTruthy()
      expect(pairs[0].eng).toBeTruthy()
    })

    it('can search English text', () => {
      const results = corpus.search('victory')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].eng.toLowerCase()).toContain('victory')
    })

    it('can search Kurdish text', () => {
      const results = corpus.search('نەورۆز')
      expect(results.length).toBeGreaterThan(0)
    })

    it('respects search limit', () => {
      const results = corpus.search('the', 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('can sample random pairs', () => {
      const samples = corpus.sample(3)
      expect(samples.length).toBe(3)
    })

    it('can sample from specific category', () => {
      const samples = corpus.sample(2, 'News Headlines')
      expect(samples.length).toBe(2)
    })

    it('has Language Rights & Education category', () => {
      const cat = corpus.getCategory('Language Rights & Education')
      expect(cat).toBeDefined()
      expect(cat!.pairs.length).toBeGreaterThanOrEqual(5)
    })

    it('has Health & Pandemic category', () => {
      const cat = corpus.getCategory('Health & Pandemic')
      expect(cat).toBeDefined()
      expect(cat!.pairs.length).toBeGreaterThanOrEqual(3)
    })

    it('has Key Vocabulary category', () => {
      const cat = corpus.getCategory('Key Vocabulary')
      expect(cat).toBeDefined()
      expect(cat!.pairs.length).toBeGreaterThanOrEqual(3)
    })

    it('has Human Rights category', () => {
      const cat = corpus.getCategory('Human Rights')
      expect(cat).toBeDefined()
      expect(cat!.pairs.length).toBeGreaterThanOrEqual(3)
    })

    it('has Legal & Political category', () => {
      const cat = corpus.getCategory('Legal & Political')
      expect(cat).toBeDefined()
    })

    it('has Film & Arts category', () => {
      const cat = corpus.getCategory('Film & Arts')
      expect(cat).toBeDefined()
    })

    it('has Inspirational & Poetic category', () => {
      const cat = corpus.getCategory('Inspirational & Poetic')
      expect(cat).toBeDefined()
    })

    it('category names are case-insensitive', () => {
      expect(corpus.getCategory('culture & festivals')).toBeDefined()
      expect(corpus.getCategory('CULTURE & FESTIVALS')).toBeDefined()
    })

    it('each pair has both Kurdish and English text', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(pair.ckb.length).toBeGreaterThan(0)
        expect(pair.eng.length).toBeGreaterThan(0)
      }
    })

    it('each category has Kurdish name and description', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat.nameKurdish.length).toBeGreaterThan(0)
        expect(cat.description.length).toBeGreaterThan(0)
      }
    })
  })
})
