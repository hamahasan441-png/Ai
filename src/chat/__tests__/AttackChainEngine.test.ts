import { describe, it, expect, beforeEach } from 'vitest'
import {
  AttackChainEngine,
  DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG,
  type AttackChainEngineConfig,
  type AttackChainResult,
  type MitreAttackTactic,
} from '../AttackChainEngine'

// ── Constructor & Config Tests ──

describe('AttackChainEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new AttackChainEngine()
    expect(engine).toBeInstanceOf(AttackChainEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new AttackChainEngine({ maxChainLength: 10 })
    expect(engine).toBeInstanceOf(AttackChainEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new AttackChainEngine({
      maxChainLength: 20,
      maxTechniquesPerPhase: 3,
      enableLateralMovement: false,
      enablePersistence: false,
      enableEvasion: false,
      enableC2: false,
      enableExfiltration: false,
      riskThreshold: 0.5,
    })
    expect(engine).toBeInstanceOf(AttackChainEngine)
  })

  it('has pre-built technique database available immediately', () => {
    const engine = new AttackChainEngine()
    const techniques = engine.getAllTechniques()
    expect(techniques.length).toBeGreaterThan(0)
  })

  it('default config matches exported constant', () => {
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.maxChainLength).toBe(15)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.maxTechniquesPerPhase).toBe(5)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.enableLateralMovement).toBe(true)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.enablePersistence).toBe(true)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.enableEvasion).toBe(true)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.enableC2).toBe(true)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.enableExfiltration).toBe(true)
    expect(DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG.riskThreshold).toBe(0.7)
  })
})

// ── Attack Technique Database Tests ──

describe('AttackChainEngine attack technique database', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 60 techniques total', () => {
    expect(engine.getAllTechniques().length).toBeGreaterThanOrEqual(60)
  })

  it('has techniques for initial_access tactic', () => {
    const techs = engine.getTechniquesForTactic('initial_access')
    expect(techs.length).toBeGreaterThan(0)
  })

  it('has techniques for execution tactic', () => {
    expect(engine.getTechniquesForTactic('execution').length).toBeGreaterThan(0)
  })

  it('has techniques for persistence tactic', () => {
    expect(engine.getTechniquesForTactic('persistence').length).toBeGreaterThan(0)
  })

  it('has techniques for privilege_escalation tactic', () => {
    expect(engine.getTechniquesForTactic('privilege_escalation').length).toBeGreaterThan(0)
  })

  it('has techniques for defense_evasion tactic', () => {
    expect(engine.getTechniquesForTactic('defense_evasion').length).toBeGreaterThan(0)
  })

  it('has techniques for credential_access tactic', () => {
    expect(engine.getTechniquesForTactic('credential_access').length).toBeGreaterThan(0)
  })

  it('has techniques for discovery tactic', () => {
    expect(engine.getTechniquesForTactic('discovery').length).toBeGreaterThan(0)
  })

  it('has techniques for lateral_movement tactic', () => {
    expect(engine.getTechniquesForTactic('lateral_movement').length).toBeGreaterThan(0)
  })

  it('has techniques for collection tactic', () => {
    expect(engine.getTechniquesForTactic('collection').length).toBeGreaterThan(0)
  })

  it('has techniques for exfiltration tactic', () => {
    expect(engine.getTechniquesForTactic('exfiltration').length).toBeGreaterThan(0)
  })

  it('has techniques for command_and_control tactic', () => {
    expect(engine.getTechniquesForTactic('command_and_control').length).toBeGreaterThan(0)
  })

  it('has techniques for impact tactic', () => {
    expect(engine.getTechniquesForTactic('impact').length).toBeGreaterThan(0)
  })

  it('has techniques for resource_development tactic', () => {
    expect(engine.getTechniquesForTactic('resource_development').length).toBeGreaterThan(0)
  })

  it('has techniques for reconnaissance tactic', () => {
    expect(engine.getTechniquesForTactic('reconnaissance').length).toBeGreaterThan(0)
  })

  it('covers all 14 MITRE ATT&CK tactics', () => {
    const allTactics: MitreAttackTactic[] = [
      'initial_access', 'execution', 'persistence', 'privilege_escalation',
      'defense_evasion', 'credential_access', 'discovery', 'lateral_movement',
      'collection', 'exfiltration', 'command_and_control', 'impact',
      'resource_development', 'reconnaissance',
    ]
    for (const tactic of allTactics) {
      expect(engine.getTechniquesForTactic(tactic).length).toBeGreaterThan(0)
    }
  })

  it('filters techniques for windows platform', () => {
    const techs = engine.getTechniquesForPlatform('windows')
    expect(techs.length).toBeGreaterThan(0)
    for (const t of techs) {
      expect(t.platforms.some(p => p.toLowerCase().includes('windows'))).toBe(true)
    }
  })

  it('filters techniques for linux platform', () => {
    const techs = engine.getTechniquesForPlatform('linux')
    expect(techs.length).toBeGreaterThan(0)
    for (const t of techs) {
      expect(t.platforms.some(p => p.toLowerCase().includes('linux'))).toBe(true)
    }
  })

  it('filters techniques for macos platform', () => {
    const techs = engine.getTechniquesForPlatform('macos')
    expect(techs.length).toBeGreaterThan(0)
  })

  it('every technique has required fields populated', () => {
    for (const t of engine.getAllTechniques()) {
      expect(typeof t.id).toBe('string')
      expect(t.id.length).toBeGreaterThan(0)
      expect(typeof t.mitreId).toBe('string')
      expect(typeof t.name).toBe('string')
      expect(t.name.length).toBeGreaterThan(0)
      expect(typeof t.tactic).toBe('string')
      expect(typeof t.description).toBe('string')
      expect(Array.isArray(t.platforms)).toBe(true)
      expect(t.platforms.length).toBeGreaterThan(0)
      expect(typeof t.detectionDifficulty).toBe('number')
      expect(typeof t.successProbability).toBe('number')
      expect(typeof t.noiseLevel).toBe('number')
      expect(Array.isArray(t.prerequisites)).toBe(true)
      expect(Array.isArray(t.artifacts)).toBe(true)
      expect(Array.isArray(t.mitigations)).toBe(true)
      expect(Array.isArray(t.tools)).toBe(true)
    }
  })
})

