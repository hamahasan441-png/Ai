/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🛡️  C Y B E R   T H R E A T   I N T E L L I G E N C E             ║
 * ║                                                                             ║
 * ║   Advanced threat intelligence engine:                                      ║
 * ║     identify → correlate → analyze → report                                 ║
 * ║                                                                             ║
 * ║     • APT group identification and tracking                                 ║
 * ║     • MITRE ATT&CK technique mapping (14 tactics, 50+ techniques)           ║
 * ║     • Indicator of Compromise (IOC) classification & enrichment             ║
 * ║     • Command-and-control infrastructure detection                          ║
 * ║     • Malware family classification by behavioral traits                    ║
 * ║     • Threat campaign correlation and reporting                             ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Helpers ──────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-_./,;:()[\]{}]+/)
    .filter(Boolean)
}

function matchScore(tokens: string[], keywords: string[]): number {
  let score = 0
  for (const kw of keywords) {
    for (const token of tokens) {
      if (token === kw) {
        score += 2
      } else if (token.includes(kw) || kw.includes(token)) {
        score += 1
      }
    }
  }
  return score
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface CyberThreatIntelConfig {
  maxResults: number
  enableAPTTracking: boolean
  enableMitreMapping: boolean
  enableIOCEnrichment: boolean
  enableC2Detection: boolean
  enableMalwareClassification: boolean
  confidenceThreshold: number
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical'
}

export interface CyberThreatIntelStats {
  totalActorLookups: number
  totalMitreMappings: number
  totalIOCsAnalyzed: number
  totalC2Detections: number
  totalMalwareClassifications: number
  totalCorrelations: number
  totalReportsGenerated: number
  feedbackCount: number
  avgFeedbackScore: number
}

export interface ThreatActor {
  id: string
  name: string
  aliases: string[]
  country: string
  motivation: string
  sophistication: 'low' | 'medium' | 'high' | 'advanced' | 'nation-state'
  active: boolean
  ttps: string[]
  targetSectors: string[]
  targetRegions: string[]
  knownCampaigns: string[]
}

export interface APTGroup extends ThreatActor {
  aptNumber: number | null
  firstSeen: string
  lastSeen: string
  primaryTools: string[]
  attribution: string
}

export interface MitreAttackTechnique {
  id: string
  name: string
  tactic: string
  description: string
  platforms: string[]
  dataSource: string[]
  detection: string
  mitigation: string
  subtechniques: string[]
}

export interface IndicatorOfCompromise {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'registry' | 'mutex' | 'file_path'
  value: string
  confidence: number
  source: string
  firstSeen: string
  lastSeen: string
  tags: string[]
  relatedActors: string[]
}

export interface ThreatCampaign {
  id: string
  name: string
  description: string
  actors: string[]
  timeline: { start: string; end: string }
  targets: string[]
  techniques: string[]
  iocs: IndicatorOfCompromise[]
  status: 'active' | 'inactive' | 'emerging' | 'historical'
}

export interface C2Infrastructure {
  type: 'http' | 'https' | 'dns' | 'icmp' | 'custom'
  protocol: string
  indicators: string[]
  beaconInterval: number
  jitter: number
  encryption: string
}

export interface MalwareFamily {
  name: string
  type:
    | 'trojan'
    | 'ransomware'
    | 'wiper'
    | 'rat'
    | 'backdoor'
    | 'rootkit'
    | 'botnet'
    | 'cryptominer'
    | 'infostealer'
    | 'loader'
  capabilities: string[]
  delivery: string[]
  persistence: string[]
  c2: string[]
  notableVariants: string[]
}

export interface ThreatReport {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  actors: string[]
  techniques: string[]
  iocs: IndicatorOfCompromise[]
  recommendations: string[]
  confidence: number
}

// ── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_CYBER_THREAT_INTEL_CONFIG: CyberThreatIntelConfig = {
  maxResults: 50,
  enableAPTTracking: true,
  enableMitreMapping: true,
  enableIOCEnrichment: true,
  enableC2Detection: true,
  enableMalwareClassification: true,
  confidenceThreshold: 0.5,
  defaultSeverity: 'medium',
}

/** IOC classification regex patterns for identifying indicator types. */
const IOC_PATTERNS: Record<IndicatorOfCompromise['type'], RegExp> = {
  ip: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  domain: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
  hash: /^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  registry: /^(?:HKLM|HKCU|HKCR|HKU|HKCC)\\[\w\\]+$/i,
  mutex: /^(?:Global|Local)\\[\w-]+$/i,
  file_path: /^(?:[A-Z]:\\|\/(?:usr|etc|var|opt|home))[\w\\/.-]+$/i,
}

// ── APT Database Builder ─────────────────────────────────────────────────────

