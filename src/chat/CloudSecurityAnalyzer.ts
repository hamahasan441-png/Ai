/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          ☁️  C L O U D   S E C U R I T Y   A N A L Y Z E R                  ║
 * ║                                                                             ║
 * ║   Cloud-native security analysis engine:                                    ║
 * ║     detect → analyze → remediate → comply                                   ║
 * ║                                                                             ║
 * ║     • Multi-cloud misconfiguration detection (AWS, Azure, GCP)              ║
 * ║     • IAM policy analysis with over-privilege detection                     ║
 * ║     • Kubernetes manifest and container security scanning                   ║
 * ║     • Serverless function risk assessment                                   ║
 * ║     • Compliance framework mapping (CIS, SOC2, PCI, HIPAA, NIST, ISO)      ║
 * ║     • Holistic cloud security posture assessment                            ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Helpers ──────────────────────────────────────────────────────

function round2(n: number): number { return Math.round(n * 100) / 100 }
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)) }
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s\-_./,;:()[\]{}]+/).filter(Boolean)
}
function matchScore(tokens: string[], keywords: string[]): number {
  let score = 0
  for (const kw of keywords) {
    for (const token of tokens) {
      if (token === kw) score += 2
      else if (token.includes(kw) || kw.includes(token)) score += 1
    }
  }
  return score
}

// ── Types ────────────────────────────────────────────────────────

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'multi'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface CloudSecurityConfig {
  maxResults: number
  enableIAMAnalysis: boolean
  enableKubernetesScanning: boolean
  enableContainerScanning: boolean
  enableServerlessAnalysis: boolean
  enableComplianceChecks: boolean
  defaultProvider: CloudProvider
  severityThreshold: Severity
  complianceFrameworks: string[]
}

export interface CloudSecurityStats {
  totalScans: number
  totalMisconfigurationsFound: number
  totalIAMAnalyses: number
  totalKubernetesScans: number
  totalContainerScans: number
  totalServerlessAnalyses: number
  totalComplianceChecks: number
  totalAssessments: number
  feedbackCount: number
  avgFeedbackScore: number
}

export interface CloudMisconfiguration {
  id: string
  provider: CloudProvider
  service: string
  severity: Severity
  title: string
  description: string
  impact: string
  remediation: string
  compliance: string[]
  cweId?: string
}

export interface IAMPolicyAnalysis {
  overprivileged: boolean
  wildcardActions: string[]
  crossAccountAccess: boolean
  noMFA: boolean
  recommendations: string[]
  riskScore: number
}

export interface KubernetesSecurityIssue {
  id: string
  severity: Severity
  category: string
  resource: string
  description: string
  impact: string
  remediation: string
  cisControl?: string
}

export interface ContainerSecurityFinding {
  id: string
  severity: Severity
  imageVulnerabilities: number
  runAsRoot: boolean
  capabilities: string[]
  readOnlyRootfs: boolean
  recommendations: string[]
}

export interface ServerlessRisk {
  id: string
  provider: CloudProvider
  functionName: string
  runtime: string
  risks: string[]
  eventSourceRisks: string[]
  recommendations: string[]
  riskScore: number
}

export interface ComplianceControl {
  id: string
  title: string
  description: string
  cloudMapping: Record<CloudProvider, string[]>
}

export interface ComplianceFramework {
  name: string
  version: string
  controls: ComplianceControl[]
}

export interface CloudSecurityAssessment {
  provider: CloudProvider
  score: number
  misconfigurations: CloudMisconfiguration[]
  iamIssues: IAMPolicyAnalysis
  kubernetesIssues: KubernetesSecurityIssue[]
  containerIssues: ContainerSecurityFinding[]
  serverlessRisks: ServerlessRisk[]
  complianceStatus: Record<string, number>
  recommendations: string[]
}

// ── Default Config ───────────────────────────────────────────────

export const DEFAULT_CLOUD_SECURITY_CONFIG: CloudSecurityConfig = {
  maxResults: 50,
  enableIAMAnalysis: true,
  enableKubernetesScanning: true,
  enableContainerScanning: true,
  enableServerlessAnalysis: true,
  enableComplianceChecks: true,
  defaultProvider: 'aws',
  severityThreshold: 'low',
  complianceFrameworks: ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA', 'NIST-800-53', 'ISO-27001'],
}

// ── Severity Utilities ───────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
}

function severityAtOrAbove(sev: Severity, threshold: Severity): boolean {
  return SEVERITY_ORDER[sev] >= SEVERITY_ORDER[threshold]
}

// ── AWS Misconfiguration Database ────────────────────────────────

function buildAWSMisconfigurations(): CloudMisconfiguration[] {
  const items: CloudMisconfiguration[] = []

  const add = (
    id: string, service: string, severity: Severity, title: string,
    description: string, impact: string, remediation: string,
    compliance: string[], cweId?: string,
  ) => {
    items.push({ id, provider: 'aws', service, severity, title, description, impact, remediation, compliance, cweId })
  }

  add(
    'AWS-S3-001', 'S3', 'critical',
    'S3 Bucket Public Access Enabled',
    'S3 bucket has public access enabled via ACL or bucket policy, allowing unrestricted read/write access to objects.',
    'Sensitive data exposure, data exfiltration, unauthorized modification of bucket contents, potential regulatory violations.',
    'Enable S3 Block Public Access at account and bucket level. Review and restrict bucket policies. Use aws s3api put-public-access-block.',
    ['CIS AWS 2.1.5', 'SOC2 CC6.1', 'PCI-DSS 1.3', 'NIST AC-3', 'HIPAA 164.312(a)(1)'],
    'CWE-284',
  )

  add(
    'AWS-SG-001', 'EC2', 'high',
    'Security Group Allows Unrestricted Inbound Access',
    'Security group has inbound rules allowing traffic from 0.0.0.0/0 or ::/0 on sensitive ports (SSH 22, RDP 3389, DB ports).',
    'Unauthorized access to instances, brute force attacks, lateral movement, data breaches via exposed services.',
    'Restrict inbound rules to specific CIDR ranges. Use VPN or bastion hosts for administrative access. Implement AWS Systems Manager Session Manager.',
    ['CIS AWS 5.2', 'SOC2 CC6.6', 'PCI-DSS 1.2.1', 'NIST AC-4', 'HIPAA 164.312(e)(1)'],
    'CWE-284',
  )

  add(
    'AWS-EBS-001', 'EBS', 'high',
    'Unencrypted EBS Volumes',
    'EBS volumes are not encrypted at rest using AWS KMS, leaving data vulnerable if physical storage is compromised.',
    'Data exposure in case of physical media theft or unauthorized snapshot access. Non-compliance with data-at-rest encryption requirements.',
    'Enable EBS encryption by default in account settings. Use aws ec2 enable-ebs-encryption-by-default. Encrypt existing volumes via snapshot-copy approach.',
    ['CIS AWS 2.2.1', 'SOC2 CC6.7', 'PCI-DSS 3.4', 'NIST SC-28', 'HIPAA 164.312(a)(2)(iv)'],
    'CWE-311',
  )

  add(
    'AWS-RDS-001', 'RDS', 'high',
    'Unencrypted RDS Instances',
    'RDS database instances are running without storage encryption enabled, exposing data at rest.',
    'Database contents exposed if underlying storage is accessed. Regulatory non-compliance for sensitive data handling.',
    'Enable encryption when creating RDS instances (cannot be changed post-creation). Migrate data to encrypted instances using snapshots.',
    ['CIS AWS 2.3.1', 'SOC2 CC6.7', 'PCI-DSS 3.4', 'NIST SC-28', 'HIPAA 164.312(a)(2)(iv)'],
    'CWE-311',
  )

  add(
    'AWS-IAM-001', 'IAM', 'critical',
    'IAM Policy With Wildcard Actions',
    'IAM policy grants Action: "*" (all actions) combined with Resource: "*" (all resources), providing unrestricted access.',
    'Full account compromise, privilege escalation, data exfiltration, resource manipulation, inability to enforce least privilege.',
    'Replace wildcard policies with specific action/resource pairs. Use AWS IAM Access Analyzer. Implement service control policies (SCPs) as guardrails.',
    ['CIS AWS 1.16', 'SOC2 CC6.3', 'PCI-DSS 7.1', 'NIST AC-6', 'HIPAA 164.312(a)(1)'],
    'CWE-250',
  )

  add(
    'AWS-CT-001', 'CloudTrail', 'critical',
    'CloudTrail Logging Disabled',
    'AWS CloudTrail is not enabled for all regions, resulting in incomplete audit trail of API activity.',
    'Inability to detect security incidents, forensic investigation gaps, compliance audit failures, undetected unauthorized activity.',
    'Enable CloudTrail in all regions with multi-region trail. Configure log file validation and S3 bucket logging. Integrate with CloudWatch Logs.',
    ['CIS AWS 3.1', 'SOC2 CC7.2', 'PCI-DSS 10.1', 'NIST AU-2', 'HIPAA 164.312(b)'],
    'CWE-778',
  )

  add(
    'AWS-IAM-002', 'IAM', 'critical',
    'Root Account Without MFA',
    'The AWS root account does not have multi-factor authentication enabled, relying solely on password-based authentication.',
    'Complete account takeover via credential compromise, unrestricted access to all services and billing, irrecoverable damage potential.',
    'Enable hardware MFA on root account immediately. Use IAM users for daily operations. Store root credentials in secure vault with break-glass procedure.',
    ['CIS AWS 1.5', 'SOC2 CC6.1', 'PCI-DSS 8.3', 'NIST IA-2', 'HIPAA 164.312(d)'],
    'CWE-308',
  )

  add(
    'AWS-VPC-001', 'VPC', 'medium',
    'VPC Flow Logs Not Enabled',
    'VPC Flow Logs are not enabled, preventing network traffic monitoring and analysis for the virtual private cloud.',
    'Unable to detect network anomalies, lateral movement, data exfiltration attempts, or unauthorized access patterns.',
    'Enable VPC Flow Logs for all VPCs. Configure delivery to CloudWatch Logs or S3. Set appropriate retention periods and analysis tooling.',
    ['CIS AWS 3.9', 'SOC2 CC7.2', 'PCI-DSS 10.2', 'NIST SI-4', 'HIPAA 164.312(b)'],
    'CWE-778',
  )

  add(
    'AWS-VPC-002', 'VPC', 'medium',
    'Default VPC In Use',
    'Resources are deployed in the default VPC which has overly permissive networking defaults including public subnets and internet gateways.',
    'Unintended public exposure of resources, inadequate network segmentation, difficulty enforcing network security policies.',
    'Create custom VPCs with appropriate subnet design. Migrate resources from default VPC. Delete default VPC or restrict its security group rules.',
    ['CIS AWS 5.4', 'SOC2 CC6.6', 'PCI-DSS 1.1', 'NIST SC-7'],
    'CWE-1188',
  )

  return items
}