// ── Attacker Profiles Tests ──

describe('AttackChainEngine attacker profiles', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 10 attacker profiles', () => {
    expect(engine.getAttackerProfiles().length).toBeGreaterThanOrEqual(10)
  })

  it('every profile has required fields', () => {
    for (const p of engine.getAttackerProfiles()) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.name).toBe('string')
      expect(typeof p.skillLevel).toBe('string')
      expect(typeof p.motivation).toBe('string')
      expect(typeof p.resources).toBe('string')
      expect(Array.isArray(p.preferredTactics)).toBe(true)
      expect(p.preferredTactics.length).toBeGreaterThan(0)
      expect(Array.isArray(p.toolkits)).toBe(true)
      expect(Array.isArray(p.targetPreferences)).toBe(true)
      expect(typeof p.riskTolerance).toBe('number')
      expect(typeof p.operationalSecurity).toBe('number')
      expect(typeof p.persistence).toBe('number')
    }
  })

  it('contains APT28 profile', () => {
    const profiles = engine.getAttackerProfiles()
    const apt28 = profiles.find(p => p.id === 'apt28')
    expect(apt28).toBeDefined()
    expect(apt28!.name).toContain('APT28')
    expect(apt28!.skillLevel).toBe('apt')
    expect(apt28!.motivation).toBe('espionage')
  })

  it('contains APT29 profile', () => {
    const apt29 = engine.getAttackerProfiles().find(p => p.id === 'apt29')
    expect(apt29).toBeDefined()
    expect(apt29!.name).toContain('APT29')
    expect(apt29!.skillLevel).toBe('nation_state')
    expect(apt29!.motivation).toBe('espionage')
    expect(apt29!.resources).toBe('unlimited')
  })

  it('contains Lazarus Group profile', () => {
    const lazarus = engine.getAttackerProfiles().find(p => p.id === 'lazarus')
    expect(lazarus).toBeDefined()
    expect(lazarus!.name).toContain('Lazarus')
    expect(lazarus!.motivation).toBe('financial')
  })

  it('contains script_kiddie profile', () => {
    const sk = engine.getAttackerProfiles().find(p => p.id === 'script_kiddie')
    expect(sk).toBeDefined()
    expect(sk!.skillLevel).toBe('script_kiddie')
    expect(sk!.resources).toBe('low')
  })

  it('contains red_team profile', () => {
    const rt = engine.getAttackerProfiles().find(p => p.id === 'red_team')
    expect(rt).toBeDefined()
    expect(rt!.skillLevel).toBe('advanced')
    expect(rt!.name).toContain('Red Team')
  })

  it('profiles have valid skill levels', () => {
    const validLevels = ['script_kiddie', 'intermediate', 'advanced', 'apt', 'nation_state']
    for (const p of engine.getAttackerProfiles()) {
      expect(validLevels).toContain(p.skillLevel)
    }
  })

  it('profiles have valid motivations', () => {
    const validMotivations = ['financial', 'espionage', 'hacktivism', 'destruction', 'revenge', 'thrill', 'state_sponsored']
    for (const p of engine.getAttackerProfiles()) {
      expect(validMotivations).toContain(p.motivation)
    }
  })
})

// ── Persistence Mechanisms Tests ──

describe('AttackChainEngine persistence mechanisms', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 10 persistence mechanisms', () => {
    expect(engine.getPersistenceMechanisms().length).toBeGreaterThanOrEqual(10)
  })

  it('every mechanism has required fields', () => {
    for (const m of engine.getPersistenceMechanisms()) {
      expect(typeof m.id).toBe('string')
      expect(typeof m.name).toBe('string')
      expect(typeof m.type).toBe('string')
      expect(typeof m.platform).toBe('string')
      expect(typeof m.privilege).toBe('string')
      expect(typeof m.stealth).toBe('number')
      expect(typeof m.reliability).toBe('number')
      expect(typeof m.survivesReboot).toBe('boolean')
      expect(typeof m.description).toBe('string')
      expect(Array.isArray(m.detection)).toBe(true)
    }
  })

  it('filters by windows platform', () => {
    const winMechs = engine.selectPersistence('windows', 'user')
    expect(winMechs.length).toBeGreaterThan(0)
    for (const m of winMechs) {
      expect(m.platform.toLowerCase()).toContain('windows')
    }
  })

  it('filters by linux platform', () => {
    const linuxMechs = engine.selectPersistence('linux', 'user')
    expect(linuxMechs.length).toBeGreaterThan(0)
    for (const m of linuxMechs) {
      expect(m.platform.toLowerCase()).toContain('linux')
    }
  })

  it('user privilege level excludes admin-only mechanisms', () => {
    const userMechs = engine.selectPersistence('windows', 'user')
    for (const m of userMechs) {
      expect(m.privilege).toBe('user')
    }
  })

  it('admin privilege level includes admin mechanisms', () => {
    const adminMechs = engine.selectPersistence('windows', 'admin')
    expect(adminMechs.length).toBeGreaterThan(0)
  })

  it('system privilege level includes all mechanisms', () => {
    const sysMechs = engine.selectPersistence('windows', 'system')
    expect(sysMechs.length).toBeGreaterThan(0)
  })

  it('returns mechanisms sorted by stealth descending', () => {
    const mechs = engine.selectPersistence('windows', 'admin')
    for (let i = 1; i < mechs.length; i++) {
      expect(mechs[i - 1].stealth).toBeGreaterThanOrEqual(mechs[i].stealth)
    }
  })

  it('returns at most 4 mechanisms', () => {
    const mechs = engine.selectPersistence('windows', 'system')
    expect(mechs.length).toBeLessThanOrEqual(4)
  })

  it('most mechanisms survive reboot', () => {
    const survivesReboot = engine.getPersistenceMechanisms().filter(m => m.survivesReboot)
    expect(survivesReboot.length).toBeGreaterThan(
      engine.getPersistenceMechanisms().filter(m => !m.survivesReboot).length
    )
  })
})

