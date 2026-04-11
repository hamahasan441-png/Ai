import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('DevSecOps Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── SAST ──────────────────────────────────────────────────────────────────

  describe('SAST Security Testing', () => {
    it('explains SAST static application security testing', async () => {
      const r = await brain.chat(
        'What is SAST static application security testing with SonarQube and Semgrep?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /sast|static|security|sonarqube|semgrep|codeql|scan|code/,
      )
    })

    it('describes SAST tools and CI integration', async () => {
      const r = await brain.chat(
        'How do SAST static code analysis security scanning tools integrate with CI/CD?',
      )
      expect(r.text.toLowerCase()).toMatch(/sast|static|analysis|ci|pipeline|scan|tool|security/)
    })
  })

  // ── DAST ──────────────────────────────────────────────────────────────────

  describe('DAST Security Testing', () => {
    it('explains DAST dynamic application security testing', async () => {
      const r = await brain.chat(
        'What is DAST dynamic application security testing with ZAP and Nuclei?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dast|dynamic|security|zap|nuclei|runtime|scan|test/)
    })
  })

  // ── SCA ───────────────────────────────────────────────────────────────────

  describe('SCA Dependency Analysis', () => {
    it('explains software composition analysis and SBOM', async () => {
      const r = await brain.chat(
        'How does software composition analysis SCA and supply chain security SBOM work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /sca|composition|dependency|sbom|supply\s*chain|vulnerab|snyk|dependabot/,
      )
    })

    it('covers dependency vulnerability scanning', async () => {
      const r = await brain.chat(
        'How does dependency vulnerability scanning with npm audit and Snyk work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /dependency|vulnerab|scan|npm\s*audit|snyk|trivy|lockfile/,
      )
    })
  })

  // ── Container Security ────────────────────────────────────────────────────

  describe('Container Security', () => {
    it('explains container security scanning with Trivy', async () => {
      const r = await brain.chat(
        'How does container security scanning of Docker images with Trivy and Falco work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /container|security|scan|trivy|docker|image|falco|k8s|kubernetes/,
      )
    })

    it('covers Kubernetes security policies', async () => {
      const r = await brain.chat(
        'How do Kubernetes security policy and admission controller OPA Gatekeeper work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /kubernetes|security|policy|admission|rbac|opa|gatekeeper|pod/,
      )
    })
  })

  // ── Secret Management ─────────────────────────────────────────────────────

  describe('Secret Management', () => {
    it('explains secret management with Vault', async () => {
      const r = await brain.chat(
        'How does secret management with HashiCorp Vault and rotation work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/secret|management|vault|rotation|dynamic|encrypt|token/)
    })

    it('describes secret scanning tools', async () => {
      const r = await brain.chat(
        'How do secret scanning tools like git-leaks and TruffleHog detect exposed secrets?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /secret|scan|git.?leaks|trufflehog|detect|entropy|commit/,
      )
    })
  })

  // ── Security Pipeline ─────────────────────────────────────────────────────

  describe('Security Pipeline', () => {
    it('explains DevSecOps CI/CD security pipeline', async () => {
      const r = await brain.chat(
        'How does a DevSecOps CI-CD security automation pipeline with shift-left work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/devsecops|pipeline|shift.?left|security|ci|gate|sdlc/)
    })

    it('covers threat modeling with STRIDE', async () => {
      const r = await brain.chat(
        'How does secure SDLC threat modeling with STRIDE methodology work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /threat\s*model|stride|security|sdlc|spoofing|tamper|design/,
      )
    })
  })

  // ── IaC Security ──────────────────────────────────────────────────────────

  describe('IaC Security', () => {
    it('explains IaC security scanning with Checkov and tfsec', async () => {
      const r = await brain.chat(
        'How does infrastructure as code security scanning with Checkov and tfsec for Terraform work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /iac|security|checkov|tfsec|terraform|scan|misconfig|policy/,
      )
    })
  })

  // ── Vulnerability Management ──────────────────────────────────────────────

  describe('Vulnerability Management', () => {
    it('explains vulnerability management and CVSS prioritization', async () => {
      const r = await brain.chat(
        'How does vulnerability management prioritization and triage with CVSS scoring work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/vulnerab|management|priorit|cvss|triage|patch|remediat/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - DevSecOps concepts', () => {
    it('has DevSecOps concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('DevSecOps')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('security')
    })

    it('has SAST Security Testing concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('SAST Security Testing')
      expect(concept).toBeDefined()
    })

    it('has DAST Security Testing concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('DAST Security Testing')
      expect(concept).toBeDefined()
    })

    it('has Container Security concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Container Security')
      expect(concept).toBeDefined()
    })

    it('has Secret Management concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Secret Management')
      expect(concept).toBeDefined()
    })

    it('has Vulnerability Management concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Vulnerability Management')
      expect(concept).toBeDefined()
    })

    it('DevSecOps has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('DevSecOps')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(7)
    })

    it('SAST is related to DAST', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('SAST Security Testing')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('DAST Security Testing')
    })
  })
})
