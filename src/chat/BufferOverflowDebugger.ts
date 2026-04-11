/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🐛  B U F F E R   O V E R F L O W   D E B U G G E R               ║
 * ║                                                                             ║
 * ║   Local overflow analysis & debugging intelligence:                          ║
 * ║     detect → analyze → debug → exploit → mitigate                           ║
 * ║                                                                             ║
 * ║     • Stack/heap overflow detection and root-cause analysis                 ║
 * ║     • ROP chain construction and gadget discovery                           ║
 * ║     • Memory corruption pattern identification                              ║
 * ║     • ASLR/DEP/Stack Canary/RELRO bypass analysis                          ║
 * ║     • GDB/LLDB command generation for debugging                             ║
 * ║     • Crash dump analysis and triage                                        ║
 * ║     • Exploit development guidance                                          ║
 * ║     • Fuzzing strategy recommendations                                      ║
 * ║     • Binary protection analysis (checksec equivalent)                      ║
 * ║     • Format string vulnerability analysis                                  ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained. Runs locally.             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface OverflowDebuggerConfig {
  architecture: Architecture
  platform: Platform
  endianness: 'little' | 'big'
  wordSize: 32 | 64
  enableROP: boolean
  enableHeapAnalysis: boolean
  maxGadgets: number
}

export interface OverflowDebuggerStats {
  totalAnalyses: number
  totalCrashesAnalyzed: number
  totalROPChainsBuilt: number
  totalGadgetsFound: number
  totalProtectionChecks: number
  totalFuzzStrategies: number
}

export type Architecture = 'x86' | 'x64' | 'arm' | 'arm64' | 'mips' | 'powerpc'
export type Platform = 'linux' | 'windows' | 'macos' | 'freebsd' | 'embedded'
export type OverflowType =
  | 'stack_buffer_overflow'
  | 'heap_buffer_overflow'
  | 'integer_overflow'
  | 'format_string'
  | 'use_after_free'
  | 'double_free'
  | 'off_by_one'
  | 'off_by_null'
  | 'stack_clash'
  | 'type_confusion'

export interface BinaryProtections {
  nx: boolean // NX/DEP - non-executable stack
  aslr: boolean // Address Space Layout Randomization
  pie: boolean // Position Independent Executable
  stackCanary: boolean // Stack canaries/cookies
  relro: 'none' | 'partial' | 'full' // Relocation Read-Only
  fortify: boolean // FORTIFY_SOURCE
  cfi: boolean // Control Flow Integrity
  safeseh: boolean // SafeSEH (Windows)
  asan: boolean // AddressSanitizer
  shadowStack: boolean // Intel CET Shadow Stack
}

export interface CrashInfo {
  signal: string
  faultAddress: string
  instructionPointer: string
  stackPointer: string
  basePointer: string
  registers: Record<string, string>
  backtrace: string[]
  disassembly: string[]
  memoryMap: MemoryRegion[]
  overflowType?: OverflowType
}

export interface MemoryRegion {
  start: string
  end: string
  permissions: string
  name: string
}

export interface OverflowAnalysis {
  type: OverflowType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  rootCause: string
  overflowOffset: number
  controlsIP: boolean
  controlledRegisters: string[]
  exploitability: 'not_exploitable' | 'probably_not' | 'probably_exploitable' | 'exploitable'
  recommendations: string[]
  debugCommands: DebugCommand[]
  mitigations: string[]
  cweIds: string[]
}

export interface DebugCommand {
  tool: 'gdb' | 'lldb' | 'windbg' | 'x64dbg' | 'radare2'
  command: string
  description: string
  expected: string
}

export interface ROPGadget {
  address: string
  instructions: string
  type: GadgetType
  size: number
  usable: boolean
  notes: string
}

export type GadgetType =
  | 'pop_reg'
  | 'mov_reg'
  | 'xchg_reg'
  | 'add_reg'
  | 'sub_reg'
  | 'syscall'
  | 'int80'
  | 'call_reg'
  | 'jmp_reg'
  | 'write_mem'
  | 'read_mem'
  | 'stack_pivot'
  | 'ret'
  | 'leave_ret'
  | 'nop'

export interface ROPChain {
  id: string
  name: string
  objective: ROPObjective
  gadgets: ROPGadget[]
  payload: string[]
  totalSize: number
  nullFree: boolean
  reliability: number
  explanation: string[]
}

export type ROPObjective =
  | 'execve_binsh'
  | 'mprotect_rwx'
  | 'open_read_write'
  | 'connect_back'
  | 'disable_aslr'
  | 'stack_pivot'
  | 'write_what_where'

export interface HeapAnalysis {
  allocator: 'ptmalloc2' | 'jemalloc' | 'tcmalloc' | 'dlmalloc' | 'windows_heap'
  chunkInfo: HeapChunk[]
  corruptionType: HeapCorruptionType
  exploitTechnique: string
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard'
  requirements: string[]
  steps: string[]
}

export type HeapCorruptionType =
  | 'overflow_into_next'
  | 'use_after_free'
  | 'double_free'
  | 'unlink_attack'
  | 'house_of_force'
  | 'house_of_spirit'
  | 'house_of_lore'
  | 'house_of_einherjar'
  | 'fastbin_dup'
  | 'tcache_poisoning'
  | 'unsorted_bin_attack'
  | 'large_bin_attack'

export interface HeapChunk {
  address: string
  size: number
  prevSize: number
  flags: { prevInuse: boolean; mmapped: boolean; nonMainArena: boolean }
  userData: string
  state: 'allocated' | 'freed' | 'corrupted'
}

export interface FuzzStrategy {
  id: string
  name: string
  targetType: 'file_format' | 'network_protocol' | 'api' | 'command_line' | 'environment'
  fuzzer: string
  mutationStrategy: string
  seedCorpus: string[]
  dictionaryEntries: string[]
  timeout: number
  expectedCrashTypes: OverflowType[]
  coverageGoal: string
  commands: string[]
}

export interface FormatStringAnalysis {
  vulnerable: boolean
  readPrimitive: boolean
  writePrimitive: boolean
  offsetToTarget: number
  stackLeaks: string[]
  writePayload: string
  explanation: string[]
  debugSteps: DebugCommand[]
}

export interface OverflowPattern {
  id: string
  name: string
  type: OverflowType
  description: string
  codePattern: string
  languages: string[]
  indicators: string[]
  exploitation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  references: string[]
}

// ── Engine ───────────────────────────────────────────────────────────────────

export class BufferOverflowDebugger {
  private config: OverflowDebuggerConfig
  private stats: OverflowDebuggerStats
  private gadgetDB: Map<string, ROPGadget[]> = new Map()
  private overflowPatterns: Map<string, OverflowPattern> = new Map()
  private heapTechniques: Map<string, HeapAnalysis> = new Map()