function buildAPTDatabase(): APTGroup[] {
  const groups: APTGroup[] = []

  const add = (
    id: string,
    name: string,
    aliases: string[],
    country: string,
    motivation: string,
    sophistication: ThreatActor['sophistication'],
    active: boolean,
    ttps: string[],
    targetSectors: string[],
    targetRegions: string[],
    knownCampaigns: string[],
    aptNumber: number | null,
    firstSeen: string,
    lastSeen: string,
    primaryTools: string[],
    attribution: string,
  ): void => {
    groups.push({
      id,
      name,
      aliases,
      country,
      motivation,
      sophistication,
      active,
      ttps,
      targetSectors,
      targetRegions,
      knownCampaigns,
      aptNumber,
      firstSeen,
      lastSeen,
      primaryTools,
      attribution,
    })
  }

  add(
    'TA-001',
    'APT28',
    ['Fancy Bear', 'Sofacy', 'Sednit', 'Pawn Storm'],
    'Russia',
    'espionage',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1071', 'T1027', 'T1083', 'T1005'],
    ['government', 'military', 'defense', 'media', 'energy'],
    ['NATO', 'Europe', 'United States', 'Middle East'],
    ['Operation Pawn Storm', 'Sofacy Campaign', 'Zebrocy Deployment'],
    28,
    '2004',
    '2024',
    ['X-Agent', 'Zebrocy', 'Seduploader', 'Koadic'],
    'GRU Unit 26165',
  )

  add(
    'TA-002',
    'APT29',
    ['Cozy Bear', 'The Dukes', 'NOBELIUM', 'Midnight Blizzard'],
    'Russia',
    'espionage',
    'nation-state',
    true,
    ['T1195', 'T1059', 'T1071', 'T1027', 'T1110', 'T1053'],
    ['government', 'think tanks', 'healthcare', 'technology', 'energy'],
    ['Europe', 'United States', 'Asia'],
    ['SolarWinds Compromise', 'Operation Ghost', 'WellMess Campaign'],
    29,
    '2008',
    '2024',
    ['WellMess', 'WellMail', 'Sunburst', 'EnvyScout'],
    'SVR',
  )

  add(
    'TA-003',
    'Lazarus Group',
    ['Hidden Cobra', 'Guardians of Peace', 'ZINC', 'Diamond Sleet'],
    'North Korea',
    'financial gain',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1486', 'T1071', 'T1027', 'T1055'],
    ['financial', 'cryptocurrency', 'defense', 'entertainment', 'technology'],
    ['Global', 'United States', 'South Korea', 'Japan'],
    ['WannaCry', 'Sony Pictures Attack', 'Ronin Bridge Heist', 'AppleJeus'],
    null,
    '2009',
    '2024',
    ['Manuscrypt', 'Fallchill', 'Bankshot', 'HOPLIGHT'],
    'RGB',
  )

  add(
    'TA-004',
    'Equation Group',
    ['EQGRP', 'Tilded Team'],
    'United States',
    'espionage',
    'nation-state',
    false,
    ['T1195', 'T1542', 'T1027', 'T1059', 'T1071', 'T1573'],
    ['government', 'military', 'telecommunications', 'energy', 'aerospace'],
    ['Middle East', 'Asia', 'Europe', 'Global'],
    ['Stuxnet Support', 'DoubleFantasy', 'EquationDrug'],
    null,
    '2001',
    '2017',
    ['EquationDrug', 'GrayFish', 'Fanny', 'DoubleFantasy'],
    'NSA TAO',
  )

  add(
    'TA-005',
    'Sandworm',
    ['Voodoo Bear', 'IRIDIUM', 'Seashell Blizzard', 'TeleBots'],
    'Russia',
    'disruption',
    'nation-state',
    true,
    ['T1059', 'T1486', 'T1561', 'T1071', 'T1021', 'T1053'],
    ['energy', 'government', 'media', 'transportation', 'critical infrastructure'],
    ['Ukraine', 'Europe', 'United States'],
    ['NotPetya', 'Industroyer', 'Olympic Destroyer', 'Cyclops Blink'],
    null,
    '2009',
    '2024',
    ['Industroyer', 'NotPetya', 'CaddyWiper', 'ArguePatch'],
    'GRU Unit 74455',
  )

  add(
    'TA-006',
    'Turla',
    ['Snake', 'Venomous Bear', 'Uroburos', 'Krypton', 'Secret Blizzard'],
    'Russia',
    'espionage',
    'nation-state',
    true,
    ['T1071', 'T1059', 'T1027', 'T1574', 'T1112', 'T1005'],
    ['government', 'military', 'embassy', 'research', 'pharmaceutical'],
    ['Europe', 'Middle East', 'Central Asia', 'United States'],
    ['Penguin Turla', 'Carbon Campaign', 'Kazuar Deployment'],
    null,
    '2004',
    '2024',
    ['Snake', 'Carbon', 'Kazuar', 'ComRAT', 'LightNeuron'],
    'FSB Center 16',
  )

  add(
    'TA-007',
    'Carbanak',
    ['FIN7', 'Anunak', 'Carbon Spider'],
    'Russia',
    'financial gain',
    'high',
    true,
    ['T1566', 'T1059', 'T1071', 'T1005', 'T1055', 'T1021'],
    ['financial', 'retail', 'hospitality', 'restaurant'],
    ['Global', 'Europe', 'United States', 'Asia'],
    ['Carbanak Campaign', 'Cobalt Strike Operations', 'GRIFFON Malware'],
    null,
    '2013',
    '2024',
    ['Carbanak', 'GRIFFON', 'HALFBAKED', 'Cobalt Strike'],
    'Criminal syndicate',
  )

  add(
    'TA-008',
    'APT41',
    ['Winnti', 'Double Dragon', 'Barium', 'Brass Typhoon'],
    'China',
    'espionage and financial gain',
    'nation-state',
    true,
    ['T1195', 'T1059', 'T1071', 'T1027', 'T1055', 'T1053'],
    ['technology', 'healthcare', 'gaming', 'telecommunications', 'government'],
    ['Global', 'United States', 'Europe', 'Southeast Asia'],
    ['ShadowPad Campaign', 'CCleaner Supply Chain', 'Winnti Campaigns'],
    41,
    '2012',
    '2024',
    ['ShadowPad', 'Winnti', 'POISONPLUG', 'Cobalt Strike'],
    'MSS Chengdu',
  )

  add(
    'TA-009',
    'DarkSide',
    ['BlackMatter', 'Carbon Spider affiliate'],
    'Russia',
    'financial gain',
    'high',
    false,
    ['T1486', 'T1059', 'T1071', 'T1021', 'T1048', 'T1027'],
    ['energy', 'critical infrastructure', 'manufacturing', 'legal'],
    ['United States', 'Europe', 'Global'],
    ['Colonial Pipeline Attack', 'DarkSide RaaS Operations'],
    null,
    '2020',
    '2021',
    ['DarkSide Ransomware', 'Cobalt Strike', 'Mimikatz'],
    'Criminal group (RaaS)',
  )

  add(
    'TA-010',
    'REvil',
    ['Sodinokibi', 'Gold Southfield'],
    'Russia',
    'financial gain',
    'high',
    false,
    ['T1486', 'T1059', 'T1071', 'T1048', 'T1027', 'T1055'],
    ['technology', 'legal', 'manufacturing', 'retail', 'insurance'],
    ['Global', 'United States', 'Europe'],
    ['Kaseya Supply Chain Attack', 'JBS Foods Attack', 'Travelex Attack'],
    null,
    '2019',
    '2022',
    ['Sodinokibi', 'Cobalt Strike', 'QakBot', 'IcedID'],
    'Criminal group (RaaS)',
  )

  add(
    'TA-011',
    'Hafnium',
    ['Silk Typhoon'],
    'China',
    'espionage',
    'nation-state',
    true,
    ['T1190', 'T1059', 'T1071', 'T1005', 'T1039', 'T1560'],
    ['government', 'defense', 'healthcare', 'education', 'NGO'],
    ['United States', 'Europe', 'Asia'],
    ['ProxyLogon Exchange Exploitation', 'Exchange Server Mass Exploitation'],
    null,
    '2021',
    '2024',
    ['China Chopper', 'ASPXSpy', 'Covenant', 'Nishang'],
    'MSS affiliated',
  )

  add(
    'TA-012',
    'APT1',
    ['Comment Crew', 'Comment Panda', 'Byzantine Candor'],
    'China',
    'espionage',
    'nation-state',
    false,
    ['T1566', 'T1059', 'T1071', 'T1005', 'T1056', 'T1053'],
    ['technology', 'aerospace', 'energy', 'telecommunications', 'manufacturing'],
    ['United States', 'Europe', 'Japan'],
    ['Operation Shady RAT', 'Night Dragon Support', 'Comment Crew Espionage'],
    1,
    '2006',
    '2015',
    ['WEBC2', 'BISCUIT', 'GETMAIL', 'SEASALT'],
    'PLA Unit 61398',
  )

  add(
    'TA-013',
    'APT10',
    ['Stone Panda', 'MenuPass', 'Red Apollo', 'Cicada'],
    'China',
    'espionage',
    'nation-state',
    true,
    ['T1195', 'T1059', 'T1071', 'T1005', 'T1090', 'T1053'],
    ['technology', 'MSP', 'healthcare', 'defense', 'aerospace'],
    ['Global', 'Japan', 'United States', 'Europe'],
    ['Operation Cloud Hopper', 'Operation Soft Cell', 'A41APT Campaign'],
    10,
    '2009',
    '2024',
    ['PlugX', 'QuasarRAT', 'Ecipekac', 'SodaMaster'],
    'MSS Tianjin',
  )

  add(
    'TA-014',
    'APT32',
    ['OceanLotus', 'Canvas Cyclone', 'SeaLotus'],
    'Vietnam',
    'espionage',
    'high',
    true,
    ['T1566', 'T1059', 'T1071', 'T1027', 'T1055', 'T1053'],
    ['government', 'media', 'manufacturing', 'human rights', 'automotive'],
    ['Southeast Asia', 'United States', 'Europe', 'East Asia'],
    ['OceanLotus Campaigns', 'APT32 COVID-19 Espionage'],
    32,
    '2014',
    '2024',
    ['METALJACK', 'Cobalt Kitty', 'Denis', 'Kerrdown'],
    'Vietnamese government',
  )

  add(
    'TA-015',
    'APT33',
    ['Elfin', 'Magnallium', 'Refined Kitten', 'Peach Sandstorm'],
    'Iran',
    'espionage and disruption',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1071', 'T1027', 'T1078', 'T1486'],
    ['energy', 'aerospace', 'defense', 'petrochemical', 'government'],
    ['Middle East', 'United States', 'Europe', 'Asia'],
    ['Shamoon Attacks', 'Elfin Espionage Campaign'],
    33,
    '2013',
    '2024',
    ['Shamoon', 'Stonedrill', 'TurnedUp', 'POWERTON'],
    'IRGC affiliated',
  )

  add(
    'TA-016',
    'APT34',
    ['OilRig', 'Helix Kitten', 'Hazel Sandstorm', 'Crambus'],
    'Iran',
    'espionage',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1071', 'T1027', 'T1078', 'T1005'],
    ['government', 'financial', 'energy', 'telecommunications', 'chemical'],
    ['Middle East', 'United States', 'Europe'],
    ['OilRig Campaign', 'DNSpionage', 'Karkoff Campaign'],
    34,
    '2014',
    '2024',
    ['BONDUPDATER', 'QUADAGENT', 'OopsIE', 'Karkoff'],
    'MOIS affiliated',
  )

  add(
    'TA-017',
    'Kimsuky',
    ['Velvet Chollima', 'Thallium', 'Emerald Sleet', 'Black Banshee'],
    'North Korea',
    'espionage',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1071', 'T1056', 'T1005', 'T1027'],
    ['government', 'think tanks', 'academia', 'media', 'defense'],
    ['South Korea', 'Japan', 'United States', 'Europe'],
    ['BabyShark Campaign', 'AppleSeed Campaigns', 'Operation Kabar Cobra'],
    null,
    '2012',
    '2024',
    ['BabyShark', 'AppleSeed', 'FlowerPower', 'GoldDragon'],
    'RGB Bureau 121',
  )

  add(
    'TA-018',
    'Conti',
    ['Wizard Spider', 'Gold Ulrick'],
    'Russia',
    'financial gain',
    'high',
    false,
    ['T1486', 'T1059', 'T1071', 'T1021', 'T1048', 'T1055'],
    ['healthcare', 'government', 'education', 'critical infrastructure'],
    ['Global', 'United States', 'Europe'],
    ['Conti Ransomware Operations', 'Costa Rica Government Attack'],
    null,
    '2020',
    '2022',
    ['Conti Ransomware', 'BazarLoader', 'TrickBot', 'Cobalt Strike'],
    'Criminal group',
  )

  add(
    'TA-019',
    'LockBit',
    ['Gold Mystic', 'LockBit Gang'],
    'Russia',
    'financial gain',
    'high',
    true,
    ['T1486', 'T1059', 'T1071', 'T1021', 'T1048', 'T1562'],
    ['healthcare', 'government', 'financial', 'manufacturing', 'technology'],
    ['Global'],
    ['LockBit 2.0 Campaign', 'LockBit 3.0 Campaign', 'Royal Mail Attack'],
    null,
    '2019',
    '2024',
    ['LockBit Ransomware', 'StealBit', 'Cobalt Strike', 'Mimikatz'],
    'Criminal group (RaaS)',
  )

  add(
    'TA-020',
    'MuddyWater',
    ['Mercury', 'Mango Sandstorm', 'Static Kitten', 'Seedworm'],
    'Iran',
    'espionage',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1071', 'T1027', 'T1053', 'T1055'],
    ['government', 'telecommunications', 'defense', 'oil and gas'],
    ['Middle East', 'Central Asia', 'Europe', 'North America'],
    ['MuddyWater Espionage', 'Earth Vetala Campaign', 'PhonyC2 Operations'],
    null,
    '2017',
    '2024',
    ['POWERSTATS', 'MuddyC3', 'PhonyC2', 'SimpleHarm'],
    'MOIS',
  )

  add(
    'TA-021',
    'Gamaredon',
    ['Primitive Bear', 'Aqua Blizzard', 'Actinium', 'Shuckworm'],
    'Russia',
    'espionage',
    'medium',
    true,
    ['T1566', 'T1059', 'T1071', 'T1027', 'T1105', 'T1547'],
    ['government', 'military', 'NGO', 'judiciary', 'law enforcement'],
    ['Ukraine'],
    ['Gamaredon Ukraine Campaigns', 'Pterodo VBS Operations'],
    null,
    '2013',
    '2024',
    ['Pterodo', 'Gamaredon VBS', 'EvilGnome', 'PowerPunch'],
    'FSB Crimea',
  )

  add(
    'TA-022',
    'Charming Kitten',
    ['APT35', 'Phosphorus', 'Mint Sandstorm', 'NewsBeef'],
    'Iran',
    'espionage',
    'nation-state',
    true,
    ['T1566', 'T1059', 'T1071', 'T1078', 'T1056', 'T1005'],
    ['government', 'academia', 'media', 'human rights', 'defense'],
    ['Middle East', 'United States', 'Europe', 'Israel'],
    ['CharmPower Campaign', 'SpoofedScholars', 'HYPERSCRAPE Operations'],
    35,
    '2014',
    '2024',
    ['CharmPower', 'HYPERSCRAPE', 'BellaCiao', 'PowerLess'],
    'IRGC IO',
  )

  return groups
}

