/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          ⚔️  A T T A C K   C H A I N   E N G I N E                          ║
 * ║                                                                             ║
 * ║   Advanced multi-stage cyberattack chain simulation:                         ║
 * ║     profile → plan → execute → persist → exfiltrate                         ║
 * ║                                                                             ║
 * ║     • MITRE ATT&CK technique mapping (70+ techniques, 14 tactics)           ║
 * ║     • Attacker profiling (APT groups, nation-state, insider threats)         ║
 * ║     • Kill chain modeling (Lockheed Martin + Unified Kill Chain)             ║
 * ║     • Lateral movement planning with credential propagation                 ║
 * ║     • Persistence mechanism selection (12+ types)                           ║
 * ║     • Evasion technique library (20+ methods)                               ║
 * ║     • C2 channel selection (12+ protocols)                                  ║
 * ║     • Exfiltration planning with stealth optimization                       ║
 * ║     • Post-exploitation pipelines with Black Hat techniques                 ║
 * ║                                                                             ║
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

export interface AttackChainEngineConfig {
  maxChainLength: number
  maxTechniquesPerPhase: number
  enableLateralMovement: boolean
  enablePersistence: boolean
  enableEvasion: boolean
  enableC2: boolean
  enableExfiltration: boolean
  riskThreshold: number
}

export interface AttackChainEngineStats {
  totalChainsGenerated: number
  totalTechniquesApplied: number
  totalAttackerProfiles: number
  totalKillChains: number
  totalLateralMovements: number
  totalPersistenceMechanisms: number
  totalEvasionTechniques: number
  totalC2Channels: number
  totalExfiltrations: number
  feedbackCount: number
}

export type KillChainPhase =
  | 'reconnaissance'
  | 'weaponization'
  | 'delivery'
  | 'exploitation'
  | 'installation'
  | 'command_and_control'
  | 'actions_on_objectives'

export type MitreAttackTactic =
  | 'initial_access'
  | 'execution'
  | 'persistence'
  | 'privilege_escalation'
  | 'defense_evasion'
  | 'credential_access'
  | 'discovery'
  | 'lateral_movement'
  | 'collection'
  | 'exfiltration'
  | 'command_and_control'
  | 'impact'
  | 'resource_development'
  | 'reconnaissance'

export type AttackerSkillLevel =
  | 'script_kiddie'
  | 'intermediate'
  | 'advanced'
  | 'apt'
  | 'nation_state'
export type AttackerMotivation =
  | 'financial'
  | 'espionage'
  | 'hacktivism'
  | 'destruction'
  | 'revenge'
  | 'thrill'
  | 'state_sponsored'

export interface AttackerProfile {
  id: string
  name: string
  skillLevel: AttackerSkillLevel
  motivation: AttackerMotivation
  resources: 'low' | 'medium' | 'high' | 'unlimited'
  preferredTactics: MitreAttackTactic[]
  toolkits: string[]
  targetPreferences: string[]
  riskTolerance: number
  operationalSecurity: number
  persistence: number
}

export interface AttackTechnique {
  id: string
  mitreId: string
  name: string
  tactic: MitreAttackTactic
  description: string
  platforms: string[]
  requiredPrivileges: 'none' | 'user' | 'admin' | 'system'
  detectionDifficulty: number
  successProbability: number
  noiseLevel: number
  prerequisites: string[]
  artifacts: string[]
  mitigations: string[]
  tools: string[]
}

export interface LateralMovementPath {
  id: string
  source: string
  destination: string
  technique: string
  credentials: string
  protocol: string
  risk: number
  successChance: number
}

export interface PersistenceMechanism {
  id: string
  name: string
  type:
    | 'registry'
    | 'service'
    | 'scheduled_task'
    | 'startup'
    | 'rootkit'
    | 'bootkit'
    | 'firmware'
    | 'webshell'
    | 'implant'
    | 'dll_hijack'
    | 'com_hijack'
    | 'wmi_event'
  platform: string
  privilege: 'user' | 'admin' | 'system'
  stealth: number
  reliability: number
  survivesReboot: boolean
  description: string
  detection: string[]
}

export interface EvasionTechnique {
  id: string
  name: string
  category:
    | 'obfuscation'
    | 'living_off_land'
    | 'process_injection'
    | 'rootkit'
    | 'anti_forensics'
    | 'log_tampering'
    | 'timestomping'
    | 'steganography'
    | 'encryption'
    | 'polymorphism'
    | 'sandbox_evasion'
    | 'amsi_bypass'
  effectiveness: number
  complexity: number
  description: string
  bypasses: string[]
  indicators: string[]
}

export interface C2Channel {
  id: string
  name: string
  protocol:
    | 'http'
    | 'https'
    | 'dns'
    | 'icmp'
    | 'smtp'
    | 'websocket'
    | 'custom_tcp'
    | 'tor'
    | 'domain_fronting'
    | 'cloud_service'
    | 'social_media'
    | 'steganography'
  bandwidth: 'low' | 'medium' | 'high'
  stealth: number
  reliability: number
  latency: 'low' | 'medium' | 'high'
  resilience: number
  description: string
  detection: string[]
}

export interface ExfiltrationMethod {
  id: string
  name: string
  channel:
    | 'http'
    | 'https'
    | 'dns'
    | 'icmp'
    | 'ftp'
    | 'cloud_storage'
    | 'email'
    | 'usb'
    | 'steganography'
    | 'covert_channel'
  capacity: 'low' | 'medium' | 'high'
  stealth: number
  speed: number
  description: string
  detection: string[]
}

export interface PostExploitAction {
  id: string
  name: string
  category:
    | 'credential_harvest'
    | 'data_collection'
    | 'privilege_escalation'
    | 'defense_disabling'
    | 'cleanup'
    | 'staging'
    | 'pivoting'
  description: string
  tools: string[]
  risk: number
  impact: number
}

export interface AttackChainStep {
  order: number
  phase: KillChainPhase
  tactic: MitreAttackTactic
  technique: string
  objective: string
  expectedOutcome: string
  fallbackTechnique?: string
  estimatedDuration: string
  riskLevel: number
  dependencies: number[]
}

export interface AttackChainResult {
  id: string
  name: string
  description: string
  attackerProfile: AttackerProfile
  targetProfile: string
  steps: AttackChainStep[]
  lateralMovements: LateralMovementPath[]
  persistenceMechanisms: PersistenceMechanism[]
  evasionTechniques: EvasionTechnique[]
  c2Channels: C2Channel[]
  exfiltrationMethods: ExfiltrationMethod[]
  postExploitActions: PostExploitAction[]
  overallRisk: number
  successProbability: number
  estimatedDuration: string
  detectionProbability: number
  mitigations: string[]
  iocs: string[]
}

// ── Default Config ───────────────────────────────────────────────────────────

export const DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG: AttackChainEngineConfig = {
  maxChainLength: 15,
  maxTechniquesPerPhase: 5,
  enableLateralMovement: true,
  enablePersistence: true,
  enableEvasion: true,
  enableC2: true,
  enableExfiltration: true,
  riskThreshold: 0.7,
}

// ── Private Builders ─────────────────────────────────────────────────────────