// ── Azure Misconfiguration Database ──────────────────────────────

function buildAzureMisconfigurations(): CloudMisconfiguration[] {
  const items: CloudMisconfiguration[] = []

  const add = (
    id: string, service: string, severity: Severity, title: string,
    description: string, impact: string, remediation: string,
    compliance: string[], cweId?: string,
  ) => {
    items.push({ id, provider: 'azure', service, severity, title, description, impact, remediation, compliance, cweId })
  }

  add(
    'AZ-NSG-001', 'Network', 'high',
    'NSG Rule Allows Any Source',
    'Network Security Group contains a rule with source address prefix set to "*" or "0.0.0.0/0" allowing unrestricted inbound traffic.',
    'Unauthorized access to virtual machines and services, potential for brute force and exploitation of exposed services.',
    'Restrict NSG rules to specific IP ranges or service tags. Use Azure Bastion for administrative access. Implement Just-In-Time VM access.',
    ['CIS Azure 6.1', 'SOC2 CC6.6', 'PCI-DSS 1.2.1', 'NIST AC-4'],
    'CWE-284',
  )

  add(
    'AZ-STOR-001', 'Storage', 'critical',
    'Storage Account Allows Anonymous Access',
    'Azure Storage account is configured to allow anonymous/public read access to containers and blobs.',
    'Sensitive data exposure, data exfiltration without authentication, regulatory violations for data handling.',
    'Disable anonymous access on all storage accounts. Use SAS tokens or Azure AD authentication for access control. Enable "Secure transfer required".',
    ['CIS Azure 3.7', 'SOC2 CC6.1', 'PCI-DSS 1.3', 'HIPAA 164.312(a)(1)'],
    'CWE-284',
  )

  add(
    'AZ-SQL-001', 'SQL Database', 'high',
    'Azure SQL Auditing Disabled',
    'Azure SQL Database does not have auditing enabled, resulting in no tracking of database events and activities.',
    'Inability to detect unauthorized access, compliance audit failures, missing forensic trail for security incidents.',
    'Enable auditing for all Azure SQL databases. Configure audit log retention to at least 90 days. Route logs to Log Analytics workspace.',
    ['CIS Azure 4.1.1', 'SOC2 CC7.2', 'PCI-DSS 10.1', 'NIST AU-2', 'HIPAA 164.312(b)'],
    'CWE-778',
  )

  add(
    'AZ-AKS-001', 'AKS', 'high',
    'AKS Cluster Without RBAC',
    'Azure Kubernetes Service cluster is deployed without Role-Based Access Control enabled, allowing any authenticated user full cluster access.',
    'Unauthorized access to cluster resources, privilege escalation, deployment of malicious workloads, data access across namespaces.',
    'Enable RBAC during AKS cluster creation (cannot be enabled post-creation). Integrate with Azure AD for authentication. Define granular ClusterRoles.',
    ['CIS Azure 8.5', 'SOC2 CC6.3', 'PCI-DSS 7.1', 'NIST AC-3'],
    'CWE-284',
  )

  add(
    'AZ-KV-001', 'Key Vault', 'medium',
    'Key Vault Soft Delete Disabled',
    'Azure Key Vault does not have soft delete enabled, meaning deleted secrets/keys/certificates are permanently lost.',
    'Irrecoverable data loss from accidental or malicious deletion of cryptographic keys and secrets. Service disruptions.',
    'Enable soft delete and purge protection on all Key Vaults. This is now enabled by default for new vaults but must be verified for existing ones.',
    ['CIS Azure 8.4', 'SOC2 CC6.7', 'PCI-DSS 3.6', 'NIST SC-12'],
    'CWE-404',
  )

  add(
    'AZ-MON-001', 'Monitor', 'medium',
    'Activity Log Retention Below 365 Days',
    'Azure Activity Log retention is configured for less than 365 days, potentially losing historical audit data.',
    'Incomplete audit trail for security investigations, inability to meet regulatory retention requirements.',
    'Configure Activity Log to export to a Storage Account or Log Analytics workspace with retention of at least 365 days.',
    ['CIS Azure 5.1.2', 'SOC2 CC7.2', 'PCI-DSS 10.7', 'NIST AU-11'],
    'CWE-778',
  )

  return items
}

// ── GCP Misconfiguration Database ────────────────────────────────

function buildGCPMisconfigurations(): CloudMisconfiguration[] {
  const items: CloudMisconfiguration[] = []

  const add = (
    id: string, service: string, severity: Severity, title: string,
    description: string, impact: string, remediation: string,
    compliance: string[], cweId?: string,
  ) => {
    items.push({ id, provider: 'gcp', service, severity, title, description, impact, remediation, compliance, cweId })
  }

  add(
    'GCP-GCS-001', 'Cloud Storage', 'high',
    'Uniform Bucket-Level Access Not Enabled',
    'GCP Cloud Storage bucket does not enforce uniform bucket-level access, allowing legacy ACLs that can create inconsistent permissions.',
    'Permission bypass through object-level ACLs, difficulty auditing access, inconsistent security posture across objects.',
    'Enable uniform bucket-level access on all buckets. Migrate from ACLs to IAM policies. Use gcloud storage buckets update --uniform-bucket-level-access.',
    ['CIS GCP 5.2', 'SOC2 CC6.1', 'PCI-DSS 7.1', 'NIST AC-3'],
    'CWE-284',
  )

  add(
    'GCP-CE-001', 'Compute Engine', 'high',
    'Compute Instance Using Default Service Account',
    'Compute Engine instance is running with the default service account which has Editor role on the project by default.',
    'Over-privileged instance allowing lateral movement, resource manipulation, and data access if the instance is compromised.',
    'Create custom service accounts with minimal required permissions. Remove default SA Editor role. Use Workload Identity for GKE workloads.',
    ['CIS GCP 4.1', 'SOC2 CC6.3', 'PCI-DSS 7.1', 'NIST AC-6'],
    'CWE-250',
  )

  add(
    'GCP-SQL-001', 'Cloud SQL', 'critical',
    'Cloud SQL Instance With Public IP',
    'Cloud SQL database instance is configured with a public IP address, making it potentially accessible from the internet.',
    'Database exposure to internet-based attacks, SQL injection exploitation, brute force authentication attacks, data exfiltration.',
    'Use private IP only for Cloud SQL instances. Configure Cloud SQL Proxy for secure access. Use authorized networks sparingly with specific IPs.',
    ['CIS GCP 6.5', 'SOC2 CC6.6', 'PCI-DSS 1.3.6', 'NIST SC-7', 'HIPAA 164.312(e)(1)'],
    'CWE-284',
  )

  add(
    'GCP-FW-001', 'VPC Network', 'critical',
    'VPC Firewall Rule Allows All Traffic',
    'VPC firewall rule is configured with source range 0.0.0.0/0 and allows all protocols/ports, providing unrestricted ingress.',
    'Complete network exposure, unauthorized access to all services, lateral movement enabled across the VPC.',
    'Replace overly permissive rules with specific protocol/port and source range combinations. Use firewall tags and service accounts for targeting.',
    ['CIS GCP 3.6', 'SOC2 CC6.6', 'PCI-DSS 1.2.1', 'NIST AC-4'],
    'CWE-284',
  )

  add(
    'GCP-KMS-001', 'Cloud KMS', 'medium',
    'Cloud KMS Key Rotation Period Exceeds 90 Days',
    'Cloud KMS encryption keys have rotation period configured beyond 90 days or automatic rotation is not enabled.',
    'Extended cryptographic key exposure window, increased risk of key compromise, non-compliance with key management policies.',
    'Configure automatic key rotation with period not exceeding 90 days. Use gcloud kms keys update with --rotation-period flag.',
    ['CIS GCP 1.10', 'SOC2 CC6.7', 'PCI-DSS 3.6', 'NIST SC-12'],
    'CWE-320',
  )

  return items
}

// ── Kubernetes Security Issue Database ───────────────────────────

