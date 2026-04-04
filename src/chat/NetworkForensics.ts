/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🔬  N E T W O R K   F O R E N S I C S                              ║
 * ║                                                                             ║
 * ║   Cybersecurity network forensics intelligence:                              ║
 * ║     capture → analyze → correlate → respond                                  ║
 * ║                                                                             ║
 * ║     • Deep packet inspection with protocol analysis                         ║
 * ║     • Anomaly detection via signature & behavioral analysis                 ║
 * ║     • Threat correlation across network events                              ║
 * ║     • Incident response with automated playbooks                            ║
 * ║     • Network topology mapping and risk scoring                             ║
 * ║     • Forensic report generation with evidence export                       ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface NetworkForensicsConfig {
  maxPackets: number;
  enableAnomalyDetection: boolean;
  enableProtocolAnalysis: boolean;
  enableThreatCorrelation: boolean;
  alertThreshold: number;
  retentionPeriod: number;
  enableIncidentResponse: boolean;
}

export interface NetworkForensicsStats {
  totalAnalyses: number;
  totalPacketsAnalyzed: number;
  totalAnomaliesDetected: number;
  totalIncidentsCreated: number;
  totalProtocolsAnalyzed: number;
  totalAlertsGenerated: number;
  feedbackCount: number;
}

export type AnomalyType =
  | 'port_scan'
  | 'brute_force'
  | 'data_exfiltration'
  | 'dns_tunneling'
  | 'arp_spoofing'
  | 'syn_flood'
  | 'bandwidth_anomaly'
  | 'protocol_violation'
  | 'beaconing'
  | 'lateral_movement'
  | 'command_and_control'
  | 'suspicious_dns'
  | 'unusual_port'
  | 'traffic_spike'
  | 'encrypted_tunnel';

export interface PacketInfo {
  id: string;
  timestamp: number;
  sourceIP: string;
  destIP: string;
  sourcePort: number;
  destPort: number;
  protocol: string;
  size: number;
  flags?: string[];
  payload?: string;
  direction: 'inbound' | 'outbound' | 'internal';
}

export interface NetworkAnomaly {
  id: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  sourceIP?: string;
  destIP?: string;
  timestamp: number;
  confidence: number;
  indicators: string[];
  relatedPackets: string[];
}

export interface ProtocolAnalysis {
  protocol: string;
  version?: string;
  compliance: boolean;
  vulnerabilities: string[];
  recommendations: string[];
  details: Record<string, string>;
}

export interface IncidentTimelineEntry {
  timestamp: number;
  action: string;
  actor: string;
  details: string;
}

export interface PlaybookStep {
  order: number;
  title: string;
  description: string;
  action: string;
  tools?: string[];
  automated: boolean;
}

export interface IncidentPlaybook {
  name: string;
  description: string;
  steps: PlaybookStep[];
  estimatedTime: string;
}

export interface NetworkIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  timestamp: number;
  anomalies: string[];
  affectedHosts: string[];
  timeline: IncidentTimelineEntry[];
  playbook?: IncidentPlaybook;
}

export interface TrafficPattern {
  id: string;
  name: string;
  description: string;
  signature: string;
  frequency: number;
  riskLevel: 'benign' | 'suspicious' | 'malicious';
  category: string;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'router' | 'firewall' | 'switch' | 'iot' | 'unknown';
  ip: string;
  services: string[];
  risk: number;
}

export interface TopologyConnection {
  source: string;
  destination: string;
  protocol: string;
  encrypted: boolean;
  bandwidth?: number;
}

export interface NetworkTopology {
  nodes: TopologyNode[];
  connections: TopologyConnection[];
  segments: string[];
}

export interface ForensicReport {
  id: string;
  timestamp: number;
  title: string;
  findings: string[];
  recommendations: string[];
  evidence: string[];
  riskScore: number;
  incidents: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: NetworkForensicsConfig = {
  maxPackets: 10000,
  enableAnomalyDetection: true,
  enableProtocolAnalysis: true,
  enableThreatCorrelation: true,
  alertThreshold: 0.7,
  retentionPeriod: 30,
  enableIncidentResponse: true,
};

// ── Private Helpers ──────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_.-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function extractSubnet(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  return ip;
}

