/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Low-Level & Systems Programming Knowledge — Tests              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('SystemsProgramming', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match memory management and CPU architecture keywords', async () => {
      const r = await brain.chat(
        'explain memory management stack heap malloc free raii reference counting smart pointers cpu architecture cache lines branch prediction simd sse avx',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /memory\s+management|stack|heap|malloc|raii|smart\s+pointer|cpu|cache\s+line|simd/,
      )
    })

    it('should match linkers loaders and system calls keywords', async () => {
      const r = await brain.chat(
        'explain linkers loaders elf format dynamic linking symbol resolution plt got system calls syscall file descriptors mmap epoll kqueue io_uring',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /linker|elf|dynamic|symbol|plt|got|system\s+call|syscall|mmap|epoll/,
      )
    })

    it('should match unsafe code FFI and binary protocols keywords', async () => {
      const r = await brain.chat(
        'explain unsafe code ffi rust unsafe c interop jni ctypes wasm interop binary protocols endianness protocol buffers flatbuffers capn proto',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /unsafe|ffi|rust|interop|jni|ctypes|wasm|binary|endian|protobuf|protocol\s+buffer|flatbuffer/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Low-Level & Systems Programming with domain systems', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Low-Level & Systems Programming')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('systems')
    })

    it('should have >=5 connected sub-concepts including Memory Management & Allocation and CPU Architecture & Cache Optimization', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Low-Level & Systems Programming')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Memory Management & Allocation')
      expect(names).toContain('CPU Architecture & Cache Optimization')
    })

    it('should relate Memory Management & Allocation to CPU Architecture & Cache Optimization', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Memory Management & Allocation')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('CPU Architecture & Cache Optimization')
    })
  })
})