// ── Evasion Techniques Tests ──

describe('AttackChainEngine evasion techniques', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 15 evasion techniques', () => {
    expect(engine.getEvasionTechniques().length).toBeGreaterThanOrEqual(15)
  })

  it('every technique has required fields', () => {
    for (const e of engine.getEvasionTechniques()) {
      expect(typeof e.id).toBe('string')
      expect(typeof e.name).toBe('string')
      expect(typeof e.category).toBe('string')
      expect(typeof e.effectiveness).toBe('number')
      expect(e.effectiveness).toBeGreaterThanOrEqual(0)
      expect(e.effectiveness).toBeLessThanOrEqual(1)
      expect(typeof e.complexity).toBe('number')
      expect(typeof e.description).toBe('string')
      expect(Array.isArray(e.bypasses)).toBe(true)
      expect(Array.isArray(e.indicators)).toBe(true)
    }
  })

  it('has multiple categories of evasion', () => {
    const categories = new Set(engine.getEvasionTechniques().map(e => e.category))
    expect(categories.size).toBeGreaterThanOrEqual(5)
  })

  it('includes process_injection category', () => {
    const injections = engine.getEvasionTechniques().filter(e => e.category === 'process_injection')
    expect(injections.length).toBeGreaterThan(0)
  })

  it('includes obfuscation category', () => {
    const obfusc = engine.getEvasionTechniques().filter(e => e.category === 'obfuscation')
    expect(obfusc.length).toBeGreaterThan(0)
  })

  it('every technique has at least one bypass', () => {
    for (const e of engine.getEvasionTechniques()) {
      expect(e.bypasses.length).toBeGreaterThan(0)
    }
  })

  it('selectEvasion returns techniques matching edr capability', () => {
    const evasion = engine.selectEvasion(['edr'])
    expect(evasion.length).toBeGreaterThan(0)
  })

  it('selectEvasion returns techniques matching av capability', () => {
    const evasion = engine.selectEvasion(['av'])
    expect(evasion.length).toBeGreaterThan(0)
  })

  it('selectEvasion returns at most 5 techniques', () => {
    const evasion = engine.selectEvasion(['edr', 'av', 'siem'])
    expect(evasion.length).toBeLessThanOrEqual(5)
  })

  it('selectEvasion prioritizes techniques that bypass specified capabilities', () => {
    const edrEvasion = engine.selectEvasion(['edr'])
    const hasEdrBypass = edrEvasion.some(e =>
      e.bypasses.some(b => b.toLowerCase().includes('edr'))
    )
    expect(hasEdrBypass).toBe(true)
  })
})

// ── C2 Channels Tests ──

describe('AttackChainEngine C2 channels', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 10 C2 channels', () => {
    expect(engine.getC2Channels().length).toBeGreaterThanOrEqual(10)
  })

  it('every channel has required fields', () => {
    for (const c of engine.getC2Channels()) {
      expect(typeof c.id).toBe('string')
      expect(typeof c.name).toBe('string')
      expect(typeof c.protocol).toBe('string')
      expect(typeof c.bandwidth).toBe('string')
      expect(typeof c.stealth).toBe('number')
      expect(typeof c.reliability).toBe('number')
      expect(typeof c.latency).toBe('string')
      expect(typeof c.resilience).toBe('number')
      expect(typeof c.description).toBe('string')
      expect(Array.isArray(c.detection)).toBe(true)
    }
  })

  it('has https protocol channels', () => {
    const https = engine.getC2Channels().filter(c => c.protocol === 'https')
    expect(https.length).toBeGreaterThan(0)
  })

  it('has dns protocol channels', () => {
    const dns = engine.getC2Channels().filter(c => c.protocol === 'dns')
    expect(dns.length).toBeGreaterThan(0)
  })

  it('stealth values are between 0 and 1', () => {
    for (const c of engine.getC2Channels()) {
      expect(c.stealth).toBeGreaterThanOrEqual(0)
      expect(c.stealth).toBeLessThanOrEqual(1)
    }
  })

  it('selectC2 returns channels based on requirements', () => {
    const c2 = engine.selectC2({ stealth: 0.9, bandwidth: 'high', resilience: 0.8 })
    expect(c2.length).toBeGreaterThan(0)
  })

  it('selectC2 returns at most 3 channels', () => {
    const c2 = engine.selectC2({ stealth: 0.5, bandwidth: 'medium', resilience: 0.5 })
    expect(c2.length).toBeLessThanOrEqual(3)
  })

  it('selectC2 with high stealth prefers stealthy channels', () => {
    const c2 = engine.selectC2({ stealth: 1.0, bandwidth: 'low', resilience: 0.1 })
    expect(c2.length).toBeGreaterThan(0)
    expect(c2[0].stealth).toBeGreaterThanOrEqual(0.5)
  })

  it('selectC2 with matching bandwidth boosts score', () => {
    const c2High = engine.selectC2({ stealth: 0.5, bandwidth: 'high', resilience: 0.5 })
    expect(c2High.length).toBeGreaterThan(0)
  })
})

// ── Exfiltration Methods Tests ──

describe('AttackChainEngine exfiltration methods', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 8 exfiltration methods', () => {
    expect(engine.getExfiltrationMethods().length).toBeGreaterThanOrEqual(8)
  })

  it('every method has required fields', () => {
    for (const m of engine.getExfiltrationMethods()) {
      expect(typeof m.id).toBe('string')
      expect(typeof m.name).toBe('string')
      expect(typeof m.channel).toBe('string')
      expect(typeof m.capacity).toBe('string')
      expect(typeof m.stealth).toBe('number')
      expect(typeof m.speed).toBe('number')
      expect(typeof m.description).toBe('string')
      expect(Array.isArray(m.detection)).toBe(true)
    }
  })

  it('has multiple channel types', () => {
    const channels = new Set(engine.getExfiltrationMethods().map(m => m.channel))
    expect(channels.size).toBeGreaterThanOrEqual(5)
  })

  it('selectExfiltration with high data size filters capacity', () => {
    const methods = engine.selectExfiltration('high', 0.5)
    expect(methods.length).toBeGreaterThan(0)
    for (const m of methods) {
      expect(['high', 'medium']).toContain(m.capacity)
    }
  })

  it('selectExfiltration returns at most 3 methods', () => {
    const methods = engine.selectExfiltration('low', 0.5)
    expect(methods.length).toBeLessThanOrEqual(3)
  })

  it('selectExfiltration with high stealth prefers stealthy methods', () => {
    const stealthy = engine.selectExfiltration('low', 0.99)
    const fast = engine.selectExfiltration('low', 0.01)
    expect(stealthy[0].stealth).toBeGreaterThanOrEqual(fast[fast.length - 1].stealth - 0.01)
  })

  it('stealth values are between 0 and 1', () => {
    for (const m of engine.getExfiltrationMethods()) {
      expect(m.stealth).toBeGreaterThanOrEqual(0)
      expect(m.stealth).toBeLessThanOrEqual(1)
    }
  })
})

