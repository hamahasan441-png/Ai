import { describe, it, expect, beforeEach } from 'vitest';
import {
  PythonBlackHat,
  DEFAULT_PYTHON_BLACKHAT_CONFIG,
} from '../PythonBlackHat';

describe('PythonBlackHat Engine', () => {
  let engine: PythonBlackHat;

  beforeEach(() => {
    engine = new PythonBlackHat();
  });

  // ── Construction & Config ──────────────────────────────────────────────────

  describe('Construction & Configuration', () => {
    it('creates with default config', () => {
      expect(engine).toBeInstanceOf(PythonBlackHat);
    });

    it('creates with custom config', () => {
      const custom = new PythonBlackHat({ maxTools: 50, enableMalware: false });
      expect(custom).toBeInstanceOf(PythonBlackHat);
    });

    it('DEFAULT_PYTHON_BLACKHAT_CONFIG has all domains enabled', () => {
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableExploitDev).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableMalware).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableNetworkAttacks).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableWebExploitation).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableReverseEngineering).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableCryptoAttacks).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableRecon).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enablePrivEsc).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableC2).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableEvasion).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableForensicsEvasion).toBe(true);
      expect(DEFAULT_PYTHON_BLACKHAT_CONFIG.enableSocialEngineering).toBe(true);
    });

    it('initial stats are all zero', () => {
      const stats = engine.getStats();
      expect(stats.totalToolsGenerated).toBe(0);
      expect(stats.totalExploitsCreated).toBe(0);
      expect(stats.totalAttacksCrafted).toBe(0);
      expect(stats.totalReconScans).toBe(0);
      expect(stats.totalMalwareSamples).toBe(0);
      expect(stats.totalEvasionTechniques).toBe(0);
      expect(stats.totalC2Configs).toBe(0);
      expect(stats.totalPrivEscPaths).toBe(0);
      expect(stats.totalLookups).toBe(0);
      expect(stats.feedbackCount).toBe(0);
    });
  });

  // ── Python Libraries ───────────────────────────────────────────────────────

  describe('Python Libraries Knowledge Base', () => {
    it('has extensive library database', () => {
      const libs = engine.getAllLibraries();
      expect(libs.length).toBeGreaterThanOrEqual(20);
    });

    it('finds pwntools by name', () => {
      const lib = engine.findLibrary('pwntools');
      expect(lib).toBeDefined();
      expect(lib!.name).toBe('pwntools');
      expect(lib!.domain).toBe('exploit_dev');
      expect(lib!.keyFeatures.length).toBeGreaterThan(0);
    });

    it('finds scapy by name', () => {
      const lib = engine.findLibrary('scapy');
      expect(lib).toBeDefined();
      expect(lib!.domain).toBe('network_attack');
    });

    it('finds impacket by name', () => {
      const lib = engine.findLibrary('impacket');
      expect(lib).toBeDefined();
      expect(lib!.keyFeatures).toContain('SMB/NTLM authentication');
    });

    it('finds paramiko by name', () => {
      const lib = engine.findLibrary('paramiko');
      expect(lib).toBeDefined();
      expect(lib!.description).toMatch(/SSH/i);
    });

    it('finds angr for reverse engineering', () => {
      const lib = engine.findLibrary('angr');
      expect(lib).toBeDefined();
      expect(lib!.domain).toBe('reverse_engineering');
    });

    it('finds frida for dynamic instrumentation', () => {
      const lib = engine.findLibrary('frida');
      expect(lib).toBeDefined();
      expect(lib!.description).toMatch(/instrumentation/i);
    });

    it('finds mitmproxy', () => {
      const lib = engine.findLibrary('mitmproxy');
      expect(lib).toBeDefined();
      expect(lib!.domain).toBe('network_attack');
    });

    it('finds pycryptodome', () => {
      const lib = engine.findLibrary('pycryptodome');
      expect(lib).toBeDefined();
      expect(lib!.domain).toBe('crypto_attack');
    });

    it('finds volatility3', () => {
      const lib = engine.findLibrary('volatility3');
      expect(lib).toBeDefined();
      expect(lib!.domain).toBe('forensics_evasion');
    });

    it('finds capstone disassembler', () => {
      const lib = engine.findLibrary('capstone');
      expect(lib).toBeDefined();
      expect(lib!.domain).toBe('reverse_engineering');
    });

    it('finds z3-solver', () => {
      const lib = engine.findLibrary('z3-solver');
      expect(lib).toBeDefined();
      expect(lib!.description).toMatch(/SMT|theorem/i);
    });

    it('returns undefined for unknown library', () => {
      expect(engine.findLibrary('nonexistent-lib')).toBeUndefined();
    });

    it('finds libraries by domain - exploit_dev', () => {
      const libs = engine.getLibrariesByDomain('exploit_dev');
      expect(libs.length).toBeGreaterThanOrEqual(2);
      expect(libs.every(l => l.domain === 'exploit_dev')).toBe(true);
    });

    it('finds libraries by domain - network_attack', () => {
      const libs = engine.getLibrariesByDomain('network_attack');
      expect(libs.length).toBeGreaterThanOrEqual(3);
    });

    it('finds libraries by domain - reconnaissance', () => {
      const libs = engine.getLibrariesByDomain('reconnaissance');
      expect(libs.length).toBeGreaterThanOrEqual(2);
    });

    it('finds libraries by domain - web_exploitation', () => {
      const libs = engine.getLibrariesByDomain('web_exploitation');
      expect(libs.length).toBeGreaterThanOrEqual(2);
    });

    it('each library has pip package', () => {
      const libs = engine.getAllLibraries();
      for (const lib of libs) {
        expect(lib.pipPackage.length).toBeGreaterThan(0);
      }
    });

    it('each library has key features', () => {
      const libs = engine.getAllLibraries();
      for (const lib of libs) {
        expect(lib.keyFeatures.length).toBeGreaterThan(0);
      }
    });

    it('each library has common use cases', () => {
      const libs = engine.getAllLibraries();
      for (const lib of libs) {
        expect(lib.commonUseCases.length).toBeGreaterThan(0);
      }
    });

    it('increments lookup stats', () => {
      engine.findLibrary('pwntools');
      engine.findLibrary('scapy');
      engine.getLibrariesByDomain('exploit_dev');
      expect(engine.getStats().totalLookups).toBe(3);
    });
  });

  // ── Exploit Development ────────────────────────────────────────────────────

  describe('Exploit Development Knowledge', () => {
    it('has exploit dev techniques', () => {
      const all = engine.getAllExploitDevTechniques();
      expect(all.length).toBeGreaterThanOrEqual(8);
    });

    it('has buffer overflow techniques', () => {
      const bof = engine.getExploitDevTechnique('buffer_overflow');
      expect(bof.length).toBeGreaterThanOrEqual(1);
      expect(bof[0].libraries).toContain('pwntools');
    });

    it('has ROP chain techniques', () => {
      const rop = engine.getExploitDevTechnique('rop_chain');
      expect(rop.length).toBeGreaterThanOrEqual(1);
      expect(rop[0].description).toMatch(/ROP/i);
    });

    it('has heap exploitation techniques', () => {
      const heap = engine.getExploitDevTechnique('heap_exploit');
      expect(heap.length).toBeGreaterThanOrEqual(1);
      expect(heap[0].description).toMatch(/tcache|heap/i);
    });

    it('has format string techniques', () => {
      const fmt = engine.getExploitDevTechnique('format_string');
      expect(fmt.length).toBeGreaterThanOrEqual(1);
    });

    it('has shellcode generation techniques', () => {
      const sc = engine.getExploitDevTechnique('shellcode');
      expect(sc.length).toBeGreaterThanOrEqual(1);
      expect(sc[0].description).toMatch(/shellcraft|shellcode/i);
    });

    it('has kernel exploit techniques', () => {
      const kernel = engine.getExploitDevTechnique('kernel_exploit');
      expect(kernel.length).toBeGreaterThanOrEqual(1);
    });

    it('has fuzzing techniques', () => {
      const fuzz = engine.getExploitDevTechnique('fuzzing');
      expect(fuzz.length).toBeGreaterThanOrEqual(1);
      expect(fuzz[0].description).toMatch(/fuzz|boofuzz/i);
    });

    it('has race condition techniques', () => {
      const race = engine.getExploitDevTechnique('race_condition');
      expect(race.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by difficulty', () => {
      const adv = engine.getExploitDevByDifficulty('advanced');
      expect(adv.length).toBeGreaterThanOrEqual(1);
      expect(adv.every(t => t.difficulty === 'advanced')).toBe(true);
    });

    it('expert techniques include heap and kernel', () => {
      const expert = engine.getExploitDevByDifficulty('expert');
      expect(expert.length).toBeGreaterThanOrEqual(1);
      const categories = expert.map(t => t.category);
      expect(categories).toContain('heap_exploit');
    });

    it('each technique has python code template', () => {
      const all = engine.getAllExploitDevTechniques();
      for (const t of all) {
        expect(t.pythonCode.length).toBeGreaterThan(10);
      }
    });

    it('each technique has libraries listed', () => {
      const all = engine.getAllExploitDevTechniques();
      for (const t of all) {
        expect(t.libraries.length).toBeGreaterThan(0);
      }
    });

    it('increments exploit stats', () => {
      engine.getExploitDevTechnique('buffer_overflow');
      engine.getExploitDevTechnique('rop_chain');
      expect(engine.getStats().totalExploitsCreated).toBe(2);
    });
  });

  // ── Malware Techniques ─────────────────────────────────────────────────────

  describe('Malware Techniques Knowledge', () => {
    it('has malware technique database', () => {
      const all = engine.getAllMalwareTechniques();
      expect(all.length).toBeGreaterThanOrEqual(10);
    });

    it('has RAT techniques', () => {
      const rats = engine.getMalwareTechnique('rat');
      expect(rats.length).toBeGreaterThanOrEqual(1);
      expect(rats[0].capabilities.length).toBeGreaterThan(3);
    });

    it('has keylogger techniques', () => {
      const kl = engine.getMalwareTechnique('keylogger');
      expect(kl.length).toBeGreaterThanOrEqual(1);
      expect(kl[0].capabilities).toContain('keystroke_capture');
    });

    it('has rootkit techniques', () => {
      const rk = engine.getMalwareTechnique('rootkit');
      expect(rk.length).toBeGreaterThanOrEqual(1);
      expect(rk[0].capabilities).toContain('file_hiding');
    });

    it('has backdoor techniques', () => {
      const bd = engine.getMalwareTechnique('backdoor');
      expect(bd.length).toBeGreaterThanOrEqual(1);
      expect(bd[0].description).toMatch(/encrypt/i);
    });

    it('has ransomware simulator', () => {
      const rs = engine.getMalwareTechnique('ransomware_sim');
      expect(rs.length).toBeGreaterThanOrEqual(1);
    });

    it('has worm techniques', () => {
      const worm = engine.getMalwareTechnique('worm');
      expect(worm.length).toBeGreaterThanOrEqual(1);
      expect(worm[0].capabilities).toContain('self_propagation');
    });

    it('has dropper techniques', () => {
      const drop = engine.getMalwareTechnique('dropper');
      expect(drop.length).toBeGreaterThanOrEqual(1);
    });

    it('has credential stealer', () => {
      const steal = engine.getMalwareTechnique('stealer');
      expect(steal.length).toBeGreaterThanOrEqual(1);
      expect(steal[0].capabilities).toContain('browser_passwords');
    });

    it('has botnet agent', () => {
      const bot = engine.getMalwareTechnique('botnet_agent');
      expect(bot.length).toBeGreaterThanOrEqual(1);
    });

    it('has fileless implant', () => {
      const imp = engine.getMalwareTechnique('implant');
      expect(imp.length).toBeGreaterThanOrEqual(1);
      expect(imp[0].capabilities).toContain('fileless_execution');
    });

    it('all malware has evasion features', () => {
      const all = engine.getAllMalwareTechniques();
      for (const m of all) {
        expect(m.evasionFeatures.length).toBeGreaterThan(0);
      }
    });

    it('all malware has python approach', () => {
      const all = engine.getAllMalwareTechniques();
      for (const m of all) {
        expect(m.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('filters by difficulty', () => {
      const adv = engine.getMalwareByDifficulty('advanced');
      expect(adv.length).toBeGreaterThanOrEqual(3);
      expect(adv.every(m => m.difficulty === 'advanced')).toBe(true);
    });

    it('increments malware stats', () => {
      engine.getMalwareTechnique('rat');
      engine.getMalwareTechnique('keylogger');
      expect(engine.getStats().totalMalwareSamples).toBe(2);
    });
  });

  // ── Network Attacks ────────────────────────────────────────────────────────

  describe('Network Attacks Knowledge', () => {
    it('has network attack database', () => {
      const all = engine.getAllNetworkAttacks();
      expect(all.length).toBeGreaterThanOrEqual(12);
    });

    it('has ARP spoofing', () => {
      const arp = engine.getNetworkAttack('arp_spoof');
      expect(arp.length).toBeGreaterThanOrEqual(1);
      expect(arp[0].libraries).toContain('scapy');
    });

    it('has DNS spoofing', () => {
      const dns = engine.getNetworkAttack('dns_spoof');
      expect(dns.length).toBeGreaterThanOrEqual(1);
    });

    it('has MITM proxy', () => {
      const mitm = engine.getNetworkAttack('mitm');
      expect(mitm.length).toBeGreaterThanOrEqual(1);
      expect(mitm[0].description).toMatch(/MITM|man-in-the-middle/i);
    });

    it('has WiFi deauth attack', () => {
      const wifi = engine.getNetworkAttack('wifi_attack');
      expect(wifi.length).toBeGreaterThanOrEqual(1);
    });

    it('has packet injection', () => {
      const inject = engine.getNetworkAttack('packet_injection');
      expect(inject.length).toBeGreaterThanOrEqual(1);
    });

    it('has SYN flood DoS', () => {
      const dos = engine.getNetworkAttack('dos');
      expect(dos.length).toBeGreaterThanOrEqual(1);
      expect(dos[0].description).toMatch(/SYN|flood/i);
    });

    it('has DHCP attack', () => {
      const dhcp = engine.getNetworkAttack('dhcp_attack');
      expect(dhcp.length).toBeGreaterThanOrEqual(1);
    });

    it('has VLAN hopping', () => {
      const vlan = engine.getNetworkAttack('vlan_hopping');
      expect(vlan.length).toBeGreaterThanOrEqual(1);
    });

    it('has credential sniffing', () => {
      const sniff = engine.getNetworkAttack('sniffing');
      expect(sniff.length).toBeGreaterThanOrEqual(1);
    });

    it('has ICMP tunneling', () => {
      const tunnel = engine.getNetworkAttack('tunnel');
      expect(tunnel.length).toBeGreaterThanOrEqual(1);
    });

    it('has LLMNR poisoning', () => {
      const all = engine.getAllNetworkAttacks();
      const llmnr = all.find(a => a.name.includes('LLMNR'));
      expect(llmnr).toBeDefined();
    });

    it('filters by layer', () => {
      const l2 = engine.getNetworkAttacksByLayer('layer2');
      expect(l2.length).toBeGreaterThanOrEqual(2);
      expect(l2.every(a => a.targetLayer === 'layer2')).toBe(true);
    });

    it('filters by wireless layer', () => {
      const wireless = engine.getNetworkAttacksByLayer('wireless');
      expect(wireless.length).toBeGreaterThanOrEqual(2);
    });

    it('all attacks have python approach', () => {
      const all = engine.getAllNetworkAttacks();
      for (const a of all) {
        expect(a.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('all attacks have libraries', () => {
      const all = engine.getAllNetworkAttacks();
      for (const a of all) {
        expect(a.libraries.length).toBeGreaterThan(0);
      }
    });

    it('increments attack stats', () => {
      engine.getNetworkAttack('arp_spoof');
      engine.getNetworkAttack('dns_spoof');
      expect(engine.getStats().totalAttacksCrafted).toBe(2);
    });
  });

  // ── Web Exploitation ───────────────────────────────────────────────────────

  describe('Web Exploitation Knowledge', () => {
    it('has web exploit database', () => {
      const all = engine.getAllWebExploits();
      expect(all.length).toBeGreaterThanOrEqual(11);
    });

    it('has SQL injection exploits', () => {
      const sqli = engine.getWebExploit('sqli');
      expect(sqli.length).toBeGreaterThanOrEqual(2);
    });

    it('has second-order SQLi', () => {
      const sqli = engine.getWebExploit('sqli');
      const secondOrder = sqli.find(s => s.name.includes('Second-Order'));
      expect(secondOrder).toBeDefined();
    });

    it('has XSS scanner', () => {
      const xss = engine.getWebExploit('xss');
      expect(xss.length).toBeGreaterThanOrEqual(1);
    });

    it('has SSRF chain', () => {
      const ssrf = engine.getWebExploit('ssrf');
      expect(ssrf.length).toBeGreaterThanOrEqual(1);
      expect(ssrf[0].description).toMatch(/cloud|internal|chain/i);
    });

    it('has SSTI techniques', () => {
      const ssti = engine.getWebExploit('ssti');
      expect(ssti.length).toBeGreaterThanOrEqual(1);
      expect(ssti[0].description).toMatch(/Jinja2|template/i);
    });

    it('has LFI/RFI', () => {
      const lfi = engine.getWebExploit('lfi_rfi');
      expect(lfi.length).toBeGreaterThanOrEqual(1);
    });

    it('has deserialization exploits', () => {
      const deser = engine.getWebExploit('deserialization');
      expect(deser.length).toBeGreaterThanOrEqual(1);
      expect(deser[0].description).toMatch(/pickle|yaml|deserializ/i);
    });

    it('has JWT attacks', () => {
      const jwt = engine.getWebExploit('auth_bypass');
      expect(jwt.length).toBeGreaterThanOrEqual(1);
    });

    it('has XXE injection', () => {
      const xxe = engine.getWebExploit('xxe');
      expect(xxe.length).toBeGreaterThanOrEqual(1);
    });

    it('has web shell', () => {
      const ws = engine.getWebExploit('web_shell');
      expect(ws.length).toBeGreaterThanOrEqual(1);
    });

    it('has API abuse', () => {
      const api = engine.getWebExploit('api_abuse');
      expect(api.length).toBeGreaterThanOrEqual(1);
      expect(api[0].description).toMatch(/BOLA|IDOR|API/i);
    });

    it('filters by OWASP category', () => {
      const injection = engine.getWebExploitsByOWASP('Injection');
      expect(injection.length).toBeGreaterThanOrEqual(3);
    });

    it('all web exploits have OWASP mapping', () => {
      const all = engine.getAllWebExploits();
      for (const e of all) {
        expect(e.owaspCategory.length).toBeGreaterThan(0);
      }
    });

    it('all web exploits have python approach', () => {
      const all = engine.getAllWebExploits();
      for (const e of all) {
        expect(e.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('increments attack stats', () => {
      engine.getWebExploit('sqli');
      engine.getWebExploit('xss');
      expect(engine.getStats().totalAttacksCrafted).toBe(2);
    });
  });

  // ── Reconnaissance ─────────────────────────────────────────────────────────

  describe('Reconnaissance Knowledge', () => {
    it('has recon technique database', () => {
      const all = engine.getAllReconTechniques();
      expect(all.length).toBeGreaterThanOrEqual(10);
    });

    it('has port scanning', () => {
      const scan = engine.getReconTechnique('port_scan');
      expect(scan.length).toBeGreaterThanOrEqual(1);
    });

    it('has OSINT gathering', () => {
      const osint = engine.getReconTechnique('osint');
      expect(osint.length).toBeGreaterThanOrEqual(1);
    });

    it('has subdomain enumeration', () => {
      const sub = engine.getReconTechnique('subdomain_enum');
      expect(sub.length).toBeGreaterThanOrEqual(1);
    });

    it('has DNS enumeration', () => {
      const dns = engine.getReconTechnique('dns_enum');
      expect(dns.length).toBeGreaterThanOrEqual(1);
    });

    it('has web fingerprinting', () => {
      const fp = engine.getReconTechnique('web_fingerprint');
      expect(fp.length).toBeGreaterThanOrEqual(1);
    });

    it('has email harvesting', () => {
      const email = engine.getReconTechnique('email_harvest');
      expect(email.length).toBeGreaterThanOrEqual(1);
    });

    it('has vulnerability scanning', () => {
      const vuln = engine.getReconTechnique('vuln_scan');
      expect(vuln.length).toBeGreaterThanOrEqual(1);
    });

    it('has network mapping', () => {
      const map = engine.getReconTechnique('network_map');
      expect(map.length).toBeGreaterThanOrEqual(1);
    });

    it('has service enumeration', () => {
      const svc = engine.getReconTechnique('service_enum');
      expect(svc.length).toBeGreaterThanOrEqual(1);
    });

    it('has social recon', () => {
      const social = engine.getReconTechnique('social_recon');
      expect(social.length).toBeGreaterThanOrEqual(1);
    });

    it('gets passive recon techniques', () => {
      const passive = engine.getPassiveRecon();
      expect(passive.length).toBeGreaterThanOrEqual(2);
      expect(passive.every(r => r.passiveOrActive === 'passive')).toBe(true);
    });

    it('gets active recon techniques', () => {
      const active = engine.getActiveRecon();
      expect(active.length).toBeGreaterThanOrEqual(5);
      expect(active.every(r => r.passiveOrActive === 'active')).toBe(true);
    });

    it('all recon has python approach', () => {
      const all = engine.getAllReconTechniques();
      for (const r of all) {
        expect(r.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('all recon has libraries', () => {
      const all = engine.getAllReconTechniques();
      for (const r of all) {
        expect(r.libraries.length).toBeGreaterThan(0);
      }
    });

    it('increments recon stats', () => {
      engine.getReconTechnique('port_scan');
      engine.getReconTechnique('osint');
      expect(engine.getStats().totalReconScans).toBe(2);
    });
  });

  // ── Privilege Escalation ───────────────────────────────────────────────────

  describe('Privilege Escalation Knowledge', () => {
    it('has privesc path database', () => {
      const all = engine.getAllPrivEscPaths();
      expect(all.length).toBeGreaterThanOrEqual(11);
    });

    it('has SUID exploitation', () => {
      const suid = engine.getPrivEscPath('suid');
      expect(suid.length).toBeGreaterThanOrEqual(1);
      expect(suid[0].platform).toBe('linux');
    });

    it('has sudo misconfiguration', () => {
      const sudo = engine.getPrivEscPath('sudo');
      expect(sudo.length).toBeGreaterThanOrEqual(1);
    });

    it('has kernel exploits', () => {
      const kernel = engine.getPrivEscPath('kernel');
      expect(kernel.length).toBeGreaterThanOrEqual(1);
      expect(kernel[0].description).toMatch(/DirtyPipe|DirtyCow|kernel/i);
    });

    it('has cron job exploitation', () => {
      const cron = engine.getPrivEscPath('cron');
      expect(cron.length).toBeGreaterThanOrEqual(1);
    });

    it('has capabilities abuse', () => {
      const caps = engine.getPrivEscPath('capabilities');
      expect(caps.length).toBeGreaterThanOrEqual(1);
    });

    it('has service exploitation', () => {
      const svc = engine.getPrivEscPath('service');
      expect(svc.length).toBeGreaterThanOrEqual(1);
    });

    it('has Windows registry exploitation', () => {
      const reg = engine.getPrivEscPath('registry');
      expect(reg.length).toBeGreaterThanOrEqual(1);
      expect(reg[0].platform).toBe('windows');
    });

    it('has token manipulation', () => {
      const tok = engine.getPrivEscPath('token');
      expect(tok.length).toBeGreaterThanOrEqual(1);
      expect(tok[0].description).toMatch(/SeImpersonate|Potato|token/i);
    });

    it('has DLL hijacking', () => {
      const dll = engine.getPrivEscPath('dll_hijack');
      expect(dll.length).toBeGreaterThanOrEqual(1);
    });

    it('has PATH hijacking', () => {
      const path = engine.getPrivEscPath('path_hijack');
      expect(path.length).toBeGreaterThanOrEqual(1);
    });

    it('has unquoted service path', () => {
      const usp = engine.getPrivEscPath('unquoted_service');
      expect(usp.length).toBeGreaterThanOrEqual(1);
      expect(usp[0].platform).toBe('windows');
    });

    it('filters by Linux platform', () => {
      const linux = engine.getPrivEscByPlatform('linux');
      expect(linux.length).toBeGreaterThanOrEqual(5);
    });

    it('filters by Windows platform', () => {
      const win = engine.getPrivEscByPlatform('windows');
      expect(win.length).toBeGreaterThanOrEqual(3);
    });

    it('all privesc have python approach', () => {
      const all = engine.getAllPrivEscPaths();
      for (const p of all) {
        expect(p.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('all privesc have success rate', () => {
      const all = engine.getAllPrivEscPaths();
      for (const p of all) {
        expect(p.successRate).toBeGreaterThan(0);
        expect(p.successRate).toBeLessThanOrEqual(1);
      }
    });

    it('increments privesc stats', () => {
      engine.getPrivEscPath('suid');
      engine.getPrivEscPath('sudo');
      expect(engine.getStats().totalPrivEscPaths).toBe(2);
    });
  });

  // ── C2 Frameworks ──────────────────────────────────────────────────────────

  describe('C2 Frameworks Knowledge', () => {
    it('has C2 config database', () => {
      const all = engine.getAllC2Configs();
      expect(all.length).toBeGreaterThanOrEqual(9);
    });

    it('has HTTPS C2', () => {
      const http = engine.getC2Config('https');
      expect(http.length).toBeGreaterThanOrEqual(1);
      expect(http[0].features).toContain('encrypted_comms');
    });

    it('has DNS tunneling C2', () => {
      const dns = engine.getC2Config('dns');
      expect(dns.length).toBeGreaterThanOrEqual(1);
      expect(dns[0].features).toContain('firewall_bypass');
    });

    it('has ICMP covert channel', () => {
      const icmp = engine.getC2Config('icmp');
      expect(icmp.length).toBeGreaterThanOrEqual(1);
    });

    it('has WebSocket C2', () => {
      const ws = engine.getC2Config('websocket');
      expect(ws.length).toBeGreaterThanOrEqual(1);
      expect(ws[0].features).toContain('full_duplex');
    });

    it('has Email C2', () => {
      const smtp = engine.getC2Config('smtp');
      expect(smtp.length).toBeGreaterThanOrEqual(1);
    });

    it('has P2P C2', () => {
      const p2p = engine.getC2Config('p2p');
      expect(p2p.length).toBeGreaterThanOrEqual(1);
      expect(p2p[0].features).toContain('decentralized');
    });

    it('has Cloud API C2', () => {
      const cloud = engine.getC2Config('cloud_api');
      expect(cloud.length).toBeGreaterThanOrEqual(1);
    });

    it('has Social Media C2', () => {
      const social = engine.getC2Config('social_media');
      expect(social.length).toBeGreaterThanOrEqual(1);
      expect(social[0].features).toContain('steganography');
    });

    it('has Custom TCP C2', () => {
      const tcp = engine.getC2Config('custom_tcp');
      expect(tcp.length).toBeGreaterThanOrEqual(1);
    });

    it('gets stealthiest C2 configs', () => {
      const stealth = engine.getStealthiestC2(0.7);
      expect(stealth.length).toBeGreaterThanOrEqual(4);
      expect(stealth[0].stealthRating).toBeGreaterThanOrEqual(stealth[stealth.length - 1].stealthRating);
    });

    it('all C2 configs have python approach', () => {
      const all = engine.getAllC2Configs();
      for (const c of all) {
        expect(c.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('all C2 configs have features', () => {
      const all = engine.getAllC2Configs();
      for (const c of all) {
        expect(c.features.length).toBeGreaterThan(0);
      }
    });

    it('all C2 configs have stealth rating', () => {
      const all = engine.getAllC2Configs();
      for (const c of all) {
        expect(c.stealthRating).toBeGreaterThan(0);
        expect(c.stealthRating).toBeLessThanOrEqual(1);
      }
    });

    it('increments C2 stats', () => {
      engine.getC2Config('https');
      engine.getC2Config('dns');
      expect(engine.getStats().totalC2Configs).toBe(2);
    });
  });

  // ── Evasion Methods ────────────────────────────────────────────────────────

  describe('Evasion Methods Knowledge', () => {
    it('has evasion method database', () => {
      const all = engine.getAllEvasionMethods();
      expect(all.length).toBeGreaterThanOrEqual(10);
    });

    it('has AV bypass', () => {
      const av = engine.getEvasionMethod('av_bypass');
      expect(av.length).toBeGreaterThanOrEqual(1);
    });

    it('has EDR bypass', () => {
      const edr = engine.getEvasionMethod('edr_bypass');
      expect(edr.length).toBeGreaterThanOrEqual(1);
      expect(edr[0].description).toMatch(/EDR|syscall|unhook/i);
    });

    it('has sandbox detection', () => {
      const sb = engine.getEvasionMethod('sandbox_detect');
      expect(sb.length).toBeGreaterThanOrEqual(1);
    });

    it('has AMSI bypass', () => {
      const amsi = engine.getEvasionMethod('amsi_bypass');
      expect(amsi.length).toBeGreaterThanOrEqual(1);
    });

    it('has ETW bypass', () => {
      const etw = engine.getEvasionMethod('etw_bypass');
      expect(etw.length).toBeGreaterThanOrEqual(1);
    });

    it('has code obfuscation', () => {
      const obf = engine.getEvasionMethod('obfuscation');
      expect(obf.length).toBeGreaterThanOrEqual(1);
    });

    it('has executable packing', () => {
      const pack = engine.getEvasionMethod('packing');
      expect(pack.length).toBeGreaterThanOrEqual(1);
    });

    it('has process hollowing', () => {
      const ph = engine.getEvasionMethod('process_hollowing');
      expect(ph.length).toBeGreaterThanOrEqual(1);
    });

    it('has DLL unhooking', () => {
      const uh = engine.getEvasionMethod('unhooking');
      expect(uh.length).toBeGreaterThanOrEqual(1);
    });

    it('has timestomping', () => {
      const ts = engine.getEvasionMethod('timestomping');
      expect(ts.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by defense target', () => {
      const anti_av = engine.getEvasionByDefense('antivirus');
      expect(anti_av.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by EDR defense', () => {
      const anti_edr = engine.getEvasionByDefense('EDR');
      expect(anti_edr.length).toBeGreaterThanOrEqual(1);
    });

    it('gets most effective evasion', () => {
      const effective = engine.getMostEffectiveEvasion(0.6);
      expect(effective.length).toBeGreaterThanOrEqual(5);
      expect(effective[0].effectiveness).toBeGreaterThanOrEqual(effective[effective.length - 1].effectiveness);
    });

    it('all evasion has python approach', () => {
      const all = engine.getAllEvasionMethods();
      for (const e of all) {
        expect(e.pythonApproach.length).toBeGreaterThan(10);
      }
    });

    it('all evasion has effectiveness rating', () => {
      const all = engine.getAllEvasionMethods();
      for (const e of all) {
        expect(e.effectiveness).toBeGreaterThan(0);
        expect(e.effectiveness).toBeLessThanOrEqual(1);
      }
    });

    it('increments evasion stats', () => {
      engine.getEvasionMethod('av_bypass');
      engine.getEvasionMethod('edr_bypass');
      expect(engine.getStats().totalEvasionTechniques).toBe(2);
    });
  });

  // ── Python Tools ───────────────────────────────────────────────────────────

  describe('Python Tools Knowledge', () => {
    it('has tool database', () => {
      const all = engine.getAllTools();
      expect(all.length).toBeGreaterThanOrEqual(12);
    });

    it('has reconnaissance tools', () => {
      const recon = engine.getTool('reconnaissance');
      expect(recon.length).toBeGreaterThanOrEqual(2);
    });

    it('has network attack tools', () => {
      const net = engine.getTool('network_attack');
      expect(net.length).toBeGreaterThanOrEqual(2);
    });

    it('has web exploitation tools', () => {
      const web = engine.getTool('web_exploitation');
      expect(web.length).toBeGreaterThanOrEqual(2);
    });

    it('has malware tools', () => {
      const mal = engine.getTool('malware');
      expect(mal.length).toBeGreaterThanOrEqual(2);
    });

    it('has C2 tools', () => {
      const c2 = engine.getTool('c2_framework');
      expect(c2.length).toBeGreaterThanOrEqual(1);
    });

    it('has evasion tools', () => {
      const ev = engine.getTool('evasion');
      expect(ev.length).toBeGreaterThanOrEqual(1);
    });

    it('has privilege escalation tools', () => {
      const priv = engine.getTool('privilege_escalation');
      expect(priv.length).toBeGreaterThanOrEqual(1);
    });

    it('has crypto attack tools', () => {
      const crypto = engine.getTool('crypto_attack');
      expect(crypto.length).toBeGreaterThanOrEqual(1);
    });

    it('has social engineering tools', () => {
      const social = engine.getTool('social_engineering');
      expect(social.length).toBeGreaterThanOrEqual(1);
    });

    it('has reverse engineering tools', () => {
      const re = engine.getTool('reverse_engineering');
      expect(re.length).toBeGreaterThanOrEqual(1);
    });

    it('has forensics evasion tools', () => {
      const forensics = engine.getTool('forensics_evasion');
      expect(forensics.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by difficulty', () => {
      const beginner = engine.getToolsByDifficulty('beginner');
      expect(beginner.length).toBeGreaterThanOrEqual(2);
      expect(beginner.every(t => t.difficulty === 'beginner')).toBe(true);
    });

    it('filters by OS - Linux', () => {
      const linux = engine.getToolsByOS('linux');
      expect(linux.length).toBeGreaterThanOrEqual(3);
    });

    it('filters by OS - cross_platform', () => {
      const xp = engine.getToolsByOS('cross_platform');
      expect(xp.length).toBeGreaterThanOrEqual(5);
    });

    it('gets stealthiest tools', () => {
      const stealth = engine.getStealthiestTools(0.7);
      expect(stealth.length).toBeGreaterThanOrEqual(3);
      expect(stealth[0].stealthRating).toBeGreaterThanOrEqual(stealth[stealth.length - 1].stealthRating);
    });

    it('all tools have MITRE technique', () => {
      const all = engine.getAllTools();
      for (const t of all) {
        expect(t.mitreTechnique).toMatch(/T\d{4}/);
      }
    });

    it('all tools have python libraries', () => {
      const all = engine.getAllTools();
      for (const t of all) {
        expect(t.pythonLibraries.length).toBeGreaterThan(0);
      }
    });

    it('all tools have code template', () => {
      const all = engine.getAllTools();
      for (const t of all) {
        expect(t.codeTemplate.length).toBeGreaterThan(10);
      }
    });

    it('all tools have detection methods', () => {
      const all = engine.getAllTools();
      for (const t of all) {
        expect(t.detection.length).toBeGreaterThan(0);
      }
    });

    it('all tools have countermeasures', () => {
      const all = engine.getAllTools();
      for (const t of all) {
        expect(t.countermeasures.length).toBeGreaterThan(0);
      }
    });

    it('increments tool stats', () => {
      engine.getTool('reconnaissance');
      engine.getTool('malware');
      expect(engine.getStats().totalToolsGenerated).toBe(2);
    });
  });

  // ── Attack Planning ────────────────────────────────────────────────────────

  describe('Attack Planning', () => {
    it('plans web attack', () => {
      const plan = engine.planAttack('https://example.com', ['web application testing']);
      expect(plan.reconPhase.length).toBeGreaterThan(0);
      expect(plan.exploitPhase.length).toBeGreaterThan(0);
      expect(plan.privEscPhase.length).toBeGreaterThan(0);
      expect(plan.persistPhase.length).toBeGreaterThan(0);
      expect(plan.evasionPhase.length).toBeGreaterThan(0);
      expect(plan.tools.length).toBeGreaterThan(0);
      expect(plan.totalSteps).toBeGreaterThan(0);
    });

    it('plans network attack', () => {
      const plan = engine.planAttack('192.168.1.0/24', ['internal network assessment']);
      expect(plan.reconPhase.length).toBeGreaterThan(0);
      expect(plan.exploitPhase.length).toBeGreaterThan(0);
      expect(plan.totalSteps).toBeGreaterThan(0);
    });

    it('web attack uses web recon techniques', () => {
      const plan = engine.planAttack('https://target.com', ['web']);
      const reconCategories = plan.reconPhase.map(r => r.category);
      expect(reconCategories.some(c => ['web_fingerprint', 'subdomain_enum', 'vuln_scan'].includes(c))).toBe(true);
    });

    it('network attack uses network recon techniques', () => {
      const plan = engine.planAttack('10.0.0.0/24', ['internal network LAN']);
      const reconCategories = plan.reconPhase.map(r => r.category);
      expect(reconCategories.some(c => ['port_scan', 'network_map', 'service_enum'].includes(c))).toBe(true);
    });

    it('plan has estimated difficulty', () => {
      const plan = engine.planAttack('https://example.com', ['web testing']);
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(plan.estimatedDifficulty);
    });

    it('plan includes evasion phase', () => {
      const plan = engine.planAttack('target.com', ['web penetration test']);
      expect(plan.evasionPhase.length).toBeGreaterThan(0);
      expect(plan.evasionPhase[0].effectiveness).toBeGreaterThan(0);
    });

    it('plan includes C2 persistence', () => {
      const plan = engine.planAttack('target.com', ['web']);
      expect(plan.persistPhase.length).toBeGreaterThan(0);
      expect(plan.persistPhase[0].stealthRating).toBeGreaterThan(0);
    });
  });

  // ── Knowledge Search ───────────────────────────────────────────────────────

  describe('Knowledge Search', () => {
    it('searches for ARP', () => {
      const results = engine.searchKnowledge('ARP spoofing');
      expect(results.networkAttacks.length).toBeGreaterThan(0);
    });

    it('searches for SQL injection', () => {
      const results = engine.searchKnowledge('SQL injection');
      expect(results.webExploits.length).toBeGreaterThan(0);
    });

    it('searches for pwntools', () => {
      const results = engine.searchKnowledge('pwntools');
      expect(results.libraries.length).toBeGreaterThan(0);
    });

    it('searches for reverse shell', () => {
      const results = engine.searchKnowledge('reverse shell');
      expect(results.tools.length + results.malware.length).toBeGreaterThan(0);
    });

    it('searches for buffer overflow', () => {
      const results = engine.searchKnowledge('buffer overflow');
      expect(results.exploitDev.length).toBeGreaterThan(0);
    });

    it('searches for DNS', () => {
      const results = engine.searchKnowledge('DNS');
      expect(results.networkAttacks.length + results.c2.length + results.recon.length).toBeGreaterThan(0);
    });

    it('searches for privilege escalation', () => {
      const results = engine.searchKnowledge('privilege escalation SUID');
      expect(results.privEsc.length).toBeGreaterThan(0);
    });

    it('searches for evasion', () => {
      const results = engine.searchKnowledge('sandbox evasion detection');
      expect(results.evasion.length).toBeGreaterThan(0);
    });

    it('searches for keylogger', () => {
      const results = engine.searchKnowledge('keylogger');
      expect(results.malware.length + results.tools.length).toBeGreaterThan(0);
    });

    it('searches for C2', () => {
      const results = engine.searchKnowledge('C2 command control');
      expect(results.c2.length).toBeGreaterThan(0);
    });

    it('increments lookup stats on search', () => {
      engine.searchKnowledge('test query');
      expect(engine.getStats().totalLookups).toBe(1);
    });
  });

  // ── Knowledge Stats ────────────────────────────────────────────────────────

  describe('Knowledge Statistics', () => {
    it('returns knowledge stats', () => {
      const kStats = engine.getKnowledgeStats();
      expect(kStats.totalLibraries).toBeGreaterThanOrEqual(20);
      expect(kStats.totalExploitDev).toBeGreaterThanOrEqual(8);
      expect(kStats.totalMalware).toBeGreaterThanOrEqual(10);
      expect(kStats.totalNetworkAttacks).toBeGreaterThanOrEqual(12);
      expect(kStats.totalWebExploits).toBeGreaterThanOrEqual(11);
      expect(kStats.totalRecon).toBeGreaterThanOrEqual(10);
      expect(kStats.totalPrivEsc).toBeGreaterThanOrEqual(11);
      expect(kStats.totalC2).toBeGreaterThanOrEqual(9);
      expect(kStats.totalEvasion).toBeGreaterThanOrEqual(10);
      expect(kStats.totalTools).toBeGreaterThanOrEqual(12);
    });

    it('totalKnowledgeItems is sum of all categories', () => {
      const kStats = engine.getKnowledgeStats();
      const sum = kStats.totalLibraries + kStats.totalExploitDev + kStats.totalMalware +
        kStats.totalNetworkAttacks + kStats.totalWebExploits + kStats.totalRecon +
        kStats.totalPrivEsc + kStats.totalC2 + kStats.totalEvasion + kStats.totalTools;
      expect(kStats.totalKnowledgeItems).toBe(sum);
    });

    it('total knowledge items exceeds 100', () => {
      const kStats = engine.getKnowledgeStats();
      expect(kStats.totalKnowledgeItems).toBeGreaterThanOrEqual(100);
    });
  });

  // ── Serialization ──────────────────────────────────────────────────────────

  describe('Serialization', () => {
    it('serializes to JSON', () => {
      const json = engine.serialize();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('serialized JSON contains config', () => {
      const json = engine.serialize();
      const data = JSON.parse(json);
      expect(data.config).toBeDefined();
      expect(data.config.maxTools).toBe(200);
    });

    it('serialized JSON contains stats', () => {
      engine.findLibrary('pwntools');
      const json = engine.serialize();
      const data = JSON.parse(json);
      expect(data.stats).toBeDefined();
      expect(data.stats.totalLookups).toBe(1);
    });

    it('deserializes stats', () => {
      const other = new PythonBlackHat();
      other.findLibrary('pwntools');
      other.findLibrary('scapy');
      other.getExploitDevTechnique('buffer_overflow');
      const json = other.serialize();

      engine.deserialize(json);
      expect(engine.getStats().totalLookups).toBe(2);
      expect(engine.getStats().totalExploitsCreated).toBe(1);
    });

    it('provideFeedback increments counter', () => {
      engine.provideFeedback();
      engine.provideFeedback();
      expect(engine.getStats().feedbackCount).toBe(2);
    });
  });

  // ── Data Integrity ─────────────────────────────────────────────────────────

  describe('Data Integrity', () => {
    it('all tools have unique IDs', () => {
      const all = engine.getAllTools();
      const ids = all.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all exploit dev techniques have unique IDs', () => {
      const all = engine.getAllExploitDevTechniques();
      const ids = all.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all malware techniques have unique IDs', () => {
      const all = engine.getAllMalwareTechniques();
      const ids = all.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all network attacks have unique IDs', () => {
      const all = engine.getAllNetworkAttacks();
      const ids = all.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all web exploits have unique IDs', () => {
      const all = engine.getAllWebExploits();
      const ids = all.map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all recon techniques have unique IDs', () => {
      const all = engine.getAllReconTechniques();
      const ids = all.map(r => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all privesc paths have unique IDs', () => {
      const all = engine.getAllPrivEscPaths();
      const ids = all.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all C2 configs have unique IDs', () => {
      const all = engine.getAllC2Configs();
      const ids = all.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all evasion methods have unique IDs', () => {
      const all = engine.getAllEvasionMethods();
      const ids = all.map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all libraries have unique names', () => {
      const all = engine.getAllLibraries();
      const names = all.map(l => l.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });
});