function buildAttackTechniques(): AttackTechnique[] {
  const db: AttackTechnique[] = []
  const add = (t: AttackTechnique) => {
    db.push(t)
  }

  // ── Initial Access ──
  add({
    id: 'T1566.001',
    mitreId: 'T1566.001',
    name: 'Spearphishing Attachment',
    tactic: 'initial_access',
    description: 'Targeted phishing with malicious attachment (macro-enabled docs, HTA, ISO)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.4,
    successProbability: 0.6,
    noiseLevel: 0.3,
    prerequisites: ['email_address', 'social_engineering_intel'],
    artifacts: ['email_logs', 'attachment_hash', 'process_creation'],
    mitigations: ['email_filtering', 'user_training', 'macro_disable', 'sandbox_detonation'],
    tools: ['GoPhish', 'King_Phisher', 'SET'],
  })
  add({
    id: 'T1566.002',
    mitreId: 'T1566.002',
    name: 'Spearphishing Link',
    tactic: 'initial_access',
    description: 'Phishing with URL to credential harvesting or exploit kit',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.5,
    successProbability: 0.55,
    noiseLevel: 0.2,
    prerequisites: ['target_email', 'domain_for_phishing'],
    artifacts: ['web_logs', 'dns_queries', 'proxy_logs'],
    mitigations: ['url_filtering', 'awareness_training', 'browser_isolation'],
    tools: ['Evilginx2', 'Gophish', 'Modlishka'],
  })
  add({
    id: 'T1190',
    mitreId: 'T1190',
    name: 'Exploit Public-Facing Application',
    tactic: 'initial_access',
    description: 'Exploit vulnerabilities in internet-facing apps (SQLi, RCE, SSRF, LFI)',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.3,
    successProbability: 0.7,
    noiseLevel: 0.5,
    prerequisites: ['vuln_in_target_app'],
    artifacts: ['waf_logs', 'app_logs', 'error_logs'],
    mitigations: ['patching', 'waf', 'input_validation', 'network_segmentation'],
    tools: ['Nuclei', 'SQLMap', 'Burp_Suite', 'ffuf'],
  })
  add({
    id: 'T1195.002',
    mitreId: 'T1195.002',
    name: 'Supply Chain Compromise',
    tactic: 'initial_access',
    description: 'Compromise software supply chain (package repo poisoning, CI/CD pipeline)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.8,
    successProbability: 0.4,
    noiseLevel: 0.1,
    prerequisites: ['access_to_supply_chain', 'compromised_package_repo'],
    artifacts: ['package_signatures', 'build_logs', 'dependency_changes'],
    mitigations: ['code_signing', 'dependency_review', 'sbom', 'reproducible_builds'],
    tools: ['custom', 'dependency_confusion_tool'],
  })
  add({
    id: 'T1199',
    mitreId: 'T1199',
    name: 'Trusted Relationship',
    tactic: 'initial_access',
    description: 'Abuse trusted third-party with network access (MSPs, vendors)',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.7,
    successProbability: 0.5,
    noiseLevel: 0.2,
    prerequisites: ['third_party_access', 'compromised_vendor'],
    artifacts: ['vpn_logs', 'auth_logs', 'third_party_activity'],
    mitigations: ['vendor_assessment', 'mfa', 'network_segmentation', 'monitoring'],
    tools: ['custom', 'vpn_tools'],
  })
  add({
    id: 'T1078',
    mitreId: 'T1078',
    name: 'Valid Accounts',
    tactic: 'initial_access',
    description: 'Use stolen or leaked credentials (credential stuffing, purchased creds)',
    platforms: ['windows', 'linux', 'macos', 'cloud'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.6,
    successProbability: 0.65,
    noiseLevel: 0.1,
    prerequisites: ['valid_credentials'],
    artifacts: ['auth_logs', 'unusual_login_location', 'impossible_travel'],
    mitigations: ['mfa', 'credential_monitoring', 'password_policy', 'conditional_access'],
    tools: ['Hydra', 'CrackMapExec', 'SprayCharles'],
  })
  add({
    id: 'T1133',
    mitreId: 'T1133',
    name: 'External Remote Services',
    tactic: 'initial_access',
    description: 'Exploit exposed RDP, SSH, VPN, Citrix services',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.4,
    successProbability: 0.5,
    noiseLevel: 0.3,
    prerequisites: ['exposed_service', 'credentials_or_exploit'],
    artifacts: ['vpn_logs', 'rdp_logs', 'ssh_auth_logs'],
    mitigations: ['vpn_hardening', 'mfa', 'network_monitoring', 'port_restriction'],
    tools: ['Ncrack', 'Crowbar', 'RDPassSpray'],
  })
  add({
    id: 'T1189',
    mitreId: 'T1189',
    name: 'Drive-by Compromise',
    tactic: 'initial_access',
    description: 'Exploit browser/plugin vulnerabilities via watering hole sites',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.5,
    successProbability: 0.35,
    noiseLevel: 0.2,
    prerequisites: ['compromised_website', 'browser_exploit'],
    artifacts: ['web_logs', 'dns_logs', 'exploit_kit_signatures'],
    mitigations: ['browser_updates', 'exploit_protection', 'content_filtering'],
    tools: ['BeEF', 'Browser_Exploitation_Framework', 'custom_exploit_kit'],
  })

  // ── Execution ──
  add({
    id: 'T1059.001',
    mitreId: 'T1059.001',
    name: 'PowerShell Execution',
    tactic: 'execution',
    description: 'Execute malicious PowerShell commands with AMSI bypass and obfuscation',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.5,
    prerequisites: ['initial_access', 'powershell_available'],
    artifacts: ['powershell_logs', 'script_block_logs', 'process_creation'],
    mitigations: ['constrained_language_mode', 'script_block_logging', 'applocker', 'amsi'],
    tools: ['PowerSploit', 'Invoke-Obfuscation', 'AMSI.fail', 'Nishang'],
  })
  add({
    id: 'T1059.003',
    mitreId: 'T1059.003',
    name: 'Windows Command Shell',
    tactic: 'execution',
    description: 'cmd.exe for execution, often chained with LOLBins',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.85,
    noiseLevel: 0.4,
    prerequisites: ['initial_access'],
    artifacts: ['cmd_history', 'process_creation_logs'],
    mitigations: ['command_logging', 'applocker', 'edr'],
    tools: ['cmd.exe', 'LOLBas'],
  })
  add({
    id: 'T1059.004',
    mitreId: 'T1059.004',
    name: 'Unix Shell',
    tactic: 'execution',
    description: 'Bash/sh/zsh command execution on Linux/macOS targets',
    platforms: ['linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.85,
    noiseLevel: 0.4,
    prerequisites: ['initial_access', 'shell_access'],
    artifacts: ['bash_history', 'audit_logs', 'syslog'],
    mitigations: ['auditd', 'selinux', 'apparmor', 'shell_restrictions'],
    tools: ['bash', 'sh', 'zsh'],
  })
  add({
    id: 'T1047',
    mitreId: 'T1047',
    name: 'WMI Execution',
    tactic: 'execution',
    description: 'Windows Management Instrumentation for remote code execution',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.5,
    successProbability: 0.75,
    noiseLevel: 0.3,
    prerequisites: ['admin_creds', 'wmi_access'],
    artifacts: ['wmi_logs', 'process_creation', 'network_connections'],
    mitigations: ['wmi_filtering', 'network_segmentation', 'edr'],
    tools: ['wmic', 'Impacket_wmiexec', 'WMImplant'],
  })
  add({
    id: 'T1053.005',
    mitreId: 'T1053.005',
    name: 'Scheduled Task/Job',
    tactic: 'execution',
    description: 'Create scheduled tasks for code execution and persistence',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.3,
    prerequisites: ['initial_access', 'task_creation_perms'],
    artifacts: ['task_scheduler_logs', 'cron_files', 'audit_logs'],
    mitigations: ['task_monitoring', 'least_privilege', 'edr'],
    tools: ['schtasks', 'at', 'crontab'],
  })
  add({
    id: 'T1204.002',
    mitreId: 'T1204.002',
    name: 'User Execution: Malicious File',
    tactic: 'execution',
    description: 'Trick user into executing malicious files (macros, scripts, executables)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.4,
    successProbability: 0.55,
    noiseLevel: 0.3,
    prerequisites: ['delivery_mechanism', 'social_engineering'],
    artifacts: ['file_creation', 'process_execution', 'email_attachment'],
    mitigations: ['user_training', 'macro_disable', 'file_type_blocking', 'sandbox'],
    tools: ['msfvenom', 'macro_pack', 'LuckyStrike'],
  })

  // ── Persistence ──
  add({
    id: 'T1547.001',
    mitreId: 'T1547.001',
    name: 'Registry Run Keys',
    tactic: 'persistence',
    description: 'Add registry keys for automatic execution at startup',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.9,
    noiseLevel: 0.2,
    prerequisites: ['code_execution'],
    artifacts: ['registry_changes', 'autoruns_entries'],
    mitigations: ['registry_monitoring', 'autoruns', 'edr'],
    tools: ['reg.exe', 'PowerShell', 'SharPersist'],
  })
  add({
    id: 'T1543.003',
    mitreId: 'T1543.003',
    name: 'Windows Service Creation',
    tactic: 'persistence',
    description: 'Create or modify Windows services for persistent execution',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.4,
    successProbability: 0.85,
    noiseLevel: 0.3,
    prerequisites: ['admin_access'],
    artifacts: ['service_creation_events', 'registry_changes'],
    mitigations: ['service_monitoring', 'least_privilege', 'edr'],
    tools: ['sc.exe', 'PowerShell', 'Cobalt_Strike'],
  })
  add({
    id: 'T1546.003',
    mitreId: 'T1546.003',
    name: 'WMI Event Subscription',
    tactic: 'persistence',
    description: 'Use WMI event subscriptions for fileless persistence',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.7,
    successProbability: 0.8,
    noiseLevel: 0.1,
    prerequisites: ['admin_access', 'wmi_knowledge'],
    artifacts: ['wmi_repository', 'etw_logs'],
    mitigations: ['wmi_monitoring', 'edr', 'powershell_logging'],
    tools: ['PowerSploit', 'SharpWMI', 'WMImplant'],
  })
  add({
    id: 'T1505.003',
    mitreId: 'T1505.003',
    name: 'Web Shell',
    tactic: 'persistence',
    description: 'Deploy web shell for persistent access to web servers',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.85,
    noiseLevel: 0.2,
    prerequisites: ['web_server_access', 'write_access'],
    artifacts: ['webshell_files', 'web_logs', 'process_spawning_from_web'],
    mitigations: ['file_integrity_monitoring', 'web_application_firewall', 'least_privilege'],
    tools: ['weevely', 'China_Chopper', 'p0wny_shell', 'AntSword'],
  })
  add({
    id: 'T1574.001',
    mitreId: 'T1574.001',
    name: 'DLL Search Order Hijacking',
    tactic: 'persistence',
    description: 'Abuse DLL search order for code execution via DLL proxying/sideloading',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.6,
    successProbability: 0.75,
    noiseLevel: 0.1,
    prerequisites: ['write_access_to_app_dir', 'dll_knowledge'],
    artifacts: ['unusual_dll_loading', 'process_creation'],
    mitigations: ['dll_safe_search', 'code_signing', 'application_whitelisting'],
    tools: ['Spartacus', 'DLL_Hijack_Scanner', 'custom'],
  })
  add({
    id: 'T1136.001',
    mitreId: 'T1136.001',
    name: 'Create Account: Local',
    tactic: 'persistence',
    description: 'Create local accounts for backdoor access',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.3,
    successProbability: 0.9,
    noiseLevel: 0.4,
    prerequisites: ['admin_access'],
    artifacts: ['account_creation_events', 'user_management_logs'],
    mitigations: ['account_monitoring', 'privileged_access_management'],
    tools: ['net.exe', 'useradd', 'dscl'],
  })

  // ── Privilege Escalation ──
  add({
    id: 'T1548.002',
    mitreId: 'T1548.002',
    name: 'UAC Bypass',
    tactic: 'privilege_escalation',
    description: 'Bypass User Account Control using fodhelper, eventvwr, computerdefaults',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.2,
    prerequisites: ['local_user_access', 'default_uac_settings'],
    artifacts: ['registry_modification', 'process_creation_high_integrity'],
    mitigations: ['uac_always_notify', 'credential_guard', 'edr'],
    tools: ['UACME', 'Metasploit', 'Cobalt_Strike'],
  })
  add({
    id: 'T1134.001',
    mitreId: 'T1134.001',
    name: 'Token Impersonation',
    tactic: 'privilege_escalation',
    description: 'Steal or impersonate access tokens for privilege escalation',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.7,
    noiseLevel: 0.2,
    prerequisites: ['seimpersonate_privilege'],
    artifacts: ['token_manipulation_events', 'process_creation'],
    mitigations: ['least_privilege', 'credential_guard', 'edr'],
    tools: ['Incognito', 'JuicyPotato', 'PrintSpoofer', 'GodPotato'],
  })
  add({
    id: 'T1055.001',
    mitreId: 'T1055.001',
    name: 'Process Injection: DLL Injection',
    tactic: 'privilege_escalation',
    description: 'Inject malicious DLL into running processes for elevated execution',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.75,
    noiseLevel: 0.3,
    prerequisites: ['code_execution', 'target_process'],
    artifacts: ['dll_loading', 'memory_modification', 'api_calls'],
    mitigations: ['edr', 'process_integrity', 'code_signing'],
    tools: ['Metasploit', 'Cobalt_Strike', 'custom_injector'],
  })
  add({
    id: 'T1068',
    mitreId: 'T1068',
    name: 'Exploitation for Privilege Escalation',
    tactic: 'privilege_escalation',
    description: 'Exploit kernel or service vulnerabilities for SYSTEM/root access',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.6,
    noiseLevel: 0.4,
    prerequisites: ['local_access', 'vulnerable_kernel_or_service'],
    artifacts: ['crash_dumps', 'exploit_artifacts', 'privilege_changes'],
    mitigations: ['patching', 'exploit_protection', 'kernel_hardening'],
    tools: ['Linux_Exploit_Suggester', 'Windows_Exploit_Suggester', 'BeRoot'],
  })
  add({
    id: 'T1548.001',
    mitreId: 'T1548.001',
    name: 'Setuid/Setgid Abuse',
    tactic: 'privilege_escalation',
    description: 'Abuse SUID/SGID binaries for privilege escalation on Linux/macOS',
    platforms: ['linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.7,
    noiseLevel: 0.2,
    prerequisites: ['local_access', 'misconfigured_suid'],
    artifacts: ['audit_logs', 'process_execution'],
    mitigations: ['suid_audit', 'nosuid_mounts', 'selinux'],
    tools: ['GTFOBins', 'LinPEAS', 'pspy'],
  })

  // ── Defense Evasion ──
  add({
    id: 'T1562.001',
    mitreId: 'T1562.001',
    name: 'Disable Security Tools',
    tactic: 'defense_evasion',
    description: 'Disable AV, EDR, ETW tracing, Windows Defender via various techniques',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.3,
    successProbability: 0.7,
    noiseLevel: 0.5,
    prerequisites: ['admin_access'],
    artifacts: ['service_stop_events', 'security_log_gaps'],
    mitigations: ['tamper_protection', 'centralized_logging', 'edr_self_protection'],
    tools: ['EDRSilencer', 'KillDefender', 'Backstab', 'EDRSandblast'],
  })
  add({
    id: 'T1070.001',
    mitreId: 'T1070.001',
    name: 'Clear Windows Event Logs',
    tactic: 'defense_evasion',
    description: 'Clear event logs to remove evidence of compromise',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.2,
    successProbability: 0.9,
    noiseLevel: 0.5,
    prerequisites: ['admin_access'],
    artifacts: ['log_clear_events_1102', 'security_log_gaps'],
    mitigations: ['log_forwarding', 'siem', 'tamper_detection'],
    tools: ['wevtutil', 'PowerShell', 'Cobalt_Strike'],
  })
  add({
    id: 'T1027',
    mitreId: 'T1027',
    name: 'Obfuscated Files or Information',
    tactic: 'defense_evasion',
    description: 'Encode/encrypt/pack payloads to evade detection (Base64, XOR, custom)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.6,
    successProbability: 0.8,
    noiseLevel: 0.1,
    prerequisites: ['payload'],
    artifacts: ['encoded_files', 'suspicious_strings', 'entropy_analysis'],
    mitigations: ['content_inspection', 'sandbox', 'behavioral_analysis'],
    tools: ['Invoke-Obfuscation', 'Veil', 'Themida', 'ConfuserEx'],
  })
  add({
    id: 'T1055.012',
    mitreId: 'T1055.012',
    name: 'Process Hollowing',
    tactic: 'defense_evasion',
    description: 'Replace legitimate process memory with malicious code',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.6,
    successProbability: 0.75,
    noiseLevel: 0.1,
    prerequisites: ['code_execution', 'target_process'],
    artifacts: ['memory_anomalies', 'api_calls', 'process_behavior'],
    mitigations: ['edr', 'memory_integrity', 'exploit_protection'],
    tools: ['custom', 'Cobalt_Strike', 'Metasploit'],
  })
  add({
    id: 'T1218.011',
    mitreId: 'T1218.011',
    name: 'Rundll32 Proxy Execution',
    tactic: 'defense_evasion',
    description: 'Use rundll32.exe to proxy execute malicious DLLs (LOLBin)',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.8,
    noiseLevel: 0.2,
    prerequisites: ['malicious_dll', 'code_execution'],
    artifacts: ['rundll32_execution', 'dll_loading', 'command_line_args'],
    mitigations: ['application_whitelisting', 'command_line_monitoring', 'edr'],
    tools: ['rundll32.exe', 'custom_dll'],
  })
  add({
    id: 'T1562.006',
    mitreId: 'T1562.006',
    name: 'ETW Patching',
    tactic: 'defense_evasion',
    description: 'Patch ETW (Event Tracing for Windows) to blind security tools',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.7,
    successProbability: 0.85,
    noiseLevel: 0.1,
    prerequisites: ['admin_access', 'memory_patching'],
    artifacts: ['memory_modifications', 'etw_gaps'],
    mitigations: ['kernel_protection', 'integrity_monitoring', 'hardware_telemetry'],
    tools: ['InvisibilityCloak', 'custom_etw_patcher', 'SyscallPatcher'],
  })
  add({
    id: 'T1497.001',
    mitreId: 'T1497.001',
    name: 'Sandbox Evasion: System Checks',
    tactic: 'defense_evasion',
    description: 'Detect sandbox/VM environment to avoid detonation analysis',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.7,
    successProbability: 0.7,
    noiseLevel: 0.0,
    prerequisites: ['malware_payload'],
    artifacts: ['environment_checks', 'timing_checks', 'hardware_queries'],
    mitigations: ['transparent_sandboxing', 'bare_metal_analysis', 'delayed_detonation'],
    tools: ['al-khaser', 'Pafish', 'custom_checks'],
  })

  // ── Credential Access ──
  add({
    id: 'T1003.001',
    mitreId: 'T1003.001',
    name: 'LSASS Memory Dump',
    tactic: 'credential_access',
    description: 'Dump LSASS process memory to extract credentials (Mimikatz-style)',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.3,
    successProbability: 0.85,
    noiseLevel: 0.5,
    prerequisites: ['admin_access', 'lsass_access'],
    artifacts: ['lsass_access_events', 'minidump_files', 'credential_access_logs'],
    mitigations: ['credential_guard', 'lsa_protection', 'edr', 'process_access_rules'],
    tools: ['Mimikatz', 'pypykatz', 'nanodump', 'MiniDumpWriteDump'],
  })
  add({
    id: 'T1558.003',
    mitreId: 'T1558.003',
    name: 'Kerberoasting',
    tactic: 'credential_access',
    description: 'Request TGS tickets for SPNs and crack offline for service passwords',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.6,
    noiseLevel: 0.2,
    prerequisites: ['domain_user_access', 'ad_environment'],
    artifacts: ['tgs_requests', 'kerberos_logs', 'unusual_spn_queries'],
    mitigations: ['strong_service_passwords', 'managed_service_accounts', 'kerberos_monitoring'],
    tools: ['Rubeus', 'Impacket_GetUserSPNs', 'hashcat'],
  })
  add({
    id: 'T1550.002',
    mitreId: 'T1550.002',
    name: 'Pass the Hash',
    tactic: 'credential_access',
    description: 'Use NTLM hashes to authenticate without knowing password',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.3,
    prerequisites: ['ntlm_hash', 'network_access'],
    artifacts: ['ntlm_auth_logs', 'unusual_logon_types', 'lateral_movement_patterns'],
    mitigations: ['credential_guard', 'admin_tiering', 'network_logon_restrictions'],
    tools: ['CrackMapExec', 'Impacket_psexec', 'Mimikatz'],
  })
  add({
    id: 'T1110.003',
    mitreId: 'T1110.003',
    name: 'Password Spraying',
    tactic: 'credential_access',
    description: 'Try common passwords across many accounts to avoid lockout',
    platforms: ['windows', 'linux', 'cloud'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.4,
    successProbability: 0.4,
    noiseLevel: 0.3,
    prerequisites: ['username_list', 'common_passwords'],
    artifacts: ['failed_auth_logs', 'auth_patterns', 'lockout_events'],
    mitigations: ['account_lockout', 'mfa', 'password_policy', 'smart_lockout'],
    tools: ['SprayCharles', 'Ruler', 'MailSniper', 'o365spray'],
  })
  add({
    id: 'T1555.003',
    mitreId: 'T1555.003',
    name: 'Browser Credential Stealing',
    tactic: 'credential_access',
    description: 'Extract saved passwords and cookies from browsers (Chrome, Firefox, Edge)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.9,
    noiseLevel: 0.2,
    prerequisites: ['local_access', 'browser_installed'],
    artifacts: ['browser_db_access', 'crypto_api_calls', 'file_access'],
    mitigations: ['password_manager', 'browser_policy', 'edr'],
    tools: ['SharpChromium', 'LaZagne', 'HackBrowserData'],
  })
  add({
    id: 'T1558.001',
    mitreId: 'T1558.001',
    name: 'Golden Ticket',
    tactic: 'credential_access',
    description: 'Forge Kerberos TGT with krbtgt hash for domain-wide access',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.7,
    successProbability: 0.95,
    noiseLevel: 0.1,
    prerequisites: ['krbtgt_hash', 'domain_sid'],
    artifacts: ['unusual_tgt_lifetimes', 'kerberos_anomalies'],
    mitigations: ['krbtgt_rotation', 'kerberos_monitoring', 'paw'],
    tools: ['Mimikatz', 'Rubeus', 'Impacket_ticketer'],
  })

  // ── Discovery ──
  add({
    id: 'T1087.002',
    mitreId: 'T1087.002',
    name: 'Domain Account Discovery',
    tactic: 'discovery',
    description: 'Enumerate domain accounts, groups, and permissions via AD queries',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.9,
    noiseLevel: 0.3,
    prerequisites: ['domain_access'],
    artifacts: ['ldap_queries', 'ad_enumeration_events'],
    mitigations: ['ldap_monitoring', 'query_throttling', 'ad_tiering'],
    tools: ['BloodHound', 'SharpHound', 'ADRecon', 'PowerView'],
  })
  add({
    id: 'T1046',
    mitreId: 'T1046',
    name: 'Network Service Scanning',
    tactic: 'discovery',
    description: 'Scan network for open ports, services, and potential targets',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.95,
    noiseLevel: 0.6,
    prerequisites: ['network_access'],
    artifacts: ['network_scan_traffic', 'ids_alerts', 'firewall_logs'],
    mitigations: ['ids', 'network_segmentation', 'firewall_rules'],
    tools: ['nmap', 'masscan', 'RustScan', 'Naabu'],
  })
  add({
    id: 'T1082',
    mitreId: 'T1082',
    name: 'System Information Discovery',
    tactic: 'discovery',
    description: 'Collect system info (OS, arch, patches, hostname, domain membership)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.95,
    noiseLevel: 0.2,
    prerequisites: ['code_execution'],
    artifacts: ['command_execution_logs', 'wmi_queries'],
    mitigations: ['command_monitoring', 'edr'],
    tools: ['systeminfo', 'uname', 'WinPEAS', 'LinPEAS'],
  })
  add({
    id: 'T1069.002',
    mitreId: 'T1069.002',
    name: 'Domain Group Discovery',
    tactic: 'discovery',
    description: 'Enumerate domain groups to find high-value targets and attack paths',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.9,
    noiseLevel: 0.2,
    prerequisites: ['domain_access'],
    artifacts: ['ldap_queries', 'group_enumeration_events'],
    mitigations: ['ldap_monitoring', 'tiered_admin_model'],
    tools: ['BloodHound', 'net_group', 'PowerView'],
  })
  add({
    id: 'T1580',
    mitreId: 'T1580',
    name: 'Cloud Infrastructure Discovery',
    tactic: 'discovery',
    description: 'Enumerate cloud resources (VMs, storage, IAM roles, VPCs)',
    platforms: ['cloud'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.85,
    noiseLevel: 0.2,
    prerequisites: ['cloud_credentials'],
    artifacts: ['api_logs', 'cloudtrail', 'azure_activity_logs'],
    mitigations: ['api_monitoring', 'least_privilege', 'cloud_security_posture'],
    tools: ['ScoutSuite', 'Prowler', 'Pacu', 'CloudMapper'],
  })

  // ── Lateral Movement ──
  add({
    id: 'T1021.001',
    mitreId: 'T1021.001',
    name: 'Remote Desktop Protocol',
    tactic: 'lateral_movement',
    description: 'RDP to move laterally between Windows systems',
    platforms: ['windows'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.8,
    noiseLevel: 0.4,
    prerequisites: ['valid_credentials', 'rdp_enabled'],
    artifacts: ['rdp_logs', 'logon_events', 'network_connections'],
    mitigations: ['nla', 'mfa', 'rdp_gateway', 'network_segmentation'],
    tools: ['mstsc', 'xfreerdp', 'SharpRDP'],
  })
  add({
    id: 'T1021.002',
    mitreId: 'T1021.002',
    name: 'SMB/Admin Shares',
    tactic: 'lateral_movement',
    description: 'Use SMB/Windows admin shares for lateral movement and file transfer',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.3,
    successProbability: 0.8,
    noiseLevel: 0.4,
    prerequisites: ['admin_credentials', 'smb_access'],
    artifacts: ['smb_logs', 'share_access', 'file_creation'],
    mitigations: ['smb_signing', 'admin_share_restrictions', 'network_segmentation'],
    tools: ['PsExec', 'Impacket_smbexec', 'CrackMapExec'],
  })
  add({
    id: 'T1021.006',
    mitreId: 'T1021.006',
    name: 'WinRM',
    tactic: 'lateral_movement',
    description: 'Windows Remote Management for remote code execution',
    platforms: ['windows'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.3,
    prerequisites: ['admin_creds', 'winrm_enabled'],
    artifacts: ['winrm_logs', 'powershell_remoting_logs'],
    mitigations: ['winrm_restrictions', 'network_segmentation', 'edr'],
    tools: ['evil-winrm', 'PowerShell_Remoting', 'Cobalt_Strike'],
  })
  add({
    id: 'T1021.004',
    mitreId: 'T1021.004',
    name: 'SSH Lateral Movement',
    tactic: 'lateral_movement',
    description: 'SSH with stolen keys or credentials for Linux/macOS lateral movement',
    platforms: ['linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.3,
    successProbability: 0.85,
    noiseLevel: 0.2,
    prerequisites: ['ssh_credentials_or_keys'],
    artifacts: ['ssh_auth_logs', 'key_usage', 'audit_logs'],
    mitigations: ['key_management', 'mfa', 'bastion_hosts', 'session_recording'],
    tools: ['ssh', 'Paramiko', 'custom_scripts'],
  })
  add({
    id: 'T1570',
    mitreId: 'T1570',
    name: 'Lateral Tool Transfer',
    tactic: 'lateral_movement',
    description: 'Transfer tools and payloads between compromised systems',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.85,
    noiseLevel: 0.3,
    prerequisites: ['lateral_access', 'tools_staged'],
    artifacts: ['file_transfers', 'smb_traffic', 'network_connections'],
    mitigations: ['network_monitoring', 'file_integrity', 'application_whitelisting'],
    tools: ['scp', 'smb_copy', 'curl', 'certutil'],
  })

  // ── Collection ──
  add({
    id: 'T1056.001',
    mitreId: 'T1056.001',
    name: 'Keylogging',
    tactic: 'collection',
    description: 'Capture keystrokes for credentials and sensitive data',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.85,
    noiseLevel: 0.1,
    prerequisites: ['code_execution'],
    artifacts: ['api_hooking', 'process_behavior', 'keylog_files'],
    mitigations: ['edr', 'input_monitoring', 'virtual_keyboards'],
    tools: ['custom_keylogger', 'Meterpreter', 'Cobalt_Strike'],
  })
  add({
    id: 'T1113',
    mitreId: 'T1113',
    name: 'Screen Capture',
    tactic: 'collection',
    description: 'Capture screenshots for intelligence gathering',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.9,
    noiseLevel: 0.1,
    prerequisites: ['code_execution', 'gui_access'],
    artifacts: ['screenshot_files', 'api_calls', 'process_behavior'],
    mitigations: ['edr', 'api_monitoring'],
    tools: ['Meterpreter', 'Cobalt_Strike', 'custom'],
  })
  add({
    id: 'T1114.002',
    mitreId: 'T1114.002',
    name: 'Email Collection: Remote',
    tactic: 'collection',
    description: 'Access email servers to collect messages for intelligence',
    platforms: ['windows', 'cloud'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.3,
    prerequisites: ['email_credentials', 'exchange_access'],
    artifacts: ['mailbox_access_logs', 'ews_logs', 'oauth_tokens'],
    mitigations: ['mailbox_auditing', 'mfa', 'conditional_access'],
    tools: ['MailSniper', 'Ruler', 'custom_ews_scripts'],
  })
  add({
    id: 'T1560.001',
    mitreId: 'T1560.001',
    name: 'Archive Collected Data',
    tactic: 'collection',
    description: 'Compress and encrypt collected data for exfiltration staging',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.9,
    noiseLevel: 0.2,
    prerequisites: ['collected_data'],
    artifacts: ['archive_creation', 'compression_tools', 'file_staging'],
    mitigations: ['dlp', 'file_monitoring', 'edr'],
    tools: ['7zip', 'tar', 'rar', 'custom_packer'],
  })

  // ── Exfiltration ──
  add({
    id: 'T1048.002',
    mitreId: 'T1048.002',
    name: 'Exfiltration Over DNS',
    tactic: 'exfiltration',
    description: 'Encode and exfiltrate data through DNS queries and responses',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.6,
    successProbability: 0.75,
    noiseLevel: 0.1,
    prerequisites: ['dns_access', 'c2_dns_server'],
    artifacts: ['unusual_dns_queries', 'high_dns_volume', 'encoded_subdomains'],
    mitigations: ['dns_monitoring', 'dns_filtering', 'dns_over_https_blocking'],
    tools: ['dnscat2', 'iodine', 'DNSExfiltrator', 'Cobalt_Strike'],
  })
  add({
    id: 'T1041',
    mitreId: 'T1041',
    name: 'Exfiltration Over C2 Channel',
    tactic: 'exfiltration',
    description: 'Exfiltrate data over the existing C2 communication channel',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.85,
    noiseLevel: 0.2,
    prerequisites: ['active_c2', 'collected_data'],
    artifacts: ['c2_traffic_volume', 'data_transfer_patterns'],
    mitigations: ['network_monitoring', 'dlp', 'traffic_analysis'],
    tools: ['Cobalt_Strike', 'Meterpreter', 'Sliver', 'Havoc'],
  })
  add({
    id: 'T1567.002',
    mitreId: 'T1567.002',
    name: 'Exfiltration to Cloud Storage',
    tactic: 'exfiltration',
    description: 'Upload stolen data to cloud storage services (S3, OneDrive, Mega, Dropbox)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.6,
    successProbability: 0.8,
    noiseLevel: 0.1,
    prerequisites: ['cloud_storage_access', 'collected_data'],
    artifacts: ['cloud_api_calls', 'upload_traffic', 'unusual_egress'],
    mitigations: ['casb', 'dlp', 'egress_filtering', 'cloud_access_monitoring'],
    tools: ['rclone', 'aws_cli', 'custom_uploader'],
  })
  add({
    id: 'T1048.001',
    mitreId: 'T1048.001',
    name: 'Exfiltration Over Encrypted Channel',
    tactic: 'exfiltration',
    description: 'Use encrypted protocols (HTTPS, TLS) for covert data exfiltration',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.7,
    successProbability: 0.85,
    noiseLevel: 0.1,
    prerequisites: ['tls_capable_c2'],
    artifacts: ['tls_traffic_analysis', 'certificate_anomalies', 'traffic_volume'],
    mitigations: ['tls_inspection', 'traffic_analysis', 'dlp'],
    tools: ['curl', 'custom_https_exfil', 'Cobalt_Strike'],
  })

  // ── Command and Control ──
  add({
    id: 'T1071.001',
    mitreId: 'T1071.001',
    name: 'HTTPS C2',
    tactic: 'command_and_control',
    description: 'C2 communication over HTTPS with malleable profiles',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.6,
    successProbability: 0.85,
    noiseLevel: 0.1,
    prerequisites: ['c2_infrastructure', 'valid_tls_cert'],
    artifacts: ['https_beacons', 'jitter_patterns', 'user_agent_anomalies'],
    mitigations: [
      'tls_inspection',
      'domain_reputation',
      'jarm_fingerprinting',
      'behavioral_analysis',
    ],
    tools: ['Cobalt_Strike', 'Sliver', 'Havoc', 'Mythic', 'Brute_Ratel'],
  })
  add({
    id: 'T1071.004',
    mitreId: 'T1071.004',
    name: 'DNS C2',
    tactic: 'command_and_control',
    description: 'C2 communication encoded in DNS queries and responses',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.5,
    successProbability: 0.7,
    noiseLevel: 0.1,
    prerequisites: ['dns_c2_server', 'controlled_domain'],
    artifacts: ['dns_query_patterns', 'txt_record_anomalies', 'subdomain_entropy'],
    mitigations: ['dns_monitoring', 'passive_dns', 'dns_firewall'],
    tools: ['dnscat2', 'Cobalt_Strike_DNS', 'DNSdelivery'],
  })
  add({
    id: 'T1090.004',
    mitreId: 'T1090.004',
    name: 'Domain Fronting',
    tactic: 'command_and_control',
    description: 'Use CDN domain fronting to hide C2 traffic behind legitimate domains',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.8,
    successProbability: 0.7,
    noiseLevel: 0.05,
    prerequisites: ['cdn_domain_fronting_support', 'c2_infrastructure'],
    artifacts: ['host_header_mismatch', 'sni_analysis', 'traffic_patterns'],
    mitigations: ['sni_inspection', 'domain_reputation', 'traffic_analysis'],
    tools: ['Cobalt_Strike', 'custom_frontable_domains'],
  })
  add({
    id: 'T1572',
    mitreId: 'T1572',
    name: 'Protocol Tunneling',
    tactic: 'command_and_control',
    description: 'Tunnel C2 over allowed protocols (SSH, DNS, ICMP, WebSocket)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.6,
    successProbability: 0.8,
    noiseLevel: 0.1,
    prerequisites: ['tunnel_endpoint', 'allowed_protocol'],
    artifacts: ['tunnel_traffic_patterns', 'protocol_anomalies', 'encapsulated_data'],
    mitigations: ['protocol_inspection', 'traffic_analysis', 'egress_filtering'],
    tools: ['chisel', 'SSHuttle', 'icmpsh', 'dnscat2'],
  })
  add({
    id: 'T1102',
    mitreId: 'T1102',
    name: 'Web Service C2',
    tactic: 'command_and_control',
    description: 'Use legitimate web services (Slack, Teams, GitHub, Telegram) as C2 channels',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.7,
    successProbability: 0.75,
    noiseLevel: 0.05,
    prerequisites: ['web_service_api_access'],
    artifacts: ['api_calls', 'unusual_service_usage', 'data_patterns'],
    mitigations: ['api_monitoring', 'casb', 'behavioral_analysis'],
    tools: ['Slackbot_C2', 'GithubC2', 'TelegramRAT', 'DVGA'],
  })

  // ── Impact ──
  add({
    id: 'T1486',
    mitreId: 'T1486',
    name: 'Data Encrypted for Impact',
    tactic: 'impact',
    description: 'Ransomware-style encryption of data for extortion',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.2,
    successProbability: 0.9,
    noiseLevel: 0.9,
    prerequisites: ['code_execution', 'file_access'],
    artifacts: ['file_encryption', 'ransom_note', 'crypto_api_usage', 'file_extension_changes'],
    mitigations: ['backup', 'edr', 'canary_files', 'application_whitelisting'],
    tools: ['custom_ransomware', 'ransomware_simulator'],
  })
  add({
    id: 'T1485',
    mitreId: 'T1485',
    name: 'Data Destruction',
    tactic: 'impact',
    description: 'Wipe or corrupt data to cause maximum damage',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'admin',
    detectionDifficulty: 0.2,
    successProbability: 0.95,
    noiseLevel: 0.9,
    prerequisites: ['admin_access', 'target_data_identified'],
    artifacts: ['mass_file_deletion', 'disk_operations', 'mbr_modification'],
    mitigations: ['backup', 'access_controls', 'monitoring', 'immutable_storage'],
    tools: ['custom_wiper', 'dd', 'cipher'],
  })
  add({
    id: 'T1498',
    mitreId: 'T1498',
    name: 'Network Denial of Service',
    tactic: 'impact',
    description: 'Volumetric or protocol DDoS attacks against target infrastructure',
    platforms: ['windows', 'linux'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.1,
    successProbability: 0.7,
    noiseLevel: 1.0,
    prerequisites: ['botnet_or_amplification', 'target_ip'],
    artifacts: ['traffic_spikes', 'network_anomalies', 'service_degradation'],
    mitigations: ['ddos_protection', 'rate_limiting', 'cdn', 'traffic_scrubbing'],
    tools: ['LOIC', 'hping3', 'Slowloris', 'custom_botnet'],
  })
  add({
    id: 'T1496',
    mitreId: 'T1496',
    name: 'Resource Hijacking',
    tactic: 'impact',
    description: 'Cryptojacking — hijack compute resources for cryptocurrency mining',
    platforms: ['windows', 'linux', 'cloud'],
    requiredPrivileges: 'user',
    detectionDifficulty: 0.4,
    successProbability: 0.8,
    noiseLevel: 0.3,
    prerequisites: ['code_execution', 'compute_resources'],
    artifacts: ['high_cpu_usage', 'mining_pool_connections', 'crypto_binaries'],
    mitigations: ['resource_monitoring', 'egress_filtering', 'edr'],
    tools: ['XMRig', 'custom_miner', 'browser_miner'],
  })

  // ── Resource Development ──
  add({
    id: 'T1583.001',
    mitreId: 'T1583.001',
    name: 'Acquire Infrastructure: Domains',
    tactic: 'resource_development',
    description: 'Register domains for phishing, C2, or credential harvesting',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.6,
    successProbability: 0.95,
    noiseLevel: 0.0,
    prerequisites: ['funding', 'domain_registrar'],
    artifacts: ['domain_registration', 'whois_changes', 'dns_records'],
    mitigations: ['domain_monitoring', 'brand_protection', 'dns_sinkholing'],
    tools: ['Namecheap', 'Cloudflare', 'domain_tools'],
  })
  add({
    id: 'T1587.001',
    mitreId: 'T1587.001',
    name: 'Develop Capabilities: Malware',
    tactic: 'resource_development',
    description: 'Custom malware development with evasion and anti-analysis features',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.8,
    successProbability: 0.7,
    noiseLevel: 0.0,
    prerequisites: ['development_skills', 'tooling'],
    artifacts: ['compilation_artifacts', 'debug_strings', 'code_similarities'],
    mitigations: ['behavioral_analysis', 'ml_detection', 'sandbox', 'threat_intelligence'],
    tools: ['Visual_Studio', 'gcc', 'Nim', 'Golang', 'Rust_malware_dev'],
  })

  // ── Reconnaissance ──
  add({
    id: 'T1595.002',
    mitreId: 'T1595.002',
    name: 'Active Scanning: Vulnerability Scanning',
    tactic: 'reconnaissance',
    description: 'Scan target infrastructure for known vulnerabilities',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.3,
    successProbability: 0.8,
    noiseLevel: 0.7,
    prerequisites: ['target_ip_range'],
    artifacts: ['scan_traffic', 'ids_alerts', 'web_logs'],
    mitigations: ['ids', 'rate_limiting', 'honeypots'],
    tools: ['Nessus', 'OpenVAS', 'Nuclei', 'Nikto', 'Acunetix'],
  })
  add({
    id: 'T1593',
    mitreId: 'T1593',
    name: 'Search Open Websites/Domains',
    tactic: 'reconnaissance',
    description: 'OSINT gathering from public sources (LinkedIn, GitHub, DNS, WHOIS)',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.8,
    successProbability: 0.9,
    noiseLevel: 0.0,
    prerequisites: ['target_name'],
    artifacts: ['web_access_logs', 'api_queries'],
    mitigations: ['information_minimization', 'monitoring', 'awareness'],
    tools: ['theHarvester', 'Shodan', 'Censys', 'SpiderFoot', 'Maltego', 'recon-ng'],
  })
  add({
    id: 'T1592',
    mitreId: 'T1592',
    name: 'Gather Victim Host Information',
    tactic: 'reconnaissance',
    description: 'Collect target hardware, software, and configuration details',
    platforms: ['windows', 'linux', 'macos'],
    requiredPrivileges: 'none',
    detectionDifficulty: 0.7,
    successProbability: 0.8,
    noiseLevel: 0.1,
    prerequisites: ['target_identified'],
    artifacts: ['scan_traffic', 'dns_queries', 'web_fingerprinting'],
    mitigations: ['information_minimization', 'honeypots'],
    tools: ['WhatWeb', 'Wappalyzer', 'BuiltWith', 'httpx'],
  })

  return db
}

function buildAttackerProfiles(): AttackerProfile[] {
  const db: AttackerProfile[] = []
  const add = (p: AttackerProfile) => {
    db.push(p)
  }

  add({
    id: 'apt28',
    name: 'APT28 (Fancy Bear)',
    skillLevel: 'apt',
    motivation: 'espionage',
    resources: 'high',
    preferredTactics: [
      'initial_access',
      'credential_access',
      'lateral_movement',
      'collection',
      'exfiltration',
    ],
    toolkits: ['X-Agent', 'Sofacy', 'Zebrocy', 'GoDownloader', 'CompuTrace'],
    targetPreferences: ['government', 'military', 'defense', 'media', 'political_orgs'],
    riskTolerance: 0.4,
    operationalSecurity: 0.8,
    persistence: 0.9,
  })
  add({
    id: 'apt29',
    name: 'APT29 (Cozy Bear)',
    skillLevel: 'nation_state',
    motivation: 'espionage',
    resources: 'unlimited',
    preferredTactics: [
      'initial_access',
      'defense_evasion',
      'persistence',
      'collection',
      'exfiltration',
    ],
    toolkits: [
      'SUNBURST',
      'TEARDROP',
      'WellMess',
      'WellMail',
      'EnvyScout',
      'BoomBox',
      'NativeZone',
    ],
    targetPreferences: ['government', 'think_tanks', 'healthcare', 'energy', 'technology'],
    riskTolerance: 0.2,
    operationalSecurity: 0.95,
    persistence: 0.95,
  })
  add({
    id: 'lazarus',
    name: 'Lazarus Group',
    skillLevel: 'apt',
    motivation: 'financial',
    resources: 'high',
    preferredTactics: ['initial_access', 'execution', 'persistence', 'defense_evasion', 'impact'],
    toolkits: ['HOPLIGHT', 'ELECTRICFISH', 'ThreatNeedle', 'DTrack', 'MATA', 'AppleJeus'],
    targetPreferences: ['financial', 'cryptocurrency', 'defense', 'media', 'government'],
    riskTolerance: 0.6,
    operationalSecurity: 0.7,
    persistence: 0.85,
  })
  add({
    id: 'apt41',
    name: 'APT41 (Double Dragon)',
    skillLevel: 'apt',
    motivation: 'espionage',
    resources: 'high',
    preferredTactics: [
      'initial_access',
      'execution',
      'persistence',
      'privilege_escalation',
      'lateral_movement',
    ],
    toolkits: ['ShadowPad', 'PlugX', 'Winnti', 'Cobalt_Strike', 'Speculoos', 'StealthVector'],
    targetPreferences: ['technology', 'healthcare', 'gaming', 'telecommunications', 'education'],
    riskTolerance: 0.5,
    operationalSecurity: 0.8,
    persistence: 0.9,
  })
  add({
    id: 'sandworm',
    name: 'Sandworm (Unit 74455)',
    skillLevel: 'nation_state',
    motivation: 'destruction',
    resources: 'unlimited',
    preferredTactics: [
      'initial_access',
      'execution',
      'impact',
      'defense_evasion',
      'lateral_movement',
    ],
    toolkits: ['NotPetya', 'Industroyer', 'Olympic_Destroyer', 'Cyclops_Blink', 'AcidRain'],
    targetPreferences: ['energy', 'government', 'elections', 'olympics', 'critical_infrastructure'],
    riskTolerance: 0.7,
    operationalSecurity: 0.8,
    persistence: 0.85,
  })
  add({
    id: 'turla',
    name: 'Turla (Venomous Bear)',
    skillLevel: 'nation_state',
    motivation: 'espionage',
    resources: 'unlimited',
    preferredTactics: [
      'initial_access',
      'defense_evasion',
      'persistence',
      'command_and_control',
      'exfiltration',
    ],
    toolkits: ['Snake', 'Carbon', 'Kazuar', 'ComRAT', 'LightNeuron', 'HyperStack'],
    targetPreferences: ['government', 'diplomatic', 'military', 'research', 'satellite'],
    riskTolerance: 0.2,
    operationalSecurity: 0.95,
    persistence: 0.95,
  })
  add({
    id: 'conti',
    name: 'Conti Ransomware Group',
    skillLevel: 'advanced',
    motivation: 'financial',
    resources: 'high',
    preferredTactics: [
      'initial_access',
      'execution',
      'lateral_movement',
      'credential_access',
      'impact',
    ],
    toolkits: ['Conti_Ransomware', 'BazarLoader', 'TrickBot', 'Cobalt_Strike', 'Ryuk', 'Emotet'],
    targetPreferences: ['healthcare', 'government', 'manufacturing', 'critical_infrastructure'],
    riskTolerance: 0.8,
    operationalSecurity: 0.6,
    persistence: 0.7,
  })
  add({
    id: 'revil',
    name: 'REvil/Sodinokibi',
    skillLevel: 'advanced',
    motivation: 'financial',
    resources: 'high',
    preferredTactics: [
      'initial_access',
      'execution',
      'privilege_escalation',
      'lateral_movement',
      'impact',
    ],
    toolkits: ['REvil_Ransomware', 'Cobalt_Strike', 'Metasploit', 'PowerShell_Empire'],
    targetPreferences: ['enterprise', 'msp', 'supply_chain', 'legal', 'insurance'],
    riskTolerance: 0.7,
    operationalSecurity: 0.5,
    persistence: 0.6,
  })
  add({
    id: 'darkside',
    name: 'DarkSide',
    skillLevel: 'advanced',
    motivation: 'financial',
    resources: 'high',
    preferredTactics: [
      'initial_access',
      'credential_access',
      'lateral_movement',
      'exfiltration',
      'impact',
    ],
    toolkits: ['DarkSide_Ransomware', 'Cobalt_Strike', 'BloodHound', 'Mimikatz', 'PowerShell'],
    targetPreferences: ['energy', 'oil_gas', 'enterprise', 'manufacturing'],
    riskTolerance: 0.6,
    operationalSecurity: 0.5,
    persistence: 0.6,
  })
  add({
    id: 'equation_group',
    name: 'Equation Group',
    skillLevel: 'nation_state',
    motivation: 'state_sponsored',
    resources: 'unlimited',
    preferredTactics: [
      'initial_access',
      'persistence',
      'defense_evasion',
      'collection',
      'exfiltration',
    ],
    toolkits: ['EternalBlue', 'DoublePulsar', 'EQUATIONDRUG', 'GRAYFISH', 'FANNY', 'DanderSpritz'],
    targetPreferences: ['government', 'military', 'telecommunications', 'aerospace', 'nuclear'],
    riskTolerance: 0.1,
    operationalSecurity: 0.99,
    persistence: 0.99,
  })
  add({
    id: 'script_kiddie',
    name: 'Script Kiddie',
    skillLevel: 'script_kiddie',
    motivation: 'thrill',
    resources: 'low',
    preferredTactics: ['initial_access', 'execution', 'impact'],
    toolkits: ['Metasploit', 'LOIC', 'SQLMap', 'public_exploits', 'Kali_default_tools'],
    targetPreferences: ['low_security_websites', 'personal_targets', 'small_business'],
    riskTolerance: 0.9,
    operationalSecurity: 0.1,
    persistence: 0.2,
  })
  add({
    id: 'insider_malicious',
    name: 'Malicious Insider',
    skillLevel: 'intermediate',
    motivation: 'revenge',
    resources: 'medium',
    preferredTactics: ['collection', 'exfiltration', 'impact', 'credential_access'],
    toolkits: ['legitimate_tools', 'usb_drives', 'personal_email', 'cloud_storage'],
    targetPreferences: ['current_employer', 'competitor_data', 'trade_secrets'],
    riskTolerance: 0.5,
    operationalSecurity: 0.3,
    persistence: 0.4,
  })
  add({
    id: 'hacktivist',
    name: 'Anonymous-Style Hacktivist',
    skillLevel: 'intermediate',
    motivation: 'hacktivism',
    resources: 'low',
    preferredTactics: ['initial_access', 'impact', 'reconnaissance'],
    toolkits: ['DDoS_tools', 'SQLMap', 'web_defacement_tools', 'data_leak_platforms'],
    targetPreferences: ['government', 'corporations', 'controversial_organizations'],
    riskTolerance: 0.8,
    operationalSecurity: 0.3,
    persistence: 0.3,
  })
  add({
    id: 'organized_crime',
    name: 'Organized Cybercrime Syndicate',
    skillLevel: 'advanced',
    motivation: 'financial',
    resources: 'high',
    preferredTactics: [
      'initial_access',
      'credential_access',
      'lateral_movement',
      'impact',
      'exfiltration',
    ],
    toolkits: [
      'banking_trojans',
      'ransomware',
      'phishing_kits',
      'bulletproof_hosting',
      'money_laundering_crypto',
    ],
    targetPreferences: ['financial', 'retail', 'healthcare', 'enterprise'],
    riskTolerance: 0.6,
    operationalSecurity: 0.6,
    persistence: 0.7,
  })
  add({
    id: 'red_team',
    name: 'Professional Red Team',
    skillLevel: 'advanced',
    motivation: 'thrill',
    resources: 'medium',
    preferredTactics: [
      'initial_access',
      'execution',
      'privilege_escalation',
      'lateral_movement',
      'defense_evasion',
    ],
    toolkits: [
      'Cobalt_Strike',
      'Sliver',
      'Havoc',
      'Brute_Ratel',
      'Mythic',
      'Nighthawk',
      'custom_C2',
    ],
    targetPreferences: ['contracted_targets', 'all_sectors'],
    riskTolerance: 0.3,
    operationalSecurity: 0.8,
    persistence: 0.8,
  })

  return db
}

function buildPersistenceMechanisms(): PersistenceMechanism[] {
  const db: PersistenceMechanism[] = []
  const add = (m: PersistenceMechanism) => {
    db.push(m)
  }

  add({
    id: 'reg-run',
    name: 'Registry Run Keys',
    type: 'registry',
    platform: 'windows',
    privilege: 'user',
    stealth: 0.3,
    reliability: 0.9,
    survivesReboot: true,
    description: 'HKCU/HKLM Run keys for automatic execution at logon',
    detection: ['autoruns', 'registry_monitoring', 'edr'],
  })
  add({
    id: 'svc-create',
    name: 'Windows Service',
    type: 'service',
    platform: 'windows',
    privilege: 'admin',
    stealth: 0.4,
    reliability: 0.95,
    survivesReboot: true,
    description: 'Create malicious Windows service for persistent SYSTEM execution',
    detection: ['service_creation_events', 'sc_query', 'autoruns'],
  })
  add({
    id: 'schtask',
    name: 'Scheduled Task',
    type: 'scheduled_task',
    platform: 'windows',
    privilege: 'user',
    stealth: 0.4,
    reliability: 0.85,
    survivesReboot: true,
    description: 'Windows Task Scheduler for timed or event-triggered execution',
    detection: ['task_scheduler_logs', 'schtasks_query', 'edr'],
  })
  add({
    id: 'startup-folder',
    name: 'Startup Folder',
    type: 'startup',
    platform: 'windows',
    privilege: 'user',
    stealth: 0.2,
    reliability: 0.85,
    survivesReboot: true,
    description: 'Place shortcut/executable in user/all-users startup folder',
    detection: ['file_monitoring', 'autoruns', 'edr'],
  })
  add({
    id: 'wmi-sub',
    name: 'WMI Event Subscription',
    type: 'wmi_event',
    platform: 'windows',
    privilege: 'admin',
    stealth: 0.7,
    reliability: 0.8,
    survivesReboot: true,
    description: 'WMI permanent event subscription for fileless persistence',
    detection: ['wmi_repository_scan', 'etw_logs', 'sysmon'],
  })
  add({
    id: 'dll-hijack',
    name: 'DLL Search Order Hijacking',
    type: 'dll_hijack',
    platform: 'windows',
    privilege: 'user',
    stealth: 0.6,
    reliability: 0.75,
    survivesReboot: true,
    description: 'Place malicious DLL in application search path for sideloading',
    detection: ['dll_load_monitoring', 'process_integrity', 'edr'],
  })
  add({
    id: 'com-hijack',
    name: 'COM Object Hijacking',
    type: 'com_hijack',
    platform: 'windows',
    privilege: 'user',
    stealth: 0.7,
    reliability: 0.7,
    survivesReboot: true,
    description: 'Hijack COM object references in registry for execution',
    detection: ['registry_monitoring', 'com_object_auditing', 'edr'],
  })
  add({
    id: 'webshell',
    name: 'Web Shell Deployment',
    type: 'webshell',
    platform: 'linux',
    privilege: 'user',
    stealth: 0.4,
    reliability: 0.9,
    survivesReboot: true,
    description: 'Deploy web shell (PHP/ASPX/JSP) on compromised web server',
    detection: ['file_integrity', 'web_log_analysis', 'yara_rules'],
  })
  add({
    id: 'cron-job',
    name: 'Cron Job',
    type: 'scheduled_task',
    platform: 'linux',
    privilege: 'user',
    stealth: 0.4,
    reliability: 0.9,
    survivesReboot: true,
    description: 'Add crontab entry for periodic execution on Linux',
    detection: ['crontab_monitoring', 'audit_logs', 'file_integrity'],
  })
  add({
    id: 'systemd-svc',
    name: 'Systemd Service',
    type: 'service',
    platform: 'linux',
    privilege: 'admin',
    stealth: 0.5,
    reliability: 0.95,
    survivesReboot: true,
    description: 'Create systemd service unit for persistent daemon execution',
    detection: ['systemctl_list', 'service_file_monitoring', 'journald'],
  })
  add({
    id: 'ssh-key',
    name: 'SSH Authorized Keys',
    type: 'implant',
    platform: 'linux',
    privilege: 'user',
    stealth: 0.5,
    reliability: 0.95,
    survivesReboot: true,
    description: 'Add attacker SSH key to authorized_keys for persistent access',
    detection: ['authorized_keys_monitoring', 'ssh_login_audit', 'file_integrity'],
  })
  add({
    id: 'rootkit',
    name: 'Kernel Rootkit',
    type: 'rootkit',
    platform: 'linux',
    privilege: 'system',
    stealth: 0.9,
    reliability: 0.7,
    survivesReboot: false,
    description: 'Load kernel module rootkit for deep system hiding',
    detection: ['kernel_integrity', 'lsmod', 'memory_forensics', 'secure_boot'],
  })
  add({
    id: 'bootkit',
    name: 'UEFI Bootkit',
    type: 'bootkit',
    platform: 'windows',
    privilege: 'system',
    stealth: 0.95,
    reliability: 0.6,
    survivesReboot: true,
    description: 'Modify UEFI firmware for pre-OS persistent execution',
    detection: ['secure_boot', 'firmware_integrity', 'uefi_scanning'],
  })
  add({
    id: 'firmware-implant',
    name: 'Firmware Implant',
    type: 'firmware',
    platform: 'windows',
    privilege: 'system',
    stealth: 0.98,
    reliability: 0.5,
    survivesReboot: true,
    description: 'BMC/IPMI/NIC firmware implant for hardware-level persistence',
    detection: ['firmware_verification', 'hardware_security_module', 'supply_chain_audit'],
  })
  add({
    id: 'launch-agent',
    name: 'macOS Launch Agent',
    type: 'startup',
    platform: 'macos',
    privilege: 'user',
    stealth: 0.4,
    reliability: 0.9,
    survivesReboot: true,
    description: 'Create plist in LaunchAgents for persistent user-level execution',
    detection: ['launchd_monitoring', 'autoruns_mac', 'edr'],
  })

  return db
}

function buildEvasionTechniques(): EvasionTechnique[] {
  const db: EvasionTechnique[] = []
  const add = (e: EvasionTechnique) => {
    db.push(e)
  }

  add({
    id: 'amsi-bypass',
    name: 'AMSI Bypass',
    category: 'amsi_bypass',
    effectiveness: 0.8,
    complexity: 0.3,
    description: 'Patch AMSI in memory to prevent script scanning (AmsiScanBuffer patch)',
    bypasses: ['windows_defender', 'av_powershell_scanning'],
    indicators: ['memory_patching', 'amsi_dll_modification'],
  })
  add({
    id: 'etw-patch',
    name: 'ETW Patching',
    category: 'obfuscation',
    effectiveness: 0.85,
    complexity: 0.5,
    description: 'Patch ETW providers to blind .NET and security event tracing',
    bypasses: ['etw_logging', 'dotnet_tracing', 'sysmon_events'],
    indicators: ['ntdll_patching', 'etw_provider_gaps'],
  })
  add({
    id: 'process-hollow',
    name: 'Process Hollowing',
    category: 'process_injection',
    effectiveness: 0.75,
    complexity: 0.6,
    description: 'Create suspended process, unmap memory, inject malicious code',
    bypasses: ['process_monitoring', 'application_whitelisting'],
    indicators: ['unmapped_sections', 'memory_anomalies', 'api_sequence'],
  })
  add({
    id: 'dll-injection',
    name: 'DLL Injection',
    category: 'process_injection',
    effectiveness: 0.7,
    complexity: 0.4,
    description: 'Inject malicious DLL into legitimate process via CreateRemoteThread',
    bypasses: ['process_trust', 'av_scanning'],
    indicators: ['dll_loading_anomalies', 'remote_thread_creation'],
  })
  add({
    id: 'reflective-dll',
    name: 'Reflective DLL Loading',
    category: 'process_injection',
    effectiveness: 0.8,
    complexity: 0.7,
    description: 'Load DLL from memory without touching disk, bypassing file-based detection',
    bypasses: ['file_scanning', 'dll_monitoring', 'edr_file_hooks'],
    indicators: ['memory_anomalies', 'pe_header_in_memory'],
  })
  add({
    id: 'syscall-direct',
    name: 'Direct Syscalls',
    category: 'process_injection',
    effectiveness: 0.85,
    complexity: 0.8,
    description: 'Call NT syscalls directly to bypass usermode API hooking by EDR',
    bypasses: ['edr_hooks', 'ntdll_monitoring', 'api_hooking'],
    indicators: ['syscall_from_non_ntdll', 'unusual_call_stacks'],
  })
  add({
    id: 'unhooking',
    name: 'NTDLL Unhooking',
    category: 'process_injection',
    effectiveness: 0.8,
    complexity: 0.6,
    description: 'Remap clean copy of ntdll.dll to remove EDR hooks',
    bypasses: ['edr_usermode_hooks', 'api_monitoring'],
    indicators: ['ntdll_remapping', 'file_read_ntdll', 'section_recreation'],
  })
  add({
    id: 'ppid-spoof',
    name: 'Parent PID Spoofing',
    category: 'process_injection',
    effectiveness: 0.7,
    complexity: 0.5,
    description: 'Spoof parent process ID to evade parent-child process monitoring',
    bypasses: ['process_tree_analysis', 'parent_child_rules'],
    indicators: ['ppid_mismatch', 'unusual_process_ancestry'],
  })
  add({
    id: 'timestomp',
    name: 'Timestomping',
    category: 'timestomping',
    effectiveness: 0.6,
    complexity: 0.2,
    description: 'Modify file timestamps to blend with legitimate system files',
    bypasses: ['timeline_analysis', 'file_age_detection'],
    indicators: ['mft_timestamp_inconsistency', 'usn_journal_mismatch'],
  })
  add({
    id: 'log-clear',
    name: 'Log Clearing',
    category: 'log_tampering',
    effectiveness: 0.5,
    complexity: 0.2,
    description: 'Clear or selectively modify event logs to remove evidence',
    bypasses: ['local_forensics', 'event_log_analysis'],
    indicators: ['event_1102', 'log_gaps', 'log_service_restart'],
  })
  add({
    id: 'log-selective',
    name: 'Selective Log Editing',
    category: 'log_tampering',
    effectiveness: 0.7,
    complexity: 0.6,
    description: 'Patch specific log entries without clearing entire log (EventCleaner)',
    bypasses: ['log_review', 'forensic_analysis'],
    indicators: ['log_inconsistencies', 'modified_evtx', 'phantom_records'],
  })
  add({
    id: 'lolbin',
    name: 'Living Off the Land (LOLBins)',
    category: 'living_off_land',
    effectiveness: 0.75,
    complexity: 0.3,
    description:
      'Use legitimate system binaries (certutil, mshta, regsvr32, rundll32) for malicious purposes',
    bypasses: ['application_whitelisting', 'file_based_av'],
    indicators: ['unusual_lolbin_usage', 'command_line_args', 'network_connections_from_lolbins'],
  })
  add({
    id: 'fileless',
    name: 'Fileless Execution',
    category: 'obfuscation',
    effectiveness: 0.8,
    complexity: 0.5,
    description: 'Execute entirely in memory using PowerShell, .NET, or WMI without files on disk',
    bypasses: ['file_scanning', 'disk_forensics', 'av'],
    indicators: ['memory_anomalies', 'script_block_logs', 'wmi_activity'],
  })
  add({
    id: 'polymorphic',
    name: 'Polymorphic Code',
    category: 'polymorphism',
    effectiveness: 0.75,
    complexity: 0.7,
    description:
      'Mutating payload that changes signature each execution while maintaining functionality',
    bypasses: ['signature_detection', 'hash_matching', 'yara_static'],
    indicators: ['behavioral_anomalies', 'entropy_analysis'],
  })
  add({
    id: 'sandbox-detect',
    name: 'Sandbox Detection',
    category: 'sandbox_evasion',
    effectiveness: 0.7,
    complexity: 0.4,
    description:
      'Check for VM/sandbox artifacts before executing payload (timing, hardware, environment)',
    bypasses: ['automated_sandbox', 'av_emulation', 'cloud_sandbox'],
    indicators: ['environment_checks', 'timing_delays', 'hardware_queries'],
  })
  add({
    id: 'anti-debug',
    name: 'Anti-Debugging',
    category: 'sandbox_evasion',
    effectiveness: 0.65,
    complexity: 0.5,
    description: 'Detect debuggers via IsDebuggerPresent, NtQueryInformationProcess, timing checks',
    bypasses: ['manual_debugging', 'reverse_engineering'],
    indicators: ['debug_api_calls', 'timing_checks', 'self_patching'],
  })
  add({
    id: 'string-encrypt',
    name: 'String Encryption',
    category: 'encryption',
    effectiveness: 0.65,
    complexity: 0.3,
    description: 'Encrypt all strings and decrypt at runtime to evade static analysis',
    bypasses: ['static_analysis', 'yara_string_rules', 'sandbox_string_extraction'],
    indicators: ['runtime_decryption', 'high_entropy_sections'],
  })
  add({
    id: 'stego-payload',
    name: 'Steganographic Payload',
    category: 'steganography',
    effectiveness: 0.8,
    complexity: 0.6,
    description: 'Hide payloads in images, audio, or video files using steganography',
    bypasses: ['content_inspection', 'file_type_filtering', 'network_monitoring'],
    indicators: ['unusual_media_files', 'lsb_analysis', 'entropy_anomalies'],
  })
  add({
    id: 'code-signing',
    name: 'Stolen Code Signing Certificate',
    category: 'obfuscation',
    effectiveness: 0.85,
    complexity: 0.8,
    description: 'Sign malware with stolen or purchased code signing certificates',
    bypasses: ['signature_verification', 'application_whitelisting', 'smartscreen'],
    indicators: ['certificate_revocation', 'unusual_signer', 'certificate_abuse'],
  })
  add({
    id: 'memory-only',
    name: 'Memory-Only Payload',
    category: 'obfuscation',
    effectiveness: 0.85,
    complexity: 0.6,
    description: 'Payload exists only in memory, never touches disk, survives only until reboot',
    bypasses: ['disk_forensics', 'file_scanning', 'av_file_hooks'],
    indicators: ['memory_forensics', 'process_memory_anomalies'],
  })
  add({
    id: 'gadget-chain',
    name: 'ROP/JOP Gadget Chains',
    category: 'obfuscation',
    effectiveness: 0.75,
    complexity: 0.9,
    description: 'Use return/jump-oriented programming to bypass DEP and code integrity',
    bypasses: ['dep', 'code_integrity', 'control_flow_guard'],
    indicators: ['stack_anomalies', 'unusual_ret_sequences', 'gadget_patterns'],
  })
  add({
    id: 'edr-unhook-full',
    name: 'Full EDR Bypass Chain',
    category: 'process_injection',
    effectiveness: 0.9,
    complexity: 0.9,
    description:
      'Combine direct syscalls + NTDLL unhooking + ETW patch + AMSI bypass for complete EDR evasion',
    bypasses: ['edr_full_stack', 'av', 'behavioral_analysis'],
    indicators: ['combined_evasion_artifacts', 'memory_patching_sequence'],
  })

  return db
}

function buildC2Channels(): C2Channel[] {
  const db: C2Channel[] = []
  const add = (c: C2Channel) => {
    db.push(c)
  }

  add({
    id: 'https-beacon',
    name: 'HTTPS Beaconing',
    protocol: 'https',
    bandwidth: 'high',
    stealth: 0.7,
    reliability: 0.9,
    latency: 'low',
    resilience: 0.6,
    description: 'Periodic HTTPS callbacks with malleable C2 profiles mimicking legitimate traffic',
    detection: ['tls_inspection', 'jarm', 'behavioral_analysis', 'beacon_pattern_detection'],
  })
  add({
    id: 'dns-tunnel',
    name: 'DNS Tunneling',
    protocol: 'dns',
    bandwidth: 'low',
    stealth: 0.7,
    reliability: 0.8,
    latency: 'high',
    resilience: 0.7,
    description: 'Encode C2 data in DNS queries (TXT/CNAME/A records) through DNS infrastructure',
    detection: ['dns_monitoring', 'query_frequency', 'subdomain_entropy', 'txt_record_analysis'],
  })
  add({
    id: 'domain-front',
    name: 'Domain Fronting',
    protocol: 'domain_fronting',
    bandwidth: 'high',
    stealth: 0.9,
    reliability: 0.7,
    latency: 'low',
    resilience: 0.5,
    description: 'Hide C2 behind CDN domains (CloudFront, Azure CDN, Fastly)',
    detection: ['sni_host_mismatch', 'tls_certificate_analysis', 'cdn_abuse_monitoring'],
  })
  add({
    id: 'tor-hidden',
    name: 'Tor Hidden Service',
    protocol: 'tor',
    bandwidth: 'medium',
    stealth: 0.8,
    reliability: 0.6,
    latency: 'high',
    resilience: 0.9,
    description: 'C2 via Tor hidden services for anonymous and censorship-resistant communication',
    detection: ['tor_traffic_detection', 'circuit_analysis', 'traffic_timing'],
  })
  add({
    id: 'icmp-tunnel',
    name: 'ICMP Tunneling',
    protocol: 'icmp',
    bandwidth: 'low',
    stealth: 0.6,
    reliability: 0.5,
    latency: 'medium',
    resilience: 0.3,
    description: 'Encode C2 data in ICMP echo request/reply payloads',
    detection: ['icmp_payload_analysis', 'icmp_frequency', 'packet_size_anomalies'],
  })
  add({
    id: 'websocket-c2',
    name: 'WebSocket C2',
    protocol: 'websocket',
    bandwidth: 'high',
    stealth: 0.7,
    reliability: 0.8,
    latency: 'low',
    resilience: 0.5,
    description: 'Persistent WebSocket connections for real-time bidirectional C2',
    detection: ['websocket_monitoring', 'connection_duration', 'traffic_patterns'],
  })
  add({
    id: 'smtp-relay',
    name: 'SMTP Relay C2',
    protocol: 'smtp',
    bandwidth: 'low',
    stealth: 0.6,
    reliability: 0.7,
    latency: 'high',
    resilience: 0.5,
    description: 'C2 commands encoded in email headers/body sent through SMTP relays',
    detection: ['email_gateway_inspection', 'unusual_email_patterns', 'header_analysis'],
  })
  add({
    id: 'cloud-c2',
    name: 'Cloud Service C2',
    protocol: 'cloud_service',
    bandwidth: 'high',
    stealth: 0.8,
    reliability: 0.85,
    latency: 'low',
    resilience: 0.7,
    description: 'Use cloud services (AWS Lambda, Azure Functions, GCP) as C2 relay infrastructure',
    detection: ['cloud_api_monitoring', 'unusual_cloud_usage', 'function_invocation_patterns'],
  })
  add({
    id: 'social-c2',
    name: 'Social Media C2',
    protocol: 'social_media',
    bandwidth: 'low',
    stealth: 0.8,
    reliability: 0.7,
    latency: 'high',
    resilience: 0.6,
    description: 'Use social media APIs (Twitter, Telegram, Discord, Reddit) for C2 commands',
    detection: ['api_monitoring', 'social_media_anomalies', 'encoded_content_detection'],
  })
  add({
    id: 'stego-c2',
    name: 'Steganography C2',
    protocol: 'steganography',
    bandwidth: 'low',
    stealth: 0.9,
    reliability: 0.5,
    latency: 'high',
    resilience: 0.4,
    description: 'Hide C2 commands in images/media files on public hosting platforms',
    detection: ['lsb_analysis', 'unusual_image_downloads', 'entropy_analysis'],
  })
  add({
    id: 'custom-tcp',
    name: 'Custom TCP Protocol',
    protocol: 'custom_tcp',
    bandwidth: 'high',
    stealth: 0.4,
    reliability: 0.85,
    latency: 'low',
    resilience: 0.4,
    description: 'Custom binary protocol over TCP with encryption and compression',
    detection: ['protocol_analysis', 'unknown_protocol_detection', 'traffic_classification'],
  })
  add({
    id: 'doh-c2',
    name: 'DNS-over-HTTPS C2',
    protocol: 'https',
    bandwidth: 'low',
    stealth: 0.85,
    reliability: 0.8,
    latency: 'medium',
    resilience: 0.7,
    description:
      'C2 via DoH queries to public resolvers (Cloudflare, Google) to evade DNS monitoring',
    detection: ['doh_detection', 'resolver_usage', 'encrypted_dns_analysis'],
  })
  add({
    id: 'mesh-c2',
    name: 'Peer-to-Peer Mesh C2',
    protocol: 'custom_tcp',
    bandwidth: 'medium',
    stealth: 0.7,
    reliability: 0.75,
    latency: 'medium',
    resilience: 0.9,
    description: 'Decentralized P2P mesh network for resilient C2 without single point of failure',
    detection: ['p2p_traffic_detection', 'unusual_peer_connections', 'mesh_topology_analysis'],
  })

  return db
}

function buildExfiltrationMethods(): ExfiltrationMethod[] {
  const db: ExfiltrationMethod[] = []
  const add = (m: ExfiltrationMethod) => {
    db.push(m)
  }

  add({
    id: 'https-exfil',
    name: 'HTTPS Data Upload',
    channel: 'https',
    capacity: 'high',
    stealth: 0.6,
    speed: 0.9,
    description: 'Upload encrypted data bundles over HTTPS to attacker-controlled server',
    detection: ['data_volume_monitoring', 'upload_size_anomalies', 'dlp'],
  })
  add({
    id: 'dns-exfil',
    name: 'DNS Data Exfiltration',
    channel: 'dns',
    capacity: 'low',
    stealth: 0.7,
    speed: 0.2,
    description: 'Encode data in DNS subdomain queries for slow covert exfiltration',
    detection: ['dns_query_monitoring', 'subdomain_length_analysis', 'query_volume'],
  })
  add({
    id: 'cloud-exfil',
    name: 'Cloud Storage Upload',
    channel: 'cloud_storage',
    capacity: 'high',
    stealth: 0.7,
    speed: 0.8,
    description: 'Upload to S3/Azure Blob/GCS/Mega/Dropbox using legitimate APIs',
    detection: ['casb', 'cloud_api_monitoring', 'unusual_upload_patterns'],
  })
  add({
    id: 'email-exfil',
    name: 'Email Exfiltration',
    channel: 'email',
    capacity: 'medium',
    stealth: 0.5,
    speed: 0.5,
    description: 'Send data as email attachments to external accounts',
    detection: ['email_gateway', 'attachment_scanning', 'dlp', 'unusual_recipients'],
  })
  add({
    id: 'icmp-exfil',
    name: 'ICMP Tunnel Exfiltration',
    channel: 'icmp',
    capacity: 'low',
    stealth: 0.6,
    speed: 0.1,
    description: 'Exfiltrate data encoded in ICMP packet payloads',
    detection: ['icmp_payload_inspection', 'packet_size_anomalies'],
  })
  add({
    id: 'usb-exfil',
    name: 'USB Drive Exfiltration',
    channel: 'usb',
    capacity: 'high',
    stealth: 0.3,
    speed: 0.7,
    description: 'Copy data to removable USB storage for physical exfiltration',
    detection: ['usb_monitoring', 'dlp', 'device_control', 'audit_logs'],
  })
  add({
    id: 'stego-exfil',
    name: 'Steganographic Exfiltration',
    channel: 'steganography',
    capacity: 'low',
    stealth: 0.9,
    speed: 0.1,
    description: 'Hide data in images/media uploaded to legitimate platforms',
    detection: ['stego_analysis', 'media_file_inspection', 'entropy_analysis'],
  })
  add({
    id: 'covert-exfil',
    name: 'Covert Channel Exfiltration',
    channel: 'covert_channel',
    capacity: 'low',
    stealth: 0.85,
    speed: 0.1,
    description: 'Use timing-based or storage-based covert channels for ultra-stealthy exfil',
    detection: ['statistical_traffic_analysis', 'timing_analysis', 'protocol_anomalies'],
  })
  add({
    id: 'ftp-exfil',
    name: 'FTP/SFTP Upload',
    channel: 'ftp',
    capacity: 'high',
    stealth: 0.3,
    speed: 0.8,
    description: 'Upload data via FTP/SFTP to external server',
    detection: ['ftp_monitoring', 'egress_filtering', 'dlp'],
  })
  add({
    id: 'c2-exfil',
    name: 'C2 Channel Exfiltration',
    channel: 'https',
    capacity: 'medium',
    stealth: 0.7,
    speed: 0.5,
    description: 'Exfiltrate data over existing C2 communication channel',
    detection: ['c2_traffic_volume', 'data_transfer_patterns', 'behavioral_analysis'],
  })
  add({
    id: 'scheduled-exfil',
    name: 'Scheduled Transfer',
    channel: 'https',
    capacity: 'medium',
    stealth: 0.75,
    speed: 0.3,
    description: 'Slow-drip exfiltration on schedule to avoid volume-based detection',
    detection: ['pattern_analysis', 'long_term_traffic_monitoring', 'baseline_comparison'],
  })

  return db
}

function buildLateralMovementPaths(): LateralMovementPath[] {
  const db: LateralMovementPath[] = []
  const add = (p: LateralMovementPath) => {
    db.push(p)
  }

  add({
    id: 'psexec',
    source: 'workstation',
    destination: 'server',
    technique: 'PsExec/SMBExec',
    credentials: 'ntlm_hash',
    protocol: 'SMB',
    risk: 0.5,
    successChance: 0.8,
  })
  add({
    id: 'wmi-lateral',
    source: 'workstation',
    destination: 'workstation',
    technique: 'WMI Remote Execution',
    credentials: 'domain_admin',
    protocol: 'DCOM',
    risk: 0.4,
    successChance: 0.75,
  })
  add({
    id: 'winrm-lateral',
    source: 'workstation',
    destination: 'server',
    technique: 'WinRM PowerShell Remoting',
    credentials: 'admin_creds',
    protocol: 'WinRM',
    risk: 0.4,
    successChance: 0.8,
  })
  add({
    id: 'rdp-lateral',
    source: 'workstation',
    destination: 'server',
    technique: 'RDP Session',
    credentials: 'password',
    protocol: 'RDP',
    risk: 0.3,
    successChance: 0.85,
  })
  add({
    id: 'ssh-lateral',
    source: 'server',
    destination: 'server',
    technique: 'SSH with Stolen Keys',
    credentials: 'ssh_key',
    protocol: 'SSH',
    risk: 0.3,
    successChance: 0.9,
  })
  add({
    id: 'dcom-lateral',
    source: 'workstation',
    destination: 'workstation',
    technique: 'DCOM Execution',
    credentials: 'domain_user',
    protocol: 'DCOM',
    risk: 0.5,
    successChance: 0.65,
  })
  add({
    id: 'schtask-lateral',
    source: 'server',
    destination: 'server',
    technique: 'Remote Scheduled Task',
    credentials: 'admin_creds',
    protocol: 'RPC',
    risk: 0.4,
    successChance: 0.75,
  })
  add({
    id: 'pth-lateral',
    source: 'workstation',
    destination: 'domain_controller',
    technique: 'Pass the Hash',
    credentials: 'ntlm_hash',
    protocol: 'SMB/Kerberos',
    risk: 0.5,
    successChance: 0.8,
  })
  add({
    id: 'ptt-lateral',
    source: 'workstation',
    destination: 'domain_controller',
    technique: 'Pass the Ticket (Golden/Silver)',
    credentials: 'kerberos_ticket',
    protocol: 'Kerberos',
    risk: 0.4,
    successChance: 0.85,
  })
  add({
    id: 'overpass-hash',
    source: 'workstation',
    destination: 'server',
    technique: 'Overpass the Hash',
    credentials: 'ntlm_hash',
    protocol: 'Kerberos',
    risk: 0.4,
    successChance: 0.8,
  })
  add({
    id: 'svc-lateral',
    source: 'server',
    destination: 'server',
    technique: 'Remote Service Creation',
    credentials: 'admin_creds',
    protocol: 'SMB/RPC',
    risk: 0.5,
    successChance: 0.75,
  })
  add({
    id: 'cloud-lateral',
    source: 'cloud_vm',
    destination: 'cloud_vm',
    technique: 'Cloud IAM Pivot',
    credentials: 'iam_role',
    protocol: 'Cloud_API',
    risk: 0.3,
    successChance: 0.7,
  })

  return db
}

function buildPostExploitActions(): PostExploitAction[] {
  const db: PostExploitAction[] = []
  const add = (a: PostExploitAction) => {
    db.push(a)
  }

  add({
    id: 'cred-dump',
    name: 'Credential Dumping',
    category: 'credential_harvest',
    description: 'Extract credentials from LSASS, SAM, NTDS.dit, browser stores, keychains',
    tools: ['Mimikatz', 'pypykatz', 'secretsdump', 'LaZagne', 'nanodump'],
    risk: 0.5,
    impact: 0.9,
  })
  add({
    id: 'ad-enum',
    name: 'Active Directory Enumeration',
    category: 'data_collection',
    description:
      'Map AD trust relationships, SPNs, group memberships, attack paths using BloodHound',
    tools: ['BloodHound', 'SharpHound', 'ADRecon', 'PowerView', 'PingCastle'],
    risk: 0.3,
    impact: 0.8,
  })
  add({
    id: 'priv-esc-scan',
    name: 'Privilege Escalation Scan',
    category: 'privilege_escalation',
    description: 'Automated scan for local privilege escalation vectors (misconfigs, CVEs, SUID)',
    tools: ['WinPEAS', 'LinPEAS', 'BeRoot', 'Watson', 'Seatbelt'],
    risk: 0.2,
    impact: 0.7,
  })
  add({
    id: 'av-disable',
    name: 'Security Tool Disabling',
    category: 'defense_disabling',
    description: 'Disable AV, EDR agents, firewall, and logging services',
    tools: ['EDRSilencer', 'KillDefender', 'Backstab', 'EDRSandblast'],
    risk: 0.6,
    impact: 0.8,
  })
  add({
    id: 'data-staging',
    name: 'Data Staging and Compression',
    category: 'staging',
    description: 'Identify, collect, compress and encrypt high-value data for exfiltration',
    tools: ['7zip', 'rar', 'tar', 'custom_packer', 'SharpChromium'],
    risk: 0.3,
    impact: 0.7,
  })
  add({
    id: 'pivot-setup',
    name: 'Network Pivoting Setup',
    category: 'pivoting',
    description: 'Establish SOCKS proxy, port forwarding, or VPN tunnel for network pivoting',
    tools: ['chisel', 'ligolo-ng', 'SSHuttle', 'frp', 'ngrok'],
    risk: 0.4,
    impact: 0.8,
  })
  add({
    id: 'token-manip',
    name: 'Token Manipulation',
    category: 'privilege_escalation',
    description: 'Steal and impersonate process tokens for SYSTEM or domain admin access',
    tools: ['Incognito', 'PrintSpoofer', 'GodPotato', 'JuicyPotato', 'SweetPotato'],
    risk: 0.4,
    impact: 0.9,
  })
  add({
    id: 'cleanup',
    name: 'Anti-Forensics Cleanup',
    category: 'cleanup',
    description: 'Clear logs, remove tools, restore timestamps, clean memory artifacts',
    tools: ['wevtutil', 'EventCleaner', 'timestomp', 'shred', 'BleachBit'],
    risk: 0.3,
    impact: 0.5,
  })
  add({
    id: 'situational-awareness',
    name: 'Situational Awareness',
    category: 'data_collection',
    description:
      'Enumerate environment: OS, patches, AV, network config, running processes, logged-in users',
    tools: ['Seatbelt', 'SharpUp', 'systeminfo', 'whoami', 'hostname'],
    risk: 0.1,
    impact: 0.6,
  })
  add({
    id: 'cloud-enum',
    name: 'Cloud Environment Enumeration',
    category: 'data_collection',
    description: 'Enumerate cloud metadata, IAM roles, storage buckets, serverless functions',
    tools: ['Pacu', 'ScoutSuite', 'Prowler', 'CloudMapper', 'enumerate-iam'],
    risk: 0.3,
    impact: 0.8,
  })
  add({
    id: 'email-harvest',
    name: 'Email and Communication Harvesting',
    category: 'data_collection',
    description: 'Access mailboxes, chat logs, and collaboration platforms for intelligence',
    tools: ['MailSniper', 'Ruler', 'GraphRunner', 'Teams_Phisher'],
    risk: 0.4,
    impact: 0.7,
  })
  add({
    id: 'cicd-backdoor',
    name: 'CI/CD Pipeline Backdoor',
    category: 'credential_harvest',
    description: 'Inject backdoors into CI/CD pipelines, build scripts, or deployment configs',
    tools: ['custom', 'github_actions_poisoning', 'jenkins_exploit', 'gitlab_runner_abuse'],
    risk: 0.5,
    impact: 0.9,
  })

  return db
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class AttackChainEngine {
  private readonly config: AttackChainEngineConfig
  private readonly techniques: readonly AttackTechnique[]
  private readonly attackerProfiles: readonly AttackerProfile[]
  private readonly persistenceMechs: readonly PersistenceMechanism[]
  private readonly evasionTechs: readonly EvasionTechnique[]
  private readonly c2Channels: readonly C2Channel[]
  private readonly exfilMethods: readonly ExfiltrationMethod[]
  private readonly lateralPaths: readonly LateralMovementPath[]
  private readonly postExploitActions: readonly PostExploitAction[]
  private stats: AttackChainEngineStats

  constructor(config?: Partial<AttackChainEngineConfig>) {
    this.config = { ...DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG, ...config }
    this.techniques = buildAttackTechniques()
    this.attackerProfiles = buildAttackerProfiles()
    this.persistenceMechs = buildPersistenceMechanisms()
    this.evasionTechs = buildEvasionTechniques()
    this.c2Channels = buildC2Channels()
    this.exfilMethods = buildExfiltrationMethods()
    this.lateralPaths = buildLateralMovementPaths()
    this.postExploitActions = buildPostExploitActions()
    this.stats = this.emptyStats()
  }

  private emptyStats(): AttackChainEngineStats {
    return {
      totalChainsGenerated: 0,
      totalTechniquesApplied: 0,
      totalAttackerProfiles: 0,
      totalKillChains: 0,
      totalLateralMovements: 0,
      totalPersistenceMechanisms: 0,
      totalEvasionTechniques: 0,
      totalC2Channels: 0,
      totalExfiltrations: 0,
      feedbackCount: 0,
    }
  }

  // ── Core Methods ──

  generateAttackChain(
    targetDescription: string,
    attackerType: string,
    objectives: string[],
  ): AttackChainResult {
    const profile = this.profileAttacker(attackerType)
    const tokens = this.tokenize(targetDescription)

    // Phase 1: Build kill chain steps
    const steps: AttackChainStep[] = []
    const phases: KillChainPhase[] = [
      'reconnaissance',
      'weaponization',
      'delivery',
      'exploitation',
      'installation',
      'command_and_control',
      'actions_on_objectives',
    ]
    const phaseToTactics: Record<KillChainPhase, MitreAttackTactic[]> = {
      reconnaissance: ['reconnaissance'],
      weaponization: ['resource_development'],
      delivery: ['initial_access'],
      exploitation: ['execution', 'privilege_escalation'],
      installation: ['persistence', 'defense_evasion'],
      command_and_control: ['command_and_control'],
      actions_on_objectives: [
        'collection',
        'exfiltration',
        'lateral_movement',
        'impact',
        'credential_access',
        'discovery',
      ],
    }

    let stepOrder = 1
    for (const phase of phases) {
      const tactics = phaseToTactics[phase]
      for (const tactic of tactics) {
        const techsForTactic = this.getTechniquesForTactic(tactic)
        const preferred = techsForTactic.filter(t => profile.preferredTactics.includes(t.tactic))
        const selected = (preferred.length > 0 ? preferred : techsForTactic).slice(
          0,
          this.config.maxTechniquesPerPhase,
        )
        for (const tech of selected.slice(0, 2)) {
          steps.push({
            order: stepOrder++,
            phase,
            tactic,
            technique: tech.name,
            objective: `${tactic}: ${tech.description.substring(0, 80)}`,
            expectedOutcome: `Successful ${tech.name}`,
            fallbackTechnique: selected.length > 1 ? selected[selected.length - 1].name : undefined,
            estimatedDuration: this.estimateDuration(tech),
            riskLevel: round2(1 - tech.detectionDifficulty),
            dependencies: stepOrder > 2 ? [stepOrder - 2] : [],
          })
          if (steps.length >= this.config.maxChainLength) break
        }
        if (steps.length >= this.config.maxChainLength) break
      }
      if (steps.length >= this.config.maxChainLength) break
    }

    // Phase 2: Lateral movement
    const lateralMovements: LateralMovementPath[] = this.config.enableLateralMovement
      ? this.planLateralMovement(
          tokens.includes('network') ? ['dmz', 'internal', 'server'] : ['workstation', 'server'],
        )
      : []

    // Phase 3: Persistence
    const persistence = this.config.enablePersistence
      ? this.selectPersistence(
          tokens.includes('linux') ? 'linux' : 'windows',
          profile.skillLevel === 'apt' || profile.skillLevel === 'nation_state' ? 'admin' : 'user',
        )
      : []

    // Phase 4: Evasion
    const evasion = this.config.enableEvasion
      ? this.selectEvasion(tokens.includes('edr') ? ['edr', 'av', 'siem'] : ['av'])
      : []

    // Phase 5: C2
    const c2 = this.config.enableC2
      ? this.selectC2({
          stealth: profile.operationalSecurity,
          bandwidth: profile.resources === 'unlimited' ? 'high' : 'medium',
          resilience: profile.persistence,
        })
      : []

    // Phase 6: Exfiltration
    const exfil = this.config.enableExfiltration
      ? this.selectExfiltration(
          objectives.includes('data_theft') ? 'high' : 'low',
          profile.operationalSecurity,
        )
      : []

    // Phase 7: Post-exploitation
    const postExploit = this.selectPostExploitActions(profile, objectives)

    // Calculate metrics
    const overallRisk = round2(
      steps.reduce((s, step) => s + step.riskLevel, 0) / Math.max(steps.length, 1),
    )
    const successProb = round2(
      profile.skillLevel === 'nation_state'
        ? 0.85
        : profile.skillLevel === 'apt'
          ? 0.7
          : profile.skillLevel === 'advanced'
            ? 0.55
            : profile.skillLevel === 'intermediate'
              ? 0.35
              : 0.15,
    )
    const detectionProb = round2(1 - evasion.reduce((s, e) => s * (1 - e.effectiveness * 0.1), 1.0))

    const result: AttackChainResult = {
      id: genId('chain'),
      name: `${profile.name} → ${targetDescription}`,
      description: `Multi-stage attack chain by ${profile.name} against ${targetDescription} with objectives: ${objectives.join(', ')}`,
      attackerProfile: profile,
      targetProfile: targetDescription,
      steps,
      lateralMovements,
      persistenceMechanisms: persistence,
      evasionTechniques: evasion,
      c2Channels: c2,
      exfiltrationMethods: exfil,
      postExploitActions: postExploit,
      overallRisk,
      successProbability: successProb,
      estimatedDuration: this.estimateChainDuration(steps.length, profile),
      detectionProbability: detectionProb,
      mitigations: this.suggestMitigations({
        steps,
        lateralMovements,
        persistenceMechanisms: persistence,
        evasionTechniques: evasion,
        c2Channels: c2,
        exfiltrationMethods: exfil,
      } as AttackChainResult),
      iocs: this.generateIOCs({
        steps,
        c2Channels: c2,
        persistenceMechanisms: persistence,
        evasionTechniques: evasion,
      } as AttackChainResult),
    }

    this.stats.totalChainsGenerated++
    this.stats.totalTechniquesApplied += steps.length
    this.stats.totalKillChains++
    this.stats.totalLateralMovements += lateralMovements.length
    this.stats.totalPersistenceMechanisms += persistence.length
    this.stats.totalEvasionTechniques += evasion.length
    this.stats.totalC2Channels += c2.length
    this.stats.totalExfiltrations += exfil.length

    return result
  }

  profileAttacker(description: string): AttackerProfile {
    const lower = description.toLowerCase()
    const matched = this.attackerProfiles.find(
      p =>
        lower.includes(p.id) ||
        lower.includes(p.name.toLowerCase()) ||
        (lower.includes('apt') && (p.skillLevel === 'apt' || p.skillLevel === 'nation_state')) ||
        (lower.includes('nation') && p.skillLevel === 'nation_state') ||
        (lower.includes('ransomware') &&
          p.motivation === 'financial' &&
          p.toolkits.some(t => t.toLowerCase().includes('ransomware'))) ||
        (lower.includes('insider') && p.id === 'insider_malicious') ||
        (lower.includes('hacktivist') && p.motivation === 'hacktivism') ||
        (lower.includes('script') && p.skillLevel === 'script_kiddie') ||
        (lower.includes('red team') && p.id === 'red_team') ||
        (lower.includes('crime') && p.id === 'organized_crime'),
    )
    this.stats.totalAttackerProfiles++
    return matched || this.attackerProfiles[0]
  }

  getTechniquesForTactic(tactic: MitreAttackTactic): AttackTechnique[] {
    return this.techniques.filter(t => t.tactic === tactic)
  }

  getTechniquesForPlatform(platform: string): AttackTechnique[] {
    const p = platform.toLowerCase()
    return this.techniques.filter(t => t.platforms.some(pl => pl.toLowerCase().includes(p)))
  }

  selectPersistence(platform: string, privilegeLevel: string): PersistenceMechanism[] {
    const p = platform.toLowerCase()
    const matches = this.persistenceMechs.filter(m => {
      const platformMatch = m.platform.toLowerCase().includes(p)
      const privMatch =
        privilegeLevel === 'system' || privilegeLevel === 'admin' ? true : m.privilege === 'user'
      return platformMatch && privMatch
    })
    return matches.sort((a, b) => b.stealth - a.stealth).slice(0, 4)
  }

  selectEvasion(detectionCapabilities: string[]): EvasionTechnique[] {
    const capStr = detectionCapabilities.join(',').toLowerCase()
    const scored = this.evasionTechs.map(e => {
      let score = e.effectiveness
      if (capStr.includes('edr') && e.bypasses.some(b => b.toLowerCase().includes('edr')))
        score += 0.2
      if (capStr.includes('av') && e.bypasses.some(b => b.toLowerCase().includes('av')))
        score += 0.15
      if (capStr.includes('siem') && e.bypasses.some(b => b.toLowerCase().includes('log')))
        score += 0.1
      return { tech: e, score: clamp(score, 0, 1) }
    })
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.tech)
  }

  selectC2(requirements: { stealth: number; bandwidth: string; resilience: number }): C2Channel[] {
    const scored = this.c2Channels.map(c => {
      let score = c.stealth * requirements.stealth + c.resilience * requirements.resilience
      if (c.bandwidth === requirements.bandwidth) score += 0.2
      return { channel: c, score }
    })
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.channel)
  }

  selectExfiltration(dataSize: string, stealthRequired: number): ExfiltrationMethod[] {
    const sized =
      dataSize === 'high'
        ? this.exfilMethods.filter(m => m.capacity === 'high' || m.capacity === 'medium')
        : [...this.exfilMethods]
    return sized
      .sort((a, b) => {
        const scoreA = a.stealth * stealthRequired + a.speed * (1 - stealthRequired)
        const scoreB = b.stealth * stealthRequired + b.speed * (1 - stealthRequired)
        return scoreB - scoreA
      })
      .slice(0, 3)
  }

  planLateralMovement(networkSegments: string[]): LateralMovementPath[] {
    return this.lateralPaths
      .filter(p => networkSegments.some(s => p.source.includes(s) || p.destination.includes(s)))
      .sort((a, b) => b.successChance - a.successChance)
      .slice(0, 4)
  }

  selectPostExploitActions(profile: AttackerProfile, objectives: string[]): PostExploitAction[] {
    const objStr = objectives.join(',').toLowerCase()
    return this.postExploitActions
      .filter(a => {
        if (
          objStr.includes('data') &&
          (a.category === 'data_collection' || a.category === 'staging')
        )
          return true
        if (objStr.includes('persist') && a.category === 'credential_harvest') return true
        if (objStr.includes('stealth') && a.category === 'cleanup') return true
        if (profile.skillLevel === 'apt' || profile.skillLevel === 'nation_state') return true
        return a.risk <= profile.riskTolerance
      })
      .slice(0, 6)
  }

  calculateChainRisk(chain: AttackChainStep[]): number {
    if (chain.length === 0) return 0
    return round2(chain.reduce((sum, s) => sum + s.riskLevel, 0) / chain.length)
  }

  generateIOCs(chain: Partial<AttackChainResult>): string[] {
    const iocs: string[] = []
    if (chain.c2Channels) {
      for (const c of chain.c2Channels) {
        iocs.push(`C2 Protocol: ${c.protocol}`)
        iocs.push(...c.detection.map(d => `Detection: ${d}`))
      }
    }
    if (chain.persistenceMechanisms) {
      for (const p of chain.persistenceMechanisms) {
        iocs.push(`Persistence: ${p.name} (${p.type})`)
        iocs.push(...p.detection.map(d => `Detection: ${d}`))
      }
    }
    if (chain.evasionTechniques) {
      for (const e of chain.evasionTechniques) {
        iocs.push(...e.indicators.map(i => `Indicator: ${i}`))
      }
    }
    return [...new Set(iocs)].slice(0, 20)
  }

  suggestMitigations(chain: Partial<AttackChainResult>): string[] {
    const mitigations: string[] = []
    if (chain.steps) {
      const uniqueTechniques = new Set(chain.steps.map(s => s.technique))
      for (const techName of uniqueTechniques) {
        const tech = this.techniques.find(t => t.name === techName)
        if (tech) mitigations.push(...tech.mitigations)
      }
    }
    if (chain.persistenceMechanisms) {
      for (const p of chain.persistenceMechanisms) mitigations.push(...p.detection)
    }
    if (chain.c2Channels) {
      for (const c of chain.c2Channels) mitigations.push(...c.detection)
    }
    return [...new Set(mitigations)].slice(0, 25)
  }

  getAttackerProfiles(): readonly AttackerProfile[] {
    return this.attackerProfiles
  }

  getAllTechniques(): readonly AttackTechnique[] {
    return this.techniques
  }

  getPersistenceMechanisms(): readonly PersistenceMechanism[] {
    return this.persistenceMechs
  }

  getEvasionTechniques(): readonly EvasionTechnique[] {
    return this.evasionTechs
  }

  getC2Channels(): readonly C2Channel[] {
    return this.c2Channels
  }

  getExfiltrationMethods(): readonly ExfiltrationMethod[] {
    return this.exfilMethods
  }

  getLateralMovementPaths(): readonly LateralMovementPath[] {
    return this.lateralPaths
  }

  getPostExploitActions(): readonly PostExploitAction[] {
    return this.postExploitActions
  }

  // ── Helpers ──

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\s,;:.|_\-/\\]+/)
      .filter(Boolean)
  }

  private estimateDuration(tech: AttackTechnique): string {
    const complexity =
      tech.requiredPrivileges === 'system' ? 3 : tech.requiredPrivileges === 'admin' ? 2 : 1
    const minutes = Math.round((1 - tech.successProbability) * 60 * complexity)
    return minutes < 60 ? `${minutes}m` : `${round2(minutes / 60)}h`
  }

  private estimateChainDuration(stepCount: number, profile: AttackerProfile): string {
    const baseHours = stepCount * 2
    const multiplier =
      profile.skillLevel === 'nation_state'
        ? 0.5
        : profile.skillLevel === 'apt'
          ? 0.7
          : profile.skillLevel === 'advanced'
            ? 1.0
            : profile.skillLevel === 'intermediate'
              ? 1.5
              : 2.5
    const hours = Math.round(baseHours * multiplier)
    return hours < 24 ? `${hours}h` : `${round2(hours / 24)}d`
  }

  // ── Serialization ──

  getStats(): Readonly<AttackChainEngineStats> {
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