// ── Lateral Movement Paths Tests ──

describe('AttackChainEngine lateral movement paths', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 8 lateral movement paths', () => {
    expect(engine.getLateralMovementPaths().length).toBeGreaterThanOrEqual(8)
  })

  it('every path has required fields', () => {
    for (const p of engine.getLateralMovementPaths()) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.source).toBe('string')
      expect(typeof p.destination).toBe('string')
      expect(typeof p.technique).toBe('string')
      expect(typeof p.credentials).toBe('string')
      expect(typeof p.protocol).toBe('string')
      expect(typeof p.risk).toBe('number')
      expect(typeof p.successChance).toBe('number')
    }
  })

  it('has multiple protocol types', () => {
    const protocols = new Set(engine.getLateralMovementPaths().map(p => p.protocol))
    expect(protocols.size).toBeGreaterThanOrEqual(4)
  })

  it('success chances are between 0 and 1', () => {
    for (const p of engine.getLateralMovementPaths()) {
      expect(p.successChance).toBeGreaterThan(0)
      expect(p.successChance).toBeLessThanOrEqual(1)
    }
  })

  it('planLateralMovement filters by network segments', () => {
    const paths = engine.planLateralMovement(['server'])
    expect(paths.length).toBeGreaterThan(0)
    for (const p of paths) {
      expect(p.source.includes('server') || p.destination.includes('server')).toBe(true)
    }
  })

  it('planLateralMovement filters by workstation segment', () => {
    const paths = engine.planLateralMovement(['workstation'])
    expect(paths.length).toBeGreaterThan(0)
  })

  it('planLateralMovement returns at most 4 paths', () => {
    const paths = engine.planLateralMovement(['workstation', 'server', 'domain_controller'])
    expect(paths.length).toBeLessThanOrEqual(4)
  })

  it('planLateralMovement sorts by success chance descending', () => {
    const paths = engine.planLateralMovement(['workstation', 'server'])
    for (let i = 1; i < paths.length; i++) {
      expect(paths[i - 1].successChance).toBeGreaterThanOrEqual(paths[i].successChance)
    }
  })

  it('planLateralMovement returns empty for no matching segments', () => {
    const paths = engine.planLateralMovement(['nonexistent_segment_xyz'])
    expect(paths.length).toBe(0)
  })
})

// ── Post-Exploit Actions Tests ──

describe('AttackChainEngine post-exploit actions', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('has at least 8 post-exploit actions', () => {
    expect(engine.getPostExploitActions().length).toBeGreaterThanOrEqual(8)
  })

  it('every action has required fields', () => {
    for (const a of engine.getPostExploitActions()) {
      expect(typeof a.id).toBe('string')
      expect(typeof a.name).toBe('string')
      expect(typeof a.category).toBe('string')
      expect(typeof a.description).toBe('string')
      expect(Array.isArray(a.tools)).toBe(true)
      expect(typeof a.risk).toBe('number')
      expect(typeof a.impact).toBe('number')
    }
  })

  it('has multiple action categories', () => {
    const categories = new Set(engine.getPostExploitActions().map(a => a.category))
    expect(categories.size).toBeGreaterThanOrEqual(4)
  })

  it('risk values are between 0 and 1', () => {
    for (const a of engine.getPostExploitActions()) {
      expect(a.risk).toBeGreaterThanOrEqual(0)
      expect(a.risk).toBeLessThanOrEqual(1)
    }
  })

  it('impact values are between 0 and 1', () => {
    for (const a of engine.getPostExploitActions()) {
      expect(a.impact).toBeGreaterThanOrEqual(0)
      expect(a.impact).toBeLessThanOrEqual(1)
    }
  })
})

// ── generateAttackChain Tests ──