// ── MITRE ATT&CK Database Builder ────────────────────────────────────────────

function buildMitreTechniques(): MitreAttackTechnique[] {
  const techniques: MitreAttackTechnique[] = []

  const add = (
    id: string,
    name: string,
    tactic: string,
    description: string,
    platforms: string[],
    dataSource: string[],
    detection: string,
    mitigation: string,
    subtechniques: string[],
  ): void => {
    techniques.push({
      id,
      name,
      tactic,
      description,
      platforms,
      dataSource,
      detection,
      mitigation,
      subtechniques,
    })
  }

  // ── Initial Access ──
  add(
    'T1566',
    'Phishing',
    'initial-access',
    'Adversaries send phishing messages to gain access to victim systems via malicious attachments or links.',
    ['Windows', 'macOS', 'Linux'],
    ['Email Gateway', 'Mail Server', 'Network Traffic'],
    'Monitor for suspicious email attachments, links, and sender anomalies',
    'User training, email filtering, attachment sandboxing, URL reputation checks',
    ['T1566.001', 'T1566.002', 'T1566.003'],
  )

  add(
    'T1190',
    'Exploit Public-Facing Application',
    'initial-access',
    'Adversaries exploit vulnerabilities in internet-facing applications to gain initial access.',
    ['Windows', 'macOS', 'Linux', 'Network'],
    ['Application Log', 'Network Traffic'],
    'Monitor web application logs for exploitation attempts and unusual requests',
    'Patch management, WAF deployment, input validation, vulnerability scanning',
    [],
  )

  add(
    'T1195',
    'Supply Chain Compromise',
    'initial-access',
    'Adversaries manipulate products or delivery mechanisms prior to receipt by a final consumer.',
    ['Windows', 'macOS', 'Linux'],
    ['File Monitoring', 'Binary Integrity'],
    'Verify integrity of software updates and third-party components',
    'Software supply chain security, code signing, vendor auditing, SBOM tracking',
    ['T1195.001', 'T1195.002', 'T1195.003'],
  )

  add(
    'T1078',
    'Valid Accounts',
    'initial-access',
    'Adversaries use compromised credentials to gain access and maintain persistence.',
    ['Windows', 'macOS', 'Linux', 'Cloud'],
    ['Authentication Logs', 'Logon Session'],
    'Monitor for anomalous logon patterns, impossible travel, and credential misuse',
    'MFA enforcement, credential monitoring, privileged access management',
    ['T1078.001', 'T1078.002', 'T1078.003', 'T1078.004'],
  )

  // ── Execution ──
  add(
    'T1059',
    'Command and Scripting Interpreter',
    'execution',
    'Adversaries abuse command-line interpreters and scripting engines to execute commands.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command', 'Script'],
    'Monitor process creation for scripting engines; log command-line arguments',
    'Script execution policies, application allowlisting, PowerShell constrained mode',
    ['T1059.001', 'T1059.003', 'T1059.005', 'T1059.006', 'T1059.007'],
  )

  add(
    'T1053',
    'Scheduled Task/Job',
    'execution',
    'Adversaries abuse task scheduling to execute malicious code at system startup or on a schedule.',
    ['Windows', 'macOS', 'Linux'],
    ['Scheduled Job', 'Process', 'Command'],
    'Monitor scheduled task creation and modification events',
    'Restrict scheduled task permissions, audit task configurations regularly',
    ['T1053.002', 'T1053.003', 'T1053.005'],
  )

  add(
    'T1204',
    'User Execution',
    'execution',
    'Adversaries rely on user interaction to execute malicious payloads such as opening files or clicking links.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'File', 'Network Traffic'],
    'Monitor for execution of files from suspicious locations after user interaction',
    'Security awareness training, email filtering, application sandboxing',
    ['T1204.001', 'T1204.002', 'T1204.003'],
  )

  add(
    'T1047',
    'Windows Management Instrumentation',
    'execution',
    'Adversaries use WMI to execute malicious commands and payloads on local and remote systems.',
    ['Windows'],
    ['Process', 'WMI', 'Command'],
    'Monitor WMI event subscriptions and process creation via wmiprvse.exe',
    'Disable unnecessary WMI access, monitor WMI activity with enhanced logging',
    [],
  )

  // ── Persistence ──
  add(
    'T1547',
    'Boot or Logon Autostart Execution',
    'persistence',
    'Adversaries configure system settings to automatically execute programs during system boot or logon.',
    ['Windows', 'macOS', 'Linux'],
    ['Registry', 'File', 'Process'],
    'Monitor registry run keys, startup folders, and autostart configuration changes',
    'Restrict registry permissions, monitor startup locations, application allowlisting',
    ['T1547.001', 'T1547.004', 'T1547.009'],
  )

  add(
    'T1543',
    'Create or Modify System Process',
    'persistence',
    'Adversaries create or modify system-level processes to execute malicious payloads repeatedly.',
    ['Windows', 'macOS', 'Linux'],
    ['Service', 'Process', 'Command'],
    'Monitor new service installations and modifications to existing services',
    'Restrict service creation permissions, monitor service registry changes',
    ['T1543.001', 'T1543.002', 'T1543.003'],
  )

  add(
    'T1542',
    'Pre-OS Boot',
    'persistence',
    'Adversaries abuse pre-OS boot mechanisms to establish persistence below the operating system.',
    ['Windows', 'Linux', 'Network'],
    ['Firmware', 'MBR', 'Drive'],
    'Monitor firmware integrity checks and MBR/VBR modifications',
    'Secure Boot, firmware integrity monitoring, UEFI security features',
    ['T1542.001', 'T1542.003'],
  )

  add(
    'T1505',
    'Server Software Component',
    'persistence',
    'Adversaries install web shells or modify server software to maintain persistent access.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Process', 'Network Traffic'],
    'Monitor for unexpected files in web-accessible directories and process anomalies',
    'File integrity monitoring, web application firewall, restrict file uploads',
    ['T1505.003'],
  )

  // ── Privilege Escalation ──
  add(
    'T1055',
    'Process Injection',
    'privilege-escalation',
    'Adversaries inject code into processes to evade detection and elevate privileges.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Module', 'OS API'],
    'Monitor for suspicious memory allocation, remote thread creation, and module loads',
    'Endpoint protection, behavior-based detection, restrict debug privileges',
    ['T1055.001', 'T1055.002', 'T1055.003', 'T1055.012'],
  )

  add(
    'T1068',
    'Exploitation for Privilege Escalation',
    'privilege-escalation',
    'Adversaries exploit software vulnerabilities to gain elevated privileges on a system.',
    ['Windows', 'macOS', 'Linux'],
    ['Application Log', 'Process'],
    'Monitor for abnormal process behavior and exploit indicators',
    'Patch management, exploit mitigation (DEP, ASLR), least privilege principle',
    [],
  )

  add(
    'T1548',
    'Abuse Elevation Control Mechanism',
    'privilege-escalation',
    'Adversaries bypass mechanisms designed to control elevation of privilege to gain higher permissions.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command', 'OS API'],
    'Monitor for UAC bypass attempts and sudo abuse patterns',
    'Enforce UAC, restrict sudo access, monitor privilege escalation attempts',
    ['T1548.001', 'T1548.002', 'T1548.003'],
  )

  // ── Defense Evasion ──
  add(
    'T1027',
    'Obfuscated Files or Information',
    'defense-evasion',
    'Adversaries obfuscate payloads and files to make detection and analysis more difficult.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Process', 'Command'],
    'Detect obfuscation via entropy analysis, deobfuscation tools, and behavioral analysis',
    'Content inspection, deobfuscation at email/proxy gateways, sandbox analysis',
    ['T1027.001', 'T1027.002', 'T1027.003', 'T1027.005'],
  )

  add(
    'T1562',
    'Impair Defenses',
    'defense-evasion',
    'Adversaries disable or modify security tools and logging to avoid detection.',
    ['Windows', 'macOS', 'Linux', 'Cloud'],
    ['Process', 'Service', 'Windows Registry'],
    'Monitor for security tool process termination and logging configuration changes',
    'Tamper protection, centralized logging, security tool integrity monitoring',
    ['T1562.001', 'T1562.002', 'T1562.004'],
  )

  add(
    'T1070',
    'Indicator Removal',
    'defense-evasion',
    'Adversaries delete or modify artifacts to remove evidence of their presence.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Process', 'Windows Event Log'],
    'Monitor for event log clearing, timestomping, and file deletion of forensic artifacts',
    'Centralized logging, log integrity monitoring, immutable audit trails',
    ['T1070.001', 'T1070.003', 'T1070.004', 'T1070.006'],
  )

  add(
    'T1574',
    'Hijack Execution Flow',
    'defense-evasion',
    'Adversaries hijack the way an OS runs programs to execute their own malicious payloads.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Module', 'Process'],
    'Monitor DLL load order, PATH variable changes, and library preloading',
    'Restrict DLL search order, use safe library loading, verify binary signatures',
    ['T1574.001', 'T1574.002', 'T1574.006'],
  )

  // ── Credential Access ──
  add(
    'T1110',
    'Brute Force',
    'credential-access',
    'Adversaries use brute force techniques to attempt access to accounts with unknown passwords.',
    ['Windows', 'macOS', 'Linux', 'Cloud'],
    ['Authentication Logs', 'User Account'],
    'Monitor for high-volume failed authentication attempts from single sources',
    'Account lockout policies, MFA, rate limiting, CAPTCHA',
    ['T1110.001', 'T1110.002', 'T1110.003', 'T1110.004'],
  )

  add(
    'T1003',
    'OS Credential Dumping',
    'credential-access',
    'Adversaries dump credentials from the operating system to obtain account login information.',
    ['Windows', 'Linux'],
    ['Process', 'Command', 'OS API'],
    'Monitor for access to LSASS, SAM, credential files, and known dumping tools',
    'Credential Guard, restrict debug privileges, protect LSASS with PPL',
    ['T1003.001', 'T1003.002', 'T1003.003', 'T1003.006'],
  )

  add(
    'T1056',
    'Input Capture',
    'credential-access',
    'Adversaries capture user input through keylogging or input interception to collect credentials.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'OS API', 'Driver'],
    'Monitor for API hooking, keylogger processes, and input device driver modifications',
    'Endpoint protection, virtual keyboards for sensitive input, driver signing enforcement',
    ['T1056.001', 'T1056.002', 'T1056.004'],
  )

  // ── Discovery ──
  add(
    'T1083',
    'File and Directory Discovery',
    'discovery',
    'Adversaries enumerate files and directories to find information of interest on compromised systems.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command'],
    'Monitor for extensive file listing commands and recursive directory traversal',
    'Limit unnecessary file access, monitor bulk file access patterns',
    [],
  )

  add(
    'T1082',
    'System Information Discovery',
    'discovery',
    'Adversaries gather detailed information about the operating system and hardware configuration.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command', 'OS API'],
    'Monitor for reconnaissance commands (systeminfo, uname, ver) post-compromise',
    'Limit information disclosure, monitor for enumeration command sequences',
    [],
  )

  add(
    'T1016',
    'System Network Configuration Discovery',
    'discovery',
    'Adversaries look for details about the network configuration of compromised systems.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command'],
    'Monitor for network enumeration commands (ipconfig, ifconfig, netstat)',
    'Network segmentation, limit access to network configuration tools',
    ['T1016.001'],
  )

  add(
    'T1018',
    'Remote System Discovery',
    'discovery',
    'Adversaries attempt to identify other systems on the network for lateral movement.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command', 'Network Traffic'],
    'Monitor for network scanning tools and ping sweeps from internal hosts',
    'Network segmentation, restrict scanning tools, monitor ARP traffic',
    [],
  )

  // ── Lateral Movement ──
  add(
    'T1021',
    'Remote Services',
    'lateral-movement',
    'Adversaries use valid accounts to log into remote services such as RDP, SSH, or SMB.',
    ['Windows', 'macOS', 'Linux'],
    ['Logon Session', 'Network Traffic'],
    'Monitor for unusual remote login patterns and lateral connections',
    'MFA on remote services, network segmentation, just-in-time access',
    ['T1021.001', 'T1021.002', 'T1021.004', 'T1021.006'],
  )

  add(
    'T1570',
    'Lateral Tool Transfer',
    'lateral-movement',
    'Adversaries transfer tools and files between systems within a compromised environment.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Network Traffic', 'Named Pipe'],
    'Monitor for file transfers between internal systems using SMB, WinRM, or other protocols',
    'Network segmentation, restrict file sharing, monitor internal data transfers',
    [],
  )

  add(
    'T1210',
    'Exploitation of Remote Services',
    'lateral-movement',
    'Adversaries exploit vulnerabilities in remote services to gain access to other systems.',
    ['Windows', 'macOS', 'Linux'],
    ['Application Log', 'Network Traffic'],
    'Monitor for exploit attempts against internal services and unusual service crashes',
    'Patch management, network segmentation, least privilege for service accounts',
    [],
  )

  // ── Collection ──
  add(
    'T1005',
    'Data from Local System',
    'collection',
    'Adversaries search local system sources to find files and data of interest prior to exfiltration.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Process', 'Command'],
    'Monitor for unusual file access patterns and bulk file reads',
    'Data loss prevention, file access auditing, encrypt sensitive data at rest',
    [],
  )

  add(
    'T1039',
    'Data from Network Shared Drive',
    'collection',
    'Adversaries search network shares on compromised systems to find files of interest.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Network Traffic'],
    'Monitor for mass file access on network shares from unusual accounts',
    'Restrict share permissions, audit access, implement DLP on file servers',
    [],
  )

  add(
    'T1560',
    'Archive Collected Data',
    'collection',
    'Adversaries compress and encrypt collected data before exfiltration.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Process', 'Command'],
    'Monitor for archive utility execution and creation of large archive files',
    'Monitor for unusual compression tool usage, restrict archive tool access',
    ['T1560.001', 'T1560.002', 'T1560.003'],
  )

  // ── Command and Control ──
  add(
    'T1071',
    'Application Layer Protocol',
    'command-and-control',
    'Adversaries communicate using OSI application layer protocols to avoid detection.',
    ['Windows', 'macOS', 'Linux'],
    ['Network Traffic'],
    'Deep packet inspection, monitor for unusual protocol usage and beaconing patterns',
    'Network monitoring, protocol-aware firewalls, SSL/TLS inspection',
    ['T1071.001', 'T1071.002', 'T1071.003', 'T1071.004'],
  )

  add(
    'T1573',
    'Encrypted Channel',
    'command-and-control',
    'Adversaries encrypt C2 communications to conceal content from network monitoring.',
    ['Windows', 'macOS', 'Linux'],
    ['Network Traffic'],
    'Monitor for unusual encrypted connections, JA3/JA3S fingerprinting, certificate anomalies',
    'SSL/TLS inspection, certificate pinning enforcement, network traffic analysis',
    ['T1573.001', 'T1573.002'],
  )

  add(
    'T1090',
    'Proxy',
    'command-and-control',
    'Adversaries use proxies to direct C2 traffic through intermediary systems to avoid direct connections.',
    ['Windows', 'macOS', 'Linux'],
    ['Network Traffic'],
    'Monitor for connections through known proxy infrastructure and multi-hop patterns',
    'Block known proxy services, monitor for proxy tool usage, egress filtering',
    ['T1090.001', 'T1090.002', 'T1090.003'],
  )

  add(
    'T1105',
    'Ingress Tool Transfer',
    'command-and-control',
    'Adversaries transfer tools or files from an external system into the compromised environment.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Network Traffic'],
    'Monitor for file downloads from external sources and execution of newly created files',
    'Egress filtering, application allowlisting, monitor for download utilities',
    [],
  )

  // ── Exfiltration ──
  add(
    'T1048',
    'Exfiltration Over Alternative Protocol',
    'exfiltration',
    'Adversaries steal data by exfiltrating over a different protocol than the existing C2 channel.',
    ['Windows', 'macOS', 'Linux'],
    ['Network Traffic', 'Command'],
    'Monitor for unusual outbound protocols, DNS tunneling, and ICMP data exfiltration',
    'Network monitoring, egress filtering, DLP, DNS query logging',
    ['T1048.001', 'T1048.002', 'T1048.003'],
  )

  add(
    'T1041',
    'Exfiltration Over C2 Channel',
    'exfiltration',
    'Adversaries steal data by sending it over the existing command-and-control channel.',
    ['Windows', 'macOS', 'Linux'],
    ['Network Traffic', 'Command'],
    'Monitor for large outbound data transfers over known C2 connections',
    'Network monitoring, data loss prevention, connection volume analysis',
    [],
  )

  add(
    'T1567',
    'Exfiltration Over Web Service',
    'exfiltration',
    'Adversaries use legitimate web services such as cloud storage to exfiltrate data.',
    ['Windows', 'macOS', 'Linux'],
    ['Network Traffic', 'Command'],
    'Monitor for unusual uploads to cloud storage services and web-based file sharing',
    'Cloud access security broker (CASB), restrict uploads to unapproved services',
    ['T1567.001', 'T1567.002'],
  )

  // ── Impact ──
  add(
    'T1486',
    'Data Encrypted for Impact',
    'impact',
    'Adversaries encrypt data on target systems to interrupt availability and demand ransom.',
    ['Windows', 'macOS', 'Linux'],
    ['File', 'Process', 'Command'],
    'Monitor for mass file encryption, rapid file modification, and ransom note creation',
    'Offline backups, ransomware protection tools, file integrity monitoring',
    [],
  )

  add(
    'T1561',
    'Disk Wipe',
    'impact',
    'Adversaries wipe or corrupt disk data to interrupt availability and destroy forensic evidence.',
    ['Windows', 'macOS', 'Linux'],
    ['Drive', 'Process', 'Command'],
    'Monitor for raw disk access, MBR modifications, and mass file deletion',
    'Disk integrity monitoring, offline backups, endpoint protection',
    ['T1561.001', 'T1561.002'],
  )

  add(
    'T1529',
    'System Shutdown/Reboot',
    'impact',
    'Adversaries shut down or reboot systems to disrupt availability or complete destruction activities.',
    ['Windows', 'macOS', 'Linux'],
    ['Process', 'Command', 'Sensor Health'],
    'Monitor for unexpected shutdown/reboot commands from non-administrative contexts',
    'Restrict shutdown privileges, alert on abnormal shutdown patterns',
    [],
  )

  add(
    'T1498',
    'Network Denial of Service',
    'impact',
    'Adversaries perform network denial of service attacks to degrade or block availability.',
    ['Windows', 'macOS', 'Linux', 'Network'],
    ['Network Traffic', 'Sensor Health'],
    'Monitor for traffic volume spikes, SYN floods, and amplification attack patterns',
    'DDoS mitigation services, rate limiting, traffic scrubbing, CDN protection',
    ['T1498.001', 'T1498.002'],
  )

  // ── Resource Development (bonus tactic) ──
  add(
    'T1583',
    'Acquire Infrastructure',
    'resource-development',
    'Adversaries acquire infrastructure such as servers and domains to use during targeting.',
    ['PRE'],
    ['Domain Registration', 'WHOIS'],
    'Monitor for newly registered domains resembling organizational assets',
    'Domain monitoring, brand protection services, proactive takedown capabilities',
    ['T1583.001', 'T1583.003', 'T1583.006'],
  )

  add(
    'T1588',
    'Obtain Capabilities',
    'resource-development',
    'Adversaries obtain tools, exploits, and malware to use during operations.',
    ['PRE'],
    ['Malware Repository', 'Threat Intel Feeds'],
    'Monitor dark web markets and underground forums for tools targeting your organization',
    'Threat intelligence subscription, vulnerability management, proactive defense',
    ['T1588.001', 'T1588.002', 'T1588.005'],
  )

  // ── Reconnaissance ──
  add(
    'T1595',
    'Active Scanning',
    'reconnaissance',
    'Adversaries actively scan victim infrastructure to gather information for targeting.',
    ['PRE'],
    ['Network Traffic', 'Web Logs'],
    'Monitor for port scanning, vulnerability scanning, and web crawling from external IPs',
    'Intrusion detection systems, web application firewall, rate limiting',
    ['T1595.001', 'T1595.002'],
  )

  add(
    'T1589',
    'Gather Victim Identity Information',
    'reconnaissance',
    'Adversaries gather information about victim identities for use in targeting.',
    ['PRE'],
    ['Social Media', 'Web Credential'],
    'Monitor for credential exposure, social engineering attempts, and data broker listings',
    'Employee security training, credential monitoring, social media policies',
    ['T1589.001', 'T1589.002', 'T1589.003'],
  )

  return techniques
}