function buildKubernetesIssues(): KubernetesSecurityIssue[] {
  const items: KubernetesSecurityIssue[] = []

  const add = (
    id: string, severity: Severity, category: string, resource: string,
    description: string, impact: string, remediation: string, cisControl?: string,
  ) => {
    items.push({ id, severity, category, resource, description, impact, remediation, cisControl })
  }

  add(
    'K8S-POD-001', 'critical', 'Pod Security', 'Pod',
    'Pod running with privileged: true in securityContext, granting full host access to the container.',
    'Container escape to host, access to all host devices and filesystems, complete node compromise, lateral movement across cluster.',
    'Remove privileged: true from pod spec. Use specific capabilities instead. Enforce with PodSecurity admission controller or OPA Gatekeeper.',
    'CIS Kubernetes 5.2.1',
  )

  add(
    'K8S-NET-001', 'high', 'Network Security', 'Pod',
    'Pod configured with hostNetwork: true, sharing the host network namespace.',
    'Pod can sniff host network traffic, access host-bound services on localhost, bypass network policies, impersonate host identity.',
    'Remove hostNetwork: true unless absolutely required (e.g., CNI plugins). Use Services and Ingress for external connectivity.',
    'CIS Kubernetes 5.2.4',
  )

  add(
    'K8S-SEC-001', 'high', 'Pod Security', 'Pod',
    'Pod missing securityContext configuration, running with default (often excessive) privileges.',
    'Container may run as root, have unnecessary capabilities, write to filesystem, leading to potential container breakout.',
    'Set securityContext with runAsNonRoot: true, readOnlyRootFilesystem: true, allowPrivilegeEscalation: false, drop ALL capabilities.',
    'CIS Kubernetes 5.2.6',
  )

  add(
    'K8S-RBAC-001', 'critical', 'Access Control', 'ClusterRoleBinding',
    'ClusterRoleBinding grants cluster-admin role to a service account, user, or group beyond system components.',
    'Full cluster administrative access, ability to read all secrets, modify any resource, create backdoor access, delete workloads.',
    'Remove unnecessary cluster-admin bindings. Create scoped ClusterRoles with minimum required permissions. Use namespace-scoped RoleBindings.',
    'CIS Kubernetes 5.1.1',
  )

  add(
    'K8S-NET-002', 'high', 'Network Security', 'Namespace',
    'Namespace has no NetworkPolicy resources defined, allowing unrestricted pod-to-pod communication.',
    'Lateral movement between pods, unauthorized access to backend services, data exfiltration across namespaces.',
    'Implement default-deny NetworkPolicy in each namespace. Add explicit allow rules for required communication paths. Use Calico or Cilium for advanced policies.',
    'CIS Kubernetes 5.3.2',
  )

  add(
    'K8S-HELM-001', 'critical', 'Cluster Security', 'Deployment',
    'Tiller (Helm v2 server component) is deployed in the cluster with cluster-admin privileges.',
    'Any user with access to Tiller can perform any cluster operation, complete RBAC bypass, arbitrary resource manipulation.',
    'Upgrade to Helm v3 which removes Tiller entirely. If stuck on v2, configure Tiller with RBAC-restricted service account and TLS authentication.',
    'CIS Kubernetes 5.1.2',
  )

  add(
    'K8S-SEC-002', 'medium', 'Secret Management', 'Pod',
    'Kubernetes Secrets are passed to containers via environment variables instead of mounted volumes.',
    'Secrets visible in process listings, container inspection, crash dumps, and logs. Higher risk of accidental exposure.',
    'Mount secrets as volumes instead of environment variables. Use external secret managers (Vault, AWS Secrets Manager). Enable encryption at rest for etcd.',
    'CIS Kubernetes 5.4.1',
  )

  add(
    'K8S-RES-001', 'medium', 'Resource Management', 'Pod',
    'Pod spec does not define resource requests and limits for CPU and memory.',
    'Resource starvation attacks (noisy neighbor), pod eviction unpredictability, inability to schedule efficiently, potential node OOM.',
    'Set both requests and limits for CPU and memory on all containers. Use LimitRange to enforce defaults. Implement ResourceQuota per namespace.',
    'CIS Kubernetes 5.2.7',
  )

  add(
    'K8S-PSP-001', 'high', 'Cluster Security', 'Cluster',
    'No PodSecurity admission (PodSecurityPolicy, PodSecurity Standards, or OPA/Kyverno policies) is enforced.',
    'Pods can run with any security context, privileged containers allowed, host namespaces accessible, no security baseline enforcement.',
    'Enable PodSecurity admission controller with "restricted" or "baseline" profile. Migrate from deprecated PSP to Pod Security Standards or OPA Gatekeeper.',
    'CIS Kubernetes 5.2.2',
  )

  add(
    'K8S-MOUNT-001', 'critical', 'Container Security', 'Pod',
    'Pod mounts the Docker socket (/var/run/docker.sock) from the host, enabling container escape.',
    'Container can create new privileged containers on the host, access other containers, execute commands on the host, full node compromise.',
    'Remove Docker socket mounts. Use container-native build tools (Kaniko, Buildah). If required, use a dedicated build node with strict access controls.',
    'CIS Kubernetes 5.2.5',
  )

  return items
}

// ── Container Security Database ──────────────────────────────────

function buildContainerFindings(): ContainerSecurityFinding[] {
  const items: ContainerSecurityFinding[] = []

  items.push({
    id: 'CTR-IMG-001', severity: 'high', imageVulnerabilities: 0,
    runAsRoot: false, capabilities: [], readOnlyRootfs: true,
    recommendations: [
      'Use specific image tags instead of :latest. Pin by SHA256 digest for reproducibility.',
      'Regularly scan base images for known vulnerabilities.',
      'Use minimal base images (distroless, Alpine, scratch) to reduce attack surface.',
    ],
  })

  items.push({
    id: 'CTR-ROOT-001', severity: 'critical', imageVulnerabilities: 0,
    runAsRoot: true, capabilities: ['ALL'], readOnlyRootfs: false,
    recommendations: [
      'Add USER directive to run as non-root: RUN adduser -D appuser && USER appuser.',
      'Drop all capabilities and add only required ones.',
      'Set readOnlyRootFilesystem: true in securityContext.',
    ],
  })

  items.push({
    id: 'CTR-SEC-001', severity: 'critical', imageVulnerabilities: 0,
    runAsRoot: false, capabilities: [], readOnlyRootfs: true,
    recommendations: [
      'Never embed secrets, API keys, or credentials in Dockerfile.',
      'Use multi-stage builds and BuildKit --secret flag for build-time secrets.',
      'Mount secrets at runtime via orchestrator secret management.',
    ],
  })

  items.push({
    id: 'CTR-CAP-001', severity: 'high', imageVulnerabilities: 0,
    runAsRoot: false, capabilities: ['NET_ADMIN', 'SYS_ADMIN', 'SYS_PTRACE'], readOnlyRootfs: true,
    recommendations: [
      'Drop ALL capabilities and add back only those explicitly required.',
      'Avoid SYS_ADMIN, NET_ADMIN, SYS_PTRACE unless absolutely necessary.',
      'Use AppArmor or seccomp profiles for additional syscall filtering.',
    ],
  })

  items.push({
    id: 'CTR-HEALTH-001', severity: 'medium', imageVulnerabilities: 0,
    runAsRoot: false, capabilities: [], readOnlyRootfs: true,
    recommendations: [
      'Add HEALTHCHECK instruction to Dockerfile.',
      'Define liveness and readiness probes in Kubernetes manifests.',
      'Ensure health checks verify application functionality, not just process existence.',
    ],
  })

  return items
}

// ── Serverless Risk Database ─────────────────────────────────────