describe('AttackChainEngine generateAttackChain', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('generates a valid attack chain result', () => {
    const result = engine.generateAttackChain(
      'corporate windows network',
      'APT29',
      ['data_theft', 'persistence']
    )
    expect(typeof result.id).toBe('string')
    expect(result.id.length).toBeGreaterThan(0)
    expect(typeof result.name).toBe('string')
    expect(typeof result.description).toBe('string')
  })

  it('steps have correct field types', () => {
    const result = engine.generateAttackChain('linux web server', 'script kiddie', ['data_theft'])
    for (const step of result.steps) {
      expect(typeof step.order).toBe('number')
      expect(typeof step.phase).toBe('string')
      expect(typeof step.tactic).toBe('string')
      expect(typeof step.technique).toBe('string')
      expect(typeof step.objective).toBe('string')
      expect(typeof step.expectedOutcome).toBe('string')
      expect(typeof step.estimatedDuration).toBe('string')
      expect(typeof step.riskLevel).toBe('number')
      expect(Array.isArray(step.dependencies)).toBe(true)
    }
  })

  it('steps cover multiple kill chain phases', () => {
    const result = engine.generateAttackChain('enterprise network', 'apt28', ['data_theft'])
    const phases = new Set(result.steps.map(s => s.phase))
    expect(phases.size).toBeGreaterThanOrEqual(3)
  })

  it('includes lateral movement paths when enabled', () => {
    const result = engine.generateAttackChain('corporate network', 'APT29', ['persistence'])
    expect(Array.isArray(result.lateralMovements)).toBe(true)
    expect(result.lateralMovements.length).toBeGreaterThan(0)
  })

  it('excludes lateral movement when disabled', () => {
    const noLateral = new AttackChainEngine({ enableLateralMovement: false })
    const result = noLateral.generateAttackChain('network', 'APT29', ['data_theft'])
    expect(result.lateralMovements.length).toBe(0)
  })

  it('includes persistence mechanisms when enabled', () => {
    const result = engine.generateAttackChain('windows server', 'APT29', ['persistence'])
    expect(result.persistenceMechanisms.length).toBeGreaterThan(0)
  })

  it('excludes persistence when disabled', () => {
    const noPersist = new AttackChainEngine({ enablePersistence: false })
    const result = noPersist.generateAttackChain('server', 'APT29', ['data_theft'])
    expect(result.persistenceMechanisms.length).toBe(0)
  })

  it('includes C2 channels when enabled', () => {
    const result = engine.generateAttackChain('windows server', 'APT29', ['data_theft'])
    expect(result.c2Channels.length).toBeGreaterThan(0)
  })

  it('excludes C2 when disabled', () => {
    const noC2 = new AttackChainEngine({ enableC2: false })
    const result = noC2.generateAttackChain('server', 'APT29', ['data_theft'])
    expect(result.c2Channels.length).toBe(0)
  })

  it('includes exfiltration methods when enabled', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft'])
    expect(result.exfiltrationMethods.length).toBeGreaterThan(0)
  })

  it('excludes exfiltration when disabled', () => {
    const noExfil = new AttackChainEngine({ enableExfiltration: false })
    const result = noExfil.generateAttackChain('network', 'APT29', ['data_theft'])
    expect(result.exfiltrationMethods.length).toBe(0)
  })

  it('includes evasion techniques when enabled', () => {
    const result = engine.generateAttackChain('edr protected network', 'APT29', ['data_theft'])
    expect(result.evasionTechniques.length).toBeGreaterThan(0)
  })

  it('excludes evasion when disabled', () => {
    const noEvasion = new AttackChainEngine({ enableEvasion: false })
    const result = noEvasion.generateAttackChain('network', 'APT29', ['data_theft'])
    expect(result.evasionTechniques.length).toBe(0)
  })

  it('generates IOCs for the attack chain', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(Array.isArray(result.iocs)).toBe(true)
    expect(result.iocs.length).toBeGreaterThan(0)
  })

  it('suggests mitigations for the attack chain', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(Array.isArray(result.mitigations)).toBe(true)
    expect(result.mitigations.length).toBeGreaterThan(0)
  })

  it('includes post-exploit actions', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft', 'persistence'])
    expect(result.postExploitActions.length).toBeGreaterThan(0)
  })

  it('has valid overallRisk between 0 and 1', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(result.overallRisk).toBeGreaterThanOrEqual(0)
    expect(result.overallRisk).toBeLessThanOrEqual(1)
  })

  it('has valid successProbability between 0 and 1', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft'])
    expect(result.successProbability).toBeGreaterThanOrEqual(0)
    expect(result.successProbability).toBeLessThanOrEqual(1)
  })

  it('has valid detectionProbability between 0 and 1', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(result.detectionProbability).toBeGreaterThanOrEqual(0)
    expect(result.detectionProbability).toBeLessThanOrEqual(1)
  })

  it('has estimatedDuration string', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(typeof result.estimatedDuration).toBe('string')
    expect(result.estimatedDuration.length).toBeGreaterThan(0)
  })

  it('respects maxChainLength config', () => {
    const small = new AttackChainEngine({ maxChainLength: 3 })
    const result = small.generateAttackChain('network', 'APT29', ['data_theft'])
    expect(result.steps.length).toBeLessThanOrEqual(3)
  })

  it('step orders are sequential starting from 1', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    for (let i = 0; i < result.steps.length; i++) {
      expect(result.steps[i].order).toBe(i + 1)
    }
  })

  it('attackerProfile is embedded in result', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(result.attackerProfile).toBeDefined()
    expect(typeof result.attackerProfile.name).toBe('string')
    expect(typeof result.attackerProfile.skillLevel).toBe('string')
  })

  it('targetProfile is set from description', () => {
    const result = engine.generateAttackChain('my custom target', 'APT28', ['data_theft'])
    expect(result.targetProfile).toBe('my custom target')
  })

  it('nation_state attacker has high success probability', () => {
    const result = engine.generateAttackChain('network', 'nation state actor', ['data_theft'])
    expect(result.successProbability).toBeGreaterThanOrEqual(0.8)
  })

  it('script_kiddie has low success probability', () => {
    const result = engine.generateAttackChain('network', 'script kiddie', ['data_theft'])
    expect(result.successProbability).toBeLessThanOrEqual(0.2)
  })
})

// ── profileAttacker Tests ──

describe('AttackChainEngine profileAttacker', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('matches by profile name APT28', () => {
    const profile = engine.profileAttacker('APT28 (Fancy Bear)')
    expect(profile.id).toBe('apt28')
  })

  it('matches APT29 via nation state keyword', () => {
    const profile = engine.profileAttacker('nation state actor')
    expect(profile.id).toBe('apt29')
    expect(profile.skillLevel).toBe('nation_state')
  })

  it('matches script kiddie by keyword', () => {
    const profile = engine.profileAttacker('script kiddie attacker')
    expect(profile.skillLevel).toBe('script_kiddie')
  })

  it('matches insider by keyword', () => {
    const profile = engine.profileAttacker('malicious insider threat')
    expect(profile.id).toBe('insider_malicious')
  })

  it('matches hacktivist by keyword', () => {
    const profile = engine.profileAttacker('hacktivist group')
    expect(profile.motivation).toBe('hacktivism')
  })

  it('matches red team by keyword', () => {
    const profile = engine.profileAttacker('professional red team engagement')
    expect(profile.id).toBe('red_team')
  })

  it('matches nation state by keyword', () => {
    const profile = engine.profileAttacker('nation state actor')
    expect(profile.skillLevel).toBe('nation_state')
  })

  it('matches apt keyword to apt-level profile', () => {
    const profile = engine.profileAttacker('apt group targeting government')
    expect(['apt', 'nation_state']).toContain(profile.skillLevel)
  })

  it('matches ransomware keyword to financial motivation', () => {
    const profile = engine.profileAttacker('ransomware operator')
    expect(profile.motivation).toBe('financial')
  })

  it('matches organized crime keyword', () => {
    const profile = engine.profileAttacker('organized crime syndicate')
    expect(profile.id).toBe('organized_crime')
  })

  it('falls back to first profile for unknown description', () => {
    const profile = engine.profileAttacker('completely unknown xyz123')
    expect(profile).toBeDefined()
    expect(typeof profile.id).toBe('string')
    expect(typeof profile.name).toBe('string')
  })

  it('increments totalAttackerProfiles stat', () => {
    engine.profileAttacker('APT28')
    engine.profileAttacker('script kiddie')
    expect(engine.getStats().totalAttackerProfiles).toBe(2)
  })
})

