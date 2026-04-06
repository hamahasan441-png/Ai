import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Networking & Protocols Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── TCP/IP & OSI ───────────────────────────────────────────────────────
  describe('TCP/IP & OSI Model', () => {
    it('explains TCP/IP protocol stack and OSI model', async () => {
      const r = await brain.chat('How does the TCP IP protocol stack OSI model with network layers work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/tcp|ip|osi|layer|protocol|network|transport/)
    })

    it('covers TCP and UDP transport protocols', async () => {
      const r = await brain.chat('What is the difference between transport layer TCP UDP protocol connection types?')
      expect(r.text.toLowerCase()).toMatch(/tcp|udp|transport|connection|handshake|reliable|protocol/)
    })
  })

  // ── Application Protocols ──────────────────────────────────────────────
  describe('Application Protocols', () => {
    it('explains DNS resolution and HTTP/HTTPS', async () => {
      const r = await brain.chat('How do DNS domain name system resolution and HTTP HTTPS TLS protocols work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dns|http|https|tls|resolution|record|protocol/)
    })

    it('covers WebSocket and real-time protocols', async () => {
      const r = await brain.chat('How do WebSocket server-sent events real-time protocols work for web applications?')
      expect(r.text.toLowerCase()).toMatch(/websocket|server.?sent|real.?time|full.?duplex|event|protocol/)
    })
  })

  // ── Routing & Switching ────────────────────────────────────────────────
  describe('Routing & Switching', () => {
    it('explains BGP and routing protocols', async () => {
      const r = await brain.chat('How does BGP routing protocol work with autonomous systems and OSPF?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/bgp|ospf|routing|protocol|autonomous|path|network/)
    })

    it('covers VLANs and switching', async () => {
      const r = await brain.chat('How do network switching VLAN and spanning tree bridge protocols work?')
      expect(r.text.toLowerCase()).toMatch(/vlan|switch|spanning|bridge|trunk|tagging|mac/)
    })
  })

  // ── Network Diagnostics ────────────────────────────────────────────────
  describe('Network Diagnostics', () => {
    it('explains Wireshark and packet capture', async () => {
      const r = await brain.chat('How do network troubleshooting tools like Wireshark tcpdump packet capture work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/wireshark|tcpdump|packet|capture|filter|troubleshoot/)
    })

    it('covers ping traceroute diagnostics', async () => {
      const r = await brain.chat('How do ping traceroute netstat network debugging diagnostic tools work?')
      expect(r.text.toLowerCase()).toMatch(/ping|traceroute|netstat|diagnostic|icmp|debug|network/)
    })
  })

  // ── Network Security ───────────────────────────────────────────────────
  describe('Network Security & VPN', () => {
    it('explains VPN technologies', async () => {
      const r = await brain.chat('How do VPN tunneling IPSec WireGuard OpenVPN technologies work for network security?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/vpn|ipsec|wireguard|openvpn|tunnel|security|encrypt/)
    })

    it('covers zero trust and network security', async () => {
      const r = await brain.chat('What is zero trust network access SASE architecture for modern security?')
      expect(r.text.toLowerCase()).toMatch(/zero\s*trust|sase|network|security|access|micro.?segment/)
    })
  })

  // ── Network Infrastructure ─────────────────────────────────────────────
  describe('Network Infrastructure', () => {
    it('explains load balancers and CDNs', async () => {
      const r = await brain.chat('How do load balancer reverse proxy Nginx HAProxy and CDN content delivery work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/load\s*balancer|nginx|haproxy|cdn|proxy|cache|reverse/)
    })

    it('covers service mesh architecture', async () => {
      const r = await brain.chat('How does service mesh Envoy Istio sidecar proxy architecture work?')
      expect(r.text.toLowerCase()).toMatch(/service\s*mesh|envoy|istio|sidecar|proxy|mtls|traffic/)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────
  describe('Semantic Memory - Networking concepts', () => {
    it('has Networking & Protocols concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Networking & Protocols')
      expect(c).toBeDefined()
      expect(c!.domain).toBe('networking')
    })

    it('has TCP/IP & OSI Model concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('TCP/IP & OSI Model')
      expect(c).toBeDefined()
    })

    it('has Application Protocols concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Application Protocols')
      expect(c).toBeDefined()
    })

    it('has Network Security & VPN concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Network Security & VPN')
      expect(c).toBeDefined()
    })

    it('Networking has many related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Networking & Protocols')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('TCP/IP is related to Routing', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('TCP/IP & OSI Model')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Routing & Switching')
    })
  })
})
