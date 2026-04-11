import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Pragmatics & Discourse Analysis Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about pragmatics and speech acts', async () => {
      const r = await brain.chat(
        'explain pragmatics discourse analysis conversation analysis speech act grice maxims cooperative principle implicature',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /pragmatics|speech\s*act|grice|maxim|implicature|cooperative|discourse/,
      )
    })

    it('answers about presupposition and politeness', async () => {
      const r = await brain.chat(
        'explain presupposition entailment inference politeness theory face positive negative context disambiguation reference deixis',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /presupposition|entailment|politeness|face|context|deixis|reference/,
      )
    })

    it('answers about coherence and argumentation', async () => {
      const r = await brain.chat(
        'explain coherence cohesion discourse markers narrative structure story grammar argumentation claim evidence warrant rebuttal',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /coherence|cohesion|discourse|narrative|argumentation|claim|evidence|warrant/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Pragmatics & Discourse Analysis concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Pragmatics & Discourse Analysis')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('linguistics')
    })

    it('has connected sub-concepts for pragmatics', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Pragmatics & Discourse Analysis')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Speech Acts & Cooperative Principle')
      expect(names).toContain('Discourse Coherence & Cohesion')
    })

    it('relates speech acts to conversation structure', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Speech Acts & Cooperative Principle')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Conversation Structure & Turn-Taking')
    })

    it('relates presupposition to speech acts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Presupposition & Entailment')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Speech Acts & Cooperative Principle')
    })

    it('has cross-domain relation to coreference/discourse in NLU', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Coreference & Discourse Analysis')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 50)
      const names = related.map(r => r.name)
      expect(names).toContain('Pragmatics & Discourse Analysis')
    })
  })
})