// ── selectPersistence Tests ──

describe('AttackChainEngine selectPersistence', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('returns windows user-level persistence', () => {
    const mechs = engine.selectPersistence('windows', 'user')
    expect(mechs.length).toBeGreaterThan(0)
    for (const m of mechs) {
      expect(m.platform.toLowerCase()).toContain('windows')
      expect(m.privilege).toBe('user')
    }
  })

  it('returns linux persistence mechanisms', () => {
    const mechs = engine.selectPersistence('linux', 'admin')
    expect(mechs.length).toBeGreaterThan(0)
  })

  it('returns macos persistence for user level', () => {
    const mechs = engine.selectPersistence('macos', 'user')
    expect(mechs.length).toBeGreaterThan(0)
  })

  it('returns empty for unknown platform', () => {
    const mechs = engine.selectPersistence('nonexistent_os', 'user')
    expect(mechs.length).toBe(0)
  })
})

// ── selectEvasion Tests ──

describe('AttackChainEngine selectEvasion', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('returns evasion techniques for edr', () => {
    const techs = engine.selectEvasion(['edr'])
    expect(techs.length).toBeGreaterThan(0)
  })

  it('returns evasion techniques for av', () => {
    const techs = engine.selectEvasion(['av'])
    expect(techs.length).toBeGreaterThan(0)
  })

  it('returns evasion techniques for siem', () => {
    const techs = engine.selectEvasion(['siem'])
    expect(techs.length).toBeGreaterThan(0)
  })

  it('returns evasion techniques for combined capabilities', () => {
    const techs = engine.selectEvasion(['edr', 'av', 'siem'])
    expect(techs.length).toBeGreaterThan(0)
    expect(techs.length).toBeLessThanOrEqual(5)
  })
})

// ── selectC2 Tests ──

describe('AttackChainEngine selectC2', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('returns channels for high stealth requirements', () => {
    const channels = engine.selectC2({ stealth: 0.9, bandwidth: 'low', resilience: 0.5 })
    expect(channels.length).toBeGreaterThan(0)
  })

  it('returns channels for high resilience requirements', () => {
    const channels = engine.selectC2({ stealth: 0.3, bandwidth: 'medium', resilience: 0.9 })
    expect(channels.length).toBeGreaterThan(0)
  })

  it('returns at most 3 channels', () => {
    const channels = engine.selectC2({ stealth: 0.5, bandwidth: 'high', resilience: 0.5 })
    expect(channels.length).toBeLessThanOrEqual(3)
  })
})

// ── selectExfiltration Tests ──

describe('AttackChainEngine selectExfiltration', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('high stealth prioritizes stealthy methods', () => {
    const methods = engine.selectExfiltration('low', 0.99)
    expect(methods.length).toBeGreaterThan(0)
  })

  it('low stealth prioritizes fast methods', () => {
    const methods = engine.selectExfiltration('low', 0.01)
    expect(methods.length).toBeGreaterThan(0)
  })

  it('high data size filters to high/medium capacity', () => {
    const methods = engine.selectExfiltration('high', 0.5)
    for (const m of methods) {
      expect(['high', 'medium']).toContain(m.capacity)
    }
  })
})

// ── planLateralMovement Tests ──

describe('AttackChainEngine planLateralMovement', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('filters by server segment', () => {
    const paths = engine.planLateralMovement(['server'])
    expect(paths.length).toBeGreaterThan(0)
  })

  it('filters by domain_controller segment', () => {
    const paths = engine.planLateralMovement(['domain_controller'])
    expect(paths.length).toBeGreaterThan(0)
  })

  it('filters by cloud_vm segment', () => {
    const paths = engine.planLateralMovement(['cloud_vm'])
    expect(paths.length).toBeGreaterThan(0)
  })

  it('combines multiple segments', () => {
    const paths = engine.planLateralMovement(['server', 'domain_controller'])
    expect(paths.length).toBeGreaterThan(0)
  })
})

// ── calculateChainRisk Tests ──

describe('AttackChainEngine calculateChainRisk', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('returns 0 for empty chain', () => {
    expect(engine.calculateChainRisk([])).toBe(0)
  })

  it('returns average risk for chain with steps', () => {
    const steps = [
      { order: 1, phase: 'exploitation' as const, tactic: 'execution' as const, technique: 'test', objective: 'obj', expectedOutcome: 'out', estimatedDuration: '5m', riskLevel: 0.6, dependencies: [] },
      { order: 2, phase: 'installation' as const, tactic: 'persistence' as const, technique: 'test2', objective: 'obj2', expectedOutcome: 'out2', estimatedDuration: '10m', riskLevel: 0.4, dependencies: [1] },
    ]
    const risk = engine.calculateChainRisk(steps)
    expect(risk).toBe(0.5)
  })

  it('returns the single step risk for chain of one', () => {
    const steps = [
      { order: 1, phase: 'delivery' as const, tactic: 'initial_access' as const, technique: 'phish', objective: 'obj', expectedOutcome: 'out', estimatedDuration: '5m', riskLevel: 0.7, dependencies: [] },
    ]
    expect(engine.calculateChainRisk(steps)).toBe(0.7)
  })

  it('rounds to two decimal places', () => {
    const steps = [
      { order: 1, phase: 'exploitation' as const, tactic: 'execution' as const, technique: 't1', objective: 'o', expectedOutcome: 'e', estimatedDuration: '5m', riskLevel: 0.33, dependencies: [] },
      { order: 2, phase: 'exploitation' as const, tactic: 'execution' as const, technique: 't2', objective: 'o', expectedOutcome: 'e', estimatedDuration: '5m', riskLevel: 0.33, dependencies: [] },
      { order: 3, phase: 'exploitation' as const, tactic: 'execution' as const, technique: 't3', objective: 'o', expectedOutcome: 'e', estimatedDuration: '5m', riskLevel: 0.34, dependencies: [] },
    ]
    const risk = engine.calculateChainRisk(steps)
    const decimalPlaces = risk.toString().split('.')[1]?.length ?? 0
    expect(decimalPlaces).toBeLessThanOrEqual(2)
  })
})