function isPrivateIP(ip: string): boolean {
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

// ── Traffic Pattern Database ─────────────────────────────────────────────────

function buildTrafficPatternDatabase(): TrafficPattern[] {
  const patterns: TrafficPattern[] = [];
  let counter = 0;

  const add = (
    name: string, description: string, signature: string,
    frequency: number, riskLevel: TrafficPattern['riskLevel'], category: string,
  ) => { patterns.push({ id: `TP-${++counter}`, name, description, signature, frequency, riskLevel, category }); };

  // ── Reconnaissance ──
  add('TCP SYN Scan', 'Sequential SYN packets to multiple ports on a single host',
    'tcp.flags==SYN && unique_dest_ports > 50 && time_window < 60s', 85, 'malicious', 'reconnaissance');
  add('UDP Port Sweep', 'UDP probes across multiple hosts on common ports',
    'udp && unique_dest_hosts > 10 && unique_dest_ports < 5', 60, 'suspicious', 'reconnaissance');
  add('ICMP Ping Sweep', 'ICMP echo requests to sequential IP addresses',
    'icmp.type==8 && sequential_dest_ips && count > 20', 70, 'suspicious', 'reconnaissance');
  add('Service Banner Grab', 'Connection attempts that read service response then disconnect',
    'tcp.flags==SYN,ACK,FIN && payload_size < 100 && connection_duration < 2s', 45, 'suspicious', 'reconnaissance');
  // ── Command & Control ──
  add('DNS Beaconing', 'Periodic DNS queries to the same domain at regular intervals',
    'dns.query && interval_stddev < 5s && unique_domains == 1', 90, 'malicious', 'command_and_control');
  add('HTTP C2 Callback', 'Periodic HTTP POST with encoded payloads to a single host',
    'http.method==POST && interval_regularity > 0.8 && payload_entropy > 7.0', 92, 'malicious', 'command_and_control');
  add('IRC Bot Communication', 'IRC protocol traffic to non-standard ports',
    'irc && dest_port != 6667 && dest_port != 6697', 80, 'malicious', 'command_and_control');
  // ── Data Exfiltration ──
  add('Large Outbound Transfer', 'Unusually large data transfers to external hosts',
    'direction==outbound && total_bytes > 100MB && dest_ip.external', 75, 'suspicious', 'exfiltration');
  add('DNS Tunneling', 'DNS queries with unusually long subdomain labels encoding data',
    'dns.query && avg_subdomain_length > 30 && query_rate > 10/min', 95, 'malicious', 'exfiltration');
  add('Steganographic Transfer', 'Media file transfers with anomalous entropy patterns',
    'http.content_type==image/* && payload_entropy > 7.5 && size_anomaly', 55, 'suspicious', 'exfiltration');
  // ── Lateral Movement & Brute Force ──
  add('SMB Lateral Movement', 'SMB connections between workstations (non-server)',
    'smb && source_type==workstation && dest_type==workstation', 85, 'malicious', 'lateral_movement');
  add('RDP Brute Force', 'Multiple RDP connection attempts with rapid failures',
    'tcp.dest_port==3389 && connection_failures > 10 && time_window < 300s', 88, 'malicious', 'brute_force');
  add('SSH Brute Force', 'Multiple SSH authentication failures from a single source',
    'tcp.dest_port==22 && auth_failures > 5 && time_window < 120s', 87, 'malicious', 'brute_force');
  // ── Protocol Anomaly & Evasion ──
  add('Protocol Mismatch', 'Traffic on well-known ports using non-standard protocols',
    'port_protocol_mismatch && confidence > 0.8', 65, 'suspicious', 'protocol_anomaly');
  add('Encrypted Non-TLS Tunnel', 'High-entropy traffic on non-encrypted protocol ports',
    'payload_entropy > 7.8 && dest_port NOT IN (443,8443,993,995)', 70, 'suspicious', 'evasion');
  // ── DoS ──
  add('SYN Flood', 'Massive SYN packets without completing handshake',
    'tcp.flags==SYN && !tcp.flags==ACK && rate > 1000/s', 95, 'malicious', 'denial_of_service');
  add('DNS Amplification', 'Small DNS queries generating large responses to a spoofed target',
    'dns.response_size / dns.query_size > 10 && unique_sources < 5', 90, 'malicious', 'denial_of_service');
  // ── Benign ──
  add('Normal Web Browsing', 'Standard HTTP/HTTPS traffic to well-known web services',
    'http/https && dest_port IN (80,443) && known_domains', 5, 'benign', 'normal');
  add('NTP Synchronization', 'Standard NTP time synchronization traffic',
    'udp.dest_port==123 && payload_size < 100 && interval > 60s', 2, 'benign', 'normal');

  return patterns;
}

// ── Anomaly Signature Database ───────────────────────────────────────────────

interface AnomalySignature {
  id: string;
  type: AnomalyType;
  name: string;
  description: string;
  severity: NetworkAnomaly['severity'];
  indicators: string[];
  thresholds: Record<string, number>;
}

function buildAnomalySignatures(): AnomalySignature[] {
  const sigs: AnomalySignature[] = [];
  let counter = 0;

  const add = (
    type: AnomalyType, name: string, description: string,
    severity: NetworkAnomaly['severity'], indicators: string[],
    thresholds: Record<string, number>,
  ) => { sigs.push({ id: `SIG-${++counter}`, type, name, description, severity, indicators, thresholds }); };

  add('port_scan', 'Horizontal Port Scan', 'Single source scanning multiple ports on a target host',
    'medium', ['multiple_dest_ports', 'single_source', 'rapid_succession'],
    { minPorts: 20, timeWindowSec: 60, minPackets: 20 });
  add('port_scan', 'Vertical Port Scan', 'Single source scanning the same port across multiple hosts',
    'high', ['single_dest_port', 'multiple_dest_hosts', 'sequential_ips'],
    { minHosts: 10, timeWindowSec: 120, minPackets: 10 });
  add('brute_force', 'SSH Brute Force', 'Repeated SSH connection attempts indicating credential stuffing',
    'high', ['dest_port_22', 'rapid_connections', 'single_source'],
    { minAttempts: 10, timeWindowSec: 120, failureRate: 0.9 });
  add('brute_force', 'RDP Brute Force', 'Repeated RDP authentication attempts from a single source',
    'high', ['dest_port_3389', 'rapid_connections', 'auth_failures'],
    { minAttempts: 8, timeWindowSec: 300, failureRate: 0.85 });
  add('data_exfiltration', 'Large Outbound Data Transfer', 'Anomalously large data volume leaving the network',
    'critical', ['outbound_direction', 'high_volume', 'external_destination'],
    { minBytes: 104857600, timeWindowSec: 3600, bytesPerSecond: 1048576 });
  add('dns_tunneling', 'DNS Tunnel Detected', 'DNS queries with encoded payloads in subdomain labels',
    'critical', ['long_subdomain', 'high_query_rate', 'single_domain'],
    { minSubdomainLen: 30, queriesPerMin: 10, entropyThreshold: 4.5 });
  add('arp_spoofing', 'ARP Spoofing Attempt', 'Multiple ARP replies mapping different IPs to the same MAC',
    'high', ['duplicate_mac', 'gratuitous_arp', 'ip_conflict'],
    { minConflicts: 2, timeWindowSec: 30, minPackets: 5 });
  add('syn_flood', 'SYN Flood Attack', 'Massive TCP SYN packets without completing three-way handshake',
    'critical', ['syn_only', 'no_ack', 'high_rate', 'single_target'],
    { synRate: 1000, timeWindowSec: 10, completionRate: 0.1 });
  add('bandwidth_anomaly', 'Bandwidth Spike', 'Sudden bandwidth utilization increase exceeding baseline',
    'medium', ['traffic_spike', 'baseline_deviation', 'sustained_duration'],
    { deviationMultiplier: 3.0, sustainedSec: 60, minBytesPerSec: 10485760 });
  add('beaconing', 'C2 Beaconing Activity', 'Regular periodic callbacks suggesting C2 communication',
    'critical', ['periodic_interval', 'consistent_size', 'external_destination'],
    { intervalStddevSec: 5, minBeacons: 10, regularityThreshold: 0.85 });
  add('lateral_movement', 'Internal Lateral Movement', 'Unusual connections between internal hosts',
    'high', ['internal_traffic', 'new_connections', 'privileged_ports'],
    { minNewConnections: 5, timeWindowSec: 600, portThreshold: 1024 });
  add('command_and_control', 'IRC C2 Channel', 'IRC traffic to non-standard ports indicating botnet activity',
    'critical', ['irc_protocol', 'non_standard_port', 'encoded_commands'],
    { minMessages: 5, timeWindowSec: 300, entropyThreshold: 6.0 });
  add('suspicious_dns', 'Suspicious DNS Resolution', 'DNS queries to newly registered or DGA domains',
    'medium', ['dga_pattern', 'new_domain', 'high_entropy_domain'],
    { domainEntropy: 3.5, queryCount: 3, uniqueDomains: 5 });
  add('unusual_port', 'Unusual Port Activity', 'Traffic on uncommon ports not matching expected services',
    'low', ['non_standard_port', 'unexpected_protocol', 'low_volume'],
    { portRange: 49152, minPackets: 3, timeWindowSec: 600 });
  add('encrypted_tunnel', 'Encrypted Tunnel on Non-TLS Port', 'High-entropy traffic on non-encrypted ports',
    'medium', ['high_entropy', 'non_tls_port', 'sustained_connection'],
    { entropyThreshold: 7.5, minDurationSec: 60, minBytes: 10240 });

  return sigs;
}

// ── Playbook Database ────────────────────────────────────────────────────────

function buildPlaybookDatabase(): Map<string, IncidentPlaybook> {
  const playbooks = new Map<string, IncidentPlaybook>();

  const step = (
    order: number, title: string, description: string,
    action: string, automated: boolean, tools?: string[],
  ): PlaybookStep => ({ order, title, description, action, automated, tools });

  playbooks.set('port_scan', {
    name: 'Port Scan Response',
    description: 'Response playbook for detected port scanning activity',
    estimatedTime: '30 minutes',
    steps: [
      step(1, 'Identify Scanner', 'Determine source IP and resolve hostname', 'lookup_source', true, ['nslookup', 'whois']),
      step(2, 'Assess Scope', 'Determine range of ports and hosts scanned', 'analyze_scope', true, ['tcpdump', 'wireshark']),
      step(3, 'Check Authorization', 'Verify if scan is authorized (pen test, vuln scan)', 'verify_authorization', false),
      step(4, 'Block Source', 'Add firewall rule to block scanning IP', 'block_ip', true, ['iptables', 'firewall-cmd']),
      step(5, 'Document Findings', 'Record scan details, timeline, and actions taken', 'document', false),
    ],
  });

  playbooks.set('brute_force', {
    name: 'Brute Force Attack Response',
    description: 'Response playbook for credential brute force attacks',
    estimatedTime: '45 minutes',
    steps: [
      step(1, 'Identify Targets', 'Determine which accounts or services are targeted', 'identify_targets', true, ['log_analyzer']),
      step(2, 'Block Attacker', 'Temporarily block the attacking IP address', 'block_ip', true, ['iptables', 'fail2ban']),
      step(3, 'Check Compromised Accounts', 'Verify if any accounts were compromised', 'audit_logins', true, ['auth_log_parser']),
      step(4, 'Reset Credentials', 'Force password reset for compromised accounts', 'reset_passwords', false),
      step(5, 'Enable MFA', 'Ensure MFA is enabled on targeted services', 'enable_mfa', false),
      step(6, 'Update Detection Rules', 'Adjust rate-limiting and lockout policies', 'update_rules', true, ['fail2ban', 'pam']),
    ],
  });

  playbooks.set('data_exfiltration', {
    name: 'Data Exfiltration Response',
    description: 'Response playbook for suspected data exfiltration incidents',
    estimatedTime: '2 hours',
    steps: [
      step(1, 'Isolate Host', 'Isolate suspected compromised host from the network', 'isolate_host', true, ['network_switch', 'edr']),
      step(2, 'Capture Evidence', 'Collect network captures, memory dumps, and disk images', 'capture_evidence', false, ['tcpdump', 'volatility', 'dd']),
      step(3, 'Analyze Transfer', 'Determine what data was transferred and to where', 'analyze_data_flow', true, ['wireshark', 'netflow']),
      step(4, 'Assess Impact', 'Determine sensitivity and volume of exfiltrated data', 'assess_impact', false),
      step(5, 'Contain Threat', 'Block destination IPs and revoke compromised credentials', 'contain', true, ['firewall', 'iam']),
      step(6, 'Notify Stakeholders', 'Inform management, legal, and affected parties', 'notify', false),
      step(7, 'Forensic Analysis', 'Full forensic investigation on the compromised host', 'forensic_analysis', false, ['autopsy', 'volatility']),
    ],
  });

  playbooks.set('dns_tunneling', {
    name: 'DNS Tunneling Response',
    description: 'Response playbook for DNS-based data exfiltration or C2 tunneling',
    estimatedTime: '1 hour',
    steps: [
      step(1, 'Identify Tunnel', 'Confirm DNS tunneling and identify abused domain', 'confirm_tunnel', true, ['dns_analyzer', 'wireshark']),
      step(2, 'Block Domain', 'Add tunneling domain to DNS blocklist', 'block_domain', true, ['dns_firewall', 'pihole']),
      step(3, 'Isolate Endpoint', 'Quarantine the host initiating the tunnel', 'isolate_host', true, ['edr', 'nac']),
      step(4, 'Decode Payload', 'Decode tunneled data to assess impact', 'decode_payload', false, ['dnscat2', 'iodine']),
      step(5, 'Harden DNS', 'Implement query length limits and DNSSEC validation', 'harden_dns', false, ['bind', 'unbound']),
    ],
  });

  playbooks.set('syn_flood', {
    name: 'SYN Flood Mitigation',
    description: 'Response playbook for TCP SYN flood denial-of-service attacks',
    estimatedTime: '30 minutes',
    steps: [
      step(1, 'Confirm Attack', 'Verify SYN flood via packet rates and half-open connections', 'confirm_dos', true, ['netstat', 'ss', 'tcpdump']),
      step(2, 'Enable SYN Cookies', 'Activate TCP SYN cookies', 'enable_syn_cookies', true, ['sysctl']),
      step(3, 'Rate Limit', 'Apply rate limiting to incoming SYN packets', 'rate_limit', true, ['iptables', 'nftables']),
      step(4, 'Upstream Mitigation', 'Contact ISP or enable DDoS mitigation service', 'upstream_mitigation', false),
      step(5, 'Monitor Recovery', 'Track connection rates and service availability', 'monitor', true, ['prometheus', 'grafana']),
    ],
  });

  playbooks.set('lateral_movement', {
    name: 'Lateral Movement Containment',
    description: 'Response playbook for detected lateral movement within the network',
    estimatedTime: '1.5 hours',
    steps: [
      step(1, 'Map Movement', 'Trace path of lateral movement across hosts', 'trace_path', true, ['netflow', 'edr']),
      step(2, 'Isolate Hosts', 'Network-isolate all hosts in the movement chain', 'isolate_hosts', true, ['nac', 'vlan']),
      step(3, 'Revoke Credentials', 'Reset credentials for accounts used in movement', 'revoke_creds', false, ['active_directory', 'iam']),
      step(4, 'Scan for Persistence', 'Check hosts for backdoors and persistence', 'scan_persistence', true, ['autoruns', 'osquery']),
      step(5, 'Segment Network', 'Tighten network segmentation', 'segment_network', false),
    ],
  });

  playbooks.set('command_and_control', {
    name: 'C2 Communication Disruption',
    description: 'Response playbook for command-and-control channel disruption',
    estimatedTime: '1 hour',
    steps: [
      step(1, 'Identify C2 Infrastructure', 'Determine C2 server IPs, domains, and patterns', 'identify_c2', true, ['dns_analyzer', 'threat_intel']),
      step(2, 'Sinkhole Domains', 'Redirect C2 domains to internal sinkhole', 'sinkhole', true, ['dns_server']),
      step(3, 'Block C2 Channels', 'Block C2 IPs and domains at perimeter', 'block_c2', true, ['firewall', 'proxy']),
      step(4, 'Quarantine Endpoints', 'Isolate endpoints communicating with C2', 'quarantine', true, ['edr', 'nac']),
      step(5, 'Malware Analysis', 'Analyze malware samples from infected hosts', 'analyze_malware', false, ['sandbox', 'ida_pro']),
      step(6, 'Threat Intel Sharing', 'Share IOCs with threat intel platforms', 'share_iocs', false, ['misp', 'stix']),
    ],
  });

  playbooks.set('arp_spoofing', {
    name: 'ARP Spoofing Mitigation',
    description: 'Response playbook for ARP spoofing or ARP cache poisoning attacks',
    estimatedTime: '30 minutes',
    steps: [
      step(1, 'Detect Spoofing', 'Confirm ARP spoofing via ARP table comparison', 'confirm_spoofing', true, ['arp', 'arpwatch']),
      step(2, 'Identify Attacker', 'Locate switch port and physical location', 'locate_attacker', true, ['switch_cli', 'nac']),
      step(3, 'Block Port', 'Disable the switch port used by attacker', 'block_port', true, ['switch_cli']),
      step(4, 'Flush ARP Caches', 'Clear poisoned ARP entries on affected hosts', 'flush_arp', true, ['arp', 'ip']),
      step(5, 'Enable DAI', 'Configure Dynamic ARP Inspection on switches', 'enable_dai', false, ['switch_cli']),
    ],
  });

  return playbooks;
}

// ── Network Forensics Class ──────────────────────────────────────────────────

export class NetworkForensics {
  private readonly config: NetworkForensicsConfig;
  private trafficPatternDB: TrafficPattern[];
  private anomalySignatures: AnomalySignature[];
  private readonly playbookDB: Map<string, IncidentPlaybook>;
  private readonly packetHistory: PacketInfo[] = [];
  private readonly incidentHistory: NetworkIncident[] = [];
  private readonly analysisHistory: Array<{
    id: string;
    timestamp: number;
    packetsAnalyzed: number;
    anomaliesFound: number;
  }> = [];
  private readonly anomalyHistory: NetworkAnomaly[] = [];
  private readonly feedbackLog: Array<{ anomalyId: string; isValid: boolean }> = [];

  private totalAnalyses = 0;
  private totalPacketsAnalyzed = 0;
  private totalAnomaliesDetected = 0;
  private totalIncidentsCreated = 0;
  private totalProtocolsAnalyzed = 0;
  private totalAlertsGenerated = 0;
  private feedbackCount = 0;

  constructor(config?: Partial<NetworkForensicsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.trafficPatternDB = buildTrafficPatternDatabase();
    this.anomalySignatures = buildAnomalySignatures();
    this.playbookDB = buildPlaybookDatabase();
  }

  // ── Full Packet Analysis ─────────────────────────────────────────────────

  /** Perform a comprehensive analysis of the provided packets, returning anomalies, patterns, and protocol details. */
  analyzePackets(packets: PacketInfo[]): {
    anomalies: NetworkAnomaly[];
    patterns: TrafficPattern[];
    protocols: ProtocolAnalysis[];
  } {
    const trimmed = packets.slice(0, this.config.maxPackets);
    this.totalAnalyses++;
    this.totalPacketsAnalyzed += trimmed.length;

    for (const pkt of trimmed) {
      this.packetHistory.push(pkt);
    }

    const anomalies = this.config.enableAnomalyDetection
      ? this.detectAnomalies(trimmed)
      : [];

    const patterns = this.analyzeTrafficPattern(trimmed);

    const protocols: ProtocolAnalysis[] = [];
    if (this.config.enableProtocolAnalysis) {
      const uniqueProtocols = [...new Set(trimmed.map(p => p.protocol.toLowerCase()))];
      for (const proto of uniqueProtocols) {
        const protoPackets = trimmed.filter(p => p.protocol.toLowerCase() === proto);
        protocols.push(this.analyzeProtocol(proto, protoPackets));
      }
    }

    if (this.config.enableThreatCorrelation && anomalies.length > 0) {
      this.correlateThreats(anomalies);
    }

    this.analysisHistory.push({
      id: generateId('ANALYSIS'),
      timestamp: Date.now(),
      packetsAnalyzed: trimmed.length,
      anomaliesFound: anomalies.length,
    });

    return { anomalies, patterns, protocols };
  }

  // ── Anomaly Detection ────────────────────────────────────────────────────

  /** Detect anomalies using signature-based matching and behavioral analysis. */
  detectAnomalies(packets: PacketInfo[]): NetworkAnomaly[] {
    const anomalies: NetworkAnomaly[] = [];

    // Signature-based detection
    for (const sig of this.anomalySignatures) {
      const detected = this.matchSignature(sig, packets);
      if (detected) {
        anomalies.push(detected);
      }
    }

    // Behavioral analysis
    const behavioral = this.behavioralAnalysis(packets);
    for (const b of behavioral) {
      anomalies.push(b);
    }

    // Filter by alert threshold
    const filtered = anomalies.filter(a => a.confidence >= this.config.alertThreshold);

    this.totalAnomaliesDetected += filtered.length;
    this.totalAlertsGenerated += filtered.length;

    for (const a of filtered) {
      this.anomalyHistory.push(a);
    }

    return filtered;
  }

  // ── Protocol Analysis ────────────────────────────────────────────────────

  /** Perform protocol-specific analysis on a set of packets. */
  analyzeProtocol(protocol: string, packets: PacketInfo[]): ProtocolAnalysis {
    this.totalProtocolsAnalyzed++;
    const proto = protocol.toLowerCase();
    const analysis: ProtocolAnalysis = {
      protocol: proto,
      compliance: true,
      vulnerabilities: [],
      recommendations: [],
      details: {},
    };

    const packetCount = packets.length;
    const avgSize = packetCount > 0
      ? round2(packets.reduce((s, p) => s + p.size, 0) / packetCount)
      : 0;

    analysis.details['packetCount'] = String(packetCount);
    analysis.details['averageSize'] = `${avgSize} bytes`;

    switch (proto) {
      case 'tcp': {
        analysis.version = 'TCP/IP';
        const synPkts = packets.filter(p => p.flags?.includes('SYN') && !p.flags?.includes('ACK'));
        const rstPkts = packets.filter(p => p.flags?.includes('RST'));
        const finPkts = packets.filter(p => p.flags?.includes('FIN'));
        analysis.details['synPackets'] = String(synPkts.length);
        analysis.details['rstPackets'] = String(rstPkts.length);
        analysis.details['finPackets'] = String(finPkts.length);
        if (packetCount > 0 && rstPkts.length / packetCount > 0.3) {
          analysis.compliance = false;
          analysis.vulnerabilities.push('High RST ratio may indicate scanning or service issues');
          analysis.recommendations.push('Investigate hosts generating RST packets');
        }
        if (synPkts.length > packetCount * 0.5 && packetCount > 10) {
          analysis.compliance = false;
          analysis.vulnerabilities.push('Excessive SYN-only packets may indicate SYN flood attack');
          analysis.recommendations.push('Enable SYN cookies and rate limiting');
        }
        break;
      }
      case 'udp': {
        analysis.version = 'UDP';
        analysis.details['uniqueSourcePorts'] = String(new Set(packets.map(p => p.sourcePort)).size);
        analysis.details['uniqueDestPorts'] = String(new Set(packets.map(p => p.destPort)).size);
        const dnsUdp = packets.filter(p => p.destPort === 53 || p.sourcePort === 53);
        if (dnsUdp.length > packetCount * 0.8 && packetCount > 5) {
          analysis.details['dominantService'] = 'DNS';
          if (dnsUdp.some(p => p.size > 512)) {
            analysis.vulnerabilities.push('DNS responses exceeding 512 bytes — potential amplification');
            analysis.recommendations.push('Implement response rate limiting on DNS servers');
          }
        }
        break;
      }
      case 'http':
        analysis.version = 'HTTP/1.1';
        analysis.compliance = false;
        analysis.vulnerabilities.push('Unencrypted HTTP traffic detected');
        analysis.recommendations.push('Migrate to HTTPS with TLS 1.3');
        analysis.details['direction'] = this.summarizeDirection(packets);
        break;
      case 'https': case 'tls':
        analysis.version = 'TLS 1.2/1.3';
        analysis.details['direction'] = this.summarizeDirection(packets);
        analysis.details['encrypted'] = 'true';
        analysis.recommendations.push('Ensure TLS 1.3 is preferred over TLS 1.2');
        break;
      case 'dns': {
        analysis.version = 'DNS';
        analysis.details['queryCount'] = String(packets.filter(p => p.destPort === 53).length);
        analysis.details['responseCount'] = String(packets.filter(p => p.sourcePort === 53).length);
        const avgPayload = packets.reduce((s, p) => s + (p.payload?.length ?? 0), 0) / Math.max(packetCount, 1);
        if (avgPayload > 100) {
          analysis.compliance = false;
          analysis.vulnerabilities.push('Unusually long DNS payloads — possible DNS tunneling');
          analysis.recommendations.push('Inspect DNS queries for encoded data in subdomain labels');
        }
        break;
      }
      case 'ssh': {
        analysis.version = 'SSHv2';
        analysis.details['encrypted'] = 'true';
        const uniqueSrc = new Set(packets.map(p => p.sourceIP)).size;
        analysis.details['uniqueSources'] = String(uniqueSrc);
        if (uniqueSrc === 1 && packetCount > 20) {
          analysis.vulnerabilities.push('High volume SSH from single source — potential brute force');
          analysis.recommendations.push('Implement fail2ban and key-based authentication');
        }
        break;
      }
      case 'icmp': {
        analysis.version = 'ICMPv4';
        const uniqueDest = new Set(packets.map(p => p.destIP)).size;
        analysis.details['uniqueDestinations'] = String(uniqueDest);
        if (uniqueDest > 20 && packetCount > 30) {
          analysis.compliance = false;
          analysis.vulnerabilities.push('ICMP sweep detected — network reconnaissance');
          analysis.recommendations.push('Rate-limit ICMP at the network perimeter');
        }
        break;
      }
      case 'smb':
        analysis.version = 'SMBv3';
        analysis.details['uniqueSources'] = String(new Set(packets.map(p => p.sourceIP)).size);
        analysis.recommendations.push('Ensure SMBv1 is disabled across all hosts');
        analysis.recommendations.push('Restrict SMB traffic to authorized network segments');
        if (packets.some(p => !isPrivateIP(p.destIP))) {
          analysis.vulnerabilities.push('SMB traffic to external IP detected');
          analysis.compliance = false;
        }
        break;
      default:
        analysis.details['note'] = `Protocol '${proto}' analysis based on general heuristics`;
        analysis.recommendations.push('Verify that this protocol is expected on the network');
        break;
    }

    return analysis;
  }

  // ── Traffic Pattern Analysis ─────────────────────────────────────────────

  /** Identify known traffic patterns within the provided packets. */
  analyzeTrafficPattern(packets: PacketInfo[]): TrafficPattern[] {
    const matched: TrafficPattern[] = [];
    if (packets.length === 0) return matched;

    const sourceIPs = new Set(packets.map(p => p.sourceIP));
    const destIPs = new Set(packets.map(p => p.destIP));
    const destPorts = new Set(packets.map(p => p.destPort));
    const protocols = new Set(packets.map(p => p.protocol.toLowerCase()));
    const outbound = packets.filter(p => p.direction === 'outbound');
    const totalBytes = packets.reduce((s, p) => s + p.size, 0);
    const timeSpan = packets.length > 1
      ? (packets[packets.length - 1].timestamp - packets[0].timestamp) / 1000
      : 1;

    for (const pattern of this.trafficPatternDB) {
      const tokens = tokenize(pattern.name + ' ' + pattern.category);
      let score = 0;

      // Port scan patterns
      if (tokens.includes('scan') || tokens.includes('sweep')) {
        if (destPorts.size > 15) score += 0.6;
        if (sourceIPs.size < 3) score += 0.2;
        if (destIPs.size > 8) score += 0.2;
      }

      // Brute force patterns
      if (tokens.includes('brute') || tokens.includes('force')) {
        const targetPorts = [22, 3389, 21, 23, 3306, 5432];
        const hitsBrutePort = packets.some(p => targetPorts.includes(p.destPort));
        if (hitsBrutePort) score += 0.4;
        if (sourceIPs.size === 1) score += 0.3;
        if (packets.length > 20 && timeSpan < 300) score += 0.3;
      }

      // C2 / beaconing patterns
      if (tokens.includes('beaconing') || tokens.includes('c2') || tokens.includes('callback')) {
        if (outbound.length > 5 && sourceIPs.size <= 2) score += 0.3;
        const intervals = this.computeIntervals(outbound);
        if (intervals.length > 3 && this.intervalRegularity(intervals) > 0.7) {
          score += 0.5;
        }
        if (destIPs.size === 1) score += 0.2;
      }

      // Exfiltration patterns
      if (tokens.includes('exfiltration') || tokens.includes('tunneling') || tokens.includes('transfer')) {
        if (outbound.length > packets.length * 0.6) score += 0.3;
        const outBytes = outbound.reduce((s, p) => s + p.size, 0);
        if (outBytes > totalBytes * 0.7) score += 0.4;
        if (destIPs.size <= 2) score += 0.2;
      }

      // Flood patterns
      if (tokens.includes('flood') || tokens.includes('amplification')) {
        const rate = packets.length / Math.max(timeSpan, 1);
        if (rate > 100) score += 0.5;
        if (destIPs.size <= 2) score += 0.3;
        const synOnly = packets.filter(
          p => p.flags?.includes('SYN') && !p.flags?.includes('ACK'),
        ).length;
        if (synOnly > packets.length * 0.7) score += 0.2;
      }

      // Normal traffic
      if (tokens.includes('normal') || tokens.includes('browsing') || tokens.includes('ntp')) {
        if (protocols.has('http') || protocols.has('https') || protocols.has('ntp')) {
          score += 0.3;
        }
        if (destPorts.has(80) || destPorts.has(443) || destPorts.has(123)) {
          score += 0.3;
        }
      }

      if (score >= 0.5) {
        matched.push(pattern);
      }
    }

    return matched;
  }

  // ── Incident Management ──────────────────────────────────────────────────

  /** Create a new incident record, optionally linking anomalies. */
  createIncident(
    title: string,
    severity: NetworkIncident['severity'],
    anomalyIds?: string[],
  ): NetworkIncident {
    this.totalIncidentsCreated++;

    const linkedAnomalies = anomalyIds ?? [];
    const affectedHosts = new Set<string>();
    for (const aid of linkedAnomalies) {
      const anomaly = this.anomalyHistory.find(a => a.id === aid);
      if (anomaly) {
        if (anomaly.sourceIP) affectedHosts.add(anomaly.sourceIP);
        if (anomaly.destIP) affectedHosts.add(anomaly.destIP);
      }
    }

    const incidentType = this.inferIncidentType(title, linkedAnomalies);
    const playbook = this.playbookDB.get(incidentType);

    const incident: NetworkIncident = {
      id: generateId('INC'),
      title,
      description: `Incident created: ${title}. Severity: ${severity}. Linked anomalies: ${linkedAnomalies.length}.`,
      severity,
      status: 'open',
      timestamp: Date.now(),
      anomalies: linkedAnomalies,
      affectedHosts: [...affectedHosts],
      timeline: [
        {
          timestamp: Date.now(),
          action: 'Incident created',
          actor: 'system',
          details: `New ${severity} incident created with ${linkedAnomalies.length} linked anomalies`,
        },
      ],
      playbook,
    };

    this.incidentHistory.push(incident);
    return incident;
  }

  /** Update an existing incident's status, title, or description. */
  updateIncident(
    incidentId: string,
    updates: Partial<Pick<NetworkIncident, 'status' | 'title' | 'description'>>,
  ): NetworkIncident | null {
    const incident = this.incidentHistory.find(i => i.id === incidentId);
    if (!incident) return null;

    const changes: string[] = [];
    if (updates.status !== undefined && updates.status !== incident.status) {
      changes.push(`status: ${incident.status} → ${updates.status}`);
      incident.status = updates.status;
    }
    if (updates.title !== undefined && updates.title !== incident.title) {
      changes.push(`title updated`);
      incident.title = updates.title;
    }
    if (updates.description !== undefined) {
      changes.push(`description updated`);
      incident.description = updates.description;
    }

    if (changes.length > 0) {
      incident.timeline.push({
        timestamp: Date.now(),
        action: 'Incident updated',
        actor: 'system',
        details: changes.join('; '),
      });
    }

    return incident;
  }

  /** Add a timeline entry to an existing incident. */
  addTimelineEntry(
    incidentId: string,
    entry: Omit<IncidentTimelineEntry, 'timestamp'>,
  ): boolean {
    const incident = this.incidentHistory.find(i => i.id === incidentId);
    if (!incident) return false;

    incident.timeline.push({
      ...entry,
      timestamp: Date.now(),
    });
    return true;
  }

  /** Retrieve a specific incident by ID. */
  getIncident(incidentId: string): NetworkIncident | null {
    return this.incidentHistory.find(i => i.id === incidentId) ?? null;
  }

  /** List incidents, optionally filtering by status and/or severity. */
  listIncidents(filter?: {
    status?: NetworkIncident['status'];
    severity?: NetworkIncident['severity'];
  }): NetworkIncident[] {
    let results = [...this.incidentHistory];
    if (filter?.status) {
      results = results.filter(i => i.status === filter.status);
    }
    if (filter?.severity) {
      results = results.filter(i => i.severity === filter.severity);
    }
    return results;
  }

  // ── Playbook Management ──────────────────────────────────────────────────

  /** Get an incident response playbook by incident type. */
  getPlaybook(incidentType: string): IncidentPlaybook | null {
    return this.playbookDB.get(incidentType.toLowerCase()) ?? null;
  }

  /** List all available playbook names. */
  listPlaybooks(): string[] {
    return [...this.playbookDB.keys()];
  }

  // ── Topology Mapping ─────────────────────────────────────────────────────

  /** Build a network topology from observed traffic. */
  mapTopology(packets: PacketInfo[]): NetworkTopology {
    const nodeMap = new Map<string, TopologyNode>();
    const connectionSet = new Set<string>();
    const connections: TopologyConnection[] = [];
    const segments = new Set<string>();

    for (const pkt of packets) {
      if (!nodeMap.has(pkt.sourceIP)) {
        nodeMap.set(pkt.sourceIP, {
          id: generateId('NODE'), name: pkt.sourceIP,
          type: this.inferNodeType(pkt.sourceIP, pkt.sourcePort, packets),
          ip: pkt.sourceIP, services: [], risk: 0,
        });
      }
      if (!nodeMap.has(pkt.destIP)) {
        nodeMap.set(pkt.destIP, {
          id: generateId('NODE'), name: pkt.destIP,
          type: this.inferNodeType(pkt.destIP, pkt.destPort, packets),
          ip: pkt.destIP, services: [], risk: 0,
        });
      }

      // Track services
      const destNode = nodeMap.get(pkt.destIP)!;
      const service = this.portToService(pkt.destPort);
      if (service && !destNode.services.includes(service)) destNode.services.push(service);

      // Track connections
      const connKey = `${pkt.sourceIP}->${pkt.destIP}:${pkt.protocol}`;
      if (!connectionSet.has(connKey)) {
        connectionSet.add(connKey);
        connections.push({
          source: pkt.sourceIP, destination: pkt.destIP, protocol: pkt.protocol,
          encrypted: this.isEncryptedProtocol(pkt.protocol, pkt.destPort), bandwidth: pkt.size,
        });
      } else {
        const conn = connections.find(
          c => c.source === pkt.sourceIP && c.destination === pkt.destIP && c.protocol === pkt.protocol,
        );
        if (conn?.bandwidth !== undefined) conn.bandwidth += pkt.size;
      }

      // Track network segments
      segments.add(extractSubnet(pkt.sourceIP));
      segments.add(extractSubnet(pkt.destIP));
    }

    // Calculate risk scores based on anomaly history
    for (const [ip, node] of nodeMap) {
      const anomaliesAsSource = this.anomalyHistory.filter(a => a.sourceIP === ip).length;
      const anomaliesAsDest = this.anomalyHistory.filter(a => a.destIP === ip).length;
      const externalExposure = !isPrivateIP(ip) ? 20 : 0;
      const serviceRisk = node.services.length * 5;
      node.risk = clamp(anomaliesAsSource * 15 + anomaliesAsDest * 10 + externalExposure + serviceRisk, 0, 100);
    }

    return {
      nodes: [...nodeMap.values()],
      connections,
      segments: [...segments],
    };
  }

  /** Identify nodes with the highest risk scores from a topology. */
  identifyHighRiskNodes(topology: NetworkTopology): TopologyNode[] {
    return topology.nodes
      .filter(n => n.risk > 50)
      .sort((a, b) => b.risk - a.risk);
  }

  // ── Threat Correlation ───────────────────────────────────────────────────

  /** Correlate anomalies to identify higher-level threats. */
  correlateThreats(anomalies: NetworkAnomaly[]): Array<{
    threat: string;
    confidence: number;
    anomalies: string[];
    recommendation: string;
  }> {
    const threats: Array<{
      threat: string;
      confidence: number;
      anomalies: string[];
      recommendation: string;
    }> = [];

    // Detect kill-chain: recon → exploitation → exfiltration
    const recon = anomalies.filter(a => a.type === 'port_scan' || a.type === 'lateral_movement');
    const exploit = anomalies.filter(a => a.type === 'brute_force' || a.type === 'command_and_control');
    const exfil = anomalies.filter(a => a.type === 'data_exfiltration' || a.type === 'dns_tunneling');

    if (recon.length > 0 && exploit.length > 0 && exfil.length > 0) {
      threats.push({
        threat: 'Advanced Persistent Threat (APT) Kill Chain',
        confidence: round2(clamp(0.6 + recon.length * 0.05 + exploit.length * 0.05 + exfil.length * 0.1, 0, 1)),
        anomalies: [...recon, ...exploit, ...exfil].map(a => a.id),
        recommendation: 'Initiate full incident response — isolate affected hosts, preserve evidence, and engage threat hunting team',
      });
    }

    // Detect coordinated scanning (multiple scan types)
    const scans = anomalies.filter(a => a.type === 'port_scan');
    const bruteForce = anomalies.filter(a => a.type === 'brute_force');
    if (scans.length > 0 && bruteForce.length > 0) {
      threats.push({
        threat: 'Coordinated Reconnaissance and Exploitation',
        confidence: round2(clamp(0.5 + scans.length * 0.1 + bruteForce.length * 0.1, 0, 1)),
        anomalies: [...scans, ...bruteForce].map(a => a.id),
        recommendation: 'Block attacking IPs at perimeter, enable enhanced logging, and scan for compromised credentials',
      });
    }

    // Detect botnet activity (C2 + beaconing)
    const c2 = anomalies.filter(a => a.type === 'command_and_control' || a.type === 'beaconing');
    if (c2.length >= 2) {
      threats.push({
        threat: 'Botnet or RAT Communication',
        confidence: round2(clamp(0.55 + c2.length * 0.1, 0, 1)),
        anomalies: c2.map(a => a.id),
        recommendation: 'Sinkhole C2 domains, quarantine infected endpoints, and perform malware analysis',
      });
    }

    // Detect data theft pattern (lateral movement + exfiltration)
    const lateral = anomalies.filter(a => a.type === 'lateral_movement');
    if (lateral.length > 0 && exfil.length > 0) {
      threats.push({
        threat: 'Insider Threat or Compromised Account Data Theft',
        confidence: round2(clamp(0.5 + lateral.length * 0.1 + exfil.length * 0.15, 0, 1)),
        anomalies: [...lateral, ...exfil].map(a => a.id),
        recommendation: 'Revoke credentials on affected accounts, review DLP policies, and audit data access logs',
      });
    }

    // Detect DDoS (SYN flood + bandwidth anomaly)
    const floods = anomalies.filter(a =>
      a.type === 'syn_flood' || a.type === 'bandwidth_anomaly' || a.type === 'traffic_spike',
    );    if (floods.length >= 2) {
      threats.push({
        threat: 'Distributed Denial of Service (DDoS)',
        confidence: round2(clamp(0.6 + floods.length * 0.1, 0, 1)),
        anomalies: floods.map(a => a.id),
        recommendation: 'Activate DDoS mitigation service, enable SYN cookies, and contact upstream ISP',
      });
    }

    // Detect DNS-based attack
    const dnsThreats = anomalies.filter(a => a.type === 'dns_tunneling' || a.type === 'suspicious_dns');
    if (dnsThreats.length >= 2) {
      threats.push({
        threat: 'DNS Infrastructure Abuse',
        confidence: round2(clamp(0.55 + dnsThreats.length * 0.12, 0, 1)),
        anomalies: dnsThreats.map(a => a.id),
        recommendation: 'Implement DNS query logging, block suspicious domains, and enforce DNSSEC validation',
      });
    }

    // Detect evasion
    const evasion = anomalies.filter(a =>
      a.type === 'encrypted_tunnel' || a.type === 'unusual_port' || a.type === 'protocol_violation',
    );
    if (evasion.length >= 2) {
      threats.push({
        threat: 'Security Control Evasion',
        confidence: round2(clamp(0.45 + evasion.length * 0.1, 0, 1)),
        anomalies: evasion.map(a => a.id),
        recommendation: 'Deploy deep packet inspection, enforce protocol compliance, and review firewall rules',
      });
    }

    return threats;
  }

  // ── Traffic Pattern Management ───────────────────────────────────────────

  /** Add a custom traffic pattern to the database. */
  addTrafficPattern(pattern: Omit<TrafficPattern, 'id'>): TrafficPattern {
    const full: TrafficPattern = {
      ...pattern,
      id: generateId('TP-CUSTOM'),
    };
    this.trafficPatternDB.push(full);
    return full;
  }

  /** Search traffic patterns by name, description, or category. */
  searchPatterns(query: string): TrafficPattern[] {
    const terms = tokenize(query);
    if (terms.length === 0) return [...this.trafficPatternDB];

    return this.trafficPatternDB.filter(pattern => {
      const text = tokenize(
        `${pattern.name} ${pattern.description} ${pattern.category} ${pattern.signature}`,
      );
      return terms.some(t => text.some(w => w.includes(t)));
    });
  }

  // ── Forensic Reporting ───────────────────────────────────────────────────

  /** Generate a forensic report, optionally scoped to a specific incident. */
  generateForensicReport(incidentId?: string): ForensicReport {
    const findings: string[] = [];
    const recommendations: string[] = [];
    const evidence: string[] = [];
    const incidentIds: string[] = [];
    let riskScore = 0;

    if (incidentId) {
      const incident = this.getIncident(incidentId);
      if (incident) {
        incidentIds.push(incident.id);
        findings.push(`Incident "${incident.title}" — severity: ${incident.severity}, status: ${incident.status}`);
        findings.push(`Affected hosts: ${incident.affectedHosts.join(', ') || 'none identified'}`);
        findings.push(`Linked anomalies: ${incident.anomalies.length}`);

        for (const aid of incident.anomalies) {
          const anomaly = this.anomalyHistory.find(a => a.id === aid);
          if (anomaly) {
            evidence.push(`Anomaly ${anomaly.id}: ${anomaly.type} (${anomaly.severity}) — ${anomaly.description}`);
          }
        }

        for (const entry of incident.timeline) {
          evidence.push(`[${new Date(entry.timestamp).toISOString()}] ${entry.action} by ${entry.actor}: ${entry.details}`);
        }

        if (incident.playbook) {
          recommendations.push(`Follow playbook: "${incident.playbook.name}" (estimated: ${incident.playbook.estimatedTime})`);
          for (const step of incident.playbook.steps) {
            recommendations.push(`  Step ${step.order}: ${step.title} — ${step.description}`);
          }
        }

        const severityScores: Record<string, number> = { low: 15, medium: 35, high: 65, critical: 90 };
        riskScore = severityScores[incident.severity] ?? 50;
      }
    } else {
      // General report across all analyses
      findings.push(`Total analyses performed: ${this.totalAnalyses}`);
      findings.push(`Total packets analyzed: ${this.totalPacketsAnalyzed}`);
      findings.push(`Total anomalies detected: ${this.totalAnomaliesDetected}`);
      findings.push(`Total incidents created: ${this.totalIncidentsCreated}`);

      const openIncidents = this.incidentHistory.filter(i => i.status !== 'closed' && i.status !== 'resolved');
      for (const inc of openIncidents) {
        incidentIds.push(inc.id);
        findings.push(`Open incident: "${inc.title}" (${inc.severity})`);
      }

      const recentAnomalies = this.anomalyHistory.slice(-10);
      for (const a of recentAnomalies) {
        evidence.push(`Anomaly ${a.id}: ${a.type} — ${a.description}`);
      }

      recommendations.push('Review all open incidents and ensure response playbooks are being followed');
      recommendations.push('Update anomaly detection signatures based on recent findings');
      recommendations.push('Conduct a full network topology review to identify high-risk nodes');

      const criticalCount = this.anomalyHistory.filter(a => a.severity === 'critical').length;
      const highCount = this.anomalyHistory.filter(a => a.severity === 'high').length;
      riskScore = clamp(criticalCount * 20 + highCount * 10 + openIncidents.length * 15, 0, 100);
    }

    return {
      id: generateId('RPT'),
      timestamp: Date.now(),
      title: incidentId
        ? `Forensic Report — Incident ${incidentId}`
        : 'Network Forensics Summary Report',
      findings,
      recommendations,
      evidence,
      riskScore: clamp(riskScore, 0, 100),
      incidents: incidentIds,
    };
  }

  /** Export evidence for a specific incident in the requested format. */
  exportEvidence(incidentId: string, format: 'text' | 'json' | 'markdown' = 'text'): string {
    const incident = this.getIncident(incidentId);
    if (!incident) return '';

    const anomalies = incident.anomalies
      .map(aid => this.anomalyHistory.find(a => a.id === aid))
      .filter((a): a is NetworkAnomaly => a !== undefined);

    switch (format) {
      case 'json':
        return JSON.stringify({
          incident: {
            id: incident.id,
            title: incident.title,
            severity: incident.severity,
            status: incident.status,
            timestamp: incident.timestamp,
            affectedHosts: incident.affectedHosts,
          },
          anomalies: anomalies.map(a => ({
            id: a.id,
            type: a.type,
            severity: a.severity,
            description: a.description,
            sourceIP: a.sourceIP,
            destIP: a.destIP,
            confidence: a.confidence,
            indicators: a.indicators,
          })),
          timeline: incident.timeline,
        }, null, 2);

      case 'markdown': {
        const lines: string[] = [
          `# Incident Report: ${incident.title}`, '',
          `**ID:** ${incident.id}  `,
          `**Severity:** ${incident.severity}  `,
          `**Status:** ${incident.status}  `,
          `**Created:** ${new Date(incident.timestamp).toISOString()}  `,
          `**Affected Hosts:** ${incident.affectedHosts.join(', ') || 'N/A'}`, '',
          '## Anomalies', '',
        ];
        for (const a of anomalies) {
          lines.push(`### ${a.type} (${a.severity})`);
          lines.push(`- **Description:** ${a.description}`);
          lines.push(`- **Source:** ${a.sourceIP ?? 'N/A'} → **Dest:** ${a.destIP ?? 'N/A'}`);
          lines.push(`- **Confidence:** ${a.confidence} | **Indicators:** ${a.indicators.join(', ')}`, '');
        }
        lines.push('## Timeline', '');
        for (const e of incident.timeline) {
          lines.push(`- **${new Date(e.timestamp).toISOString()}** — ${e.action} (${e.actor}): ${e.details}`);
        }
        return lines.join('\n');
      }

      case 'text':
      default: {
        const lines: string[] = [
          `INCIDENT REPORT: ${incident.title}`,
          '='.repeat(60),
          `ID:             ${incident.id}`,
          `Severity:       ${incident.severity}`,
          `Status:         ${incident.status}`,
          `Created:        ${new Date(incident.timestamp).toISOString()}`,
          `Affected Hosts: ${incident.affectedHosts.join(', ') || 'N/A'}`,
          '', 'ANOMALIES', '-'.repeat(40),
        ];
        for (const a of anomalies) {
          lines.push(`  [${a.severity.toUpperCase()}] ${a.type}: ${a.description}`);
          lines.push(`    Source: ${a.sourceIP ?? 'N/A'} | Dest: ${a.destIP ?? 'N/A'} | Confidence: ${a.confidence}`);
        }
        lines.push('', 'TIMELINE', '-'.repeat(40));
        for (const e of incident.timeline) {
          lines.push(`  [${new Date(e.timestamp).toISOString()}] ${e.action} (${e.actor}): ${e.details}`);
        }
        return lines.join('\n');
      }
    }
  }

  // ── Feedback ─────────────────────────────────────────────────────────────

  /** Provide feedback on whether a detected anomaly was a true or false positive. */
  provideFeedback(anomalyId: string, isValid: boolean): void {
    this.feedbackLog.push({ anomalyId, isValid });
    this.feedbackCount++;
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  /** Return aggregate statistics for the forensics module. */
  getStats(): Readonly<NetworkForensicsStats> {
    return {
      totalAnalyses: this.totalAnalyses,
      totalPacketsAnalyzed: this.totalPacketsAnalyzed,
      totalAnomaliesDetected: this.totalAnomaliesDetected,
      totalIncidentsCreated: this.totalIncidentsCreated,
      totalProtocolsAnalyzed: this.totalProtocolsAnalyzed,
      totalAlertsGenerated: this.totalAlertsGenerated,
      feedbackCount: this.feedbackCount,
    };
  }

  // ── Serialization ────────────────────────────────────────────────────────

  /** Serialize the forensics module state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalAnalyses: this.totalAnalyses,
      totalPacketsAnalyzed: this.totalPacketsAnalyzed,
      totalAnomaliesDetected: this.totalAnomaliesDetected,
      totalIncidentsCreated: this.totalIncidentsCreated,
      totalProtocolsAnalyzed: this.totalProtocolsAnalyzed,
      totalAlertsGenerated: this.totalAlertsGenerated,
      feedbackCount: this.feedbackCount,
      feedbackLog: this.feedbackLog,
      packetHistory: this.packetHistory,
      incidentHistory: this.incidentHistory,
      analysisHistory: this.analysisHistory,
      anomalyHistory: this.anomalyHistory,
      customPatterns: this.trafficPatternDB.filter(p => p.id.startsWith('TP-CUSTOM')),
    });
  }

  /** Restore a NetworkForensics instance from serialized JSON. */
  static deserialize(json: string): NetworkForensics {
    const data = JSON.parse(json) as {
      config: NetworkForensicsConfig;
      totalAnalyses: number;
      totalPacketsAnalyzed: number;
      totalAnomaliesDetected: number;
      totalIncidentsCreated: number;
      totalProtocolsAnalyzed: number;
      totalAlertsGenerated: number;
      feedbackCount: number;
      feedbackLog: Array<{ anomalyId: string; isValid: boolean }>;
      packetHistory: PacketInfo[];
      incidentHistory: NetworkIncident[];
      analysisHistory: Array<{
        id: string;
        timestamp: number;
        packetsAnalyzed: number;
        anomaliesFound: number;
      }>;
      anomalyHistory: NetworkAnomaly[];
      customPatterns: TrafficPattern[];
    };

    const instance = new NetworkForensics(data.config);
    instance.totalAnalyses = data.totalAnalyses;
    instance.totalPacketsAnalyzed = data.totalPacketsAnalyzed;
    instance.totalAnomaliesDetected = data.totalAnomaliesDetected;
    instance.totalIncidentsCreated = data.totalIncidentsCreated;
    instance.totalProtocolsAnalyzed = data.totalProtocolsAnalyzed;
    instance.totalAlertsGenerated = data.totalAlertsGenerated;
    instance.feedbackCount = data.feedbackCount;

    for (const entry of data.feedbackLog) instance.feedbackLog.push(entry);
    for (const pkt of data.packetHistory) instance.packetHistory.push(pkt);
    for (const inc of data.incidentHistory) instance.incidentHistory.push(inc);
    for (const analysis of data.analysisHistory) instance.analysisHistory.push(analysis);
    for (const anomaly of data.anomalyHistory) instance.anomalyHistory.push(anomaly);
    for (const pattern of data.customPatterns) instance.trafficPatternDB.push(pattern);

    return instance;
  }

  // ── Private: Signature Matching ──────────────────────────────────────────

  private matchSignature(
    sig: AnomalySignature,
    packets: PacketInfo[],
  ): NetworkAnomaly | null {
    if (packets.length === 0) return null;

    const timeWindow = sig.thresholds['timeWindowSec'] ?? 300;
    const now = packets[packets.length - 1].timestamp;
    const windowStart = now - timeWindow * 1000;
    const windowPackets = packets.filter(p => p.timestamp >= windowStart);
    if (windowPackets.length === 0) return null;

    let matched = false;
    let confidence = 0;
    let sourceIP: string | undefined;
    let destIP: string | undefined;
    const relatedPackets: string[] = [];

    switch (sig.type) {
      case 'port_scan': {
        const bySource = this.groupBy(windowPackets, p => p.sourceIP);
        for (const [src, pkts] of bySource) {
          const uniquePorts = new Set(pkts.map(p => p.destPort));
          const minPorts = sig.thresholds['minPorts'] ?? 20;
          if (uniquePorts.size >= minPorts) {
            matched = true;
            confidence = clamp(uniquePorts.size / (minPorts * 2), 0.5, 1.0);
            sourceIP = src;
            destIP = pkts[0].destIP;
            for (const p of pkts.slice(0, 10)) relatedPackets.push(p.id);
            break;
          }
        }
        break;
      }

      case 'brute_force': {
        const bySource = this.groupBy(windowPackets, p => p.sourceIP);
        for (const [src, pkts] of bySource) {
          const authPkts = pkts.filter(p => p.destPort === 22 || p.destPort === 3389);
          const minAttempts = sig.thresholds['minAttempts'] ?? 10;
          if (authPkts.length >= minAttempts) {
            matched = true;
            confidence = clamp(authPkts.length / (minAttempts * 2), 0.5, 1.0);
            sourceIP = src;
            destIP = authPkts[0].destIP;
            for (const p of authPkts.slice(0, 10)) relatedPackets.push(p.id);
            break;
          }
        }
        break;
      }

      case 'data_exfiltration': {
        const outbound = windowPackets.filter(p => p.direction === 'outbound');
        const totalBytes = outbound.reduce((s, p) => s + p.size, 0);
        const minBytes = sig.thresholds['minBytes'] ?? 104857600;
        if (totalBytes >= minBytes) {
          matched = true;
          confidence = clamp(totalBytes / (minBytes * 2), 0.5, 1.0);
          const byDest = this.groupBy(outbound, p => p.destIP);
          const topDest = [...byDest.entries()].sort(
            (a, b) => b[1].reduce((s, p) => s + p.size, 0) - a[1].reduce((s, p) => s + p.size, 0),
          )[0];
          if (topDest) { destIP = topDest[0]; sourceIP = topDest[1][0]?.sourceIP; }
          for (const p of (topDest?.[1] ?? outbound).slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      case 'dns_tunneling': {
        const dnsPkts = windowPackets.filter(p => p.protocol.toLowerCase() === 'dns' || p.destPort === 53);
        const minRate = sig.thresholds['queriesPerMin'] ?? 10;
        const rate = dnsPkts.length / Math.max(timeWindow / 60, 1);
        if (rate >= minRate && dnsPkts.length > 5) {
          const avgLen = dnsPkts.reduce((s, p) => s + (p.payload?.length ?? 0), 0) / dnsPkts.length;
          const minLen = sig.thresholds['minSubdomainLen'] ?? 30;
          if (avgLen >= minLen || dnsPkts.some(p => (p.payload?.length ?? 0) > minLen)) {
            matched = true;
            confidence = clamp(0.6 + (rate / minRate) * 0.2, 0.5, 1.0);
            sourceIP = dnsPkts[0].sourceIP; destIP = dnsPkts[0].destIP;
            for (const p of dnsPkts.slice(0, 10)) relatedPackets.push(p.id);
          }
        }
        break;
      }

      case 'arp_spoofing': {
        const arpPkts = windowPackets.filter(p => p.protocol.toLowerCase() === 'arp');
        if (arpPkts.length >= (sig.thresholds['minConflicts'] ?? 2)) {
          const macs = new Set(arpPkts.map(p => p.payload ?? ''));
          if (macs.size < arpPkts.length) {
            matched = true;
            confidence = clamp(0.6 + arpPkts.length * 0.05, 0.5, 1.0);
            sourceIP = arpPkts[0].sourceIP;
            for (const p of arpPkts.slice(0, 10)) relatedPackets.push(p.id);
          }
        }
        break;
      }

      case 'syn_flood': {
        const synPkts = windowPackets.filter(p => p.flags?.includes('SYN') && !p.flags?.includes('ACK'));
        const rate = synPkts.length / Math.max(timeWindow, 1);
        if (rate >= (sig.thresholds['synRate'] ?? 1000) / 10 && synPkts.length > 50) {
          matched = true;
          confidence = clamp(rate / (sig.thresholds['synRate'] ?? 1000), 0.5, 1.0);
          destIP = synPkts[0]?.destIP; sourceIP = synPkts[0]?.sourceIP;
          for (const p of synPkts.slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      case 'bandwidth_anomaly': case 'traffic_spike': {
        const bytes = windowPackets.reduce((s, p) => s + p.size, 0);
        const bps = bytes / Math.max(timeWindow, 1);
        const threshold = sig.thresholds['minBytesPerSec'] ?? 10485760;
        if (bps >= threshold) {
          matched = true;
          confidence = clamp(bps / (threshold * 2), 0.5, 1.0);
          for (const p of windowPackets.slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      case 'beaconing': {
        const outPkts = windowPackets.filter(p => p.direction === 'outbound');
        if (outPkts.length >= (sig.thresholds['minBeacons'] ?? 10)) {
          const regularity = this.intervalRegularity(this.computeIntervals(outPkts));
          if (regularity >= (sig.thresholds['regularityThreshold'] ?? 0.85)) {
            matched = true;
            confidence = clamp(regularity, 0.5, 1.0);
            sourceIP = outPkts[0]?.sourceIP; destIP = outPkts[0]?.destIP;
            for (const p of outPkts.slice(0, 10)) relatedPackets.push(p.id);
          }
        }
        break;
      }

      case 'lateral_movement': {
        const internal = windowPackets.filter(p => isPrivateIP(p.sourceIP) && isPrivateIP(p.destIP));
        const conns = new Set(internal.map(p => `${p.sourceIP}->${p.destIP}`));
        if (conns.size >= (sig.thresholds['minNewConnections'] ?? 5)) {
          matched = true;
          confidence = clamp(conns.size / ((sig.thresholds['minNewConnections'] ?? 5) * 2), 0.5, 1.0);
          sourceIP = internal[0]?.sourceIP;
          for (const p of internal.slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      case 'command_and_control': {
        const outPkts = windowPackets.filter(p => p.direction === 'outbound');
        for (const [dest, pkts] of this.groupBy(outPkts, p => p.destIP)) {
          if (pkts.length >= (sig.thresholds['minMessages'] ?? 5) && !isPrivateIP(dest)) {
            matched = true;
            confidence = clamp(0.6 + pkts.length * 0.03, 0.5, 1.0);
            destIP = dest; sourceIP = pkts[0]?.sourceIP;
            for (const p of pkts.slice(0, 10)) relatedPackets.push(p.id);
            break;
          }
        }
        break;
      }

      case 'suspicious_dns': {
        const dnsPkts = windowPackets.filter(p => p.protocol.toLowerCase() === 'dns' || p.destPort === 53);
        const domains = new Set(dnsPkts.map(p => p.payload ?? '').filter(Boolean));
        if (domains.size >= (sig.thresholds['uniqueDomains'] ?? 5)) {
          matched = true;
          confidence = clamp(0.5 + domains.size * 0.05, 0.5, 1.0);
          sourceIP = dnsPkts[0]?.sourceIP;
          for (const p of dnsPkts.slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      case 'unusual_port': {
        const hiPort = windowPackets.filter(p => p.destPort > (sig.thresholds['portRange'] ?? 49152));
        if (hiPort.length >= (sig.thresholds['minPackets'] ?? 3)) {
          matched = true;
          confidence = clamp(0.4 + hiPort.length * 0.05, 0.4, 0.85);
          sourceIP = hiPort[0]?.sourceIP; destIP = hiPort[0]?.destIP;
          for (const p of hiPort.slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      case 'encrypted_tunnel': {
        const nonTLS = windowPackets.filter(p => ![443, 8443, 993, 995, 465].includes(p.destPort));
        const lg = nonTLS.filter(p => p.size > (sig.thresholds['minBytes'] ?? 10240));
        if (lg.length > 3) {
          matched = true;
          confidence = clamp(0.5 + lg.length * 0.05, 0.5, 0.9);
          sourceIP = lg[0]?.sourceIP; destIP = lg[0]?.destIP;
          for (const p of lg.slice(0, 10)) relatedPackets.push(p.id);
        }
        break;
      }

      default:
        break;
    }

    if (!matched) return null;

    return {
      id: generateId('ANOM'),
      type: sig.type,
      severity: sig.severity,
      description: sig.description,
      sourceIP,
      destIP,
      timestamp: Date.now(),
      confidence: round2(confidence),
      indicators: sig.indicators,
      relatedPackets,
    };
  }

  // ── Private: Behavioral Analysis ─────────────────────────────────────────

  private behavioralAnalysis(packets: PacketInfo[]): NetworkAnomaly[] {
    const anomalies: NetworkAnomaly[] = [];
    if (packets.length < 5) return anomalies;

    // Traffic spike detection: compare second half volume to first half
    const mid = Math.floor(packets.length / 2);
    const firstHalf = packets.slice(0, mid);
    const secondHalf = packets.slice(mid);
    const firstVol = firstHalf.reduce((s, p) => s + p.size, 0);
    const secondVol = secondHalf.reduce((s, p) => s + p.size, 0);

    if (firstVol > 0 && secondVol / firstVol > 3.0) {
      anomalies.push({
        id: generateId('ANOM'),
        type: 'traffic_spike',
        severity: 'medium',
        description: `Traffic volume increased ${round2(secondVol / firstVol)}x in the latter half of the capture`,
        timestamp: Date.now(),
        confidence: round2(clamp(0.5 + (secondVol / firstVol - 3) * 0.1, 0.5, 0.95)),
        indicators: ['volume_increase', 'baseline_deviation'],
        relatedPackets: secondHalf.slice(0, 5).map(p => p.id),
      });
    }

    // Protocol distribution anomaly: single protocol dominating unexpectedly
    const protoCounts = new Map<string, number>();
    for (const p of packets) {
      const proto = p.protocol.toLowerCase();
      protoCounts.set(proto, (protoCounts.get(proto) ?? 0) + 1);
    }

    for (const [proto, count] of protoCounts) {
      const ratio = count / packets.length;
      if (ratio > 0.9 && packets.length > 20 && !['tcp', 'https', 'http'].includes(proto)) {
        anomalies.push({
          id: generateId('ANOM'),
          type: 'protocol_violation',
          severity: 'low',
          description: `Protocol "${proto}" accounts for ${round2(ratio * 100)}% of traffic — unusual distribution`,
          timestamp: Date.now(),
          confidence: round2(clamp(ratio * 0.8, 0.4, 0.85)),
          indicators: ['protocol_dominance', 'unusual_distribution'],
          relatedPackets: packets.filter(p => p.protocol.toLowerCase() === proto).slice(0, 5).map(p => p.id),
        });
      }
    }

    // Destination concentration: many packets to a single external IP
    const outbound = packets.filter(p => p.direction === 'outbound');
    if (outbound.length > 10) {
      const destCounts = new Map<string, number>();
      for (const p of outbound) {
        destCounts.set(p.destIP, (destCounts.get(p.destIP) ?? 0) + 1);
      }

      for (const [dest, count] of destCounts) {
        if (count > outbound.length * 0.7 && !isPrivateIP(dest)) {
          anomalies.push({
            id: generateId('ANOM'),
            type: 'beaconing',
            severity: 'medium',
            description: `${round2(count / outbound.length * 100)}% of outbound traffic directed at ${dest}`,
            destIP: dest,
            timestamp: Date.now(),
            confidence: round2(clamp(count / outbound.length, 0.5, 0.9)),
            indicators: ['destination_concentration', 'external_host', 'outbound_bias'],
            relatedPackets: outbound.filter(p => p.destIP === dest).slice(0, 5).map(p => p.id),
          });
        }
      }
    }

    return anomalies;
  }

  // ── Private: Utility Methods ─────────────────────────────────────────────

  private groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const key = keyFn(item);
      const group = map.get(key);
      if (group) {
        group.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return map;
  }

  private computeIntervals(packets: PacketInfo[]): number[] {
    const sorted = [...packets].sort((a, b) => a.timestamp - b.timestamp);
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i].timestamp - sorted[i - 1].timestamp);
    }
    return intervals;
  }

  private intervalRegularity(intervals: number[]): number {
    if (intervals.length < 2) return 0;
    const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    if (mean === 0) return 0;
    const variance = intervals.reduce((s, v) => s + (v - mean) ** 2, 0) / intervals.length;
    const stddev = Math.sqrt(variance);
    const cv = stddev / mean;
    return round2(clamp(1 - cv, 0, 1));
  }

  private summarizeDirection(packets: PacketInfo[]): string {
    const inbound = packets.filter(p => p.direction === 'inbound').length;
    const outbound = packets.filter(p => p.direction === 'outbound').length;
    const internal = packets.filter(p => p.direction === 'internal').length;
    return `inbound: ${inbound}, outbound: ${outbound}, internal: ${internal}`;
  }

  private inferNodeType(
    ip: string,
    port: number,
    packets: PacketInfo[],
  ): TopologyNode['type'] {
    if (ip.endsWith('.1') || ip.endsWith('.254')) return 'router';

    const asServer = packets.filter(p => p.destIP === ip);
    const serverPorts = new Set(asServer.map(p => p.destPort));

    if (serverPorts.has(80) || serverPorts.has(443) || serverPorts.has(8080)) return 'server';
    if (serverPorts.has(53) || serverPorts.has(25) || serverPorts.has(3306)) return 'server';

    if (!isPrivateIP(ip)) return 'unknown';

    const asClient = packets.filter(p => p.sourceIP === ip);
    if (asClient.length > asServer.length * 2) return 'workstation';

    if (port > 49152) return 'workstation';

    return 'unknown';
  }

  private portToService(port: number): string | null {
    const map: Record<number, string> = {
      20: 'FTP-data', 21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
      53: 'DNS', 67: 'DHCP', 68: 'DHCP', 80: 'HTTP', 110: 'POP3',
      123: 'NTP', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB', 993: 'IMAPS',
      995: 'POP3S', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
      5900: 'VNC', 6379: 'Redis', 8080: 'HTTP-proxy', 8443: 'HTTPS-alt',
      27017: 'MongoDB',
    };
    return map[port] ?? null;
  }

  private isEncryptedProtocol(protocol: string, port: number): boolean {
    const encryptedProtos = ['https', 'tls', 'ssh', 'imaps', 'pop3s', 'smtps'];
    if (encryptedProtos.includes(protocol.toLowerCase())) return true;
    const encryptedPorts = [443, 8443, 993, 995, 465, 22, 636];
    return encryptedPorts.includes(port);
  }

  private inferIncidentType(title: string, anomalyIds: string[]): string {
    const lower = title.toLowerCase();
    const anomalyTypes = anomalyIds
      .map(id => this.anomalyHistory.find(a => a.id === id)?.type)
      .filter((t): t is AnomalyType => t !== undefined);

    if (anomalyTypes.includes('port_scan') || lower.includes('scan')) return 'port_scan';
    if (anomalyTypes.includes('brute_force') || lower.includes('brute')) return 'brute_force';
    if (anomalyTypes.includes('data_exfiltration') || lower.includes('exfil')) return 'data_exfiltration';
    if (anomalyTypes.includes('dns_tunneling') || lower.includes('dns tunnel')) return 'dns_tunneling';
    if (anomalyTypes.includes('syn_flood') || lower.includes('syn flood') || lower.includes('ddos')) return 'syn_flood';
    if (anomalyTypes.includes('lateral_movement') || lower.includes('lateral')) return 'lateral_movement';
    if (anomalyTypes.includes('command_and_control') || lower.includes('c2') || lower.includes('command')) return 'command_and_control';
    if (anomalyTypes.includes('arp_spoofing') || lower.includes('arp')) return 'arp_spoofing';
    return anomalyTypes[0] ?? 'port_scan';
  }
}
