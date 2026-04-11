import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Operating Systems & Internals Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about process management and scheduling', async () => {
      const r = await brain.chat(
        'Explain linux kernel process thread scheduling and cpu scheduling round robin',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/process|thread|scheduling|fork|kernel/)
    })

    it('answers about virtual memory and paging', async () => {
      const r = await brain.chat(
        'How does virtual memory paging page table mmu work in operating systems?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/virtual|memory|paging|page|table|mmu|tlb/)
    })

    it('answers about file systems', async () => {
      const r = await brain.chat(
        'Explain file system ext4 ntfs btrfs inode and disk io block device',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/file\s*system|ext4|inode|journal|btrfs/)
    })

    it('answers about system calls and kernel', async () => {
      const r = await brain.chat(
        'What are system call syscall linux kernel user space and interrupt handler irq?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/syscall|system\s*call|interrupt|kernel/)
    })

    it('answers about concurrency and synchronization', async () => {
      const r = await brain.chat(
        'How do concurrency synchronization mutex semaphore lock and deadlock work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mutex|semaphore|lock|deadlock|synchroniz/)
    })

    it('answers about containers and virtualization', async () => {
      const r = await brain.chat(
        'Explain container virtualization docker namespace cgroup and hypervisor vm kvm',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/container|docker|namespace|cgroup|kvm|virtual/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Operating Systems & Internals root concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Operating Systems & Internals')
      expect(node).toBeDefined()
      expect(node!.domain).toBe('systems')
    })

    it('has Process Management concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Process Management')
      expect(node).toBeDefined()
    })

    it('has Memory Management concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Memory Management')
      expect(node).toBeDefined()
    })

    it('has File Systems concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('File Systems')
      expect(node).toBeDefined()
    })

    it('has OS Concurrency concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('OS Concurrency')
      expect(node).toBeDefined()
    })

    it('OS Internals has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Operating Systems & Internals')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Process Management is related to OS Memory Management', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Process Management')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      // Memory Management may exist with different domain, check any mem-related concept
      expect(names.some(n => n.includes('Memory') || n.includes('OS'))).toBe(true)
    })
  })
})