// ── generateIOCs Tests ──

describe('AttackChainEngine generateIOCs', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('generates IOCs from C2 channels', () => {
    const c2 = engine.getC2Channels().slice(0, 2)
    const iocs = engine.generateIOCs({ c2Channels: [...c2] })
    expect(iocs.length).toBeGreaterThan(0)
    expect(iocs.some(i => i.startsWith('C2 Protocol:'))).toBe(true)
  })

  it('generates IOCs from persistence mechanisms', () => {
    const persist = engine.getPersistenceMechanisms().slice(0, 2)
    const iocs = engine.generateIOCs({ persistenceMechanisms: [...persist] })
    expect(iocs.length).toBeGreaterThan(0)
    expect(iocs.some(i => i.startsWith('Persistence:'))).toBe(true)
  })

  it('generates IOCs from evasion techniques', () => {
    const evasion = engine.getEvasionTechniques().slice(0, 2)
    const iocs = engine.generateIOCs({ evasionTechniques: [...evasion] })
    expect(iocs.length).toBeGreaterThan(0)
    expect(iocs.some(i => i.startsWith('Indicator:'))).toBe(true)
  })

  it('returns unique IOCs with no duplicates', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft'])
    const iocs = engine.generateIOCs(result)
    const uniqueIocs = new Set(iocs)
    expect(iocs.length).toBe(uniqueIocs.size)
  })

  it('limits IOCs to at most 20', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft'])
    const iocs = engine.generateIOCs(result)
    expect(iocs.length).toBeLessThanOrEqual(20)
  })

  it('returns empty array for empty chain', () => {
    const iocs = engine.generateIOCs({})
    expect(iocs.length).toBe(0)
  })
})

// ── suggestMitigations Tests ──

describe('AttackChainEngine suggestMitigations', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('suggests mitigations from steps', () => {
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    const mitigations = engine.suggestMitigations(result)
    expect(mitigations.length).toBeGreaterThan(0)
  })

  it('suggests mitigations from persistence mechanisms', () => {
    const persist = engine.getPersistenceMechanisms().slice(0, 2)
    const mitigations = engine.suggestMitigations({ persistenceMechanisms: [...persist] })
    expect(mitigations.length).toBeGreaterThan(0)
  })

  it('suggests mitigations from C2 channels', () => {
    const c2 = engine.getC2Channels().slice(0, 2)
    const mitigations = engine.suggestMitigations({ c2Channels: [...c2] })
    expect(mitigations.length).toBeGreaterThan(0)
  })

  it('returns unique mitigations', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft'])
    const mitigations = engine.suggestMitigations(result)
    const uniqueMitigations = new Set(mitigations)
    expect(mitigations.length).toBe(uniqueMitigations.size)
  })

  it('limits mitigations to at most 25', () => {
    const result = engine.generateAttackChain('network', 'APT29', ['data_theft'])
    const mitigations = engine.suggestMitigations(result)
    expect(mitigations.length).toBeLessThanOrEqual(25)
  })

  it('returns empty for empty chain partial', () => {
    const mitigations = engine.suggestMitigations({})
    expect(mitigations.length).toBe(0)
  })
})

// ── Stats Tests ──

describe('AttackChainEngine stats', () => {
  it('returns zeroed stats on a fresh instance', () => {
    const engine = new AttackChainEngine()
    const stats = engine.getStats()
    expect(stats.totalChainsGenerated).toBe(0)
    expect(stats.totalTechniquesApplied).toBe(0)
    expect(stats.totalAttackerProfiles).toBe(0)
    expect(stats.totalKillChains).toBe(0)
    expect(stats.totalLateralMovements).toBe(0)
    expect(stats.totalPersistenceMechanisms).toBe(0)
    expect(stats.totalEvasionTechniques).toBe(0)
    expect(stats.totalC2Channels).toBe(0)
    expect(stats.totalExfiltrations).toBe(0)
    expect(stats.feedbackCount).toBe(0)
  })

  it('increments stats after generateAttackChain', () => {
    const engine = new AttackChainEngine()
    engine.generateAttackChain('network', 'APT28', ['data_theft'])
    const stats = engine.getStats()
    expect(stats.totalChainsGenerated).toBe(1)
    expect(stats.totalTechniquesApplied).toBeGreaterThan(0)
    expect(stats.totalKillChains).toBe(1)
    expect(stats.totalAttackerProfiles).toBe(1)
    expect(stats.totalLateralMovements).toBeGreaterThan(0)
    expect(stats.totalPersistenceMechanisms).toBeGreaterThan(0)
    expect(stats.totalEvasionTechniques).toBeGreaterThan(0)
    expect(stats.totalC2Channels).toBeGreaterThan(0)
    expect(stats.totalExfiltrations).toBeGreaterThan(0)
  })

  it('increments stats after multiple operations', () => {
    const engine = new AttackChainEngine()
    engine.generateAttackChain('net1', 'APT28', ['data_theft'])
    engine.generateAttackChain('net2', 'APT29', ['persistence'])
    const stats = engine.getStats()
    expect(stats.totalChainsGenerated).toBe(2)
    expect(stats.totalKillChains).toBe(2)
  })

  it('getStats returns readonly copy', () => {
    const engine = new AttackChainEngine()
    const stats1 = engine.getStats()
    engine.generateAttackChain('network', 'APT28', ['data_theft'])
    const stats2 = engine.getStats()
    expect(stats1.totalChainsGenerated).toBe(0)
    expect(stats2.totalChainsGenerated).toBe(1)
  })

  it('provideFeedback increments feedbackCount', () => {
    const engine = new AttackChainEngine()
    engine.provideFeedback()
    engine.provideFeedback()
    engine.provideFeedback()
    expect(engine.getStats().feedbackCount).toBe(3)
  })
})