function buildServerlessRisks(): ServerlessRisk[] {
  const items: ServerlessRisk[] = []

  items.push({
    id: 'SLS-PERM-001', provider: 'aws', functionName: 'generic-lambda', runtime: 'nodejs18.x',
    risks: [
      'Function execution role has AdministratorAccess or overly broad permissions.',
      'Compromised function gains excessive blast radius across account resources.',
    ],
    eventSourceRisks: [
      'API Gateway endpoint with no authentication or authorization.',
      'S3 event trigger without prefix/suffix filtering processes all objects.',
    ],
    recommendations: [
      'Apply least-privilege permissions. Use per-function IAM roles.',
      'Scope resource ARNs in IAM policies to specific resources.',
      'Enable API Gateway authentication (IAM, Cognito, or Lambda Authorizer).',
    ],
    riskScore: 8.5,
  })

  items.push({
    id: 'SLS-ENV-001', provider: 'aws', functionName: 'generic-lambda', runtime: 'python3.11',
    risks: [
      'Secrets and API keys stored in plaintext environment variables.',
      'Environment variables visible in Lambda console and API responses.',
    ],
    eventSourceRisks: ['Logging of full event payloads may capture sensitive data.'],
    recommendations: [
      'Use AWS Secrets Manager or SSM Parameter Store for sensitive values.',
      'Enable Lambda environment variable encryption with KMS.',
      'Retrieve secrets at runtime. Implement secret rotation for all credentials.',
    ],
    riskScore: 7.0,
  })

  items.push({
    id: 'SLS-TIMEOUT-001', provider: 'aws', functionName: 'generic-lambda', runtime: 'nodejs18.x',
    risks: [
      'Function timeout set to maximum (15 minutes) without justification.',
      'No concurrency limits set, allowing resource exhaustion attacks.',
    ],
    eventSourceRisks: ['Public-facing trigger allows unlimited invocations.'],
    recommendations: [
      'Set function timeout to minimum required duration.',
      'Configure reserved concurrency limits and API Gateway throttling.',
      'Use Step Functions for long-running workflows instead.',
    ],
    riskScore: 5.5,
  })

  items.push({
    id: 'SLS-API-001', provider: 'aws', functionName: 'api-handler', runtime: 'nodejs18.x',
    risks: [
      'Public API Gateway endpoint with no authentication mechanism.',
      'No request validation or input sanitization. Wildcard CORS origin.',
    ],
    eventSourceRisks: [
      'Direct invocation of Lambda without authorization checks.',
      'Missing WAF integration for API Gateway.',
    ],
    recommendations: [
      'Implement authentication using Cognito, IAM, or custom authorizer.',
      'Enable request validation. Restrict CORS to trusted origins.',
      'Attach AWS WAF to API Gateway for additional protection.',
    ],
    riskScore: 8.0,
  })

  items.push({
    id: 'SLS-DLQ-001', provider: 'aws', functionName: 'event-processor', runtime: 'python3.11',
    risks: [
      'No Dead Letter Queue (DLQ) configured for async invocations.',
      'Failed events are silently dropped after retry exhaustion.',
    ],
    eventSourceRisks: [
      'SQS trigger without DLQ loses messages on processing failure.',
      'Event source mapping without bisect-on-error fails entire batch.',
    ],
    recommendations: [
      'Configure DLQ (SQS or SNS) for all async Lambda functions.',
      'Set up Lambda Destinations for failure handling.',
      'Enable bisect-on-function-error for batch event sources.',
    ],
    riskScore: 6.0,
  })

  return items
}

// ── IAM Risk Patterns ────────────────────────────────────────────

interface IAMRiskPattern {
  id: string
  pattern: string
  severity: Severity
  description: string
  recommendation: string
}

function buildIAMRiskPatterns(): IAMRiskPattern[] {
  const items: IAMRiskPattern[] = []

  const add = (id: string, pattern: string, severity: Severity, description: string, recommendation: string) => {
    items.push({ id, pattern, severity, description, recommendation })
  }

  add(
    'IAM-WILD-001', '*', 'critical',
    'Wildcard action (Action: "*") grants access to all API operations across all services.',
    'Replace with specific action names. Use AWS IAM Access Analyzer to determine required permissions.',
  )
  add(
    'IAM-WILD-002', ':*', 'high',
    'Service-level wildcard (e.g., s3:*) grants all actions within a service.',
    'Scope actions to specific operations (e.g., s3:GetObject, s3:PutObject) based on actual requirements.',
  )
  add(
    'IAM-CROSS-001', 'arn:aws:iam::', 'high',
    'Cross-account access via trust policy allows external AWS accounts to assume roles.',
    'Verify all trusted accounts. Add ExternalId condition. Limit assumed role permissions with session policies.',
  )
  add(
    'IAM-ASSUME-001', 'sts:AssumeRole', 'medium',
    'AssumeRole chains can create transitive trust paths through multiple accounts.',
    'Map all assume-role chains. Limit chain depth. Use confused deputy prevention with ExternalId conditions.',
  )
  add(
    'IAM-COND-001', 'Condition', 'medium',
    'IAM policy lacks condition keys to restrict when and how permissions are granted.',
    'Add conditions: aws:SourceIp, aws:MultiFactorAuthPresent, aws:PrincipalOrgID, aws:RequestedRegion.',
  )
  add(
    'IAM-MFA-001', 'MultiFactorAuthPresent', 'high',
    'IAM policy does not require MFA for sensitive operations.',
    'Add Condition: { Bool: { "aws:MultiFactorAuthPresent": "true" } } for privilege-escalation-capable actions.',
  )
  add(
    'IAM-RESOURCE-001', 'Resource', 'high',
    'IAM policy uses Resource: "*" allowing actions on all resources of the specified type.',
    'Scope Resource to specific ARNs. Use resource-based policies where applicable. Tag resources for ABAC.',
  )
  add(
    'IAM-ADMIN-001', 'AdministratorAccess', 'critical',
    'AWS managed AdministratorAccess policy attached, granting full unrestricted access.',
    'Remove AdministratorAccess. Create custom policies with only required permissions. Use permission boundaries.',
  )

  return items
}

// ── Compliance Framework Database ────────────────────────────────

