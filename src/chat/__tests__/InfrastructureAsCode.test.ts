import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Infrastructure as Code (IaC) Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  it('knows about Terraform', async () => {
    const r = await brain.chat('explain terraform infrastructure as code hcl provider resource state management')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/terraform|hcl|provider|resource|state|infrastructure/)
  })

  it('knows about IaC alternatives', async () => {
    const r = await brain.chat('explain pulumi aws cdk infrastructure code ansible playbook configuration management')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/pulumi|cdk|ansible|infrastructure|playbook/)
  })

  it('knows about IaC operations', async () => {
    const r = await brain.chat('explain infrastructure drift detection gitops flux argocd iac testing terratest checkov')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/drift|gitops|argocd|terratest|checkov|compliance|flux/)
  })

  it('has IaC concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Infrastructure as Code (IaC)')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('iac')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Infrastructure as Code (IaC)')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('Terraform & HCL')
  })
})