// ── Malware Family Database Builder ──────────────────────────────────────────

function buildMalwareFamilies(): MalwareFamily[] {
  const families: MalwareFamily[] = []

  const add = (
    name: string,
    type: MalwareFamily['type'],
    capabilities: string[],
    delivery: string[],
    persistence: string[],
    c2: string[],
    notableVariants: string[],
  ): void => {
    families.push({ name, type, capabilities, delivery, persistence, c2, notableVariants })
  }

  add(
    'Emotet',
    'loader',
    [
      'payload delivery',
      'credential theft',
      'lateral movement',
      'email harvesting',
      'process injection',
    ],
    ['phishing email', 'malicious macro', 'URL link'],
    ['registry run keys', 'scheduled tasks', 'Windows services'],
    ['HTTP POST', 'encrypted binary protocol', 'domain generation algorithm'],
    ['Emotet Epoch 4', 'Emotet Epoch 5'],
  )

  add(
    'TrickBot',
    'trojan',
    [
      'credential theft',
      'browser injection',
      'lateral movement',
      'network reconnaissance',
      'ransomware delivery',
    ],
    ['Emotet delivery', 'phishing email', 'exploit kit'],
    ['scheduled tasks', 'registry modification', 'service creation'],
    ['HTTPS', 'Tor hidden services', 'EmerDNS'],
    ['TrickBot gtag mor', 'TrickBot BazarLoader'],
  )

  add(
    'Cobalt Strike',
    'rat',
    [
      'command execution',
      'lateral movement',
      'credential harvesting',
      'file transfer',
      'process injection',
      'keylogging',
    ],
    ['phishing', 'exploit', 'waterhole', 'supply chain'],
    ['service creation', 'DLL hijacking', 'registry modification', 'COM object hijacking'],
    ['HTTPS beacon', 'DNS beacon', 'SMB named pipe', 'TCP reverse'],
    ['Cobalt Strike 4.x', 'Beacon', 'Sliver (alternative)'],
  )

  add(
    'Mimikatz',
    'infostealer',
    [
      'credential dumping',
      'Kerberos ticket extraction',
      'pass-the-hash',
      'pass-the-ticket',
      'DCSync',
    ],
    ['post-exploitation tool', 'lateral movement payload', 'included in malware kits'],
    ['not applicable - typically in-memory execution'],
    ['not applicable - post-exploitation tool'],
    ['Mimikatz 2.x', 'Pypykatz', 'SafetyKatz'],
  )

  add(
    'WannaCry',
    'ransomware',
    ['file encryption', 'SMB propagation', 'EternalBlue exploitation', 'kill switch domain check'],
    ['EternalBlue SMB exploit', 'network worm propagation'],
    ['Windows service', 'registry run key'],
    ['Tor hidden service', 'hardcoded onion addresses'],
    ['WannaCry 1.0', 'WannaCry 2.0'],
  )

  add(
    'NotPetya',
    'wiper',
    [
      'disk encryption',
      'MBR overwrite',
      'credential theft',
      'lateral movement via EternalBlue and Mimikatz',
    ],
    ['supply chain (M.E.Doc update)', 'EternalBlue', 'administrative shares'],
    ['MBR modification', 'scheduled reboot'],
    ['no true C2 - destructive wiper disguised as ransomware'],
    ['Petya', 'NotPetya', 'ExPetr'],
  )

  add(
    'PlugX',
    'backdoor',
    [
      'remote command execution',
      'file management',
      'keylogging',
      'screen capture',
      'network tunneling',
    ],
    ['spearphishing', 'watering hole', 'USB spreading'],
    ['DLL side-loading', 'registry modification', 'scheduled tasks'],
    ['HTTP/HTTPS', 'DNS', 'raw TCP', 'custom binary protocol'],
    ['PlugX v1', 'PlugX v2', 'ShadowPad (evolution)'],
  )

  add(
    'Ryuk',
    'ransomware',
    [
      'file encryption',
      'network share encryption',
      'backup deletion',
      'process/service termination',
    ],
    ['TrickBot delivery', 'BazarLoader', 'phishing'],
    ['registry run keys', 'scheduled tasks'],
    ['not applicable - operates post-initial-access'],
    ['Ryuk', 'Conti (successor)'],
  )

  add(
    'ShadowPad',
    'backdoor',
    [
      'remote command execution',
      'plugin architecture',
      'keylogging',
      'file management',
      'screen capture',
    ],
    ['supply chain compromise', 'spearphishing', 'exploitation'],
    ['DLL side-loading', 'service creation', 'registry modification'],
    ['HTTP/HTTPS', 'DNS', 'UDP', 'custom encrypted protocols'],
    ['ShadowPad (original)', 'ShadowPad modular variants'],
  )

  add(
    'QakBot',
    'trojan',
    [
      'credential theft',
      'email harvesting',
      'lateral movement',
      'ransomware delivery',
      'web injection',
    ],
    ['phishing email', 'malicious attachment', 'thread hijacking'],
    ['scheduled tasks', 'registry run keys', 'DLL injection'],
    ['HTTPS', 'encrypted TCP', 'proxy layer network'],
    ['QakBot/QBot', 'QakBot AA', 'QakBot Obama'],
  )

  add(
    'Snake',
    'rootkit',
    [
      'covert communication',
      'data exfiltration',
      'remote command execution',
      'file system manipulation',
      'network tap',
    ],
    ['spearphishing', 'watering hole', 'USB', 'local exploitation'],
    ['kernel driver', 'bootkit', 'virtual file system'],
    ['HTTP/HTTPS over custom encryption', 'peer-to-peer covert channel', 'broken DNS requests'],
    ['Snake/Uroburos', 'ComRAT (related)'],
  )

  add(
    'Industroyer',
    'trojan',
    [
      'ICS protocol manipulation',
      'power grid disruption',
      'OT network attacks',
      'SCADA protocol abuse',
    ],
    ['targeted deployment via network compromise', 'lateral movement in OT networks'],
    ['Windows service', 'backdoor component'],
    ['custom protocols', 'Tor-based C2'],
    ['Industroyer (2016)', 'Industroyer2 (2022)'],
  )

  add(
    'DarkSide Ransomware',
    'ransomware',
    [
      'file encryption',
      'data exfiltration',
      'double extortion',
      'ESXi encryption',
      'backup deletion',
    ],
    ['RDP compromise', 'phishing', 'exploit', 'access broker'],
    ['service creation', 'scheduled tasks'],
    ['HTTPS', 'Tor hidden service for leak site'],
    ['DarkSide v1', 'DarkSide v2', 'BlackMatter (rebrand)'],
  )

  return families
}