  constructor(config?: Partial<OverflowDebuggerConfig>) {
    this.config = {
      architecture: 'x64',
      platform: 'linux',
      endianness: 'little',
      wordSize: 64,
      enableROP: true,
      enableHeapAnalysis: true,
      maxGadgets: 200,
      ...config,
    }
    this.stats = {
      totalAnalyses: 0,
      totalCrashesAnalyzed: 0,
      totalROPChainsBuilt: 0,
      totalGadgetsFound: 0,
      totalProtectionChecks: 0,
      totalFuzzStrategies: 0,
    }
    this._buildKnowledgeBase()
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /** Analyze a crash to determine overflow type and exploitability */
  analyzeCrash(crash: CrashInfo): OverflowAnalysis {
    this.stats.totalCrashesAnalyzed++
    this.stats.totalAnalyses++

    const type = this._detectOverflowType(crash)
    const controlsIP = this._checksIPControl(crash)
    const controlled = this._findControlledRegisters(crash)
    const exploitability = this._assessExploitability(type, controlsIP, controlled, crash)

    return {
      type,
      severity:
        exploitability === 'exploitable'
          ? 'critical'
          : exploitability === 'probably_exploitable'
            ? 'high'
            : 'medium',
      description: this._describeOverflow(type, crash),
      rootCause: this._identifyRootCause(type, crash),
      overflowOffset: this._calculateOffset(crash),
      controlsIP,
      controlledRegisters: controlled,
      exploitability,
      recommendations: this._generateRecommendations(type, crash),
      debugCommands: this._generateDebugCommands(type, crash),
      mitigations: this._suggestMitigations(type),
      cweIds: this._mapToCWE(type),
    }
  }

  /** Check binary protections (checksec equivalent) */
  checkProtections(binary: {
    nx?: boolean
    aslr?: boolean
    pie?: boolean
    canary?: boolean
    relro?: string
    fortify?: boolean
  }): BinaryProtections {
    this.stats.totalProtectionChecks++
    return {
      nx: binary.nx ?? false,
      aslr: binary.aslr ?? false,
      pie: binary.pie ?? false,
      stackCanary: binary.canary ?? false,
      relro: (binary.relro as BinaryProtections['relro']) ?? 'none',
      fortify: binary.fortify ?? false,
      cfi: false,
      safeseh: false,
      asan: false,
      shadowStack: false,
    }
  }

  /** Generate a protection analysis report */
  analyzeProtections(protections: BinaryProtections): string[] {
    const findings: string[] = []

    if (!protections.nx) {
      findings.push(
        'CRITICAL: NX/DEP disabled — stack/heap is executable, shellcode injection possible',
      )
    }
    if (!protections.aslr) {
      findings.push(
        'HIGH: ASLR disabled — addresses are predictable, direct return-to-libc possible',
      )
    }
    if (!protections.pie) {
      findings.push(
        'MEDIUM: PIE disabled — binary base address is fixed, gadgets at known addresses',
      )
    }
    if (!protections.stackCanary) {
      findings.push(
        'HIGH: Stack canaries disabled — stack buffer overflows can overwrite return address directly',
      )
    }
    if (protections.relro === 'none') {
      findings.push('MEDIUM: No RELRO — GOT is writable, GOT overwrite attacks possible')
    } else if (protections.relro === 'partial') {
      findings.push('LOW: Partial RELRO — some GOT entries still writable after startup')
    }
    if (!protections.fortify) {
      findings.push('LOW: FORTIFY_SOURCE not enabled — no compile-time buffer overflow checks')
    }
    if (
      protections.nx &&
      protections.aslr &&
      protections.pie &&
      protections.stackCanary &&
      protections.relro === 'full'
    ) {
      findings.push(
        'INFO: All major protections enabled — exploitation requires advanced techniques (ROP + info leak)',
      )
    }

    return findings
  }

  /** Build a ROP chain for a given objective */
  buildROPChain(objective: ROPObjective, protections: BinaryProtections): ROPChain {
    this.stats.totalROPChainsBuilt++
    const arch = this.config.architecture
    const gadgets = this._getGadgetsForObjective(objective, arch)
    const payload = this._buildPayload(objective, gadgets, arch)
    const explanation = this._explainROPChain(objective, gadgets, arch)

    return {
      id: `rop-${Date.now()}`,
      name: `${objective} ROP chain (${arch})`,
      objective,
      gadgets,
      payload,
      totalSize: payload.length * (this.config.wordSize / 8),
      nullFree: payload.every(p => !p.includes('\\x00')),
      reliability: this._calculateROPReliability(protections, gadgets),
      explanation,
    }
  }

  /** Analyze heap corruption */
  analyzeHeapCorruption(corruptionType: HeapCorruptionType): HeapAnalysis {
    this.stats.totalAnalyses++
    return this._getHeapAnalysis(corruptionType)
  }

  /** Generate fuzzing strategy for a target */
  generateFuzzStrategy(targetType: FuzzStrategy['targetType'], targetName: string): FuzzStrategy {
    this.stats.totalFuzzStrategies++
    return this._buildFuzzStrategy(targetType, targetName)
  }

  /** Analyze format string vulnerability */
  analyzeFormatString(inputOffset: number, targetAddress: string): FormatStringAnalysis {
    this.stats.totalAnalyses++
    return this._buildFormatStringAnalysis(inputOffset, targetAddress)
  }

  /** Get pattern for cyclic offset finding (like pattern_create) */
  generateCyclicPattern(length: number): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    let pattern = ''
    let ui = 0,
      li = 0,
      di = 0

    while (pattern.length < length) {
      pattern += upper[ui] + lower[li] + digits[di]
      di++
      if (di >= digits.length) {
        di = 0
        li++
        if (li >= lower.length) {
          li = 0
          ui++
          if (ui >= upper.length) {
            ui = 0 // wrap
          }
        }
      }
    }
    return pattern.substring(0, length)
  }

  /** Find offset of a value in a cyclic pattern */
  findPatternOffset(pattern: string, value: string): number {
    // value can be hex like "0x41306141" — convert to ASCII
    let searchStr = value
    if (value.startsWith('0x') || value.startsWith('0X')) {
      const hex = value.substring(2)
      searchStr = ''
      for (let i = 0; i < hex.length; i += 2) {
        searchStr += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
      }
      // Reverse for little-endian
      if (this.config.endianness === 'little') {
        searchStr = searchStr.split('').reverse().join('')
      }
    }
    return pattern.indexOf(searchStr)
  }

  /** Get all overflow patterns */
  getOverflowPatterns(type?: OverflowType): OverflowPattern[] {
    const patterns = Array.from(this.overflowPatterns.values())
    if (!type) return patterns
    return patterns.filter(p => p.type === type)
  }

  /** Generate GDB debugging script for overflow analysis */
  generateGDBScript(binary: string, crashAddress?: string): string {
    const lines: string[] = [
      `#!/usr/bin/env gdb -x`,
      `# Auto-generated overflow debugging script`,
      `# Target: ${binary}`,
      ``,
      `set pagination off`,
      `set disassembly-flavor intel`,
      `set follow-fork-mode child`,
      ``,
      `# Load the binary`,
      `file ${binary}`,
      ``,
      `# Set useful breakpoints`,
      `catch signal SIGSEGV`,
      `catch signal SIGABRT`,
      `catch signal SIGBUS`,
      ``,
      `# Enable ASAN-like checks if available`,
      `set environment MALLOC_CHECK_=3`,
      ``,
      `# Define crash analysis commands`,
      `define analyze_crash`,
      `  echo \\n=== CRASH ANALYSIS ===\\n`,
      `  echo \\n--- Registers ---\\n`,
      `  info registers`,
      `  echo \\n--- Backtrace ---\\n`,
      `  bt full`,
      `  echo \\n--- Stack ---\\n`,
      `  x/32xg $rsp`,
      `  echo \\n--- Instruction ---\\n`,
      `  x/5i $rip`,
      `  echo \\n--- Memory Map ---\\n`,
      `  info proc mappings`,
      `end`,
      ``,
      `# Define pattern offset helper`,
      `define find_offset`,
      `  echo \\nLooking for pattern in registers...\\n`,
      `  info registers rip rbp rsp rax rbx rcx rdx rsi rdi`,
      `end`,
      ``,
      `# Define heap analysis`,
      `define heap_info`,
      `  echo \\n=== HEAP ANALYSIS ===\\n`,
      `  info proc mappings`,
      `  echo \\nLooking for heap metadata...\\n`,
      `  x/32xg &main_arena`,
      `end`,
      ``,
    ]

    if (crashAddress) {
      lines.push(`# Set breakpoint at crash location`, `break *${crashAddress}`, ``)
    }

    lines.push(
      `# Run the target`,
      `echo \\nStarting analysis... Use 'run <args>' to begin\\n`,
      `echo Type 'analyze_crash' after a crash to get full info\\n`,
    )

    return lines.join('\n')
  }

