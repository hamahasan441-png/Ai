import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Cloud & DevOps Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Docker ────────────────────────────────────────────────────────────────

  describe('Docker Containerization', () => {
    it('explains Docker container and Dockerfile basics', async () => {
      const r = await brain.chat(
        'How do Docker containers and Dockerfiles work for containerization?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/docker|container|dockerfile|image|build|run/)
    })

    it('describes Docker Compose for multi-container apps', async () => {
      const r = await brain.chat('How does Docker Compose manage multi-container applications?')
      expect(r.text.toLowerCase()).toMatch(/docker|compose|service|volume|network|container/)
    })

    it('covers Docker best practices', async () => {
      const r = await brain.chat('What are Docker container image best practices for production?')
      expect(r.text.toLowerCase()).toMatch(/docker|image|alpine|layer|cache|best\s*practice|stage/)
    })
  })

  // ── Kubernetes ────────────────────────────────────────────────────────────

  describe('Kubernetes Orchestration', () => {
    it('explains Kubernetes pods and deployments', async () => {
      const r = await brain.chat(
        'How do Kubernetes pods and deployments work for container orchestration?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kubernetes|k8s|pod|deployment|container|orchestrat/)
    })

    it('describes Kubernetes services and networking', async () => {
      const r = await brain.chat('How do Kubernetes services and ingress handle networking?')
      expect(r.text.toLowerCase()).toMatch(
        /service|ingress|clusterip|nodeport|loadbalancer|network/,
      )
    })

    it('covers kubectl and Helm usage', async () => {
      const r = await brain.chat('How to use kubectl and Helm charts for Kubernetes management?')
      expect(r.text.toLowerCase()).toMatch(/kubectl|helm|chart|apply|deploy|manifest/)
    })
  })

  // ── CI/CD ─────────────────────────────────────────────────────────────────

  describe('CI/CD Pipelines', () => {
    it('explains CI/CD pipeline concepts', async () => {
      const r = await brain.chat(
        'What is a CI/CD pipeline for continuous integration and deployment?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ci|cd|pipeline|continuous|integration|deploy/)
    })

    it('describes GitHub Actions workflows', async () => {
      const r = await brain.chat('How do GitHub Actions workflows automate CI/CD pipelines?')
      expect(r.text.toLowerCase()).toMatch(/github\s*action|workflow|trigger|job|step|pipeline/)
    })

    it('covers deployment strategies', async () => {
      const r = await brain.chat(
        'What CI/CD pipeline deployment strategies exist like blue-green and canary?',
      )
      expect(r.text.toLowerCase()).toMatch(/blue-?green|canary|rolling|deploy|strateg|pipeline/)
    })
  })

  // ── Infrastructure as Code ────────────────────────────────────────────────

  describe('Infrastructure as Code', () => {
    it('explains Terraform IaC fundamentals', async () => {
      const r = await brain.chat(
        'How does Terraform infrastructure as code provision cloud resources?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /terraform|infrastructure|code|provider|plan|apply|state/,
      )
    })

    it('describes Ansible configuration management', async () => {
      const r = await brain.chat(
        'How does Ansible playbook configuration management automate infrastructure?',
      )
      expect(r.text.toLowerCase()).toMatch(/ansible|playbook|agentless|ssh|config|role/)
    })
  })

  // ── AWS ───────────────────────────────────────────────────────────────────

  describe('AWS Cloud Services', () => {
    it('explains AWS Lambda serverless functions', async () => {
      const r = await brain.chat('How does AWS Lambda serverless computing with API Gateway work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/aws|lambda|serverless|api\s*gateway|event|function/)
    })

    it('describes AWS core services overview', async () => {
      const r = await brain.chat('What are the core AWS cloud services like EC2, S3, and DynamoDB?')
      expect(r.text.toLowerCase()).toMatch(/aws|ec2|s3|dynamodb|cloud|service/)
    })
  })

  // ── Observability ─────────────────────────────────────────────────────────

  describe('Observability & Monitoring', () => {
    it('explains Prometheus and Grafana monitoring stack', async () => {
      const r = await brain.chat('How does Prometheus Grafana monitoring and observability work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/prometheus|grafana|metric|monitor|alert|dashboard/)
    })

    it('describes distributed tracing and logging', async () => {
      const r = await brain.chat('How does distributed tracing and logging work in microservices?')
      expect(r.text.toLowerCase()).toMatch(/trac|log|jaeger|opentelemetry|elk|metric|observ/)
    })
  })

  // ── Microservices ─────────────────────────────────────────────────────────

  describe('Microservices Architecture', () => {
    it('explains microservices patterns and API gateway', async () => {
      const r = await brain.chat(
        'How do microservices architecture patterns work with API gateways?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/microservice|api\s*gateway|service|circuit|pattern/)
    })

    it('describes service mesh and Istio', async () => {
      const r = await brain.chat(
        'How does a service mesh like Istio handle microservice communication?',
      )
      expect(r.text.toLowerCase()).toMatch(/service\s*mesh|istio|sidecar|envoy|mtls|traffic/)
    })
  })

  // ── GitOps ────────────────────────────────────────────────────────────────

  describe('GitOps Deployment', () => {
    it('explains GitOps with ArgoCD for Kubernetes', async () => {
      const r = await brain.chat('How does GitOps with ArgoCD manage Kubernetes deployments?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/gitops|argocd|git|kubernetes|sync|declarative/)
    })

    it('describes GitOps workflow and principles', async () => {
      const r = await brain.chat('What are the GitOps principles and workflow for infrastructure?')
      expect(r.text.toLowerCase()).toMatch(/gitops|git|declarative|version|auto|reconcil|flux|argo/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Cloud & DevOps concepts', () => {
    it('has Cloud & DevOps concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Cloud & DevOps')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('infrastructure')
    })

    it('has Docker Containerization concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Docker Containerization')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('devops')
    })

    it('has Kubernetes Orchestration concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Kubernetes Orchestration')
      expect(concept).toBeDefined()
    })

    it('has CI/CD Pipelines concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('CI/CD Pipelines')
      expect(concept).toBeDefined()
    })

    it('has AWS Cloud Services concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('AWS Cloud Services')
      expect(concept).toBeDefined()
    })

    it('has Microservices Architecture concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Microservices Architecture')
      expect(concept).toBeDefined()
    })

    it('has GitOps Deployment concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('GitOps Deployment')
      expect(concept).toBeDefined()
    })

    it('Cloud & DevOps has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Cloud & DevOps')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Kubernetes is related to Docker', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Kubernetes Orchestration')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Docker Containerization')
    })

    it('GitOps is related to CI/CD Pipelines', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('GitOps Deployment')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('CI/CD Pipelines')
    })
  })
})