// ── C2 Detection Patterns ────────────────────────────────────────────────────

interface C2DetectionPattern {
  type: C2Infrastructure['type']
  protocol: string
  keywords: string[]
  intervalRange: [number, number]
  jitterRange: [number, number]
  encryption: string
  description: string
}

function buildC2Patterns(): C2DetectionPattern[] {
  return [
    {
      type: 'http',
      protocol: 'HTTP',
      keywords: ['beacon', 'http', 'get', 'post', 'user-agent', 'cookie', 'host header'],
      intervalRange: [30, 300],
      jitterRange: [0, 0.3],
      encryption: 'Base64 or XOR encoding',
      description:
        'HTTP beaconing with regular intervals, often using GET/POST with encoded payloads in cookies or parameters',
    },
    {
      type: 'https',
      protocol: 'HTTPS/TLS',
      keywords: ['https', 'tls', 'ssl', 'certificate', 'encrypted', 'beacon', 'malleable'],
      intervalRange: [60, 600],
      jitterRange: [0.1, 0.5],
      encryption: 'TLS 1.2/1.3 with self-signed or stolen certificates',
      description:
        'Encrypted HTTPS beaconing with malleable C2 profiles mimicking legitimate traffic',
    },
    {
      type: 'dns',
      protocol: 'DNS',
      keywords: ['dns', 'tunnel', 'subdomain', 'txt', 'cname', 'mx', 'resolution', 'query'],
      intervalRange: [10, 120],
      jitterRange: [0, 0.2],
      encryption: 'Base32/Base64 encoded subdomains',
      description:
        'DNS tunneling using encoded subdomain queries with data exfiltration via TXT or CNAME records',
    },
    {
      type: 'icmp',
      protocol: 'ICMP',
      keywords: ['icmp', 'ping', 'echo', 'covert', 'tunnel', 'type 8', 'type 0'],
      intervalRange: [5, 60],
      jitterRange: [0, 0.1],
      encryption: 'XOR or custom byte-level encoding in payload',
      description:
        'ICMP covert channel using echo request/reply payloads for bidirectional data transfer',
    },
    {
      type: 'custom',
      protocol: 'Custom Binary',
      keywords: ['binary', 'custom', 'proprietary', 'raw', 'tcp', 'udp', 'socket', 'non-standard'],
      intervalRange: [10, 1800],
      jitterRange: [0, 0.5],
      encryption: 'Custom encryption (AES, ChaCha20, or proprietary)',
      description:
        'Custom binary protocol over raw TCP/UDP with proprietary encryption and obfuscation',
    },
  ]
}