function buildComplianceFrameworks(): ComplianceFramework[] {
  const frameworks: ComplianceFramework[] = []

  // ── CIS Benchmarks ──
  frameworks.push({
    name: 'CIS',
    version: '2.0',
    controls: [
      {
        id: 'CIS-1.1',
        title: 'Avoid the use of the root account',
        description: 'The root account has unrestricted access. Avoid using it for daily operations and enable MFA.',
        cloudMapping: {
          aws: ['IAM root user usage', 'Root MFA status'], azure: ['Global Administrator usage', 'Emergency access accounts'],
          gcp: ['Organization admin usage', 'Super admin activity'], multi: ['Privileged account monitoring'],
        },
      },
      {
        id: 'CIS-1.2',
        title: 'Ensure MFA is enabled for all IAM users',
        description: 'Multi-factor authentication adds a layer of protection beyond passwords for console access.',
        cloudMapping: {
          aws: ['IAM user MFA status', 'Virtual MFA configuration'], azure: ['Azure AD MFA registration', 'Conditional Access MFA policies'],
          gcp: ['2-Step Verification enforcement', 'Security key usage'], multi: ['MFA adoption rate'],
        },
      },
      {
        id: 'CIS-1.3',
        title: 'Ensure credentials unused for 90 days are disabled',
        description: 'Inactive credentials increase the risk of unauthorized access through stale accounts.',
        cloudMapping: {
          aws: ['IAM credential report', 'Access key last used'], azure: ['Azure AD sign-in logs', 'Inactive user detection'],
          gcp: ['Policy Analyzer', 'Service account key usage'], multi: ['Credential lifecycle management'],
        },
      },
      {
        id: 'CIS-2.1',
        title: 'Ensure encryption at rest is enabled',
        description: 'All storage services should encrypt data at rest using platform or customer-managed keys.',
        cloudMapping: {
          aws: ['S3 default encryption', 'EBS encryption', 'RDS encryption'], azure: ['Storage Service Encryption', 'Disk encryption', 'SQL TDE'],
          gcp: ['Default encryption', 'CMEK configuration', 'Cloud SQL encryption'], multi: ['Encryption at rest inventory'],
        },
      },
      {
        id: 'CIS-3.1',
        title: 'Ensure audit logging is enabled',
        description: 'Enable comprehensive logging of API calls, data access, and administrative actions.',
        cloudMapping: {
          aws: ['CloudTrail multi-region', 'S3 access logging', 'VPC Flow Logs'], azure: ['Activity Log', 'Diagnostic settings', 'NSG Flow Logs'],
          gcp: ['Cloud Audit Logs', 'VPC Flow Logs', 'Data Access logs'], multi: ['Centralized logging architecture'],
        },
      },
    ],
  })

  // ── SOC2 ──
  frameworks.push({
    name: 'SOC2',
    version: '2017',
    controls: [
      {
        id: 'SOC2-CC6.1',
        title: 'Logical and Physical Access Controls',
        description: 'Implement logical access security measures to protect against unauthorized access to information assets.',
        cloudMapping: {
          aws: ['IAM policies', 'Security Groups', 'S3 bucket policies'], azure: ['Azure AD', 'NSGs', 'RBAC assignments'],
          gcp: ['IAM policies', 'VPC firewall rules', 'Organization policies'], multi: ['Identity governance', 'Access reviews'],
        },
      },
      {
        id: 'SOC2-CC6.3',
        title: 'Role-Based Access and Least Privilege',
        description: 'Implement role-based access and enforce least privilege across all cloud services.',
        cloudMapping: {
          aws: ['IAM roles', 'Permission boundaries', 'SCPs'], azure: ['Azure RBAC', 'PIM', 'Conditional Access'],
          gcp: ['IAM roles', 'Organization policies', 'Workload Identity'], multi: ['Privilege access management'],
        },
      },
      {
        id: 'SOC2-CC6.6',
        title: 'System Boundary Protection',
        description: 'Implement measures to restrict access at system boundaries including network perimeters.',
        cloudMapping: {
          aws: ['VPC design', 'WAF', 'CloudFront', 'Shield'], azure: ['Virtual Network', 'Azure Firewall', 'Front Door', 'DDoS Protection'],
          gcp: ['VPC Network', 'Cloud Armor', 'Cloud CDN', 'Cloud Load Balancing'], multi: ['Perimeter security architecture'],
        },
      },
      {
        id: 'SOC2-CC6.7',
        title: 'Data Encryption',
        description: 'Encrypt data at rest and in transit to protect against unauthorized disclosure.',
        cloudMapping: {
          aws: ['KMS', 'ACM', 'S3 encryption', 'EBS encryption'], azure: ['Key Vault', 'Storage encryption', 'SQL TDE', 'App Service TLS'],
          gcp: ['Cloud KMS', 'Default encryption', 'SSL policies', 'Certificate Manager'], multi: ['Encryption key management'],
        },
      },
      {
        id: 'SOC2-CC7.2',
        title: 'System Monitoring',
        description: 'Monitor system components and detect anomalies, security events, and vulnerabilities.',
        cloudMapping: {
          aws: ['CloudWatch', 'GuardDuty', 'SecurityHub', 'Config'], azure: ['Monitor', 'Sentinel', 'Defender for Cloud', 'Policy'],
          gcp: ['Cloud Monitoring', 'Security Command Center', 'Chronicle', 'Recommender'], multi: ['SIEM integration', 'Alert correlation'],
        },
      },
    ],
  })

  // ── PCI DSS ──
  frameworks.push({
    name: 'PCI-DSS',
    version: '4.0',
    controls: [
      {
        id: 'PCI-1.2',
        title: 'Network Security Controls',
        description: 'Configure network security controls (firewalls, security groups) to restrict traffic to cardholder data environments.',
        cloudMapping: {
          aws: ['Security Groups', 'NACLs', 'VPC peering restrictions'], azure: ['NSGs', 'Azure Firewall', 'Private Link'],
          gcp: ['VPC Firewall', 'Shared VPC', 'VPC Service Controls'], multi: ['CDE network segmentation'],
        },
      },
      {
        id: 'PCI-3.4',
        title: 'Render PAN Unreadable',
        description: 'Render Primary Account Numbers unreadable anywhere it is stored using strong cryptography.',
        cloudMapping: {
          aws: ['KMS encryption', 'DynamoDB encryption', 'RDS encryption'], azure: ['Always Encrypted', 'TDE', 'Key Vault'],
          gcp: ['Cloud KMS', 'BigQuery encryption', 'Cloud SQL encryption'], multi: ['Tokenization services', 'Format-preserving encryption'],
        },
      },
      {
        id: 'PCI-7.1',
        title: 'Restrict Access to System Components',
        description: 'Limit access to system components and cardholder data to only those individuals whose job requires access.',
        cloudMapping: {
          aws: ['IAM policies', 'Resource-based policies', 'VPC endpoints'], azure: ['Azure RBAC', 'PIM', 'Managed identities'],
          gcp: ['IAM bindings', 'VPC Service Controls', 'Access Context Manager'], multi: ['Access control matrices'],
        },
      },
      {
        id: 'PCI-8.3',
        title: 'Strong Authentication',
        description: 'Secure all individual access to system components with strong authentication factors.',
        cloudMapping: {
          aws: ['IAM MFA', 'AWS SSO', 'Federation'], azure: ['Azure MFA', 'Conditional Access', 'Passwordless'],
          gcp: ['2-Step Verification', 'BeyondCorp', 'Identity-Aware Proxy'], multi: ['Multi-factor authentication strategy'],
        },
      },
      {
        id: 'PCI-10.1',
        title: 'Audit Trail for System Components',
        description: 'Implement audit trails to link all access to system components to each individual user.',
        cloudMapping: {
          aws: ['CloudTrail', 'CloudWatch Logs', 'S3 access logging'], azure: ['Activity Log', 'Diagnostic Logs', 'Azure Monitor'],
          gcp: ['Cloud Audit Logs', 'Access Transparency', 'Cloud Logging'], multi: ['Centralized audit logging'],
        },
      },
    ],
  })

  // ── HIPAA ──
  frameworks.push({
    name: 'HIPAA',
    version: '2013',
    controls: [
      {
        id: 'HIPAA-164.312(a)(1)',
        title: 'Access Control',
        description: 'Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons.',
        cloudMapping: {
          aws: ['IAM policies', 'S3 bucket policies', 'KMS key policies'], azure: ['Azure RBAC', 'Managed identities', 'Key Vault access policies'],
          gcp: ['IAM policies', 'VPC Service Controls', 'Organization policies'], multi: ['PHI access governance'],
        },
      },
      {
        id: 'HIPAA-164.312(a)(2)(iv)',
        title: 'Encryption and Decryption',
        description: 'Implement a mechanism to encrypt and decrypt electronic protected health information.',
        cloudMapping: {
          aws: ['KMS CMK', 'S3 SSE', 'EBS encryption', 'RDS encryption'], azure: ['Key Vault CMK', 'Storage SSE', 'Disk encryption', 'SQL TDE'],
          gcp: ['Cloud KMS CMEK', 'Default encryption', 'Cloud SQL encryption'], multi: ['ePHI encryption inventory'],
        },
      },
      {
        id: 'HIPAA-164.312(b)',
        title: 'Audit Controls',
        description: 'Implement hardware, software, and procedural mechanisms that record and examine activity in systems containing ePHI.',
        cloudMapping: {
          aws: ['CloudTrail', 'CloudWatch', 'Config', 'GuardDuty'], azure: ['Activity Log', 'Monitor', 'Sentinel', 'Defender'],
          gcp: ['Cloud Audit Logs', 'Cloud Monitoring', 'Security Command Center'], multi: ['ePHI access auditing'],
        },
      },
      {
        id: 'HIPAA-164.312(d)',
        title: 'Person or Entity Authentication',
        description: 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.',
        cloudMapping: {
          aws: ['IAM MFA', 'AWS SSO', 'Cognito'], azure: ['Azure MFA', 'Conditional Access', 'Azure AD B2C'],
          gcp: ['2-Step Verification', 'Identity Platform', 'BeyondCorp'], multi: ['Identity verification procedures'],
        },
      },
      {
        id: 'HIPAA-164.312(e)(1)',
        title: 'Transmission Security',
        description: 'Implement technical security measures to guard against unauthorized access to ePHI transmitted over an electronic network.',
        cloudMapping: {
          aws: ['ACM TLS', 'VPN', 'PrivateLink', 'CloudFront HTTPS'], azure: ['App Gateway TLS', 'VPN Gateway', 'Private Link', 'Front Door HTTPS'],
          gcp: ['SSL policies', 'Cloud VPN', 'Private Google Access', 'HTTPS LB'], multi: ['TLS enforcement', 'VPN architecture'],
        },
      },
    ],
  })

  // ── NIST 800-53 ──
  frameworks.push({
    name: 'NIST-800-53',
    version: 'Rev 5',
    controls: [
      {
        id: 'NIST-AC-2',
        title: 'Account Management',
        description: 'Define, create, enable, modify, disable, and remove accounts in accordance with organizational policy.',
        cloudMapping: {
          aws: ['IAM users/roles', 'AWS SSO', 'Organizations'], azure: ['Azure AD users', 'PIM', 'Access Reviews'],
          gcp: ['Cloud Identity', 'IAM', 'Groups'], multi: ['Account lifecycle management'],
        },
      },
      {
        id: 'NIST-AC-3',
        title: 'Access Enforcement',
        description: 'Enforce approved authorizations for logical access to information and system resources.',
        cloudMapping: {
          aws: ['IAM policies', 'Resource policies', 'SCPs', 'Permission boundaries'], azure: ['RBAC', 'Azure Policy', 'Conditional Access'],
          gcp: ['IAM bindings', 'Organization policies', 'VPC Service Controls'], multi: ['Policy enforcement points'],
        },
      },
      {
        id: 'NIST-AC-4',
        title: 'Information Flow Enforcement',
        description: 'Enforce approved authorizations for controlling the flow of information within the system and between systems.',
        cloudMapping: {
          aws: ['Security Groups', 'NACLs', 'VPC endpoints', 'Transit Gateway'], azure: ['NSGs', 'Azure Firewall', 'Private Link', 'Virtual WAN'],
          gcp: ['VPC Firewall', 'Shared VPC', 'VPC peering', 'Cloud Interconnect'], multi: ['Network flow controls'],
        },
      },
      {
        id: 'NIST-AC-6',
        title: 'Least Privilege',
        description: 'Employ the principle of least privilege, allowing only authorized accesses necessary to accomplish assigned tasks.',
        cloudMapping: {
          aws: ['IAM Access Analyzer', 'Permission boundaries', 'SCPs'], azure: ['PIM', 'Just-In-Time access', 'Managed identities'],
          gcp: ['IAM Recommender', 'Workload Identity', 'Organization policies'], multi: ['Privilege minimization review'],
        },
      },
      {
        id: 'NIST-AU-2',
        title: 'Event Logging',
        description: 'Identify the types of events that the system is capable of logging in support of the audit function.',
        cloudMapping: {
          aws: ['CloudTrail events', 'CloudWatch Logs', 'VPC Flow Logs'], azure: ['Activity Log categories', 'Diagnostic settings', 'NSG Flow Logs'],
          gcp: ['Audit log types', 'Data Access logs', 'VPC Flow Logs'], multi: ['Audit event catalog'],
        },
      },
    ],
  })

  // ── ISO 27001 ──
  frameworks.push({
    name: 'ISO-27001',
    version: '2022',
    controls: [
      {
        id: 'ISO-A.5.15',
        title: 'Access Control',
        description: 'Rules to control physical and logical access to information and other associated assets shall be established.',
        cloudMapping: {
          aws: ['IAM', 'Organizations', 'Resource-based policies'], azure: ['Azure AD', 'RBAC', 'Conditional Access'],
          gcp: ['Cloud IAM', 'Organization policies', 'BeyondCorp'], multi: ['Access control policy framework'],
        },
      },
      {
        id: 'ISO-A.5.23',
        title: 'Information Security for Use of Cloud Services',
        description: 'Processes for acquisition, use, management and exit from cloud services shall be established.',
        cloudMapping: {
          aws: ['Well-Architected Framework', 'Trusted Advisor', 'Config'], azure: ['Cloud Adoption Framework', 'Advisor', 'Policy'],
          gcp: ['Architecture Framework', 'Recommender', 'Organization Policy'], multi: ['Cloud governance framework'],
        },
      },
      {
        id: 'ISO-A.8.9',
        title: 'Configuration Management',
        description: 'Configurations of hardware, software, services and networks shall be established, documented, implemented and monitored.',
        cloudMapping: {
          aws: ['AWS Config', 'Systems Manager', 'CloudFormation drift detection'], azure: ['Azure Policy', 'Automation', 'ARM template validation'],
          gcp: ['Security Health Analytics', 'Asset Inventory', 'Policy Intelligence'], multi: ['Configuration baseline enforcement'],
        },
      },
      {
        id: 'ISO-A.8.15',
        title: 'Logging',
        description: 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analyzed.',
        cloudMapping: {
          aws: ['CloudTrail', 'CloudWatch Logs', 'S3 access logs'], azure: ['Activity Log', 'Diagnostic settings', 'Log Analytics'],
          gcp: ['Cloud Logging', 'Cloud Audit Logs', 'Log Router'], multi: ['Centralized log management'],
        },
      },
      {
        id: 'ISO-A.8.24',
        title: 'Use of Cryptography',
        description: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
        cloudMapping: {
          aws: ['KMS', 'CloudHSM', 'ACM', 'S3 encryption'], azure: ['Key Vault', 'Managed HSM', 'Storage encryption'],
          gcp: ['Cloud KMS', 'Cloud HSM', 'Certificate Authority Service'], multi: ['Cryptographic controls inventory'],
        },
      },
    ],
  })

  return frameworks
}