  /** Get bypass techniques for specific protections */
  getBypassTechniques(protection: keyof BinaryProtections): string[] {
    const bypasses: Record<string, string[]> = {
      nx: [
        'Return-Oriented Programming (ROP) — chain existing code gadgets',
        'Jump-Oriented Programming (JOP) — use indirect jumps instead of returns',
        'Sigreturn-Oriented Programming (SROP) — abuse sigreturn syscall',
        'ret2libc — return to existing library functions',
        'mprotect() ROP chain — make memory executable at runtime',
      ],
      aslr: [
        'Information leak — leak libc/stack/heap addresses via format string or read primitive',
        'Partial overwrite — overwrite only low bytes of address (page-aligned)',
        'Brute force (32-bit) — ASLR entropy is only 8-16 bits on 32-bit',
        'Stack pivot + spray — pivot to attacker-controlled heap address',
        'Return-to-PLT — PLT entries have fixed addresses without PIE',
        'ret2dlresolve — resolve arbitrary functions at runtime',
      ],
      pie: [
        'Information leak — disclose binary base address',
        'Partial overwrite — modify only low 12 bits of code pointer (page offset)',
        'Use non-PIE shared libraries as gadget source',
      ],
      stackCanary: [
        'Information leak — read canary via format string or buffer over-read',
        'Brute force (fork-based servers) — canary preserved across fork()',
        'Overwrite via adjacent variable — skip over canary using struct layout',
        'Thread-local storage (TLS) overwrite — canary reference in TLS',
        'Exception handler — use C++ exception or longjmp before canary check',
      ],
      relro: [
        'Partial RELRO: Overwrite .got.plt entries for lazy-bound functions',
        'Use __malloc_hook / __free_hook (removed in glibc 2.34+)',
        'Overwrite .fini_array for code execution at exit',
        'Target non-GOT function pointers (vtables, callbacks)',
        'Overwrite stdout file structure for write primitive',
      ],
      fortify: [
        'Exploit check gaps — FORTIFY only covers a subset of functions',
        'Use non-fortified code paths',
        'Trigger via runtime-computed sizes that bypass compile-time checks',
      ],
      cfi: [
        'Find valid call targets that allow privilege operations',
        'Use COOP (Counterfeit Object-Oriented Programming)',
        'Data-only attacks — modify data without hijacking control flow',
      ],
      safeseh: [
        'Use modules without SafeSEH compiled',
        'Overwrite next SEH with a pop-pop-ret gadget from a non-SafeSEH module',
      ],
      asan: [
        'ASan is a development tool, not a security mitigation — should not be in production',
        'Poison byte manipulation if ASan shadow memory is accessible',
      ],
      shadowStack: [
        'Data-only attacks — avoid return address corruption entirely',
        'Target forward-edge calls (not protected by shadow stack alone)',
      ],
    }

    return bypasses[protection] ?? [`No known bypass techniques for ${protection}`]
  }

  /** Get stats */
  getStats(): OverflowDebuggerStats {
    return { ...this.stats }
  }

  // ── Private: Analysis ──────────────────────────────────────────────────

  private _detectOverflowType(crash: CrashInfo): OverflowType {
    if (crash.overflowType) return crash.overflowType

    const ip = crash.instructionPointer
    const fault = crash.faultAddress

    // Check for pattern bytes in IP (typical of stack overflow + IP control)
    if (ip.includes('41414141') || ip.includes('4141414141414141')) {
      return 'stack_buffer_overflow'
    }

    // Heap pointers typically in a different range
    if (fault.startsWith('0x5') || fault.startsWith('0x6')) {
      return 'heap_buffer_overflow'
    }

    // Check for format string indicators
    if (
      crash.backtrace.some(
        l => l.includes('printf') || l.includes('fprintf') || l.includes('sprintf'),
      )
    ) {
      return 'format_string'
    }

    // Check for double-free (more specific — must come before UAF)
    if (crash.signal === 'SIGABRT' && crash.backtrace.some(l => l.includes('double free'))) {
      return 'double_free'
    }

    // Check for UAF indicators
    if (
      crash.backtrace.some(
        l => l.includes('free') || l.includes('_int_free') || l.includes('tcache'),
      )
    ) {
      return 'use_after_free'
    }

    // Integer overflow leads to small allocation
    if (crash.backtrace.some(l => l.includes('malloc') || l.includes('realloc'))) {
      return 'integer_overflow'
    }

    return 'stack_buffer_overflow' // default
  }

  private _checksIPControl(crash: CrashInfo): boolean {
    const ip = crash.instructionPointer
    // If IP contains recognizable pattern bytes, attacker controls it
    const patternBytes = ['41414141', '42424242', '43434343', '41306141', '61413061']
    return patternBytes.some(p => ip.includes(p))
  }

  private _findControlledRegisters(crash: CrashInfo): string[] {
    const controlled: string[] = []
    const attackerValues = [
      '41414141',
      '42424242',
      '43434343',
      '41306141',
      '61413061',
      'deadbeef',
      'cafebabe',
    ]
    for (const [reg, val] of Object.entries(crash.registers)) {
      if (attackerValues.some(av => val.toLowerCase().includes(av))) {
        controlled.push(reg)
      }
    }
    return controlled
  }

  private _assessExploitability(
    type: OverflowType,
    controlsIP: boolean,
    controlled: string[],
    crash: CrashInfo,
  ): OverflowAnalysis['exploitability'] {
    if (controlsIP) return 'exploitable'
    if (controlled.length >= 3) return 'probably_exploitable'
    if (type === 'use_after_free' || type === 'double_free') return 'probably_exploitable'
    if (type === 'format_string') return 'probably_exploitable'
    if (controlled.length >= 1) return 'probably_not'
    return 'not_exploitable'
  }

  private _describeOverflow(type: OverflowType, crash: CrashInfo): string {
    const descriptions: Record<OverflowType, string> = {
      stack_buffer_overflow: `Stack buffer overflow detected — signal ${crash.signal} at IP ${crash.instructionPointer}. Stack data has been corrupted past a local buffer boundary, overwriting the saved return address and/or saved frame pointer.`,
      heap_buffer_overflow: `Heap buffer overflow detected — signal ${crash.signal} at fault address ${crash.faultAddress}. Heap metadata or adjacent chunk data has been corrupted by writing past the end of a heap-allocated buffer.`,
      integer_overflow: `Integer overflow detected — arithmetic overflow in size calculation led to undersized allocation and subsequent memory corruption.`,
      format_string: `Format string vulnerability detected — user-controlled format specifiers are being processed by printf-family functions, allowing memory read/write.`,
      use_after_free: `Use-after-free detected — program accesses heap memory that has already been freed. The freed chunk may have been reallocated for a different purpose.`,
      double_free: `Double free detected — free() called twice on the same pointer, corrupting heap metadata and potentially allowing arbitrary write.`,
      off_by_one: `Off-by-one overflow — a single byte overflow past a buffer boundary, potentially corrupting the least significant byte of an adjacent value.`,
      off_by_null: `Off-by-null (null byte overflow) — a null byte written one position past buffer end, potentially corrupting the LSB of saved frame pointer.`,
      stack_clash: `Stack clash detected — stack growth collided with another memory region (heap/mmap), bypassing the guard page.`,
      type_confusion: `Type confusion detected — an object is used as a different type, leading to out-of-bounds access of fields at unexpected offsets.`,
    }
    return descriptions[type]
  }

  private _identifyRootCause(type: OverflowType, crash: CrashInfo): string {
    const causes: Record<OverflowType, string> = {
      stack_buffer_overflow:
        'Unsafe copy into fixed-size stack buffer without bounds checking (e.g., strcpy, sprintf, gets)',
      heap_buffer_overflow:
        'Write operation exceeding heap allocation size without bounds checking',
      integer_overflow:
        'Integer arithmetic overflow/underflow in buffer size calculation before allocation',
      format_string:
        'User-controlled input passed directly as format string argument to printf-family function',
      use_after_free:
        'Pointer used after the memory it references has been freed — dangling pointer dereference',
      double_free:
        'Same pointer passed to free() twice without intervening allocation — heap metadata corruption',
      off_by_one:
        'Loop boundary error or fence-post error writing exactly one byte past buffer end',
      off_by_null:
        'Null terminator written past buffer boundary (common in strncat or manual null termination)',
      stack_clash:
        'Large or recursive stack allocations without guard page checks — stack collides with adjacent mapping',
      type_confusion:
        'Object cast to incompatible type — field offsets mismatch causing out-of-bounds access',
    }
    return causes[type]
  }

