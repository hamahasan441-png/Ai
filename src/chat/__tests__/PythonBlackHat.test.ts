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
        kStats.totalPrivEsc + kStats.totalC2 + kStats.totalEvasion + kStats.totalTools +
        kStats.totalCryptoAttacks + kStats.totalSocialEngineering +
        kStats.totalForensicsEvasion + kStats.totalReverseEngineering;
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

    it('all crypto attacks have unique IDs', () => {
      const all = engine.getAllCryptoAttacks();
      const ids = all.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all social engineering attacks have unique IDs', () => {
      const all = engine.getAllSocialEngineeringAttacks();
      const ids = all.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all forensics evasion techniques have unique IDs', () => {
      const all = engine.getAllForensicsEvasionTechniques();
      const ids = all.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all reverse engineering techniques have unique IDs', () => {
      const all = engine.getAllReverseEngineeringTechniques();
      const ids = all.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // ── Crypto Attacks Knowledge ─────────────────────────────────────────────

  describe('Crypto Attacks Knowledge', () => {
    it('has comprehensive crypto attack database', () => {
      const all = engine.getAllCryptoAttacks();
      expect(all.length).toBeGreaterThanOrEqual(12);
    });

    it('filters by category hash_cracking', () => {
      const attacks = engine.getCryptoAttack('hash_cracking');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('hash_cracking'));
    });

    it('filters by category cipher_attack', () => {
      const attacks = engine.getCryptoAttack('cipher_attack');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('cipher_attack'));
    });

    it('filters by category password_attack', () => {
      const attacks = engine.getCryptoAttack('password_attack');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('password_attack'));
    });

    it('filters by category key_recovery', () => {
      const attacks = engine.getCryptoAttack('key_recovery');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('key_recovery'));
    });

    it('filters by category protocol_attack', () => {
      const attacks = engine.getCryptoAttack('protocol_attack');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('protocol_attack'));
    });

    it('filters by category side_channel', () => {
      const attacks = engine.getCryptoAttack('side_channel');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('side_channel'));
    });

    it('filters by category certificate_attack', () => {
      const attacks = engine.getCryptoAttack('certificate_attack');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('certificate_attack'));
    });

    it('searches by algorithm AES', () => {
      const results = engine.getCryptoAttacksByAlgorithm('AES');
      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(a => expect(a.targetAlgorithm.toLowerCase()).toContain('aes'));
    });

    it('searches by algorithm RSA', () => {
      const results = engine.getCryptoAttacksByAlgorithm('RSA');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array for unknown algorithm', () => {
      const results = engine.getCryptoAttacksByAlgorithm('NONEXISTENT_ALGO_XYZ');
      expect(results).toEqual([]);
    });

    it('each entry has required fields', () => {
      engine.getAllCryptoAttacks().forEach(a => {
        expect(a.id).toBeTruthy();
        expect(a.name).toBeTruthy();
        expect(a.category).toBeTruthy();
        expect(a.description).toBeTruthy();
        expect(a.pythonApproach).toBeTruthy();
        expect(a.libraries).toBeInstanceOf(Array);
        expect(a.targetAlgorithm).toBeTruthy();
        expect(a.difficulty).toBeTruthy();
      });
    });

    it('all difficulties are valid', () => {
      const valid = ['beginner', 'intermediate', 'advanced', 'expert'];
      engine.getAllCryptoAttacks().forEach(a => {
        expect(valid).toContain(a.difficulty);
      });
    });

    it('covers all eight categories', () => {
      const categories = new Set(engine.getAllCryptoAttacks().map(a => a.category));
      expect(categories.size).toBeGreaterThanOrEqual(8);
    });
  });

  // ── Social Engineering Attacks Knowledge ─────────────────────────────────

  describe('Social Engineering Attacks Knowledge', () => {
    it('has comprehensive social engineering database', () => {
      const all = engine.getAllSocialEngineeringAttacks();
      expect(all.length).toBeGreaterThanOrEqual(12);
    });

    it('filters by category phishing', () => {
      const attacks = engine.getSocialEngineeringAttack('phishing');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('phishing'));
    });

    it('filters by category spear_phishing', () => {
      const attacks = engine.getSocialEngineeringAttack('spear_phishing');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('spear_phishing'));
    });

    it('filters by category vishing', () => {
      const attacks = engine.getSocialEngineeringAttack('vishing');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('vishing'));
    });

    it('filters by category credential_harvest', () => {
      const attacks = engine.getSocialEngineeringAttack('credential_harvest');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('credential_harvest'));
    });

    it('filters by category watering_hole', () => {
      const attacks = engine.getSocialEngineeringAttack('watering_hole');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
      attacks.forEach(a => expect(a.category).toBe('watering_hole'));
    });

    it('filters by success rate with default threshold', () => {
      const results = engine.getSocialEngineeringBySuccessRate();
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by custom success rate threshold', () => {
      const results = engine.getSocialEngineeringBySuccessRate(0.5);
      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(a => expect(a.successRate).toBeGreaterThanOrEqual(0.5));
    });

    it('high threshold returns fewer results', () => {
      const low = engine.getSocialEngineeringBySuccessRate(0.3);
      const high = engine.getSocialEngineeringBySuccessRate(0.9);
      expect(low.length).toBeGreaterThanOrEqual(high.length);
    });

    it('each entry has required fields', () => {
      engine.getAllSocialEngineeringAttacks().forEach(a => {
        expect(a.id).toBeTruthy();
        expect(a.name).toBeTruthy();
        expect(a.category).toBeTruthy();
        expect(a.description).toBeTruthy();
        expect(a.pythonApproach).toBeTruthy();
        expect(a.libraries).toBeInstanceOf(Array);
        expect(a.targetVector).toBeTruthy();
        expect(typeof a.successRate).toBe('number');
        expect(a.difficulty).toBeTruthy();
      });
    });

    it('success rates are between 0 and 1', () => {
      engine.getAllSocialEngineeringAttacks().forEach(a => {
        expect(a.successRate).toBeGreaterThanOrEqual(0);
        expect(a.successRate).toBeLessThanOrEqual(1);
      });
    });

    it('covers all eight categories', () => {
      const categories = new Set(engine.getAllSocialEngineeringAttacks().map(a => a.category));
      expect(categories.size).toBeGreaterThanOrEqual(8);
    });
  });

  // ── Forensics Evasion Knowledge ──────────────────────────────────────────

  describe('Forensics Evasion Knowledge', () => {
    it('has comprehensive forensics evasion database', () => {
      const all = engine.getAllForensicsEvasionTechniques();
      expect(all.length).toBeGreaterThanOrEqual(12);
    });

    it('filters by category log_clearing', () => {
      const techs = engine.getForensicsEvasion('log_clearing');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('log_clearing'));
    });

    it('filters by category timestomping', () => {
      const techs = engine.getForensicsEvasion('timestomping');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('timestomping'));
    });

    it('filters by category artifact_removal', () => {
      const techs = engine.getForensicsEvasion('artifact_removal');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('artifact_removal'));
    });

    it('filters by category steganography', () => {
      const techs = engine.getForensicsEvasion('steganography');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('steganography'));
    });

    it('filters by category memory_wiping', () => {
      const techs = engine.getForensicsEvasion('memory_wiping');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('memory_wiping'));
    });

    it('filters by effectiveness with default threshold', () => {
      const results = engine.getForensicsEvasionByEffectiveness();
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by custom effectiveness threshold', () => {
      const results = engine.getForensicsEvasionByEffectiveness(0.6);
      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(t => expect(t.effectiveness).toBeGreaterThanOrEqual(0.6));
    });

    it('high threshold returns fewer results', () => {
      const low = engine.getForensicsEvasionByEffectiveness(0.3);
      const high = engine.getForensicsEvasionByEffectiveness(0.9);
      expect(low.length).toBeGreaterThanOrEqual(high.length);
    });

    it('each entry has required fields', () => {
      engine.getAllForensicsEvasionTechniques().forEach(t => {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.pythonApproach).toBeTruthy();
        expect(t.libraries).toBeInstanceOf(Array);
        expect(t.targetArtifact).toBeTruthy();
        expect(typeof t.effectiveness).toBe('number');
      });
    });

    it('effectiveness values are between 0 and 1', () => {
      engine.getAllForensicsEvasionTechniques().forEach(t => {
        expect(t.effectiveness).toBeGreaterThanOrEqual(0);
        expect(t.effectiveness).toBeLessThanOrEqual(1);
      });
    });

    it('covers all eight categories', () => {
      const categories = new Set(engine.getAllForensicsEvasionTechniques().map(t => t.category));
      expect(categories.size).toBeGreaterThanOrEqual(8);
    });
  });

  // ── Reverse Engineering Knowledge ────────────────────────────────────────

  describe('Reverse Engineering Knowledge', () => {
    it('has comprehensive reverse engineering database', () => {
      const all = engine.getAllReverseEngineeringTechniques();
      expect(all.length).toBeGreaterThanOrEqual(12);
    });

    it('filters by category static_analysis', () => {
      const techs = engine.getReverseEngineeringTechnique('static_analysis');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('static_analysis'));
    });

    it('filters by category dynamic_analysis', () => {
      const techs = engine.getReverseEngineeringTechnique('dynamic_analysis');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('dynamic_analysis'));
    });

    it('filters by category disassembly', () => {
      const techs = engine.getReverseEngineeringTechnique('disassembly');
      techs.forEach(t => expect(t.category).toBe('disassembly'));
    });

    it('filters by category decompilation', () => {
      const techs = engine.getReverseEngineeringTechnique('decompilation');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('decompilation'));
    });

    it('filters by category anti_reversing', () => {
      const techs = engine.getReverseEngineeringTechnique('anti_reversing');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('anti_reversing'));
    });

    it('filters by category firmware_analysis', () => {
      const techs = engine.getReverseEngineeringTechnique('firmware_analysis');
      expect(techs.length).toBeGreaterThanOrEqual(1);
      techs.forEach(t => expect(t.category).toBe('firmware_analysis'));
    });

    it('filters by difficulty beginner', () => {
      const results = engine.getReverseEngineeringByDifficulty('beginner');
      results.forEach(t => expect(t.difficulty).toBe('beginner'));
    });

    it('filters by difficulty advanced', () => {
      const results = engine.getReverseEngineeringByDifficulty('advanced');
      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(t => expect(t.difficulty).toBe('advanced'));
    });

    it('filters by difficulty expert', () => {
      const results = engine.getReverseEngineeringByDifficulty('expert');
      results.forEach(t => expect(t.difficulty).toBe('expert'));
    });

    it('each entry has required fields', () => {
      engine.getAllReverseEngineeringTechniques().forEach(t => {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.pythonApproach).toBeTruthy();
        expect(t.libraries).toBeInstanceOf(Array);
        expect(t.targetFormat).toBeTruthy();
        expect(t.difficulty).toBeTruthy();
      });
    });

    it('all difficulties are valid', () => {
      const valid = ['beginner', 'intermediate', 'advanced', 'expert'];
      engine.getAllReverseEngineeringTechniques().forEach(t => {
        expect(valid).toContain(t.difficulty);
      });
    });

    it('covers at least nine categories', () => {
      const categories = new Set(engine.getAllReverseEngineeringTechniques().map(t => t.category));
      expect(categories.size).toBeGreaterThanOrEqual(9);
    });
  });

  // ── getTechniqueById ─────────────────────────────────────────────────────

  describe('getTechniqueById', () => {
    it('finds an exploit dev technique by ID', () => {
      const all = engine.getAllExploitDevTechniques();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('finds a crypto attack by ID', () => {
      const all = engine.getAllCryptoAttacks();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('finds a social engineering attack by ID', () => {
      const all = engine.getAllSocialEngineeringAttacks();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('finds a forensics evasion technique by ID', () => {
      const all = engine.getAllForensicsEvasionTechniques();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('finds a reverse engineering technique by ID', () => {
      const all = engine.getAllReverseEngineeringTechniques();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('finds a tool by ID', () => {
      const all = engine.getAllTools();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('finds a C2 config by ID', () => {
      const all = engine.getAllC2Configs();
      const first = all[0];
      const found = engine.getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('returns undefined for nonexistent ID', () => {
      const result = engine.getTechniqueById('nonexistent_id_xyz_999');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const result = engine.getTechniqueById('');
      expect(result).toBeUndefined();
    });
  });

  // ── getDomainSummary ─────────────────────────────────────────────────────

  describe('getDomainSummary', () => {
    it('returns summary for exploit_dev domain', () => {
      const summary = engine.getDomainSummary('exploit_dev');
      expect(summary.domain).toBe('exploit_dev');
      expect(summary.totalTechniques).toBeGreaterThan(0);
      expect(summary.difficultyBreakdown).toBeDefined();
    });

    it('returns summary for crypto_attack domain', () => {
      const summary = engine.getDomainSummary('crypto_attack');
      expect(summary.domain).toBe('crypto_attack');
      expect(summary.totalTechniques).toBeGreaterThan(0);
    });

    it('returns summary for reverse_engineering domain', () => {
      const summary = engine.getDomainSummary('reverse_engineering');
      expect(summary.domain).toBe('reverse_engineering');
      expect(summary.totalTechniques).toBeGreaterThan(0);
    });

    it('returns summary for web_exploitation domain', () => {
      const summary = engine.getDomainSummary('web_exploitation');
      expect(summary.domain).toBe('web_exploitation');
      expect(summary.totalTechniques).toBeGreaterThan(0);
    });

    it('includes libraries array', () => {
      const summary = engine.getDomainSummary('network_attack');
      expect(summary.libraries).toBeInstanceOf(Array);
    });

    it('includes tools array', () => {
      const summary = engine.getDomainSummary('exploit_dev');
      expect(summary.tools).toBeInstanceOf(Array);
    });

    it('difficulty breakdown has all four levels', () => {
      const summary = engine.getDomainSummary('exploit_dev');
      expect(summary.difficultyBreakdown).toHaveProperty('beginner');
      expect(summary.difficultyBreakdown).toHaveProperty('intermediate');
      expect(summary.difficultyBreakdown).toHaveProperty('advanced');
      expect(summary.difficultyBreakdown).toHaveProperty('expert');
    });

    it('difficulty counts are non-negative numbers', () => {
      const summary = engine.getDomainSummary('crypto_attack');
      for (const val of Object.values(summary.difficultyBreakdown)) {
        expect(val).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ── getAttackSurface ─────────────────────────────────────────────────────

  describe('getAttackSurface', () => {
    it('returns web attacks for web targets', () => {
      const surface = engine.getAttackSurface('https://example.com');
      expect(surface.target).toBe('https://example.com');
      expect(surface.webAttacks.length).toBeGreaterThan(0);
    });

    it('returns network attacks for internal targets', () => {
      const surface = engine.getAttackSurface('192.168.1.100');
      expect(surface.networkAttacks.length).toBeGreaterThan(0);
    });

    it('includes social attacks', () => {
      const surface = engine.getAttackSurface('https://target.com');
      expect(surface.socialAttacks).toBeInstanceOf(Array);
      expect(surface.socialAttacks.length).toBeGreaterThan(0);
    });

    it('includes crypto attacks', () => {
      const surface = engine.getAttackSurface('https://target.com');
      expect(surface.cryptoAttacks).toBeInstanceOf(Array);
      expect(surface.cryptoAttacks.length).toBeGreaterThan(0);
    });

    it('includes applicable privesc paths', () => {
      const surface = engine.getAttackSurface('192.168.1.1');
      expect(surface.applicablePrivEsc).toBeInstanceOf(Array);
      expect(surface.applicablePrivEsc.length).toBeGreaterThan(0);
    });

    it('includes recommended recon', () => {
      const surface = engine.getAttackSurface('https://target.com');
      expect(surface.recommendedRecon).toBeInstanceOf(Array);
      expect(surface.recommendedRecon.length).toBeGreaterThan(0);
    });

    it('totalVectors is sum of attack arrays', () => {
      const surface = engine.getAttackSurface('https://target.com');
      const expected = surface.webAttacks.length + surface.networkAttacks.length +
        surface.socialAttacks.length + surface.cryptoAttacks.length;
      expect(surface.totalVectors).toBe(expected);
    });

    it('returns different results for web vs internal targets', () => {
      const web = engine.getAttackSurface('https://example.com');
      const internal = engine.getAttackSurface('192.168.1.100');
      expect(web.webAttacks.length).toBeGreaterThanOrEqual(internal.webAttacks.length);
    });
  });

  // ── getAttackDomains ─────────────────────────────────────────────────────

  describe('getAttackDomains', () => {
    it('returns all 12 domains', () => {
      const domains = engine.getAttackDomains();
      expect(domains.length).toBe(12);
    });

    it('each domain has required fields', () => {
      engine.getAttackDomains().forEach(d => {
        expect(d.domain).toBeTruthy();
        expect(typeof d.count).toBe('number');
        expect(typeof d.enabled).toBe('boolean');
      });
    });

    it('all domains are enabled by default', () => {
      engine.getAttackDomains().forEach(d => {
        expect(d.enabled).toBe(true);
      });
    });

    it('each domain has a positive count', () => {
      engine.getAttackDomains().forEach(d => {
        expect(d.count).toBeGreaterThan(0);
      });
    });

    it('includes crypto_attack domain', () => {
      const domains = engine.getAttackDomains();
      const crypto = domains.find(d => d.domain === 'crypto_attack');
      expect(crypto).toBeDefined();
      expect(crypto!.count).toBeGreaterThanOrEqual(12);
    });

    it('includes social_engineering domain', () => {
      const domains = engine.getAttackDomains();
      const social = domains.find(d => d.domain === 'social_engineering');
      expect(social).toBeDefined();
      expect(social!.count).toBeGreaterThanOrEqual(12);
    });

    it('includes forensics_evasion domain', () => {
      const domains = engine.getAttackDomains();
      const forensics = domains.find(d => d.domain === 'forensics_evasion');
      expect(forensics).toBeDefined();
      expect(forensics!.count).toBeGreaterThanOrEqual(12);
    });

    it('includes reverse_engineering domain', () => {
      const domains = engine.getAttackDomains();
      const re = domains.find(d => d.domain === 'reverse_engineering');
      expect(re).toBeDefined();
      expect(re!.count).toBeGreaterThanOrEqual(12);
    });
  });

  // ── getByDifficulty ──────────────────────────────────────────────────────

  describe('getByDifficulty', () => {
    it('returns object with all expected keys', () => {
      const result = engine.getByDifficulty('beginner');
      expect(result).toHaveProperty('exploitDev');
      expect(result).toHaveProperty('malware');
      expect(result).toHaveProperty('networkAttacks');
      expect(result).toHaveProperty('webExploits');
      expect(result).toHaveProperty('recon');
      expect(result).toHaveProperty('cryptoAttacks');
      expect(result).toHaveProperty('reverseEngineering');
      expect(result).toHaveProperty('socialEngineering');
      expect(result).toHaveProperty('tools');
    });

    it('all returned items match requested difficulty', () => {
      const result = engine.getByDifficulty('advanced');
      result.exploitDev.forEach(t => expect(t.difficulty).toBe('advanced'));
      result.cryptoAttacks.forEach(t => expect(t.difficulty).toBe('advanced'));
      result.reverseEngineering.forEach(t => expect(t.difficulty).toBe('advanced'));
      result.socialEngineering.forEach(t => expect(t.difficulty).toBe('advanced'));
      result.tools.forEach(t => expect(t.difficulty).toBe('advanced'));
    });

    it('intermediate difficulty returns results', () => {
      const result = engine.getByDifficulty('intermediate');
      const total = result.exploitDev.length + result.malware.length + result.networkAttacks.length +
        result.webExploits.length + result.recon.length + result.cryptoAttacks.length +
        result.reverseEngineering.length + result.socialEngineering.length + result.tools.length;
      expect(total).toBeGreaterThan(0);
    });

    it('expert difficulty returns results', () => {
      const result = engine.getByDifficulty('expert');
      const total = result.exploitDev.length + result.malware.length + result.networkAttacks.length +
        result.webExploits.length + result.recon.length + result.cryptoAttacks.length +
        result.reverseEngineering.length + result.socialEngineering.length + result.tools.length;
      expect(total).toBeGreaterThan(0);
    });

    it('includes new domain arrays (crypto, RE, social)', () => {
      const result = engine.getByDifficulty('intermediate');
      expect(result.cryptoAttacks).toBeInstanceOf(Array);
      expect(result.reverseEngineering).toBeInstanceOf(Array);
      expect(result.socialEngineering).toBeInstanceOf(Array);
    });

    it('all arrays contain correct types', () => {
      const result = engine.getByDifficulty('beginner');
      result.cryptoAttacks.forEach(a => {
        expect(a.id).toBeTruthy();
        expect(a.targetAlgorithm).toBeTruthy();
      });
      result.reverseEngineering.forEach(t => {
        expect(t.id).toBeTruthy();
        expect(t.targetFormat).toBeTruthy();
      });
    });

    it('sum across difficulties equals totals', () => {
      const b = engine.getByDifficulty('beginner');
      const i = engine.getByDifficulty('intermediate');
      const a = engine.getByDifficulty('advanced');
      const e = engine.getByDifficulty('expert');
      const totalCrypto = b.cryptoAttacks.length + i.cryptoAttacks.length +
        a.cryptoAttacks.length + e.cryptoAttacks.length;
      expect(totalCrypto).toBe(engine.getAllCryptoAttacks().length);
    });

    it('sum across difficulties for RE equals total', () => {
      const b = engine.getByDifficulty('beginner');
      const i = engine.getByDifficulty('intermediate');
      const a = engine.getByDifficulty('advanced');
      const e = engine.getByDifficulty('expert');
      const totalRE = b.reverseEngineering.length + i.reverseEngineering.length +
        a.reverseEngineering.length + e.reverseEngineering.length;
      expect(totalRE).toBe(engine.getAllReverseEngineeringTechniques().length);
    });
  });

  // ── getAllRequiredLibraries & generateRequirementsTxt ─────────────────────

  describe('getAllRequiredLibraries & generateRequirementsTxt', () => {
    it('returns libraries for all domains when no domain specified', () => {
      const libs = engine.getAllRequiredLibraries();
      expect(libs.length).toBeGreaterThan(0);
      expect(libs).toBeInstanceOf(Array);
    });

    it('returns libraries sorted alphabetically', () => {
      const libs = engine.getAllRequiredLibraries();
      const sorted = [...libs].sort();
      expect(libs).toEqual(sorted);
    });

    it('returns libraries for specific domain', () => {
      const libs = engine.getAllRequiredLibraries('crypto_attack');
      expect(libs.length).toBeGreaterThan(0);
    });

    it('returns libraries for forensics_evasion', () => {
      const libs = engine.getAllRequiredLibraries('forensics_evasion');
      expect(libs.length).toBeGreaterThan(0);
    });

    it('returns libraries for reverse_engineering', () => {
      const libs = engine.getAllRequiredLibraries('reverse_engineering');
      expect(libs.length).toBeGreaterThan(0);
    });

    it('returns libraries for social_engineering', () => {
      const libs = engine.getAllRequiredLibraries('social_engineering');
      expect(libs.length).toBeGreaterThan(0);
    });

    it('domain-specific is subset of all libraries', () => {
      const all = engine.getAllRequiredLibraries();
      const crypto = engine.getAllRequiredLibraries('crypto_attack');
      crypto.forEach(lib => expect(all).toContain(lib));
    });

    it('generateRequirementsTxt returns valid string', () => {
      const txt = engine.generateRequirementsTxt();
      expect(txt).toContain('# Python BlackHat Engine');
      expect(txt).toContain('>=');
    });

    it('generateRequirementsTxt with specific domains', () => {
      const txt = engine.generateRequirementsTxt(['crypto_attack', 'reverse_engineering']);
      expect(txt).toContain('crypto_attack');
      expect(txt).toContain('reverse_engineering');
    });

    it('generateRequirementsTxt contains version pins', () => {
      const txt = engine.generateRequirementsTxt();
      const lines = txt.split('\n').filter(l => !l.startsWith('#') && l.trim() !== '');
      lines.forEach(line => expect(line).toMatch(/>=/));
    });

    it('no duplicate packages in requirements', () => {
      const txt = engine.generateRequirementsTxt();
      const lines = txt.split('\n').filter(l => !l.startsWith('#') && l.trim() !== '');
      expect(new Set(lines).size).toBe(lines.length);
    });
  });

  // ── getMitreMapping ──────────────────────────────────────────────────────

  describe('getMitreMapping', () => {
    it('returns non-empty mapping array', () => {
      const mapping = engine.getMitreMapping();
      expect(mapping.length).toBeGreaterThan(0);
    });

    it('each entry has technique and tools', () => {
      engine.getMitreMapping().forEach(entry => {
        expect(entry.technique).toBeTruthy();
        expect(entry.tools).toBeInstanceOf(Array);
        expect(entry.tools.length).toBeGreaterThan(0);
      });
    });

    it('each tool in mapping has required fields', () => {
      engine.getMitreMapping().forEach(entry => {
        entry.tools.forEach(tool => {
          expect(tool.id).toBeTruthy();
          expect(tool.name).toBeTruthy();
          expect(tool.mitreTechnique).toBe(entry.technique);
        });
      });
    });

    it('all tools are accounted for in mapping', () => {
      const mapping = engine.getMitreMapping();
      const totalToolsInMapping = mapping.reduce((sum, entry) => sum + entry.tools.length, 0);
      expect(totalToolsInMapping).toBe(engine.getAllTools().length);
    });

    it('technique strings follow MITRE format', () => {
      engine.getMitreMapping().forEach(entry => {
        expect(entry.technique).toMatch(/^T\d{4}/);
      });
    });

    it('no duplicate technique keys', () => {
      const mapping = engine.getMitreMapping();
      const techniques = mapping.map(m => m.technique);
      expect(new Set(techniques).size).toBe(techniques.length);
    });

    it('tools grouped correctly under their technique', () => {
      const mapping = engine.getMitreMapping();
      mapping.forEach(entry => {
        entry.tools.forEach(tool => {
          expect(tool.mitreTechnique).toBe(entry.technique);
        });
      });
    });

    it('covers multiple MITRE techniques', () => {
      const mapping = engine.getMitreMapping();
      expect(mapping.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ── getLibraryDependencyGraph ────────────────────────────────────────────

  describe('getLibraryDependencyGraph', () => {
    it('returns graph for all libraries', () => {
      const graph = engine.getLibraryDependencyGraph();
      expect(graph.length).toBe(engine.getAllLibraries().length);
    });

    it('each entry has required fields', () => {
      engine.getLibraryDependencyGraph().forEach(entry => {
        expect(entry.library).toBeTruthy();
        expect(entry.dependencies).toBeInstanceOf(Array);
        expect(entry.dependents).toBeInstanceOf(Array);
      });
    });

    it('library names are pip package names', () => {
      const graph = engine.getLibraryDependencyGraph();
      const allLibs = engine.getAllLibraries();
      graph.forEach(entry => {
        const match = allLibs.find(l => l.pipPackage === entry.library);
        expect(match).toBeDefined();
      });
    });

    it('no duplicate library entries', () => {
      const graph = engine.getLibraryDependencyGraph();
      const names = graph.map(g => g.library);
      expect(new Set(names).size).toBe(names.length);
    });

    it('dependencies are strings', () => {
      engine.getLibraryDependencyGraph().forEach(entry => {
        entry.dependencies.forEach(dep => expect(typeof dep).toBe('string'));
      });
    });

    it('dependents are strings', () => {
      engine.getLibraryDependencyGraph().forEach(entry => {
        entry.dependents.forEach(dep => expect(typeof dep).toBe('string'));
      });
    });

    it('dependency relationships are consistent', () => {
      const graph = engine.getLibraryDependencyGraph();
      const graphMap = new Map(graph.map(g => [g.library, g]));
      graph.forEach(entry => {
        entry.dependents.forEach(dependent => {
          const depEntry = graphMap.get(dependent);
          if (depEntry) {
            expect(depEntry.dependencies).toContain(entry.library);
          }
        });
      });
    });

    it('covers libraries from new domains', () => {
      const graph = engine.getLibraryDependencyGraph();
      expect(graph.length).toBeGreaterThanOrEqual(20);
    });
  });

  // ── getToolsByPlatform ───────────────────────────────────────────────────

  describe('getToolsByPlatform', () => {
    it('returns tools for linux platform', () => {
      const result = engine.getToolsByPlatform('linux');
      expect(result.tools.length).toBeGreaterThan(0);
      expect(result.techniques.length).toBeGreaterThan(0);
    });

    it('returns tools for windows platform', () => {
      const result = engine.getToolsByPlatform('windows');
      expect(result.tools.length).toBeGreaterThan(0);
      expect(result.techniques.length).toBeGreaterThan(0);
    });

    it('returns tools for cross_platform', () => {
      const result = engine.getToolsByPlatform('cross_platform');
      expect(result.tools.length).toBeGreaterThan(0);
    });

    it('includes privesc paths', () => {
      const result = engine.getToolsByPlatform('linux');
      expect(result.privEsc).toBeInstanceOf(Array);
      expect(result.privEsc.length).toBeGreaterThan(0);
    });

    it('totalAvailable equals tools + privEsc', () => {
      const result = engine.getToolsByPlatform('linux');
      expect(result.totalAvailable).toBe(result.tools.length + result.privEsc.length);
    });

    it('linux techniques include SUID exploitation', () => {
      const result = engine.getToolsByPlatform('linux');
      expect(result.techniques).toContain('SUID exploitation');
    });

    it('windows techniques include Registry persistence', () => {
      const result = engine.getToolsByPlatform('windows');
      expect(result.techniques).toContain('Registry persistence');
    });

    it('tools match requested platform or cross_platform', () => {
      const result = engine.getToolsByPlatform('linux');
      result.tools.forEach(t => {
        expect(['linux', 'cross_platform']).toContain(t.targetOS);
      });
    });

    it('privEsc paths match requested platform or cross_platform', () => {
      const result = engine.getToolsByPlatform('windows');
      result.privEsc.forEach(p => {
        expect(['windows', 'cross_platform']).toContain(p.platform);
      });
    });
  });

  // ── getEvasionChain ──────────────────────────────────────────────────────

  describe('getEvasionChain', () => {
    it('returns evasion plan for known defenses', () => {
      const chain = engine.getEvasionChain(['av', 'edr']);
      expect(chain.defenses).toEqual(['av', 'edr']);
      expect(chain.evasionPlan.length).toBe(2);
    });

    it('each plan entry has defense, techniques, and forensics', () => {
      const chain = engine.getEvasionChain(['av']);
      chain.evasionPlan.forEach(entry => {
        expect(entry.defense).toBeTruthy();
        expect(entry.techniques).toBeInstanceOf(Array);
        expect(entry.forensics).toBeInstanceOf(Array);
      });
    });

    it('identifies gaps for unknown defenses', () => {
      const chain = engine.getEvasionChain(['completely_unknown_defense_xyz']);
      expect(chain.gaps.length).toBeGreaterThan(0);
      expect(chain.gaps).toContain('completely_unknown_defense_xyz');
    });

    it('overallEffectiveness is a number between 0 and 1', () => {
      const chain = engine.getEvasionChain(['av', 'sandbox']);
      expect(chain.overallEffectiveness).toBeGreaterThanOrEqual(0);
      expect(chain.overallEffectiveness).toBeLessThanOrEqual(1);
    });

    it('returns 0 effectiveness when all defenses are unknown', () => {
      const chain = engine.getEvasionChain(['nonexistent_a', 'nonexistent_b']);
      expect(chain.overallEffectiveness).toBe(0);
      expect(chain.gaps.length).toBe(2);
    });

    it('handles empty array input', () => {
      const chain = engine.getEvasionChain([]);
      expect(chain.defenses).toEqual([]);
      expect(chain.evasionPlan.length).toBe(0);
    });

    it('finds techniques for log-related defenses', () => {
      const chain = engine.getEvasionChain(['log']);
      const entry = chain.evasionPlan[0];
      const hasTechniques = entry.techniques.length > 0 || entry.forensics.length > 0;
      expect(hasTechniques).toBe(true);
    });

    it('matches forensics evasion for timestamp defenses', () => {
      const chain = engine.getEvasionChain(['timestomping']);
      const entry = chain.evasionPlan[0];
      const hasTechniques = entry.techniques.length > 0 || entry.forensics.length > 0;
      expect(hasTechniques).toBe(true);
    });
  });

  // ── assessRisk ───────────────────────────────────────────────────────────

  describe('assessRisk', () => {
    it('returns low risk for minimal attack plan', () => {
      const risk = engine.assessRisk({ phases: [{ phase: 'recon', techniques: ['scan'] }] });
      expect(risk.overallRisk).toBe('low');
    });

    it('returns higher risk for larger attack plans', () => {
      const techniques = Array.from({ length: 20 }, (_, i) => `tech_${i}`);
      const risk = engine.assessRisk({ phases: [{ phase: 'attack', techniques }] });
      expect(['high', 'critical']).toContain(risk.overallRisk);
    });

    it('includes all required fields', () => {
      const risk = engine.assessRisk({ phases: [{ phase: 'recon', techniques: ['scan'] }] });
      expect(['low', 'medium', 'high', 'critical']).toContain(risk.overallRisk);
      expect(typeof risk.detectionProbability).toBe('number');
      expect(typeof risk.noiseLevel).toBe('number');
      expect(typeof risk.timeEstimate).toBe('string');
      expect(risk.recommendations).toBeInstanceOf(Array);
      expect(risk.recommendations.length).toBeGreaterThan(0);
    });

    it('detection probability is between 0 and 1', () => {
      const risk = engine.assessRisk({ phases: [{ phase: 'recon', techniques: ['scan'] }] });
      expect(risk.detectionProbability).toBeGreaterThanOrEqual(0);
      expect(risk.detectionProbability).toBeLessThanOrEqual(1);
    });

    it('noise level is between 0 and 1', () => {
      const risk = engine.assessRisk({ phases: [{ phase: 'recon', techniques: ['a', 'b', 'c'] }] });
      expect(risk.noiseLevel).toBeGreaterThanOrEqual(0);
      expect(risk.noiseLevel).toBeLessThanOrEqual(1);
    });

    it('more phases increases risk', () => {
      const small = engine.assessRisk({ phases: [{ phase: 'p1', techniques: ['t1'] }] });
      const large = engine.assessRisk({
        phases: [
          { phase: 'p1', techniques: ['t1', 't2', 't3', 't4', 't5'] },
          { phase: 'p2', techniques: ['t6', 't7', 't8', 't9', 't10'] },
          { phase: 'p3', techniques: ['t11', 't12', 't13', 't14', 't15'] },
        ],
      });
      expect(large.detectionProbability).toBeGreaterThan(small.detectionProbability);
    });

    it('provides recommendations for noisy plans', () => {
      const techniques = Array.from({ length: 15 }, (_, i) => `tech_${i}`);
      const risk = engine.assessRisk({ phases: [{ phase: 'attack', techniques }] });
      expect(risk.recommendations.length).toBeGreaterThanOrEqual(2);
    });

    it('time estimate scales with techniques', () => {
      const small = engine.assessRisk({ phases: [{ phase: 'p1', techniques: ['t1'] }] });
      expect(small.timeEstimate).toBe('1-3 days');
    });

    it('handles empty phases', () => {
      const risk = engine.assessRisk({ phases: [] });
      expect(risk.overallRisk).toBe('low');
      expect(risk.noiseLevel).toBe(0);
    });
  });

  // ── validateIntegrity ────────────────────────────────────────────────────

  describe('validateIntegrity', () => {
    it('returns valid for default engine', () => {
      const result = engine.validateIntegrity();
      expect(result.valid).toBe(true);
    });

    it('has no duplicate IDs', () => {
      const result = engine.validateIntegrity();
      expect(result.duplicateIds).toEqual([]);
    });

    it('has no empty categories', () => {
      const result = engine.validateIntegrity();
      expect(result.emptyCategories).toEqual([]);
    });

    it('totalEntries matches knowledge stats', () => {
      const integrity = engine.validateIntegrity();
      const stats = engine.getKnowledgeStats();
      const expectedTotal = stats.totalExploitDev + stats.totalMalware + stats.totalNetworkAttacks +
        stats.totalWebExploits + stats.totalRecon + stats.totalPrivEsc + stats.totalC2 +
        stats.totalEvasion + stats.totalCryptoAttacks + stats.totalSocialEngineering +
        stats.totalForensicsEvasion + stats.totalReverseEngineering + stats.totalTools;
      expect(integrity.totalEntries).toBe(expectedTotal);
    });

    it('reports 14 total domains', () => {
      const result = engine.validateIntegrity();
      expect(result.totalDomains).toBe(14);
    });

    it('totalEntries is greater than 200', () => {
      const result = engine.validateIntegrity();
      expect(result.totalEntries).toBeGreaterThan(200);
    });

    it('returns all required fields', () => {
      const result = engine.validateIntegrity();
      expect(typeof result.valid).toBe('boolean');
      expect(result.duplicateIds).toBeInstanceOf(Array);
      expect(result.emptyCategories).toBeInstanceOf(Array);
      expect(typeof result.totalEntries).toBe('number');
      expect(typeof result.totalDomains).toBe('number');
    });

    it('includes new domains in category checks', () => {
      const result = engine.validateIntegrity();
      expect(result.emptyCategories).not.toContain('crypto_attack');
      expect(result.emptyCategories).not.toContain('social_engineering');
      expect(result.emptyCategories).not.toContain('forensics_evasion');
      expect(result.emptyCategories).not.toContain('reverse_engineering');
    });
  });

  // ── getTopToolsByReliability & getTopToolsByStealth ───────────────────────

  describe('getTopToolsByReliability & getTopToolsByStealth', () => {
    it('getTopToolsByReliability returns default 10 tools', () => {
      const tools = engine.getTopToolsByReliability();
      expect(tools.length).toBeLessThanOrEqual(10);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('getTopToolsByReliability returns custom count', () => {
      const tools = engine.getTopToolsByReliability(5);
      expect(tools.length).toBeLessThanOrEqual(5);
    });

    it('getTopToolsByReliability is sorted descending', () => {
      const tools = engine.getTopToolsByReliability();
      for (let i = 1; i < tools.length; i++) {
        expect(tools[i - 1].reliability).toBeGreaterThanOrEqual(tools[i].reliability);
      }
    });

    it('getTopToolsByStealth returns default 10 tools', () => {
      const tools = engine.getTopToolsByStealth();
      expect(tools.length).toBeLessThanOrEqual(10);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('getTopToolsByStealth returns custom count', () => {
      const tools = engine.getTopToolsByStealth(3);
      expect(tools.length).toBeLessThanOrEqual(3);
    });

    it('getTopToolsByStealth is sorted descending', () => {
      const tools = engine.getTopToolsByStealth();
      for (let i = 1; i < tools.length; i++) {
        expect(tools[i - 1].stealthRating).toBeGreaterThanOrEqual(tools[i].stealthRating);
      }
    });

    it('all returned tools have required fields', () => {
      engine.getTopToolsByReliability(5).forEach(t => {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(typeof t.reliability).toBe('number');
        expect(typeof t.stealthRating).toBe('number');
      });
    });

    it('count of 1 returns single tool', () => {
      const tools = engine.getTopToolsByReliability(1);
      expect(tools.length).toBe(1);
    });
  });

  // ── getStealthProfile ────────────────────────────────────────────────────

  describe('getStealthProfile', () => {
    it('returns all required fields', () => {
      const profile = engine.getStealthProfile();
      expect(profile.stealthiestC2).toBeInstanceOf(Array);
      expect(profile.stealthiestEvasion).toBeInstanceOf(Array);
      expect(profile.stealthiestForensics).toBeInstanceOf(Array);
      expect(profile.stealthiestTools).toBeInstanceOf(Array);
      expect(typeof profile.overallStealthScore).toBe('number');
    });

    it('stealthiest C2 configs have high stealth ratings', () => {
      const profile = engine.getStealthProfile();
      profile.stealthiestC2.forEach(c => {
        expect(c.stealthRating).toBeGreaterThanOrEqual(0.75);
      });
    });

    it('stealthiest evasion methods have high effectiveness', () => {
      const profile = engine.getStealthProfile();
      profile.stealthiestEvasion.forEach(e => {
        expect(e.effectiveness).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('stealthiest forensics techniques have high effectiveness', () => {
      const profile = engine.getStealthProfile();
      profile.stealthiestForensics.forEach(f => {
        expect(f.effectiveness).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('overall stealth score is between 0 and 1', () => {
      const profile = engine.getStealthProfile();
      expect(profile.overallStealthScore).toBeGreaterThanOrEqual(0);
      expect(profile.overallStealthScore).toBeLessThanOrEqual(1);
    });

    it('returns at most 3 items per category', () => {
      const profile = engine.getStealthProfile();
      expect(profile.stealthiestC2.length).toBeLessThanOrEqual(3);
      expect(profile.stealthiestEvasion.length).toBeLessThanOrEqual(3);
      expect(profile.stealthiestForensics.length).toBeLessThanOrEqual(3);
      expect(profile.stealthiestTools.length).toBeLessThanOrEqual(3);
    });

    it('stealth score is non-zero for default engine', () => {
      const profile = engine.getStealthProfile();
      expect(profile.overallStealthScore).toBeGreaterThan(0);
    });

    it('tools are sorted by stealth rating', () => {
      const profile = engine.getStealthProfile();
      for (let i = 1; i < profile.stealthiestTools.length; i++) {
        expect(profile.stealthiestTools[i - 1].stealthRating)
          .toBeGreaterThanOrEqual(profile.stealthiestTools[i].stealthRating);
      }
    });
  });

  // ── generateReport ───────────────────────────────────────────────────────

  describe('generateReport', () => {
    it('returns report for web target', () => {
      const report = engine.generateReport('https://target.com');
      expect(report.target).toBe('https://target.com');
      expect(report.timestamp).toBeTruthy();
    });

    it('returns report for network target', () => {
      const report = engine.generateReport('192.168.1.1');
      expect(report.target).toBe('192.168.1.1');
    });

    it('includes all technique counts', () => {
      const report = engine.generateReport('https://target.com');
      expect(report.reconOptions).toBeGreaterThan(0);
      expect(report.exploitOptions).toBeGreaterThan(0);
      expect(report.privEscOptions).toBeGreaterThan(0);
      expect(report.persistenceOptions).toBeGreaterThan(0);
      expect(report.evasionOptions).toBeGreaterThan(0);
      expect(report.cryptoOptions).toBeGreaterThan(0);
      expect(report.socialOptions).toBeGreaterThan(0);
      expect(report.forensicsOptions).toBeGreaterThan(0);
      expect(report.reverseOptions).toBeGreaterThan(0);
    });

    it('totalTechniques is positive', () => {
      const report = engine.generateReport('target');
      expect(report.totalTechniques).toBeGreaterThan(0);
    });

    it('web target gets web penetration approach', () => {
      const report = engine.generateReport('https://target.com');
      expect(report.recommendedApproach).toContain('Web application');
    });

    it('network target gets network penetration approach', () => {
      const report = engine.generateReport('192.168.1.1');
      expect(report.recommendedApproach).toContain('Network penetration');
    });

    it('timestamp is valid ISO string', () => {
      const report = engine.generateReport('target');
      expect(() => new Date(report.timestamp)).not.toThrow();
      expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
    });

    it('crypto options match crypto attack count', () => {
      const report = engine.generateReport('target');
      expect(report.cryptoOptions).toBe(engine.getAllCryptoAttacks().length);
    });

    it('social options match social engineering count', () => {
      const report = engine.generateReport('target');
      expect(report.socialOptions).toBe(engine.getAllSocialEngineeringAttacks().length);
    });

    it('forensics options match forensics evasion count', () => {
      const report = engine.generateReport('target');
      expect(report.forensicsOptions).toBe(engine.getAllForensicsEvasionTechniques().length);
    });

    it('reverse options match reverse engineering count', () => {
      const report = engine.generateReport('target');
      expect(report.reverseOptions).toBe(engine.getAllReverseEngineeringTechniques().length);
    });
  });

  // ── buildKillChain ───────────────────────────────────────────────────────

  describe('buildKillChain', () => {
    it('builds kill chain for web target on linux', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      expect(chain.phases.length).toBeGreaterThanOrEqual(5);
      expect(chain.estimatedTime).toBeTruthy();
      expect(chain.difficulty).toBeTruthy();
    });

    it('builds kill chain for network target on windows', () => {
      const chain = engine.buildKillChain('192.168.1.1', 'windows');
      expect(chain.phases.length).toBeGreaterThanOrEqual(5);
    });

    it('each phase has required fields', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      chain.phases.forEach(phase => {
        expect(phase.phase).toBeTruthy();
        expect(phase.techniques).toBeInstanceOf(Array);
        expect(phase.tools).toBeInstanceOf(Array);
      });
    });

    it('includes Reconnaissance phase', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      const reconPhase = chain.phases.find(p => p.phase === 'Reconnaissance');
      expect(reconPhase).toBeDefined();
      expect(reconPhase!.techniques.length).toBeGreaterThan(0);
    });

    it('includes Weaponization phase', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      const phase = chain.phases.find(p => p.phase === 'Weaponization');
      expect(phase).toBeDefined();
    });

    it('includes Delivery phase', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      const phase = chain.phases.find(p => p.phase === 'Delivery');
      expect(phase).toBeDefined();
    });

    it('includes Exploitation phase', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      const phase = chain.phases.find(p => p.phase === 'Exploitation');
      expect(phase).toBeDefined();
      expect(phase!.techniques.length).toBeGreaterThan(0);
    });

    it('includes Evasion & Cleanup phase', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      const phase = chain.phases.find(p => p.phase === 'Evasion & Cleanup');
      expect(phase).toBeDefined();
    });

    it('difficulty is valid', () => {
      const chain = engine.buildKillChain('https://target.com', 'linux');
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(chain.difficulty);
    });

    it('estimated time is a non-empty string', () => {
      const chain = engine.buildKillChain('target', 'cross_platform');
      expect(chain.estimatedTime.length).toBeGreaterThan(0);
    });
  });

  // ── generatePayload ──────────────────────────────────────────────────────

  describe('generatePayload', () => {
    it('generates reverse_shell payload', () => {
      const payload = engine.generatePayload('reverse_shell', 'linux');
      expect(payload.code).toContain('socket');
      expect(payload.language).toBe('python');
      expect(payload.size).toBeTruthy();
      expect(payload.detection).toBeInstanceOf(Array);
    });

    it('generates bind_shell payload', () => {
      const payload = engine.generatePayload('bind_shell', 'linux');
      expect(payload.code).toContain('bind');
      expect(payload.language).toBe('python');
    });

    it('generates meterpreter payload', () => {
      const payload = engine.generatePayload('meterpreter', 'linux');
      expect(payload.code).toContain('urllib');
      expect(payload.language).toBe('python');
    });

    it('generates web_shell payload', () => {
      const payload = engine.generatePayload('web_shell', 'linux');
      expect(payload.code).toContain('Flask');
      expect(payload.language).toBe('python');
    });

    it('generates dropper payload', () => {
      const payload = engine.generatePayload('dropper', 'linux');
      expect(payload.code).toContain('urllib');
      expect(payload.language).toBe('python');
    });

    it('uses custom lhost and lport', () => {
      const payload = engine.generatePayload('reverse_shell', 'linux', { lhost: '10.10.10.1', lport: 9999 });
      expect(payload.code).toContain('10.10.10.1');
      expect(payload.code).toContain('9999');
    });

    it('encodes payload when encode option is true', () => {
      const payload = engine.generatePayload('reverse_shell', 'linux', { encode: true });
      expect(payload.code).toContain('base64');
      expect(payload.detection).toContain('Base64 encoded payload');
    });

    it('obfuscates payload when obfuscate option is true', () => {
      const payload = engine.generatePayload('reverse_shell', 'linux', { obfuscate: true });
      expect(payload.code).toContain('chr(');
      expect(payload.detection).toContain('chr() obfuscated payload');
    });

    it('windows reverse shell uses cmd.exe', () => {
      const payload = engine.generatePayload('reverse_shell', 'windows');
      expect(payload.code).toContain('cmd.exe');
    });

    it('linux reverse shell uses /bin/sh', () => {
      const payload = engine.generatePayload('reverse_shell', 'linux');
      expect(payload.code).toContain('/bin/sh');
    });

    it('detection array is non-empty', () => {
      const types: Array<'reverse_shell' | 'bind_shell' | 'meterpreter' | 'web_shell' | 'dropper'> =
        ['reverse_shell', 'bind_shell', 'meterpreter', 'web_shell', 'dropper'];
      types.forEach(type => {
        const payload = engine.generatePayload(type, 'linux');
        expect(payload.detection.length).toBeGreaterThan(0);
      });
    });
  });

  // ── Updated Knowledge Stats ──────────────────────────────────────────────

  describe('Updated Knowledge Stats', () => {
    it('includes totalCryptoAttacks', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalCryptoAttacks).toBeGreaterThanOrEqual(12);
    });

    it('includes totalSocialEngineering', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalSocialEngineering).toBeGreaterThanOrEqual(12);
    });

    it('includes totalForensicsEvasion', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalForensicsEvasion).toBeGreaterThanOrEqual(12);
    });

    it('includes totalReverseEngineering', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalReverseEngineering).toBeGreaterThanOrEqual(12);
    });

    it('totalKnowledgeItems includes new domains', () => {
      const stats = engine.getKnowledgeStats();
      const expected = stats.totalLibraries + stats.totalExploitDev + stats.totalMalware +
        stats.totalNetworkAttacks + stats.totalWebExploits + stats.totalRecon +
        stats.totalPrivEsc + stats.totalC2 + stats.totalEvasion + stats.totalTools +
        stats.totalCryptoAttacks + stats.totalSocialEngineering +
        stats.totalForensicsEvasion + stats.totalReverseEngineering;
      expect(stats.totalKnowledgeItems).toBe(expected);
    });

    it('total knowledge items is at least 250', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalKnowledgeItems).toBeGreaterThanOrEqual(250);
    });

    it('all new domain counts are positive', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalCryptoAttacks).toBeGreaterThan(0);
      expect(stats.totalSocialEngineering).toBeGreaterThan(0);
      expect(stats.totalForensicsEvasion).toBeGreaterThan(0);
      expect(stats.totalReverseEngineering).toBeGreaterThan(0);
    });

    it('new domain counts match their getAll methods', () => {
      const stats = engine.getKnowledgeStats();
      expect(stats.totalCryptoAttacks).toBe(engine.getAllCryptoAttacks().length);
      expect(stats.totalSocialEngineering).toBe(engine.getAllSocialEngineeringAttacks().length);
      expect(stats.totalForensicsEvasion).toBe(engine.getAllForensicsEvasionTechniques().length);
      expect(stats.totalReverseEngineering).toBe(engine.getAllReverseEngineeringTechniques().length);
    });
  });

  // ── Updated Knowledge Search ─────────────────────────────────────────────

  describe('Updated Knowledge Search', () => {
    it('search results include cryptoAttacks field', () => {
      const results = engine.searchKnowledge('hash');
      expect(results.cryptoAttacks).toBeInstanceOf(Array);
    });

    it('search results include socialEngineering field', () => {
      const results = engine.searchKnowledge('phishing');
      expect(results.socialEngineering).toBeInstanceOf(Array);
      expect(results.socialEngineering.length).toBeGreaterThan(0);
    });

    it('search results include forensicsEvasion field', () => {
      const results = engine.searchKnowledge('log');
      expect(results.forensicsEvasion).toBeInstanceOf(Array);
    });

    it('search results include reverseEngineering field', () => {
      const results = engine.searchKnowledge('binary');
      expect(results.reverseEngineering).toBeInstanceOf(Array);
    });

    it('crypto search finds crypto attacks', () => {
      const results = engine.searchKnowledge('AES');
      expect(results.cryptoAttacks.length).toBeGreaterThanOrEqual(1);
    });

    it('social engineering search finds results', () => {
      const results = engine.searchKnowledge('credential');
      expect(results.socialEngineering.length).toBeGreaterThanOrEqual(1);
    });

    it('forensics search finds forensics evasion', () => {
      const results = engine.searchKnowledge('artifact');
      expect(results.forensicsEvasion.length).toBeGreaterThanOrEqual(1);
    });

    it('reverse engineering search finds results', () => {
      const results = engine.searchKnowledge('disassembly');
      expect(results.reverseEngineering.length).toBeGreaterThanOrEqual(1);
    });

    it('broad search returns results across new domains', () => {
      const results = engine.searchKnowledge('attack');
      const totalNew = results.cryptoAttacks.length + results.socialEngineering.length +
        results.forensicsEvasion.length + results.reverseEngineering.length;
      expect(totalNew).toBeGreaterThan(0);
    });
  });
});