// ── Cloud Security Analyzer Class ────────────────────────────────

export class CloudSecurityAnalyzer {
  // ── Private readonly databases ────────────────────────────────
  private readonly config: CloudSecurityConfig
  private readonly awsMisconfigs: CloudMisconfiguration[]
  private readonly azureMisconfigs: CloudMisconfiguration[]
  private readonly gcpMisconfigs: CloudMisconfiguration[]
  private readonly kubernetesIssues: KubernetesSecurityIssue[]
  private readonly containerFindings: ContainerSecurityFinding[]
  private readonly serverlessRisks: ServerlessRisk[]
  private readonly iamRiskPatterns: IAMRiskPattern[]
  private readonly complianceFrameworks: ComplianceFramework[]

  // ── Private mutable stats ─────────────────────────────────────
  private totalScans = 0
  private totalMisconfigurationsFound = 0
  private totalIAMAnalyses = 0
  private totalKubernetesScans = 0
  private totalContainerScans = 0
  private totalServerlessAnalyses = 0
  private totalComplianceChecks = 0
  private totalAssessments = 0
  private feedbackCount = 0
  private feedbackScores: number[] = []

  // ── Constructor ───────────────────────────────────────────────

  constructor(config?: Partial<CloudSecurityConfig>) {
    this.config = { ...DEFAULT_CLOUD_SECURITY_CONFIG, ...config }
    this.awsMisconfigs = buildAWSMisconfigurations()
    this.azureMisconfigs = buildAzureMisconfigurations()
    this.gcpMisconfigs = buildGCPMisconfigurations()
    this.kubernetesIssues = buildKubernetesIssues()
    this.containerFindings = buildContainerFindings()
    this.serverlessRisks = buildServerlessRisks()
    this.iamRiskPatterns = buildIAMRiskPatterns()
    this.complianceFrameworks = buildComplianceFrameworks()
  }

  // ── Misconfiguration Scanning ─────────────────────────────────