  private _calculateOffset(crash: CrashInfo): number {
    // Try to determine offset from pattern in IP
    const ip = crash.instructionPointer
    if (ip.includes('41414141')) return 0 // placeholder — would need actual pattern matching
    if (ip.includes('41306141')) return 140 // common offset for CTF
    return -1 // unknown
  }

  private _generateRecommendations(type: OverflowType, crash: CrashInfo): string[] {
    const recs: string[] = []

    recs.push('1. Generate a cyclic pattern to determine exact overflow offset')
    recs.push('2. Run with AddressSanitizer (ASAN) to get precise corruption location')

    switch (type) {
      case 'stack_buffer_overflow':
        recs.push('3. Check for stack canary — if present, need info leak first')
        recs.push('4. Determine if NX is enabled — if yes, use ROP instead of shellcode')
        recs.push('5. Check ASLR status — if enabled, need address leak for libc gadgets')
        recs.push('6. Look for one_gadget in libc for single-address exploitation')
        break
      case 'heap_buffer_overflow':
        recs.push('3. Identify heap allocator (ptmalloc2/jemalloc/tcmalloc)')
        recs.push('4. Map adjacent heap chunks to find overwrite targets')
        recs.push('5. Look for function pointers or vtables in adjacent chunks')
        recs.push('6. Consider tcache/fastbin/unsorted_bin attack techniques')
        break
      case 'format_string':
        recs.push('3. Determine stack offset to user input with %p leak')
        recs.push('4. Use %n for write primitive, %s/%p for read primitive')
        recs.push('5. Target GOT entry or return address for code execution')
        break
      case 'use_after_free':
        recs.push('3. Identify object size and allocator bin')
        recs.push('4. Trigger reallocation of freed chunk with controlled data')
        recs.push('5. Overwrite vtable or function pointer in reallocated chunk')
        break
      case 'double_free':
        recs.push('3. Check glibc version — tcache attacks work on 2.26+')
        recs.push('4. Use tcache poisoning to get arbitrary write')
        recs.push('5. Target __malloc_hook or __free_hook (pre-glibc 2.34)')
        break
      default:
        recs.push('3. Enable debug symbols and re-run for precise source location')
    }

    return recs
  }

  private _generateDebugCommands(type: OverflowType, crash: CrashInfo): DebugCommand[] {
    const cmds: DebugCommand[] = []

    // GDB commands
    cmds.push({
      tool: 'gdb',
      command: 'run < <(python3 -c "print(\'A\'*500)")',
      description: "Send 500 A's as input to trigger crash",
      expected: 'Program crashes with SIGSEGV',
    })
    cmds.push({
      tool: 'gdb',
      command: 'info registers',
      description: 'Display all register values after crash',
      expected: 'Shows RIP/RSP/RBP values — check for pattern bytes',
    })
    cmds.push({
      tool: 'gdb',
      command: 'bt full',
      description: 'Full backtrace with local variables',
      expected: 'Shows call stack and corrupted variables',
    })
    cmds.push({
      tool: 'gdb',
      command: 'x/64xg $rsp',
      description: 'Examine 64 quadwords at stack pointer',
      expected: 'Shows stack layout and overflow pattern',
    })
    cmds.push({
      tool: 'gdb',
      command: 'checksec',
      description: 'Check binary security protections (pwndbg/peda)',
      expected: 'Shows NX, ASLR, PIE, Canary, RELRO status',
    })

    if (type === 'stack_buffer_overflow') {
      cmds.push({
        tool: 'gdb',
        command: 'pattern create 500',
        description: 'Generate cyclic pattern for offset discovery',
        expected: 'Cyclic pattern string',
      })
      cmds.push({
        tool: 'gdb',
        command: 'pattern offset $rip',
        description: 'Find offset to instruction pointer',
        expected: 'Exact byte offset to overwrite RIP',
      })
    }

    if (type === 'heap_buffer_overflow' || type === 'use_after_free' || type === 'double_free') {
      cmds.push({
        tool: 'gdb',
        command: 'heap chunks',
        description: 'List all heap chunks (pwndbg)',
        expected: 'Shows chunk addresses, sizes, and states',
      })
      cmds.push({
        tool: 'gdb',
        command: 'heap bins',
        description: 'Display all heap bins (fastbin, tcache, unsorted)',
        expected: 'Shows bin contents and freed chunk chains',
      })
      cmds.push({
        tool: 'gdb',
        command: 'vis_heap_chunks',
        description: 'Visual heap chunk layout (pwndbg)',
        expected: 'Color-coded heap visualization',
      })
    }

    if (type === 'format_string') {
      cmds.push({
        tool: 'gdb',
        command: "run < <(python3 -c \"print('AAAA' + '.%p'*20)\")",
        description: 'Leak stack values via format string',
        expected: 'Stack pointer values printed — find offset',
      })
    }

    return cmds
  }

  private _suggestMitigations(type: OverflowType): string[] {
    const mitigations: Record<OverflowType, string[]> = {
      stack_buffer_overflow: [
        'Use strncpy/snprintf instead of strcpy/sprintf',
        'Enable stack canaries (-fstack-protector-all)',
        'Enable ASLR and PIE for address randomization',
        'Enable NX/DEP to prevent stack code execution',
        'Use Safe Stack (-fsanitize=safe-stack) for critical buffers',
        'Consider using Rust/Go for memory-safe alternatives',
      ],
      heap_buffer_overflow: [
        'Use bounds-checked allocation wrappers',
        'Enable heap canaries (glibc tcache key)',
        'Use sanitizers in testing (ASAN/MSAN)',
        'Validate all size calculations before allocation',
        'Consider custom allocator with guard pages',
      ],
      integer_overflow: [
        'Use safe integer arithmetic (checked_add, etc.)',
        'Validate inputs before size calculations',
        'Use size_t for buffer sizes with overflow checks',
        'Enable UBSan (-fsanitize=undefined)',
        'Cast to larger type before multiplication',
      ],
      format_string: [
        'NEVER pass user input as format string',
        'Always use printf("%s", user_input) instead of printf(user_input)',
        'Enable -Wformat-security compiler warnings',
        'Use FORTIFY_SOURCE for runtime format checks',
      ],
      use_after_free: [
        'Set pointer to NULL immediately after free()',
        'Use smart pointers (unique_ptr/shared_ptr in C++)',
        'Enable ASAN for testing to catch UAF early',
        'Consider using a garbage-collected language',
        'Use allocator with delayed free (quarantine)',
      ],
      double_free: [
        'Set pointer to NULL after free()',
        'Use ownership semantics (single owner frees)',
        'Enable ASAN to detect double-free in testing',
        'Audit all error-handling paths for double-free',
      ],
      off_by_one: [
        'Audit loop boundaries carefully (< vs <=)',
        'Use sizeof(buf)-1 for null terminator space',
        'Enable ASAN for precise off-by-one detection',
        'Use bounds-checked container types',
      ],
      off_by_null: [
        'Audit strncat and manual null termination',
        'Allocate buffer+1 for null terminator',
        'Use snprintf which always null-terminates within size',
      ],
      stack_clash: [
        'Enable stack clash protection (-fstack-clash-protection)',
        'Limit recursive call depth',
        'Avoid large stack allocations (alloca, VLAs)',
        'Ensure guard pages are properly configured',
      ],
      type_confusion: [
        'Use strict typing and avoid unsafe casts',
        'Enable CFI to validate virtual calls',
        'Use dynamic_cast in C++ for safe downcasting',
        'Audit all reinterpret_cast usage',
      ],
    }
    return mitigations[type] ?? ['Enable comprehensive memory safety tooling']
  }

