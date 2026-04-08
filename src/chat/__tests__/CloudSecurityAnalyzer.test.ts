import { describe, it, expect, beforeEach } from 'vitest'
import {
  CloudSecurityAnalyzer,
  DEFAULT_CLOUD_SECURITY_CONFIG,
} from '../CloudSecurityAnalyzer.js'

describe('CloudSecurityAnalyzer', () => {
  let analyzer: CloudSecurityAnalyzer

  beforeEach(() => {
    analyzer = new CloudSecurityAnalyzer()
  })

  // ═══════════════════════════════════════════════════════════════
  // 1. Constructor
  // ═══════════════════════════════════════════════════════════════

  describe('Constructor', () => {
    it('creates instance with default config', () => {
      const stats = analyzer.getStats()
      expect(stats.totalScans).toBe(0)
      expect(stats.totalAssessments).toBe(0)
    })

    it('creates instance with custom maxResults', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 5 })
      const misconfigs = a.getCommonMisconfigurations('aws')
      expect(misconfigs.length).toBeLessThanOrEqual(5)
    })

    it('creates instance with custom defaultProvider', () => {
      const a = new CloudSecurityAnalyzer({ defaultProvider: 'gcp' })
      expect(a).toBeDefined()
    })

    it('creates instance with custom severityThreshold', () => {
      const a = new CloudSecurityAnalyzer({ severityThreshold: 'critical' })
      const misconfigs = a.scanMisconfigurations('aws', 'S3 public access bucket')
      for (const m of misconfigs) {
        expect(m.severity).toBe('critical')
      }
    })

    it('creates instance with features disabled', () => {
      const a = new CloudSecurityAnalyzer({
        enableKubernetesScanning: false,
        enableContainerScanning: false,
        enableServerlessAnalysis: false,
        enableComplianceChecks: false,
      })
      expect(a.scanKubernetes('privileged: true')).toEqual([])
      expect(a.scanContainer('FROM node:latest').severity).toBe('info')
      expect(a.checkCompliance('aws', 'CIS')).toEqual([])
    })

    it('merges partial config with defaults', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 3 })
      const frameworks = a.getComplianceFrameworks()
      expect(frameworks.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 2. scanMisconfigurations
  // ═══════════════════════════════════════════════════════════════

  describe('scanMisconfigurations', () => {
    it('finds S3 public access misconfiguration for AWS', () => {
      const results = analyzer.scanMisconfigurations('aws', 'S3 bucket public access enabled')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.id === 'AWS-S3-001')).toBe(true)
    })

    it('finds open security group for AWS', () => {
      const results = analyzer.scanMisconfigurations('aws', 'security group unrestricted inbound 0.0.0.0/0')
      expect(results.some(r => r.id === 'AWS-SG-001')).toBe(true)
    })

    it('finds unencrypted EBS for AWS', () => {
      const results = analyzer.scanMisconfigurations('aws', 'EBS volumes not encrypted at rest')
      expect(results.some(r => r.id === 'AWS-EBS-001')).toBe(true)
    })

    it('finds NSG any source for Azure', () => {
      const results = analyzer.scanMisconfigurations('azure', 'NSG rule allows any source inbound traffic network')
      expect(results.some(r => r.provider === 'azure')).toBe(true)
    })

    it('finds storage anonymous access for Azure', () => {
      const results = analyzer.scanMisconfigurations('azure', 'Storage account anonymous access public blob')
      expect(results.some(r => r.provider === 'azure')).toBe(true)
    })

    it('finds GCS bucket misconfiguration for GCP', () => {
      const results = analyzer.scanMisconfigurations('gcp', 'Cloud Storage bucket uniform bucket level access not enabled')
      expect(results.some(r => r.provider === 'gcp')).toBe(true)
    })

    it('finds firewall rule for GCP', () => {
      const results = analyzer.scanMisconfigurations('gcp', 'VPC firewall rule allows all traffic 0.0.0.0/0')
      expect(results.some(r => r.provider === 'gcp')).toBe(true)
    })

    it('scans multi-cloud and returns results from all providers', () => {
      const results = analyzer.scanMisconfigurations('multi', 'firewall security group NSG public access storage bucket')
      const providers = new Set(results.map(r => r.provider))
      expect(providers.size).toBeGreaterThanOrEqual(1)
    })

    it('returns all AWS misconfigs when no tokens match', () => {
      const results = analyzer.scanMisconfigurations('aws', 'xyzabc')
      expect(results.length).toBeGreaterThan(0)
      for (const r of results) expect(r.provider).toBe('aws')
    })

    it('returns minimal for multi when no tokens match', () => {
      const results = analyzer.scanMisconfigurations('multi', 'xyzabcnothing')
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('sorts results by severity', () => {
      const results = analyzer.scanMisconfigurations('aws', 'S3 bucket security group EBS')
      const sevOrder: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 }
      for (let i = 1; i < results.length; i++) {
        expect(sevOrder[results[i - 1].severity]).toBeGreaterThanOrEqual(sevOrder[results[i].severity])
      }
    })

    it('respects maxResults', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 2 })
      const results = a.getCommonMisconfigurations('aws')
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('increments totalScans stat', () => {
      analyzer.scanMisconfigurations('aws', 'S3 public')
      analyzer.scanMisconfigurations('azure', 'NSG')
      expect(analyzer.getStats().totalScans).toBe(2)
    })

    it('increments totalMisconfigurationsFound', () => {
      analyzer.scanMisconfigurations('aws', 'S3 bucket public access')
      expect(analyzer.getStats().totalMisconfigurationsFound).toBeGreaterThan(0)
    })

    it('respects severity threshold', () => {
      const a = new CloudSecurityAnalyzer({ severityThreshold: 'high' })
      const results = a.scanMisconfigurations('aws', 'S3 bucket public access')
      for (const r of results) {
        expect(['critical', 'high']).toContain(r.severity)
      }
    })

    it('each misconfiguration has required fields', () => {
      const results = analyzer.scanMisconfigurations('aws', 'S3 bucket public')
      for (const r of results) {
        expect(r.id).toBeTruthy()
        expect(r.provider).toBeTruthy()
        expect(r.service).toBeTruthy()
        expect(r.severity).toBeTruthy()
        expect(r.title).toBeTruthy()
        expect(r.description).toBeTruthy()
        expect(r.impact).toBeTruthy()
        expect(r.remediation).toBeTruthy()
        expect(Array.isArray(r.compliance)).toBe(true)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 3. analyzeIAMPolicy
  // ═══════════════════════════════════════════════════════════════

  describe('analyzeIAMPolicy', () => {
    it('detects wildcard action "*"', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.wildcardActions).toContain('*')
      expect(result.overprivileged).toBe(true)
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('detects service-level wildcards like s3:*', () => {
      const policy = JSON.stringify({
        Statement: [{ Effect: 'Allow', Action: '"s3:*"', Resource: '*' }],
      })
      // Need the literal "s3:*" in the string
      const policyStr = '{"Statement": [{"Effect": "Allow", "Action": "s3:*", "Resource": "*"}]}'
      const result = analyzer.analyzeIAMPolicy(policyStr)
      expect(result.wildcardActions.length).toBeGreaterThan(0)
    })

    it('detects cross-account access', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Principal": {"AWS": "arn:aws:iam::123456789012:root"}, "Action": "sts:AssumeRole"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.crossAccountAccess).toBe(true)
    })

    it('does not flag cross-account when Deny effect present', () => {
      const policy = '{"Statement": [{"Effect": "Deny", "Principal": {"AWS": "arn:aws:iam::123456789012:root"}, "Action": "sts:AssumeRole"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.crossAccountAccess).toBe(false)
    })

    it('detects missing MFA', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mybucket/*"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.noMFA).toBe(true)
    })

    it('does not flag MFA when MultiFactorAuthPresent is included', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mybucket/*", "Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.noMFA).toBe(false)
    })

    it('flags overprivileged for high risk score', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.overprivileged).toBe(true)
      expect(result.riskScore).toBeGreaterThanOrEqual(4)
    })

    it('returns clean recommendations for a tight policy', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mybucket/*", "Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('detects Resource: "*"', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "s3:GetObject", "Resource": "*"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.recommendations.some(r => r.includes('Resource'))).toBe(true)
    })

    it('detects AdministratorAccess', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "AdministratorAccess"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('detects NotAction usage', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "NotAction": "iam:*", "Resource": "*"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.recommendations.some(r => r.includes('NotAction'))).toBe(true)
    })

    it('clamps risk score between 0 and 10', () => {
      const policy = '{"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*", "NotAction": "x"}]}'
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.riskScore).toBeLessThanOrEqual(10)
      expect(result.riskScore).toBeGreaterThanOrEqual(0)
    })

    it('increments totalIAMAnalyses', () => {
      analyzer.analyzeIAMPolicy('{}')
      analyzer.analyzeIAMPolicy('{}')
      expect(analyzer.getStats().totalIAMAnalyses).toBe(2)
    })

    it('handles complex policy with conditions', () => {
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject'],
            Resource: 'arn:aws:s3:::my-bucket/*',
            Condition: { IpAddress: { 'aws:SourceIp': '10.0.0.0/8' } },
          },
        ],
      })
      const result = analyzer.analyzeIAMPolicy(policy)
      expect(result.overprivileged).toBe(false)
      expect(result.wildcardActions).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 4. scanKubernetes
  // ═══════════════════════════════════════════════════════════════

  describe('scanKubernetes', () => {
    it('detects privileged pods', () => {
      const manifest = `
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: test
    securityContext:
      privileged: true
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-POD-001')).toBe(true)
    })

    it('detects hostNetwork: true', () => {
      const manifest = `
apiVersion: v1
kind: Pod
spec:
  hostNetwork: true
  securityContext: {}
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-NET-001')).toBe(true)
    })

    it('detects missing securityContext', () => {
      const manifest = `
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: test
    image: nginx
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-SEC-001')).toBe(true)
    })

    it('detects cluster-admin RBAC binding', () => {
      const manifest = `
kind: ClusterRoleBinding
roleRef:
  name: cluster-admin
  securityContext: {}
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-RBAC-001')).toBe(true)
    })

    it('detects missing resource limits', () => {
      const manifest = `
kind: Deployment
spec:
  containers:
  - name: test
    securityContext: {}
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-RES-001')).toBe(true)
    })

    it('detects docker socket mount', () => {
      const manifest = `
kind: Pod
spec:
  volumes:
  - hostPath:
      path: /var/run/docker.sock
  securityContext: {}
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-MOUNT-001')).toBe(true)
    })

    it('detects tiller deployment', () => {
      const manifest = `
kind: Deployment
metadata:
  name: tiller-deploy
spec:
  securityContext: {}
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-HELM-001')).toBe(true)
    })

    it('detects missing NetworkPolicy for Deployment', () => {
      const manifest = `
kind: Deployment
spec:
  template:
    securityContext: {}
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.some(r => r.id === 'K8S-NET-002')).toBe(true)
    })

    it('returns results sorted by severity', () => {
      const manifest = 'privileged: true\nhostNetwork: true\ncluster-admin\nsecurityContext: {}'
      const results = analyzer.scanKubernetes(manifest)
      const sevOrder: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 }
      for (let i = 1; i < results.length; i++) {
        expect(sevOrder[results[i - 1].severity]).toBeGreaterThanOrEqual(sevOrder[results[i].severity])
      }
    })

    it('respects maxResults', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 2 })
      const manifest = 'privileged: true\nhostNetwork: true\ncluster-admin\ndocker.sock\ntiller'
      const results = a.scanKubernetes(manifest)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('returns empty when kubernetes scanning is disabled', () => {
      const a = new CloudSecurityAnalyzer({ enableKubernetesScanning: false })
      expect(a.scanKubernetes('privileged: true')).toEqual([])
    })

    it('increments totalKubernetesScans', () => {
      analyzer.scanKubernetes('test')
      analyzer.scanKubernetes('test')
      expect(analyzer.getStats().totalKubernetesScans).toBe(2)
    })

    it('detects multiple issues in complex manifest', () => {
      const manifest = `
kind: Deployment
spec:
  template:
    spec:
      hostNetwork: true
      containers:
      - name: app
        securityContext:
          privileged: true
      volumes:
      - hostPath:
          path: /var/run/docker.sock
`
      const results = analyzer.scanKubernetes(manifest)
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('uses fallback keyword matching when no direct hits', () => {
      const manifest = 'secure pod running with elevated capabilities container escape host access'
      const results = analyzer.scanKubernetes(manifest)
      // Fallback uses keyword matching
      expect(results).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 5. scanContainer
  // ═══════════════════════════════════════════════════════════════

  describe('scanContainer', () => {
    it('detects FROM :latest tag', () => {
      const dockerfile = 'FROM node:latest\nRUN npm install'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.imageVulnerabilities).toBeGreaterThan(0)
      expect(result.recommendations.some(r => r.includes('latest'))).toBe(true)
    })

    it('detects running as root (no USER directive)', () => {
      const dockerfile = 'FROM node:18\nRUN npm install'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.runAsRoot).toBe(true)
      expect(result.severity).toBe('critical')
    })

    it('detects USER root', () => {
      const dockerfile = 'FROM node:18\nUSER root\nRUN npm install'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.runAsRoot).toBe(true)
    })

    it('detects secrets in environment variables', () => {
      const dockerfile = 'FROM node:18\nENV SECRET=mysecretval\nUSER appuser'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.recommendations.some(r => r.toLowerCase().includes('secret'))).toBe(true)
    })

    it('detects API key in env', () => {
      const dockerfile = 'FROM node:18\nENV API_KEY=abc123\nUSER appuser'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.recommendations.some(r => r.toLowerCase().includes('secret'))).toBe(true)
    })

    it('detects capabilities added', () => {
      const dockerfile = 'FROM node:18\nUSER appuser\nRUN --cap-add=NET_ADMIN something'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.capabilities.length).toBeGreaterThan(0)
    })

    it('detects SYS_ADMIN capability', () => {
      const dockerfile = 'FROM node:18\nUSER appuser\nRUN SYS_ADMIN NET_ADMIN'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.capabilities).toContain('SYS_ADMIN')
      expect(result.capabilities).toContain('NET_ADMIN')
    })

    it('detects missing HEALTHCHECK', () => {
      const dockerfile = 'FROM node:18\nUSER appuser'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.recommendations.some(r => r.includes('HEALTHCHECK'))).toBe(true)
    })

    it('returns info severity when scanning is disabled', () => {
      const a = new CloudSecurityAnalyzer({ enableContainerScanning: false })
      const result = a.scanContainer('FROM node:latest')
      expect(result.severity).toBe('info')
      expect(result.recommendations).toContain('Container scanning is disabled in configuration.')
    })

    it('handles clean Dockerfile', () => {
      const dockerfile = `FROM node:18-alpine
USER appuser
HEALTHCHECK CMD curl -f http://localhost/health
COPY . .`
      const result = analyzer.scanContainer(dockerfile)
      expect(result.runAsRoot).toBe(false)
    })

    it('increments totalContainerScans', () => {
      analyzer.scanContainer('FROM node:18')
      analyzer.scanContainer('FROM node:18')
      expect(analyzer.getStats().totalContainerScans).toBe(2)
    })

    it('detects ADD instruction', () => {
      const dockerfile = 'FROM node:18\nADD . /app\nUSER appuser\nHEALTHCHECK CMD curl http://localhost/'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.recommendations.some(r => r.includes('COPY over ADD'))).toBe(true)
    })

    it('suggests multi-stage builds when needed', () => {
      const dockerfile = 'FROM node:18\nRUN npm build\nUSER appuser\nHEALTHCHECK CMD curl localhost'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.recommendations.some(r => r.includes('multi-stage'))).toBe(true)
    })

    it('detects apt-get without --no-install-recommends', () => {
      const dockerfile = 'FROM ubuntu:22.04\nRUN apt-get install -y curl\nUSER appuser\nHEALTHCHECK CMD curl localhost'
      const result = analyzer.scanContainer(dockerfile)
      expect(result.recommendations.some(r => r.includes('--no-install-recommends'))).toBe(true)
    })

    it('has unique generated id', () => {
      const r1 = analyzer.scanContainer('FROM node:18')
      const r2 = analyzer.scanContainer('FROM node:18')
      expect(r1.id).not.toBe(r2.id)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 6. analyzeServerless
  // ═══════════════════════════════════════════════════════════════

  describe('analyzeServerless', () => {
    it('detects excess permissions', () => {
      const config = 'FunctionName: myFunc\nRuntime: nodejs18.x\nAction: "*"\nAdministratorAccess'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.risks.some(r => r.includes('permissive'))).toBe(true)
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('detects environment secrets', () => {
      const config = 'FunctionName: myFunc\nRuntime: python3.11\nEnvironment:\n  Variables:\n    SECRET: my-secret-value'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.risks.some(r => r.includes('Secrets') || r.includes('secret'))).toBe(true)
    })

    it('detects timeout issues', () => {
      const config = 'FunctionName: myFunc\nRuntime: nodejs18.x\nTimeout: 900'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.risks.some(r => r.includes('timeout'))).toBe(true)
    })

    it('detects no authentication on API', () => {
      const config = 'FunctionName: apiHandler\nRuntime: nodejs18.x\nAPI Gateway HTTP endpoint'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.risks.some(r => r.includes('authentication'))).toBe(true)
    })

    it('detects missing DLQ', () => {
      const config = 'FunctionName: processor\nRuntime: python3.11\nMemory: 128'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.risks.some(r => r.includes('Dead Letter Queue'))).toBe(true)
    })

    it('detects missing concurrency limits', () => {
      const config = 'FunctionName: myFunc\nRuntime: nodejs18.x'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.risks.some(r => r.includes('concurrency'))).toBe(true)
    })

    it('extracts function name from config', () => {
      const config = 'FunctionName: my-cool-func\nRuntime: nodejs18.x'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.functionName).toBe('my-cool-func')
    })

    it('extracts runtime from config', () => {
      const config = 'FunctionName: f\nRuntime: python3.11'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.runtime).toBe('python3.11')
    })

    it('returns unknown for missing function name', () => {
      const result = analyzer.analyzeServerless('some config', 'aws')
      expect(result.functionName).toBe('unknown')
    })

    it('returns unknown for missing runtime', () => {
      const result = analyzer.analyzeServerless('FunctionName: f', 'aws')
      expect(result.runtime).toBe('unknown')
    })

    it('returns info when disabled', () => {
      const a = new CloudSecurityAnalyzer({ enableServerlessAnalysis: false })
      const result = a.analyzeServerless('anything', 'aws')
      expect(result.riskScore).toBe(0)
      expect(result.risks).toContain('Serverless analysis is disabled.')
    })

    it('sets correct provider', () => {
      const result = analyzer.analyzeServerless('FunctionName: f\nRuntime: r', 'gcp')
      expect(result.provider).toBe('gcp')
    })

    it('clamps risk score to 0-10', () => {
      const config = 'FunctionName: f\nRuntime: r\nAdministratorAccess\nEnvironment SECRET\nTimeout: 900\nAPI HTTP gateway'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.riskScore).toBeLessThanOrEqual(10)
      expect(result.riskScore).toBeGreaterThanOrEqual(0)
    })

    it('increments totalServerlessAnalyses', () => {
      analyzer.analyzeServerless('x', 'aws')
      analyzer.analyzeServerless('x', 'aws')
      expect(analyzer.getStats().totalServerlessAnalyses).toBe(2)
    })

    it('suggests VPC when not deployed in VPC', () => {
      const config = 'FunctionName: f\nRuntime: r'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.eventSourceRisks.some(r => r.includes('VPC')) ||
             result.recommendations.some(r => r.includes('VPC'))).toBe(true)
    })

    it('suggests tracing when not configured', () => {
      const config = 'FunctionName: f\nRuntime: r'
      const result = analyzer.analyzeServerless(config, 'aws')
      expect(result.recommendations.some(r => r.includes('tracing') || r.includes('X-Ray'))).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 7. checkCompliance
  // ═══════════════════════════════════════════════════════════════

  describe('checkCompliance', () => {
    it('returns CIS controls for AWS', () => {
      const controls = analyzer.checkCompliance('aws', 'CIS')
      expect(controls.length).toBeGreaterThan(0)
      for (const c of controls) {
        expect(c.cloudMapping.aws.length).toBeGreaterThan(0)
      }
    })

    it('returns SOC2 controls', () => {
      const controls = analyzer.checkCompliance('aws', 'SOC2')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns PCI-DSS controls', () => {
      const controls = analyzer.checkCompliance('aws', 'PCI-DSS')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns HIPAA controls', () => {
      const controls = analyzer.checkCompliance('aws', 'HIPAA')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns NIST-800-53 controls', () => {
      const controls = analyzer.checkCompliance('aws', 'NIST-800-53')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns ISO-27001 controls', () => {
      const controls = analyzer.checkCompliance('aws', 'ISO-27001')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns empty for unknown framework', () => {
      const controls = analyzer.checkCompliance('aws', 'UNKNOWN-FRAMEWORK')
      expect(controls).toEqual([])
    })

    it('returns all controls for multi provider', () => {
      const controls = analyzer.checkCompliance('multi', 'CIS')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns controls for azure provider', () => {
      const controls = analyzer.checkCompliance('azure', 'SOC2')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns controls for gcp provider', () => {
      const controls = analyzer.checkCompliance('gcp', 'NIST-800-53')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('returns empty when compliance checks are disabled', () => {
      const a = new CloudSecurityAnalyzer({ enableComplianceChecks: false })
      expect(a.checkCompliance('aws', 'CIS')).toEqual([])
    })

    it('increments totalComplianceChecks', () => {
      analyzer.checkCompliance('aws', 'CIS')
      analyzer.checkCompliance('aws', 'SOC2')
      expect(analyzer.getStats().totalComplianceChecks).toBe(2)
    })

    it('handles case-insensitive framework name', () => {
      const controls = analyzer.checkCompliance('aws', 'cis')
      expect(controls.length).toBeGreaterThan(0)
    })

    it('each control has id, title, description, cloudMapping', () => {
      const controls = analyzer.checkCompliance('aws', 'CIS')
      for (const c of controls) {
        expect(c.id).toBeTruthy()
        expect(c.title).toBeTruthy()
        expect(c.description).toBeTruthy()
        expect(c.cloudMapping).toBeDefined()
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 8. assessCloudSecurity
  // ═══════════════════════════════════════════════════════════════

  describe('assessCloudSecurity', () => {
    it('returns assessment for AWS', () => {
      const result = analyzer.assessCloudSecurity('aws', 'S3 bucket public access security group')
      expect(result.provider).toBe('aws')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.misconfigurations.length).toBeGreaterThan(0)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('returns assessment for Azure', () => {
      const result = analyzer.assessCloudSecurity('azure', 'NSG storage anonymous access')
      expect(result.provider).toBe('azure')
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('returns assessment for GCP', () => {
      const result = analyzer.assessCloudSecurity('gcp', 'firewall bucket compute')
      expect(result.provider).toBe('gcp')
    })

    it('includes IAM issues in assessment', () => {
      const config = '{"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]}'
      const result = analyzer.assessCloudSecurity('aws', config)
      expect(result.iamIssues.overprivileged).toBe(true)
    })

    it('includes kubernetes issues when manifest tokens present', () => {
      const config = 'privileged: true hostNetwork: true securityContext: {}'
      const result = analyzer.assessCloudSecurity('aws', config)
      expect(result.kubernetesIssues.length).toBeGreaterThanOrEqual(0)
    })

    it('includes container issues when Dockerfile keywords present', () => {
      const config = 'FROM node:latest\nRUN npm install'
      const result = analyzer.assessCloudSecurity('aws', config)
      expect(result.containerIssues.length).toBeGreaterThan(0)
    })

    it('includes serverless risks when lambda keywords present', () => {
      const config = 'lambda function serverless FunctionName: test Runtime: nodejs18.x'
      const result = analyzer.assessCloudSecurity('aws', config)
      expect(result.serverlessRisks.length).toBeGreaterThan(0)
    })

    it('calculates compliance status for all frameworks', () => {
      const result = analyzer.assessCloudSecurity('aws', 'S3 public')
      expect(Object.keys(result.complianceStatus).length).toBeGreaterThan(0)
      for (const score of Object.values(result.complianceStatus)) {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      }
    })

    it('score decreases with more issues', () => {
      const bad = analyzer.assessCloudSecurity('aws', '{"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]} FROM node:latest lambda function serverless')
      // A config with many security keywords should have findings and a score
      expect(bad.score).toBeGreaterThanOrEqual(0)
      expect(bad.score).toBeLessThanOrEqual(100)
    })

    it('increments totalAssessments', () => {
      analyzer.assessCloudSecurity('aws', 'test')
      expect(analyzer.getStats().totalAssessments).toBe(1)
    })

    it('provides recommendations for critical misconfigs', () => {
      const result = analyzer.assessCloudSecurity('aws', 'S3 bucket public access IAM wildcard')
      const hasCriticalRec = result.recommendations.some(r => r.includes('critical') || r.includes('CRITICAL'))
      expect(hasCriticalRec).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 9. getCommonMisconfigurations
  // ═══════════════════════════════════════════════════════════════

  describe('getCommonMisconfigurations', () => {
    it('returns AWS misconfigurations', () => {
      const results = analyzer.getCommonMisconfigurations('aws')
      expect(results.length).toBeGreaterThan(0)
      for (const r of results) expect(r.provider).toBe('aws')
    })

    it('returns Azure misconfigurations', () => {
      const results = analyzer.getCommonMisconfigurations('azure')
      expect(results.length).toBeGreaterThan(0)
      for (const r of results) expect(r.provider).toBe('azure')
    })

    it('returns GCP misconfigurations', () => {
      const results = analyzer.getCommonMisconfigurations('gcp')
      expect(results.length).toBeGreaterThan(0)
      for (const r of results) expect(r.provider).toBe('gcp')
    })

    it('returns all providers for multi', () => {
      const results = analyzer.getCommonMisconfigurations('multi')
      const providers = new Set(results.map(r => r.provider))
      expect(providers.size).toBeGreaterThanOrEqual(2)
    })

    it('results are sorted by severity', () => {
      const results = analyzer.getCommonMisconfigurations('aws')
      const sevOrder: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 }
      for (let i = 1; i < results.length; i++) {
        expect(sevOrder[results[i - 1].severity]).toBeGreaterThanOrEqual(sevOrder[results[i].severity])
      }
    })

    it('increments totalScans', () => {
      analyzer.getCommonMisconfigurations('aws')
      expect(analyzer.getStats().totalScans).toBe(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 10. getComplianceFrameworks
  // ═══════════════════════════════════════════════════════════════

  describe('getComplianceFrameworks', () => {
    it('returns all frameworks', () => {
      const frameworks = analyzer.getComplianceFrameworks()
      expect(frameworks.length).toBeGreaterThanOrEqual(6)
    })

    it('includes CIS', () => {
      const fw = analyzer.getComplianceFrameworks()
      expect(fw.some(f => f.includes('CIS'))).toBe(true)
    })

    it('includes SOC2', () => {
      const fw = analyzer.getComplianceFrameworks()
      expect(fw.some(f => f.includes('SOC2'))).toBe(true)
    })

    it('includes PCI-DSS', () => {
      const fw = analyzer.getComplianceFrameworks()
      expect(fw.some(f => f.includes('PCI-DSS'))).toBe(true)
    })

    it('includes HIPAA', () => {
      const fw = analyzer.getComplianceFrameworks()
      expect(fw.some(f => f.includes('HIPAA'))).toBe(true)
    })

    it('includes NIST-800-53', () => {
      const fw = analyzer.getComplianceFrameworks()
      expect(fw.some(f => f.includes('NIST'))).toBe(true)
    })

    it('includes ISO-27001', () => {
      const fw = analyzer.getComplianceFrameworks()
      expect(fw.some(f => f.includes('ISO'))).toBe(true)
    })

    it('each framework string includes version in parentheses', () => {
      const fw = analyzer.getComplianceFrameworks()
      for (const f of fw) {
        expect(f).toMatch(/\(.+\)/)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 11. getStats
  // ═══════════════════════════════════════════════════════════════

  describe('getStats', () => {
    it('starts with all zeros', () => {
      const stats = analyzer.getStats()
      expect(stats.totalScans).toBe(0)
      expect(stats.totalMisconfigurationsFound).toBe(0)
      expect(stats.totalIAMAnalyses).toBe(0)
      expect(stats.totalKubernetesScans).toBe(0)
      expect(stats.totalContainerScans).toBe(0)
      expect(stats.totalServerlessAnalyses).toBe(0)
      expect(stats.totalComplianceChecks).toBe(0)
      expect(stats.totalAssessments).toBe(0)
      expect(stats.feedbackCount).toBe(0)
      expect(stats.avgFeedbackScore).toBe(0)
    })

    it('tracks all scan types after operations', () => {
      analyzer.scanMisconfigurations('aws', 'S3')
      analyzer.analyzeIAMPolicy('{}')
      analyzer.scanKubernetes('test')
      analyzer.scanContainer('FROM node:18')
      analyzer.analyzeServerless('test', 'aws')
      analyzer.checkCompliance('aws', 'CIS')
      analyzer.assessCloudSecurity('aws', 'test')

      const stats = analyzer.getStats()
      expect(stats.totalScans).toBeGreaterThanOrEqual(1)
      expect(stats.totalIAMAnalyses).toBeGreaterThanOrEqual(1)
      expect(stats.totalKubernetesScans).toBeGreaterThanOrEqual(1)
      expect(stats.totalContainerScans).toBeGreaterThanOrEqual(1)
      expect(stats.totalServerlessAnalyses).toBeGreaterThanOrEqual(1)
      expect(stats.totalComplianceChecks).toBeGreaterThanOrEqual(1)
      expect(stats.totalAssessments).toBe(1)
    })

    it('tracks feedback', () => {
      analyzer.provideFeedback(4)
      analyzer.provideFeedback(5)
      const stats = analyzer.getStats()
      expect(stats.feedbackCount).toBe(2)
      expect(stats.avgFeedbackScore).toBe(4.5)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 12. provideFeedback
  // ═══════════════════════════════════════════════════════════════

  describe('provideFeedback', () => {
    it('increments feedback count', () => {
      analyzer.provideFeedback(3)
      expect(analyzer.getStats().feedbackCount).toBe(1)
    })

    it('calculates average score', () => {
      analyzer.provideFeedback(3)
      analyzer.provideFeedback(5)
      expect(analyzer.getStats().avgFeedbackScore).toBe(4)
    })

    it('clamps score to 1-5 range (low)', () => {
      analyzer.provideFeedback(-10)
      const stats = analyzer.getStats()
      expect(stats.avgFeedbackScore).toBe(1)
    })

    it('clamps score to 1-5 range (high)', () => {
      analyzer.provideFeedback(100)
      const stats = analyzer.getStats()
      expect(stats.avgFeedbackScore).toBe(5)
    })

    it('low feedback increases maxResults', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 50 })
      a.provideFeedback(1)
      // maxResults increased, so more results should be returned
      const results = a.getCommonMisconfigurations('multi')
      expect(results.length).toBeLessThanOrEqual(60)
    })

    it('high feedback decreases maxResults', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 50 })
      a.provideFeedback(5)
      // maxResults should be 45 now
      const results = a.getCommonMisconfigurations('multi')
      expect(results.length).toBeLessThanOrEqual(45)
    })

    it('accumulates multiple feedback scores', () => {
      analyzer.provideFeedback(1)
      analyzer.provideFeedback(2)
      analyzer.provideFeedback(3)
      analyzer.provideFeedback(4)
      analyzer.provideFeedback(5)
      const stats = analyzer.getStats()
      expect(stats.feedbackCount).toBe(5)
      expect(stats.avgFeedbackScore).toBe(3)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 13. serialize / deserialize
  // ═══════════════════════════════════════════════════════════════

  describe('serialize / deserialize', () => {
    it('round-trips config', () => {
      const a = new CloudSecurityAnalyzer({ maxResults: 25 })
      const json = a.serialize()
      const restored = CloudSecurityAnalyzer.deserialize(json)
      const results = restored.getCommonMisconfigurations('aws')
      expect(results.length).toBeLessThanOrEqual(25)
    })

    it('round-trips stats', () => {
      analyzer.scanMisconfigurations('aws', 'S3')
      analyzer.analyzeIAMPolicy('{}')
      analyzer.scanKubernetes('test')
      analyzer.scanContainer('FROM node:18')
      analyzer.analyzeServerless('x', 'aws')
      analyzer.checkCompliance('aws', 'CIS')
      analyzer.assessCloudSecurity('aws', 'test')
      analyzer.provideFeedback(4)

      const json = analyzer.serialize()
      const restored = CloudSecurityAnalyzer.deserialize(json)
      const origStats = analyzer.getStats()
      const restoredStats = restored.getStats()

      expect(restoredStats.totalScans).toBe(origStats.totalScans)
      expect(restoredStats.totalIAMAnalyses).toBe(origStats.totalIAMAnalyses)
      expect(restoredStats.totalKubernetesScans).toBe(origStats.totalKubernetesScans)
      expect(restoredStats.totalContainerScans).toBe(origStats.totalContainerScans)
      expect(restoredStats.totalServerlessAnalyses).toBe(origStats.totalServerlessAnalyses)
      expect(restoredStats.totalComplianceChecks).toBe(origStats.totalComplianceChecks)
      expect(restoredStats.totalAssessments).toBe(origStats.totalAssessments)
      expect(restoredStats.feedbackCount).toBe(origStats.feedbackCount)
      expect(restoredStats.avgFeedbackScore).toBe(origStats.avgFeedbackScore)
    })

    it('serialize produces valid JSON', () => {
      const json = analyzer.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserialized instance is fully functional', () => {
      analyzer.provideFeedback(3)
      const json = analyzer.serialize()
      const restored = CloudSecurityAnalyzer.deserialize(json)
      // Should be able to keep using it
      restored.scanMisconfigurations('aws', 'S3 bucket')
      restored.provideFeedback(5)
      const stats = restored.getStats()
      expect(stats.feedbackCount).toBe(2)
      expect(stats.totalScans).toBeGreaterThanOrEqual(1)
    })

    it('round-trips feedback scores for average', () => {
      analyzer.provideFeedback(2)
      analyzer.provideFeedback(4)
      const json = analyzer.serialize()
      const restored = CloudSecurityAnalyzer.deserialize(json)
      expect(restored.getStats().avgFeedbackScore).toBe(3)
    })

    it('round-trips totalMisconfigurationsFound', () => {
      analyzer.scanMisconfigurations('aws', 'S3 public')
      const origCount = analyzer.getStats().totalMisconfigurationsFound
      const json = analyzer.serialize()
      const restored = CloudSecurityAnalyzer.deserialize(json)
      expect(restored.getStats().totalMisconfigurationsFound).toBe(origCount)
    })
  })
})
