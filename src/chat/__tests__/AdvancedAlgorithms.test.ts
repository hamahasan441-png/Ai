/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Advanced Algorithms & Data Structures Knowledge — Tests        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('AdvancedAlgorithms', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match dynamic programming and graph algorithm keywords', async () => {
      const r = await brain.chat('explain dynamic programming tabular memoization state transition knapsack lcs edit distance graph algorithm dijkstra bellman ford')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dynamic\s+programming|knapsack|dijkstra|bellman.ford/)
    })

    it('should match string algorithms and probabilistic structures keywords', async () => {
      const r = await brain.chat('explain string algorithm kmp rabin karp suffix array trie probabilistic data structure bloom filter hyperloglog count min sketch')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kmp|rabin.karp|bloom\s+filter|hyperloglog/)
    })

    it('should match advanced trees and divide conquer keywords', async () => {
      const r = await brain.chat('explain advanced tree b tree red black segment tree fenwick binary indexed divide conquer greedy algorithm merge sort quicksort huffman')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/b.tree|red.black|segment\s+tree|fenwick|merge\s+sort|huffman/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Advanced Algorithms & Data Structures with domain algorithms', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Advanced Algorithms & Data Structures')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('algorithms')
    })

    it('should have >=5 connected sub-concepts including Dynamic Programming Algorithms and Graph & Path Algorithms', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Advanced Algorithms & Data Structures')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Dynamic Programming Algorithms')
      expect(names).toContain('Graph & Path Algorithms')
    })

    it('should relate Dynamic Programming Algorithms to Graph & Path Algorithms', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Dynamic Programming Algorithms')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Graph & Path Algorithms')
    })
  })
})
