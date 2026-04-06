import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Network Security Python Knowledge (Black Hat Python 3)', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Ch.2: Basic Network Tools ─────────────────────────────────────────────

  describe('Python Socket Programming', () => {
    it('explains Python TCP client/server basics', async () => {
      const r = await brain.chat('How do I create a Python TCP client and server with sockets?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/socket|tcp|connect|recv|send|sock_stream/)
    })

    it('describes Python UDP networking', async () => {
      const r = await brain.chat('How does Python UDP client networking work?')
      expect(r.text.toLowerCase()).toMatch(/udp|sock_dgram|sendto|recvfrom/)
    })

    it('explains Python TCP proxy for traffic interception', async () => {
      const r = await brain.chat('How to build a Python TCP proxy for network traffic interception?')
      expect(r.text.toLowerCase()).toMatch(/proxy|intercept|forward|relay|hexdump/)
    })

    it('describes Python netcat replacement', async () => {
      const r = await brain.chat('How to create a netcat replacement in Python with bhnet?')
      expect(r.text.toLowerCase()).toMatch(/netcat|bhnet|shell|socket|listen/)
    })
  })

  // ── Ch.2: SSH ─────────────────────────────────────────────────────────────

  describe('SSH with Paramiko', () => {
    it('explains Python SSH with paramiko', async () => {
      const r = await brain.chat('How to use Python SSH client with paramiko for remote commands?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/paramiko|ssh|exec_command|connect/)
    })

    it('covers SSH tunneling in Python', async () => {
      const r = await brain.chat('How does Python SSH tunneling work with paramiko?')
      expect(r.text.toLowerCase()).toMatch(/ssh|tunnel|paramiko|forward|transport/)
    })
  })

  // ── Ch.3: Sniffing & Scanning ─────────────────────────────────────────────

  describe('Packet Sniffing and Scanning', () => {
    it('explains Python raw socket packet sniffer', async () => {
      const r = await brain.chat('How to build a Python raw socket sniffer for packet capture?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/raw\s*socket|sniff|packet|sock_raw|icmp|ip\s*header/)
    })

    it('describes IP header decoding', async () => {
      const r = await brain.chat('How to decode IP headers with Python raw socket sniffer?')
      expect(r.text.toLowerCase()).toMatch(/ip|header|ctypes|struct|version|protocol/)
    })

    it('explains Python network scanner for host discovery', async () => {
      const r = await brain.chat('How to build a Python network scanner for host discovery?')
      expect(r.text.toLowerCase()).toMatch(/scan|host|subnet|icmp|udp|discover/)
    })

    it('covers Python port scanning', async () => {
      const r = await brain.chat('How to build a Python port scanner with raw sockets?')
      expect(r.text.toLowerCase()).toMatch(/port|scan|connect|thread|socket/)
    })
  })

  // ── Ch.4: Scapy ──────────────────────────────────────────────────────────

  describe('Scapy Packet Crafting', () => {
    it('explains Python Scapy ARP spoofing', async () => {
      const r = await brain.chat('How does Python Scapy ARP spoofing work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/scapy|arp|spoof|poison|mac|mitm/)
    })

    it('describes credential sniffing with Python', async () => {
      const r = await brain.chat('How to capture email credentials with Python packet inspection?')
      expect(r.text.toLowerCase()).toMatch(/credential|sniff|pop3|smtp|password|capture/)
    })

    it('covers image carving from network traffic', async () => {
      const r = await brain.chat('How does Python image carving from network traffic work with OpenCV?')
      expect(r.text.toLowerCase()).toMatch(/image|carv|http|opencv|face|detect/)
    })
  })

  // ── Ch.5: Web Hacking ────────────────────────────────────────────────────

  describe('Web Application Testing', () => {
    it('explains web directory enumeration in Python', async () => {
      const r = await brain.chat('How to do web directory enumeration with Python brute force?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/web|director|enum|brute|wordlist|response/)
    })

    it('describes web content discovery brute forcing', async () => {
      const r = await brain.chat('How does Python web content discovery brute force work?')
      expect(r.text.toLowerCase()).toMatch(/brute|content|discover|wordlist|request|response/)
    })
  })

  // ── Ch.6: Burp Suite ─────────────────────────────────────────────────────

  describe('Burp Suite Extensions', () => {
    it('explains Python Burp Suite extensions', async () => {
      const r = await brain.chat('How to create a Python Burp Suite extension?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/burp|extension|jython|fuzzer|wordlist/)
    })

    it('covers web fuzzing with Python', async () => {
      const r = await brain.chat('How does the Python web fuzzer work with Burp proxy?')
      expect(r.text.toLowerCase()).toMatch(/fuzz|burp|payload|inject|request/)
    })
  })

  // ── Ch.7: C2 Framework ───────────────────────────────────────────────────

  describe('Command and Control', () => {
    it('explains Git-based C2 in Python', async () => {
      const r = await brain.chat('How does a Python git trojan command and control framework work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/git|c2|command|control|trojan|module|config/)
    })

    it('describes GitHub C2 architecture', async () => {
      const r = await brain.chat('How does GitHub command and control work in Python?')
      expect(r.text.toLowerCase()).toMatch(/github|c2|command|control|module|config|repo/)
    })
  })

  // ── Ch.8: Windows Tools ──────────────────────────────────────────────────

  describe('Windows Offensive Tools', () => {
    it('explains Python keylogger implementation', async () => {
      const r = await brain.chat('How to build a Python keylogger for keyboard capture?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/keylog|keyboard|capture|hook|pyhook|keystroke/)
    })

    it('describes Python screenshot capture', async () => {
      const r = await brain.chat('How does Python screenshot capture tool work?')
      expect(r.text.toLowerCase()).toMatch(/screenshot|capture|screen|desktop|window/)
    })

    it('explains sandbox detection in Python', async () => {
      const r = await brain.chat('How does Python sandbox detection and evasion work?')
      expect(r.text.toLowerCase()).toMatch(/sandbox|detect|mouse|timing|process|vm|evas/)
    })

    it('covers virtual machine detection', async () => {
      const r = await brain.chat('How to detect virtual machine environments in Python for sandbox evasion?')
      expect(r.text.toLowerCase()).toMatch(/sandbox|detect|virtual|vm|registry|hardware/)
    })
  })

  // ── Ch.9: Exfiltration ───────────────────────────────────────────────────

  describe('Data Exfiltration', () => {
    it('explains Python credential exfiltration with encryption', async () => {
      const r = await brain.chat('How does Python credential exfiltration with data encryption work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/exfiltrat|credential|encrypt|aes|browser|data/)
    })

    it('describes man-in-the-browser attack in Python', async () => {
      const r = await brain.chat('How does a Python man in the browser attack work?')
      expect(r.text.toLowerCase()).toMatch(/man.in.the.browser|mitb|browser|inject|intercept|credential/)
    })
  })

  // ── Ch.10: Process & File Monitoring ──────────────────────────────────────

  describe('Process and File Monitoring', () => {
    it('explains Python WMI process monitoring', async () => {
      const r = await brain.chat('How to monitor Windows processes with Python WMI process tracking?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/process|monitor|wmi|win32|creation|pid/)
    })

    it('describes file system monitoring in Python', async () => {
      const r = await brain.chat('How does Python file system monitoring work for security?')
      expect(r.text.toLowerCase()).toMatch(/file|monitor|directory|creation|modif|permission/)
    })
  })

  // ── Ch.11: Code Injection ─────────────────────────────────────────────────

  describe('Code Injection', () => {
    it('explains Python code injection into processes', async () => {
      const r = await brain.chat('How does Python code injection into running processes work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/inject|process|ctypes|virtualalloc|memory|write/)
    })

    it('describes DLL injection with Python ctypes', async () => {
      const r = await brain.chat('How to perform DLL injection using Python ctypes?')
      expect(r.text.toLowerCase()).toMatch(/dll|inject|ctypes|loadlibrary|createremotethread|process/)
    })
  })

  // ── Binary Protocol Handling ──────────────────────────────────────────────

  describe('Binary Protocol Handling', () => {
    it('explains Python struct for binary network protocols', async () => {
      const r = await brain.chat('How to use Python struct for binary protocol parsing in network programming?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/struct|pack|unpack|binary|byte|header/)
    })

    it('describes ctypes for network programming', async () => {
      const r = await brain.chat('How to use Python ctypes for network programming with binary data?')
      expect(r.text.toLowerCase()).toMatch(/ctypes|struct|binary|_fields_|buffer|parse/)
    })
  })

  // ── Concurrent Networking ─────────────────────────────────────────────────

  describe('Concurrent Networking', () => {
    it('explains Python threading for network programming', async () => {
      const r = await brain.chat('How to use Python threading for concurrent network programming?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/thread|concurrent|queue|socket|lock|parallel/)
    })

    it('covers select-based I/O multiplexing', async () => {
      const r = await brain.chat('How does concurrent socket programming work in Python with select?')
      expect(r.text.toLowerCase()).toMatch(/thread|select|concurrent|socket|queue|timeout/)
    })
  })

  // ── Overview ──────────────────────────────────────────────────────────────

  describe('Overall Python Security Framework', () => {
    it('gives overview of Python network security testing', async () => {
      const r = await brain.chat('What is the Python network security testing framework overview?')
      expect(r.text.length).toBeGreaterThan(100)
      expect(r.text.toLowerCase()).toMatch(/python|network|security|socket|paramiko|scapy/)
    })

    it('describes penetration testing with Python tools', async () => {
      const r = await brain.chat('What Python tools are used for penetration testing and offensive security?')
      expect(r.text.toLowerCase()).toMatch(/python|penetration|security|tool|socket|exploit|post/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Network Security Python concepts', () => {
    it('has Network Security Python concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Network Security Python')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('network_security_python')
    })

    it('has Python Socket Programming concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Socket Programming')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('network_security_python')
    })

    it('has Python SSH Paramiko concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python SSH Paramiko')
      expect(concept).toBeDefined()
    })

    it('has Python Packet Sniffing concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Packet Sniffing')
      expect(concept).toBeDefined()
    })

    it('has Python Scapy Packet Crafting concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Scapy Packet Crafting')
      expect(concept).toBeDefined()
    })

    it('has Python Web App Testing concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Web App Testing')
      expect(concept).toBeDefined()
    })

    it('has Python C2 Framework concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python C2 Framework')
      expect(concept).toBeDefined()
    })

    it('has Python Post-Exploitation concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Post-Exploitation')
      expect(concept).toBeDefined()
    })

    it('has Python Code Injection concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Code Injection')
      expect(concept).toBeDefined()
    })

    it('has Python Binary Protocol Handling concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Binary Protocol Handling')
      expect(concept).toBeDefined()
    })

    it('Network Security Python has related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Network Security Python')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(10)
    })

    it('Python Socket Programming is related to Network Security Python', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Socket Programming')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Network Security Python')
    })

    it('Python Scapy is related to Packet Sniffing', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Scapy Packet Crafting')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Python Packet Sniffing')
    })

    it('Python Code Injection is related to Post-Exploitation', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Python Code Injection')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Python Post-Exploitation')
    })
  })
})
