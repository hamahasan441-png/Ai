import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('EventDrivenArchitecture', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match EDA/kafka/event sourcing keywords', () => {
      const response = brain.chat('explain event driven architecture eda message broker kafka rabbitmq event sourcing cqrs command query responsibility')
      expect(response).toMatch(/event|kafka|rabbitmq|cqrs|sourcing|message/i)
    })

    it('should match saga/pub-sub keywords', () => {
      const response = brain.chat('explain saga pattern choreography orchestration distributed transaction pub sub publish subscribe dead letter queue')
      expect(response).toMatch(/saga|choreography|pub.sub|dead\s+letter|distributed/i)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Event-Driven Architecture & Messaging with domain pattern', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Event-Driven Architecture & Messaging')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('pattern')
    })

    it('should have >=5 connected sub-concepts including Message Brokers & Queues and Event Sourcing', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Event-Driven Architecture & Messaging')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Message Brokers & Queues')
      expect(names).toContain('Event Sourcing')
    })

    it('should relate Event Sourcing to CQRS Pattern', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Event Sourcing')
      const names = related.map(r => r.name)
      expect(names).toContain('CQRS Pattern')
    })
  })
})