  private _mapToCWE(type: OverflowType): string[] {
    const mapping: Record<OverflowType, string[]> = {
      stack_buffer_overflow: ['CWE-121', 'CWE-120', 'CWE-119'],
      heap_buffer_overflow: ['CWE-122', 'CWE-119'],
      integer_overflow: ['CWE-190', 'CWE-122'],
      format_string: ['CWE-134'],
      use_after_free: ['CWE-416'],
      double_free: ['CWE-415'],
      off_by_one: ['CWE-193', 'CWE-119'],
      off_by_null: ['CWE-193', 'CWE-119', 'CWE-121'],
      stack_clash: ['CWE-121', 'CWE-119'],
      type_confusion: ['CWE-843'],
    }
    return mapping[type] ?? ['CWE-119']
  }

  // ── Private: ROP ───────────────────────────────────────────────────────

  private _getGadgetsForObjective(objective: ROPObjective, arch: Architecture): ROPGadget[] {
    const key = `${arch}-${objective}`
    return this.gadgetDB.get(key) ?? this._generateGadgets(objective, arch)
  }

  private _generateGadgets(objective: ROPObjective, arch: Architecture): ROPGadget[] {
    const gadgets: ROPGadget[] = []
    const is64 = arch === 'x64' || arch === 'arm64'

    switch (objective) {
      case 'execve_binsh':
        if (arch === 'x64') {
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rdi; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Load /bin/sh address into rdi (arg1)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rsi; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set rsi=0 (argv=NULL)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rdx; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set rdx=0 (envp=NULL)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rax; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set rax=59 (execve syscall number)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'syscall; ret',
            type: 'syscall',
            size: 2,
            usable: true,
            notes: 'Execute syscall',
          })
        } else if (arch === 'x86') {
          gadgets.push({
            address: '0x????????',
            instructions: 'pop ebx; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Load /bin/sh address into ebx',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop ecx; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set ecx=0 (argv=NULL)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop edx; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set edx=0 (envp=NULL)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop eax; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set eax=11 (execve)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'int 0x80',
            type: 'int80',
            size: 2,
            usable: true,
            notes: 'Execute syscall via int 0x80',
          })
        }
        break