  /**
   * Scan cloud configuration for known misconfigurations.
   * Parses the config string for keywords and returns matching issues.
   */
  scanMisconfigurations(provider: CloudProvider, config: string): CloudMisconfiguration[] {
    this.totalScans++
    const tokens = tokenize(config)
    let misconfigs: CloudMisconfiguration[] = []

    if (provider === 'aws' || provider === 'multi') {
      misconfigs = misconfigs.concat(this.matchMisconfigurations(this.awsMisconfigs, tokens))
    }
    if (provider === 'azure' || provider === 'multi') {
      misconfigs = misconfigs.concat(this.matchMisconfigurations(this.azureMisconfigs, tokens))
    }
    if (provider === 'gcp' || provider === 'multi') {
      misconfigs = misconfigs.concat(this.matchMisconfigurations(this.gcpMisconfigs, tokens))
    }

    // If no token matches but provider specified, return all for that provider
    if (misconfigs.length === 0 && provider !== 'multi') {
      misconfigs = this.getMisconfigsForProvider(provider)
    }

    misconfigs = misconfigs.filter(m => severityAtOrAbove(m.severity, this.config.severityThreshold))
    misconfigs.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity])

    const results = misconfigs.slice(0, this.config.maxResults)
    this.totalMisconfigurationsFound += results.length
    return results
  }

  /** Analyze an IAM policy JSON string for security risks. */
  analyzeIAMPolicy(policyJson: string): IAMPolicyAnalysis {
    this.totalIAMAnalyses++
    const lower = policyJson.toLowerCase()
    const wildcardActions: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // Detect wildcard actions
    for (const pattern of this.iamRiskPatterns) {
      if (policyJson.includes(pattern.pattern)) {
        if (pattern.pattern === '*' && policyJson.includes('"Action": "*"')) {
          wildcardActions.push('*')
          riskScore += 3
          recommendations.push(pattern.recommendation)
        } else if (pattern.pattern === ':*') {
          const re = /"([a-z0-9]+):\*"/gi
          let m: RegExpExecArray | null
          while ((m = re.exec(policyJson)) !== null) wildcardActions.push(`${m[1]}:*`)
          if (wildcardActions.length > 0) { riskScore += 2; recommendations.push(pattern.recommendation) }
        }
      }
    }

    const crossAccountAccess = policyJson.includes('arn:aws:iam::') && !policyJson.includes('"Effect": "Deny"')
    if (crossAccountAccess) { riskScore += 2; recommendations.push('Review cross-account trust. Add ExternalId conditions.') }

    const noMFA = !lower.includes('multifactorauthpresent') && !lower.includes('mfa')
    if (noMFA) { riskScore += 1; recommendations.push('Add MFA condition for sensitive operations.') }

    if (!lower.includes('"condition"')) {
      riskScore += 1; recommendations.push('Add IAM policy conditions (IP, MFA, time) to restrict permission usage.')
    }
    if (policyJson.includes('"Resource": "*"') || policyJson.includes('"Resource":"*"')) {
      riskScore += 2; recommendations.push('Replace Resource: "*" with specific ARNs.')
    }
    if (policyJson.includes('AdministratorAccess') || policyJson.includes('"Action": "*"')) {
      riskScore += 3; recommendations.push('Remove AdministratorAccess. Create least-privilege policies.')
    }
    if (lower.includes('"notaction"')) {
      riskScore += 1; recommendations.push('Review NotAction — it grants all actions EXCEPT listed ones.')
    }

    const overprivileged = riskScore >= 4 || wildcardActions.length > 0

    if (recommendations.length === 0) {
      recommendations.push('Policy appears to follow least-privilege principles. Continue regular reviews with IAM Access Analyzer.')
    }

    return {
      overprivileged,
      wildcardActions,
      crossAccountAccess,
      noMFA,
      recommendations,
      riskScore: clamp(round2(riskScore), 0, 10),
    }
  }

  // ── Kubernetes Scanning ───────────────────────────────────────

  /** Scan a Kubernetes manifest for security issues. */
  scanKubernetes(manifest: string): KubernetesSecurityIssue[] {
    this.totalKubernetesScans++
    if (!this.config.enableKubernetesScanning) return []

    const lower = manifest.toLowerCase()
    const tokens = tokenize(manifest)
    const found: KubernetesSecurityIssue[] = []
    const findAndPush = (id: string) => {
      const issue = this.kubernetesIssues.find(i => i.id === id)
      if (issue) found.push(issue)
    }

    if (lower.includes('privileged: true') || lower.includes('privileged:true')) findAndPush('K8S-POD-001')
    if (lower.includes('hostnetwork: true') || lower.includes('hostnetwork:true')) findAndPush('K8S-NET-001')
    if (!lower.includes('securitycontext')) findAndPush('K8S-SEC-001')
    if (lower.includes('cluster-admin')) findAndPush('K8S-RBAC-001')

    if ((lower.includes('kind: deployment') || lower.includes('kind: namespace')) &&
        !lower.includes('kind: networkpolicy') && !lower.includes('networkpolicy')) {
      findAndPush('K8S-NET-002')
    }

    if (lower.includes('tiller') || lower.includes('helm2')) findAndPush('K8S-HELM-001')
    if (lower.includes('secretkeyref') && lower.includes('env:')) findAndPush('K8S-SEC-002')
    if (!lower.includes('resources:') || (!lower.includes('limits:') && !lower.includes('requests:'))) findAndPush('K8S-RES-001')
    if (!lower.includes('podsecuritypolicy') && !lower.includes('pod-security.kubernetes.io')) findAndPush('K8S-PSP-001')
    if (lower.includes('/var/run/docker.sock') || lower.includes('docker.sock')) findAndPush('K8S-MOUNT-001')

    // Fallback: keyword matching for remaining issues
    if (found.length === 0) {
      for (const issue of this.kubernetesIssues) {
        const keywords = tokenize(issue.description)
        if (matchScore(tokens, keywords) > 3) {
          found.push(issue)
        }
      }
    }

    found.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity])
    return found.slice(0, this.config.maxResults)
  }

  // ── Container Scanning ────────────────────────────────────────

  /** Scan a Dockerfile for container security issues. */
  scanContainer(dockerfile: string): ContainerSecurityFinding {
    this.totalContainerScans++

    if (!this.config.enableContainerScanning) {
      return {
        id: generateId('CTR'),
        severity: 'info',
        imageVulnerabilities: 0,
        runAsRoot: false,
        capabilities: [],
        readOnlyRootfs: true,
        recommendations: ['Container scanning is disabled in configuration.'],
      }
    }

    const lower = dockerfile.toLowerCase()
    const recommendations: string[] = []
    let vulnCount = 0
    let overallSeverity: Severity = 'info'
    const capabilities: string[] = []

    if (lower.includes('from ') && (lower.includes(':latest') || !lower.includes(':'))) {
      vulnCount++
      recommendations.push('Use specific image tags instead of :latest. Pin by SHA256 digest for reproducibility.')
      overallSeverity = this.raiseSeverity(overallSeverity, 'high')
    }

    const runAsRoot = !lower.includes('user ') || lower.includes('user root')
    if (runAsRoot) {
      vulnCount++
      recommendations.push('Add USER directive to run as non-root: RUN adduser -D appuser && USER appuser.')
      overallSeverity = this.raiseSeverity(overallSeverity, 'critical')
    }

    if (lower.includes('env ') && (lower.includes('password') || lower.includes('secret') ||
        lower.includes('api_key') || lower.includes('token') || lower.includes('credential'))) {
      vulnCount++
      recommendations.push('Never embed secrets in Dockerfile. Use BuildKit --secret flag or runtime injection.')
      overallSeverity = this.raiseSeverity(overallSeverity, 'critical')
    }

    if (lower.includes('cap_add') || lower.includes('--cap-add')) {
      const capRegex = /cap[_-]add[=\s]+([A-Z_]+)/gi
      let match: RegExpExecArray | null
      while ((match = capRegex.exec(dockerfile)) !== null) capabilities.push(match[1])
      if (capabilities.length > 0) {
        vulnCount++
        recommendations.push('Review added capabilities. Drop ALL and add only required ones.')
        overallSeverity = this.raiseSeverity(overallSeverity, 'high')
      }
    }
    if (lower.includes('sys_admin') || lower.includes('net_admin')) {
      if (!capabilities.includes('SYS_ADMIN')) capabilities.push('SYS_ADMIN')
      if (!capabilities.includes('NET_ADMIN')) capabilities.push('NET_ADMIN')
      recommendations.push('SYS_ADMIN and NET_ADMIN capabilities grant near-root-level access.')
      overallSeverity = this.raiseSeverity(overallSeverity, 'high')
    }

    if (!lower.includes('healthcheck')) {
      recommendations.push('Add HEALTHCHECK instruction for container health monitoring.')
      overallSeverity = this.raiseSeverity(overallSeverity, 'medium')
    }
    if (lower.includes('add ') && !lower.includes('add --from')) {
      recommendations.push('Prefer COPY over ADD unless extracting archives.')
      overallSeverity = this.raiseSeverity(overallSeverity, 'low')
    }
    if (lower.includes('apt-get install') && !lower.includes('--no-install-recommends')) {
      recommendations.push('Use --no-install-recommends with apt-get to minimize attack surface.')
    }
    if ((lower.match(/from\s/g) || []).length < 2 && (lower.includes('build') || lower.includes('compile'))) {
      recommendations.push('Consider multi-stage builds to separate build from runtime dependencies.')
    }

    const readOnlyRootfs = !lower.includes('chmod') && !lower.includes('mkdir')
    if (recommendations.length === 0) {
      recommendations.push('Dockerfile follows security best practices. Continue periodic reviews.')
    }

    return {
      id: generateId('CTR'),
      severity: overallSeverity,
      imageVulnerabilities: vulnCount,
      runAsRoot,
      capabilities,
      readOnlyRootfs,
      recommendations,
    }
  }

  // ── Serverless Analysis ───────────────────────────────────────

  /** Analyze serverless function configuration for security risks. */
  analyzeServerless(config: string, provider: CloudProvider): ServerlessRisk {
    this.totalServerlessAnalyses++
    if (!this.config.enableServerlessAnalysis) {
      return { id: generateId('SLS'), provider, functionName: 'unknown', runtime: 'unknown',
        risks: ['Serverless analysis is disabled.'], eventSourceRisks: [],
        recommendations: ['Enable serverless analysis in configuration.'], riskScore: 0 }
    }

    const lower = config.toLowerCase()
    const risks: string[] = []
    const eventSourceRisks: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    const nameMatch = config.match(/(?:function[_\-\s]*name|FunctionName)["\s:=]+["']?([a-zA-Z0-9_-]+)/i)
    const functionName = nameMatch ? nameMatch[1] : 'unknown'
    const runtimeMatch = config.match(/(?:runtime|Runtime)["\s:=]+["']?([a-zA-Z0-9._-]+)/i)
    const runtime = runtimeMatch ? runtimeMatch[1] : 'unknown'

    if (lower.includes('administratoraccess') || lower.includes('"action": "*"') ||
        lower.includes("'action': '*'") || lower.includes('action: "*"')) {
      risks.push('Function has overly permissive execution role with wildcard or admin access.')
      riskScore += 3
      recommendations.push('Apply least-privilege permissions. Use per-function IAM roles with specific resources.')
    }

    if ((lower.includes('environment') || lower.includes('variables')) &&
        (lower.includes('password') || lower.includes('secret') ||
         lower.includes('api_key') || lower.includes('token') || lower.includes('credential'))) {
      risks.push('Secrets appear to be stored in plaintext environment variables.')
      riskScore += 2.5
      recommendations.push('Use a secrets manager instead of environment variables.')
    }

    if (lower.includes('timeout') && (lower.includes('900') || lower.includes('600') || lower.includes('max'))) {
      risks.push('Function timeout is set to maximum or very high value.')
      riskScore += 1.5
      recommendations.push('Set timeout to minimum required. Use Step Functions for long-running workflows.')
    }

    if ((lower.includes('api') || lower.includes('http') || lower.includes('gateway')) &&
        !lower.includes('authoriz') && !lower.includes('cognito') && !lower.includes('iam') &&
        !lower.includes('auth')) {
      risks.push('API endpoint has no authentication mechanism configured.')
      eventSourceRisks.push('Public API without authentication allows unrestricted invocation.')
      riskScore += 2.5
      recommendations.push('Implement authentication using IAM, Cognito, or a custom authorizer.')
    }

    if (!lower.includes('deadletter') && !lower.includes('dlq') && !lower.includes('dead_letter') &&
        !lower.includes('destination')) {
      risks.push('No Dead Letter Queue configured for failed async invocations.')
      riskScore += 1.5
      recommendations.push('Configure DLQ for async functions. Set up Lambda Destinations for failure routing.')
    }

    if (!lower.includes('concurrency') && !lower.includes('reserved')) {
      risks.push('No concurrency limits set, allowing potential resource exhaustion.')
      riskScore += 1
      recommendations.push('Set reserved concurrency limits to prevent runaway invocations.')
    }

    if (!lower.includes('vpc') && !lower.includes('subnet') && !lower.includes('securitygroup')) {
      eventSourceRisks.push('Function not in VPC — lacks network isolation for private resources.')
      recommendations.push('Deploy functions in VPC when accessing private resources.')
    }

    if (!lower.includes('tracing') && !lower.includes('xray') && !lower.includes('opentelemetry')) {
      recommendations.push('Enable distributed tracing (X-Ray, OpenTelemetry) for observability.')
    }

    if (risks.length === 0) risks.push('No major serverless risks detected.')
    if (recommendations.length === 0) recommendations.push('Serverless configuration follows best practices.')

    return { id: generateId('SLS'), provider, functionName, runtime,
      risks, eventSourceRisks, recommendations, riskScore: clamp(round2(riskScore), 0, 10) }
  }

  // ── Compliance Checking ───────────────────────────────────────

  /** Check compliance controls for a given provider and framework. */
  checkCompliance(provider: CloudProvider, framework: string): ComplianceControl[] {
    this.totalComplianceChecks++

    if (!this.config.enableComplianceChecks) return []

    const fw = this.complianceFrameworks.find(
      f => f.name.toLowerCase() === framework.toLowerCase() ||
           f.name.toLowerCase().replace(/-/g, '') === framework.toLowerCase().replace(/-/g, ''),
    )

    if (!fw) return []

    // Filter controls that have mappings for the specified provider
    if (provider === 'multi') {
      return fw.controls.slice(0, this.config.maxResults)
    }

    const relevant = fw.controls.filter(c => {
      const mapping = c.cloudMapping[provider]
      return mapping && mapping.length > 0
    })

    return relevant.slice(0, this.config.maxResults)
  }

  // ── Full Assessment ───────────────────────────────────────────

  /** Perform a comprehensive cloud security assessment combining all analyses. */
  assessCloudSecurity(provider: CloudProvider, config: string): CloudSecurityAssessment {
    this.totalAssessments++

    // Run all sub-analyses
    const misconfigurations = this.scanMisconfigurations(provider, config)
    const iamIssues = this.analyzeIAMPolicy(config)
    const kubernetesIssues = this.scanKubernetes(config)
    const containerIssues: ContainerSecurityFinding[] = []
    const serverlessRisks: ServerlessRisk[] = []
    const recommendations: string[] = []

    const lowerConfig = config.toLowerCase()

    // Run container scan if Dockerfile content detected
    if (lowerConfig.includes('from ') || lowerConfig.includes('dockerfile')) {
      containerIssues.push(this.scanContainer(config))
    }
    // Run serverless scan if serverless config detected
    if (lowerConfig.includes('lambda') || lowerConfig.includes('function') ||
        lowerConfig.includes('serverless')) {
      serverlessRisks.push(this.analyzeServerless(config, provider))
    }

    // Calculate compliance status across all frameworks
    const complianceStatus: Record<string, number> = {}
    for (const fw of this.complianceFrameworks) {
      this.checkCompliance(provider, fw.name) // trigger compliance stats
      const total = fw.controls.length
      // Score based on number of controls checked vs total misconfigs found
      const penalty = misconfigurations.length * 2
      const score = Math.max(0, 100 - (penalty / total) * 100)
      complianceStatus[fw.name] = round2(clamp(score, 0, 100))
    }

    // Aggregate recommendations
    const criticalMisconfigs = misconfigurations.filter(m => m.severity === 'critical')
    const highMisconfigs = misconfigurations.filter(m => m.severity === 'high')

    if (criticalMisconfigs.length > 0) {
      recommendations.push(`Address ${criticalMisconfigs.length} critical misconfiguration(s) immediately.`)
      for (const m of criticalMisconfigs.slice(0, 3)) {
        recommendations.push(`[CRITICAL] ${m.title}: ${m.remediation}`)
      }
    }

    if (highMisconfigs.length > 0) {
      recommendations.push(`Remediate ${highMisconfigs.length} high severity misconfiguration(s) within 7 days.`)
    }

    if (iamIssues.overprivileged) {
      recommendations.push('IAM policies are overly permissive. Implement least-privilege access controls.')
      for (const rec of iamIssues.recommendations.slice(0, 3)) {
        recommendations.push(`[IAM] ${rec}`)
      }
    }

    if (kubernetesIssues.length > 0) {
      recommendations.push(`Found ${kubernetesIssues.length} Kubernetes security issue(s). Review pod security and RBAC configuration.`)
    }

    if (containerIssues.length > 0 && containerIssues[0].runAsRoot) {
      recommendations.push('Container images running as root detected. Switch to non-root users.')
    }

    if (serverlessRisks.length > 0 && serverlessRisks[0].riskScore > 5) {
      recommendations.push('High-risk serverless configuration detected. Review permissions and authentication.')
    }

    if (recommendations.length === 0) {
      recommendations.push('Cloud security posture appears healthy. Continue regular assessments.')
    }

    // Calculate overall score (100 = perfect, lower = worse)
    let score = 100
    score -= criticalMisconfigs.length * 15
    score -= highMisconfigs.length * 8
    score -= misconfigurations.filter(m => m.severity === 'medium').length * 4
    score -= misconfigurations.filter(m => m.severity === 'low').length * 2
    score -= iamIssues.riskScore * 3
    score -= kubernetesIssues.filter(k => k.severity === 'critical').length * 10
    score -= kubernetesIssues.filter(k => k.severity === 'high').length * 5
    for (const c of containerIssues) {
      if (c.runAsRoot) score -= 10
      score -= c.imageVulnerabilities * 3
    }
    for (const s of serverlessRisks) {
      score -= s.riskScore * 2
    }

    return {
      provider,
      score: clamp(round2(score), 0, 100),
      misconfigurations,
      iamIssues,
      kubernetesIssues,
      containerIssues,
      serverlessRisks,
      complianceStatus,
      recommendations,
    }
  }

  // ── Common Misconfigurations ──────────────────────────────────

  /** Get all built-in misconfigurations for a given cloud provider. */
  getCommonMisconfigurations(provider: CloudProvider): CloudMisconfiguration[] {
    this.totalScans++
    const misconfigs = this.getMisconfigsForProvider(provider)
    misconfigs.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity])
    this.totalMisconfigurationsFound += misconfigs.length
    return misconfigs.slice(0, this.config.maxResults)
  }

  // ── Compliance Frameworks ─────────────────────────────────────

  /** Get the names of all available compliance frameworks. */
  getComplianceFrameworks(): string[] {
    return this.complianceFrameworks.map(f => `${f.name} (${f.version})`)
  }

  // ── Stats ─────────────────────────────────────────────────────

  /** Get current statistics for this analyzer instance. */
  getStats(): Readonly<CloudSecurityStats> {
    const avgScore = this.feedbackScores.length > 0
      ? this.feedbackScores.reduce((s, v) => s + v, 0) / this.feedbackScores.length
      : 0

    return {
      totalScans: this.totalScans,
      totalMisconfigurationsFound: this.totalMisconfigurationsFound,
      totalIAMAnalyses: this.totalIAMAnalyses,
      totalKubernetesScans: this.totalKubernetesScans,
      totalContainerScans: this.totalContainerScans,
      totalServerlessAnalyses: this.totalServerlessAnalyses,
      totalComplianceChecks: this.totalComplianceChecks,
      totalAssessments: this.totalAssessments,
      feedbackCount: this.feedbackCount,
      avgFeedbackScore: round2(avgScore),
    }
  }

  // ── Feedback ──────────────────────────────────────────────────

  /**
   * Provide feedback on analysis quality. Score from 1-5.
   */
  provideFeedback(score: number): void {
    this.feedbackCount++
    const s = clamp(score, 1, 5)
    this.feedbackScores.push(s)

    // Adaptive configuration based on feedback
    if (s <= 2) {
      this.config.maxResults = Math.min(this.config.maxResults + 10, 100)
    } else if (s >= 5) {
      this.config.maxResults = Math.max(this.config.maxResults - 5, 10)
    }
  }

  // ── Serialization ─────────────────────────────────────────────

  /**
   * Serialize the analyzer state to a JSON string for persistence.
   */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalScans: this.totalScans,
      totalMisconfigurationsFound: this.totalMisconfigurationsFound,
      totalIAMAnalyses: this.totalIAMAnalyses,
      totalKubernetesScans: this.totalKubernetesScans,
      totalContainerScans: this.totalContainerScans,
      totalServerlessAnalyses: this.totalServerlessAnalyses,
      totalComplianceChecks: this.totalComplianceChecks,
      totalAssessments: this.totalAssessments,
      feedbackCount: this.feedbackCount,
      feedbackScores: this.feedbackScores,
    })
  }

  /**
   * Restore an analyzer instance from a serialized JSON string.
   */
  static deserialize(json: string): CloudSecurityAnalyzer {
    const data = JSON.parse(json) as {
      config: CloudSecurityConfig
      totalScans: number
      totalMisconfigurationsFound: number
      totalIAMAnalyses: number
      totalKubernetesScans: number
      totalContainerScans: number
      totalServerlessAnalyses: number
      totalComplianceChecks: number
      totalAssessments: number
      feedbackCount: number
      feedbackScores: number[]
    }

    const instance = new CloudSecurityAnalyzer(data.config)
    instance.totalScans = data.totalScans ?? 0
    instance.totalMisconfigurationsFound = data.totalMisconfigurationsFound ?? 0
    instance.totalIAMAnalyses = data.totalIAMAnalyses ?? 0
    instance.totalKubernetesScans = data.totalKubernetesScans ?? 0
    instance.totalContainerScans = data.totalContainerScans ?? 0
    instance.totalServerlessAnalyses = data.totalServerlessAnalyses ?? 0
    instance.totalComplianceChecks = data.totalComplianceChecks ?? 0
    instance.totalAssessments = data.totalAssessments ?? 0
    instance.feedbackCount = data.feedbackCount ?? 0
    instance.feedbackScores = data.feedbackScores ?? []
    return instance
  }

  // ── Private Helpers ───────────────────────────────────────────

  /**
   * Get all misconfigurations for a given provider (or all for multi).
   */
  private getMisconfigsForProvider(provider: CloudProvider): CloudMisconfiguration[] {
    switch (provider) {
      case 'aws': return [...this.awsMisconfigs]
      case 'azure': return [...this.azureMisconfigs]
      case 'gcp': return [...this.gcpMisconfigs]
      case 'multi': return [...this.awsMisconfigs, ...this.azureMisconfigs, ...this.gcpMisconfigs]
    }
  }

  /**
   * Match misconfigurations against tokenized config input.
   * Returns items with positive match scores based on keyword overlap.
   */
  private matchMisconfigurations(misconfigs: CloudMisconfiguration[], tokens: string[]): CloudMisconfiguration[] {
    const matches: Array<{ item: CloudMisconfiguration; score: number }> = []

    for (const m of misconfigs) {
      const keywords = [
        ...tokenize(m.service),
        ...tokenize(m.title),
        ...tokenize(m.description),
      ]
      const score = matchScore(tokens, keywords)
      if (score > 2) {
        matches.push({ item: m, score })
      }
    }

    matches.sort((a, b) => b.score - a.score)
    return matches.map(m => m.item)
  }

  /**
   * Return the higher of two severity levels.
   */
  private raiseSeverity(current: Severity, candidate: Severity): Severity {
    return SEVERITY_ORDER[candidate] > SEVERITY_ORDER[current] ? candidate : current
  }
}