// ── Campaign Templates ───────────────────────────────────────────────────────

interface CampaignTemplate {
  keywords: string[]
  name: string
  description: string
  actors: string[]
  techniques: string[]
  status: ThreatCampaign['status']
}

function buildCampaignTemplates(): CampaignTemplate[] {
  return [
    {
      keywords: ['solarwinds', 'sunburst', 'supply chain', 'orion'],
      name: 'SolarWinds Supply Chain Compromise',
      description:
        'Nation-state supply chain attack via trojanized SolarWinds Orion updates distributing SUNBURST backdoor.',
      actors: ['APT29'],
      techniques: ['T1195', 'T1071', 'T1027', 'T1059', 'T1005'],
      status: 'historical',
    },
    {
      keywords: ['exchange', 'proxylogon', 'hafnium', 'owa', 'webshell'],
      name: 'Microsoft Exchange ProxyLogon Exploitation',
      description:
        'Mass exploitation of Microsoft Exchange Server vulnerabilities for webshell deployment and data theft.',
      actors: ['Hafnium'],
      techniques: ['T1190', 'T1505', 'T1059', 'T1005', 'T1560'],
      status: 'historical',
    },
    {
      keywords: ['colonial', 'pipeline', 'darkside', 'fuel', 'ransomware'],
      name: 'Colonial Pipeline Ransomware Attack',
      description:
        'DarkSide ransomware attack on Colonial Pipeline disrupting US East Coast fuel supply.',
      actors: ['DarkSide'],
      techniques: ['T1486', 'T1021', 'T1059', 'T1048'],
      status: 'historical',
    },
    {
      keywords: ['notpetya', 'ukraine', 'wiper', 'medoc', 'petya'],
      name: 'NotPetya Destructive Campaign',
      description:
        'Destructive wiper disguised as ransomware spreading via compromised M.E.Doc software updates.',
      actors: ['Sandworm'],
      techniques: ['T1195', 'T1561', 'T1486', 'T1021', 'T1003'],
      status: 'historical',
    },
    {
      keywords: ['wannacry', 'eternalblue', 'smb', 'ransomware', 'worm'],
      name: 'WannaCry Global Ransomware Outbreak',
      description:
        'Self-propagating ransomware leveraging EternalBlue exploit for worldwide SMB-based infection.',
      actors: ['Lazarus Group'],
      techniques: ['T1486', 'T1210', 'T1059'],
      status: 'historical',
    },
    {
      keywords: ['kaseya', 'revil', 'sodinokibi', 'vsa', 'supply chain'],
      name: 'Kaseya VSA Supply Chain Attack',
      description:
        'REvil ransomware distributed through compromised Kaseya VSA software updates to MSPs.',
      actors: ['REvil'],
      techniques: ['T1195', 'T1486', 'T1059', 'T1071'],
      status: 'historical',
    },
    {
      keywords: ['phishing', 'spearphishing', 'credential', 'harvest', 'email'],
      name: 'Targeted Spearphishing Campaign',
      description:
        'Precision spearphishing operation targeting specific organizations for initial access and credential theft.',
      actors: ['APT28', 'Charming Kitten'],
      techniques: ['T1566', 'T1078', 'T1056', 'T1005'],
      status: 'active',
    },
    {
      keywords: ['lockbit', 'ransomware', 'double extortion', 'leak'],
      name: 'LockBit Ransomware Operations',
      description:
        'Prolific ransomware-as-a-service operation using double extortion across global targets.',
      actors: ['LockBit'],
      techniques: ['T1486', 'T1021', 'T1048', 'T1059', 'T1562'],
      status: 'active',
    },
  ]
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class CyberThreatIntelligence {
  private readonly config: CyberThreatIntelConfig
  private readonly aptDatabase: APTGroup[]
  private readonly mitreTechniques: MitreAttackTechnique[]
  private readonly malwareFamilies: MalwareFamily[]
  private readonly c2Patterns: C2DetectionPattern[]
  private readonly campaignTemplates: CampaignTemplate[]

  private totalActorLookups = 0
  private totalMitreMappings = 0
  private totalIOCsAnalyzed = 0
  private totalC2Detections = 0
  private totalMalwareClassifications = 0
  private totalCorrelations = 0
  private totalReportsGenerated = 0
  private feedbackCount = 0
  private feedbackScores: number[] = []

  constructor(config?: Partial<CyberThreatIntelConfig>) {
    this.config = { ...DEFAULT_CYBER_THREAT_INTEL_CONFIG, ...config }
    this.aptDatabase = buildAPTDatabase()
    this.mitreTechniques = buildMitreTechniques()
    this.malwareFamilies = buildMalwareFamilies()
    this.c2Patterns = buildC2Patterns()
    this.campaignTemplates = buildCampaignTemplates()
  }

  // ── APT Identification ──────────────────────────────────────────

  /** Match indicators to known APT groups based on TTPs, tools, and behavioral patterns. */
  identifyThreatActor(indicators: string[]): ThreatActor[] {
    if (!this.config.enableAPTTracking || indicators.length === 0) return []
    this.totalActorLookups++

    const tokens = indicators.flatMap(i => tokenize(i))
    const results: Array<{ group: APTGroup; score: number }> = []

    for (const group of this.aptDatabase) {
      let score = 0

      // Match against group names, aliases, and tools
      const groupKeywords = [
        group.name.toLowerCase(),
        ...group.aliases.map(a => a.toLowerCase()),
        ...group.primaryTools.map(t => t.toLowerCase()),
        ...group.knownCampaigns.map(c => c.toLowerCase().split(/\s+/)).flat(),
        group.country.toLowerCase(),
        group.attribution.toLowerCase(),
        ...group.ttps.map(t => t.toLowerCase()),
        ...group.targetSectors.map(s => s.toLowerCase()),
      ]

      score += matchScore(tokens, groupKeywords)

      // Bonus for TTP matches
      for (const ttp of group.ttps) {
        if (indicators.some(i => i.toUpperCase() === ttp)) score += 3
      }

      if (score > 0) results.push({ group, score })
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults)
      .map(r => r.group)
  }

  // ── MITRE ATT&CK Mapping ───────────────────────────────────────

  /** Map observed behavior descriptions to MITRE ATT&CK techniques. */
  mapToMitreAttack(behavior: string): MitreAttackTechnique[] {
    if (!this.config.enableMitreMapping || !behavior.trim()) return []
    this.totalMitreMappings++

    const tokens = tokenize(behavior)
    const results: Array<{ technique: MitreAttackTechnique; score: number }> = []

    for (const tech of this.mitreTechniques) {
      const keywords = [
        ...tokenize(tech.name),
        ...tokenize(tech.description),
        tech.id.toLowerCase(),
        ...tokenize(tech.tactic),
      ]

      const score = matchScore(tokens, keywords)

      // Direct technique ID match
      if (behavior.toUpperCase().includes(tech.id)) {
        results.push({ technique: tech, score: score + 10 })
      } else if (score >= 2) {
        results.push({ technique: tech, score })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults)
      .map(r => r.technique)
  }

  // ── IOC Analysis ────────────────────────────────────────────────

  /** Classify and enrich raw IOC strings by matching regex patterns and relating them to known actors. */
  analyzeIOCs(iocs: string[]): IndicatorOfCompromise[] {
    if (!this.config.enableIOCEnrichment || iocs.length === 0) return []
    this.totalIOCsAnalyzed += iocs.length

    const now = new Date().toISOString().split('T')[0]
    const results: IndicatorOfCompromise[] = []

    for (const raw of iocs) {
      const value = raw.trim()
      if (!value) continue

      let type: IndicatorOfCompromise['type'] | null = null
      let confidence = 0.5

      // Classify IOC type based on patterns
      for (const [iocType, pattern] of Object.entries(IOC_PATTERNS) as Array<
        [IndicatorOfCompromise['type'], RegExp]
      >) {
        if (pattern.test(value)) {
          type = iocType
          break
        }
      }

      if (!type) {
        // Fallback heuristics for unclassified indicators
        if (/^[a-f0-9]{64}$/i.test(value)) {
          type = 'hash'
          confidence = 0.95
        } else if (/^[a-f0-9]{32}$/i.test(value)) {
          type = 'hash'
          confidence = 0.8
        } else if (value.includes('://')) {
          type = 'url'
          confidence = 0.7
        } else if (value.includes('@')) {
          type = 'email'
          confidence = 0.7
        } else if (value.includes('\\')) {
          type = 'file_path'
          confidence = 0.6
        } else {
          type = 'domain'
          confidence = 0.3
        }
      } else {
        // Higher confidence for strong pattern matches
        if (type === 'hash')
          confidence = value.length === 64 ? 0.95 : value.length === 40 ? 0.9 : 0.8
        else if (type === 'ip') confidence = 0.9
        else if (type === 'url') confidence = 0.85
        else if (type === 'email') confidence = 0.8
        else if (type === 'domain') confidence = 0.75
        else confidence = 0.7
      }

      // Find related actors based on IOC context
      const relatedActors: string[] = []
      const lowVal = value.toLowerCase()
      for (const group of this.aptDatabase) {
        const groupTokens = [
          ...group.primaryTools.map(t => t.toLowerCase()),
          ...group.knownCampaigns.map(c => c.toLowerCase()),
          group.name.toLowerCase(),
          ...group.aliases.map(a => a.toLowerCase()),
        ]
        if (groupTokens.some(t => lowVal.includes(t) || t.includes(lowVal))) {
          relatedActors.push(group.name)
        }
      }

      const tags = this.generateIOCTags(type, value)

      if (confidence >= this.config.confidenceThreshold) {
        results.push({
          type,
          value,
          confidence: round2(confidence),
          source: 'internal-analysis',
          firstSeen: now,
          lastSeen: now,
          tags,
          relatedActors,
        })
      }
    }

    return results
  }

  /** Generate contextual tags for an IOC based on its type and value. */
  private generateIOCTags(type: IndicatorOfCompromise['type'], value: string): string[] {
    const tags: string[] = [type]

    switch (type) {
      case 'ip': {
        if (value.startsWith('10.') || value.startsWith('192.168.') || value.startsWith('172.')) {
          tags.push('internal', 'private-range')
        } else {
          tags.push('external', 'public')
        }
        break
      }
      case 'hash': {
        if (value.length === 32) tags.push('md5')
        else if (value.length === 40) tags.push('sha1')
        else if (value.length === 64) tags.push('sha256')
        break
      }
      case 'domain': {
        const parts = value.split('.')
        const tld = parts[parts.length - 1]?.toLowerCase()
        if (['ru', 'cn', 'kp', 'ir'].includes(tld)) tags.push('high-risk-tld')
        if (parts.length > 3) tags.push('suspicious-subdomain-depth')
        tags.push('domain')
        break
      }
      case 'url': {
        if (value.includes('https')) tags.push('encrypted')
        else tags.push('unencrypted')
        if (/\.(exe|dll|bat|ps1|vbs|js|scr)$/i.test(value)) tags.push('executable-download')
        break
      }
      case 'email': {
        tags.push('phishing-vector')
        break
      }
      case 'registry': {
        tags.push('persistence-indicator')
        break
      }
      case 'mutex': {
        tags.push('malware-indicator')
        break
      }
      case 'file_path': {
        if (/\\temp\\|\/tmp\//i.test(value)) tags.push('temp-directory')
        if (/\\system32\\/i.test(value)) tags.push('system-directory')
        break
      }
    }

    return tags
  }

  // ── C2 Detection ────────────────────────────────────────────────

  /** Detect C2 infrastructure based on observed network data characteristics. */
  detectC2(networkData: {
    protocol: string
    interval?: number
    payload?: string
  }): C2Infrastructure | null {
    if (!this.config.enableC2Detection) return null
    this.totalC2Detections++

    const protoTokens = tokenize(networkData.protocol)
    let bestMatch: C2DetectionPattern | null = null
    let bestScore = 0

    for (const pattern of this.c2Patterns) {
      let score = matchScore(protoTokens, pattern.keywords)

      // Interval-based scoring
      if (networkData.interval != null) {
        const [lo, hi] = pattern.intervalRange
        if (networkData.interval >= lo && networkData.interval <= hi) {
          score += 3
        } else if (networkData.interval >= lo * 0.5 && networkData.interval <= hi * 2) {
          score += 1
        }
      }

      // Payload content analysis
      if (networkData.payload) {
        const payloadTokens = tokenize(networkData.payload)
        score += matchScore(payloadTokens, pattern.keywords)

        // Base64 detection
        if (
          /^[A-Za-z0-9+/]+=*$/.test(networkData.payload.trim()) &&
          networkData.payload.length > 20
        ) {
          score += 2
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = pattern
      }
    }

    if (!bestMatch || bestScore < 2) return null

    const interval =
      networkData.interval ?? (bestMatch.intervalRange[0] + bestMatch.intervalRange[1]) / 2
    const jitter = (bestMatch.jitterRange[0] + bestMatch.jitterRange[1]) / 2

    const indicators: string[] = [bestMatch.description]
    if (networkData.interval) indicators.push(`Beacon interval: ~${networkData.interval}s`)
    if (networkData.payload)
      indicators.push(`Payload characteristics detected in ${bestMatch.protocol} channel`)

    return {
      type: bestMatch.type,
      protocol: bestMatch.protocol,
      indicators,
      beaconInterval: round2(interval),
      jitter: round2(jitter),
      encryption: bestMatch.encryption,
    }
  }

  // ── Malware Classification ──────────────────────────────────────

  /** Classify malware by matching behavioral traits against known malware families. */
  classifyMalware(traits: string[]): MalwareFamily[] {
    if (!this.config.enableMalwareClassification || traits.length === 0) return []
    this.totalMalwareClassifications++

    const tokens = traits.flatMap(t => tokenize(t))
    const results: Array<{ family: MalwareFamily; score: number }> = []

    for (const family of this.malwareFamilies) {
      const keywords = [
        family.name.toLowerCase(),
        family.type,
        ...family.capabilities.map(c => tokenize(c)).flat(),
        ...family.delivery.map(d => tokenize(d)).flat(),
        ...family.persistence.map(p => tokenize(p)).flat(),
        ...family.c2.map(c => tokenize(c)).flat(),
        ...family.notableVariants.map(v => v.toLowerCase()),
      ]

      const score = matchScore(tokens, keywords)
      if (score > 0) results.push({ family, score })
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults)
      .map(r => r.family)
  }

  // ── Threat Correlation ──────────────────────────────────────────

  /** Correlate IOCs and techniques to identify potential threat campaigns. */
  correlateThreats(iocs: string[], techniques: string[]): ThreatCampaign[] {
    this.totalCorrelations++

    const allTokens = [...iocs, ...techniques].flatMap(i => tokenize(i))
    const campaigns: ThreatCampaign[] = []
    const now = new Date().toISOString().split('T')[0]

    // Match against campaign templates
    for (const template of this.campaignTemplates) {
      const score = matchScore(allTokens, template.keywords)
      if (score < 2) continue

      const analyzedIOCs = this.analyzeIOCsInternal(iocs)

      campaigns.push({
        id: generateId('CAMP'),
        name: template.name,
        description: template.description,
        actors: template.actors,
        timeline: { start: now, end: now },
        targets: this.inferTargets(template.actors),
        techniques: [
          ...new Set([...template.techniques, ...techniques.filter(t => /^T\d{4}/i.test(t))]),
        ],
        iocs: analyzedIOCs,
        status: template.status,
      })
    }

    // Generate ad-hoc campaign if no template matches but we have valid IOCs and techniques
    if (campaigns.length === 0 && (iocs.length > 0 || techniques.length > 0)) {
      const actors = this.identifyThreatActor([...iocs, ...techniques]).map(a => a.name)
      const analyzedIOCs = this.analyzeIOCsInternal(iocs)
      const matchedTechniques = techniques
        .filter(t => /^T\d{4}/i.test(t))
        .concat(
          this.mapToMitreAttack(iocs.join(' '))
            .slice(0, 3)
            .map(t => t.id),
        )

      if (actors.length > 0 || analyzedIOCs.length > 0 || matchedTechniques.length > 0) {
        campaigns.push({
          id: generateId('CAMP'),
          name: 'Unattributed Threat Campaign',
          description: `Correlated campaign based on ${iocs.length} IOCs and ${techniques.length} observed techniques.`,
          actors: actors.slice(0, 5),
          timeline: { start: now, end: now },
          targets: actors.length > 0 ? this.inferTargets(actors) : ['Unknown'],
          techniques: [...new Set(matchedTechniques)],
          iocs: analyzedIOCs,
          status: 'emerging',
        })
      }
    }

    return campaigns.slice(0, this.config.maxResults)
  }

  /** Internal IOC analysis that bypasses stats increment to avoid double-counting. */
  private analyzeIOCsInternal(iocs: string[]): IndicatorOfCompromise[] {
    const saved = this.totalIOCsAnalyzed
    const result = this.analyzeIOCs(iocs)
    this.totalIOCsAnalyzed = saved
    return result
  }

  /** Infer target sectors from actor names. */
  private inferTargets(actorNames: string[]): string[] {
    const sectors = new Set<string>()
    for (const name of actorNames) {
      const group = this.aptDatabase.find(
        g => g.name === name || g.aliases.some(a => a.toLowerCase() === name.toLowerCase()),
      )
      if (group) {
        for (const sector of group.targetSectors) sectors.add(sector)
      }
    }
    return sectors.size > 0 ? [...sectors] : ['Unknown']
  }

  // ── Report Generation ───────────────────────────────────────────

  /** Generate a comprehensive threat intelligence report for a given scenario. */
  generateThreatReport(scenario: string): ThreatReport {
    this.totalReportsGenerated++

    const actors = this.identifyThreatActor(tokenize(scenario))
    const techniques = this.mapToMitreAttack(scenario)
    const scenarioIOCs = this.extractPotentialIOCs(scenario)
    const analyzedIOCs = this.analyzeIOCsInternal(scenarioIOCs)

    const severity = this.assessSeverity(actors, techniques)
    const confidence = this.assessConfidence(actors.length, techniques.length, analyzedIOCs.length)
    const recommendations = this.generateRecommendations(techniques, actors)

    return {
      id: generateId('RPT'),
      title: this.generateReportTitle(scenario, actors),
      severity,
      actors: actors.slice(0, 10).map(a => a.name),
      techniques: techniques.slice(0, 15).map(t => `${t.id}: ${t.name}`),
      iocs: analyzedIOCs,
      recommendations,
      confidence: round2(confidence),
    }
  }

  /** Extract potential IOC-like strings from a scenario description. */
  private extractPotentialIOCs(text: string): string[] {
    const iocs: string[] = []
    // Extract IP addresses
    const ipMatches = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)
    if (ipMatches) iocs.push(...ipMatches)
    // Extract hashes
    const hashMatches = text.match(/\b[a-f0-9]{32,64}\b/gi)
    if (hashMatches) iocs.push(...hashMatches)
    // Extract URLs
    const urlMatches = text.match(/https?:\/\/[^\s"'<>]+/gi)
    if (urlMatches) iocs.push(...urlMatches)
    // Extract email addresses
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    if (emailMatches) iocs.push(...emailMatches)
    // Extract domains
    const domainMatches = text.match(
      /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|ru|cn|xyz|top|info|biz)\b/gi,
    )
    if (domainMatches) iocs.push(...domainMatches)
    return [...new Set(iocs)]
  }

  /** Assess overall severity based on identified actors and techniques. */
  private assessSeverity(
    actors: ThreatActor[],
    techniques: MitreAttackTechnique[],
  ): ThreatReport['severity'] {
    let severityScore = 0

    // Actor sophistication contributes to severity
    for (const actor of actors.slice(0, 5)) {
      if (actor.sophistication === 'nation-state') severityScore += 4
      else if (actor.sophistication === 'advanced') severityScore += 3
      else if (actor.sophistication === 'high') severityScore += 2
      else severityScore += 1
    }

    // Impact-class techniques elevate severity
    const impactTactics = ['impact', 'exfiltration', 'credential-access']
    for (const tech of techniques.slice(0, 10)) {
      if (impactTactics.includes(tech.tactic)) severityScore += 2
      else severityScore += 1
    }

    if (severityScore >= 20) return 'critical'
    if (severityScore >= 12) return 'high'
    if (severityScore >= 5) return 'medium'
    return 'low'
  }

  /** Assess confidence level based on the quantity of correlated intelligence. */
  private assessConfidence(actorCount: number, techCount: number, iocCount: number): number {
    const base = 0.3
    const actorBonus = Math.min(actorCount * 0.1, 0.3)
    const techBonus = Math.min(techCount * 0.05, 0.2)
    const iocBonus = Math.min(iocCount * 0.05, 0.2)
    return clamp(base + actorBonus + techBonus + iocBonus, 0, 1)
  }

  /** Generate a descriptive report title from the scenario and identified actors. */
  private generateReportTitle(scenario: string, actors: ThreatActor[]): string {
    if (actors.length > 0) {
      const topActor = actors[0].name
      const words = scenario.split(/\s+/).slice(0, 6).join(' ')
      return `Threat Intelligence Report: ${topActor} — ${words}`
    }
    const words = scenario.split(/\s+/).slice(0, 8).join(' ')
    return `Threat Intelligence Report: ${words}`
  }

  /** Generate actionable recommendations based on techniques and actors. */
  private generateRecommendations(
    techniques: MitreAttackTechnique[],
    actors: ThreatActor[],
  ): string[] {
    const recommendations = new Set<string>()

    // Technique-specific mitigations
    for (const tech of techniques.slice(0, 10)) {
      if (tech.mitigation) recommendations.add(tech.mitigation)
    }

    // General recommendations based on actor sophistication
    if (actors.some(a => a.sophistication === 'nation-state')) {
      recommendations.add('Implement advanced persistent threat monitoring with 24/7 SOC coverage')
      recommendations.add(
        'Deploy network traffic analysis with encrypted traffic inspection capabilities',
      )
      recommendations.add('Conduct threat hunting exercises focused on identified actor TTPs')
    }

    if (actors.some(a => a.motivation === 'financial gain')) {
      recommendations.add(
        'Review and test backup and recovery procedures for ransomware resilience',
      )
      recommendations.add('Implement application allowlisting on critical systems')
      recommendations.add('Deploy endpoint detection and response (EDR) across all endpoints')
    }

    // Tactic-specific recommendations
    const tactics = new Set(techniques.map(t => t.tactic))
    if (tactics.has('initial-access')) {
      recommendations.add(
        'Strengthen email security with advanced phishing detection and sandboxing',
      )
      recommendations.add(
        'Enforce multi-factor authentication on all externally accessible services',
      )
    }
    if (tactics.has('lateral-movement')) {
      recommendations.add('Implement network segmentation to limit lateral movement paths')
      recommendations.add('Deploy privileged access management (PAM) and just-in-time access')
    }
    if (tactics.has('exfiltration')) {
      recommendations.add('Deploy data loss prevention (DLP) controls at network boundaries')
      recommendations.add('Monitor for unusual outbound data transfer volumes and patterns')
    }
    if (tactics.has('command-and-control')) {
      recommendations.add('Implement DNS monitoring and filtering for C2 detection')
      recommendations.add('Deploy SSL/TLS inspection for outbound encrypted traffic')
    }

    // Always include baseline recommendations
    recommendations.add('Keep all systems and software updated with latest security patches')
    recommendations.add('Conduct regular security awareness training for all employees')

    return [...recommendations]
  }

  // ── Database Accessors ──────────────────────────────────────────

  /** Return all known APT groups in the database. */
  getAPTDatabase(): APTGroup[] {
    return [...this.aptDatabase]
  }

  /** Return all 14 MITRE ATT&CK tactics. */
  getMitreTactics(): string[] {
    return [
      'reconnaissance',
      'resource-development',
      'initial-access',
      'execution',
      'persistence',
      'privilege-escalation',
      'defense-evasion',
      'credential-access',
      'discovery',
      'lateral-movement',
      'collection',
      'command-and-control',
      'exfiltration',
      'impact',
    ]
  }

  // ── Feedback ────────────────────────────────────────────────────

  /** Provide a feedback score (1–5) to adjust engine behavior. */
  provideFeedback(score: number): void {
    this.feedbackCount++
    const s = clamp(score, 1, 5)
    this.feedbackScores.push(s)

    // Dynamically adjust confidence threshold based on feedback trends
    if (this.feedbackScores.length >= 3) {
      const recent = this.feedbackScores.slice(-5)
      const avg = recent.reduce((sum, v) => sum + v, 0) / recent.length
      if (avg < 2.5) {
        this.config.confidenceThreshold = Math.min(this.config.confidenceThreshold + 0.05, 0.95)
      } else if (avg > 4.0) {
        this.config.confidenceThreshold = Math.max(this.config.confidenceThreshold - 0.05, 0.1)
      }
    }
  }

  // ── Stats ───────────────────────────────────────────────────────

  /** Return aggregate usage statistics. */
  getStats(): Readonly<CyberThreatIntelStats> {
    const avgScore =
      this.feedbackScores.length > 0
        ? this.feedbackScores.reduce((s, v) => s + v, 0) / this.feedbackScores.length
        : 0

    return {
      totalActorLookups: this.totalActorLookups,
      totalMitreMappings: this.totalMitreMappings,
      totalIOCsAnalyzed: this.totalIOCsAnalyzed,
      totalC2Detections: this.totalC2Detections,
      totalMalwareClassifications: this.totalMalwareClassifications,
      totalCorrelations: this.totalCorrelations,
      totalReportsGenerated: this.totalReportsGenerated,
      feedbackCount: this.feedbackCount,
      avgFeedbackScore: round2(avgScore),
    }
  }

  // ── Serialization ───────────────────────────────────────────────

  /** Serialize the engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalActorLookups: this.totalActorLookups,
      totalMitreMappings: this.totalMitreMappings,
      totalIOCsAnalyzed: this.totalIOCsAnalyzed,
      totalC2Detections: this.totalC2Detections,
      totalMalwareClassifications: this.totalMalwareClassifications,
      totalCorrelations: this.totalCorrelations,
      totalReportsGenerated: this.totalReportsGenerated,
      feedbackCount: this.feedbackCount,
      feedbackScores: this.feedbackScores,
    })
  }

  /** Restore a CyberThreatIntelligence instance from serialized JSON. */
  static deserialize(json: string): CyberThreatIntelligence {
    const data = JSON.parse(json) as {
      config: CyberThreatIntelConfig
      totalActorLookups: number
      totalMitreMappings: number
      totalIOCsAnalyzed: number
      totalC2Detections: number
      totalMalwareClassifications: number
      totalCorrelations: number
      totalReportsGenerated: number
      feedbackCount: number
      feedbackScores: number[]
    }

    const instance = new CyberThreatIntelligence(data.config)
    instance.totalActorLookups = data.totalActorLookups ?? 0
    instance.totalMitreMappings = data.totalMitreMappings ?? 0
    instance.totalIOCsAnalyzed = data.totalIOCsAnalyzed ?? 0
    instance.totalC2Detections = data.totalC2Detections ?? 0
    instance.totalMalwareClassifications = data.totalMalwareClassifications ?? 0
    instance.totalCorrelations = data.totalCorrelations ?? 0
    instance.totalReportsGenerated = data.totalReportsGenerated ?? 0
    instance.feedbackCount = data.feedbackCount ?? 0
    instance.feedbackScores = data.feedbackScores ?? []
    return instance
  }
}
