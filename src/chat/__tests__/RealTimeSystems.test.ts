import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('RealTimeSystems', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match stream processing/websocket keywords', async () => {
      const r = await brain.chat(
        'explain stream processing apache flink kafka streams spark streaming websocket server sent events sse real time',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /flink|kafka\s+streams|websocket|sse|stream\s+processing|real.time/,
      )
    })

    it('should match low latency/clock sync keywords', async () => {
      const r = await brain.chat(
        'explain low latency networking kernel bypass dpdk clock synchronization ntp ptp vector clock lamport backpressure flow control',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/latency|dpdk|clock|ntp|lamport|backpressure/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Real-Time Systems & Streaming with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Real-Time Systems & Streaming')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have >=5 connected sub-concepts including Stream Processing Engines and WebSocket & Server-Sent Events', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Real-Time Systems & Streaming')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Stream Processing Engines')
      expect(names).toContain('WebSocket & Server-Sent Events')
    })

    it('should relate Stream Processing Engines to Real-Time Analytics', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Stream Processing Engines')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Real-Time Analytics')
    })
  })
})