// ── Serialization Tests ──

describe('AttackChainEngine serialize and deserialize', () => {
  it('round-trips through serialize and deserialize', () => {
    const engine = new AttackChainEngine({ maxChainLength: 10 })
    engine.generateAttackChain('network', 'APT28', ['data_theft'])
    engine.provideFeedback()
    engine.provideFeedback()

    const json = engine.serialize()
    const restored = new AttackChainEngine()
    restored.deserialize(json)

    const originalStats = engine.getStats()
    const restoredStats = restored.getStats()
    expect(restoredStats.totalChainsGenerated).toBe(originalStats.totalChainsGenerated)
    expect(restoredStats.totalTechniquesApplied).toBe(originalStats.totalTechniquesApplied)
    expect(restoredStats.feedbackCount).toBe(originalStats.feedbackCount)
  })

  it('serialize returns valid JSON', () => {
    const engine = new AttackChainEngine()
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialized JSON contains config and stats', () => {
    const engine = new AttackChainEngine({ maxChainLength: 7 })
    const data = JSON.parse(engine.serialize())
    expect(data.config).toBeDefined()
    expect(data.stats).toBeDefined()
    expect(data.config.maxChainLength).toBe(7)
  })

  it('deserialize preserves all stat fields', () => {
    const engine = new AttackChainEngine()
    engine.generateAttackChain('network', 'APT29', ['data_theft'])
    engine.provideFeedback()

    const json = engine.serialize()
    const restored = new AttackChainEngine()
    restored.deserialize(json)

    const stats = restored.getStats()
    expect(stats.totalChainsGenerated).toBe(1)
    expect(stats.totalKillChains).toBe(1)
    expect(stats.feedbackCount).toBe(1)
  })

  it('deserialize handles JSON without stats gracefully', () => {
    const engine = new AttackChainEngine()
    expect(() => engine.deserialize(JSON.stringify({ config: {} }))).not.toThrow()
    expect(engine.getStats().feedbackCount).toBe(0)
  })
})

// ── selectPostExploitActions Tests ──

describe('AttackChainEngine selectPostExploitActions', () => {
  let engine: AttackChainEngine

  beforeEach(() => {
    engine = new AttackChainEngine()
  })

  it('selects data-related actions for data objectives', () => {
    const profile = engine.profileAttacker('script kiddie')
    const actions = engine.selectPostExploitActions(profile, ['data_theft'])
    expect(actions.length).toBeGreaterThan(0)
    const categories = actions.map(a => a.category)
    expect(categories.some(c => c === 'data_collection' || c === 'staging')).toBe(true)
  })

  it('selects credential harvest actions for persist objectives', () => {
    const profile = engine.profileAttacker('script kiddie')
    const actions = engine.selectPostExploitActions(profile, ['persist'])
    expect(actions.some(a => a.category === 'credential_harvest')).toBe(true)
  })

  it('APT-level profiles get all actions', () => {
    const profile = engine.profileAttacker('APT29')
    const actions = engine.selectPostExploitActions(profile, [])
    expect(actions.length).toBeGreaterThan(0)
  })

  it('returns at most 6 actions', () => {
    const profile = engine.profileAttacker('APT29')
    const actions = engine.selectPostExploitActions(profile, ['data_theft', 'persistence', 'stealth'])
    expect(actions.length).toBeLessThanOrEqual(6)
  })
})

// ── Additional Edge Case Tests ──

describe('AttackChainEngine edge cases', () => {
  it('handles empty target description', () => {
    const engine = new AttackChainEngine()
    const result = engine.generateAttackChain('', 'APT28', ['data_theft'])
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('handles empty objectives array', () => {
    const engine = new AttackChainEngine()
    const result = engine.generateAttackChain('network', 'APT28', [])
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('handles unknown attacker type gracefully', () => {
    const engine = new AttackChainEngine()
    const result = engine.generateAttackChain('network', 'unknown_attacker_xyz', ['data_theft'])
    expect(result.attackerProfile).toBeDefined()
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('generating multiple chains on same engine works correctly', () => {
    const engine = new AttackChainEngine()
    const r1 = engine.generateAttackChain('net1', 'APT28', ['data_theft'])
    const r2 = engine.generateAttackChain('net2', 'APT29', ['persistence'])
    expect(r1.id).not.toBe(r2.id)
    expect(engine.getStats().totalChainsGenerated).toBe(2)
  })

  it('getTechniquesForTactic returns empty for bogus tactic', () => {
    const engine = new AttackChainEngine()
    const techs = engine.getTechniquesForTactic('bogus_tactic' as MitreAttackTactic)
    expect(techs.length).toBe(0)
  })

  it('getTechniquesForPlatform returns empty for nonexistent platform', () => {
    const engine = new AttackChainEngine()
    const techs = engine.getTechniquesForPlatform('nokia_symbian_os')
    expect(techs.length).toBe(0)
  })

  it('all features disabled still generates steps', () => {
    const engine = new AttackChainEngine({
      enableLateralMovement: false,
      enablePersistence: false,
      enableEvasion: false,
      enableC2: false,
      enableExfiltration: false,
    })
    const result = engine.generateAttackChain('network', 'APT28', ['data_theft'])
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.lateralMovements.length).toBe(0)
    expect(result.persistenceMechanisms.length).toBe(0)
    expect(result.evasionTechniques.length).toBe(0)
    expect(result.c2Channels.length).toBe(0)
    expect(result.exfiltrationMethods.length).toBe(0)
  })
})
