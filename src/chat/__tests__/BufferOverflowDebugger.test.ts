import { describe, it, expect, beforeEach } from 'vitest'
import {
  BufferOverflowDebugger,
  type CrashInfo,
  type BinaryProtections,
  type OverflowAnalysis,
  type ROPChain,
  type HeapAnalysis,
  type FuzzStrategy,
  type FormatStringAnalysis,
  type OverflowPattern,
  type DebugCommand,
  type ROPGadget,
  type HeapCorruptionType,
} from '../BufferOverflowDebugger.js'

describe('BufferOverflowDebugger', () => {
  let debugger_: BufferOverflowDebugger

  beforeEach(() => {
    debugger_ = new BufferOverflowDebugger()
  })

  const makeCrash = (overrides?: Partial<CrashInfo>): CrashInfo => ({
    signal: 'SIGSEGV',
    faultAddress: '0x41414141',
    instructionPointer: '0x4141414141414141',
    stackPointer: '0x7fffffffe000',
    basePointer: '0x4242424242424242',
    registers: {
      rax: '0x4141414141414141',
      rbx: '0x0000000000000000',
      rcx: '0x4242424242424242',
      rdx: '0x4343434343434343',
      rip: '0x4141414141414141',
      rsp: '0x7fffffffe000',
      rbp: '0x4242424242424242',
    },
    backtrace: ['#0 0x4141414141414141 in ?? ()', '#1 0x00007ffff7a2d830 in __libc_start_main ()'],
    disassembly: [],
    memoryMap: [
      { start: '0x00400000', end: '0x00401000', permissions: 'r-xp', name: 'binary' },
      { start: '0x7ffff7a0d000', end: '0x7ffff7bcd000', permissions: 'r-xp', name: 'libc.so.6' },
    ],
    ...overrides,
  })

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const stats = debugger_.getStats()
      expect(stats.totalAnalyses).toBe(0)
      expect(stats.totalCrashesAnalyzed).toBe(0)
    })

    it('should accept custom config', () => {
      const custom = new BufferOverflowDebugger({
        architecture: 'x86',
        platform: 'windows',
        wordSize: 32,
      })
      expect(custom.getStats().totalAnalyses).toBe(0)
    })
  })

  describe('crash analysis', () => {
    it('should detect stack buffer overflow from IP control', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.type).toBe('stack_buffer_overflow')
      expect(analysis.controlsIP).toBe(true)
      expect(analysis.exploitability).toBe('exploitable')
    })

    it('should detect heap buffer overflow from fault address', () => {
      const crash = makeCrash({
        faultAddress: '0x555555757010',
        instructionPointer: '0x00007ffff7a8c2d0',
        registers: {
          rax: '0x0000000000000000',
          rip: '0x00007ffff7a8c2d0',
          rsp: '0x7fffffffe000',
          rbp: '0x7fffffffe100',
        },
      })
      const analysis = debugger_.analyzeCrash(crash)
      expect(analysis.type).toBe('heap_buffer_overflow')
    })

    it('should detect format string vulnerability', () => {
      const crash = makeCrash({
        instructionPointer: '0x00007ffff7a5c123',
        backtrace: [
          '#0 0x00007ffff7a5c123 in vfprintf ()',
          '#1 0x00007ffff7a6d456 in printf ()',
          '#2 0x00000000004011d5 in main ()',
        ],
        registers: { rip: '0x00007ffff7a5c123', rsp: '0x7fff0000', rbp: '0x7fff0100' },
      })
      const analysis = debugger_.analyzeCrash(crash)
      expect(analysis.type).toBe('format_string')
    })

    it('should detect use-after-free', () => {
      const crash = makeCrash({
        instructionPointer: '0x0000000000401234',
        backtrace: [
          '#0 0x0000000000401234 in victim_func ()',
          '#1 0x00007ffff7a8c000 in _int_free ()',
          '#2 0x00007ffff7a8e000 in free ()',
        ],
        registers: { rip: '0x0000000000401234', rsp: '0x7fff0000', rbp: '0x7fff0100' },
      })
      const analysis = debugger_.analyzeCrash(crash)
      expect(analysis.type).toBe('use_after_free')
    })

    it('should detect double free', () => {
      const crash = makeCrash({
        signal: 'SIGABRT',
        instructionPointer: '0x00007ffff7a8c000',
        backtrace: [
          '#0 0x00007ffff7a8c000 in abort ()',
          '#1 0x00007ffff7a8d000 in __libc_message (double free or corruption)',
        ],
        registers: { rip: '0x00007ffff7a8c000', rsp: '0x7fff0000', rbp: '0x7fff0100' },
      })
      const analysis = debugger_.analyzeCrash(crash)
      expect(analysis.type).toBe('double_free')
    })

    it('should return severity based on exploitability', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.severity).toBe('critical')
    })

    it('should provide root cause', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.rootCause).toBeTruthy()
      expect(analysis.rootCause.length).toBeGreaterThan(10)
    })

    it('should provide recommendations', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.recommendations.length).toBeGreaterThan(3)
    })

    it('should provide debug commands', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.debugCommands.length).toBeGreaterThan(3)
      for (const cmd of analysis.debugCommands) {
        expect(cmd.tool).toBeDefined()
        expect(cmd.command).toBeTruthy()
        expect(cmd.description).toBeTruthy()
      }
    })

    it('should provide mitigations', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.mitigations.length).toBeGreaterThan(2)
    })

    it('should map to CWE IDs', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.cweIds.length).toBeGreaterThan(0)
      expect(analysis.cweIds.some(id => id.startsWith('CWE-'))).toBe(true)
    })

    it('should identify controlled registers', () => {
      const analysis = debugger_.analyzeCrash(makeCrash())
      expect(analysis.controlledRegisters.length).toBeGreaterThan(0)
    })

    it('should update stats after analysis', () => {
      debugger_.analyzeCrash(makeCrash())
      const stats = debugger_.getStats()
      expect(stats.totalCrashesAnalyzed).toBe(1)
      expect(stats.totalAnalyses).toBe(1)
    })

    it('should provide heap-specific commands for heap overflow', () => {
      const crash = makeCrash({
        faultAddress: '0x555555757010',
        instructionPointer: '0x00007ffff7a8c2d0',
        registers: { rip: '0x00007ffff7a8c2d0', rsp: '0x7fff0000', rbp: '0x7fff0100' },
        overflowType: 'heap_buffer_overflow',
      })
      const analysis = debugger_.analyzeCrash(crash)
      const heapCmds = analysis.debugCommands.filter(c => c.command.includes('heap'))
      expect(heapCmds.length).toBeGreaterThan(0)
    })
  })

  describe('binary protections', () => {
    it('should check protections', () => {
      const protections = debugger_.checkProtections({
        nx: true,
        aslr: true,
        pie: true,
        canary: true,
        relro: 'full',
      })
      expect(protections.nx).toBe(true)
      expect(protections.aslr).toBe(true)
      expect(protections.pie).toBe(true)
      expect(protections.stackCanary).toBe(true)
      expect(protections.relro).toBe('full')
    })

    it('should default to false for missing protections', () => {
      const protections = debugger_.checkProtections({})
      expect(protections.nx).toBe(false)
      expect(protections.aslr).toBe(false)
      expect(protections.stackCanary).toBe(false)
      expect(protections.relro).toBe('none')
    })

    it('should analyze missing NX', () => {
      const findings = debugger_.analyzeProtections({
        nx: false,
        aslr: true,
        pie: true,
        stackCanary: true,
        relro: 'full',
        fortify: true,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      })
      expect(findings.some(f => f.includes('NX/DEP disabled'))).toBe(true)
    })

    it('should analyze missing ASLR', () => {
      const findings = debugger_.analyzeProtections({
        nx: true,
        aslr: false,
        pie: true,
        stackCanary: true,
        relro: 'full',
        fortify: true,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      })
      expect(findings.some(f => f.includes('ASLR disabled'))).toBe(true)
    })

    it('should analyze missing canary', () => {
      const findings = debugger_.analyzeProtections({
        nx: true,
        aslr: true,
        pie: true,
        stackCanary: false,
        relro: 'full',
        fortify: true,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      })
      expect(findings.some(f => f.includes('Stack canaries disabled'))).toBe(true)
    })

    it('should report all-protections-enabled', () => {
      const findings = debugger_.analyzeProtections({
        nx: true,
        aslr: true,
        pie: true,
        stackCanary: true,
        relro: 'full',
        fortify: true,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      })
      expect(findings.some(f => f.includes('All major protections enabled'))).toBe(true)
    })

    it('should update protection check stats', () => {
      debugger_.checkProtections({ nx: true })
      expect(debugger_.getStats().totalProtectionChecks).toBe(1)
    })
  })

  describe('ROP chain', () => {
    it('should build execve ROP chain for x64', () => {
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const chain = debugger_.buildROPChain('execve_binsh', protections)
      expect(chain.objective).toBe('execve_binsh')
      expect(chain.gadgets.length).toBeGreaterThan(0)
      expect(chain.payload.length).toBeGreaterThan(0)
      expect(chain.explanation.length).toBeGreaterThan(0)
    })

    it('should build mprotect ROP chain', () => {
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const chain = debugger_.buildROPChain('mprotect_rwx', protections)
      expect(chain.objective).toBe('mprotect_rwx')
      expect(chain.gadgets.length).toBeGreaterThan(0)
    })

    it('should build stack pivot chain', () => {
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const chain = debugger_.buildROPChain('stack_pivot', protections)
      expect(chain.gadgets.some(g => g.type === 'stack_pivot' || g.type === 'leave_ret')).toBe(true)
    })

    it('should build write-what-where chain', () => {
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const chain = debugger_.buildROPChain('write_what_where', protections)
      expect(chain.gadgets.some(g => g.type === 'write_mem')).toBe(true)
    })

    it('should have lower reliability with ASLR', () => {
      const noASLR: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const withASLR: BinaryProtections = { ...noASLR, aslr: true }
      const chainNoASLR = debugger_.buildROPChain('execve_binsh', noASLR)
      const chainASLR = debugger_.buildROPChain('execve_binsh', withASLR)
      expect(chainASLR.reliability).toBeLessThan(chainNoASLR.reliability)
    })

    it('should explain chain steps', () => {
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const chain = debugger_.buildROPChain('execve_binsh', protections)
      expect(chain.explanation.some(l => l.includes('execve'))).toBe(true)
    })

    it('should build 32-bit ROP chain', () => {
      const dbg32 = new BufferOverflowDebugger({ architecture: 'x86', wordSize: 32 })
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      const chain = dbg32.buildROPChain('execve_binsh', protections)
      expect(
        chain.gadgets.some(g => g.instructions.includes('ebx') || g.instructions.includes('eax')),
      ).toBe(true)
    })

    it('should update ROP chain stats', () => {
      const protections: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      debugger_.buildROPChain('execve_binsh', protections)
      expect(debugger_.getStats().totalROPChainsBuilt).toBe(1)
    })
  })

  describe('heap analysis', () => {
    const heapTypes: HeapCorruptionType[] = [
      'overflow_into_next',
      'use_after_free',
      'double_free',
      'unlink_attack',
      'house_of_force',
      'house_of_spirit',
      'house_of_lore',
      'house_of_einherjar',
      'fastbin_dup',
      'tcache_poisoning',
      'unsorted_bin_attack',
      'large_bin_attack',
    ]

    for (const heapType of heapTypes) {
      it(`should analyze ${heapType}`, () => {
        const analysis = debugger_.analyzeHeapCorruption(heapType)
        expect(analysis.corruptionType).toBe(heapType)
        expect(analysis.exploitTechnique).toBeTruthy()
        expect(analysis.steps.length).toBeGreaterThan(0)
        expect(analysis.requirements.length).toBeGreaterThan(0)
        expect(['easy', 'medium', 'hard', 'very_hard']).toContain(analysis.difficulty)
      })
    }

    it('should provide chunk info', () => {
      const analysis = debugger_.analyzeHeapCorruption('overflow_into_next')
      expect(analysis.chunkInfo.length).toBeGreaterThan(0)
      expect(analysis.chunkInfo[0].address).toBeDefined()
      expect(analysis.chunkInfo[0].size).toBeGreaterThan(0)
    })
  })

  describe('fuzzing strategy', () => {
    it('should generate file format fuzzing strategy', () => {
      const strategy = debugger_.generateFuzzStrategy('file_format', 'image_parser')
      expect(strategy.targetType).toBe('file_format')
      expect(strategy.fuzzer).toBeTruthy()
      expect(strategy.commands.length).toBeGreaterThan(0)
      expect(strategy.expectedCrashTypes.length).toBeGreaterThan(0)
    })

    it('should generate network protocol fuzzing strategy', () => {
      const strategy = debugger_.generateFuzzStrategy('network_protocol', 'ftp_server')
      expect(strategy.targetType).toBe('network_protocol')
      expect(strategy.commands.length).toBeGreaterThan(0)
    })

    it('should generate API fuzzing strategy', () => {
      const strategy = debugger_.generateFuzzStrategy('api', 'rest_api')
      expect(strategy.targetType).toBe('api')
    })

    it('should generate CLI fuzzing strategy', () => {
      const strategy = debugger_.generateFuzzStrategy('command_line', 'converter')
      expect(strategy.targetType).toBe('command_line')
    })

    it('should generate environment fuzzing strategy', () => {
      const strategy = debugger_.generateFuzzStrategy('environment', 'setuid_binary')
      expect(strategy.targetType).toBe('environment')
    })

    it('should have seed corpus suggestions', () => {
      const strategy = debugger_.generateFuzzStrategy('file_format', 'pdf_parser')
      expect(strategy.seedCorpus.length).toBeGreaterThan(0)
    })

    it('should have dictionary entries', () => {
      const strategy = debugger_.generateFuzzStrategy('file_format', 'parser')
      expect(strategy.dictionaryEntries.length).toBeGreaterThan(0)
    })

    it('should update fuzz stats', () => {
      debugger_.generateFuzzStrategy('file_format', 'test')
      expect(debugger_.getStats().totalFuzzStrategies).toBe(1)
    })
  })

  describe('format string analysis', () => {
    it('should analyze format string vulnerability', () => {
      const analysis = debugger_.analyzeFormatString(6, '0x00601028')
      expect(analysis.vulnerable).toBe(true)
      expect(analysis.readPrimitive).toBe(true)
      expect(analysis.writePrimitive).toBe(true)
      expect(analysis.offsetToTarget).toBe(6)
    })

    it('should provide stack leak payloads', () => {
      const analysis = debugger_.analyzeFormatString(8, '0x00601028')
      expect(analysis.stackLeaks.length).toBeGreaterThan(0)
      expect(analysis.stackLeaks.some(l => l.includes('%p') || l.includes('$p'))).toBe(true)
    })

    it('should provide write payload', () => {
      const analysis = debugger_.analyzeFormatString(6, '0x00601028')
      expect(analysis.writePayload).toContain('hhn')
    })

    it('should provide explanation', () => {
      const analysis = debugger_.analyzeFormatString(6, '0x00601028')
      expect(analysis.explanation.length).toBeGreaterThan(3)
    })

    it('should provide debug steps', () => {
      const analysis = debugger_.analyzeFormatString(6, '0x00601028')
      expect(analysis.debugSteps.length).toBeGreaterThan(0)
      expect(analysis.debugSteps[0].tool).toBe('gdb')
    })
  })

  describe('cyclic pattern', () => {
    it('should generate pattern of correct length', () => {
      const pattern = debugger_.generateCyclicPattern(100)
      expect(pattern.length).toBe(100)
    })

    it('should generate unique substrings', () => {
      const pattern = debugger_.generateCyclicPattern(300)
      // Check that 4-char substrings are unique
      const seen = new Set<string>()
      let unique = true
      for (let i = 0; i <= pattern.length - 4; i++) {
        const sub = pattern.substring(i, i + 4)
        if (seen.has(sub)) {
          unique = false
          break
        }
        seen.add(sub)
      }
      // For short patterns, uniqueness should hold
      expect(pattern.length).toBe(300)
    })

    it('should find offset in pattern', () => {
      const pattern = debugger_.generateCyclicPattern(500)
      const sub = pattern.substring(140, 144)
      const offset = debugger_.findPatternOffset(pattern, sub)
      expect(offset).toBe(140)
    })

    it('should return -1 for not found', () => {
      const pattern = debugger_.generateCyclicPattern(100)
      const offset = debugger_.findPatternOffset(pattern, 'ZZZZ')
      expect(offset).toBe(-1)
    })
  })

  describe('overflow patterns', () => {
    it('should return all overflow patterns', () => {
      const patterns = debugger_.getOverflowPatterns()
      expect(patterns.length).toBeGreaterThanOrEqual(8)
    })

    it('should filter by type', () => {
      const patterns = debugger_.getOverflowPatterns('stack_buffer_overflow')
      expect(patterns.length).toBeGreaterThan(0)
      for (const p of patterns) {
        expect(p.type).toBe('stack_buffer_overflow')
      }
    })

    it('should have exploitation info for each pattern', () => {
      const patterns = debugger_.getOverflowPatterns()
      for (const p of patterns) {
        expect(p.exploitation).toBeTruthy()
        expect(p.exploitation.length).toBeGreaterThan(5)
      }
    })

    it('should have difficulty levels', () => {
      const patterns = debugger_.getOverflowPatterns()
      for (const p of patterns) {
        expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(p.difficulty)
      }
    })

    it('should have code patterns', () => {
      const patterns = debugger_.getOverflowPatterns()
      for (const p of patterns) {
        expect(p.codePattern).toBeTruthy()
      }
    })

    it('should have references', () => {
      const patterns = debugger_.getOverflowPatterns()
      for (const p of patterns) {
        expect(p.references.length).toBeGreaterThan(0)
      }
    })
  })

  describe('GDB script generation', () => {
    it('should generate valid GDB script', () => {
      const script = debugger_.generateGDBScript('./vulnerable_app')
      expect(script).toContain('file ./vulnerable_app')
      expect(script).toContain('info registers')
      expect(script).toContain('bt full')
      expect(script).toContain('catch signal SIGSEGV')
    })

    it('should include crash address breakpoint if provided', () => {
      const script = debugger_.generateGDBScript('./app', '0x00401234')
      expect(script).toContain('break *0x00401234')
    })

    it('should include heap analysis commands', () => {
      const script = debugger_.generateGDBScript('./app')
      expect(script).toContain('heap_info')
    })

    it('should set Intel syntax', () => {
      const script = debugger_.generateGDBScript('./app')
      expect(script).toContain('set disassembly-flavor intel')
    })
  })

  describe('bypass techniques', () => {
    it('should provide NX bypass techniques', () => {
      const techniques = debugger_.getBypassTechniques('nx')
      expect(techniques.length).toBeGreaterThan(0)
      expect(techniques.some(t => t.includes('ROP'))).toBe(true)
    })

    it('should provide ASLR bypass techniques', () => {
      const techniques = debugger_.getBypassTechniques('aslr')
      expect(techniques.length).toBeGreaterThan(0)
      expect(techniques.some(t => t.includes('leak') || t.includes('Information'))).toBe(true)
    })

    it('should provide stack canary bypass techniques', () => {
      const techniques = debugger_.getBypassTechniques('stackCanary')
      expect(techniques.length).toBeGreaterThan(0)
    })

    it('should provide RELRO bypass techniques', () => {
      const techniques = debugger_.getBypassTechniques('relro')
      expect(techniques.length).toBeGreaterThan(0)
    })

    it('should provide PIE bypass techniques', () => {
      const techniques = debugger_.getBypassTechniques('pie')
      expect(techniques.length).toBeGreaterThan(0)
    })

    it('should provide CFI bypass techniques', () => {
      const techniques = debugger_.getBypassTechniques('cfi')
      expect(techniques.length).toBeGreaterThan(0)
    })
  })

  describe('stats tracking', () => {
    it('should track all analysis types', () => {
      debugger_.analyzeCrash(makeCrash())
      debugger_.analyzeHeapCorruption('tcache_poisoning')
      debugger_.analyzeFormatString(6, '0x601028')
      const stats = debugger_.getStats()
      expect(stats.totalAnalyses).toBe(3)
      expect(stats.totalCrashesAnalyzed).toBe(1)
    })

    it('should track ROP and fuzz operations', () => {
      const prot: BinaryProtections = {
        nx: true,
        aslr: false,
        pie: false,
        stackCanary: false,
        relro: 'none',
        fortify: false,
        cfi: false,
        safeseh: false,
        asan: false,
        shadowStack: false,
      }
      debugger_.buildROPChain('execve_binsh', prot)
      debugger_.generateFuzzStrategy('file_format', 'test')
      const stats = debugger_.getStats()
      expect(stats.totalROPChainsBuilt).toBe(1)
      expect(stats.totalFuzzStrategies).toBe(1)
    })
  })
})