      case 'mprotect_rwx':
        if (is64) {
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rdi; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Address of memory page to make executable',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rsi; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Size of region (0x1000 = one page)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rdx; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Permissions: 7 = RWX',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rax; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Set rax=10 (mprotect syscall)',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'syscall; ret',
            type: 'syscall',
            size: 2,
            usable: true,
            notes: 'Execute mprotect',
          })
        }
        break

      case 'stack_pivot':
        gadgets.push({
          address: '0x????????',
          instructions: is64 ? 'xchg rax, rsp; ret' : 'xchg eax, esp; ret',
          type: 'stack_pivot',
          size: 2,
          usable: true,
          notes: 'Pivot stack to controlled buffer',
        })
        gadgets.push({
          address: '0x????????',
          instructions: 'leave; ret',
          type: 'leave_ret',
          size: 2,
          usable: true,
          notes: 'Alternative stack pivot via leave (mov rsp, rbp; pop rbp)',
        })
        break

      case 'write_what_where':
        if (is64) {
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rdi; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Load target address',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'pop rsi; ret',
            type: 'pop_reg',
            size: 2,
            usable: true,
            notes: 'Load value to write',
          })
          gadgets.push({
            address: '0x????????',
            instructions: 'mov [rdi], rsi; ret',
            type: 'write_mem',
            size: 3,
            usable: true,
            notes: 'Write value to target address',
          })
        }
        break

      default:
        gadgets.push({
          address: '0x????????',
          instructions: 'ret',
          type: 'ret',
          size: 1,
          usable: true,
          notes: 'RET sled / alignment gadget',
        })
    }

    this.stats.totalGadgetsFound += gadgets.length
    return gadgets
  }

  private _buildPayload(
    objective: ROPObjective,
    gadgets: ROPGadget[],
    arch: Architecture,
  ): string[] {
    const payload: string[] = []
    const ptrSize = arch === 'x64' || arch === 'arm64' ? 8 : 4

    switch (objective) {
      case 'execve_binsh':
        if (arch === 'x64') {
          payload.push(
            '# ROP chain: execve("/bin/sh", NULL, NULL)',
            `# Offset: ${ptrSize} bytes per entry`,
            '',
            'pop_rdi_ret       # gadget: pop rdi; ret',
            'addr_bin_sh       # address of "/bin/sh" string',
            'pop_rsi_ret       # gadget: pop rsi; ret',
            '0x0000000000000000  # rsi = NULL (argv)',
            'pop_rdx_ret       # gadget: pop rdx; ret',
            '0x0000000000000000  # rdx = NULL (envp)',
            'pop_rax_ret       # gadget: pop rax; ret',
            '0x000000000000003b  # rax = 59 (execve)',
            'syscall_ret       # gadget: syscall; ret',
          )
        } else if (arch === 'x86') {
          payload.push(
            '# ROP chain: execve("/bin/sh", NULL, NULL) - 32-bit',
            'pop_ebx_ret     # gadget: pop ebx; ret',
            'addr_bin_sh     # address of "/bin/sh"',
            'pop_ecx_ret     # gadget: pop ecx; ret',
            '0x00000000      # ecx = NULL',
            'pop_edx_ret     # gadget: pop edx; ret',
            '0x00000000      # edx = NULL',
            'pop_eax_ret     # gadget: pop eax; ret',
            '0x0000000b      # eax = 11 (execve)',
            'int_0x80        # trigger: int 0x80',
          )
        }
        break

      case 'mprotect_rwx':
        payload.push(
          '# ROP chain: mprotect(stack_page, 0x1000, PROT_READ|PROT_WRITE|PROT_EXEC)',
          'pop_rdi_ret       # gadget: pop rdi; ret',
          'stack_page_addr   # page-aligned stack address',
          'pop_rsi_ret       # gadget: pop rsi; ret',
          '0x0000000000001000  # size = 4096 (one page)',
          'pop_rdx_ret       # gadget: pop rdx; ret',
          '0x0000000000000007  # prot = RWX',
          'pop_rax_ret       # gadget: pop rax; ret',
          '0x000000000000000a  # rax = 10 (mprotect)',
          'syscall_ret       # execute mprotect',
          'shellcode_addr    # jump to shellcode on now-executable stack',
        )
        break

      default:
        payload.push('# Generic ROP payload structure')
        for (const g of gadgets) {
          payload.push(`${g.instructions.replace(/;/g, '_').replace(/\s+/g, '_')}  # ${g.notes}`)
        }
    }

    return payload
  }

  private _explainROPChain(
    objective: ROPObjective,
    gadgets: ROPGadget[],
    arch: Architecture,
  ): string[] {
    const explanation: string[] = []

    explanation.push(`== ROP Chain Explanation: ${objective} (${arch}) ==`)
    explanation.push('')

    switch (objective) {
      case 'execve_binsh':
        explanation.push('Goal: Execute /bin/sh to spawn a shell')
        explanation.push('')
        explanation.push('Strategy:')
        explanation.push('1. Set up registers for execve() syscall:')
        if (arch === 'x64') {
          explanation.push('   rdi = address of "/bin/sh" string')
          explanation.push('   rsi = NULL (no arguments)')
          explanation.push('   rdx = NULL (no environment)')
          explanation.push('   rax = 59 (execve syscall number)')
          explanation.push('2. Execute syscall instruction')
        } else {
          explanation.push('   ebx = address of "/bin/sh" string')
          explanation.push('   ecx = NULL (no arguments)')
          explanation.push('   edx = NULL (no environment)')
          explanation.push('   eax = 11 (execve syscall number)')
          explanation.push('2. Execute int 0x80')
        }
        explanation.push('')
        explanation.push('Finding gadgets:')
        explanation.push(
          '  Use ROPgadget, ropper, or radare2 to find pop/ret gadgets in binary/libc',
        )
        explanation.push('  Command: ROPgadget --binary ./target | grep "pop rdi"')
        break

      case 'mprotect_rwx':
        explanation.push('Goal: Make a memory page executable, then jump to shellcode')
        explanation.push('')
        explanation.push('Strategy:')
        explanation.push('1. Call mprotect() to add PROT_EXEC to a memory page')
        explanation.push('2. Page must be aligned to page boundary (0x1000)')
        explanation.push('3. After mprotect succeeds, jump to shellcode placed on that page')
        break

      case 'stack_pivot':
        explanation.push('Goal: Redirect stack pointer to attacker-controlled memory')
        explanation.push('')
        explanation.push('Strategy:')
        explanation.push('1. Use xchg reg, rsp or leave; ret to change RSP')
        explanation.push('2. RSP now points to heap/bss where full ROP chain is staged')
        explanation.push('3. Useful when overflow size is too small for full ROP chain')
        break

      default:
        explanation.push(`Generic ROP chain with ${gadgets.length} gadgets`)
    }

    return explanation
  }

  private _calculateROPReliability(protections: BinaryProtections, gadgets: ROPGadget[]): number {
    let reliability = 0.9
    if (protections.aslr) reliability -= 0.3
    if (protections.pie) reliability -= 0.2
    if (protections.stackCanary) reliability -= 0.2
    if (gadgets.length === 0) reliability = 0
    return Math.max(0, Math.min(1, reliability))
  }

  // ── Private: Heap ──────────────────────────────────────────────────────

  private _getHeapAnalysis(corruptionType: HeapCorruptionType): HeapAnalysis {
    const techniques: Record<HeapCorruptionType, Omit<HeapAnalysis, 'chunkInfo'>> = {
      overflow_into_next: {
        allocator: 'ptmalloc2',
        corruptionType: 'overflow_into_next',
        exploitTechnique:
          'Overflow metadata of next chunk to control size/flags, then trigger unlink or consolidation',
        difficulty: 'medium',
        requirements: ['Heap overflow primitive', 'Adjacent chunk of known type'],
        steps: [
          "Overflow buffer to corrupt next chunk's size field",
          'Set prev_inuse bit to 0 to trigger backward consolidation',
          'Control unlink pointers for write-what-where',
          'Overwrite __malloc_hook or GOT entry',
        ],
      },
      use_after_free: {
        allocator: 'ptmalloc2',
        corruptionType: 'use_after_free',
        exploitTechnique:
          'Free target object, reallocate with controlled data of same size, trigger use of stale pointer',
        difficulty: 'medium',
        requirements: [
          'UAF primitive',
          'Control over allocation size',
          'Object with function pointer',
        ],
        steps: [
          'Free the victim object',
          'Allocate new object of same size',
          'Fill with controlled data (fake vtable/function pointer)',
          'Trigger the stale pointer usage — redirects execution',
        ],
      },
      double_free: {
        allocator: 'ptmalloc2',
        corruptionType: 'double_free',
        exploitTechnique:
          'Double free to create circular linked list in freelist, then allocate overlapping chunks',
        difficulty: 'easy',
        requirements: ['Double free primitive', 'Control next allocation data'],
        steps: [
          'free(A)',
          'free(B) — to avoid double-free detection',
          'free(A) again — A is now in freelist twice',
          'malloc(size) returns A — write fake fd pointer',
          'malloc(size) returns B',
          'malloc(size) returns A again',
          'malloc(size) returns address written as fd — arbitrary alloc',
        ],
      },
      unlink_attack: {
        allocator: 'ptmalloc2',
        corruptionType: 'unlink_attack',
        exploitTechnique:
          'Corrupt chunk metadata to abuse unlink macro for arbitrary write (classic, pre-2.26)',
        difficulty: 'hard',
        requirements: ['Heap overflow', 'Known heap address (for unlink checks)'],
        steps: [
          'Forge fake chunk with fd and bk pointing to target-3*sizeof(void*) and target-2*sizeof(void*)',
          'Trigger unlink by freeing adjacent chunk',
          'Unlink writes target value — gives write primitive',
        ],
      },
      house_of_force: {
        allocator: 'ptmalloc2',
        corruptionType: 'house_of_force',
        exploitTechnique:
          'Overwrite top chunk size to -1, then request calculated offset to get chunk at arbitrary address',
        difficulty: 'medium',
        requirements: ['Heap overflow into top chunk', 'Known heap address'],
        steps: [
          'Overflow top chunk size field to 0xFFFFFFFFFFFFFFFF',
          'Calculate distance from top chunk to target',
          'malloc(distance) — moves top chunk past target',
          'malloc(size) — returns chunk overlapping target',
        ],
      },
      house_of_spirit: {
        allocator: 'ptmalloc2',
        corruptionType: 'house_of_spirit',
        exploitTechnique:
          'Create fake chunk on stack/BSS, free it into fastbin, then reallocate to get stack/BSS access',
        difficulty: 'medium',
        requirements: ['Write primitive for fake chunk header', 'Control of free() argument'],
        steps: [
          'Forge fake chunk header on stack with valid size',
          'Forge next chunk header for size validation',
          'Call free() on fake chunk — goes to fastbin',
          'malloc(size) returns the fake chunk — stack/BSS access',
        ],
      },
      house_of_lore: {
        allocator: 'ptmalloc2',
        corruptionType: 'house_of_lore',
        exploitTechnique: 'Corrupt smallbin bk pointer to return arbitrary address from malloc',
        difficulty: 'hard',
        requirements: ['Heap overflow or UAF', 'Known heap/stack address'],
        steps: [
          'Free chunk A into smallbin',
          "Corrupt A's bk to point to fake chunk on stack",
          "Set fake chunk's bk to point to another valid location",
          'malloc returns legitimate chunk, next malloc returns fake chunk',
        ],
      },
      house_of_einherjar: {
        allocator: 'ptmalloc2',
        corruptionType: 'house_of_einherjar',
        exploitTechnique: 'Off-by-null to trigger backward consolidation into fake chunk',
        difficulty: 'hard',
        requirements: ['Off-by-null overflow', 'Known heap address for fake chunk'],
        steps: [
          'Create fake chunk at known address',
          'Off-by-null into next chunk to clear prev_inuse',
          'Set prev_size to distance to fake chunk',
          'Free the corrupted chunk — backward consolidation merges with fake chunk',
          'malloc returns overlapping region',
        ],
      },
      fastbin_dup: {
        allocator: 'ptmalloc2',
        corruptionType: 'fastbin_dup',
        exploitTechnique: 'Double free in fastbin to get overlapping allocations',
        difficulty: 'easy',
        requirements: ['Double free primitive for fastbin-sized chunks'],
        steps: [
          'free(a) — a goes to fastbin[i]',
          'free(b) — b goes to fastbin[i], b->fd = a',
          'free(a) — a goes to fastbin[i] again',
          'malloc returns a — overwrite a->fd with target',
          'malloc returns b',
          'malloc returns a',
          'malloc returns target address — arbitrary alloc',
        ],
      },
      tcache_poisoning: {
        allocator: 'ptmalloc2',
        corruptionType: 'tcache_poisoning',
        exploitTechnique:
          'Overwrite tcache fd pointer to get allocation at arbitrary address (glibc 2.26+)',
        difficulty: 'easy',
        requirements: ['UAF or overflow into freed tcache chunk', 'Target address'],
        steps: [
          'Free chunk into tcache bin',
          "Overwrite chunk's fd pointer with target address",
          'On glibc 2.32+: XOR fd with heap address>>12 (safe linking)',
          'malloc(size) returns original chunk',
          'malloc(size) returns target address — arbitrary write',
        ],
      },
      unsorted_bin_attack: {
        allocator: 'ptmalloc2',
        corruptionType: 'unsorted_bin_attack',
        exploitTechnique:
          'Overwrite unsorted bin bk to write main_arena address to arbitrary location',
        difficulty: 'medium',
        requirements: ['UAF on unsorted bin chunk', 'Target address for write'],
        steps: [
          'Free chunk into unsorted bin',
          'Overwrite bk pointer with target-2*sizeof(void*)',
          'malloc triggers unsorted bin scan',
          'main_arena address written to target location',
        ],
      },
      large_bin_attack: {
        allocator: 'ptmalloc2',
        corruptionType: 'large_bin_attack',
        exploitTechnique: 'Corrupt large bin chunk pointers for write-what-where with heap address',
        difficulty: 'hard',
        requirements: ['UAF on large bin chunk', 'Two controlled allocations'],
        steps: [
          'Free large chunk A into large bin',
          "Corrupt A's bk_nextsize to target-0x20",
          'Free larger chunk B — sorted into same large bin',
          'heap address written to target during insertion',
        ],
      },
    }

    const technique = techniques[corruptionType] ?? techniques.overflow_into_next

    return {
      ...technique,
      chunkInfo: [
        {
          address: '0x?????000',
          size: 0x90,
          prevSize: 0,
          flags: { prevInuse: true, mmapped: false, nonMainArena: false },
          userData: 'victim buffer',
          state: 'allocated',
        },
        {
          address: '0x?????090',
          size: 0x90,
          prevSize: 0,
          flags: { prevInuse: true, mmapped: false, nonMainArena: false },
          userData: 'adjacent chunk',
          state: 'allocated',
        },
      ],
    }
  }

  // ── Private: Fuzzing ───────────────────────────────────────────────────

  private _buildFuzzStrategy(
    targetType: FuzzStrategy['targetType'],
    targetName: string,
  ): FuzzStrategy {
    const strategies: Record<string, Omit<FuzzStrategy, 'id'>> = {
      file_format: {
        name: `Fuzz ${targetName} file parser`,
        targetType: 'file_format',
        fuzzer: 'AFL++',
        mutationStrategy: 'Havoc + splice + MOpt',
        seedCorpus: [
          'Collect valid sample files from test suites',
          'Minimize corpus with afl-cmin',
          'Include edge cases: empty, minimal, maximum size',
        ],
        dictionaryEntries: [
          'Magic bytes',
          'Common field values',
          'Boundary values (0x00, 0xFF, 0x7F, 0x80)',
        ],
        timeout: 86400,
        expectedCrashTypes: [
          'stack_buffer_overflow',
          'heap_buffer_overflow',
          'integer_overflow',
          'use_after_free',
        ],
        coverageGoal: '80%+ edge coverage',
        commands: [
          `afl-fuzz -i corpus/ -o findings/ -m none -- ./${targetName} @@`,
          `# With AddressSanitizer:`,
          `CC=afl-clang-fast CFLAGS="-fsanitize=address" make`,
          `# With persistent mode for speed:`,
          `afl-fuzz -i corpus/ -o findings/ -- ./${targetName}_persistent`,
        ],
      },
      network_protocol: {
        name: `Fuzz ${targetName} network service`,
        targetType: 'network_protocol',
        fuzzer: 'boofuzz',
        mutationStrategy: 'Protocol-aware mutation with state tracking',
        seedCorpus: [
          'Capture valid protocol exchanges',
          'Include authentication sequences',
          'Edge cases in length fields',
        ],
        dictionaryEntries: ['Protocol keywords', 'Common delimiters', 'Max-length values'],
        timeout: 43200,
        expectedCrashTypes: ['stack_buffer_overflow', 'heap_buffer_overflow', 'format_string'],
        coverageGoal: '70%+ code path coverage',
        commands: [
          `# boofuzz session for ${targetName}:`,
          `python3 -c "from boofuzz import *; sess = Session(target=Target(connection=TCPSocketConnection('127.0.0.1', PORT)))"`,
          `# Or use AFL with network mode:`,
          `afl-fuzz -i corpus/ -o findings/ -N tcp://127.0.0.1/PORT -- ./${targetName}`,
        ],
      },
      api: {
        name: `Fuzz ${targetName} API endpoints`,
        targetType: 'api',
        fuzzer: 'RESTler / AFL',
        mutationStrategy: 'Grammar-based API fuzzing',
        seedCorpus: [
          'OpenAPI/Swagger spec',
          'Valid request/response pairs',
          'Authentication tokens',
        ],
        dictionaryEntries: [
          'SQL injection payloads',
          'XSS payloads',
          'Boundary values',
          'Unicode edge cases',
        ],
        timeout: 28800,
        expectedCrashTypes: ['stack_buffer_overflow', 'integer_overflow'],
        coverageGoal: '90%+ endpoint coverage',
        commands: [
          `restler compile --api_spec openapi.json`,
          `restler fuzz --grammar_file grammar.py --dictionary dictionary.json --time_budget 8`,
        ],
      },
      command_line: {
        name: `Fuzz ${targetName} CLI arguments`,
        targetType: 'command_line',
        fuzzer: 'AFL++',
        mutationStrategy: 'Argv mutation + stdin fuzzing',
        seedCorpus: ['Valid argument combinations', 'Help output arguments', 'Long strings'],
        dictionaryEntries: ['--', '-', 'A' * 1000, '%s' * 100, '../../..'],
        timeout: 43200,
        expectedCrashTypes: ['stack_buffer_overflow', 'format_string', 'integer_overflow'],
        coverageGoal: '75%+ branch coverage',
        commands: [
          `afl-fuzz -i corpus/ -o findings/ -- ./${targetName} @@`,
          `# Environment variable fuzzing:`,
          `for var in $(strings ./${targetName} | grep -E '^[A-Z_]{3,}$'); do`,
          `  export $var=$(python3 -c "print('A'*10000)")`,
          `  ./${targetName}`,
          `done`,
        ],
      },
      environment: {
        name: `Fuzz ${targetName} environment variables`,
        targetType: 'environment',
        fuzzer: 'Custom + AFL',
        mutationStrategy: 'Environment variable mutation',
        seedCorpus: ['Valid env configurations', 'Empty values', 'Extremely long values'],
        dictionaryEntries: ['PATH injection', 'LD_PRELOAD', 'Long strings (10000+ chars)'],
        timeout: 21600,
        expectedCrashTypes: ['stack_buffer_overflow', 'format_string'],
        coverageGoal: '60%+ path coverage',
        commands: [
          `# Identify env vars read by target:`,
          `ltrace -e getenv ./${targetName} 2>&1 | grep getenv`,
          `# Fuzz each discovered env var`,
        ],
      },
    }

    const strategy = strategies[targetType] ?? strategies.file_format
    return { id: `fuzz-${Date.now()}`, ...strategy }
  }

  // ── Private: Format String ─────────────────────────────────────────────

  private _buildFormatStringAnalysis(
    inputOffset: number,
    targetAddress: string,
  ): FormatStringAnalysis {
    const offset = inputOffset
    const writePayload = this._buildFormatStringWrite(offset, targetAddress, '0x41414141')

    return {
      vulnerable: true,
      readPrimitive: true,
      writePrimitive: true,
      offsetToTarget: offset,
      stackLeaks: [
        `%${offset}$p  — leak the value at stack offset ${offset}`,
        `%${offset}$s  — read string at address on stack at offset ${offset}`,
        '%p.%p.%p.%p.%p.%p.%p.%p  — dump first 8 stack values',
      ],
      writePayload,
      explanation: [
        '== Format String Exploitation ==',
        '',
        '1. LEAK: Use %p or %lx to read stack values',
        '   Payload: ' + '%p.'.repeat(20),
        `   Find your input at offset ${offset} from format string`,
        '',
        '2. READ: Use %s to dereference and read memory at an address',
        `   Place target address at stack offset ${offset}`,
        `   Payload: <addr>%${offset}$s`,
        '',
        '3. WRITE: Use %n to write number of printed characters to address',
        `   %n writes 4 bytes, %hn writes 2 bytes, %hhn writes 1 byte`,
        `   Use %hhn for precise byte-by-byte writes (avoids printing millions of chars)`,
        '',
        '4. TARGETS: GOT entry, return address, or __malloc_hook',
      ],
      debugSteps: [
        {
          tool: 'gdb',
          command: `run < <(python3 -c "print('%p.'*30)")`,
          description: 'Leak stack values to find offset',
          expected: 'Hex values from the stack',
        },
        {
          tool: 'gdb',
          command: `run < <(python3 -c "print('AAAA' + '%p.'*30)")`,
          description: 'Find AAAA (0x41414141) in output to confirm offset',
          expected: '0x41414141 at specific position',
        },
        {
          tool: 'gdb',
          command: `run < <(python3 -c "import struct; print(struct.pack('<Q', ${targetAddress}) + b'%${offset}\\$s')")`,
          description: 'Read memory at target address',
          expected: 'String data at target address',
        },
      ],
    }
  }

  private _buildFormatStringWrite(offset: number, targetAddr: string, value: string): string {
    return [
      `# Format string write: write ${value} to ${targetAddr}`,
      `# Using %hhn for byte-by-byte write (most reliable)`,
      ``,
      `# Python payload generator:`,
      `import struct`,
      `target = ${targetAddr}`,
      ``,
      `# Write each byte separately using %hhn`,
      `payload  = struct.pack('<Q', target)     # byte 0`,
      `payload += struct.pack('<Q', target + 1) # byte 1`,
      `payload += struct.pack('<Q', target + 2) # byte 2`,
      `payload += struct.pack('<Q', target + 3) # byte 3`,
      ``,
      `# Calculate padding for each %hhn write`,
      `# written = current_count % 256 should equal target byte`,
      `payload += f'%{offset}$hhn%{offset+1}$hhn%{offset+2}$hhn%{offset+3}$hhn'`,
    ].join('\n')
  }

  // ── Private: Knowledge Base ────────────────────────────────────────────

  private _buildKnowledgeBase(): void {
    this._buildOverflowPatterns()
    this._buildGadgetDB()
  }

  private _buildOverflowPatterns(): void {
    const add = (p: OverflowPattern) => this.overflowPatterns.set(p.id, p)

    add({
      id: 'pat-strcpy-bof',
      name: 'strcpy Stack Buffer Overflow',
      type: 'stack_buffer_overflow',
      description: 'Classic stack buffer overflow via strcpy() without size check',
      codePattern: 'char buf[SIZE]; strcpy(buf, user_input);',
      languages: ['c', 'c++'],
      indicators: ['strcpy', 'strcat', 'gets', 'sprintf'],
      exploitation: 'Overwrite return address → ROP chain or shellcode',
      difficulty: 'beginner',
      references: ['CWE-121', 'CWE-120'],
    })
    add({
      id: 'pat-memcpy-heap',
      name: 'memcpy Heap Overflow',
      type: 'heap_buffer_overflow',
      description: 'Heap overflow via memcpy with user-controlled size',
      codePattern: 'void *buf = malloc(fixed_size); memcpy(buf, data, user_size);',
      languages: ['c', 'c++'],
      indicators: ['malloc+memcpy', 'realloc+memcpy', 'calloc+memmove'],
      exploitation: 'Corrupt adjacent heap metadata → arbitrary write',
      difficulty: 'intermediate',
      references: ['CWE-122'],
    })
    add({
      id: 'pat-int-alloc',
      name: 'Integer Overflow in Allocation',
      type: 'integer_overflow',
      description: 'Integer overflow in size calculation leads to small allocation',
      codePattern: 'size_t total = count * sizeof(elem); buf = malloc(total);',
      languages: ['c', 'c++'],
      indicators: ['multiplication without overflow check', 'size_t wraparound'],
      exploitation: 'Small allocation → heap overflow when filling buffer',
      difficulty: 'intermediate',
      references: ['CWE-190'],
    })
    add({
      id: 'pat-fmt-str',
      name: 'Format String Attack',
      type: 'format_string',
      description: 'User input passed as format string to printf-family',
      codePattern: 'printf(user_input); // instead of printf("%s", user_input)',
      languages: ['c', 'c++'],
      indicators: ['printf(var)', 'fprintf(fp, var)', 'snprintf(buf, sz, var)'],
      exploitation: 'Read stack with %p, write with %n, target GOT/ret addr',
      difficulty: 'intermediate',
      references: ['CWE-134'],
    })
    add({
      id: 'pat-uaf-vtable',
      name: 'Use-After-Free vtable Hijack',
      type: 'use_after_free',
      description: 'C++ object freed then accessed through stale pointer, vtable overwritten',
      codePattern: 'delete obj; /* ... */ obj->virtualMethod();',
      languages: ['c++'],
      indicators: ['delete + later use', 'free + later deref', 'weak_ptr misuse'],
      exploitation: 'Reallocate freed memory with fake vtable → code execution',
      difficulty: 'advanced',
      references: ['CWE-416'],
    })
    add({
      id: 'pat-double-free',
      name: 'Double Free Heap Corruption',
      type: 'double_free',
      description: 'Same pointer freed twice, corrupting allocator freelist',
      codePattern: 'free(ptr); /* error path */ free(ptr);',
      languages: ['c', 'c++'],
      indicators: [
        'free in error handler',
        'free in destructor + manual free',
        'conditional free without null check',
      ],
      exploitation: 'Freelist corruption → overlapping allocations → arbitrary write',
      difficulty: 'intermediate',
      references: ['CWE-415'],
    })
    add({
      id: 'pat-off-by-one',
      name: 'Off-by-One Buffer Overflow',
      type: 'off_by_one',
      description: 'Loop writes one byte past end of buffer, corrupting adjacent data',
      codePattern: 'for(i=0; i<=sizeof(buf); i++) buf[i] = data[i];',
      languages: ['c', 'c++'],
      indicators: ['<= instead of <', 'strncat without -1', 'fence-post error'],
      exploitation: 'Corrupt LSB of saved frame pointer → redirect execution',
      difficulty: 'advanced',
      references: ['CWE-193'],
    })
    add({
      id: 'pat-off-by-null',
      name: 'Off-by-Null (Null Byte Poison)',
      type: 'off_by_null',
      description: 'Null byte written past end of buffer, corrupting LSB of adjacent pointer',
      codePattern: "buf[sizeof(buf)] = '\\0'; // off by one null",
      languages: ['c', 'c++'],
      indicators: ['null termination past boundary', 'strncat exact-fit'],
      exploitation: 'Corrupt LSB of saved RBP → stack pivot when function returns',
      difficulty: 'expert',
      references: ['CWE-193'],
    })
    add({
      id: 'pat-stack-clash',
      name: 'Stack Clash Memory Collision',
      type: 'stack_clash',
      description: 'Large stack allocation grows past guard page into adjacent memory',
      codePattern: 'void func() { char buf[1024*1024]; /* huge local */ }',
      languages: ['c', 'c++'],
      indicators: ['alloca(large)', 'VLA with user size', 'deep recursion'],
      exploitation: 'Overlap stack with heap/mmap → overwrite heap metadata from stack',
      difficulty: 'expert',
      references: ['CWE-121'],
    })
    add({
      id: 'pat-type-confusion',
      name: 'Type Confusion',
      type: 'type_confusion',
      description: 'Object treated as wrong type, field offsets mismatch',
      codePattern: 'Base *obj = static_cast<Derived*>(untrusted); obj->field;',
      languages: ['c++', 'javascript'],
      indicators: ['static_cast from base', 'reinterpret_cast', 'union misuse'],
      exploitation: 'Access out-of-bounds fields → info leak or code execution',
      difficulty: 'advanced',
      references: ['CWE-843'],
    })
  }

  private _buildGadgetDB(): void {
    // Pre-populate common gadget templates for each arch+objective
    const objectives: ROPObjective[] = [
      'execve_binsh',
      'mprotect_rwx',
      'stack_pivot',
      'write_what_where',
    ]
    const archs: Architecture[] = ['x64', 'x86']

    for (const arch of archs) {
      for (const obj of objectives) {
        const key = `${arch}-${obj}`
        this.gadgetDB.set(key, this._generateGadgets(obj, arch))
      }
    }
  }
}
